// Arranque de Creabel en Windows y Android. La interfaz es la de siempre (carpeta app/), servida
// por Tauri dentro de una ventana propia; aquí se registran los complementos nativos:
//  - sql: la base de datos SQLite del dispositivo (todos los proyectos);
//  - fs: los archivos (imágenes, planos, PDF) y la carpeta que el PC comparte con el móvil;
//  - http: las conexiones para sincronizar (WebDAV y el PC emparejado), sin las restricciones
//    de una página web;
//  - opener: abre los enlaces externos en el navegador del sistema;
//  - updater (solo escritorio, y no en la versión de Microsoft Store): busca, descarga e
//    instala las versiones nuevas;
//  - barcode-scanner (solo Android): lee el código QR para emparejar con el PC;
//  - en escritorio, el servidor de emparejamiento (hub.rs), las ventanas nuevas (ventanas.rs)
//    y el aviso de si es la versión de la tienda (tienda.rs);
//  - y en los dos, el diagnóstico de red (net.rs).

#[cfg(desktop)]
mod hub;
mod net;
#[cfg(desktop)]
mod tienda;
#[cfg(desktop)]
mod ventanas;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init());

    #[cfg(desktop)]
    let builder = builder
        .plugin(tienda::plugin())
        .manage(hub::HubState::default())
        .on_window_event(ventanas::on_window_event)
        .invoke_handler(tauri::generate_handler![
            net::tcp_probe,
            net::local_ip,
            net::discover_peer,
            hub::hub_start,
            hub::hub_stop,
            hub::hub_addresses,
            hub::qr_svg,
            hub::network_profiles,
            hub::firewall_status,
            hub::firewall_allow,
            ventanas::open_window
        ]);

    #[cfg(mobile)]
    let builder = builder.invoke_handler(tauri::generate_handler![net::tcp_probe, net::local_ip, net::discover_peer]);

    builder
        .setup(|_app| {
            #[cfg(desktop)]
            if !tienda::packaged() {
                _app.handle().plugin(tauri_plugin_updater::Builder::new().build())?;
            }
            #[cfg(mobile)]
            _app.handle().plugin(tauri_plugin_barcode_scanner::init())?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("no se ha podido arrancar Creabel");
}
