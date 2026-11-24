// En Windows, sin ventana de consola detrás de la aplicación (salvo en las compilaciones de depuración).
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    creabel_lib::run()
}
