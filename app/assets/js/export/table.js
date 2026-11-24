// Una tabla (cabecera y filas de textos) como archivo CSV o Excel.
import { formatNumber } from '../text.js';
import { toXlsx } from './xlsx.js';

/** Devuelve un Blob. `format`: 'csv' | 'xlsx'. `widths`: ancho de cada columna de Excel, en caracteres. */
export function tableBlob(format, sheetName, header, rows, widths = []) {
  if (format === 'xlsx') return toXlsx(sheetName, header, rows, widths);
  // Con coma decimal (lo habitual en español) las hojas de cálculo esperan «;» como separador.
  const sep = formatNumber(1.5).includes(',') ? ';' : ',';
  const quote = (value) => {
    const text = String(value == null ? '' : value);
    return /["\r\n;,]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const lines = [header, ...rows].map((row) => row.map(quote).join(sep));
  // La marca inicial (BOM) hace que Excel lea bien los acentos.
  return new Blob([String.fromCharCode(0xFEFF) + lines.join('\r\n') + '\r\n'], { type: 'text/csv;charset=utf-8' });
}
