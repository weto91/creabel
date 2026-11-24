#!/usr/bin/env bash
# Comprueba el APK recién compilado y lo apunta en el resumen de la ejecución de GitHub Actions:
#  - con qué certificado va firmado y su huella SHA-256 (la que piden Google Play y la
#    verificación de desarrolladores de Android; tiene que ser siempre la misma);
#  - que las bibliotecas nativas de 64 bits (el código de Rust) están preparadas para los
#    teléfonos con páginas de memoria de 16 KB, como exige Google Play.
# Si algo no cumple, avisa (no detiene la compilación).
# Uso: bash scripts/android-check.sh <APK o carpeta donde buscarlo>
set -euo pipefail

where="${1:-src-tauri/gen/android/app/build/outputs/apk}"
if [ -f "$where" ]; then apk="$where"; else apk="$(find "$where" -name '*.apk' | head -n 1)"; fi
if [ -z "$apk" ] || [ ! -f "$apk" ]; then
  echo "::error::No se encuentra el APK en $where"
  exit 1
fi
sdk="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"
tools="$sdk/build-tools/$(ls "$sdk/build-tools" | sort -V | tail -n 1)"
# En el NDK, llvm-readelf es un enlace a llvm-readobj: se busca sin exigir que sea un archivo.
readelf="$(find "${NDK_HOME:?Falta NDK_HOME}/toolchains/llvm/prebuilt" -name llvm-readelf | head -n 1)"
if [ -z "$readelf" ]; then
  echo "::error::No se encuentra llvm-readelf en el NDK ($NDK_HOME)"
  exit 1
fi
summary="${GITHUB_STEP_SUMMARY:-/dev/null}"

echo "APK: $apk"
echo "NDK: $(grep -m1 'Pkg.Revision' "$NDK_HOME/source.properties" | cut -d= -f2 | tr -d ' ')"
echo "build-tools: $(basename "$tools")"

# Firma
if ! certs="$("$tools/apksigner" verify --print-certs "$apk")"; then
  echo "::error::El APK no está firmado o su firma no es válida"
  exit 1
fi
echo "$certs"
dn="$(echo "$certs" | grep -m1 'certificate DN' | sed 's/.*DN: *//' || true)"
sha="$(echo "$certs" | grep -m1 'SHA-256 digest' | sed 's/.*digest: *//' || true)"
{
  echo "### APK de Android"
  echo ""
  echo "- Archivo: \`$(basename "$apk")\`"
  echo "- Certificado: \`$dn\`"
  echo "- Huella SHA-256: \`$sha\`"
} >> "$summary"

# Páginas de 16 KB: cada segmento LOAD de las bibliotecas de 64 bits alineado a 16384 o más…
tmp="$(mktemp -d)"
unzip -q -o "$apk" 'lib/*' -d "$tmp" || true
shopt -s nullglob
problems=()
libs=0
for so in "$tmp"/lib/arm64-v8a/*.so "$tmp"/lib/x86_64/*.so; do
  libs=$((libs + 1))
  name="$(basename "$(dirname "$so")")/$(basename "$so")"
  min=""
  for a in $("$readelf" -lW "$so" | awk '$1 == "LOAD" { print $NF }'); do
    a=$((a))
    if [ -z "$min" ] || [ "$a" -lt "$min" ]; then min="$a"; fi
  done
  echo "$name: segmentos alineados a ${min:-?} bytes"
  if [ -z "$min" ] || [ "$min" -lt 16384 ]; then problems+=("$name (alineada a ${min:-?} bytes)"); fi
done
if [ "$libs" -eq 0 ]; then problems+=("el APK no tiene bibliotecas nativas de 64 bits"); fi

# …y, dentro del APK, guardadas sin comprimir en posiciones múltiplo de 16 KB.
usage="$("$tools/zipalign" 2>&1 || true)"
if [[ "$usage" == *"-P "* ]]; then
  if ! "$tools/zipalign" -c -P 16 4 "$apk" > /dev/null; then
    problems+=("las bibliotecas no están alineadas a 16 KB dentro del APK (zipalign -P 16)")
  fi
else
  echo "Este zipalign no comprueba páginas de 16 KB (build-tools anteriores a la 35)."
fi
rm -rf "$tmp"

if [ "${#problems[@]}" -gt 0 ]; then
  for p in "${problems[@]}"; do echo "::warning::Sin preparar para páginas de 16 KB: $p"; done
  echo "- Páginas de 16 KB: **no** (ver avisos)" >> "$summary"
else
  echo "Preparado para páginas de 16 KB."
  echo "- Páginas de 16 KB: sí" >> "$summary"
fi
