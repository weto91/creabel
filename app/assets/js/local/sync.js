// Sincronización de proyectos entre dispositivos, por un «destino» compartido: un servidor
// WebDAV (el NAS, Nextcloud…), el PC emparejado por QR o, en el propio PC, la carpeta que
// comparte con el móvil. A todos se les habla igual (ver transports.js) y se guarda lo mismo:
//
//   <raíz>/proyectos/<id>/info.json                 nombre, palabras… (para verlo antes de traerlo)
//   <raíz>/proyectos/<id>/cambios/<marca>.json      lo que cambió un dispositivo en un envío
//   <raíz>/proyectos/<id>/instantaneas/<marca>.json todo el proyecto, resumido
//   <raíz>/proyectos/<id>/archivos/creabel_<md5>.<ext>
//
// Cada dispositivo solo escribe archivos nuevos con su propia marca (nunca toca los de otro al
// escribir), así que da igual el orden en que lleguen: el motor junta campo a campo (ver
// engine.js). Cuando se acumulan muchos, uno de ellos los resume en una instantánea y borra
// los que ha resumido.
const enc = new TextEncoder();
const dec = new TextDecoder();
const COMPACT_AT = 40; // archivos de cambios a partir de los cuales se resume

const stateKey = (target, pid) => `sync:${target}:${pid}`;
const isJson = (f) => !f.dir && /\.json$/.test(f.name);

/**
 * Sincroniza un proyecto con un destino. `engine` es el motor local; `transport`, el destino;
 * `target`, su nombre (para recordar qué se ha enviado y recibido). Devuelve un resumen.
 */
export async function syncProject(engine, transport, target, pid) {
  const base = `proyectos/${pid}`;
  const st = engine.kvGet(stateKey(target, pid)) || { published: '', applied: [] };
  const applied = new Set(st.applied || []);
  const result = { pid, sent: 0, received: 0, merged: 0, files: 0 };

  // 1. Lo que hay en el destino.
  const changes = (await transport.list(`${base}/cambios`)).filter(isJson).map((f) => 'cambios/' + f.name);
  const snaps = (await transport.list(`${base}/instantaneas`)).filter(isJson).map((f) => 'instantaneas/' + f.name);
  const remoteFiles = new Set((await transport.list(`${base}/archivos`)).filter((f) => !f.dir).map((f) => f.name));
  const present = new Set([...changes, ...snaps]);
  // El destino ya no tiene nada de lo que se le envió (se ha vaciado la carpeta, o es otro
  // servidor con la misma configuración): se vuelve a enviar todo el proyecto.
  if (!changes.length && !snaps.length && (st.published || applied.size)) {
    st.published = '';
    applied.clear();
  }

  // 2. Enviar lo cambiado aquí desde el último envío (antes de recibir: así no se reenvía lo
  //    que se va a recibir ahora).
  const out = await engine.syncCollect(pid, st.published || '');
  if (out.count) {
    for (const name of out.files) {
      if (remoteFiles.has(name) || !(await engine.files.has(name))) continue;
      await transport.put(`${base}/archivos/${name}`, await engine.files.read(name));
      remoteFiles.add(name);
      result.files++;
    }
    const name = `cambios/${out.mark}.json`;
    await transport.put(`${base}/${name}`, enc.encode(JSON.stringify({ format: 'creabel-sync', version: 1, project: pid, from: engine.device, ...out.pack })));
    applied.add(name);
    present.add(name);
    result.sent = out.count;
  }
  const localBefore = engine.localMark();

  // 3. Recibir lo que falta, las instantáneas primero y en el orden de sus marcas.
  const pending = [...snaps.sort(), ...changes.sort()].filter((n) => !applied.has(n));
  for (const name of pending) {
    const bytes = await transport.get(`${base}/${name}`);
    if (!bytes) continue; // lo ha resumido otro dispositivo mientras tanto
    let pack;
    try { pack = JSON.parse(dec.decode(bytes)); } catch (err) { applied.add(name); continue; }
    // Los archivos que nombra, antes de juntar: así las imágenes se ven en cuanto aparecen.
    for (const img of pack.images || []) {
      const file = img.filename;
      if (!file || !remoteFiles.has(file) || (await engine.files.has(file))) continue;
      const data = await transport.get(`${base}/archivos/${file}`);
      if (data) { await engine.files.save(file, data); result.files++; }
    }
    const merged = await engine.syncMerge(pid, pack);
    if (merged.missingProject) continue; // llegará antes el paquete con el proyecto; se reintenta
    result.merged += merged.changed;
    applied.add(name);
    result.received++;
  }
  // Lo recibido no hace falta reenviarlo a este mismo destino (si aquí no se ha tocado nada
  // mientras tanto): se da por enviado.
  st.published = engine.localMark() === localBefore ? engine.mark() : out.mark || st.published;

  // 4. Resumen para quien vea el proyecto desde otro dispositivo.
  const info = engine.projectInfo(pid);
  if (info) await transport.put(`${base}/info.json`, enc.encode(JSON.stringify(info)));

  // 5. Resumir si se han acumulado muchos cambios.
  const ownList = [...present].filter((n) => applied.has(n));
  if (ownList.length > COMPACT_AT && info) {
    const all = await engine.syncCollect(pid, '');
    const snap = `instantaneas/${all.mark}.json`;
    await transport.put(`${base}/${snap}`, enc.encode(JSON.stringify({ format: 'creabel-sync', version: 1, project: pid, from: engine.device, snapshot: true, ...all.pack })));
    for (const name of ownList) {
      try { await transport.del(`${base}/${name}`); } catch (err) { /* otro dispositivo ya lo ha borrado */ }
      applied.delete(name);
    }
    applied.add(snap);
    present.add(snap);
  }

  // Se olvidan los nombres que ya no existen en el destino.
  st.applied = [...applied].filter((n) => present.has(n));
  st.last = new Date().toISOString();
  await engine.kvSet(stateKey(target, pid), st);
  return result;
}

/** Identificadores de los proyectos que hay en un destino (sin descargar nada más). */
export async function remoteProjectIds(transport) {
  return (await transport.list('proyectos')).filter((f) => f.dir).map((f) => f.name);
}

/** Proyectos que hay en un destino: [{ id, name, author, words, chapters, deleted }]. */
export async function remoteProjects(transport) {
  const out = [];
  for (const dir of (await transport.list('proyectos')).filter((f) => f.dir)) {
    const bytes = await transport.get(`proyectos/${dir.name}/info.json`);
    if (!bytes) continue;
    try { out.push({ ...JSON.parse(dec.decode(bytes)), id: dir.name }); } catch (err) { /* resumen ilegible */ }
  }
  return out;
}
