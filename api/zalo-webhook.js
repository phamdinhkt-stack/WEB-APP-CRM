// /api/zalo-webhook — nhận sự kiện từ Zalo OA (cấu hình ở developers.zalo.me → ứng dụng → Webhook, bật "user_send_text").
// Admin nhắn cho OA: "ADMIN <ZALO_ADMIN_CODE>" → lưu Zalo user_id của admin để nhận thông báo khách mới.
// Mỗi lần admin nhắn OA cũng làm mới khung 7 ngày cho phép OA gửi tin tư vấn.
const crypto = require('crypto');
const { kv, kvReady, send, safeEq } = require('./_lib');
const { accessToken, sendCS } = require('./_zalo');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 200, { ok: true });
  const chunks = []; for await (const c of req) chunks.push(c); const raw = Buffer.concat(chunks).toString('utf8');
  let b = {}; try { b = JSON.parse(raw || '{}') } catch (e) { return send(res, 400, { error: 'bad json' }) }
  const oaSecret = process.env.ZALO_OA_SECRET_KEY;
  if (oaSecret) {
    const sig = String(req.headers['x-zevent-signature'] || '').replace(/^mac=/, '');
    const mac = crypto.createHash('sha256').update(String(b.app_id || '') + raw + String(b.timestamp || '') + oaSecret).digest('hex');
    if (!safeEq(sig, mac)) return send(res, 401, { error: 'bad signature' });
  }
  try {
    if (b.event_name === 'user_send_text' && b.sender && b.sender.id && kvReady()) {
      const uid = String(b.sender.id), text = String((b.message && b.message.text) || '').trim();
      const code = process.env.ZALO_ADMIN_CODE;
      const m = text.match(/^admin\s+(\S+)/i);
      if (m && code && safeEq(m[1], code)) {
        const list = JSON.parse((await kv('GET', 'zalo:admins')) || '[]'); if (!list.includes(uid)) list.push(uid);
        await kv('SET', 'zalo:admins', JSON.stringify(list));
        const t = await accessToken(); if (t) await sendCS(t, uid, '✅ Đã đăng ký nhận thông báo khách mới của SPA Nàng Ba. Nhắn "ok" cho OA ít nhất 1 lần mỗi tuần để không bị gián đoạn nhé.');
      }
      const admins = JSON.parse((await kv('GET', 'zalo:admins')) || '[]');
      if (admins.includes(uid)) await kv('SET', 'zalo:admin_seen:' + uid, String(Date.now()));
    }
  } catch (e) { console.error(e) }
  return send(res, 200, { ok: true });
};
