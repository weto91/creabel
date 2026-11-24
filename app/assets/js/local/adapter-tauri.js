// Adaptador del motor local para la aplicación (Windows y Android):
//  - los datos, en una base SQLite (creabel.db) con dos tablas: `kv` (ajustes del dispositivo)
//    y `rows` (cada fila del motor como JSON, con su tabla, su id y su proyecto);
//  - los archivos (imágenes, planos, PDF), en la carpeta archivos/ de los datos de la
//    aplicación, con su nombre por contenido (creabel_<md5>.<ext>). Se enseñan en la página
//    con el protocolo de archivos de Tauri (convertFileSrc).
// Sin límite de tamaño más allá del disco del dispositivo.
import { tauri } from '../platform.js';

const DB = 'sqlite:creabel.db';
const DIR = 'archivos';

export function tauriAdapter() {
  const T = tauri();
  const invoke = (cmd, args) => T.core.invoke(cmd, args);
  const fs = T.fs;
  const baseDir = fs.BaseDirectory.AppLocalData;
  let filesDir = '';
  let sep = '/';
  const execute = (query, values = []) => invoke('plugin:sql|execute', { db: DB, query, values });
  const select = (query, values = []) => invoke('plugin:sql|select', { db: DB, query, values });

  return {
    autoAuth: true,

    async load() {
      await invoke('plugin:sql|load', { db: DB });
      await execute('CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT NOT NULL)');
      await execute('CREATE TABLE IF NOT EXISTS rows (tbl TEXT NOT NULL, id TEXT NOT NULL, pid TEXT NOT NULL DEFAULT \'\', json TEXT NOT NULL, PRIMARY KEY (tbl, id))');
      await execute('CREATE INDEX IF NOT EXISTS rows_pid ON rows (pid)');
      await fs.mkdir(DIR, { baseDir, recursive: true });
      filesDir = await T.path.join(await T.path.appLocalDataDir(), DIR);
      sep = filesDir.includes('\\') ? '\\' : '/';
      const kv = {};
      for (const r of await select('SELECT k, v FROM kv')) {
        try { kv[r.k] = JSON.parse(r.v); } catch (err) { /* valor ilegible: se ignora */ }
      }
      const rows = await select('SELECT tbl, json FROM rows');
      return { kv, rows };
    },

    async commit({ upserts, deletes, kv }) {
      // Por bloques: una sentencia con varias filas (cada una son 4 valores).
      for (let i = 0; i < upserts.length; i += 200) {
        const chunk = upserts.slice(i, i + 200);
        const values = [];
        const tuples = chunk.map((u, j) => {
          values.push(u.tbl, u.id, u.pid || '', u.json);
          const b = j * 4;
          return `($${b + 1}, $${b + 2}, $${b + 3}, $${b + 4})`;
        });
        await execute(`INSERT INTO rows (tbl, id, pid, json) VALUES ${tuples.join(', ')} ON CONFLICT (tbl, id) DO UPDATE SET pid = excluded.pid, json = excluded.json`, values);
      }
      for (const d of deletes) await execute('DELETE FROM rows WHERE tbl = $1 AND id = $2', [d.tbl, d.id]);
      for (const [k, v] of Object.entries(kv)) {
        await execute('INSERT INTO kv (k, v) VALUES ($1, $2) ON CONFLICT (k) DO UPDATE SET v = excluded.v', [k, JSON.stringify(v === undefined ? null : v)]);
      }
    },

    files: {
      has: (name) => fs.exists(`${DIR}/${name}`, { baseDir }),
      save: (name, bytes) => fs.writeFile(`${DIR}/${name}`, bytes, { baseDir }),
      read: (name) => fs.readFile(`${DIR}/${name}`, { baseDir }),
      remove: (name) => fs.remove(`${DIR}/${name}`, { baseDir }),
      url: (name) => T.core.convertFileSrc(filesDir + sep + name),
      list: async () => (await fs.readDir(DIR, { baseDir })).filter((e) => e.isFile).map((e) => e.name),
    },

    // La versión preliminar guardaba todo en el almacenamiento de la página: se pasa una vez.
    legacy: async () => {
      try { return JSON.parse(localStorage.getItem('creabel.mock') || 'null'); } catch (err) { return null; }
    },
    legacyDone: () => {
      try { localStorage.removeItem('creabel.mock'); } catch (err) { /* nada que hacer */ }
    },
  };
}
