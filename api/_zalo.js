// Gửi tin Zalo cho admin qua Zalo Official Account (OA) của spa.
// Cách 1 (miễn phí): tin "Tư vấn" OA → tài khoản Zalo của admin. Admin phải quan tâm OA và nhắn cho OA
//   ít nhất 1 lần trong 7 ngày gần nhất (Zalo chỉ cho OA gửi tin tư vấn trong khung đó; 48 giờ đầu miễn phí).
//   Mẹo: admin nhắn "ADMIN <ZALO_ADMIN_CODE>" để đăng ký, sau đó thỉnh thoảng nhắn "ok" để giữ khung 7 ngày.
// Cách 2 (tính phí, không cần giữ khung): ZNS gửi theo số điện thoại admin bằng mẫu tin đã được Zalo duyệt.
const { kv, kvReady } = require('./_lib');

async function accessToken() {
  const appId = process.env.ZALO_APP_ID, secret = process.env.ZALO_APP_SECRET;
  let t = kvReady() ? await kv('GET', 'zalo:tokens').then(v => v ? JSON.parse(v) : null).catch(() => null) : null;
  if (t && t.access && t.exp > Date.now() + 60000) return t.access;
  const refresh = (t && t.refresh) || process.env.ZALO_REFRESH_TOKEN;
  if (!appId || !secret || !refresh) return process.env.ZALO_ACCESS_TOKEN || null;
  const r = await fetch('https://oauth.zaloapp.com/v4/oa/access_token', {
    method: 'POST', headers: { secret_key: secret, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ refresh_token: refresh, app_id: appId, grant_type: 'refresh_token' }).toString(),
  });
  const j = await r.json().catch(() => ({}));
  if (!j.access_token) { console.error('Zalo refresh lỗi', j); return process.env.ZALO_ACCESS_TOKEN || null; }
  t = { access: j.access_token, refresh: j.refresh_token || refresh, exp: Date.now() + (Number(j.expires_in) || 90000) * 1000 };
  if (kvReady()) await kv('SET', 'zalo:tokens', JSON.stringify(t)); // refresh token chỉ dùng được 1 lần → phải lưu cái mới
  return t.access;
}
async function adminIds() {
  const ids = String(process.env.ZALO_ADMIN_USER_ID || '').split(',').map(s => s.trim()).filter(Boolean);
  if (kvReady()) { try { const v = await kv('GET', 'zalo:admins'); if (v) JSON.parse(v).forEach(x => ids.includes(x) || ids.push(x)); } catch (e) {} }
  return ids;
}
async function sendCS(token, userId, text) {
  const r = await fetch('https://openapi.zalo.me/v3.0/oa/message/cs', {
    method: 'POST', headers: { access_token: token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipient: { user_id: userId }, message: { text: text.slice(0, 2000) } }),
  });
  const j = await r.json().catch(() => ({})); return { ok: j.error === 0, error: j.error, message: j.message };
}
async function sendZNS(token, phone, data) {
  const tpl = process.env.ZALO_ZNS_TEMPLATE_ID; if (!tpl || !phone) return null;
  const p = String(phone).replace(/\D/g, '').replace(/^0/, '84');
  const r = await fetch('https://business.openapi.zalo.me/message/template', {
    method: 'POST', headers: { access_token: token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: p, template_id: tpl, template_data: data, tracking_id: 'hm' + Date.now() }),
  });
  const j = await r.json().catch(() => ({})); return { ok: j.error === 0, error: j.error, message: j.message };
}
// text: nội dung đầy đủ (tin tư vấn). zns: {ten_khach, sdt_khach, noi_dung, thoi_gian} cho mẫu ZNS.
async function zaloAdmin(text, zns) {
  const out = [];
  try {
    const token = await accessToken(); if (!token) return out;
    for (const id of await adminIds()) out.push({ to: id, ...(await sendCS(token, id, text)) });
    if (process.env.ZALO_ADMIN_PHONE && zns) out.push({ to: 'zns', ...(await sendZNS(token, process.env.ZALO_ADMIN_PHONE, zns)) });
  } catch (e) { out.push({ ok: false, message: e.message }); }
  if (out.length && kvReady()) kv('SET', 'zalo:last', JSON.stringify({ at: Date.now(), out })).catch(() => {});
  return out;
}
module.exports = { zaloAdmin, accessToken, sendCS };
