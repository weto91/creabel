// La versión de Microsoft Store. Es el mismo programa, metido en un paquete MSIX que firma
// Microsoft y que actualiza la tienda (ver scripts/msix.ps1). Desde dentro se sabe porque
// Windows le da una identidad de paquete. Entonces:
//  - no se registra el actualizador propio: la tienda no deja que una aplicación se actualice
//    por su cuenta;
//  - y cada página lo sabe por window.__CREABEL_STORE__ (para no buscar actualizaciones).

/// ¿Corre Creabel desde un paquete MSIX (la versión de Microsoft Store)?
#[cfg(windows)]
pub fn packaged() -> bool {
    #[link(name = "kernel32")]
    extern "system" {
        fn GetCurrentPackageFullName(length: *mut u32, name: *mut u16) -> i32;
    }
    const ERROR_INSUFFICIENT_BUFFER: i32 = 122;
    let mut length: u32 = 0;
    // Sin paquete devuelve APPMODEL_ERROR_NO_PACKAGE (15700); con paquete pide sitio para el
    // nombre (no se le da: solo interesa saber si lo tiene).
    unsafe { GetCurrentPackageFullName(&mut length, std::ptr::null_mut()) == ERROR_INSUFFICIENT_BUFFER }
}

#[cfg(not(windows))]
pub fn packaged() -> bool {
    false
}

/// Pone window.__CREABEL_STORE__ en cada página, antes de que arranque la interfaz.
pub fn plugin<R: tauri::Runtime>() -> tauri::plugin::TauriPlugin<R> {
    tauri::plugin::Builder::new("creabel-tienda")
        .js_init_script(format!("window.__CREABEL_STORE__ = {};", packaged()))
        .build()
}
