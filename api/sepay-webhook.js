// /api/sepay-webhook — SePay gọi vào đây mỗi khi tài khoản nhận tiền.
// Cấu hình trên my.sepay.vn → Webhooks: URL https://<tên-miền>/api/sepay-webhook, xác thực "API Key" = SEPAY_API_KEY.
// Trả {"success": true} (HTTP 200) để SePay không gửi lại.
const { kv, kvReady, getJSON, setJSON, send, readBody, safeEq, vnd, esc, findCode, telegram, email } = require('./_lib');
const { zaloAdmin } = require('./_zalo');

function mailHtml(o) {
  const row = (a, b) => `<tr><td style="padding:6px 0;color:#7d6a60">${a}</td><td style="padding:6px 0;text-align:right">${b}</td></tr>`;
  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#3a2a22">
  <h2 style="color:#2f7d4f;margin:0 0 4px">CHÚC MỪNG BẠN ĐÃ ĐẶT LỊCH THÀNH CÔNG</h2>
  <p>SPA Nàng Ba đã nhận thanh toán <b>${vnd(o.pay.paidAmount)}</b> cho lịch hẹn <b>${o.code}</b>. Cảm ơn ${esc(o.xung || 'bạn')} ${esc(o.name)}!</p>
  <table style="width:100%;border-collapse:collapse;font-size:14px">
   ${row('Thời gian', `${o.time} – ${o.date.split('-').reverse().join('/')}`)}${row('Nhân viên', esc(o.staffName || 'Spa sắp xếp'))}
   ${o.items.map(i => row(esc(i.name) + ` <small>(${esc(i.duration)} · ${esc(i.pack)})</small>`, vnd(i.price))).join('')}
   ${o.products.map(p => row(esc(p.name) + ' × ' + p.qty, vnd(p.price * p.qty))).join('')}
   ${row('Tổng đơn', vnd(o.total))}${o.pay.discount ? row('Ưu đãi thanh toán trước', '−' + vnd(o.pay.discount)) : ''}${row('<b>Đã thanh toán</b>', `<b style="color:#3f6b4a">${vnd(o.pay.paidAmount)}</b>`)}
  </table>
  <p style="margin-top:16px">Vui lòng đến đúng giờ và đọc mã <b>${o.code}</b> khi check-in. Cần hỗ trợ: 0785 568 539 (điện thoại/Zalo).</p>
  <p style="color:#7d6a60;font-size:12px">SPA Nàng Ba · Beauty, Mom &amp; Baby Care</p></div>`;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { success: false, error: 'POST only' });
  const key = process.env.SEPAY_API_KEY || process.env.SEPAY_WEBHOOK_KEY;
  if (!key) return send(res, 503, { success: false, error: 'Chưa cấu hình SEPAY_API_KEY' });
  const auth = String(req.headers.authorization || '').replace(/^(Apikey|Bearer)\s+/i, '').trim();
  if (!safeEq(auth, key)) return send(res, 401, { success: false, error: 'Sai API key' });
  if (!kvReady()) return send(res, 503, { success: false, error: 'Chưa cấu hình kho dữ liệu' });
  const b = await readBody(req);
  if (!b || b.id === undefined || !(Number(b.transferAmount) > 0)) return send(res, 400, { success: false, error: 'Dữ liệu không hợp lệ' });
  try {
    if (b.transferType && b.transferType !== 'in') return send(res, 200, { success: true, ignored: 'transfer out' });
    const txKey = 'sepay:tx:' + b.id;
    if (await kv('GET', txKey)) return send(res, 200, { success: true, duplicate: true });
    const done = () => kv('SET', txKey, '1', 'EX', 60 * 60 * 24 * 60);
    const code = findCode(b.code) || findCode(b.content) || findCode(b.description);
    const o = code && await getJSON('order:' + code);
    if (!o) { await kv('LPUSH', 'sepay:unmatched', JSON.stringify({ at: Date.now(), ...b })); await kv('LTRIM', 'sepay:unmatched', 0, 199);
      telegram(['ketoan'], `⚠️ SePay nhận ${vnd(b.transferAmount)} không khớp đơn nào\nNội dung: ${esc(b.content || b.description || '')}\nMã GD: ${esc(b.referenceCode || b.id)}`).catch(() => {});
      await done(); return send(res, 200, { success: true, matched: false }); }
    const amt = Math.round(Number(b.transferAmount));
    o.pay = o.pay || { status: 'unpaid', received: 0, txs: [] };
    o.pay.received = (o.pay.received || 0) + amt;
    o.pay.txs = [...(o.pay.txs || []), { id: String(b.id), amount: amt, ref: String(b.referenceCode || ''), gateway: String(b.gateway || ''), at: String(b.transactionDate || new Date().toISOString()) }].slice(-10);
    const wasPaid = o.pay.status === 'paid';
    if (o.pay.received >= o.payAmount) {
      o.pay.status = 'paid'; o.pay.paidAmount = o.pay.received; o.pay.paidAt = Date.now();
      o.pay.discount = o.pay.received >= o.total ? 0 : o.total - o.payAmount; o.status = 'confirmed';
    } else o.pay.status = 'partial';
    o.updatedAt = Date.now();
    await setJSON('order:' + code, o); await kv('ZADD', 'orders_upd', o.updatedAt, code);
    if (o.pay.status === 'paid' && !wasPaid) {
      const mail = await email(o.email, `SPA Nàng Ba – Xác nhận thanh toán lịch hẹn ${code}`, mailHtml(o));
      o.pay.emailSent = !!mail.sent; await setJSON('order:' + code, o);
      await zaloAdmin(`✅ ĐÃ THANH TOÁN ${code} qua SePay\n👤 ${o.xung} ${o.name} · ${o.phone}\nNhận: ${vnd(o.pay.received)}${o.pay.discount ? ' (ưu đãi −' + vnd(o.pay.discount) + ')' : ''}\nLịch: ${o.time} ${o.date.split('-').reverse().join('/')}`, null).catch(() => {});
      await telegram(['thungan', 'ketoan', 'letan'], `✅ <b>Đã thanh toán ${code}</b> qua SePay\n${esc(o.xung)} ${esc(o.name)} · ${o.phone}\nNhận: <b>${vnd(o.pay.received)}</b>${o.pay.discount ? ` (ưu đãi −${vnd(o.pay.discount)})` : ''} · ${esc(b.gateway || '')} ${esc(b.referenceCode || '')}\nLịch: ${o.time} ${o.date.split('-').reverse().join('/')}${o.staffName ? ' · ' + esc(o.staffName) : ''}\n${o.email ? (mail.sent ? '📧 Đã gửi email xác nhận cho khách' : '📧 Chưa gửi được email') : 'Khách không để lại email – nhắn Zalo xác nhận'}`);
    } else if (o.pay.status === 'partial') {
      await telegram(['thungan', 'ketoan'], `ℹ️ ${code} nhận ${vnd(amt)}, còn thiếu ${vnd(o.payAmount - o.pay.received)} so với số cần thanh toán`);
    }
    await done();
    return send(res, 200, { success: true, matched: code, status: o.pay.status });
  } catch (e) { return send(res, 500, { success: false, error: e.message }); }
};
