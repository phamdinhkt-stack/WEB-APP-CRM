// =====================================================
// CHAT VỚI NÀNG BA 24/7 – chatbot tư vấn (góc phải)
// Trả lời: AI qua /api/chat nếu có ANTHROPIC_API_KEY, không có thì bộ trả lời dựng từ data.js (dịch vụ, giá, sản phẩm…).
// Khách để lại họ tên + SĐT + địa chỉ → /api/chat {lead} → Telegram + phần mềm quản lý (khách mới, Danh sách chờ)
// của chi nhánh gần địa chỉ nhất (api/_branch.js).
// =====================================================
const CB_ZALO = '0325637863';
const CB = { msgs: [], open: false, busy: false, ai: null, lead: false, asked: false };
try { Object.assign(CB, JSON.parse(sessionStorage.getItem('nb_chat') || '{}'), { open: false, busy: false }); } catch (e) {}
const cbSave = () => { try { sessionStorage.setItem('nb_chat', JSON.stringify({ msgs: CB.msgs.slice(-40), ai: CB.ai, lead: CB.lead, asked: CB.asked })); } catch (e) {} };
const cbN = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
const cbPrices = s => s.prices.slice(0, 3).map(([n, p]) => `${n}: ${p}`).join('; ');
const CB_SVC = [ // từ khóa (không dấu) → id dịch vụ trong SERVICES
  [/tia sua|tac sua|gọi sua|goi sua|kich sua/, ['home-tiasua']], [/sau sinh|o cu|hau san/, ['home-sausinh']],
  [/tam be|massage be|em be|so sinh|cho be/, ['tambe']], [/bau|mang thai|thai ky|tuan thai/, ['spa-bau', 'home-bau']],
  [/goi dau|duong sinh/, ['goidau']], [/massage|dau lung|moi vai|vai gay|da nong/, ['massage']],
  [/facial|da mat|cham soc da|mun|nam|tham/, ['facial']], [/tay da|u trang|sang da|tam trang/, ['tayu']],
  [/san chac|giam eo|bung|vong eo/, ['sanchac']], [/triet long|wax/, ['trietlong']], [/nang co|lao hoa|nep nhan|cang da/, ['nangco']]
];
function cbLocal(q) {
  const n = cbN(q), has = re => re.test(n);
  if (has(/^(chao|hello|hi|alo|xin chao|hey)\b/) && n.length < 20) return 'Dạ Nàng Ba chào chị ạ 🌿 Chị đang quan tâm chăm sóc mẹ bầu, mẹ sau sinh, tắm bé hay làm đẹp ạ? Em tư vấn ngay cho chị nhé.';
  if (has(/nguoi that|robot|bot|ao khong/)) return 'Dạ em là trợ lý ảo của Nàng Ba ạ. Chị để lại số điện thoại, tư vấn viên sẽ gọi lại ngay, hoặc nhắn Zalo cho Nàng Ba nhé. [[GOI_LAI]] [[ZALO]]';
  if (has(/dao tao|hoc nghe|khoa hoc|hoc vien/)) return `Dạ Học viện Nàng Ba có ${COURSES.length} khóa: ${COURSES.map(c => `${c.name} (${c.duration})`).join(', ')}. Học thực hành, cấp chứng chỉ và giới thiệu việc làm ạ. [[DAO_TAO]] [[GOI_LAI]]`;
  if (has(/hop tac|nhuong quyen|dai ly|phan phoi|dau tu|mo spa/)) return `Dạ Nàng Ba có 4 hình thức hợp tác: ${PARTNER_PROGRAMS.map(p => p.name).join(', ')}. Chị xem chi tiết hoặc để lại số để chuyên viên gọi tư vấn ạ. [[HOP_TAC]] [[GOI_LAI]]`;
  for (const [re, ids] of CB_SVC) if (has(re)) {
    const ss = ids.map(id => SERVICES.find(s => s.id === id)).filter(Boolean);
    return ss.map(s => `${s.name}: ${s.short} Giá: ${cbPrices(s)}.`).join(' ') + (has(/tai nha|den nha/) || ss.some(s => s.group === 'home') ? ' Nàng Ba có phục vụ tận nhà ạ.' : '') + ' [[DAT_LICH]] [[GOI_LAI]]';
  }
  if (has(/san pham|serum|kem|sua tam|tinh dau|mat na|xa phong|dau duong|chong ran|son moi|sap/)) {
    const hit = PRODUCTS.filter(p => cbN(p.name).split(' ').some(w => w.length > 3 && n.includes(w)));
    const list = (hit.length ? hit : PRODUCTS.filter(p => p.featured)).slice(0, 4);
    return 'Dạ ' + list.map(p => `${p.name} giá ${vnd(p.price)}`).join('; ') + '. Chị đặt mua ngay trên web hoặc mua kèm khi đến spa ạ. [[SAN_PHAM]]';
  }
  if (has(/gia|bao nhieu|bang gia|chi phi|tien/)) return 'Dạ bảng giá tham khảo: ' + SERVICES.slice(0, 5).map(s => `${s.name} từ ${s.prices[0][1]}`).join('; ') + '. Chị quan tâm dịch vụ nào em báo chi tiết ạ. [[BANG_GIA]] [[DAT_LICH]]';
  if (has(/gio|mo cua|dong cua|may gio|lam viec/)) return 'Dạ Nàng Ba mở cửa T2–T7: 9:00–20:00, Chủ nhật: 9:00–19:00. Dịch vụ sau sinh & tại nhà: 7:30–18:30 hằng ngày ạ. [[DAT_LICH]]';
  if (has(/chi nhanh|dia chi|o dau|gan nhat|co so/)) return `Dạ Nàng Ba có ${BRANCHES.length} chi nhánh: ${BRANCHES.map(b => b.name.replace('Nàng Ba – ', '')).join(', ')}. Chị để lại địa chỉ, em xếp chi nhánh gần chị nhất ạ. [[GOI_LAI]]`;
  if (has(/thanh toan|chuyen khoan|uu dai|giam|khuyen mai|voucher/)) return `Dạ khách lần đầu được giảm 20%; đặt lịch online và chuyển khoản ngay được giảm ${PAYNOW_PCT}% tổng đơn, hệ thống tự xác nhận qua QR ạ. Không bắt buộc trả trước nhé chị. [[DAT_LICH]]`;
  if (has(/dat lich|dat hen|book|hen lich|lich trong/)) return 'Dạ chị bấm Đặt lịch để chọn dịch vụ, chi nhánh, ngày giờ và nhân viên ạ. Hoặc để lại số, Nàng Ba gọi xếp lịch giúp chị. [[DAT_LICH]] [[GOI_LAI]]';
  if (has(/tai nha|den nha|home/)) return 'Dạ Nàng Ba có chăm sóc mẹ bầu, mẹ sau sinh, tắm bé và thông tắc tia sữa tận nhà. Chị để lại địa chỉ để em xếp kỹ thuật viên chi nhánh gần nhất ạ. [[GOI_LAI]]';
  return 'Dạ em chưa có thông tin chính xác cho câu này ạ. Chị để lại số điện thoại và địa chỉ, tư vấn viên chi nhánh gần chị nhất sẽ gọi lại ngay nhé. [[GOI_LAI]] [[ZALO]]';
}
const CB_ACTS = {
  DAT_LICH: '<a href="#dat-lich" data-cbnav>📅 Đặt lịch</a>', BANG_GIA: '<a href="#services" data-cbnav>Xem dịch vụ & giá</a>', SAN_PHAM: '<a href="#san-pham" data-cbnav>Xem sản phẩm</a>',
  DAO_TAO: '<a href="#dao-tao" data-cbnav>Học viện Nàng Ba</a>', HOP_TAC: '<a href="#hop-tac" data-cbnav>Hợp tác</a>',
  ZALO: `<a href="https://zalo.me/${CB_ZALO}" target="_blank" rel="noopener">Nhắn Zalo</a>`, GOI_LAI: '<button type="button" data-cblead>📞 Để lại thông tin</button>'
};
function cbBubble(m) {
  if (m.role === 'user') return `<div class="cb-m me">${escH(m.content)}</div>`;
  if (m.role === 'form') return cbFormHTML(m);
  const acts = []; const text = String(m.content).replace(/\[\[(\w+)\]\]/g, (x, k) => { if (CB_ACTS[k] && !acts.includes(CB_ACTS[k])) acts.push(CB_ACTS[k]); return ''; }).trim();
  return `<div class="cb-m bot">${escH(text)}${acts.length ? `<div class="cb-acts">${acts.join('')}</div>` : ''}</div>`;
}
function cbFormHTML(m) {
  if (m.done) return `<div class="cb-m bot cb-ok">✅ Đã gửi thông tin: <b>${escH(m.name)}</b> · ${escH(m.phone)}${m.branch ? `<br>📍 Chi nhánh phụ trách: <b>${escH(m.branch.replace('Nàng Ba – ', ''))}</b>` : ''}</div>`;
  return `<form class="cb-lead" data-cbform><b>Để lại thông tin – Nàng Ba gọi lại ngay</b>
    <input name="name" placeholder="Họ và tên *" value="${escH(m.name || '')}" autocomplete="name">
    <input name="phone" placeholder="Số điện thoại / Zalo *" inputmode="tel" value="${escH(m.phone || '')}" autocomplete="tel">
    <input name="address" placeholder="Địa chỉ (để xếp chi nhánh gần nhất)" value="${escH(m.address || '')}" autocomplete="street-address">
    <button type="submit">Gửi thông tin</button></form>`;
}
function cbRender(typing) {
  const body = $('#cbBody'); if (!body) return;
  body.innerHTML = `<div class="cb-m bot">Dạ Nàng Ba xin chào 🌿 Em là trợ lý tư vấn 24/7. Chị cần tư vấn chăm sóc mẹ bầu, sau sinh, tắm bé hay làm đẹp ạ?</div>` +
    CB.msgs.map(cbBubble).join('') + (typing ? '<div class="cb-typing"><i></i><i></i><i></i></div>' : '');
  $('#cbQuick').hidden = CB.msgs.length > 4;
  body.scrollTop = body.scrollHeight;
}
function cbToggle(open) {
  CB.open = open ?? !CB.open; $('#cbBox').classList.toggle('open', CB.open); $('#cbFab').classList.toggle('on', CB.open);
  if (CB.open) { cbRender(); setTimeout(() => $('#cbInput').focus(), 80); }
}
function cbShowForm(pre) {
  const f = CB.msgs.find(m => m.role === 'form' && !m.done);
  if (f) Object.assign(f, Object.fromEntries(Object.entries(pre || {}).filter(([, v]) => v))); else CB.msgs.push({ role: 'form', ...(pre || {}) });
  cbSave(); cbRender(); const el = $('#cbBody [data-cbform] [name=name]'); if (el && !el.value) el.focus();
}
async function cbAsk(text) {
  text = String(text || '').trim(); if (!text || CB.busy) return;
  CB.msgs.push({ role: 'user', content: text }); cbSave(); CB.busy = true; cbRender(true);
  const digits = text.replace(/[\s.]/g, '').match(/0\d{8,10}/);
  let reply = null; const started = Date.now();
  if (!digits && CB.ai !== false) {
    try {
      const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 20000);
      const conv = CB.msgs.filter(m => m.role === 'user' || m.role === 'assistant').slice(-14);
      const r = await fetch('api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: conv }), signal: ctl.signal });
      clearTimeout(t); const j = await r.json().catch(() => null);
      if (r.ok && j && j.reply) { reply = j.reply; CB.ai = true; } else if ([404, 405, 503].includes(r.status)) CB.ai = false;
    } catch (e) {}
  }
  if (digits && !CB.lead) reply = 'Dạ em cảm ơn chị! Chị cho em xin thêm họ tên và địa chỉ để Nàng Ba xếp tư vấn viên ở chi nhánh gần chị nhất nhé.';
  if (!reply) reply = cbLocal(text);
  const wait = 650 - (Date.now() - started); if (wait > 0) await new Promise(r => setTimeout(r, wait));
  CB.msgs.push({ role: 'assistant', content: reply });
  const userN = CB.msgs.filter(m => m.role === 'user').length;
  if (digits && !CB.lead) CB.msgs.push({ role: 'form', phone: digits[0] });
  else if (!CB.lead && !CB.asked && userN >= 3) { CB.asked = true; CB.msgs.push({ role: 'assistant', content: 'Để được tư vấn kỹ hơn và giữ ưu đãi giảm 20% lần đầu, chị để lại thông tin giúp em nhé ạ. [[GOI_LAI]]' }); }
  CB.busy = false; cbSave(); cbRender();
}
async function cbSubmitLead(form) {
  const d = Object.fromEntries(new FormData(form)), phone = phoneOk(d.phone);
  if (!d.name.trim()) return toast('Chị nhập giúp em họ tên ạ.');
  if (!phone) return toast('Số điện thoại chưa đúng (9–11 số).');
  const btn = form.querySelector('button'); btn.disabled = true; btn.textContent = 'Đang gửi…';
  const said = CB.msgs.filter(m => m.role === 'user').map(m => m.content).filter(t => !/^[\d\s.+()-]{9,}$/.test(t)).slice(-8);
  const topics = [...new Set(said.map(t => { const hit = CB_SVC.find(([re]) => re.test(cbN(t))); return hit && (SERVICES.find(s => s.id === hit[1][0]) || {}).name; }).filter(Boolean))].join(', ');
  const note = said.length ? 'Nội dung chat: ' + said.join(' | ') : 'Khách để lại thông tin qua chat.';
  let branch = '';
  try {
    const r = await fetch('api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lead: { phone, name: d.name.trim(), address: d.address.trim(), topic: topics, note, source: 'Chat website' } }) });
    const j = await r.json().catch(() => ({})); branch = j.branch || '';
  } catch (e) {}
  // cùng trình duyệt với phần mềm quản lý (máy lễ tân) → vào ngay không cần chờ đồng bộ
  const code = 'CHAT' + Date.now().toString(36).toUpperCase();
  inboxPush({ id: 'lead_' + code, kind: 'lead', code, xung: '', name: d.name.trim(), phone, address: d.address.trim(), source: 'Chat website', branch, topic: topics, notes: note, items: [], products: [], total: 0, createdAt: new Date().toISOString() });
  const f = CB.msgs.find(m => m.role === 'form' && !m.done); Object.assign(f || {}, { done: true, name: d.name.trim(), phone, address: d.address.trim(), branch });
  CB.lead = true;
  const br = BRANCHES.find(b => b.name === branch);
  CB.msgs.push({ role: 'assistant', content: `Dạ em đã chuyển thông tin cho ${br ? br.name : 'Nàng Ba'}${br ? ` (${br.address.replace(/^\[[^\]]*\],\s*/, '')}, hotline ${br.phone})` : ''}. Tư vấn viên sẽ gọi lại chị trong ít phút ạ. Chị có thể đặt lịch luôn để giữ giờ đẹp nhé! [[DAT_LICH]]` });
  cbSave(); cbRender();
}
// giao diện
document.body.insertAdjacentHTML('beforeend', `
<button class="cb-fab" id="cbFab" type="button" aria-label="Chat với Nàng Ba 24/7"><span class="cb-tip">Chat với Nàng Ba<b>Tư vấn 24/7</b></span><span class="cb-ic"><i class="fa-solid fa-comments"></i></span></button>
<section class="cb-box" id="cbBox" aria-label="Chat với Nàng Ba">
  <header class="cb-head"><span class="cb-av">NB</span><div><b>Chat với Nàng Ba</b><small><i></i>Trực tuyến 24/7</small></div>
    <a class="cb-zalo" href="https://zalo.me/${CB_ZALO}" target="_blank" rel="noopener" title="Nhắn Zalo 0325 637 863">Zalo</a><button type="button" id="cbClose" aria-label="Đóng">&times;</button></header>
  <div class="cb-body" id="cbBody"></div>
  <div class="cb-quick" id="cbQuick">${['Bảng giá massage bầu', 'Chăm sóc sau sinh tại nhà', 'Tắm bé giá bao nhiêu?', 'Chi nhánh gần tôi', 'Giờ mở cửa'].map(q => `<button type="button" data-cbq="${q}">${q}</button>`).join('')}<button type="button" data-cblead>📞 Để lại thông tin</button></div>
  <form class="cb-in" id="cbForm" autocomplete="off"><input id="cbInput" maxlength="500" placeholder="Nhập câu hỏi hoặc số điện thoại…" aria-label="Tin nhắn"><button type="submit" aria-label="Gửi"><i class="fa-solid fa-paper-plane"></i></button></form>
</section>`);
$('#cbFab').addEventListener('click', () => cbToggle());
$('#cbClose').addEventListener('click', () => cbToggle(false));
$('#cbForm').addEventListener('submit', e => { e.preventDefault(); const i = $('#cbInput'); const v = i.value; i.value = ''; cbAsk(v); });
$('#cbBox').addEventListener('click', e => {
  const t = e.target.closest('button, a'); if (!t) return;
  if (t.dataset.cbq) cbAsk(t.dataset.cbq);
  else if (t.dataset.cblead !== undefined) cbShowForm();
  else if (t.dataset.cbnav !== undefined && innerWidth <= 600) cbToggle(false);
});
$('#cbBox').addEventListener('submit', e => { if (e.target.matches('[data-cbform]')) { e.preventDefault(); cbSubmitLead(e.target); } });
