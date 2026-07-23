export const printReport = (title: string, subtitle: string, rows: Array<{ label: string; value: string | number }>, table?: { headers: string[]; rows: Array<Array<string | number>> }) => {
  const reportWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!reportWindow) {
    alert("Não foi possível abrir a janela do relatório. Verifique o bloqueador de pop-up.");
    return;
  }
  const generatedAt = new Date().toLocaleString("pt-BR");
  const tableHtml = table ? `<table><thead><tr>${table.headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead><tbody>${table.rows.map((row) => `<tr>${row.map((value) => `<td>${value}</td>`).join("")}</tr>`).join("")}</tbody></table>` : "";
  reportWindow.document.write(`<!doctype html><html lang="pt-BR"><head><title>${title}</title><style>body{font-family:Arial,sans-serif;color:#102a56;margin:36px}h1{margin:0;font-size:24px}p{color:#52657f}.meta{font-size:12px;color:#52657f;margin:18px 0}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.item{border:1px solid #b8c5d8;border-radius:8px;padding:14px}.label{font-size:12px;text-transform:uppercase;color:#52657f;font-weight:700}.value{font-size:24px;font-weight:700;margin-top:6px}table{width:100%;border-collapse:collapse;margin-top:24px;font-size:12px}th,td{border:1px solid #b8c5d8;padding:8px;text-align:left}th{background:#eaf1fb;color:#102a56}@media print{body{margin:18px}}</style></head><body><h1>${title}</h1><p>${subtitle}</p><div class="meta">Gerado em ${generatedAt} · GSI / CNC</div><div class="grid">${rows.map((row) => `<div class="item"><div class="label">${row.label}</div><div class="value">${row.value}</div></div>`).join("")}</div>${tableHtml}<script>window.onload=()=>window.print();</script></body></html>`);
  reportWindow.document.close();
};
