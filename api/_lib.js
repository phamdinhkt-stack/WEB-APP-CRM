// Tiện ích dùng chung cho các hàm máy chủ (Vercel Serverless Functions, Node 18+).
const crypto = require('crypto');

/* ---------- Kho dữ liệu: Upstash Redis (Vercel Marketplace → Upstash) qua REST ---------- */
const MEM = new Map(); // chỉ dùng khi chạy thử (KV_MOCK=1)
// Vercel có thể đặt tiền tố tùy chọn khi Connect (VD STORAGE_KV_REST_API_URL) hoặc chỉ tạo REDIS_URL/KV_URL.
function kvConf() {
  const env = process.env, keys = Object.keys(env);
  const find = sfx => env[sfx] || env[keys.find(k => k.endsWith('_' + sfx) && env[k])];
  let url = find('KV_REST_API_URL') || find('UPSTASH_REDIS_REST_URL');
  let token = find('KV_REST_API_TOKEN') || find('UPSTASH_REDIS_REST_TOKEN');
  if (!url || !token) { // rediss://default:<token>@<host>:6379 → REST https://<host>, cùng token (Upstash)
    const m = String(find('REDIS_URL') || find('KV_URL') || '').match(/^rediss?:\/\/[^:]*:([^@]+)@([^:/]+)/);
    if (m && /upstash\.io$/.test(m[2])) { url = 'https://' + m[2]; token = decodeURIComponent(m[1]); }
  }
  return url && token ? { url: url.replace(/\/$/, ''), token } : null;
}
const kvReady = () => !!(process.env.KV_MOCK || kvConf());
async function kv(...cmd) {
  if (process.env.KV_MOCK) return memKv(cmd);
  const c = kvConf();
  if (!c) throw Object.assign(new Error('KV chưa cấu hình'), { status: 503 });
  const r = await fetch(c.url, { method: 'POST', headers: { Authorization: `Bearer ${c.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(cmd.map(String)) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error('KV: ' + (j.error || r.status));
  return j.result;
}
function memKv([op, k, ...a]) {
  op = op.toUpperCase();
  if (op === 'GET') return MEM.has(k) ? MEM.get(k) : null;
  if (op === 'SET') { if (a.includes('NX') && MEM.has(k)) return null; MEM.set(k, a[0]); return 'OK'; }
  if (op === 'INCR') { const v = Number(MEM.get(k) || 0) + 1; MEM.set(k, String(v)); return v; }
  if (op === 'EXPIRE') return 1;
  if (op === 'ZADD') { const z = MEM.get(k) || new Map(); z.set(a[1], Number(a[0])); MEM.set(k, z); return 1; }
  if (op === 'ZRANGEBYSCORE') { const z = MEM.get(k) || new Map(); const min = a[0].startsWith('(') ? Number(a[0].slice(1)) + 1e-9 : Number(a[0]); return [...z].filter(([, s]) => s >= min).sort((x, y) => x[1] - y[1]).map(([m]) => m).slice(0, 200); }
  if (op === 'MGET') return [k, ...a].map(x => (MEM.has(x) ? MEM.get(x) : null));
  if (op === 'LPUSH') { const l = MEM.get(k) || []; l.unshift(a[0]); MEM.set(k, l); return l.length; }
  if (op === 'LTRIM') return 'OK';
  throw new Error('mock op ' + op);
}
const getJSON = async k => { const v = await kv('GET', k); try { return v ? JSON.parse(v) : null } catch (e) { return null } };
const setJSON = (k, v) => kv('SET', k, JSON.stringify(v));

/* ---------- HTTP ---------- */
function send(res, status, body) { res.statusCode = status; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(body)); }
async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') { try { return JSON.parse(req.body) } catch (e) { return null } }
  const chunks = []; for await (const c of req) chunks.push(c);
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || 'null') } catch (e) { return null }
}
function safeEq(a, b) { const x = Buffer.from(String(a || '')), y = Buffer.from(String(b || '')); return x.length === y.length && x.length > 0 && crypto.timingSafeEqual(x, y); }
function cors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-CRM-Key');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return true }
  return false;
}
const vnd = n => new Intl.NumberFormat('vi-VN').format(Math.round(n || 0)) + 'đ';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Mã đơn HM + yymmdd + 4 ký tự; ngân hàng có thể bỏ dấu gạch hoặc chèn khoảng trắng.
function findCode(text) { const m = String(text || '').toUpperCase().match(/HM\s?(\d{6})\s?-?\s?([A-Z0-9]{4})/); return m ? 'HM' + m[1] + m[2] : null; }
const normCode = c => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

/* ---------- Thông báo ---------- */
// Telegram: mỗi bộ phận một nhóm chat. Thiếu biến nào thì dùng TELEGRAM_CHAT_ID chung.
async function telegram(depts, text) {
  const token = process.env.TELEGRAM_BOT_TOKEN; if (!token) return [];
  const ids = [...new Set(depts.map(d => process.env['TELEGRAM_CHAT_' + d.toUpperCase()] || process.env.TELEGRAM_CHAT_ID).filter(Boolean))];
  const out = [];
  for (const chat_id of ids) {
    try { const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id, text, parse_mode: 'HTML', disable_web_page_preview: true }) }); out.push({ chat_id, ok: r.ok }); }
    catch (e) { out.push({ chat_id, ok: false }); }
  }
  return out;
}
// Email cho khách qua Resend (cần RESEND_API_KEY và RESEND_FROM là địa chỉ thuộc tên miền đã xác minh).
async function email(to, subject, html) {
  const key = process.env.RESEND_API_KEY, from = process.env.RESEND_FROM;
  if (!key || !from || !to) return { sent: false };
  try { const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from, to: [to], subject, html }) }); return { sent: r.ok }; }
  catch (e) { return { sent: false }; }
}
module.exports = { kv, kvReady, getJSON, setJSON, send, readBody, safeEq, cors, vnd, esc, findCode, normCode, telegram, email };
