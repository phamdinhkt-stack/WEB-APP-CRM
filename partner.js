// =====================================================
// HỢP TÁC CÙNG NÀNG BA – trang landing (#hop-tac)
// 4 mô hình sửa ở PARTNER_PROGRAMS (data.js). Form gửi lead về Telegram + phần mềm quản lý (Danh sách chờ "Gọi lại tư vấn")
// qua sendLead() trong vua-connect.js. Dùng chung giao diện .tr-* của trang Đào tạo.
// =====================================================
const PT_WHY = [
  ['fa-baby', 'Thị trường mẹ & bé bền vững', 'Nhu cầu chăm sóc mẹ bầu, mẹ sau sinh và em bé luôn có, khách quay lại theo liệu trình và theo từng lần sinh.'],
  ['fa-notes-medical', 'Quy trình chuẩn y khoa', 'Kỹ thuật được cố vấn sản khoa, nhi khoa thẩm định; đội ngũ nữ hộ sinh trực tiếp đào tạo.'],
  ['fa-laptop-medical', 'Vận hành bằng phần mềm', 'VUA APP quản lý lịch hẹn, khách hàng, thu ngân, kho, lương và nhiều chi nhánh – số liệu minh bạch.'],
  ['fa-globe', 'Bán hàng online sẵn sàng', 'Website đặt lịch, thanh toán QR tự xác nhận, báo Telegram cho từng bộ phận.'],
  ['fa-store', `Hệ thống ${BRANCHES.length} chi nhánh`, 'Mô hình đã chạy thực tế ở nhiều khu vực, có số liệu để tham chiếu khi lập phương án.'],
  ['fa-handshake-angle', 'Đồng hành dài hạn', 'Không chỉ chuyển giao – Nàng Ba theo sát vận hành, đào tạo lại và cập nhật dịch vụ mới.']
];
const PT_SUPPORT = [
  ['fa-copyright', 'Thương hiệu & nhận diện'], ['fa-graduation-cap', 'Đào tạo nhân sự'], ['fa-box-open', 'Sản phẩm & vật tư'],
  ['fa-mobile-screen', 'Phần mềm VUA APP'], ['fa-bullhorn', 'Marketing & khai trương'], ['fa-gears', 'Quy trình vận hành']
];
const PT_STEPS = [
  ['Đăng ký thông tin', 'Gửi form bên dưới hoặc gọi hotline, chọn mô hình quan tâm.'],
  ['Tư vấn & khảo sát', 'Chuyên viên trao đổi nhu cầu, khảo sát mặt bằng hoặc khu vực kinh doanh.'],
  ['Đề xuất phương án', 'Nàng Ba gửi phương án hợp tác, chi phí và kế hoạch triển khai chi tiết.'],
  ['Ký hợp đồng', 'Thống nhất quyền lợi, trách nhiệm của hai bên bằng hợp đồng rõ ràng.'],
  ['Đào tạo & setup', 'Đào tạo nhân sự, cài đặt phần mềm, chuẩn bị sản phẩm và không gian.'],
  ['Khai trương & đồng hành', 'Ra mắt, chạy chương trình khách hàng đầu tiên, theo sát vận hành.']
];
const PT_FAQ = [
  ['Tôi chưa có kinh nghiệm spa có hợp tác được không?', 'Được. Mô hình Khởi nghiệp có đào tạo trọn gói và đồng hành vận hành, phù hợp người mới.'],
  ['Cần bao nhiêu vốn để mở spa Nàng Ba?', 'Tùy diện tích, khu vực và quy mô. Sau khi khảo sát, Nàng Ba gửi phương án chi phí cụ thể cho bạn.'],
  ['Spa của tôi đang hoạt động, có cần đổi tên thương hiệu không?', 'Không bắt buộc. Mô hình Đào tạo & Quản lý giúp spa của bạn thêm dịch vụ mẹ & bé mà vẫn giữ thương hiệu riêng.'],
  ['Làm đại lý phân phối có cần nhập số lượng lớn không?', 'Có nhiều cấp đại lý theo sản lượng. Tư vấn viên sẽ gửi chính sách chiết khấu phù hợp với bạn.'],
  ['Nhà đầu tư theo dõi hiệu quả chi nhánh thế nào?', 'Số liệu doanh thu, chi phí, lợi nhuận được ghi nhận trên phần mềm quản lý và báo cáo định kỳ theo hợp đồng.']
];
function renderPartner() {
  const root = $('#partnerPage'); if (!root) return;
  const card = p => `<article class="tr-course"><div class="tr-img" style="background-image:url('${p.img}')"><span><i class="fa-solid ${p.icon}"></i> ${escH(p.name)}</span></div>
    <div class="tr-cbody"><h3>${escH(p.name)}</h3><p>${escH(p.tagline)}</p>
     <ul class="tr-out sm">${p.benefits.slice(0, 3).map(b => `<li><i class="fa-solid fa-check"></i>${escH(b)}</li>`).join('')}</ul>
     <div class="tr-acts"><button class="btn btn-outline btn-sm" data-pt-detail="${p.id}">Xem chi tiết</button><button class="btn btn-primary btn-sm" data-pt-reg="${p.id}">Đăng ký tư vấn</button></div></div></article>`;
  root.innerHTML = `
  <section class="tr-hero pt-hero"><div class="container tr-hero-in">
    <div><span class="tr-eyebrow">HỢP TÁC CÙNG NÀNG BA</span>
     <h1>Cùng Nàng Ba lan tỏa giá trị <em>chăm sóc mẹ & bé</em> đến mọi miền</h1>
     <p>Bốn hình thức hợp tác linh hoạt: nâng cấp spa đang có, khởi nghiệp với thương hiệu Nàng Ba, phân phối sản phẩm hoặc đầu tư mở rộng hệ thống ${BRANCHES.length} chi nhánh.</p>
     <div class="tr-cta"><a class="btn btn-primary" href="#pt-form" data-scroll="pt-form"><i class="fa-regular fa-pen-to-square"></i> Đăng ký tư vấn hợp tác</a><a class="btn tr-ghost" href="#pt-models" data-scroll="pt-models">Xem các mô hình</a></div>
     <ul class="tr-badges">${PARTNER_PROGRAMS.map(p => `<li><i class="fa-solid ${p.icon}"></i>${escH(p.name)}</li>`).join('')}</ul></div>
  </div></section>

  <section class="tr-sec"><div class="container">
    <div class="sec-title"><h2>VÌ SAO HỢP TÁC CÙNG NÀNG BA?</h2></div>
    <div class="tr-why">${PT_WHY.map(([ic, t, d]) => `<div class="tr-why-i"><span><i class="fa-solid ${ic}"></i></span><h4>${t}</h4><p>${d}</p></div>`).join('')}</div>
  </div></section>

  <section class="tr-sec tr-soft" id="pt-models"><div class="container">
    <div class="sec-title"><h2>MÔ HÌNH HỢP TÁC</h2></div>
    <div class="tr-courses pt-models">${PARTNER_PROGRAMS.map(card).join('')}</div>
  </div></section>

  <section class="tr-sec"><div class="container">
    <div class="sec-title"><h2>NÀNG BA HỖ TRỢ GÌ CHO ĐỐI TÁC?</h2></div>
    <div class="pt-sup">${PT_SUPPORT.map(([ic, t]) => `<div><span><i class="fa-solid ${ic}"></i></span><b>${t}</b></div>`).join('')}</div>
  </div></section>

  <section class="tr-sec tr-soft"><div class="container">
    <div class="sec-title"><h2>QUY TRÌNH HỢP TÁC</h2></div>
    <ol class="tr-steps">${PT_STEPS.map(([t, d], i) => `<li><b>${i + 1}</b><h4>${t}</h4><p>${d}</p></li>`).join('')}</ol>
  </div></section>

  <section class="tr-sec"><div class="container tr-faqform">
    <div><div class="sec-title left"><h2>CÂU HỎI THƯỜNG GẶP</h2></div>
     <div class="tr-faq">${PT_FAQ.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>
     <p class="pt-call"><i class="fa-solid fa-phone-volume"></i> Cần trao đổi ngay? Gọi <a href="tel:${SPA_PHONE}">0785 568 539</a></p></div>
    <form class="tr-form" id="pt-form">
     <h3>Đăng ký tư vấn hợp tác</h3><p>Chuyên viên phát triển hệ thống liên hệ lại trong 24 giờ làm việc.</p>
     <label>Họ và tên <b>*</b><input name="name" required autocomplete="name"></label>
     <label>Số điện thoại / Zalo <b>*</b><input name="phone" required inputmode="tel" autocomplete="tel" placeholder="VD: 0912 345 678"></label>
     <label>Khu vực / địa chỉ<input name="address" placeholder="VD: Quận 7, TP. Hồ Chí Minh"></label>
     <fieldset class="pt-types"><legend>Mô hình bạn quan tâm <b>*</b></legend>${PARTNER_PROGRAMS.map((p, i) => `<label><input type="radio" name="type" value="${p.id}" ${i ? '' : 'required'}><i class="fa-solid ${p.icon}"></i>${escH(p.name)}</label>`).join('')}</fieldset>
     <label>Bạn đang là<select name="role"><option>Cá nhân muốn khởi nghiệp</option><option>Chủ spa / cơ sở đang hoạt động</option><option>Cửa hàng / đại lý</option><option>Nhà đầu tư / doanh nghiệp</option></select></label>
     <label>Nhu cầu cụ thể<textarea name="note" rows="2" placeholder="VD: đã có mặt bằng 80m², muốn mở trong quý tới…"></textarea></label>
     <button class="btn btn-primary btn-block" type="submit"><i class="fa-solid fa-paper-plane"></i> Gửi thông tin</button>
    </form>
  </div></section>`;
}
function partnerDetail(id) {
  const p = PARTNER_PROGRAMS.find(x => x.id === id); if (!p) return;
  showDetail(`<div class="detail-hero" style="background-image:url('${p.img}')"><h2>${escH(p.name)}</h2></div>
   <div class="detail-body"><p class="lead">${escH(p.tagline)}</p>
    <p><b>Phù hợp với:</b> ${escH(p.forWho)}</p>
    <ul class="tr-meta big"><li><i class="fa-solid fa-sack-dollar"></i>Vốn / điều kiện: ${escH(p.invest)}</li></ul>
    <div class="detail-cols"><div><h4><i class="fa-solid fa-gift"></i> Quyền lợi đối tác</h4><ul class="tr-out">${p.benefits.map(b => `<li><i class="fa-solid fa-check"></i>${escH(b)}</li>`).join('')}</ul></div>
     <div><h4><i class="fa-solid fa-handshake-angle"></i> Nàng Ba hỗ trợ</h4><ul class="tr-out">${p.support.map(b => `<li><i class="fa-solid fa-check"></i>${escH(b)}</li>`).join('')}</ul>
      <button class="btn btn-primary btn-block" data-pt-reg="${p.id}"><i class="fa-regular fa-pen-to-square"></i> Đăng ký tư vấn mô hình này</button>
      <a class="btn btn-outline btn-block" href="tel:${SPA_PHONE}"><i class="fa-solid fa-phone"></i> Gọi tư vấn</a></div></div></div>`);
}
function partnerReg(id) {
  closeAll(); const f = $('#pt-form'); if (!f) return;
  const r = f.querySelector(`[name=type][value="${id}"]`); if (r) r.checked = true;
  f.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => f.name.focus(), 400);
}
document.addEventListener('click', e => {
  const d = e.target.closest('[data-pt-detail]'), r = e.target.closest('[data-pt-reg]');
  if (d) { e.preventDefault(); partnerDetail(d.dataset.ptDetail); }
  else if (r) { e.preventDefault(); partnerReg(r.dataset.ptReg); }
});
document.addEventListener('submit', e => {
  if (e.target.id !== 'pt-form') return;
  e.preventDefault();
  const d = Object.fromEntries(new FormData(e.target)), p = PARTNER_PROGRAMS.find(x => x.id === d.type);
  if (!phoneOk(d.phone)) return toast('Số điện thoại chưa đúng (9–11 số).');
  if (!p) return toast('Vui lòng chọn mô hình hợp tác.');
  sendLead(d.phone, d.name.trim(), 'Hợp tác: ' + p.name, [`Mô hình: ${p.name}`, `Là: ${d.role}`, d.address ? 'Khu vực: ' + d.address : '', d.note ? 'Nhu cầu: ' + d.note : ''].filter(Boolean).join(' · '));
  e.target.reset(); toast(`Cảm ơn ${d.name.trim()}! Nàng Ba sẽ liên hệ tư vấn hợp tác trong 24 giờ.`);
});
if (location.hash === '#hop-tac') renderPartner();
