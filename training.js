// =====================================================
// HỌC VIỆN NÀNG BA – trang landing đào tạo nghề (#dao-tao)
// Nội dung khóa học sửa ở COURSES (data.js). Form đăng ký gửi lead về Telegram + phần mềm quản lý
// (Danh sách chờ "Gọi lại tư vấn" của chi nhánh học viên chọn) qua sendLead() trong vua-connect.js.
// =====================================================
const TRAIN_WHY = [
  ['fa-user-nurse', 'Giảng viên là nữ hộ sinh, bác sĩ', 'Kiến thức chuẩn y khoa, kỹ thuật thực tế từ người đang trực tiếp chăm sóc mẹ & bé mỗi ngày.'],
  ['fa-hands', 'Học thực hành là chính', 'Thực hành trên mô hình, sau đó trên khách thật tại spa dưới sự giám sát của giảng viên.'],
  ['fa-users', 'Lớp nhỏ, kèm 1–1', 'Mỗi lớp ít học viên để giảng viên sửa tay nghề cho từng người.'],
  ['fa-certificate', 'Cấp chứng chỉ hoàn thành', 'Học viên đạt bài sát hạch cuối khóa được cấp chứng chỉ của Học viện Nàng Ba.'],
  ['fa-briefcase', 'Giới thiệu việc làm', 'Ưu tiên tuyển vào 6 chi nhánh Nàng Ba hoặc giới thiệu đến spa đối tác.'],
  ['fa-clock', 'Lịch học linh hoạt', 'Chọn học ca ngày, ca tối hoặc cuối tuần; học tại chi nhánh gần nhà.']
];
const TRAIN_STEPS = [
  ['Tư vấn & xếp lớp', 'Gặp tư vấn viên, chọn khóa học, ca học và chi nhánh phù hợp.'],
  ['Học lý thuyết', 'Kiến thức nền tảng về cơ thể mẹ & bé, an toàn và chống chỉ định.'],
  ['Thực hành trên mô hình', 'Giảng viên làm mẫu, học viên luyện từng thao tác đến khi thành thạo.'],
  ['Thực hành trên khách thật', 'Làm liệu trình cho khách tại spa, có giảng viên kèm và chấm điểm.'],
  ['Sát hạch & cấp chứng chỉ', 'Bài thi lý thuyết và tay nghề; đạt yêu cầu được cấp chứng chỉ.'],
  ['Việc làm & đồng hành', 'Giới thiệu việc làm, hỗ trợ mở spa hoặc nhượng quyền Nàng Ba.']
];
const TRAIN_FAQ = [
  ['Chưa biết gì về spa có học được không?', 'Được. Các khóa Massage bầu & sau sinh, Tắm & massage bé, Chăm sóc da đều bắt đầu từ cơ bản. Giảng viên kèm sát đến khi bạn làm được.'],
  ['Học xong có được nhận vào làm tại Nàng Ba không?', 'Học viên đạt loại khá trở lên được ưu tiên tuyển vào các chi nhánh Nàng Ba, hoặc giới thiệu đến spa đối tác.'],
  ['Có lớp buổi tối hoặc cuối tuần không?', 'Có. Bạn chọn ca học khi đăng ký, tư vấn viên sẽ xếp lớp phù hợp ở chi nhánh gần nhất.'],
  ['Học phí bao nhiêu, có trả góp không?', 'Học phí tùy khóa và ưu đãi từng đợt. Để lại số điện thoại, tư vấn viên sẽ gửi bảng học phí và chính sách hỗ trợ.'],
  ['Mẹ bỉm muốn tự chăm con thì có khóa ngắn không?', 'Khóa Tắm & massage bé (2 tuần) rất phù hợp. Có thể học buổi tối hoặc cuối tuần.']
];
function renderTraining() {
  const root = $('#trainPage'); if (!root) return;
  const card = c => `<article class="tr-course"><div class="tr-img" style="background-image:url('${c.img}')"><span>${escH(c.level)}</span></div>
    <div class="tr-cbody"><h3>${escH(c.name)}</h3><p>${escH(c.short)}</p>
     <ul class="tr-meta"><li><i class="fa-regular fa-clock"></i>${escH(c.duration)} · ${escH(c.sessions)}</li><li><i class="fa-solid fa-tag"></i>Học phí: ${escH(c.fee)}</li></ul>
     <div class="tr-acts"><button class="btn btn-outline btn-sm" data-course-detail="${c.id}">Xem chi tiết</button><button class="btn btn-primary btn-sm" data-course-reg="${c.id}">Đăng ký</button></div></div></article>`;
  root.innerHTML = `
  <section class="tr-hero"><div class="container tr-hero-in">
    <div><span class="tr-eyebrow">HỌC VIỆN NÀNG BA</span>
     <h1>Học nghề chăm sóc <em>Mẹ & Bé</em>, spa trị liệu – làm được việc ngay sau khóa học</h1>
     <p>${COURSES.length} khóa đào tạo từ cơ bản đến nâng cao, giảng dạy bởi nữ hộ sinh và chuyên gia. Học thực hành trên khách thật, cấp chứng chỉ và giới thiệu việc làm tại hệ thống ${BRANCHES.length} chi nhánh.</p>
     <div class="tr-cta"><a class="btn btn-primary" href="#tr-form" data-scroll="tr-form"><i class="fa-regular fa-pen-to-square"></i> Đăng ký tư vấn miễn phí</a><a class="btn tr-ghost" href="#tr-courses" data-scroll="tr-courses">Xem các khóa học</a></div>
     <ul class="tr-badges"><li><i class="fa-solid fa-circle-check"></i>Thực hành là chính</li><li><i class="fa-solid fa-circle-check"></i>Lớp nhỏ, kèm 1–1</li><li><i class="fa-solid fa-circle-check"></i>Cấp chứng chỉ</li><li><i class="fa-solid fa-circle-check"></i>Giới thiệu việc làm</li></ul></div>
  </div></section>

  <section class="tr-sec"><div class="container">
    <div class="sec-title"><h2>VÌ SAO CHỌN HỌC VIỆN NÀNG BA?</h2></div>
    <div class="tr-why">${TRAIN_WHY.map(([ic, t, d]) => `<div class="tr-why-i"><span><i class="fa-solid ${ic}"></i></span><h4>${t}</h4><p>${d}</p></div>`).join('')}</div>
  </div></section>

  <section class="tr-sec tr-soft" id="tr-courses"><div class="container">
    <div class="sec-title"><h2>CÁC KHÓA ĐÀO TẠO</h2></div>
    <div class="tr-courses">${COURSES.map(card).join('')}</div>
  </div></section>

  <section class="tr-sec"><div class="container">
    <div class="sec-title"><h2>LỘ TRÌNH HỌC</h2></div>
    <ol class="tr-steps">${TRAIN_STEPS.map(([t, d], i) => `<li><b>${i + 1}</b><h4>${t}</h4><p>${d}</p></li>`).join('')}</ol>
  </div></section>

  <section class="tr-sec tr-soft"><div class="container">
    <div class="sec-title"><h2>ĐỘI NGŨ GIẢNG VIÊN & CỐ VẤN</h2></div>
    <div class="tr-team">${ADVISORS.map(a => `<div class="tr-mem"><img src="${a.img}" alt="${escH(a.name)}" loading="lazy"><h4>${escH(a.name)}</h4><small>${escH(a.title)}</small><p>${escH(a.bio)}</p></div>`).join('')}</div>
  </div></section>

  <section class="tr-sec"><div class="container tr-job">
    <div><h2>Học xong làm gì?</h2>
     <ul><li><i class="fa-solid fa-store"></i><div><b>Làm việc tại hệ thống Nàng Ba</b><span>Ưu tiên tuyển kỹ thuật viên vào ${BRANCHES.length} chi nhánh: ${BRANCHES.map(b => escH(b.name.replace('Nàng Ba – ', ''))).join(', ')}.</span></div></li>
      <li><i class="fa-solid fa-house-medical"></i><div><b>Nhận ca chăm sóc tại nhà</b><span>Làm dịch vụ mẹ bầu, sau sinh, tắm bé tại nhà khách cùng Nàng Ba.</span></div></li>
      <li><i class="fa-solid fa-shop"></i><div><b>Mở spa riêng hoặc nhượng quyền</b><span>Được hỗ trợ quy trình, sản phẩm và phần mềm quản lý VUA APP.</span></div></li></ul>
     <button class="btn btn-outline" data-open="partnerModal"><i class="fa-solid fa-handshake"></i> Tìm hiểu hợp tác – nhượng quyền</button></div>
    <div class="tr-job-img" style="background-image:url('https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=900&q=80')"></div>
  </div></section>

  <section class="tr-sec tr-soft"><div class="container tr-faqform">
    <div><div class="sec-title left"><h2>CÂU HỎI THƯỜNG GẶP</h2></div>
     <div class="tr-faq">${TRAIN_FAQ.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div></div>
    <form class="tr-form" id="tr-form">
     <h3>Đăng ký tư vấn khóa học</h3><p>Tư vấn viên gọi lại trong giờ làm việc, miễn phí.</p>
     <label>Họ và tên <b>*</b><input name="name" required autocomplete="name"></label>
     <label>Số điện thoại / Zalo <b>*</b><input name="phone" required inputmode="tel" autocomplete="tel" placeholder="VD: 0912 345 678"></label>
     <label>Khóa học quan tâm <b>*</b><select name="course" required><option value="">-- Chọn khóa học --</option>${COURSES.map(c => `<option value="${c.id}">${escH(c.name)} (${escH(c.duration)})</option>`).join('')}</select></label>
     <div class="tr-2"><label>Học tại chi nhánh<select name="branch">${BRANCHES.map(b => `<option>${escH(b.name)}</option>`).join('')}</select></label>
      <label>Ca học mong muốn<select name="shift"><option>Ca ngày</option><option>Ca tối</option><option>Cuối tuần</option></select></label></div>
     <label>Ghi chú<textarea name="note" rows="2" placeholder="VD: đã có kinh nghiệm 1 năm, muốn học nâng cao…"></textarea></label>
     <button class="btn btn-primary btn-block" type="submit"><i class="fa-solid fa-paper-plane"></i> Gửi đăng ký</button>
    </form>
  </div></section>`;
}
function courseDetail(id) {
  const c = COURSES.find(x => x.id === id); if (!c) return;
  showDetail(`<div class="detail-hero" style="background-image:url('${c.img}')"><h2>${escH(c.name)}</h2></div>
   <div class="detail-body"><p class="lead">${escH(c.short)}</p>
    <ul class="tr-meta big"><li><i class="fa-regular fa-clock"></i>Thời lượng: ${escH(c.duration)} (${escH(c.sessions)})</li><li><i class="fa-solid fa-layer-group"></i>Trình độ: ${escH(c.level)}</li><li><i class="fa-solid fa-tag"></i>Học phí: ${escH(c.fee)}</li></ul>
    <p><b>Dành cho:</b> ${escH(c.forWho)}</p>
    <div class="detail-cols"><div><h4><i class="fa-solid fa-book-open"></i> Nội dung học</h4><ol class="steps">${c.modules.map(m => `<li>${escH(m)}</li>`).join('')}</ol></div>
     <div><h4><i class="fa-solid fa-award"></i> Học xong bạn làm được</h4><ul class="tr-out">${c.outcomes.map(o => `<li><i class="fa-solid fa-check"></i>${escH(o)}</li>`).join('')}</ul>
      <button class="btn btn-primary btn-block" data-course-reg="${c.id}"><i class="fa-regular fa-pen-to-square"></i> Đăng ký tư vấn khóa này</button>
      <a class="btn btn-outline btn-block" href="tel:${SPA_PHONE}"><i class="fa-solid fa-phone"></i> Gọi tư vấn</a></div></div></div>`);
}
function courseReg(id) {
  closeAll(); const f = $('#tr-form'); if (!f) return;
  f.course.value = id; f.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => f.name.focus(), 400);
}
document.addEventListener('click', e => {
  const d = e.target.closest('[data-course-detail]'), r = e.target.closest('[data-course-reg]'), sc = e.target.closest('[data-scroll]');
  if (d) { e.preventDefault(); courseDetail(d.dataset.courseDetail); }
  else if (r) { e.preventDefault(); courseReg(r.dataset.courseReg); }
  else if (sc) { e.preventDefault(); const t = document.getElementById(sc.dataset.scroll); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
});
document.addEventListener('submit', e => {
  if (e.target.id !== 'tr-form') return;
  e.preventDefault();
  const d = Object.fromEntries(new FormData(e.target)), c = COURSES.find(x => x.id === d.course);
  if (!phoneOk(d.phone)) return toast('Số điện thoại chưa đúng (9–11 số).');
  sendLead(d.phone, d.name.trim(), 'Đào tạo: ' + (c ? c.name : d.course), `Khóa học: ${c ? c.name : d.course} · Ca: ${d.shift}${d.note ? ' · Ghi chú: ' + d.note : ''}`, d.branch);
  e.target.reset(); toast(`Cảm ơn ${d.name.trim()}! Học viện Nàng Ba sẽ gọi tư vấn sớm nhất.`);
});
if (location.hash === '#dao-tao') renderTraining();
