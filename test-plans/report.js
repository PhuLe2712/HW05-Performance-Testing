function value(data, metric, stat) {
  const item = data.metrics && data.metrics[metric];
  return item && item.values ? item.values[stat] : null;
}

function commonRows(data) {
  return {
    http_reqs: value(data, 'http_reqs', 'count'),
    iterations: value(data, 'iterations', 'count'),
    failed_rate: value(data, 'http_req_failed', 'rate'),
    checks_passed: value(data, 'checks', 'rate'),
    http_req_avg_ms: value(data, 'http_req_duration', 'avg'),
    http_req_p95_ms: value(data, 'http_req_duration', 'p(95)'),
    http_req_max_ms: value(data, 'http_req_duration', 'max'),
  };
}

export function jsonReport(data) {
  return { 'reports/stress-summary.json': JSON.stringify({ metrics: commonRows(data), raw: data }, null, 2) };
}

export function htmlReport(data, title = 'Báo cáo tóm tắt Load Test') {
  const metrics = commonRows(data);
  const rows = Object.entries(metrics).map(([name, val]) => `<tr><th>${name}</th><td>${val ?? 'n/a'}</td></tr>`).join('');
  const html = `<!doctype html><html lang="vi"><meta charset="utf-8"><title>${title}</title><style>body{font-family:sans-serif;margin:2rem;}table{border-collapse:collapse;width:100%;max-width:600px;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background-color:#f4f4f4;}tr:nth-child(even){background-color:#fafafa;}</style><h1>${title}</h1><p>Được tạo tự động từ bản tóm tắt thực thi k6 thực tế.</p><table>${rows}</table></html>`;
  return { 'reports/load-summary.html': html };
}

export function markdownReport(data, output = 'reports/spike-summary.md', title = 'Báo cáo tóm tắt Spike Test') {
  const metrics = commonRows(data);
  const rows = Object.entries(metrics).map(([name, val]) => `| ${name} | ${val ?? 'n/a'} |`).join('\n');
  const markdown = `# ${title}\n\nĐược tạo tự động từ dữ liệu tóm tắt thực thi k6 thực tế sau lượt chạy kiểm thử.\n\n| Chỉ số (Metric) | Giá trị (Value) |\n|---|---:|\n${rows}\n`;
  return { [output]: markdown };
}
