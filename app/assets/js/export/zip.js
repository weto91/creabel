// Generador de archivos ZIP sin dependencias. `zip` guarda sin comprimir (suficiente para DOCX y
// EPUB); `zipCompressed` comprime con «deflate» lo que se le pida (las copias de seguridad: el
// texto ocupa mucho menos), usando el compresor del navegador.

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

const encoder = new TextEncoder();
const bytesOf = (data) => (typeof data === 'string' ? encoder.encode(data) : data);

/** Comprime con «deflate» sin cabeceras (lo que usa ZIP). Devuelve null si el navegador no sabe. */
async function deflateRaw(bytes) {
  if (typeof CompressionStream === 'undefined') return null;
  try {
    const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  } catch (err) {
    return null;
  }
}

/** entries: [{ name, data (Uint8Array sin comprimir), stored (lo que se escribe), method }]. */
function build(entries, mime) {
  const now = new Date();
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  const chunks = [];
  const central = [];
  let offset = 0;

  for (const file of entries) {
    const name = encoder.encode(file.name);
    const { data, stored, method } = file;
    const crc = crc32(data);
    // El bit 11 indica nombre en UTF-8; solo se marca si hace falta.
    const flags = /^[\x20-\x7e]*$/.test(file.name) ? 0 : 0x0800;

    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, flags, true);
    local.setUint16(8, method, true);
    local.setUint16(10, dosTime, true);
    local.setUint16(12, dosDate, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, stored.length, true);
    local.setUint32(22, data.length, true);
    local.setUint16(26, name.length, true);
    local.setUint16(28, 0, true);
    chunks.push(new Uint8Array(local.buffer), name, stored);

    const entry = new DataView(new ArrayBuffer(46));
    entry.setUint32(0, 0x02014b50, true);
    entry.setUint16(4, 20, true);
    entry.setUint16(6, 20, true);
    entry.setUint16(8, flags, true);
    entry.setUint16(10, method, true);
    entry.setUint16(12, dosTime, true);
    entry.setUint16(14, dosDate, true);
    entry.setUint32(16, crc, true);
    entry.setUint32(20, stored.length, true);
    entry.setUint32(24, data.length, true);
    entry.setUint16(28, name.length, true);
    entry.setUint16(30, 0, true);
    entry.setUint16(32, 0, true);
    entry.setUint16(34, 0, true);
    entry.setUint16(36, 0, true);
    entry.setUint32(38, 0, true);
    entry.setUint32(42, offset, true);
    central.push(new Uint8Array(entry.buffer), name);

    offset += 30 + name.length + stored.length;
  }

  const centralSize = central.reduce((sum, part) => sum + part.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(4, 0, true);
  end.setUint16(6, 0, true);
  end.setUint16(8, entries.length, true);
  end.setUint16(10, entries.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, offset, true);
  end.setUint16(20, 0, true);

  return new Blob([...chunks, ...central, new Uint8Array(end.buffer)], { type: mime || 'application/zip' });
}

/** files: [{ name, data }] donde data es texto o Uint8Array. Devuelve un Blob. */
export function zip(files, mime) {
  return build(files.map((f) => { const data = bytesOf(f.data); return { name: f.name, data, stored: data, method: 0 }; }), mime);
}

/**
 * Como `zip`, pero comprime los archivos marcados con `deflate: true` (texto, JSON, documentos).
 * Las imágenes ya vienen comprimidas: se guardan tal cual. Si el navegador no sabe comprimir, o
 * comprimido no ocupa menos, el archivo se guarda sin comprimir.
 */
export async function zipCompressed(files, mime) {
  const entries = [];
  for (const f of files) {
    const data = bytesOf(f.data);
    const packed = f.deflate && data.length > 64 ? await deflateRaw(data) : null;
    entries.push(packed && packed.length < data.length
      ? { name: f.name, data, stored: packed, method: 8 }
      : { name: f.name, data, stored: data, method: 0 });
  }
  return build(entries, mime);
}
