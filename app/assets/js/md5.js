// MD5 de un archivo, en el navegador (el de serie, crypto.subtle, no lo calcula). Sirve para
// dar a los archivos de la copia de seguridad el mismo nombre que tienen en el servidor:
// creabel_<MD5>.<extensión>. No se usa para nada de seguridad.

const S = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
];
const K = new Int32Array(64);
for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) | 0;

/** MD5 en hexadecimal (32 caracteres) de unos bytes (Uint8Array) o de un texto. */
export function md5(input) {
  const bytes = input instanceof Uint8Array ? input : new TextEncoder().encode(String(input));
  const len = bytes.length;
  // Relleno: un 1, ceros y la longitud en bits, hasta un múltiplo de 64 bytes.
  const total = Math.floor((len + 8) / 64) * 64 + 64;
  const buf = new Uint8Array(total);
  buf.set(bytes);
  buf[len] = 0x80;
  const view = new DataView(buf.buffer);
  const bits = len * 8;
  view.setUint32(total - 8, bits >>> 0, true);
  view.setUint32(total - 4, Math.floor(bits / 4294967296), true);

  let a0 = 0x67452301 | 0;
  let b0 = 0xefcdab89 | 0;
  let c0 = 0x98badcfe | 0;
  let d0 = 0x10325476 | 0;
  const M = new Int32Array(16);
  for (let off = 0; off < total; off += 64) {
    for (let i = 0; i < 16; i++) M[i] = view.getInt32(off + i * 4, true);
    let A = a0;
    let B = b0;
    let C = c0;
    let D = d0;
    for (let i = 0; i < 64; i++) {
      let F;
      let g;
      if (i < 16) { F = (B & C) | (~B & D); g = i; }
      else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) & 15; }
      else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) & 15; }
      else { F = C ^ (B | ~D); g = (7 * i) & 15; }
      const x = (A + F + K[i] + M[g]) | 0;
      A = D;
      D = C;
      C = B;
      B = (B + ((x << S[i]) | (x >>> (32 - S[i])))) | 0;
    }
    a0 = (a0 + A) | 0;
    b0 = (b0 + B) | 0;
    c0 = (c0 + C) | 0;
    d0 = (d0 + D) | 0;
  }
  const out = new DataView(new ArrayBuffer(16));
  out.setInt32(0, a0, true);
  out.setInt32(4, b0, true);
  out.setInt32(8, c0, true);
  out.setInt32(12, d0, true);
  let hex = '';
  for (let i = 0; i < 16; i++) hex += out.getUint8(i).toString(16).padStart(2, '0');
  return hex;
}
