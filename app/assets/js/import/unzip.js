// Lector mínimo de archivos ZIP (DOCX y ODT lo son): localiza el directorio central y
// extrae las entradas guardadas sin comprimir o con «deflate», que descomprime el navegador.

async function inflate(bytes) {
  if (typeof DecompressionStream === 'undefined') throw new Error('unsupported');
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/**
 * Devuelve { names, bytes(name), text(name) }. bytes y text devuelven null si la entrada no existe.
 * Lanza un error si el archivo no es un ZIP legible.
 */
export function openZip(buffer) {
  const data = new Uint8Array(buffer);
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  // El final del directorio central está en los últimos bytes (22 más un comentario opcional).
  let end = -1;
  for (let i = data.length - 22; i >= Math.max(0, data.length - 66000); i--) {
    if (view.getUint32(i, true) === 0x06054b50) { end = i; break; }
  }
  if (end < 0) throw new Error('not-zip');
  const count = view.getUint16(end + 10, true);
  let pos = view.getUint32(end + 16, true);
  const decoder = new TextDecoder('utf-8');
  const entries = new Map();
  for (let n = 0; n < count && pos + 46 <= data.length; n++) {
    if (view.getUint32(pos, true) !== 0x02014b50) break;
    const method = view.getUint16(pos + 10, true);
    const size = view.getUint32(pos + 20, true);
    const nameLen = view.getUint16(pos + 28, true);
    const extraLen = view.getUint16(pos + 30, true);
    const commentLen = view.getUint16(pos + 32, true);
    const offset = view.getUint32(pos + 42, true);
    const name = decoder.decode(data.subarray(pos + 46, pos + 46 + nameLen));
    entries.set(name, { method, size, offset });
    pos += 46 + nameLen + extraLen + commentLen;
  }

  const bytes = async (name) => {
    const entry = entries.get(name);
    if (!entry) return null;
    const local = entry.offset;
    if (view.getUint32(local, true) !== 0x04034b50) throw new Error('not-zip');
    const start = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true);
    const raw = data.subarray(start, start + entry.size);
    if (entry.method === 0) return raw;
    if (entry.method === 8) return inflate(raw);
    throw new Error('unsupported');
  };

  return {
    names: [...entries.keys()],
    bytes,
    text: async (name) => {
      const b = await bytes(name);
      return b ? decoder.decode(b) : null;
    },
  };
}
