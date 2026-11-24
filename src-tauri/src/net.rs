// Diagnóstico de red (Windows y Android): prueba si se puede abrir una conexión con un equipo y,
// si no, por qué. La aplicación lo usa al pulsar «Probar» en un equipo emparejado para decir
// algo útil en vez de un «no se puede conectar» genérico:
//  - rechazada: el equipo está en la red, pero no hay nada escuchando (Creabel cerrada o sin
//    compartir);
//  - sin respuesta: lo normal es el cortafuegos (o que no estén en la misma red);
//  - inalcanzable: esa dirección no está en esta red.
//
// Y el descubrimiento (ver hub.rs): si el PC ha cambiado de dirección, el móvil pregunta a toda
// la red «¿dónde estás?» con la huella del código y se queda con la dirección de quien contesta.
use std::net::{Ipv4Addr, SocketAddr, TcpStream, ToSocketAddrs, UdpSocket};
use std::time::{Duration, Instant};

#[derive(serde::Serialize)]
pub struct Probe {
    ok: bool,
    ms: u64,
    /// Tipo de error (ConnectionRefused, TimedOut, HostUnreachable…), vacío si ha ido bien.
    kind: String,
    message: String,
}

fn probe(host: &str, port: u16) -> Probe {
    let start = Instant::now();
    let done = |ok: bool, kind: String, message: String| Probe {
        ok,
        ms: start.elapsed().as_millis() as u64,
        kind,
        message,
    };
    let addrs: Vec<SocketAddr> = match (host, port).to_socket_addrs() {
        Ok(list) => list.collect(),
        Err(e) => return done(false, "Resolve".into(), e.to_string()),
    };
    let mut last: Option<std::io::Error> = None;
    for addr in addrs {
        match TcpStream::connect_timeout(&addr, Duration::from_secs(4)) {
            Ok(_) => return done(true, String::new(), String::new()),
            Err(e) => last = Some(e),
        }
    }
    match last {
        Some(e) => done(false, format!("{:?}", e.kind()), e.to_string()),
        None => done(false, "Resolve".into(), "sin direcciones".into()),
    }
}

#[tauri::command]
pub async fn tcp_probe(host: String, port: u16) -> Result<Probe, String> {
    tauri::async_runtime::spawn_blocking(move || probe(&host, port))
        .await
        .map_err(|e| e.to_string())
}

/// La dirección de este dispositivo en la red por la que saldría hacia `towards` (no se envía
/// nada: solo se pregunta al sistema qué camino tomaría).
fn local_ip_towards(towards: SocketAddr) -> Option<Ipv4Addr> {
    let socket = UdpSocket::bind(("0.0.0.0", 0)).ok()?;
    socket.connect(towards).ok()?;
    match socket.local_addr().ok()?.ip() {
        std::net::IpAddr::V4(ip) if !ip.is_unspecified() && !ip.is_loopback() => Some(ip),
        _ => None,
    }
}

/// La dirección de este dispositivo en su red (la de la wifi, normalmente). Vacío si no hay red.
#[tauri::command]
pub fn local_ip() -> String {
    local_ip_towards(SocketAddr::from(([192, 0, 2, 1], 9)))
        .map(|ip| ip.to_string())
        .unwrap_or_default()
}

fn broadcast_of(ip: Ipv4Addr, port: u16) -> SocketAddr {
    let o = ip.octets();
    SocketAddr::from(([o[0], o[1], o[2], 255], port))
}

fn discover_now(key: &str, port: u16, hints: &[String]) -> Vec<String> {
    let socket = match UdpSocket::bind(("0.0.0.0", 0)) {
        Ok(s) => s,
        Err(_) => return Vec::new(),
    };
    let _ = socket.set_broadcast(true);
    let _ = socket.set_read_timeout(Some(Duration::from_millis(200)));
    // A quién se pregunta: a toda la red (255.255.255.255), a la difusión de la red de este
    // dispositivo y a la de las direcciones que se conocían del PC (por si son otra red), y a
    // esas direcciones directamente.
    let mut targets: Vec<SocketAddr> = vec![SocketAddr::from(([255, 255, 255, 255], port))];
    if let Some(mine) = local_ip_towards(SocketAddr::from(([192, 0, 2, 1], 9))) {
        targets.push(broadcast_of(mine, port));
    }
    for hint in hints {
        if let Ok(ip) = hint.parse::<Ipv4Addr>() {
            targets.push(broadcast_of(ip, port));
            targets.push(SocketAddr::from((ip, port)));
        }
    }
    let mut unique: Vec<SocketAddr> = Vec::new();
    for t in targets {
        if !unique.contains(&t) {
            unique.push(t);
        }
    }
    let question = format!("CREABEL?1 {}", key);
    let mut found: Vec<String> = Vec::new();
    let start = Instant::now();
    let mut last_send: Option<Instant> = None;
    let mut buf = [0u8; 256];
    while start.elapsed() < Duration::from_millis(2500) {
        // Se repite la pregunta cada 0,8 s: en wifi se pierde algún paquete de difusión.
        if last_send.map_or(true, |t| t.elapsed() >= Duration::from_millis(800)) {
            for t in &unique {
                let _ = socket.send_to(question.as_bytes(), t);
            }
            last_send = Some(Instant::now());
        }
        if let Ok((n, from)) = socket.recv_from(&mut buf) {
            let text = String::from_utf8_lossy(&buf[..n]).to_string();
            let mut parts = text.split_whitespace();
            if parts.next() == Some("CREABEL!1") && parts.next() == Some(key) {
                let ip = from.ip().to_string();
                if !found.contains(&ip) {
                    found.push(ip);
                }
            }
        }
    }
    found
}

/// Busca en la red el PC emparejado (por la huella de su código). Devuelve sus direcciones.
#[tauri::command]
pub async fn discover_peer(key: String, port: u16, hints: Vec<String>) -> Result<Vec<String>, String> {
    if key.is_empty() {
        return Ok(Vec::new());
    }
    tauri::async_runtime::spawn_blocking(move || discover_now(&key, port, &hints))
        .await
        .map_err(|e| e.to_string())
}
