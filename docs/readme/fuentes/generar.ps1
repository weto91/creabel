# Rehace las capturas y las infografías del README (docs/readme/es y docs/readme/en).
#
# Las capturas son de la aplicación de verdad (app/) con un proyecto de ejemplo inventado
# (semilla.js). Hace falta:
#  - Microsoft Edge (viene con Windows);
#  - el servidor de pruebas de la interfaz en http://localhost:8766 sirviendo app/.
# Copia capturas.html, movil.html y semilla.js a app/ como _prueba-* (no se suben: .gitignore).
#
# Uso: powershell -File docs\readme\fuentes\generar.ps1 [-Langs es,en] [-Only inicio]
# Con -Play hace, en vez de las del README, las imágenes de la ficha de Google Play
# (docs/tienda/play): icono, gráfico de funciones y capturas de teléfono y de tableta.
param([string[]]$Langs = @('es', 'en'), [string]$Only = '', [switch]$Play)
$ErrorActionPreference = 'Stop'
$here = $PSScriptRoot
$repo = (Resolve-Path (Join-Path $here '..\..\..')).Path
$app = Join-Path $repo 'app'
$out = Join-Path $repo 'docs\readme'
$edge = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
Copy-Item (Join-Path $here 'capturas.html') (Join-Path $app '_prueba-capturas.html')
Copy-Item (Join-Path $here 'movil.html') (Join-Path $app '_prueba-movil.html')
Copy-Item (Join-Path $here 'semilla.js') (Join-Path $app '_prueba-semilla.js')
Copy-Item (Join-Path $here 'marco.html') (Join-Path $app '_prueba-marco.html')
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

# El idioma del navegador (los campos de fecha lo siguen, no el de la aplicación).
$locales = @{ es = 'es-ES'; en = 'en-US' }

# Se queda con la esquina superior izquierda de la imagen.
function Edit-Crop([string]$File, [int]$Width, [int]$Height) {
  $img = [System.Drawing.Bitmap]::FromFile($File)
  $crop = $img.Clone((New-Object System.Drawing.Rectangle 0, 0, ([Math]::Min($Width, $img.Width)), ([Math]::Min($Height, $img.Height))), $img.PixelFormat)
  $img.Dispose()
  $crop.Save($File, [System.Drawing.Imaging.ImageFormat]::Png)
  $crop.Dispose()
}

# Google Play no admite transparencia en el gráfico ni en las capturas: PNG de 24 bits.
function Convert-Opaque([string]$File) {
  $img = [System.Drawing.Bitmap]::FromFile($File)
  $flat = New-Object System.Drawing.Bitmap $img.Width, $img.Height, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  $g = [System.Drawing.Graphics]::FromImage($flat)
  $g.Clear([System.Drawing.Color]::FromArgb(34, 46, 54))
  $g.DrawImage($img, 0, 0, $img.Width, $img.Height)
  $g.Dispose(); $img.Dispose()
  $flat.Save($File, [System.Drawing.Imaging.ImageFormat]::Png)
  $flat.Dispose()
}

if ($Play) {
  $store = Join-Path $repo 'docs\tienda\play'
  New-Item -ItemType Directory -Force $store | Out-Null
  $report = {
    param($file, $label)
    if (Test-Path $file) { $img = [System.Drawing.Image]::FromFile($file); "${label}: $($img.Width)x$($img.Height) $([math]::Round((Get-Item $file).Length / 1KB)) KB"; $img.Dispose() } else { "${label}: NO GENERADA" }
  }
  if (-not $Only -or $Only -eq 'icono') {
    $file = Join-Path $store 'icono-512.png'
    [void](Invoke-Edge @('--force-device-scale-factor=1', '--window-size=512,512', '--virtual-time-budget=3000', "--screenshot=$file", "$($info.AbsoluteUri)?id=playicon"))
    & $report $file 'icono-512'
  }
  foreach ($lang in $Langs) {
    $dir = Join-Path $store $lang
    New-Item -ItemType Directory -Force $dir | Out-Null
    $shots = @(
      @{ name = 'grafico-1024x500'; info = 'feature' },
      @{ name = 'telefono-1'; phone = 'go=home' },
      @{ name = 'telefono-2'; phone = 'go=scene:sc2' },
      @{ name = 'telefono-3'; phone = 'go=character:ines' },
      @{ name = 'telefono-4'; phone = 'go=timeline' },
      @{ name = 'telefono-5'; phone = 'go=analysis' },
      @{ name = 'telefono-6'; phone = 'go=scene:sc4&tema=dark' },
      @{ name = 'tableta-1'; tablet = 'go=home' },
      @{ name = 'tableta-2'; tablet = 'go=scene:sc3' },
      @{ name = 'tableta-3'; tablet = 'go=timeline' },
      @{ name = 'tableta-4'; tablet = 'go=board&tema=dark' }
    )
    foreach ($s in $shots) {
      if ($Only -and $s.name -ne $Only) { continue }
      $file = Join-Path $dir "$($s.name).png"
      if ($s.info) {
        $ok = Invoke-Edge @('--force-device-scale-factor=1', '--window-size=1024,500', '--virtual-time-budget=3000', "--screenshot=$file", "$($info.AbsoluteUri)?id=$($s.info)&lang=$lang")
      } elseif ($s.phone) {
        # Un teléfono de 412 × 733 px ampliado 2,62 veces y recortado a 1080 × 1920.
        $ok = Invoke-Edge @('--force-device-scale-factor=2.62136', '--window-size=520,900', '--virtual-time-budget=30000', '--run-all-compositor-stages-before-draw', "--lang=$($locales[$lang])", "--screenshot=$file", "http://localhost:8766/_prueba-marco.html?w=412&h=733&lang=$lang&$($s.phone)")
        if ($ok -and (Test-Path $file)) { Edit-Crop $file 1080 1920 }
      } else {
        # Una tableta apaisada de 1280 × 720, a 1920 × 1080.
        $ok = Invoke-Edge @('--force-device-scale-factor=1.5', '--window-size=1280,720', '--virtual-time-budget=20000', '--run-all-compositor-stages-before-draw', "--lang=$($locales[$lang])", "--screenshot=$file", "http://localhost:8766/_prueba-capturas.html?android&lang=$lang&$($s.tablet)")
      }
      if ($ok -and (Test-Path $file)) { Convert-Opaque $file }
      & $report $file "$lang/$($s.name)"
    }
  }
  return
}
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
      $ok = Invoke-Edge @('--force-device-scale-factor=1', '--window-size=1440,900', '--virtual-time-budget=20000', '--run-all-compositor-stages-before-draw', "--lang=$($locales[$lang])", "--screenshot=$file", "http://localhost:8766/_prueba-capturas.html?lang=$lang&$($s.q)")
    }
    if ($ok -and (Test-Path $file)) {
      $img = [System.Drawing.Image]::FromFile($file)
      "$lang/$($s.name): $($img.Width)x$($img.Height)"
      $img.Dispose()
    } else { "$lang/$($s.name): NO GENERADA" }
  }
}
