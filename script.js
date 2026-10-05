// =====================================================
// SPA NÀNG BA – TÍNH NĂNG
// =====================================================
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const money = n => n.toLocaleString('en-US') + ' đ';
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=900&q=80';
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (_) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} }
};

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3500);
}

// Ảnh lỗi -> thay ảnh dự phòng
document.addEventListener('error', e => {
  if (e.target.tagName === 'IMG' && e.target.src !== FALLBACK_IMG) e.target.src = FALLBACK_IMG;
}, true);

$('#year').textContent = new Date().getFullYear();

// =====================================================
// RENDER NỘI DUNG TỪ data.js
// =====================================================
const serviceCard = s => `
  <article class="service-card" data-service="${s.id}">
    <div class="service-img"><img src="${s.img}" alt="${s.name}" loading="lazy"></div>
    <div class="service-body">
      <h3>${s.name}</h3>
      <p>${s.short}</p>
      <span class="read-more">Read More <i class="fa-solid fa-arrow-right"></i></span>
    </div>
  </article>`;

$('#spaServices').innerHTML = SERVICES.filter(s => s.group === 'spa').map(serviceCard).join('');
$('#homeServices').innerHTML = SERVICES.filter(s => s.group === 'home').map(s => `
  <article class="home-card" data-service="${s.id}">
    <img src="${s.img}" alt="${s.name}" loading="lazy">
    <div class="home-card-body">
      <h3>${s.name}</h3>
      <p>${s.short}</p>
      <span class="btn btn-light btn-sm">Read More</span>
    </div>
  </article>`).join('');

$('#testiTrack').innerHTML = TESTIMONIALS.map(t => `
  <div class="testi-card">
    <i class="fa-solid fa-quote-left quote"></i>
    <p>${t.text}</p>
    <div class="testi-user">
      <img src="${t.img}" alt="${t.name}" loading="lazy">
      <div><strong>${t.name}</strong><span>${t.role}</span></div>
    </div>
  </div>`).join('');

$('#advisorTrack').innerHTML = ADVISORS.map(a => `
  <div class="advisor">
    <div class="advisor-img"><img src="${a.img}" alt="${a.name}" loading="lazy"></div>
    <h4>${a.name}</h4><span>${a.title}</span><p>${a.bio}</p>
  </div>`).join('');

const newsCard = (n, i, type) => `
  <article class="news-card" data-news="${type}:${i}">
    <div class="news-img"><img src="${n.img}" alt="" loading="lazy"><span class="news-date">${n.date}</span></div>
    <div class="news-body">
      ${n.source ? `<span class="news-source">${n.source}</span>` : ''}
      <h4>${n.title}</h4>
      <p>${n.excerpt}</p>
      <span class="read-more">Xem thêm <i class="fa-solid fa-arrow-right"></i></span>
    </div>
  </article>`;
$('#blogGrid').innerHTML = BLOG.map((n, i) => newsCard(n, i, 'blog')).join('');
$('#pressGrid').innerHTML = PRESS.map((n, i) => newsCard(n, i, 'press')).join('');

function renderVideos(active = 0) {
  const v = VIDEOS[active];
  $('#videoFeature').innerHTML = `
    <div class="video-thumb big" data-video="${active}">
      <img src="${v.img}" alt="" loading="lazy"><span class="play"><i class="fa-solid fa-play"></i></span>
      <h4>${v.title}</h4>
    </div>`;
  $('#videoList').innerHTML = VIDEOS.map((x, i) => `
    <div class="video-item ${i === active ? 'active' : ''}" data-pick="${i}">
      <div class="vi-img"><img src="${x.img}" alt="" loading="lazy"><i class="fa-solid fa-play"></i></div>
      <span>${x.title}</span>
    </div>`).join('');
}
renderVideos();
$('#videoList').addEventListener('click', e => {
  const it = e.target.closest('[data-pick]');
  if (it) renderVideos(+it.dataset.pick);
});

$('#spaceTrack').innerHTML = SPACE.map((src, i) => `<img src="${src}" alt="Không gian SPA Nàng Ba ${i + 1}" loading="lazy" data-lightbox="${i}">`).join('');

const partnerHTML = PARTNERS.map(([ic, n]) => `<span class="partner-logo"><i class="fa-solid ${ic}"></i> ${n}</span>`).join('');
$('#partnerTrack').innerHTML = partnerHTML + partnerHTML; // nhân đôi để chạy vòng liên tục

// Select trong form đặt lịch
// value = mã mức giá (NBsso) – máy chủ tính tiền theo mã này (api/_catalog.js)
$('#bookingService').innerHTML = '<option value="">-- Chọn dịch vụ --</option>' +
  SERVICES.map(s => `<optgroup label="${s.name}">${s.prices.map(([n, p, code]) => `<option value="${code}">${n} – ${p}</option>`).join('')}</optgroup>`).join('');
$('#bookingBranch').innerHTML = '<option value="">-- Chọn chi nhánh --</option>' +
  BRANCHES.map(b => `<option>${b.name}</option>`).join('') + '<option>Phục vụ tại nhà</option>';
const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
$('#bookingDate').min = today.toISOString().slice(0, 10);

// =====================================================
// HEADER, MENU, BACK TO TOP
// =====================================================
const header = $('#header'), backTop = $('#backTop');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', scrollY > 60);
  backTop.classList.toggle('show', scrollY > 500);
}, { passive: true });
backTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

const nav = $('#nav'), navBackdrop = $('#navBackdrop');
const setNav = open => { nav.classList.toggle('open', open); navBackdrop.classList.toggle('show', open); };
$('#menuToggle').addEventListener('click', () => setNav(true));
$('#navClose').addEventListener('click', () => setNav(false));
navBackdrop.addEventListener('click', () => setNav(false));
$$('.has-sub > a').forEach(a => a.addEventListener('click', e => {
  if (innerWidth > 1024) return;
  e.preventDefault();
  e.stopPropagation();
  a.parentElement.classList.toggle('open');
}));
$$('.nav .submenu a, .menu > li:not(.has-sub) > a').forEach(a => a.addEventListener('click', () => setNav(false)));

// Tab "Báo chí" từ menu
$$('[data-newstab]').forEach(a => a.addEventListener('click', () => switchTab('press')));

// =====================================================
// BANNER SLIDER
// =====================================================
(() => {
  const slides = $$('.banner-slide'), dotsWrap = $('.slider-dots');
  let i = 0, timer;
  slides.forEach((_, k) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', 'Banner ' + (k + 1));
    b.onclick = () => go(k);
    dotsWrap.appendChild(b);
  });
  const dots = $$('button', dotsWrap);
  function go(n) {
    slides[i].classList.remove('active'); dots[i].classList.remove('active');
    i = (n + slides.length) % slides.length;
    slides[i].classList.add('active'); dots[i].classList.add('active');
    clearInterval(timer); timer = setInterval(() => go(i + 1), 5500);
  }
  $('.banner .prev').onclick = () => go(i - 1);
  $('.banner .next').onclick = () => go(i + 1);
  // vuốt trên điện thoại
  let x0 = null;
  const b = $('.banner');
  b.addEventListener('touchstart', e => x0 = e.touches[0].clientX, { passive: true });
  b.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
    x0 = null;
  });
  go(0);
})();

// =====================================================
// CAROUSEL (dịch vụ tại nhà, cảm nhận, cố vấn, không gian)
// =====================================================
$$('.carousel').forEach(car => {
  const track = $('.carousel-track', car);
  const step = () => (track.firstElementChild?.getBoundingClientRect().width || 300) + parseFloat(getComputedStyle(track).columnGap || 24);
  const next = () => {
    if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 8) track.scrollTo({ left: 0, behavior: 'smooth' });
    else track.scrollBy({ left: step(), behavior: 'smooth' });
  };
  const prev = () => {
    if (track.scrollLeft <= 5) track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' });
    else track.scrollBy({ left: -step(), behavior: 'smooth' });
  };
  $('.car-arrow.next', car)?.addEventListener('click', next);
  $('.car-arrow.prev', car)?.addEventListener('click', prev);
  const ms = +car.dataset.auto;
  if (ms) {
    let t = setInterval(next, ms);
    const stop = () => clearInterval(t), start = () => { stop(); t = setInterval(next, ms); };
    car.addEventListener('mouseenter', stop);
    car.addEventListener('mouseleave', start);
    car.addEventListener('touchstart', stop, { passive: true });
    car.addEventListener('touchend', start);
  }
});

// =====================================================
// TABS TIN TỨC
// =====================================================
function switchTab(name) {
  $$('.news-tabs .tab').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  $$('.news-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === name));
}
$$('.news-tabs .tab').forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));

// =====================================================
// POPUP / MODAL
// =====================================================
function openModal(id) {
  $$('.overlay.open').forEach(m => m.classList.remove('open'));
  $('#' + id).classList.add('open');
  document.body.classList.add('lock');
}
function closeAll() {
  $$('.overlay.open').forEach(m => m.classList.remove('open'));
  $('#videoFrame').innerHTML = '';
  document.body.classList.remove('lock');
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });

function showDetail(html) {
  $('#detailContent').innerHTML = html;
  openModal('detailModal');
  $('#detailModal .modal-box').scrollTop = 0;
}

function serviceDetail(id) {
  const s = SERVICES.find(x => x.id === id);
  if (!s) return;
  showDetail(`
    <div class="detail-hero" style="background-image:url('${s.img}')"><h2>${s.name}</h2></div>
    <div class="detail-body">
      <p class="lead">${s.desc}</p>
      <div class="detail-cols">
        <div><h4><i class="fa-solid fa-list-check"></i> Quy trình</h4><ol class="steps">${s.steps.map(x => `<li>${x}</li>`).join('')}</ol></div>
        <div><h4><i class="fa-solid fa-tags"></i> Bảng giá</h4>
          <table class="price-table">${s.prices.map(([n, p, code]) => `<tr><td>${n}</td><td>${p} <button class="price-book" data-book="${code}">Đặt</button></td></tr>`).join('')}</table>
          <p class="note">* Giá tham khảo, có thể thay đổi theo chi nhánh và chương trình ưu đãi.</p>
          <button class="btn btn-primary btn-block" data-book="${s.prices[0][2]}"><i class="fa-regular fa-calendar-check"></i> Đặt lịch dịch vụ này</button>
          <a class="btn btn-outline btn-block" href="tel:0785568539"><i class="fa-solid fa-phone"></i> Gọi tư vấn</a>
        </div>
      </div>
    </div>`);
}

function newsDetail(key) {
  const [type, i] = key.split(':');
  const n = (type === 'blog' ? BLOG : PRESS)[+i];
  showDetail(`
    <div class="detail-hero" style="background-image:url('${n.img}')"><h2>${n.title}</h2></div>
    <div class="detail-body">
      <p class="meta"><i class="fa-regular fa-calendar"></i> ${n.date}${n.source ? ' · ' + n.source : ''}</p>
      <p class="lead">${n.excerpt}</p>
      <p>[Nội dung đầy đủ của bài viết – cập nhật tại đây.]</p>
      <button class="btn btn-primary" data-open="bookingModal">Đặt lịch tư vấn</button>
    </div>`);
}

function pageDetail(key) {
  if (key === 'products') { location.hash = 'san-pham'; return; }
  if (key === 'allnews') {
    return showDetail(`<div class="detail-body"><h2 class="page-title">Tin tức & Kiến thức</h2><div class="news-grid">${BLOG.map((n, i) => newsCard(n, i, 'blog')).join('')}${PRESS.map((n, i) => newsCard(n, i, 'press')).join('')}</div></div>`);
  }
  const p = PAGES[key];
  if (p) showDetail(`<div class="detail-body"><h2 class="page-title">${p.title}</h2><div class="rich">${p.html}</div></div>`);
}

// =====================================================
// TRANG SẢN PHẨM
// =====================================================
const PER_PAGE = 9;
const shop = { cat: '', sort: 'new', page: 1 };
const priceHTML = n => `${n.toLocaleString('en-US')} <u>đ</u>`;
const catName = id => (CATEGORIES.find(c => c.id === id) || {}).name || '';

const productCard = p => `
  <article class="shop-card" data-product="${p.id}">
    <div class="shop-frame">
      <span class="frame-tag"><i class="fa-solid fa-spa"></i> Nàng Ba</span>
      ${p.old ? `<span class="sale-tag">-${Math.round((1 - p.price / p.old) * 100)}%</span>` : ''}
      <img src="${p.img}" alt="${p.name}" loading="lazy">
      <button class="quick-add" data-add="${p.id}" aria-label="Thêm ${p.name} vào giỏ"><i class="fa-solid fa-cart-plus"></i></button>
    </div>
    <h3>${p.name}</h3>
    <div class="shop-price">${priceHTML(p.price)}${p.old ? `<del>${priceHTML(p.old)}</del>` : ''}</div>
  </article>`;

function renderShopSide() {
  $('#catList').innerHTML = CATEGORIES.map(c => {
    const n = PRODUCTS.filter(p => p.cat === c.id).length;
    return `<li><a href="#san-pham-${c.id}" class="${shop.cat === c.id ? 'active' : ''}"><i class="fa-solid fa-chevron-right"></i> ${c.name} <span>(${n})</span></a></li>`;
  }).join('');
  $('#featList').innerHTML = PRODUCTS.filter(p => p.featured).map(p => `
    <li data-product="${p.id}">
      <img src="${p.img}" alt="" loading="lazy">
      <div><span>${p.name}</span><strong>${priceHTML(p.price)}</strong></div>
    </li>`).join('');
}

function renderShop() {
  let list = PRODUCTS.filter(p => !shop.cat || p.cat === shop.cat);
  const order = {
    new: null,
    popular: (a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0),
    asc: (a, b) => a.price - b.price,
    desc: (a, b) => b.price - a.price,
    name: (a, b) => a.name.localeCompare(b.name, 'vi')
  };
  if (order[shop.sort]) list = [...list].sort(order[shop.sort]);
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  shop.page = Math.min(shop.page, pages);
  const from = (shop.page - 1) * PER_PAGE;
  const shown = list.slice(from, from + PER_PAGE);

  $('#shopTitle').textContent = shop.cat ? catName(shop.cat) : 'Sản phẩm';
  $('#crumbCat').hidden = !shop.cat;
  $('#crumbCat').innerHTML = shop.cat ? `<span>/</span><b>${catName(shop.cat)}</b>` : '';
  $('#crumbShop').classList.toggle('current', !shop.cat);
  $('#resultCount').textContent = list.length ? `Hiển thị ${from + 1}–${from + shown.length} trong ${list.length} sản phẩm` : '';
  $('#shopProducts').innerHTML = shown.map(productCard).join('') || '<p class="empty">Chưa có sản phẩm trong danh mục này.</p>';
  $('#pagination').innerHTML = pages > 1
    ? Array.from({ length: pages }, (_, i) => `<button class="${i + 1 === shop.page ? 'active' : ''}" data-shop-page="${i + 1}">${i + 1}</button>`).join('') +
      (shop.page < pages ? `<button data-shop-page="${shop.page + 1}" aria-label="Trang sau"><i class="fa-solid fa-chevron-right"></i></button>` : '')
    : '';
  renderShopSide();
}

$('#shopSort').addEventListener('change', e => { shop.sort = e.target.value; shop.page = 1; renderShop(); });
$('#pagination').addEventListener('click', e => {
  const b = e.target.closest('[data-shop-page]');
  if (!b) return;
  shop.page = +b.dataset.shopPage;
  renderShop();
  $('.shop-body').scrollIntoView({ behavior: 'smooth' });
});
$('#sideToggle').addEventListener('click', () => $('#sideCats').classList.toggle('open'));

function openProduct(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const related = PRODUCTS.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 3);
  $('#productContent').innerHTML = `
    <div class="pd-grid">
      <div class="shop-frame pd-img"><span class="frame-tag"><i class="fa-solid fa-spa"></i> Nàng Ba</span><img src="${p.img}" alt="${p.name}"></div>
      <div class="pd-info">
        <a href="#san-pham-${p.cat}" class="pd-cat">${catName(p.cat)}</a>
        <h2>${p.name}</h2>
        <div class="shop-price big">${priceHTML(p.price)}${p.old ? `<del>${priceHTML(p.old)}</del>` : ''}</div>
        <p>${p.desc}</p>
        <ul class="pd-meta">
          <li><b>Quy cách:</b> ${p.size}</li>
          <li><b>Tình trạng:</b> <span class="in-stock">Còn hàng</span></li>
        </ul>
        <h4>Hướng dẫn sử dụng</h4>
        <ul class="pd-uses">${p.uses.map(u => `<li>${u}</li>`).join('')}</ul>
        <div class="pd-buy">
          <div class="qty"><button type="button" data-qty="-1" aria-label="Giảm">−</button><input id="pdQty" type="number" value="1" min="1" max="99" aria-label="Số lượng"><button type="button" data-qty="1" aria-label="Tăng">+</button></div>
          <button class="btn btn-primary" id="pdAdd" data-id="${p.id}"><i class="fa-solid fa-cart-plus"></i> Thêm vào giỏ</button>
        </div>
        <button class="btn btn-outline btn-block" id="pdBuy" data-id="${p.id}">Mua ngay</button>
      </div>
    </div>
    ${related.length ? `<div class="pd-related"><h4>Sản phẩm cùng danh mục</h4><div class="shop-products small">${related.map(productCard).join('')}</div></div>` : ''}`;
  openModal('productModal');
  $('#productModal .modal-box').scrollTop = 0;
}
$('#productContent').addEventListener('click', e => {
  const q = e.target.closest('[data-qty]');
  if (q) {
    const i = $('#pdQty');
    i.value = Math.min(99, Math.max(1, (+i.value || 1) + +q.dataset.qty));
    return;
  }
  const btn = e.target.closest('#pdAdd, #pdBuy');
  if (btn) {
    addToCart(btn.dataset.id, Math.max(1, +$('#pdQty').value || 1));
    if (btn.id === 'pdBuy') { closeAll(); $('#cartDrop').classList.add('open'); scrollTo({ top: 0, behavior: 'smooth' }); }
  }
});

// ---------- Điều hướng: trang chủ <-> trang sản phẩm ----------
function route() {
  const h = location.hash.slice(1);
  const onShop = h === 'san-pham' || h.startsWith('san-pham-');
  $('#top').hidden = onShop;
  $('#shopPage').hidden = !onShop;
  $$('.menu > li > a').forEach(a => a.classList.remove('active'));
  if (onShop) {
    const cat = h.slice('san-pham-'.length);
    shop.cat = CATEGORIES.some(c => c.id === cat) ? cat : '';
    shop.page = 1;
    renderShop();
    $('#sideCats').classList.remove('open');
    $('[data-nav="shop"]').classList.add('active');
    scrollTo({ top: 0 });
  } else {
    $('.menu > li > a[href="#top"]').classList.add('active');
    const target = h && document.getElementById(h);
    if (target) requestAnimationFrame(() => target.scrollIntoView());
  }
}
window.addEventListener('hashchange', () => { closeAll(); setNav(false); route(); });

// Một bộ lắng nghe click cho toàn trang
document.addEventListener('click', e => {
  const t = e.target;
  const el = sel => t.closest(sel);

  if (el('[data-close]') || t.classList.contains('overlay')) return closeAll();

  const book = el('[data-book]');
  if (book) { openModal('bookingModal'); $('#bookingService').value = book.dataset.book; return; }

  const open = el('[data-open]');
  if (open) { e.preventDefault(); setNav(false); return openModal(open.dataset.open); }

  const svc = el('[data-service]');
  if (svc) { e.preventDefault(); setNav(false); return serviceDetail(svc.dataset.service); }

  const nw = el('[data-news]');
  if (nw) return newsDetail(nw.dataset.news);

  const pg = el('[data-page]');
  if (pg) { e.preventDefault(); setNav(false); return pageDetail(pg.dataset.page); }

  const vid = el('[data-video]');
  if (vid) {
    const v = VIDEOS[+vid.dataset.video];
    if (!v.youtube) return toast('Video đang được cập nhật. Thêm mã YouTube trong file data.js.');
    $('#videoFrame').innerHTML = `<iframe src="https://www.youtube.com/embed/${v.youtube}?autoplay=1" allow="autoplay; encrypted-media" allowfullscreen title="${v.title}"></iframe>`;
    return openModal('videoModal');
  }

  const lb = el('[data-lightbox]');
  if (lb) return openLightbox(+lb.dataset.lightbox);

  const add = el('[data-add]');
  if (add) { e.stopPropagation(); return addToCart(add.dataset.add); }

  const prod = el('[data-product]');
  if (prod) return openProduct(prod.dataset.product);

  const rm = el('[data-remove]');
  if (rm) { e.stopPropagation(); return removeFromCart(rm.dataset.remove); }

  // đóng giỏ hàng khi bấm ra ngoài
  if (!el('.cart-wrap')) $('#cartDrop').classList.remove('open');
});

// =====================================================
// LIGHTBOX ẢNH KHÔNG GIAN
// =====================================================
let lbIndex = 0;
function openLightbox(i) {
  lbIndex = (i + SPACE.length) % SPACE.length;
  $('#lightboxImg').src = SPACE[lbIndex].replace('w=900', 'w=1600');
  openModal('lightbox');
}
$('#lightbox .prev').addEventListener('click', e => { e.stopPropagation(); openLightbox(lbIndex - 1); });
$('#lightbox .next').addEventListener('click', e => { e.stopPropagation(); openLightbox(lbIndex + 1); });

// =====================================================
// CHI NHÁNH + BẢN ĐỒ
// =====================================================
function renderBranches(area = '') {
  const list = BRANCHES.filter(b => !area || b.area === area);
  $('#branchItems').innerHTML = list.map((b, i) => `
    <div class="branch ${i === 0 ? 'active' : ''}" data-map="${b.map}">
      <h4><i class="fa-solid fa-location-dot"></i> ${b.name}</h4>
      <p>${b.address}</p>
      <div class="branch-actions">
        <a href="tel:${b.phone.replace(/\s/g, '')}"><i class="fa-solid fa-phone"></i> ${b.phone}</a>
        <a href="https://www.google.com/maps/search/${encodeURIComponent(b.map)}" target="_blank" rel="noopener"><i class="fa-solid fa-diamond-turn-right"></i> Chỉ đường</a>
      </div>
    </div>`).join('') || '<p class="empty">Chưa có chi nhánh tại khu vực này.</p>';
  if (list[0]) setMap(list[0].map);
}
const setMap = q => $('#branchMap').src = 'https://maps.google.com/maps?q=' + encodeURIComponent(q) + '&z=14&output=embed';
$('#branchFilter').addEventListener('change', e => renderBranches(e.target.value));
$('#branchItems').addEventListener('click', e => {
  const b = e.target.closest('.branch');
  if (!b || e.target.closest('a')) return;
  $$('.branch').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  setMap(b.dataset.map);
});
renderBranches();

// =====================================================
// GIỎ HÀNG
// =====================================================
let cart = store.get('nangba_cart', {});
function renderCart() {
  const ids = Object.keys(cart).filter(id => PRODUCTS.some(p => p.id === id));
  const count = ids.reduce((s, id) => s + cart[id], 0);
  const total = ids.reduce((s, id) => s + cart[id] * PRODUCTS.find(p => p.id === id).price, 0);
  $('#cartCount').textContent = count;
  $('#cartItems').innerHTML = ids.length ? ids.map(id => {
    const p = PRODUCTS.find(x => x.id === id);
    return `<div class="cart-item"><img src="${p.img}" alt=""><div><b>${p.name}</b><span>${cart[id]} × ${money(p.price)}</span></div><button data-remove="${id}" aria-label="Xóa">&times;</button></div>`;
  }).join('') : '<p class="empty">Chưa có sản phẩm trong giỏ hàng.</p>';
  $('#cartTotal').hidden = $('#checkoutBtn').hidden = !ids.length;
  $('#cartTotal strong').textContent = money(total);
  store.set('nangba_cart', cart);
}
function addToCart(id, qty = 1) {
  cart[id] = (cart[id] || 0) + qty;
  renderCart();
  toast('Đã thêm "' + PRODUCTS.find(p => p.id === id).name + '" vào giỏ hàng');
}
function removeFromCart(id) { delete cart[id]; renderCart(); }
$('#cartBtn').addEventListener('click', e => { e.stopPropagation(); $('#cartDrop').classList.toggle('open'); });
$('#checkoutBtn').addEventListener('click', () => {
  $('#cartDrop').classList.remove('open');
  openCheckout(); // vua-connect.js: gửi đơn về máy chủ + thanh toán
});
renderCart();

// =====================================================
// FORM
// =====================================================
function saveLead(type, data) {
  // TODO: thay bằng gửi về Google Sheet / email / CRM khi triển khai thật
  const list = store.get('nangba_leads', []);
  list.push({ type, ...data, at: new Date().toISOString() });
  store.set('nangba_leads', list);
  console.log('[SPA Nàng Ba]', type, data);
}
$('#bookingForm').addEventListener('submit', e => {
  e.preventDefault();
  submitBooking(e.target); // vua-connect.js: gửi lịch về máy chủ, phần mềm quản lý, Telegram
});
$('#partnerForm').addEventListener('submit', e => {
  e.preventDefault();
  const pd = Object.fromEntries(new FormData(e.target));
  saveLead('partner', pd);
  sendLead(pd.phone || '', pd.name || pd.fullname || 'Khách hợp tác', 'Hợp tác: ' + (pd.type || ''), Object.entries(pd).map(([k, v]) => k + ': ' + v).join(' | '));
  e.target.reset(); closeAll();
  toast('Đã gửi thông tin hợp tác. Nàng Ba sẽ liên hệ trong 24h!');
});

let authMode = 'login';
$$('[data-auth]').forEach(b => b.addEventListener('click', () => {
  authMode = b.dataset.auth;
  $$('[data-auth]').forEach(x => x.classList.toggle('active', x === b));
  $('#loginForm').classList.toggle('register', authMode === 'register');
  $('#authSubmit').textContent = authMode === 'login' ? 'Đăng nhập' : 'Đăng ký';
  $('#loginForm [name=fullname]').required = $('#loginForm [name=pass2]').required = authMode === 'register';
}));
$('#loginForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target;
  if (authMode === 'register' && f.pass.value !== f.pass2.value) return toast('Mật khẩu nhập lại không khớp');
  closeAll(); f.reset();
  toast(authMode === 'login' ? 'Đăng nhập thành công!' : 'Đăng ký thành công! Chào mừng bạn đến với Nàng Ba.');
});
$('#forgotLink').addEventListener('click', e => { e.preventDefault(); toast('Vui lòng liên hệ hotline 0785 568 539 để lấy lại mật khẩu.'); });

// =====================================================
// TÌM KIẾM
// =====================================================
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
const searchIndex = [
  ...SERVICES.map(s => ({ t: s.name, k: 'Dịch vụ', attr: `data-service="${s.id}"` })),
  ...PRODUCTS.map(p => ({ t: p.name, k: 'Sản phẩm', attr: `data-product="${p.id}"` })),
  ...BLOG.map((n, i) => ({ t: n.title, k: 'Tin tức', attr: `data-news="blog:${i}"` })),
  ...PRESS.map((n, i) => ({ t: n.title, k: 'Báo chí', attr: `data-news="press:${i}"` })),
  ...BRANCHES.map(b => ({ t: b.name + ' – ' + b.address, k: 'Chi nhánh', attr: 'data-open="branchModal"' }))
];
function doSearch(q) {
  q = norm(q.trim());
  if (!q) return $('#searchResults').innerHTML = '';
  const hits = searchIndex.filter(x => norm(x.t).includes(q)).slice(0, 10);
  $('#searchResults').innerHTML = hits.length
    ? hits.map(h => `<button ${h.attr}><small>${h.k}</small>${h.t}</button>`).join('')
    : '<p>Không tìm thấy kết quả phù hợp.</p>';
}
$('#searchBtn').addEventListener('click', () => { openModal('searchModal'); setTimeout(() => $('#searchInput').focus(), 100); });
$('#searchInput').addEventListener('input', e => doSearch(e.target.value));
$('.nav-search input').addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  setNav(false); openModal('searchModal');
  $('#searchInput').value = e.target.value; doSearch(e.target.value);
});

// =====================================================
// HIỆU ỨNG XUẤT HIỆN KHI CUỘN
// =====================================================
const io = new IntersectionObserver(es => es.forEach(en => {
  if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
}), { threshold: .12 });
$$('.sec-title, .service-card, .why-main, .why-item, .news-card, .intro-media, .intro-text, .video-layout')
  .forEach(el => { el.classList.add('reveal'); io.observe(el); });

route();
