// Exportación de la línea temporal a CSV, JSON, Excel (XLSX) o Word (DOCX).
// Recibe las entradas ya preparadas por la página (lo que se ve en pantalla, en orden
// cronológico): [{ time, kind, type, title, chapter, elements: [{ type, name }], description, span }].
import { t, tn } from '../i18n.js';
import { store } from '../store.js';
import { formatDate, formatClock, formatNumber, parseLocal, downloadBlob, slugify } from '../text.js';
import { formDialog, toast, errorText } from '../ui.js';
import { toDocx } from './formats.js';
import { toXlsx } from './xlsx.js';

const unitText = (unit, n) => tn('unit.' + unit, n, { n: formatNumber(n) });
const hasTime = (time) => time.indexOf('T') > 0;
const dayOf = (time) => (hasTime(time) ? time.slice(0, time.indexOf('T')) : time);
const clockOf = (time) => (hasTime(time) ? formatClock(parseLocal(time)) : '');
/** «2 días» en la tabla; en el documento, la frase completa («Pasan 2 días»). */
const spanText = (span) => (span ? unitText(span.unit, span.count) : '');
/** El intervalo exacto: «1 día, 21 horas, 30 minutos». */
const spanExact = (span) => (span ? span.lines[0].map(([unit, n]) => unitText(unit, n)).join(', ') : '');

// «Escenas» va al final para no mover las demás columnas (los archivos antiguos se siguen leyendo).
const COLUMNS = ['date', 'time', 'type', 'title', 'belongs', 'chapter', 'description', 'since', 'sinceExact', 'scenes'];
const WIDTHS = [14, 9, 16, 34, 34, 22, 50, 16, 34, 26];
/** Escenas de un evento: «ES-003, ES-020 (se cuenta)». Sin paréntesis, el evento ocurre en ella. */
const scenesText = (e) => (e.scenes || []).map((s) => s.code + (s.mode === 'told' ? ` (${t('events.toldMark')})` : '')).join(', ');

function tableRows(entries) {
  return entries.map((e) => [
    formatDate(dayOf(e.time), { year: 'numeric', month: 'numeric', day: 'numeric' }),
    clockOf(e.time), e.type, e.title, e.elements.map((x) => x.name).join(', '), e.chapter, e.description,
    spanText(e.span), spanExact(e.span), scenesText(e),
  ]);
}

function toCsv(entries) {
  // Con coma decimal (lo habitual en español) las hojas de cálculo esperan «;» como separador.
  const sep = formatNumber(1.5).includes(',') ? ';' : ',';
  const quote = (value) => {
    const text = String(value == null ? '' : value);
    return /["\r\n;,]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const lines = [COLUMNS.map((c) => t('timeline.col.' + c)), ...tableRows(entries)].map((row) => row.map(quote).join(sep));
  // La marca inicial (BOM) hace que Excel lea bien los acentos.
  return new Blob(['﻿' + lines.join('\r\n') + '\r\n'], { type: 'text/csv;charset=utf-8' });
}

function toJson(entries, meta) {
  const data = {
    project: store.project.name,
    exported_at: new Date().toISOString(),
    following: meta.focus || null,
    entries: entries.map((e) => ({
      time: e.time,
      kind: e.kind,
      type: e.type,
      title: e.title,
      description: e.description,
      chapter: e.chapter || null,
      elements: e.elements,
      scenes: e.scenes && e.scenes.length ? e.scenes : undefined,
      since_previous: e.span ? { unit: e.span.unit, count: e.span.count, exact: e.span.lines[0].map(([unit, n]) => ({ unit, count: n })) } : null,
    })),
  };
  return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
}

function toDocument(entries, meta) {
  const p = store.project;
  const blocks = [{ t: 'title', text: p.name, author: p.author, subtitle: meta.focus ? `${t('nav.timeline')} · ${meta.focus}` : t('nav.timeline') }, { t: 'break' }];
  let lastDay = null;
  for (const e of entries) {
    const day = dayOf(e.time);
    if (e.span) blocks.push({ t: 'p', text: `— ${tn('timeline.passes', e.span.count, { span: unitText(e.span.unit, e.span.count) })} —` });
    if (day !== lastDay) {
      lastDay = day;
      blocks.push({ t: 'h3', text: formatDate(day, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) });
    }
    const clock = clockOf(e.time);
    blocks.push({ t: 'p', text: `${clock ? clock + ' — ' : ''}${e.title}`, bold: true });
    const detail = [e.type, e.chapter, e.elements.map((x) => x.name).join(', ')].filter(Boolean).join(' · ');
    if (detail) blocks.push({ t: 'p', text: detail });
    if (scenesText(e)) blocks.push({ t: 'p', text: `${t('timeline.col.scenes')}: ${scenesText(e)}` });
    if (e.description) blocks.push({ t: 'p', text: e.description });
  }
  return toDocx(blocks, { title: `${p.name} — ${t('nav.timeline')}`, author: p.author, lang: p.language, font: 'serif', size: 11, indent: false });
}

/** Construye el archivo en el formato pedido. Devuelve un Blob. */
export function buildTimelineFile(format, entries, meta = {}) {
  if (format === 'csv') return toCsv(entries);
  if (format === 'json') return toJson(entries, meta);
  if (format === 'xlsx') return toXlsx(t('nav.timeline'), COLUMNS.map((c) => t('timeline.col.' + c)), tableRows(entries), WIDTHS);
  return toDocument(entries, meta);
}

/** Pregunta el formato y descarga la línea temporal. */
export async function exportTimelineDialog(entries, meta = {}) {
  if (!entries.length) {
    toast(t('timeline.exportEmpty'), 'info');
    return;
  }
  const choice = await formDialog({
    title: t('timeline.exportTitle'),
    intro: tn('timeline.exportHint', entries.length),
    fields: [{
      name: 'format', label: t('export.format'), type: 'select', value: 'xlsx',
      options: [
        { value: 'xlsx', label: t('export.xlsx') },
        { value: 'csv', label: t('export.csv') },
        { value: 'docx', label: t('export.docx') },
        { value: 'json', label: t('export.json') },
      ],
    }],
    submitLabel: t('export.run'),
  });
  if (!choice) return;
  try {
    const base = `${slugify(store.project.name)}-${slugify(t('nav.timeline'))}`;
    downloadBlob(buildTimelineFile(choice.format, entries, meta), `${base}.${choice.format}`);
    toast(t('export.done'), 'success');
  } catch (err) {
    console.error(err);
    toast(errorText(err), 'error', 6000);
  }
}
