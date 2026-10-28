import { formatDocument, formatPostalCode } from '@/utils/formatters';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function money(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value ?? 0));
}

function dateLabel(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Data não informada' : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date);
}

export function downloadInvoice(purchase = {}) {
  const quantity = purchase.quantity;
  const unitPrice = purchase.unit_price;
  const total = purchase.total_price;
  const category = purchase.category?.name;
  const party = purchase.counterparty;
  const address = party?.address;
  const addressLabel = address
    ? [address.street, address.number, address.complement, address.neighborhood, address.city, address.state, address.zip ? `CEP ${formatPostalCode(address.zip)}` : ''].filter(Boolean).join(' • ')
    : '';
  const partyDetails = party
    ? [party.legal_name, party.document_number ? `CNPJ ${formatDocument('CNPJ', party.document_number)}` : '', addressLabel, party.name, party.email, party.phone]
      .filter(Boolean).map((value) => `<div class="muted">${escapeHtml(value)}</div>`).join('')
    : '';
  const partyPanel = party
    ? `<div class="panel"><div class="label">${party.role === 'producer' ? 'Fornecedor' : 'Cliente'}</div><strong>${escapeHtml(party.trade_name || party.legal_name)}</strong>${partyDetails}<div class="muted">Dados atuais do cadastro.</div></div>`
    : '';
  const categoryLine = category ? `<div class="muted">Categoria: ${escapeHtml(category)}</div>` : '';
  const document = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Comprovante Cultiva #${escapeHtml(purchase.id)}</title><style>
    *{box-sizing:border-box}body{margin:0;background:#f8fafc;color:#0f172a;font:14px/1.6 Arial,sans-serif}.page{max-width:820px;margin:24px auto;background:#fff;box-shadow:0 12px 36px #0f172a18}.header{padding:36px 44px;background:#052e16;color:#fff;display:flex;justify-content:space-between;gap:24px}.brand{font-size:24px;font-weight:700}.tag{color:#86efac;font-size:11px;letter-spacing:.2em;text-transform:uppercase}.meta{text-align:right}.number{font-size:30px;font-weight:700}.status{padding:10px 44px;background:#f0fdf4;border-bottom:1px solid #e2e8f0;color:#15803d;font-weight:700;text-align:right}.content{padding:36px 44px}.panel{border:1px solid #e2e8f0;border-radius:14px;background:#fafafa;padding:18px;margin-bottom:24px}.label{font-size:10px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#15803d}.muted{color:#64748b}table{width:100%;border-collapse:collapse;margin:12px 0 28px}th{background:#052e16;color:#fff;text-align:left;padding:10px;font-size:10px;text-transform:uppercase}td{padding:12px 10px;border-bottom:1px solid #e2e8f0}th:last-child,td:last-child{text-align:right}.total{margin-left:auto;max-width:300px;padding:16px 20px;border-radius:12px;background:#052e16;color:#fff;display:flex;justify-content:space-between;font-size:18px;font-weight:700}.footer{border-top:1px solid #e2e8f0;padding:18px 44px;color:#64748b;font-size:11px}@media print{body{background:#fff}.page{margin:0;box-shadow:none}}</style></head><body><main class="page"><header class="header"><div><div class="brand">🌿 Cultiva</div><div class="tag">Comprovante de registro</div></div><div class="meta"><div class="tag">Registro</div><div class="number">#${escapeHtml(purchase.id)}</div><div>${escapeHtml(dateLabel(purchase.created_at))}</div></div></header><div class="status">Compra e venda registrada</div><section class="content">${partyPanel}<div class="panel"><div class="label">Produto</div><strong>${escapeHtml(purchase.product_name)}</strong>${categoryLine}</div><table><thead><tr><th>Produto</th><th>Quantidade</th><th>Preço unitário</th><th>Total</th></tr></thead><tbody><tr><td>${escapeHtml(purchase.product_name)}</td><td>${escapeHtml(quantity)} kg</td><td>${escapeHtml(money(unitPrice))}/kg</td><td>${escapeHtml(money(total))}</td></tr></tbody></table><div class="total"><span>Total</span><span>${escapeHtml(money(total))}</span></div></section><footer class="footer">Gerado com os dados de compra disponibilizados pela Cultiva. Este registro não é documento fiscal nem comprovação de pagamento.</footer></main><script>window.onload=()=>window.print()</script></body></html>`;
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) throw new Error('Permita pop-ups para imprimir o comprovante.');
  printWindow.document.open();
  printWindow.document.write(document);
  printWindow.document.close();
}
