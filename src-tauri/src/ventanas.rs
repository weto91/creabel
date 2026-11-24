// Varias ventanas en el escritorio: «Abrir en una ventana nueva».
//
// Cada ventana carga la misma aplicación (index.html) y empieza en la página pedida, que se le
// pasa en window.__CREABEL_ROUTE__ antes de que arranque. Solo la principal («main») guarda los
// datos: las demás le piden lo que necesitan (app/assets/js/windows.js). Por eso, cuando se
// cierra la principal, se cierran también las demás (antes, la principal les pide que guarden).

use std::sync::atomic::{AtomicU32, Ordering};
use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder, Window, WindowEvent};

static NEXT: AtomicU32 = AtomicU32::new(1);

/// Abre una ventana nueva en la página `route` («#/p/…»). Devuelve su nombre interno.
/// (Asíncrona: en Windows, crear una ventana desde una orden síncrona puede bloquearse.)
#[tauri::command]
pub async fn open_window(app: AppHandle, route: String) -> Result<String, String> {
    let route = if route.starts_with('#') { route } else { format!("#{route}") };
    let script = format!(
        "window.__CREABEL_ROUTE__ = {};",
        serde_json::to_string(&route).map_err(|e| e.to_string())?
    );
    // Un nombre libre: ventana-1, ventana-2…
    let label = loop {
        let candidate = format!("ventana-{}", NEXT.fetch_add(1, Ordering::Relaxed));
        if app.get_webview_window(&candidate).is_none() {
            break candidate;
        }
    };
    let mut builder = WebviewWindowBuilder::new(&app, &label, WebviewUrl::App("index.html".into()))
        .title("Creabel")
        .min_inner_size(360.0, 480.0)
        .initialization_script(&script);
    // Algo más pequeña que la principal y un poco desplazada, para que se vea que es otra.
    match app.get_webview_window("main") {
        Some(main) => {
            let scale = main.scale_factor().unwrap_or(1.0);
            if let Ok(size) = main.inner_size() {
                let s = size.to_logical::<f64>(scale);
                builder = builder.inner_size((s.width * 0.85).max(480.0), (s.height * 0.9).max(480.0));
            }
            if let Ok(pos) = main.outer_position() {
                let p = pos.to_logical::<f64>(scale);
                builder = builder.position(p.x + 48.0, p.y + 48.0);
            }
        }
        None => builder = builder.inner_size(1100.0, 780.0),
    }
    builder.build().map_err(|e| e.to_string())?;
    Ok(label)
}

/// Al cerrarse la ventana principal, se cierran las demás: sin ella no tienen datos.
pub fn on_window_event(window: &Window, event: &WindowEvent) {
    if window.label() != "main" {
        return;
    }
    if let WindowEvent::Destroyed = event {
        for (label, other) in window.app_handle().webview_windows() {
            if label != "main" {
                let _ = other.destroy();
            }
        }
    }
}
