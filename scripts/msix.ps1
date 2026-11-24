# Paquete MSIX de Creabel para Microsoft Store, hecho con el programa ya compilado (tauri build).
# Sale sin firmar: lo firma la tienda al publicarlo. Deja en la carpeta de salida:
#  - Creabel_<versión>.0_x64.msix: lo que se sube a Partner Center;
#  - paquete\: lo mismo sin empaquetar, para probarlo en el PC antes de subirlo
#    (Add-AppxPackage -Register paquete\AppxManifest.xml, con el modo de desarrollador activado).
# Uso: pwsh scripts/msix.ps1 -Version 0.2.0 [-Out src-tauri/target/msix]
param(
  [Parameter(Mandatory = $true)][string]$Version,
  [string]$Out = 'src-tauri/target/msix'
)
$ErrorActionPreference = 'Stop'

# La tienda quiere cuatro números con el último a 0 (0.2.0 → 0.2.0.0). Las versiones previas
# (0.3.0-beta.1) no van a la tienda.
if ($Version -notmatch '^\d+\.\d+\.\d+$') { throw "Versión no válida para la tienda: «$Version» (tiene que ser X.Y.Z)" }
$msixVersion = "$Version.0"

$root = Split-Path -Parent $PSScriptRoot
$exe = Join-Path $root 'src-tauri/target/release/creabel.exe'
if (-not (Test-Path $exe)) { throw "No está el programa compilado: $exe" }
$icons = Join-Path $root 'src-tauri/icons'
$template = Join-Path $root 'src-tauri/msix/AppxManifest.xml'
$dest = if ([IO.Path]::IsPathRooted($Out)) { $Out } else { Join-Path $root $Out }
$layout = Join-Path $dest 'paquete'

if (Test-Path $dest) { Remove-Item -Recurse -Force $dest }
New-Item -ItemType Directory -Force (Join-Path $layout 'Assets') | Out-Null

Copy-Item $exe (Join-Path $layout 'Creabel.exe')
foreach ($name in 'StoreLogo.png', 'Square44x44Logo.png', 'Square150x150Logo.png') {
  $src = Join-Path $icons $name
  if (-not (Test-Path $src)) { throw "Falta el icono $src (lo genera «tauri icon»)" }
  Copy-Item $src (Join-Path $layout "Assets/$name")
}
$manifest = [IO.File]::ReadAllText($template).Replace('__VERSION__', $msixVersion)
[IO.File]::WriteAllText((Join-Path $layout 'AppxManifest.xml'), $manifest, [Text.UTF8Encoding]::new($false))

# MakeAppx viene con el SDK de Windows (instalado en los equipos de GitHub Actions); se usa el
# más reciente.
$makeappx = Get-ChildItem "${env:ProgramFiles(x86)}\Windows Kits\10\bin\*\x64\makeappx.exe" -ErrorAction SilentlyContinue |
  Where-Object { $_.Directory.Parent.Name -match '^\d+(\.\d+)+$' } |
  Sort-Object { [version]$_.Directory.Parent.Name } -Descending |
  Select-Object -First 1
if (-not $makeappx) { throw 'No se encuentra makeappx.exe (SDK de Windows)' }
"MakeAppx: $($makeappx.FullName)"

$package = Join-Path $dest "Creabel_${msixVersion}_x64.msix"
& $makeappx.FullName pack /d $layout /p $package /o
if ($LASTEXITCODE -ne 0) { throw "makeappx no ha podido crear el paquete (código $LASTEXITCODE)" }
"Paquete para la tienda: $package ($([math]::Round((Get-Item $package).Length / 1MB, 1)) MB)"
