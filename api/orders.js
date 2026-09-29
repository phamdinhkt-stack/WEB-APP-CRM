// /api/orders
//  POST  (website)  : lưu đơn đặt lịch, máy chủ tự tính lại tiền → trả về số tiền cần thanh toán.
//  GET ?code=&phone=: khách xem trạng thái thanh toán của đơn mình (trang phiếu đặt lịch tự hỏi mỗi 5 giây).
//  GET + X-CRM-Key  : phần mềm quản lý lấy các đơn mới / đơn vừa thanh toán (?since=mốc thời gian ms).
const { kv, kvReady, getJSON, setJSON, send, readBody, safeEq, cors, vnd, esc, normCode, telegram } = require('./_lib');
const { zaloAdmin } = require('./_zalo');
const { PACKAGES, SERVICES, DURATION_ADD, PACK_MULT, OIL_ADD, PRODUCTS, PAYNOW_PCT } = require('./_catalog');

const str = (v, n) => String(v ?? '').trim().slice(0, n);
async function flashPrices(req) {
  try {
    const host = req.headers['x-forwarded-host'] || req.headers.host; const proto = req.headers['x-forwarded-proto'] || 'https';
    const r = await fetch(`${proto}://${host}/flashsale.json`, { cache: 'no-store' }); if (!r.ok) return {};
    const f = await r.json(); const now = Date.now();
    if (!f || !f.active || (f.start && new Date(f.start).getTime() > now) || (f.end && new Date(f.end).getTime() < now)) return {};
    const m = {}; (f.items || []).forEach(i => { if (i && i.name && i.sale > 0) m[String(i.name).toLowerCase()] = Number(i.sale) }); return m;
  } catch (e) { return {} }
}
function pricedItems(items, flash) {
  return (Array.isArray(items) ? items : []).slice(0, 12).map(i => {
    const pk = PACKAGES[str(i.code, 8)]; if (pk) return { code: str(i.code, 8), name: pk.name, duration: pk.min + ' phút', pack: str(i.pack, 60) || 'Gói combo', oil: 'Không chọn', price: pk.price };
    const s = SERVICES[str(i.code, 8)]; if (!s) return null;
    const duration = str(i.duration, 20) || s.min + ' phút', pack = str(i.pack, 60) || 'Gói đơn buổi', oil = str(i.oil, 30) || 'Không chọn';
    let price;
    if (/^Flash sale/i.test(pack)) price = flash[s.name.toLowerCase()] || s.price;
    else price = s.price * (PACK_MULT[pack] || 1) + (duration === s.min + ' phút' ? 0 : (DURATION_ADD[duration] || 0)) + (OIL_ADD[oil] || 0);
    return { code: str(i.code, 8), name: s.name, duration, pack, oil, price };
  }).filter(Boolean);
}
function pricedProducts(list) {
  return (Array.isArray(list) ? list : []).slice(0, 20).map(p => { const c = PRODUCTS[str(p.id, 20)]; const qty = Math.max(1, Math.min(20, parseInt(p.qty) || 1)); return c ? { id: str(p.id, 20), name: c.name, qty, price: c.price } : null }).filter(Boolean);
}
const pub = o => ({ code: o.code, total: o.total, payAmount: o.payAmount, pct: PAYNOW_PCT, pay: o.pay, status: o.status });

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  if (!kvReady()) return send(res, 503, { error: 'Máy chủ chưa cấu hình kho dữ liệu (Upstash Redis).' });
  try {
    if (req.method === 'POST') {
      const b = await readBody(req); if (!b || typeof b !== 'object') return send(res, 400, { error: 'Dữ liệu không hợp lệ' });
      const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
      const rk = `rl:${ip}:${new Date().toISOString().slice(0, 13)}`; const n = await kv('INCR', rk); if (n === 1) await kv('EXPIRE', rk, 3600);
      if (n > 30) return send(res, 429, { error: 'Quá nhiều yêu cầu, vui lòng thử lại sau.' });
      const code = normCode(b.code); const phone = String(b.phone || '').replace(/\D/g, '');
      if (!/^HM\d{6}[A-Z0-9]{4}$/.test(code)) return send(res, 400, { error: 'Mã đơn không hợp lệ' });
      if (!str(b.name, 80) || phone.length < 9 || phone.length > 11) return send(res, 400, { error: 'Thiếu họ tên hoặc số điện thoại' });
      if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date || '') || !/^\d{2}:\d{2}$/.test(b.time || '')) return send(res, 400, { error: 'Thời gian không hợp lệ' });
      const items = pricedItems(b.items, await flashPrices(req)); if (!items.length) return send(res, 400, { error: 'Chưa có dịch vụ hợp lệ' });
      const products = pricedProducts(b.products);
      const total = items.reduce((a, i) => a + i.price, 0) + products.reduce((a, p) => a + p.price * p.qty, 0);
      const payAmount = Math.round(total * (100 - PAYNOW_PCT) / 100 / 1000) * 1000;
      const now = Date.now();
      const o = { id: 'web_' + code, code, xung: str(b.xung, 10), name: str(b.name, 80), phone, email: str(b.email, 120), birthday: str(b.birthday, 10), address: str(b.address, 200), notes: str(b.notes, 500),
        date: b.date, time: b.time, duration: Math.max(15, Math.min(600, parseInt(b.duration) || 60)), staffId: str(b.staffId, 20), staffName: str(b.staffName, 40),
        items, products, total, payAmount, clientTotal: Number(b.total) || 0, status: 'new', pay: { status: 'unpaid', received: 0, txs: [] }, createdAt: now, updatedAt: now };
      const ok = await kv('SET', 'order:' + code, JSON.stringify(o), 'NX'); if (!ok) return send(res, 409, { error: 'Mã đơn đã tồn tại' });
      await kv('ZADD', 'orders_upd', now, code);
      zaloAdmin(`🗓 LỊCH ĐẶT ONLINE MỚI ${code}\n👤 ${o.xung} ${o.name}\n📞 ${phone}\n🕒 ${o.time} ${o.date.split('-').reverse().join('/')}${o.staffName ? ' · ' + o.staffName : ''}\n${items.map(i => '• ' + i.name + ' (' + vnd(i.price) + ')').join('\n')}${products.length ? '\n' + products.map(p => '• ' + p.name + ' × ' + p.qty).join('\n') : ''}\nTổng: ${vnd(total)}${o.notes ? '\nGhi chú: ' + o.notes : ''}`, { ten_khach: o.name.slice(0, 30), sdt_khach: phone, noi_dung: ('Đặt lịch ' + items.map(i => i.name).join(', ')).slice(0, 90), thoi_gian: o.time + ' ' + o.date.split('-').reverse().join('/') }).catch(() => {});
      telegram(['letan'], `🗓 <b>Lịch đặt online mới ${code}</b>\n${esc(o.xung)} ${esc(o.name)} · ${phone}\n${o.time} ${o.date.split('-').reverse().join('/')}${o.staffName ? ' · ' + esc(o.staffName) : ''}\n${items.map(i => '• ' + esc(i.name) + ' (' + vnd(i.price) + ')').join('\n')}${products.length ? '\n' + products.map(p => '• ' + esc(p.name) + ' × ' + p.qty).join('\n') : ''}\nTổng: <b>${vnd(total)}</b>${o.notes ? '\nGhi chú: ' + esc(o.notes) : ''}`).catch(() => {});
      return send(res, 201, { ok: true, ...pub(o) });
    }
    if (req.method === 'GET') {
      const q = new URL(req.url, 'http://x').searchParams;
      const key = process.env.CRM_SYNC_KEY;
      if (req.headers['x-crm-key'] !== undefined) {
        if (!key || !safeEq(req.headers['x-crm-key'], key)) return send(res, 401, { error: 'Sai khóa kết nối CRM' });
        const since = Number(q.get('since')) || 0;
        const codes = await kv('ZRANGEBYSCORE', 'orders_upd', '(' + since, '+inf', 'LIMIT', 0, 200);
        const list = codes && codes.length ? (await kv('MGET', ...codes.map(c => 'order:' + c))).map(v => { try { return JSON.parse(v) } catch (e) { return null } }).filter(Boolean) : [];
        return send(res, 200, { orders: list, now: Date.now() });
      }
      const code = normCode(q.get('code')); const phone = String(q.get('phone') || '').replace(/\D/g, '');
      const o = code && await getJSON('order:' + code);
      if (!o || o.phone !== phone) return send(res, 404, { error: 'Không tìm thấy đơn' });
      return send(res, 200, pub(o));
    }
    return send(res, 405, { error: 'Method not allowed' });
  } catch (e) { return send(res, e.status || 500, { error: e.message || 'Lỗi máy chủ' }); }
};
