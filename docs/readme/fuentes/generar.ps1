# Rehace las capturas y las infografías del README (docs/readme/es y docs/readme/en).
#
# Las capturas son de la aplicación de verdad (app/) con un proyecto de ejemplo inventado
# (semilla.js). Hace falta:
#  - Microsoft Edge (viene con Windows);
#  - el servidor de pruebas de la interfaz en http://localhost:8766 sirviendo app/.
# Copia capturas.html, movil.html y semilla.js a app/ como _prueba-* (no se suben: .gitignore).
#
# Uso: powershell -File docs\readme\fuentes\generar.ps1 [-Langs es,en] [-Only inicio]
param([string[]]$Langs = @('es', 'en'), [string]$Only = '')
$ErrorActionPreference = 'Stop'
$here = $PSScriptRoot
$repo = (Resolve-Path (Join-Path $here '..\..\..')).Path
$app = Join-Path $repo 'app'
$out = Join-Path $repo 'docs\readme'
$edge = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
Copy-Item (Join-Path $here 'capturas.html') (Join-Path $app '_prueba-capturas.html')
Copy-Item (Join-Path $here 'movil.html') (Join-Path $app '_prueba-movil.html')
Copy-Item (Join-Path $here 'semilla.js') (Join-Path $app '_prueba-semilla.js')
Add-Type -AssemblyName System.Drawing

function Invoke-Edge([string[]]$Arguments) {
  $profile = Join-Path $env:TEMP ('creabel-edge-' + [guid]::NewGuid())
  $p = Start-Process -FilePath $edge -ArgumentList (@('--headless', '--disable-gpu', '--hide-scrollbars', "--user-data-dir=$profile") + $Arguments) -PassThru -WindowStyle Hidden
  $ok = $p.WaitForExit(90000)
  if (-not $ok) { $p.Kill() }
  Remove-Item -Recurse -Force $profile -ErrorAction SilentlyContinue
  return $ok
}

# Quita lo transparente de abajo (las infografías se dibujan en una ventana más alta).
function Optimize-Bottom([string]$File) {
  $img = [System.Drawing.Bitmap]::FromFile($File)
  $bottom = $img.Height - 1
  while ($bottom -gt 0) {
    $hit = $false
    for ($x = 0; $x -lt $img.Width; $x += 7) { if ($img.GetPixel($x, $bottom).A -gt 0) { $hit = $true; break } }
    if ($hit) { break }
    $bottom--
  }
  $crop = $img.Clone((New-Object System.Drawing.Rectangle 0, 0, $img.Width, ([Math]::Min($img.Height, $bottom + 13))), $img.PixelFormat)
  $img.Dispose()
  $crop.Save($File, [System.Drawing.Imaging.ImageFormat]::Png)
  $crop.Dispose()
}

$labels = @{ es = @{ auto = 'Automáticas'; all = 'Todo junto' }; en = @{ auto = 'Automatic'; all = 'Everything together' } }
$info = [Uri](Join-Path $here 'infografias.html')
foreach ($lang in $Langs) {
  $dir = Join-Path $out $lang
  New-Item -ItemType Directory -Force $dir | Out-Null
  $L = $labels[$lang]
  $shots = @(
    @{ name = 'inicio'; q = 'go=home' },
    @{ name = 'escena'; q = 'go=scene:sc3' },
    @{ name = 'personaje'; q = 'go=character:ines' },
    @{ name = 'tablero'; q = 'go=board&tema=dark' },
    @{ name = 'linea-temporal'; q = 'go=timeline' },
    @{ name = 'relaciones'; q = ('go=relationships&click=' + [Uri]::EscapeDataString($L.auto + '|' + $L.all) + '&scroll=' + [Uri]::EscapeDataString($L.all) + '&margen=110') },
    @{ name = 'analisis'; q = 'go=analysis' },
    @{ name = 'movil'; q = 'a=home&b=scene:sc2'; mobile = $true },
    @{ name = 'creabel'; info = 'hero' },
    @{ name = 'apuntas-una-vez'; info = 'once' },
    @{ name = 'de-la-idea-al-libro'; info = 'steps' },
    @{ name = 'tus-dispositivos'; info = 'data' }
  )
  foreach ($s in $shots) {
    if ($Only -and $s.name -ne $Only) { continue }
    $file = Join-Path $dir "$($s.name).png"
    if ($s.info) {
      $ok = Invoke-Edge @('--force-device-scale-factor=2', '--default-background-color=00000000', '--window-size=1220,1000', '--virtual-time-budget=3000', "--screenshot=$file", "$($info.AbsoluteUri)?id=$($s.info)&lang=$lang")
      if ($ok -and (Test-Path $file)) { Optimize-Bottom $file }
    } elseif ($s.mobile) {
      $ok = Invoke-Edge @('--force-device-scale-factor=1.5', '--default-background-color=00000000', '--window-size=1040,968', '--virtual-time-budget=30000', '--run-all-compositor-stages-before-draw', "--screenshot=$file", "http://localhost:8766/_prueba-movil.html?lang=$lang&$($s.q)")
    } else {
      $ok = Invoke-Edge @('--force-device-scale-factor=1', '--window-size=1440,900', '--virtual-time-budget=20000', '--run-all-compositor-stages-before-draw', "--screenshot=$file", "http://localhost:8766/_prueba-capturas.html?lang=$lang&$($s.q)")
    }
    if ($ok -and (Test-Path $file)) {
      $img = [System.Drawing.Image]::FromFile($file)
      "$lang/$($s.name): $($img.Width)x$($img.Height)"
      $img.Dispose()
    } else { "$lang/$($s.name): NO GENERADA" }
  }
}
