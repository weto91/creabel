// Emparejamiento por QR (solo escritorio): un servidor HTTP pequeño que comparte con los
// dispositivos emparejados la carpeta `hub` de los datos de la aplicación. Habla el mismo
// subconjunto de WebDAV que usa Creabel para sincronizar (PROPFIND, GET, PUT, MKCOL, DELETE),
// así que el móvil se sincroniza con el PC igual que con un servidor WebDAV.
//
// Seguridad: cada petición debe llevar el código del emparejamiento (Authorization: Bearer);
// las rutas solo admiten letras, números, punto, guion y guion bajo (nada de «..»), y no se
// sirve nada fuera de la carpeta `hub`. El servidor solo está abierto mientras el usuario lo
// tenga activado en Ajustes → Sincronización.
//
// Descubrimiento: el router puede dar al PC otra dirección (DHCP) y entonces la que guardó el
// móvil al emparejarse deja de valer. Por eso, mientras comparte, el PC también escucha en UDP
// (mismo número de puerto) la pregunta «¿dónde estás?» que el móvil lanza a toda la red, y
// contesta solo si trae la huella de su código (MD5 de «creabel:<código>», calculada en la
// interfaz): el código en sí nunca viaja por difusión. El móvil toma la dirección de quien
// contesta y la guarda. Mensajes: «CREABEL?1 <huella>» y «CREABEL!1 <huella> <puerto>».
use std::fs;
use std::net::{SocketAddr, TcpStream, UdpSocket};
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex, RwLock};
use std::thread::{self, JoinHandle};
use std::time::Duration;

use tauri::{AppHandle, Manager, State};
use tiny_http::{Header, Request, Response, Server};

/// El servidor abierto: en qué puerto, con qué código y los hilos que atienden.
struct Running {
    server: Arc<Server>,
    port: u16,
    token: Arc<RwLock<String>>,
    key: Arc<RwLock<String>>,
    stop: Arc<AtomicBool>,
    worker: JoinHandle<()>,
    responder: Option<JoinHandle<()>>,
}

/// Contesta a «¿dónde estás?» (ver arriba). None si no se ha podido abrir el puerto UDP: el
/// emparejamiento sigue funcionando, solo que sin encontrar al PC si cambia de dirección.
fn start_responder(port: u16, key: Arc<RwLock<String>>, stop: Arc<AtomicBool>) -> Option<JoinHandle<()>> {
    let socket = UdpSocket::bind(("0.0.0.0", port)).ok()?;
    socket.set_read_timeout(Some(Duration::from_millis(400))).ok()?;
    Some(thread::spawn(move || {
        let mut buf = [0u8; 256];
        while !stop.load(Ordering::Relaxed) {
            let (n, from) = match socket.recv_from(&mut buf) {
                Ok(r) => r,
                Err(_) => continue,
            };
            let text = String::from_utf8_lossy(&buf[..n]).to_string();
            let mut parts = text.split_whitespace();
            if parts.next() != Some("CREABEL?1") {
                continue;
            }
            let asked = parts.next().unwrap_or("");
            let mine = key.read().map(|k| k.clone()).unwrap_or_default();
            if !mine.is_empty() && asked == mine {
                let _ = socket.send_to(format!("CREABEL!1 {} {}", mine, port).as_bytes(), from);
            }
        }
    }))
}

#[derive(Default)]
pub struct HubState(Mutex<Option<Running>>);

fn hub_root(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_local_data_dir()
        .map_err(|e| e.to_string())?
        .join("hub");
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir)
}

/// Cierra el servidor y suelta el puerto.
fn shutdown(run: Running) {
    let Running { server, port, worker, stop, responder, .. } = run;
    stop.store(true, Ordering::Relaxed);
    server.unblock();
    let _ = worker.join();
    if let Some(responder) = responder {
        let _ = responder.join();
    }
    drop(server);
    // tiny_http despierta su hilo de escucha conectándose a la dirección en la que escucha, y en
    // Windows eso no funciona con 0.0.0.0: se le despierta desde aquí para que suelte el puerto.
    let _ = TcpStream::connect_timeout(&SocketAddr::from(([127, 0, 0, 1], port)), Duration::from_millis(300));
}

/// Abre la carpeta compartida. `key`: la huella del código para el descubrimiento (ver arriba).
#[tauri::command]
pub async fn hub_start(app: AppHandle, state: State<'_, HubState>, port: u16, token: String, key: Option<String>) -> Result<(), String> {
    if token.len() < 12 {
        return Err("código demasiado corto".into());
    }
    let key = key.unwrap_or_default();
    let root = hub_root(&app)?;
    let mut guard = state.0.lock().map_err(|_| "estado bloqueado".to_string())?;
    // Ya está abierta en ese puerto: solo cambia el código.
    if let Some(run) = guard.as_ref() {
        if run.port == port {
            *run.token.write().map_err(|_| "estado bloqueado".to_string())? = token;
            *run.key.write().map_err(|_| "estado bloqueado".to_string())? = key;
            return Ok(());
        }
    }
    if let Some(old) = guard.take() {
        shutdown(old);
    }
    // Si se acaba de cerrar, el sistema puede tardar un momento en soltar el puerto.
    let mut server = None;
    let mut last = String::new();
    for _ in 0..20 {
        match Server::http(("0.0.0.0", port)) {
            Ok(s) => {
                server = Some(Arc::new(s));
                break;
            }
            Err(e) => {
                last = e.to_string();
                thread::sleep(Duration::from_millis(100));
            }
        }
    }
    let server = server.ok_or(last)?;
    let token = Arc::new(RwLock::new(token));
    let (srv, tok) = (server.clone(), token.clone());
    let worker = thread::spawn(move || {
        for request in srv.incoming_requests() {
            let current = tok.read().map(|t| t.clone()).unwrap_or_default();
            handle(&root, &current, request);
        }
    });
    let key = Arc::new(RwLock::new(key));
    let stop = Arc::new(AtomicBool::new(false));
    let responder = start_responder(port, key.clone(), stop.clone());
    *guard = Some(Running { server, port, token, key, stop, worker, responder });
    Ok(())
}

#[tauri::command]
pub async fn hub_stop(state: State<'_, HubState>) -> Result<(), String> {
    let old = state.0.lock().map_err(|_| "estado bloqueado".to_string())?.take();
    if let Some(old) = old {
        shutdown(old);
    }
    Ok(())
}

#[derive(serde::Serialize)]
pub struct Address {
    ip: String,
    name: String,
}

/// Adaptadores que no llevan a otros dispositivos de la casa (máquinas virtuales, WSL, Docker…).
const VIRTUAL: [&str; 10] = [
    "vethernet", "virtualbox", "vmware", "hyper-v", "docker", "loopback", "bluetooth", "wsl", "vbox", "default switch",
];

/// Direcciones IPv4 de este equipo en sus redes de verdad, con el nombre del adaptador:
/// primero las de la red de casa (192.168…, 10…, 172.16–31…), luego las de una VPN como
/// Tailscale (100.64–127…) y al final el resto.
#[tauri::command]
pub fn hub_addresses() -> Vec<Address> {
    let mut out: Vec<Address> = Vec::new();
    if let Ok(list) = local_ip_address::list_afinet_netifas() {
        for (name, ip) in list {
            if let std::net::IpAddr::V4(v4) = ip {
                let lower = name.to_lowercase();
                if v4.is_loopback() || v4.is_link_local() || v4.is_unspecified() || VIRTUAL.iter().any(|v| lower.contains(v)) {
                    continue;
                }
                if !out.iter().any(|a| a.ip == v4.to_string()) {
                    out.push(Address { ip: v4.to_string(), name });
                }
            }
        }
    }
    let rank = |ip: &str| -> u8 {
        let o: Vec<u8> = ip.split('.').filter_map(|p| p.parse().ok()).collect();
        if o.len() != 4 {
            return 9;
        }
        if o[0] == 192 && o[1] == 168 || o[0] == 10 || o[0] == 172 && (16..=31).contains(&o[1]) {
            0
        } else if o[0] == 100 && (64..=127).contains(&o[1]) {
            1
        } else {
            2
        }
    };
    out.sort_by(|a, b| rank(&a.ip).cmp(&rank(&b.ip)).then(a.ip.cmp(&b.ip)));
    out
}

/// Un guion de PowerShell en el formato de -EncodedCommand (UTF-16 en base64): así las comillas
/// y los espacios de las rutas no se pierden por el camino.
#[cfg(windows)]
fn encode_script(script: &str) -> String {
    const B64: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let bytes: Vec<u8> = script.encode_utf16().flat_map(|u| u.to_le_bytes()).collect();
    let mut encoded = String::with_capacity(bytes.len() * 4 / 3 + 4);
    for chunk in bytes.chunks(3) {
        let n = (chunk[0] as u32) << 16 | (*chunk.get(1).unwrap_or(&0) as u32) << 8 | *chunk.get(2).unwrap_or(&0) as u32;
        encoded.push(B64[(n >> 18) as usize & 63] as char);
        encoded.push(B64[(n >> 12) as usize & 63] as char);
        encoded.push(if chunk.len() > 1 { B64[(n >> 6) as usize & 63] as char } else { '=' });
        encoded.push(if chunk.len() > 2 { B64[n as usize & 63] as char } else { '=' });
    }
    encoded
}

/// Ejecuta un guion de PowerShell sin ventana.
#[cfg(windows)]
fn powershell(script: &str) -> std::io::Result<std::process::Output> {
    use std::os::windows::process::CommandExt;
    const CREATE_NO_WINDOW: u32 = 0x0800_0000;
    let root = std::env::var("SystemRoot").unwrap_or_else(|_| "C:\\Windows".into());
    std::process::Command::new(format!("{}\\System32\\WindowsPowerShell\\v1.0\\powershell.exe", root))
        .args(["-NoProfile", "-NonInteractive", "-EncodedCommand", &encode_script(script)])
        .creation_flags(CREATE_NO_WINDOW)
        .output()
}

/// Texto entre comillas simples para PowerShell.
#[cfg(windows)]
fn ps_quote(text: &str) -> String {
    format!("'{}'", text.replace('\'', "''"))
}

/// Las redes a las que está conectado el equipo y si Windows las tiene como Públicas o Privadas:
/// JSON [{ name, alias, category }] (category: Public, Private o DomainAuthenticated).
#[tauri::command]
pub async fn network_profiles() -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(network_profiles_now)
        .await
        .map_err(|e| e.to_string())?
}

fn network_profiles_now() -> Result<String, String> {
    #[cfg(windows)]
    {
        let script = "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8\n\
            ConvertTo-Json -Compress -InputObject @(Get-NetConnectionProfile | ForEach-Object { [pscustomobject]@{ name = [string]$_.Name; alias = [string]$_.InterfaceAlias; category = [string]$_.NetworkCategory } })";
        let output = powershell(script).map_err(|e| e.to_string())?;
        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    }
    #[cfg(not(windows))]
    {
        Ok(String::from("[]"))
    }
}

/// ¿Bloquea el cortafuegos de Windows a Creabel en alguna de las redes a las que está conectado
/// el equipo? Solo lee (no hace falta ser administrador). Para cada red cuyo perfil del
/// cortafuegos está activado, mira si hay una regla de entrada que permita a Creabel en ese
/// perfil (y ninguna que lo bloquee). JSON { checked, blocked: [{ name, alias, category }] }.
/// Otros cortafuegos o antivirus no se ven: para eso está la ayuda de la pantalla.
#[tauri::command]
pub async fn firewall_status() -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(firewall_status_now)
        .await
        .map_err(|e| e.to_string())?
}

fn firewall_status_now() -> Result<String, String> {
    #[cfg(windows)]
    {
        let exe = std::env::current_exe().map_err(|e| e.to_string())?;
        let script = r#"[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$exe = __EXE__
$fw = @{}
Get-NetFirewallProfile | ForEach-Object { $fw[[string]$_.Name] = ([string]$_.Enabled -ne 'False') }
$rules = @(Get-NetFirewallApplicationFilter -Program $exe -ErrorAction SilentlyContinue | Get-NetFirewallRule -ErrorAction SilentlyContinue | Where-Object { [string]$_.Direction -eq 'Inbound' -and [string]$_.Enabled -eq 'True' })
$out = @()
foreach ($n in @(Get-NetConnectionProfile)) {
  $cat = [string]$n.NetworkCategory
  $prof = if ($cat -eq 'DomainAuthenticated') { 'Domain' } else { $cat }
  if (-not $fw[$prof]) { continue }
  $applies = @($rules | Where-Object { $p = [string]$_.Profile; $p -eq 'Any' -or (($p -split ',\s*') -contains $prof) })
  $allow = @($applies | Where-Object { [string]$_.Action -eq 'Allow' })
  $block = @($applies | Where-Object { [string]$_.Action -eq 'Block' })
  if ($block.Count -or -not $allow.Count) { $out += [pscustomobject]@{ name = [string]$n.Name; alias = [string]$n.InterfaceAlias; category = $cat } }
}
ConvertTo-Json -Compress -InputObject @{ checked = $true; blocked = @($out) }
"#
        .replace("__EXE__", &ps_quote(&exe.display().to_string()));
        let output = powershell(&script).map_err(|e| e.to_string())?;
        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    }
    #[cfg(not(windows))]
    {
        Ok(String::from("{\"checked\":false,\"blocked\":[]}"))
    }
}

/// Deja a Creabel recibir conexiones de los otros dispositivos, con permiso de administrador
/// (Windows lo pide una vez):
///  - quita las reglas de entrada que hubiera para Creabel (también las de bloqueo que Windows
///    crea si alguna vez se le dijo que no) y crea una que lo permite en redes privadas, o en
///    todas si `public`;
///  - y, si el usuario lo ha elegido, marca como privadas las redes `private_aliases` (por
///    ejemplo, la wifi de casa que Windows tenía como pública).
/// Devuelve "ok", "cancelled" (se ha dicho que no al permiso) o "failed".
#[tauri::command]
pub async fn firewall_allow(public: bool, private_aliases: Vec<String>) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || firewall_allow_now(public, private_aliases))
        .await
        .map_err(|e| e.to_string())?
}

fn firewall_allow_now(public: bool, private_aliases: Vec<String>) -> Result<String, String> {
    #[cfg(windows)]
    {
        let exe = std::env::current_exe().map_err(|e| e.to_string())?;
        let profile = if public { "Any" } else { "Private,Domain" };
        let mut inner = format!(
            "$ErrorActionPreference = 'Stop'\n\
             try {{\n\
             $exe = {exe}\n\
             Get-NetFirewallApplicationFilter -Program $exe -ErrorAction SilentlyContinue | Get-NetFirewallRule | Where-Object {{ [string]$_.Direction -eq 'Inbound' }} | Remove-NetFirewallRule\n\
             New-NetFirewallRule -DisplayName 'Creabel' -Description 'Sincronizar Creabel con tus otros dispositivos' -Direction Inbound -Action Allow -Program $exe -Profile {profile} | Out-Null\n",
            exe = ps_quote(&exe.display().to_string()),
            profile = profile
        );
        for alias in private_aliases.iter().filter(|a| !a.is_empty() && !a.chars().any(char::is_control)) {
            inner.push_str(&format!("Set-NetConnectionProfile -InterfaceAlias {} -NetworkCategory Private\n", ps_quote(alias)));
        }
        inner.push_str("exit 0\n} catch { exit 2 }\n");
        let outer = format!(
            "try {{ $p = Start-Process -FilePath (Join-Path $PSHOME 'powershell.exe') -ArgumentList '-NoProfile -NonInteractive -EncodedCommand {}' -Verb RunAs -WindowStyle Hidden -Wait -PassThru; exit $p.ExitCode }} catch {{ exit 1223 }}",
            encode_script(&inner)
        );
        let output = powershell(&outer).map_err(|e| e.to_string())?;
        Ok(match output.status.code() {
            Some(0) => "ok",
            Some(1223) => "cancelled",
            _ => "failed",
        }
        .to_string())
    }
    #[cfg(not(windows))]
    {
        let _ = (public, private_aliases);
        Ok("failed".into())
    }
}

/// El código QR de un texto, como SVG.
#[tauri::command]
pub fn qr_svg(text: String) -> Result<String, String> {
    let code = qrcode::QrCode::new(text.as_bytes()).map_err(|e| e.to_string())?;
    Ok(code
        .render::<qrcode::render::svg::Color>()
        .min_dimensions(240, 240)
        .quiet_zone(true)
        .build())
}

fn header(name: &str, value: &str) -> Header {
    Header::from_bytes(name.as_bytes(), value.as_bytes()).expect("cabecera válida")
}

fn reply(request: Request, status: u16, body: Vec<u8>, content_type: &str) {
    let response = Response::from_data(body)
        .with_status_code(status)
        .with_header(header("Content-Type", content_type));
    let _ = request.respond(response);
}

fn empty(request: Request, status: u16) {
    reply(request, status, Vec::new(), "text/plain; charset=utf-8");
}

/// Ruta pedida, dentro de la carpeta compartida. None si trae algo no permitido.
fn safe_path(url: &str) -> Option<PathBuf> {
    let path = url.split('?').next().unwrap_or("");
    let mut out = PathBuf::new();
    for part in path.split('/').filter(|p| !p.is_empty()) {
        let ok = part != "."
            && part != ".."
            && part.chars().all(|c| c.is_ascii_alphanumeric() || c == '.' || c == '-' || c == '_');
        if !ok {
            return None;
        }
        out.push(part);
    }
    Some(out)
}

fn href_of(rel: &Path, dir: bool) -> String {
    let mut href = String::from("/");
    let parts: Vec<String> = rel.iter().map(|p| p.to_string_lossy().to_string()).collect();
    href.push_str(&parts.join("/"));
    if dir && !href.ends_with('/') {
        href.push('/');
    }
    href
}

fn entry_xml(href: &str, dir: bool) -> String {
    format!(
        "<d:response><d:href>{}</d:href><d:propstat><d:prop><d:resourcetype>{}</d:resourcetype></d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat></d:response>",
        href,
        if dir { "<d:collection/>" } else { "" }
    )
}

fn handle(root: &Path, token: &str, mut request: Request) {
    let expected = format!("Bearer {}", token);
    let authorized = !token.is_empty()
        && request
            .headers()
            .iter()
            .any(|h| h.field.equiv("Authorization") && h.value.as_str() == expected);
    if !authorized {
        empty(request, 401);
        return;
    }
    let rel = match safe_path(request.url()) {
        Some(p) => p,
        None => {
            empty(request, 400);
            return;
        }
    };
    let full = root.join(&rel);
    let method = request.method().to_string().to_ascii_uppercase();
    match method.as_str() {
        "GET" => {
            if full.is_file() {
                match fs::read(&full) {
                    Ok(data) => reply(request, 200, data, "application/octet-stream"),
                    Err(_) => empty(request, 500),
                }
            } else {
                empty(request, 404);
            }
        }
        "PUT" => {
            let mut body = Vec::new();
            if request.as_reader().read_to_end(&mut body).is_err() {
                empty(request, 400);
                return;
            }
            if let Some(parent) = full.parent() {
                let _ = fs::create_dir_all(parent);
            }
            // Se escribe aparte y se cambia de nombre al final: nunca queda un archivo a medias.
            let name = full.file_name().map(|n| n.to_string_lossy().to_string()).unwrap_or_default();
            let tmp = full.with_file_name(format!("{}.parcial", name));
            match fs::write(&tmp, &body).and_then(|_| fs::rename(&tmp, &full)) {
                Ok(_) => empty(request, 201),
                Err(_) => {
                    let _ = fs::remove_file(&tmp);
                    empty(request, 500)
                }
            }
        }
        "DELETE" => {
            let result = if full.is_dir() {
                fs::remove_dir_all(&full)
            } else {
                fs::remove_file(&full)
            };
            empty(request, if result.is_ok() { 204 } else { 404 });
        }
        "MKCOL" => {
            if full.exists() {
                empty(request, 405);
            } else {
                match fs::create_dir_all(&full) {
                    Ok(_) => empty(request, 201),
                    Err(_) => empty(request, 500),
                }
            }
        }
        "PROPFIND" => {
            if !full.exists() {
                empty(request, 404);
                return;
            }
            let mut xml = String::from("<?xml version=\"1.0\" encoding=\"utf-8\"?><d:multistatus xmlns:d=\"DAV:\">");
            xml.push_str(&entry_xml(&href_of(&rel, full.is_dir()), full.is_dir()));
            if full.is_dir() {
                if let Ok(entries) = fs::read_dir(&full) {
                    for entry in entries.flatten() {
                        let name = entry.file_name().to_string_lossy().to_string();
                        if name.ends_with(".parcial") {
                            continue;
                        }
                        let is_dir = entry.path().is_dir();
                        xml.push_str(&entry_xml(&href_of(&rel.join(&name), is_dir), is_dir));
                    }
                }
            }
            xml.push_str("</d:multistatus>");
            reply(request, 207, xml.into_bytes(), "application/xml; charset=utf-8");
        }
        _ => empty(request, 405),
    }
}
