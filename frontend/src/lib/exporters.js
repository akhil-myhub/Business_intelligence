// Browser-side file generation. Every exporter takes the same (meta, sections) and produces a real file.
import { fileName } from './reportBuilder';
import { aavtorSvg } from './aavtorMark';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function download(name, mime, content) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  Object.assign(document.createElement('a'), { href: url, download: name }).click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Spreadsheet formula injection: cells that start with = + - @ are treated as formulas by Excel.
const safeCell = v => (typeof v === 'string' && /^[=+@-]/.test(v) && Number.isNaN(Number(v)) ? `'${v}` : v);

function exportCsv(type, meta, sections) {
  const q = v => `"${String(safeCell(v)).replace(/"/g, '""')}"`;
  const lines = [`${q(meta.title)}`, q(meta.subtitle), q(`Generated ${meta.generatedAt}`)];
  for (const s of sections) lines.push('', q(s.title), s.columns.map(q).join(','), ...s.rows.map(r => r.map(q).join(',')));
  download(fileName(type, 'csv'), 'text/csv;charset=utf-8', '﻿' + lines.join('\r\n'));
}

// SpreadsheetML (.xls): opens natively in Excel/LibreOffice with one worksheet per section.
function exportExcel(type, meta, sections) {
  const cell = v => (typeof v === 'number' ? `<Cell><Data ss:Type="Number">${v}</Data></Cell>` : `<Cell><Data ss:Type="String">${esc(safeCell(v))}</Data></Cell>`);
  const sheets = sections.map(s => `<Worksheet ss:Name="${esc(s.title).slice(0, 31)}"><Table>`
    + `<Row><Cell><Data ss:Type="String">${esc(meta.title)} — ${esc(meta.subtitle)}</Data></Cell></Row><Row/>`
    + `<Row>${s.columns.map(c => `<Cell><Data ss:Type="String">${esc(c)}</Data></Cell>`).join('')}</Row>`
    + s.rows.map(r => `<Row>${r.map(cell).join('')}</Row>`).join('')
    + '</Table></Worksheet>').join('');
  download(fileName(type, 'xls'), 'application/vnd.ms-excel', `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">${sheets}</Workbook>`);
}

// PDF via the browser's print engine (Save as PDF): printed from a hidden iframe so the app stays untouched.
function exportPdf(type, meta, sections) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(meta.title)}</title><style>
    body{font:13px/1.45 system-ui,Segoe UI,Arial,sans-serif;color:#10224f;margin:28px}
    h1{margin:0 0 4px;font-size:22px}p.sub{margin:0 0 18px;color:#5d6f96}
    h2{font-size:15px;margin:22px 0 8px}table{border-collapse:collapse;width:100%}
    th{background:#e9eefc;text-align:left;padding:6px 8px;font-size:12px}td{padding:6px 8px;border-bottom:1px solid #e3e8f5}
    footer{margin-top:24px;color:#8a97b8;font-size:11px}
    .brand{display:flex;align-items:center;gap:10px;margin-bottom:18px;padding-bottom:12px;border-bottom:2px solid #246FB8}
    .brand b{font-size:15px}.brand span{color:#5d6f96;font-size:12px}
  </style></head><body><div class="brand">${aavtorSvg({ height: 34 })}<div><b>BusinessAI</b><br><span>by Aavtor</span></div></div><h1>${esc(meta.title)}</h1><p class="sub">${esc(meta.subtitle)}</p>`
    + sections.map(s => `<h2>${esc(s.title)}</h2><table><tr>${s.columns.map(c => `<th>${esc(c)}</th>`).join('')}</tr>${s.rows.map(r => `<tr>${r.map(v => `<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</table>`).join('')
    + `<footer>Generated ${esc(meta.generatedAt)} · BusinessAI by Aavtor</footer></body></html>`;
  const frame = document.createElement('iframe');
  Object.assign(frame.style, { position: 'fixed', right: '0', bottom: '0', width: '0', height: '0', border: '0' });
  frame.srcdoc = html;
  frame.onload = () => {
    frame.contentWindow.focus();
    frame.contentWindow.print();
    setTimeout(() => frame.remove(), 2000);
  };
  document.body.appendChild(frame);
}

// PowerPoint: a real .pptx (title slide + one slide per section). Loaded on demand — it's a large library.
async function exportPpt(type, meta, sections) {
  const { default: Pptx } = await import('pptxgenjs');
  const pptx = new Pptx();
  pptx.layout = 'LAYOUT_WIDE';
  const logo = await logoPng(240, '#ffffff'); // standard mark: navy petals, white network
  const title = pptx.addSlide();
  title.background = { color: '0B1530' };
  title.addShape(pptx.ShapeType.roundRect, { x: 0.7, y: 0.7, w: 1.1, h: 1.1, fill: { color: 'FFFFFF' }, rectRadius: 0.18, line: { color: 'FFFFFF' } });
  title.addImage({ data: logo, x: 0.92, y: 0.83, w: 0.66, h: 0.84 });
  title.addText('BusinessAI · by Aavtor', { x: 2, y: 1, w: 8, fontSize: 16, color: 'BFD0FF' });
  title.addText(meta.title, { x: 0.7, y: 2.4, w: 11.5, fontSize: 38, bold: true, color: 'FFFFFF' });
  title.addText(meta.subtitle, { x: 0.7, y: 3.5, w: 11.5, fontSize: 18, color: 'BFD0FF' });
  for (const s of sections) {
    const slide = pptx.addSlide();
    slide.addText(s.title, { x: 0.5, y: 0.3, w: 11, fontSize: 26, bold: true, color: '10224F' });
    slide.addImage({ data: logo, x: 12.45, y: 0.32, w: 0.4, h: 0.47 });
    const head = s.columns.map(c => ({ text: c, options: { bold: true, color: 'FFFFFF', fill: { color: '2A55FF' } } }));
    const body = s.rows.slice(0, 14).map(r => r.map(v => ({ text: String(v) })));
    slide.addTable([head, ...body], { x: 0.5, y: 1.2, w: 12.3, fontSize: 12, border: { type: 'solid', color: 'D5DCF0', pt: 0.5 } });
    if (s.rows.length > 14) slide.addText(`Showing 14 of ${s.rows.length} rows — export CSV for the full table.`, { x: 0.5, y: 7, fontSize: 11, color: '6B7AB0' });
  }
  await pptx.writeFile({ fileName: fileName(type, 'pptx') });
}

// Rasterise the vector mark for PowerPoint (PNG embeds reliably across Office versions).
async function logoPng(height, paper) {
  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(aavtorSvg({ height, paper }));
  await img.decode();
  const c = document.createElement('canvas');
  c.width = img.width; c.height = img.height;
  c.getContext('2d').drawImage(img, 0, 0);
  return c.toDataURL('image/png');
}

export const EXPORTERS = { CSV: exportCsv, Excel: exportExcel, PDF: exportPdf, PPT: exportPpt };
