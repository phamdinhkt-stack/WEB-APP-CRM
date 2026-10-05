// /api/chat — Chatbot tư vấn của SPA Nàng Ba (dùng Claude qua Anthropic API).
// Cần biến ANTHROPIC_API_KEY trên Vercel. Tuỳ chọn: ANTHROPIC_MODEL (mặc định claude-haiku-4-5).
// Khi khách để lại số điện thoại, lưu thành "lead" để phần mềm quản lý (Lễ tân) gọi lại.
const { kv, kvReady, send, readBody, cors, vnd, esc, telegram } = require('./_lib');
const { zaloAdmin } = require('./_zalo');
const vnTime = () => new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
const { PACKAGES, SERVICES, PRODUCTS, PAYNOW_PCT } = require('./_catalog');

async function flashText(req) {
  try {
    const host = req.headers['x-forwarded-host'] || req.headers.host; const proto = req.headers['x-forwarded-proto'] || 'https';
    const r = await fetch(`${proto}://${host}/flashsale.json`, { cache: 'no-store' }); if (!r.ok) return 'Hiện không có Flash sale.';
    const f = await r.json(); const now = Date.now();
    if (!f.active || (f.start && new Date(f.start) > now) || (f.end && new Date(f.end) < now)) return 'Hiện không có Flash sale.';
    return `Đang có Flash sale "${f.title}" đến ${String(f.end).replace('T', ' ')}: ` + (f.items || []).map(i => `${i.name} còn ${vnd(i.sale)} (giá gốc ${vnd(i.price)}${i.limit ? ', còn ' + i.limit + ' suất' : ''})`).join('; ') + (f.code ? `. Mã ưu đãi ${f.code}.` : '.');
  } catch (e) { return 'Hiện không có Flash sale.'; }
}
function systemPrompt(flash) {
  const svc = Object.values(SERVICES).map(s => `- ${s.name}: ${vnd(s.price)}`).join('\n');
  const prod = Object.values(PRODUCTS).map(p => `- ${p.name}: ${vnd(p.price)}`).join('\n');
  const today = new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  return `Bạn là trợ lý tư vấn trực tuyến của SPA Nàng Ba – Beauty, Mom & Baby Care: spa chăm sóc phụ nữ, mẹ bầu, mẹ sau sinh và em bé, phục vụ tại spa và tại nhà. Hôm nay là ${today}.

CÁCH NÓI CHUYỆN
- Nói tiếng Việt tự nhiên, ấm áp như một bạn tư vấn viên đang nhắn tin: dùng "dạ", "ạ", xưng "em", gọi khách "chị/anh" (khách xưng thế nào gọi theo).
- Trả lời NGẮN: 1–3 câu, tối đa khoảng 60 từ. Không markdown, không liệt kê cả bảng giá trừ khi khách hỏi. Tối đa 1 emoji mỗi tin.
- Hỏi lại 1 câu để hiểu nhu cầu khi cần (tuần thai, số ngày sau sinh, tuổi của bé, vùng đau mỏi…), rồi gợi ý dịch vụ phù hợp nhất.
- Nếu khách hỏi có phải người thật không: nói thật là trợ lý ảo của spa, có thể nhờ chị tư vấn viên gọi lại hoặc nhắn Zalo 0785 568 539.

THÔNG TIN CHÍNH XÁC (chỉ dùng những gì có ở đây, không bịa thêm)
Dịch vụ & giá:
${svc}
Massage bầu áp dụng từ tuần thai 14; tắm bé dành cho bé 0–12 tháng; thông tắc tia sữa nữ hộ sinh có thể đến trong ngày.
${flash}
Thanh toán: không cần trả trước; nếu chuyển khoản ngay sau khi đặt lịch online được giảm ${PAYNOW_PCT}% tổng đơn (ACB 229338189 – Trương Thị Phương, hệ thống tự xác nhận).
Sản phẩm:
${prod}
Giờ mở cửa: T2–T7 9:00–20:00, Chủ nhật 9:00–19:00; dịch vụ sau sinh & tại nhà 7:30–18:30 hằng ngày. Liên hệ: điện thoại/Zalo 0785 568 539.

GIỚI HẠN
- Không chẩn đoán bệnh, không hứa kết quả điều trị. Mẹ bầu có bệnh lý, thai kỳ nguy cơ, bé ốm sốt… thì khuyên hỏi bác sĩ trước.
- Câu hỏi ngoài thông tin trên (chi nhánh cụ thể, chính sách hoàn tiền…): nói thật là em chưa có thông tin chính xác và mời khách để lại số điện thoại để tư vấn viên gọi lại.
- Không bàn chủ đề không liên quan đến spa, mẹ & bé, làm đẹp; nhẹ nhàng đưa câu chuyện về dịch vụ.

NÚT BẤM (chèn đúng ký hiệu, web sẽ đổi thành nút)
- [[DAT_LICH]] khi khách muốn đặt lịch hoặc đã chốt dịch vụ.
- [[BANG_GIA]] khi khách hỏi giá tổng quát (mở danh sách dịch vụ).
- [[ZALO]] khi cần nhân viên hỗ trợ trực tiếp.
- [[GOI_LAI]] khi mời khách để lại số điện thoại.
Mỗi tin tối đa 2 nút, đặt ở cuối tin.`;
}

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });
  const b = await readBody(req); if (!b) return send(res, 400, { error: 'Dữ liệu không hợp lệ' });
  try {
    // Khách để lại số điện thoại → lưu lead cho Lễ tân
    if (b.lead) {
      const phone = String(b.lead.phone || '').replace(/\D/g, ''); if (phone.length < 9 || phone.length > 11) return send(res, 400, { error: 'SĐT không hợp lệ' });
      const now = Date.now(); const code = 'CHAT' + now.toString(36).toUpperCase();
      const lead = { id: 'lead_' + code, kind: 'lead', code, xung: String(b.lead.xung || '').slice(0, 10), name: String(b.lead.name || 'Khách chat').slice(0, 80), phone, notes: String(b.lead.note || '').slice(0, 1500), topic: String(b.lead.topic || '').slice(0, 200), date: '', time: '', items: [], products: [], total: 0, createdAt: now, updatedAt: now };
      if (kvReady()) { await kv('SET', 'order:' + code, JSON.stringify(lead)); await kv('ZADD', 'orders_upd', now, code); }
      const pf = phone.replace(/(\d{4})(\d{3})(\d+)/, '$1 $2 $3');
      const msg = `🔔 KHÁCH MỚI TỪ CHAT WEBSITE\n👤 ${lead.xung ? lead.xung + ' ' : ''}${lead.name}\n📞 ${pf}\n🕒 ${vnTime()}\n${lead.topic ? '🎯 Quan tâm: ' + lead.topic + '\n' : ''}💬 Vấn đề khách nhắn:\n${lead.notes || '(chưa ghi)'}\n\n👉 Gọi/Zalo lại cho khách sớm nhé!`;
      const zr = await zaloAdmin(msg, { ten_khach: lead.name.slice(0, 30), sdt_khach: phone, noi_dung: (lead.topic || lead.notes).slice(0, 90), thoi_gian: vnTime() });
      telegram(['letan'], esc(msg)).catch(() => {});
      return send(res, 200, { ok: true, zalo: zr.some(x => x.ok) });
      return send(res, 200, { ok: true });
    }
    const key = process.env.ANTHROPIC_API_KEY; if (!key) return send(res, 503, { error: 'Chưa cấu hình ANTHROPIC_API_KEY' });
    if (kvReady()) {
      const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'x';
      const rk = `rlc:${ip}:${new Date().toISOString().slice(0, 13)}`; const n = await kv('INCR', rk); if (n === 1) await kv('EXPIRE', rk, 3600);
      if (n > 80) return send(res, 429, { error: 'Bạn nhắn nhanh quá, thử lại sau ít phút nhé.' });
    }
    const msgs = (Array.isArray(b.messages) ? b.messages : []).slice(-14).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content || '').slice(0, 1000) })).filter(m => m.content);
    while (msgs.length && msgs[0].role !== 'user') msgs.shift();
    if (!msgs.length) return send(res, 400, { error: 'Chưa có tin nhắn' });
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5', max_tokens: 400, system: systemPrompt(await flashText(req)), messages: msgs }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return send(res, 502, { error: (j.error && j.error.message) || 'AI lỗi' });
    const reply = (j.content || []).filter(c => c.type === 'text').map(c => c.text).join('').trim();
    return send(res, 200, { reply });
  } catch (e) { return send(res, 500, { error: e.message }); }
};
