// Minimal single-page PDF writer for quote and invoice downloads.
const clean = (text) => String(text).replace(/₹\s?/g, 'Rs. ').replace(/[^\x20-\x7e]/g, '-').replace(/([\\()])/g, '\\$1');

export function textPdf(title, lines) {
  const body = [
    'BT', '/F2 20 Tf', '50 780 Td', `(${clean(title)}) Tj`, '/F1 12 Tf', '0 -34 Td', '18 TL',
    ...lines.map((line) => `(${clean(line)}) Tj T*`), 'ET',
  ].join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 6 0 R /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    `<< /Length ${body.length} >>\nstream\n${body}\nendstream`,
  ];
  let out = '%PDF-1.4\n';
  const offsets = objects.map((object, index) => {
    const offset = out.length;
    out += `${index + 1} 0 obj\n${object}\nendobj\n`;
    return offset;
  });
  const xref = out.length;
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((offset) => { out += `${String(offset).padStart(10, '0')} 00000 n \n`; });
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new Blob([out], { type: 'application/pdf' });
}
