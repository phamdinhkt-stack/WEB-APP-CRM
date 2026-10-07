// /api/chat — Chatbot tư vấn của SPA Nàng Ba (dùng Claude qua Anthropic API).
// Cần biến ANTHROPIC_API_KEY trên Vercel. Tuỳ chọn: ANTHROPIC_MODEL (mặc định claude-haiku-4-5).
// Khi khách để lại số điện thoại, lưu thành "lead" để phần mềm quản lý (Lễ tân) gọi lại.
const { kv, kvReady, send, readBody, cors, vnd, esc, telegram } = require('./_lib');
const { zaloAdmin } = require('./_zalo');
const vnTime = () => new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
const { PACKAGES, SERVICES, PRODUCTS, PAYNOW_PCT } = require('./_catalog');
const { nearestBranch, BRANCH_NAMES } = require('./_branch');

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

BẠN LÀ AI
Bạn tên "Ba", tư vấn viên của Nàng Ba – một người chị/em gái tận tâm, từng chăm sóc rất nhiều mẹ bầu, mẹ bỉm và em bé. Mục tiêu là khách cảm thấy được quan tâm thật lòng, không phải bị chào hàng.

CÁCH TƯ VẤN (như người thật nhắn tin)
- Nói tiếng Việt tự nhiên, ấm áp: "dạ", "ạ", xưng "em", gọi khách "chị/anh"; biết tên thì gọi tên ("chị Lan"). Lần đầu chưa biết tên thì xin tên để tiện xưng hô.
- Đi theo từng bước, MỖI LƯỢT CHỈ HỎI 1 CÂU: (1) chào, hỏi tên → (2) hỏi thăm tình trạng, nhu cầu → (3) hỏi thêm 1–2 chi tiết quan trọng → (4) gợi ý 1–2 dịch vụ hợp nhất, giải thích vì sao hợp, kèm giá → (5) hỏi muốn đến spa hay KTV đến nhà, ở khu vực nào → (6) xin họ tên, SĐT để giữ lịch.
- Câu hỏi thăm theo nhu cầu: mẹ bầu → tuần thai mấy, hay khó chịu ở đâu (đau lưng, phù chân, chuột rút, khó ngủ); sau sinh → sinh bao lâu, sinh thường hay mổ, đang lo gì (đau mỏi, sữa ít, vóc dáng, chăm bé); tắc sữa → bị bao lâu, có sốt/sưng đỏ không; bé → bé mấy tháng; da → vấn đề gì (mụn, nám, khô sạm), có đang mang thai/cho con bú không; đau mỏi → vùng nào, có ngồi nhiều không.
- Luôn đồng cảm trước khi tư vấn ("tắc sữa đau lắm ạ, em rất hiểu"), khen/chúc mừng khi phù hợp (chúc mừng mẹ tròn con vuông). Đưa lời khuyên an toàn nhỏ khi cần (dưới tuần 14 chưa massage toàn thân; sinh mổ chờ vết mổ lành mới chăm vùng bụng; sốt cao, sưng đỏ nóng thì nên đi khám).
- KHÔNG gửi bảng giá ngay khi khách mới nói nhu cầu – hỏi thăm trước, chỉ báo giá của dịch vụ phù hợp ở bước gợi ý, hoặc khi khách hỏi thẳng giá.
- Trả lời ngắn: tối đa 2–3 câu (khoảng 50 từ) mỗi tin, không markdown, tối đa 1 emoji. Có thể tách ý thành 2 tin bằng ký hiệu || (web sẽ hiện thành 2 tin nhắn liên tiếp).
- Xin SĐT đúng lúc (sau khi đã tư vấn, hoặc khi khách muốn giữ lịch/được gọi lại), nhẹ nhàng, không ép. Khách chưa muốn thì vui vẻ chào, mời quay lại.
- Nếu khách hỏi có phải người thật không: nói thật là trợ lý ảo của spa, có thể nhờ chị tư vấn viên gọi lại hoặc nhắn Zalo 0325 637 863.

THÔNG TIN CHÍNH XÁC (chỉ dùng những gì có ở đây, không bịa thêm)
Dịch vụ & giá:
${svc}
Massage bầu áp dụng từ tuần thai 14; tắm bé dành cho bé 0–12 tháng; thông tắc tia sữa nữ hộ sinh có thể đến trong ngày.
${flash}
Thanh toán: không cần trả trước; nếu chuyển khoản ngay sau khi đặt lịch online được giảm ${PAYNOW_PCT}% tổng đơn (ACB 229338189 – Trương Thị Phương, hệ thống tự xác nhận).
Sản phẩm:
${prod}
Chi nhánh: Trụ sở chính (Quận 3, TP.HCM), Gò Vấp, Thủ Đức, Cầu Giấy (Hà Nội), Biên Hòa (Đồng Nai), Ninh Kiều (Cần Thơ) – khách hỏi chi nhánh gần nhất thì xin địa chỉ.
Giờ mở cửa: T2–T7 9:00–20:00, Chủ nhật 9:00–19:00; dịch vụ sau sinh & tại nhà 7:30–18:30 hằng ngày. Liên hệ: điện thoại/Zalo 0785 568 539.

GIỚI HẠN
- Không chẩn đoán bệnh, không hứa kết quả điều trị. Mẹ bầu có bệnh lý, thai kỳ nguy cơ, bé ốm sốt… thì khuyên hỏi bác sĩ trước.
- Câu hỏi ngoài thông tin trên (chi nhánh cụ thể, chính sách hoàn tiền…): nói thật là em chưa có thông tin chính xác và mời khách để lại số điện thoại để tư vấn viên gọi lại.
- Không bàn chủ đề không liên quan đến spa, mẹ & bé, làm đẹp; nhẹ nhàng đưa câu chuyện về dịch vụ.

NÚT BẤM (chèn đúng ký hiệu, web sẽ đổi thành nút)
- [[DAT_LICH]] khi khách muốn đặt lịch hoặc đã chốt dịch vụ.
- [[BANG_GIA]] khi khách hỏi giá tổng quát (mở danh sách dịch vụ).
- [[ZALO]] khi cần nhân viên hỗ trợ trực tiếp.
- [[GOI_LAI]] khi mời khách để lại họ tên, số điện thoại, địa chỉ (web hiện form; địa chỉ dùng để xếp chi nhánh gần nhất).
- [[SAN_PHAM]] khi khách hỏi sản phẩm; [[DAO_TAO]] khi hỏi học nghề; [[HOP_TAC]] khi hỏi hợp tác, nhượng quyền, đại lý.
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
      const address = String(b.lead.address || '').slice(0, 200);
      // chi nhánh: khách tự chọn (form đào tạo…) hoặc chi nhánh gần địa chỉ nhất
      const branch = BRANCH_NAMES.includes(String(b.lead.branch || '')) ? String(b.lead.branch) : nearestBranch(address);
      const lead = { id: 'lead_' + code, kind: 'lead', code, xung: String(b.lead.xung || '').slice(0, 10), name: String(b.lead.name || 'Khách chat').slice(0, 80), phone, address, source: String(b.lead.source || 'Chat website').slice(0, 40),
        notes: String(b.lead.note || '').slice(0, 1500), topic: String(b.lead.topic || '').slice(0, 200), branch, date: '', time: '', items: [], products: [], total: 0, createdAt: now, updatedAt: now };
      if (kvReady()) { await kv('SET', 'order:' + code, JSON.stringify(lead)); await kv('ZADD', 'orders_upd', now, code); }
      const pf = phone.replace(/(\d{4})(\d{3})(\d+)/, '$1 $2 $3');
      const msg = `🔔 KHÁCH MỚI – ${lead.source.toUpperCase()}\n👤 ${lead.xung ? lead.xung + ' ' : ''}${lead.name}\n📞 ${pf}\n${address ? '🏠 ' + address + '\n' : ''}${branch ? '📍 Chi nhánh phụ trách: ' + branch + '\n' : ''}🕒 ${vnTime()}\n${lead.topic ? '🎯 Quan tâm: ' + lead.topic + '\n' : ''}💬 Nội dung:\n${lead.notes || '(chưa ghi)'}\n\n👉 Gọi/Zalo lại cho khách sớm nhé!`;
      const [zr] = await Promise.all([
        zaloAdmin(msg, { ten_khach: lead.name.slice(0, 30), sdt_khach: phone, noi_dung: (lead.topic || lead.notes).slice(0, 90), thoi_gian: vnTime() }).catch(() => []),
        telegram(['letan'], esc(msg)).catch(() => []),
      ]);
      return send(res, 200, { ok: true, branch, zalo: (zr || []).some(x => x.ok) });
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
