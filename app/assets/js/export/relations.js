// Exportación de las relaciones dibujadas en los mapas de «Relaciones» a un formato que se
// pueda leer: una tabla (Excel o CSV), un listado por elemento (Word o texto) o JSON.
import { t } from '../i18n.js';
import { store } from '../store.js';
import { downloadBlob, slugify } from '../text.js';
import { formDialog, toast, errorText } from '../ui.js';
import { allRelations, displayName, entityCode } from '../model.js';
import { toDocx } from './formats.js';
import { tableBlob } from './table.js';

const typeLabel = (node) => (node.entity ? t(node.entity.type + '.singular') : t('mindmap.text'));
const arrow = (e) => (e.both ? '↔' : '→');

/** Construye el archivo con las relaciones de los mapas dados (todos, si no se dice). Devuelve un Blob. */
export function buildRelationsFile(format, maps) {
  const { nodes, edges } = allRelations(maps);
  const byKey = new Map(nodes.map((n) => [n.key, n]));
  // De dónde sale cada relación: los mapas en los que está dibujada y las fichas en las que está apuntada.
  const sources = (e) => [...e.maps.map((m) => displayName(m)), ...(e.sheets || []).map((s) => t('rel.sheetOf', { name: displayName(s) }))];
  const rows = edges.map((e) => ({ a: byKey.get(e.a), b: byKey.get(e.b), label: e.label || t('mindmap.noLabel'), both: e.both, maps: sources(e) }));
  const p = store.project;
  if (format === 'csv' || format === 'xlsx') {
    const header = ['from', 'fromType', 'relation', 'direction', 'to', 'toType', 'maps'].map((k) => t('relexp.col.' + k));
    const lines = rows.map((r) => [r.a.label, typeLabel(r.a), r.label, t(r.both ? 'relexp.both' : 'relexp.oneWay'), r.b.label, typeLabel(r.b), r.maps.join(', ')]);
    return tableBlob(format, t('mindmap.plural'), header, lines, [30, 16, 30, 14, 30, 16, 28]);
  }
  if (format === 'json') {
    const item = (n) => ({ name: n.label, type: n.entity ? n.entity.type : 'text', id: n.entity ? entityCode(n.entity) : '' });
    const data = {
      creabel: 'relaciones', version: 1, project: p.name, exported_at: new Date().toISOString(),
      relations: rows.map((r) => ({ from: item(r.a), relation: r.label, reciprocal: r.both, to: item(r.b), maps: r.maps })),
    };
    return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  }
  // Texto y Word: cada elemento con sus relaciones, una por línea («→ madre de Álex Rey»).
  const sections = nodes.slice().sort((x, y) => x.label.localeCompare(y.label, undefined, { sensitivity: 'base' })).map((n) => ({
    title: n.label,
    lines: edges.filter((e) => e.a === n.key || e.b === n.key).map((e) => {
      const out = e.a === n.key;
      const other = byKey.get(out ? e.b : e.a);
      return `${e.both ? '↔' : out ? '→' : '←'} ${e.label || t('mindmap.noLabel')} ${other.label}  (${sources(e).join(', ')})`;
    }),
  }));
  if (format === 'txt') {
    const out = [`${p.name} — ${t('mindmap.plural')}`, ''];
    for (const r of rows) out.push(`${r.a.label} ${arrow(r)} ${r.label} ${arrow(r)} ${r.b.label}  (${r.maps.join(', ')})`);
    out.push('', '');
    for (const s of sections) out.push(`# ${s.title}`, ...s.lines, '');
    return new Blob([String.fromCharCode(0xFEFF) + out.join('\r\n').trim() + '\r\n'], { type: 'text/plain;charset=utf-8' });
  }
  const blocks = [{ t: 'title', text: p.name, author: p.author, subtitle: t('mindmap.plural') }, { t: 'break' }];
  for (const s of sections) {
    blocks.push({ t: 'h3', text: s.title });
    for (const line of s.lines) blocks.push({ t: 'p', text: line });
  }
  return toDocx(blocks, { title: `${p.name} — ${t('mindmap.plural')}`, author: p.author, lang: p.language, font: 'serif', size: 11, indent: false });
}

/** Pregunta el formato y descarga las relaciones: las de un mapa o, sin él, las de todos. */
export async function exportRelationsDialog(map) {
  // De un mapa, solo las suyas; sin mapa, las de todos y las apuntadas en las fichas.
  const maps = map ? [map] : undefined;
  const count = allRelations(maps).edges.length;
  if (!count) { toast(t('relexp.none'), 'info', 5000); return; }
  const choice = await formDialog({
    title: t('relexp.title'),
    intro: t(map ? 'relexp.hintMap' : 'relexp.hintAll', { n: count, name: map ? displayName(map) : '' }),
    fields: [{
      name: 'format', label: t('export.format'), type: 'select', value: 'docx',
      options: ['docx', 'txt', 'xlsx', 'csv', 'json'].map((f) => ({ value: f, label: t('export.' + f) })),
    }],
    submitLabel: t('export.run'),
  });
  if (!choice) return;
  try {
    await store.flush();
    const base = `${slugify(store.project.name)}-${slugify(map ? displayName(map) : t('mindmap.plural'))}`;
    downloadBlob(buildRelationsFile(choice.format, maps), `${base}.${choice.format}`);
    toast(t('export.done'), 'success');
  } catch (err) {
    console.error(err);
    toast(errorText(err), 'error', 6000);
  }
}
