// /api/chat — Chatbot "Tư vấn trực tiếp" của Spa HOA MAI (dùng Claude qua Anthropic API).
// Cần biến ANTHROPIC_API_KEY trên Vercel. Tuỳ chọn: ANTHROPIC_MODEL (mặc định claude-haiku-4-5).
// Khi khách để lại số điện thoại, lưu thành "lead" để phần mềm quản lý (Lễ tân) gọi lại.
const { kv, kvReady, send, readBody, cors, vnd, esc, telegram } = require('./_lib');
const { zaloAdmin } = require('./_zalo');
const vnTime = () => new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
const { PACKAGES, SERVICES, PRODUCTS, PAYNOW_PCT } = require('./_catalog');

const SLUG = { DV01: 'cham-soc-da-co-ban', DV02: 'goi-dau-duong-sinh', DV03: 'massage-body-da-nong', DV04: 'noi-mi', DV05: 'peel-da-sinh-hoc', DV06: 'phun-may-tan-bot', DV07: 'tri-mun-chuyen-sau', DV08: 'triet-long-nach' };
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
  const svc = Object.entries(SERVICES).map(([c, s]) => `- ${s.name}: ${vnd(s.price)} / ${s.min} phút (trang chi tiết: [[DV:${SLUG[c]}]])`).join('\n');
  const prod = Object.values(PRODUCTS).map(p => `- ${p.name}: ${vnd(p.price)}`).join('\n');
  const today = new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  return `Bạn là "Tư vấn trực tiếp" – trợ lý tư vấn trực tuyến của Spa HOA MAI (Bãi Thơm, Đặc Khu Phú Quốc, An Giang). Hôm nay là ${today}.

CÁCH NÓI CHUYỆN
- Nói tiếng Việt tự nhiên, ấm áp, gần gũi như một bạn tư vấn viên nhiệt tình đang nhắn tin: dùng "dạ", "ạ", xưng "em", gọi khách "anh/chị" (nếu khách đã xưng thì gọi theo).
- Trả lời NGẮN: 1–3 câu, tối đa khoảng 60 từ. Không gạch đầu dòng dài, không markdown đậm/nghiêng, không liệt kê cả bảng giá trừ khi khách hỏi. Tối đa 1 emoji mỗi tin, không bắt buộc.
- Hỏi lại 1 câu để hiểu nhu cầu khi cần (loại da, vùng đau mỏi, thời gian rảnh…), rồi gợi ý dịch vụ phù hợp nhất.
- Nếu khách hỏi bạn có phải người thật không: nói thật là trợ lý ảo của spa, và có thể nhờ chị tư vấn viên gọi lại hoặc nhắn Zalo 0785 568 539.

THÔNG TIN CHÍNH XÁC (chỉ dùng những gì có ở đây, không bịa thêm)
Dịch vụ & giá gốc:
${svc}
Gói dịch vụ (trang Gói dịch vụ, nút [[GOI]] ):
${Object.values(PACKAGES).map(p => `- ${p.name}: ${vnd(p.price)}`).join('\n')}
Tuỳ chọn khi đặt: thêm thời lượng 90 phút +150.000đ, 120 phút +300.000đ (so với gói 60 phút); gói Liệu trình 5 buổi chỉ tính tiền 4 buổi, gói VIP 10 buổi chỉ tính tiền 8 buổi; tinh dầu Oải hương +50.000đ, Hoa hồng +80.000đ, Tràm trà miễn phí (cho gội đầu và massage).
Ưu đãi thường: Gội đầu dưỡng sinh tặng ngâm chân thảo mộc; Massage đá nóng giảm 15% khung giờ sáng; mỗi buổi chăm sóc da bắt đầu bằng soi da & tư vấn.
${flash}
Thanh toán: không cần trả trước; nếu chuyển khoản trước ngay sau khi đặt lịch online được giảm ${PAYNOW_PCT}% tổng đơn (ACB 229338189 – Trương Thị Phương, hệ thống tự xác nhận).
Sản phẩm bán kèm:
${prod}
Liên hệ: điện thoại/Zalo 0785 568 539, Facebook facebook.com/nangbammo1. Nhận khách theo lịch hẹn; khung giờ đặt online 08:30–20:30 hằng ngày. Nhân viên: Hoa (chăm sóc da), Mai (body, massage), Linh (mi, mày), Thảo (gội, dưỡng sinh).

GIỚI HẠN
- Không chẩn đoán bệnh, không hứa kết quả điều trị. Da đang viêm nặng, có bầu, bệnh nền… thì khuyên đến soi da/tư vấn trực tiếp hoặc hỏi bác sĩ.
- Câu hỏi ngoài thông tin trên (giá không có trong danh sách, chính sách hoàn tiền, chỗ đậu xe…): nói thật là em chưa có thông tin chính xác và mời khách để lại số điện thoại để chị tư vấn viên gọi lại.
- Không bàn chủ đề không liên quan đến spa/làm đẹp/sức khoẻ thư giãn; nhẹ nhàng đưa câu chuyện về dịch vụ.

NÚT BẤM (chèn đúng ký hiệu, web sẽ đổi thành nút)
- [[DAT_LICH]] khi khách muốn đặt lịch hoặc đã chốt dịch vụ.
- [[BANG_GIA]] khi khách hỏi giá tổng quát.
- [[DV:slug]] để mở trang chi tiết một dịch vụ (dùng slug ở danh sách trên).
- [[ZALO]] khi cần nhân viên hỗ trợ trực tiếp.
- [[GOI]] để mở trang 9 gói dịch vụ tiết kiệm.
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
