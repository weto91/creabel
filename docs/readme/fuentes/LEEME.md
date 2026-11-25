# Imágenes del README

Las capturas de `docs/readme/es` y `docs/readme/en` son de la aplicación de verdad, con un
proyecto de ejemplo inventado («La cartógrafa de mareas» / «The Tide Cartographer»). Las
infografías son páginas HTML con los colores y los iconos de Creabel. Todo se rehace con
`generar.ps1` cuando cambia la interfaz.

| Archivo | Qué es |
| --- | --- |
| `semilla.js` | Crea el proyecto de ejemplo, en español o en inglés (todo el texto es inventado). |
| `capturas.html` | Imita la aplicación de Windows o Android, crea el proyecto y abre la página pedida (`?lang=es&go=scene:sc3&tema=dark&click=…`). |
| `movil.html` | Dos teléfonos con la aplicación de Android dentro. |
| `marco.html` | Un teléfono a pantalla completa, para las capturas de Google Play. |
| `infografias.html` | Las cuatro infografías (`?id=` `hero`, `once`, `steps` o `data`, y `&lang=es` o `en`), y el icono y el gráfico de Google Play (`playicon`, `feature`). |
| `generar.ps1` | Hace las capturas con Edge sin ventana y las guarda en `docs/readme/<idioma>/`. Con `-Play`, las de la ficha de Google Play, en `docs/tienda/play/`. |

Para rehacerlas: con el servidor de pruebas de la interfaz en `http://localhost:8766` (sirve
`app/`), en PowerShell, desde la carpeta del repositorio:

```powershell
powershell -File docs\readme\fuentes\generar.ps1
```

Con `-Langs en` solo un idioma; con `-Only inicio`, solo una imagen; con `-Play`, las imágenes de
Google Play (icono, gráfico de funciones y capturas de teléfono y de tableta).
