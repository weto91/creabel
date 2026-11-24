// Libro de Excel (.xlsx) con una sola hoja de texto: fila de cabecera en negrita y fija, y
// celdas que ajustan el texto. Sin dependencias: un .xlsx es un ZIP de archivos XML.
import { zip } from './zip.js';

const NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const HEAD = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';

/** Escapa texto para XML y quita los caracteres de control que Excel no admite. */
function x(text) {
  return String(text == null ? '' : text)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Letras de una columna a partir de su índice: 0 -> A, 25 -> Z, 26 -> AA. */
function column(index) {
  let out = '';
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) out = String.fromCharCode(65 + ((n - 1) % 26)) + out;
  return out;
}

/**
 * header: títulos de las columnas; rows: filas de textos; widths: ancho de cada columna (en
 * caracteres). Devuelve un Blob.
 */
export function toXlsx(sheetName, header, rows, widths = []) {
  const cell = (value, col, row, style) => `<c r="${column(col)}${row}" t="inlineStr" s="${style}"><is><t xml:space="preserve">${x(value)}</t></is></c>`;
  const line = (values, row, style) => `<row r="${row}">${values.map((v, i) => cell(v, i, row, style)).join('')}</row>`;
  const cols = header.map((_, i) => `<col min="${i + 1}" max="${i + 1}" width="${widths[i] || 18}" customWidth="1"/>`).join('');
  const sheet = `${HEAD}<worksheet xmlns="${NS}"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${cols}</cols><sheetData>${line(header, 1, 1)}${rows.map((r, i) => line(r, i + 2, 2)).join('')}</sheetData></worksheet>`;

  // Estilos: 0 = normal, 1 = cabecera en negrita, 2 = texto ajustado y alineado arriba.
  const styles = `${HEAD}<styleSheet xmlns="${NS}"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf></cellXfs></styleSheet>`;

  // El nombre de una hoja admite 31 caracteres como mucho y no puede llevar [ ] : * ? / \
  const name = String(sheetName || 'Hoja1').replace(/[[\]:*?/\\]/g, ' ').slice(0, 31) || 'Hoja1';
  return zip([
    { name: '[Content_Types].xml', data: `${HEAD}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>` },
    { name: '_rels/.rels', data: `${HEAD}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${REL}/officeDocument" Target="xl/workbook.xml"/></Relationships>` },
    { name: 'xl/workbook.xml', data: `${HEAD}<workbook xmlns="${NS}" xmlns:r="${REL}"><sheets><sheet name="${x(name)}" sheetId="1" r:id="rId1"/></sheets></workbook>` },
    { name: 'xl/_rels/workbook.xml.rels', data: `${HEAD}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${REL}/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="${REL}/styles" Target="styles.xml"/></Relationships>` },
    { name: 'xl/worksheets/sheet1.xml', data: sheet },
    { name: 'xl/styles.xml', data: styles },
  ], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}
