// =====================================================
// SPA NÀNG BA – KẾT NỐI HỆ THỐNG (VUA APP)
// Đặt lịch / đặt hàng → máy chủ /api/orders (tự tính tiền theo api/_catalog.js)
// → báo Telegram, vào phần mềm quản lý (/app/), thanh toán VietQR ACB giảm 20%,
// SePay báo tiền về /api/sepay-webhook → trang tự hiện "Thanh toán thành công".
// Chat với khách: nút Zalo 0325 637 863 (góc phải). Form hợp tác gửi SĐT qua /api/chat → Telegram.
// =====================================================
const INBOX = 'vua-web-inbox';           // hộp thư phần mềm quản lý đọc khi mở trên cùng trình duyệt
const SPA_PHONE = '0785568539';
const PAYNOW_PCT = 20;
const BANK = { bin: '970416', acc: '229338189', bank: 'ACB', holder: 'Trương Thị Phương' };
const vnd = n => Math.round(n || 0).toLocaleString('vi-VN') + 'đ';
const escH = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const inboxPush = o => { const a = store.get(INBOX, []); a.push(o); store.set(INBOX, a); };

// ---------- Mã QR (VietQR / EMVCo) tạo ngay trên trang ----------
const QRGEN=(()=>{
  const ECC=[-1,10,16,26,18,24,16,18,22,22,26],NB=[-1,1,1,1,2,2,4,4,4,5,5];
  const raw=v=>{let r=(16*v+128)*v+64;if(v>=2){const na=Math.floor(v/7)+2;r-=(25*na-10)*na-55;if(v>=7)r-=36}return r};
  const dcw=v=>Math.floor(raw(v)/8)-ECC[v]*NB[v];
  const mul=(x,y)=>{let z=0;for(let i=7;i>=0;i--){z=(z<<1)^((z>>>7)*0x11D);z^=((y>>>i)&1)*x}return z&255};
  const div=d=>{const r=Array(d-1).fill(0).concat([1]);let root=1;for(let i=0;i<d;i++){for(let j=0;j<r.length;j++){r[j]=mul(r[j],root);if(j+1<r.length)r[j]^=r[j+1]}root=mul(root,2)}return r};
  const rem=(data,dv)=>{const r=dv.map(()=>0);for(const b of data){const f=b^r.shift();r.push(0);dv.forEach((c,i)=>r[i]^=mul(c,f))}return r};
  function encode(text){
    const bytes=Array.from(new TextEncoder().encode(text));let v=1;
    for(;v<=10;v++)if(4+(v<10?8:16)+bytes.length*8<=dcw(v)*8)break;
    if(v>10)throw new Error('QR: nội dung quá dài');
    const bits=[],put=(val,n)=>{for(let i=n-1;i>=0;i--)bits.push((val>>>i)&1)};
    put(4,4);put(bytes.length,v<10?8:16);bytes.forEach(b=>put(b,8));
    const cap=dcw(v)*8;put(0,Math.min(4,cap-bits.length));put(0,(8-bits.length%8)%8);
    for(let p=0xEC;bits.length<cap;p^=0xEC^0x11)put(p,8);
    const data=[];for(let i=0;i<bits.length;i+=8){let b=0;for(let j=0;j<8;j++)b=(b<<1)|bits[i+j];data.push(b)}
    const nb=NB[v],el=ECC[v],rc=Math.floor(raw(v)/8),ns=nb-rc%nb,sl=Math.floor(rc/nb),dv=div(el),blocks=[];
    for(let i=0,k=0;i<nb;i++){const d=data.slice(k,k+sl-el+(i<ns?0:1));k+=d.length;const e=rem(d,dv);if(i<ns)d.push(0);blocks.push(d.concat(e))}
    const cw=[];for(let i=0;i<blocks[0].length;i++)blocks.forEach((b,j)=>{if(i!==sl-el||j>=ns)cw.push(b[i])});
    const n=v*4+17,M=[...Array(n)].map(()=>Array(n).fill(false)),F=[...Array(n)].map(()=>Array(n).fill(false));
    const set=(x,y,d)=>{M[y][x]=d;F[y][x]=true};
    for(let i=0;i<n;i++){set(6,i,i%2===0);set(i,6,i%2===0)}
    const finder=(x,y)=>{for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const d=Math.max(Math.abs(dx),Math.abs(dy)),xx=x+dx,yy=y+dy;if(xx>=0&&xx<n&&yy>=0&&yy<n)set(xx,yy,d!==2&&d!==4)}};
    finder(3,3);finder(n-4,3);finder(3,n-4);
    if(v>1){const na=Math.floor(v/7)+2,step=Math.ceil((v*4+4)/(na*2-2))*2,al=[6];for(let p=n-7;al.length<na;p-=step)al.splice(1,0,p);
      al.forEach((ax,i)=>al.forEach((ay,j)=>{if((i===0&&j===0)||(i===0&&j===na-1)||(i===na-1&&j===0))return;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)set(ax+dx,ay+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1)}))}
    const fmt=mask=>{const d=mask;let r=d;for(let i=0;i<10;i++)r=(r<<1)^((r>>>9)*0x537);const b=((d<<10)|r)^0x5412,g=i=>((b>>>i)&1)!==0;
      for(let i=0;i<=5;i++)set(8,i,g(i));set(8,7,g(6));set(8,8,g(7));set(7,8,g(8));for(let i=9;i<15;i++)set(14-i,8,g(i));
      for(let i=0;i<8;i++)set(n-1-i,8,g(i));for(let i=8;i<15;i++)set(8,n-15+i,g(i));set(8,n-8,true)};
    fmt(0);
    if(v>=7){let r=v;for(let i=0;i<12;i++)r=(r<<1)^((r>>>11)*0x1F25);const b=(v<<12)|r;for(let i=0;i<18;i++){const c=((b>>>i)&1)!==0,a=n-11+i%3,bb=Math.floor(i/3);set(a,bb,c);set(bb,a,c)}}
    let bi=0;for(let right=n-1;right>=1;right-=2){if(right===6)right=5;for(let vert=0;vert<n;vert++)for(let j=0;j<2;j++){const x=right-j,y=((right+1)&2)===0?n-1-vert:vert;if(!F[y][x]&&bi<cw.length*8){M[y][x]=((cw[bi>>>3]>>>(7-(bi&7)))&1)!==0;bi++}}}
    const MF=[(x,y)=>(x+y)%2===0,(x,y)=>y%2===0,(x,y)=>x%3===0,(x,y)=>(x+y)%3===0,(x,y)=>(Math.floor(x/3)+Math.floor(y/2))%2===0,(x,y)=>x*y%2+x*y%3===0,(x,y)=>(x*y%2+x*y%3)%2===0,(x,y)=>((x+y)%2+x*y%3)%2===0];
    const apply=m=>{for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(!F[y][x]&&MF[m](x,y))M[y][x]=!M[y][x]};
    const penalty=()=>{let p=0,dark=0;
      for(let y=0;y<n;y++){let run=1;for(let x=1;x<=n;x++){if(x<n&&M[y][x]===M[y][x-1])run++;else{if(run>=5)p+=run-2;run=1}}}
      for(let x=0;x<n;x++){let run=1;for(let y=1;y<=n;y++){if(y<n&&M[y][x]===M[y-1][x])run++;else{if(run>=5)p+=run-2;run=1}}}
      for(let y=0;y<n-1;y++)for(let x=0;x<n-1;x++){const c=M[y][x];if(c===M[y][x+1]&&c===M[y+1][x]&&c===M[y+1][x+1])p+=3}
      const pat=[true,false,true,true,true,false,true];
      for(let y=0;y<n;y++)for(let x=0;x<=n-7;x++){if(pat.every((c,k)=>M[y][x+k]===c)){const L=[1,2,3,4].every(k=>x-k<0||!M[y][x-k]),R=[1,2,3,4].every(k=>x+6+k>=n||!M[y][x+6+k]);if(L||R)p+=40}}
      for(let x=0;x<n;x++)for(let y=0;y<=n-7;y++){if(pat.every((c,k)=>M[y+k][x]===c)){const U=[1,2,3,4].every(k=>y-k<0||!M[y-k][x]),D=[1,2,3,4].every(k=>y+6+k>=n||!M[y+6+k][x]);if(U||D)p+=40}}
      M.forEach(r=>r.forEach(c=>{if(c)dark++}));p+=Math.floor(Math.abs(dark*20-n*n*10)/(n*n))*10;return p};
    let best=0,bp=Infinity;for(let m=0;m<8;m++){apply(m);fmt(m);const p=penalty();if(p<bp){bp=p;best=m}apply(m)}
    apply(best);fmt(best);return M;
  }
  function svg(text,px){const M=encode(text),n=M.length,q=4,s=n+q*2;let d='';M.forEach((r,y)=>r.forEach((c,x)=>{if(c)d+=`M${x+q} ${y+q}h1v1h-1z`}));
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" width="${px||160}" height="${px||160}" shape-rendering="crispEdges" role="img" aria-label="Mã QR"><rect width="${s}" height="${s}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`}
  return {encode,svg};
})();

function crc16(s){let c=0xFFFF;for(const ch of new TextEncoder().encode(s)){c^=ch<<8;for(let i=0;i<8;i++)c=(c&0x8000)?((c<<1)^0x1021)&0xFFFF:(c<<1)&0xFFFF}return c.toString(16).toUpperCase().padStart(4,'0')}
const tlv=(id,v)=>id+String(v.length).padStart(2,'0')+v;
function vietqr(bin,acc,amount,info){
  const cons=tlv('00','A000000727')+tlv('01',tlv('00',bin)+tlv('01',acc))+tlv('02','QRIBFTTA');
  const noAccent=String(info||'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[đĐ]/g,'D').replace(/[^A-Za-z0-9 -]/g,'').slice(0,25);
  let p=tlv('00','01')+tlv('01','12')+tlv('38',cons)+tlv('53','704')+(amount?tlv('54',String(Math.round(amount))):'')+tlv('58','VN')+(noAccent?tlv('62',tlv('08',noAccent)):'')+'6304';
  return p+crc16(p);
}

// ---------- Danh mục (từ data.js) ----------
const OPTS = {};
SERVICES.forEach(s => s.prices.forEach(([label, price, code]) => {
  const m = label.match(/(\d+) phút/);
  OPTS[code] = { code, name: s.name + ' – ' + label, price: Number(String(price).replace(/\D/g, '')), min: m ? +m[1] : 60 };
}));

// ---------- Máy chủ ----------
async function apiCall(method, body, query) {
  try {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 10000);
    const r = await fetch('api/orders' + (query || ''), { method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined, signal: ctl.signal, cache: 'no-store' });
    clearTimeout(t); const j = await r.json().catch(() => null); return r.ok ? j : null;
  } catch (e) { return null; }
}
function newCode() {
  const d = new Date(), p = n => String(n).padStart(2, '0');
  return 'HM' + String(d.getFullYear()).slice(2) + p(d.getMonth() + 1) + p(d.getDate()) + Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, 'X');
}
const cartProducts = () => Object.keys(cart).map(id => { const p = PRODUCTS.find(x => x.id === id); return p && cart[id] > 0 ? { id, name: p.name, qty: cart[id], price: p.price } : null; }).filter(Boolean);
const phoneOk = p => { const d = String(p || '').replace(/\D/g, ''); return d.length >= 9 && d.length <= 11 ? d : ''; };

let ORDER = null, BUSY = false, poll = null;
async function sendOrder(order, btn) {
  if (BUSY) return false; BUSY = true;
  const label = btn && btn.innerHTML; if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang gửi…'; }
  const srv = await apiCall('POST', order);
  BUSY = false; if (btn) { btn.disabled = false; btn.innerHTML = label; }
  if (srv && srv.ok) order.server = { total: srv.total, payAmount: srv.payAmount };
  inboxPush(order);
  if (!order.server && !store.get(INBOX, []).some(x => x.id === order.id)) { toast('Chưa gửi được. Chị vui lòng gọi 0785 568 539 để đặt nhé!'); return false; }
  ORDER = order; openModal('payModal'); renderPay(); return true;
}

// Đặt mua sản phẩm từ giỏ hàng
function openCheckout() {
  const ps = cartProducts(); if (!ps.length) return toast('Giỏ hàng đang trống.');
  $('#coItems').innerHTML = ps.map(p => `<div><span>${escH(p.name)} × ${p.qty}</span><b>${vnd(p.price * p.qty)}</b></div>`).join('') +
    `<div class="co-total"><span>Tạm tính</span><b>${vnd(ps.reduce((s, p) => s + p.price * p.qty, 0))}</b></div>`;
  openModal('checkoutModal');
}
$('#checkoutForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target, d = Object.fromEntries(new FormData(f));
  const phone = phoneOk(d.phone); if (!phone) return toast('Số điện thoại chưa đúng (9–11 số).');
  if (d.ship === 'Giao tận nhà' && !d.address.trim()) return toast('Vui lòng nhập địa chỉ giao hàng.');
  const products = cartProducts(); if (!products.length) return toast('Giỏ hàng đang trống.');
  const now = new Date(), p = n => String(n).padStart(2, '0'), code = newCode();
  const order = {
    id: 'web_' + code, code, createdAt: now.toISOString(), xung: '', name: d.name.trim(), phone, email: d.email || '', address: d.address || '',
    notes: ['Đơn mua sản phẩm – ' + d.ship, d.note || ''].filter(Boolean).join(' · '),
    date: `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`, time: `${p(now.getHours())}:${p(now.getMinutes())}`, duration: 15, staffId: '', staffName: '',
    items: [], products, total: products.reduce((s, x) => s + x.price * x.qty, 0), status: 'new'
  };
  sendOrder(order, f.querySelector('[type=submit]')).then(ok => { if (ok) { f.reset(); cart = {}; renderCart(); } });
});

// ---------- TRANG ĐẶT LỊCH (#dat-lich) ----------
// 1 Thông tin khách · 2 Dịch vụ (nhiều) · 3 Sản phẩm mua kèm (đồng bộ giỏ hàng) · 4 Chi nhánh & thời gian (giờ kín làm mờ)
// · 5 Nhân viên + ghi chú · khung tóm tắt + Xác nhận → gửi /api/orders → bảng thanh toán QR (giảm 20%).
const HOME = 'Phục vụ tại nhà';
const SLOTS = []; for (let m = 8 * 60 + 30; m <= 20 * 60; m += 30) SLOTS.push(String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'));
const WD = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
const ymdOf = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const hm = t => { const [h, m] = String(t).split(':').map(Number); return h * 60 + m; };
const BK = { xung: 'Chị', name: '', phone: '', birthday: '', email: '', address: '', svcs: [], branch: '', date: ymdOf(new Date()), time: '', staff: '', notes: '', addSvc: '' };
const BUSYMAP = {};   // 'ngày|chi nhánh' → [{time, duration, staffId}] (lịch khách đã đặt online)
function bookAdd(code) { if (OPTS[code] && !BK.svcs.includes(code)) BK.svcs.push(code); }
const bkBranch = () => BRANCHES.find(b => b.name === BK.branch);
const bkStaff = () => (bkBranch() || {}).staff || [];
const bkDur = () => BK.svcs.reduce((s, c) => s + OPTS[c].min, 0) || 60;
const bkTotals = () => { const ps = cartProducts(); const sv = BK.svcs.reduce((s, c) => s + OPTS[c].price, 0), pr = ps.reduce((s, p) => s + p.price * p.qty, 0); return { ps, sv, pr, total: sv + pr }; };
async function loadBusy() {
  if (!BK.branch || BK.branch === HOME) return;
  const k = BK.date + '|' + BK.branch; if (BUSYMAP[k]) return;
  const j = await apiCall('GET', null, `?busy=1&date=${BK.date}&branch=${encodeURIComponent(BK.branch)}`);
  BUSYMAP[k] = (j && j.busy) || []; bkPaint();
}
// trạng thái 1 khung giờ: '' trống | 'past' đã qua | 'full' kín (hết nhân viên / nhân viên đã chọn bận)
function slotState(t) {
  const now = new Date(), start = hm(t), end = start + bkDur();
  if (BK.date === ymdOf(now) && start <= now.getHours() * 60 + now.getMinutes() + 30) return 'past';
  if (!BK.branch || BK.branch === HOME) return '';
  const over = (BUSYMAP[BK.date + '|' + BK.branch] || []).filter(b => { const s = hm(b.time), e = s + (b.duration || 60); return s < end && start < e; });
  if (BK.staff) return over.some(b => b.staffId === BK.staff) ? 'full' : '';
  return over.length >= Math.max(1, bkStaff().length) ? 'full' : '';
}
const step = (n, title, sub, body) => `<section class="bk-card"><div class="bk-h"><span class="bk-n">${n}</span><div><h2>${title}</h2>${sub ? `<p>${sub}</p>` : ''}</div></div>${body}</section>`;
const fld = (label, html, req) => `<label class="bk-f"><span>${label}${req ? ' <b>*</b>' : ''}</span>${html}</label>`;
function renderBooking() {
  const root = $('#bookRoot'); if (!root) return;
  if (!BK.branch) BK.branch = BRANCHES[0].name;
  const days = [...Array(14)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d; });
  root.innerHTML = `<div class="bk-grid"><div class="bk-main">
   ${step(1, 'Thông tin khách hàng', '', `<div class="bk-row3">
     ${fld('Xưng hô', `<select data-bk="xung">${['Chị', 'Anh', 'Em', 'Cô'].map(x => `<option ${BK.xung === x ? 'selected' : ''}>${x}</option>`).join('')}</select>`)}
     ${fld('Họ và tên', `<input data-bk="name" value="${escH(BK.name)}" placeholder="VD: Nguyễn Thu Trang" autocomplete="name">`, 1)}
     ${fld('Số điện thoại / Zalo', `<input data-bk="phone" value="${escH(BK.phone)}" placeholder="VD: 0912 345 678" inputmode="tel" autocomplete="tel">`, 1)}
     ${fld('Ngày sinh', `<input type="date" data-bk="birthday" value="${escH(BK.birthday)}">`)}
     ${fld('Email', `<input type="email" data-bk="email" value="${escH(BK.email)}" placeholder="Không bắt buộc">`)}
     ${fld('Địa chỉ', `<input data-bk="address" value="${escH(BK.address)}" placeholder="Bắt buộc nếu phục vụ tại nhà">`)}</div>`)}
   ${step(2, 'Dịch vụ', 'Chọn một hoặc nhiều dịch vụ, mỗi mức giá có thời lượng riêng', `<div id="bkSvcs"></div>
     <select class="bk-add" data-bk="addSvc"><option value="">+ Thêm dịch vụ</option>${SERVICES.map(s => `<optgroup label="${escH(s.name)}">${s.prices.map(([n, p, c]) => `<option value="${c}">${escH(n)} – ${p}</option>`).join('')}</optgroup>`).join('')}</select>`)}
   ${step(3, 'Sản phẩm mua kèm', 'Không bắt buộc, nhận tại spa khi đến', `<div class="bk-prods" id="bkProds"></div>`)}
   ${step(4, 'Chi nhánh & thời gian', '<span id="bkWhen"></span>', `<div class="bk-chips" id="bkBranches">${[...BRANCHES.map(b => b.name), HOME].map(n => `<button type="button" class="bk-chip" data-branch="${escH(n)}">${n === HOME ? '<i class="fa-solid fa-house"></i> ' : '<i class="fa-solid fa-location-dot"></i> '}${escH(n.replace('Nàng Ba – ', ''))}</button>`).join('')}</div>
     <div class="bk-days">${days.map(d => `<button type="button" class="bk-day" data-day="${ymdOf(d)}"><small>${WD[d.getDay()]}</small><b>${d.getDate()}</b><small>Th${d.getMonth() + 1}</small></button>`).join('')}</div>
     <div class="bk-slots" id="bkSlots"></div>`)}
   ${step(5, 'Nhân viên phục vụ', '', `<div class="bk-staff" id="bkStaff"></div>${fld('Ghi chú cho spa', `<textarea data-bk="notes" rows="3" placeholder="VD: mang thai tuần 20, sau sinh 1 tháng, da nhạy cảm, muốn phòng yên tĩnh…">${escH(BK.notes)}</textarea>`)}`)}
  </div><aside class="bk-side" id="bkSide"></aside></div>`;
  bkPaint(); loadBusy();
}
// vẽ lại các phần phụ thuộc lựa chọn (giữ nguyên ô đang gõ)
function bkPaint() {
  if ($('#bookPage').hidden) return;
  const { ps, sv, pr, total } = bkTotals(), dt = new Date(BK.date + 'T00:00'), st = bkStaff().find(s => s.id === BK.staff);
  $('#bkSvcs').innerHTML = BK.svcs.length ? BK.svcs.map(c => `<div class="bk-item"><div><b>${escH(OPTS[c].name)}</b><small>${OPTS[c].min} phút</small></div><span>${vnd(OPTS[c].price)}</span><button type="button" data-rm="${c}" aria-label="Bỏ dịch vụ">&times;</button></div>`).join('')
    : `<div class="bk-empty">Chưa chọn dịch vụ nào. Chọn ở ô bên dưới hoặc xem <a href="#services">bảng giá</a>.</div>`;
  $('#bkProds').innerHTML = PRODUCTS.map(p => `<div class="bk-prod"><div><b>${escH(p.name)}</b><small>${vnd(p.price)}</small></div><div class="bk-qty"><button type="button" data-q="${p.id}" data-d="-1" ${cart[p.id] ? '' : 'disabled'}>−</button><span>${cart[p.id] || 0}</span><button type="button" data-q="${p.id}" data-d="1">+</button></div></div>`).join('');
  $$('#bkBranches .bk-chip').forEach(b => b.classList.toggle('on', b.dataset.branch === BK.branch));
  $$('.bk-day').forEach(b => b.classList.toggle('on', b.dataset.day === BK.date));
  $('#bkWhen').textContent = `${WD[dt.getDay()]}, ${BK.date.split('-').reverse().join('/')} · dự kiến ${bkDur()} phút · giờ mờ là đã kín lịch`;
  if (BK.time && slotState(BK.time)) BK.time = '';
  $('#bkSlots').innerHTML = SLOTS.map(t => { const s = slotState(t); return `<button type="button" class="bk-slot${BK.time === t ? ' on' : ''}${s ? ' off' : ''}" data-time="${t}" ${s ? 'disabled' : ''} title="${s === 'full' ? 'Đã kín lịch' : s === 'past' ? 'Đã qua' : ''}">${t}</button>`; }).join('');
  if (BK.staff && !st) BK.staff = '';
  $('#bkStaff').innerHTML = [{ id: '', name: 'Ai cũng được', role: BK.branch === HOME ? 'Spa cử người đến nhà' : 'Spa sắp xếp người phù hợp' }, ...(BK.branch === HOME ? [] : bkStaff())].map(s => `<button type="button" class="bk-st${BK.staff === s.id ? ' on' : ''}" data-staff="${s.id}"><span class="av">${s.id ? escH(s.name[0]) : '<i class="fa-solid fa-star"></i>'}</span><b>${escH(s.name)}</b><small>${escH(s.role)}</small></button>`).join('');
  const row = (a, b) => `<div class="bk-sr"><span>${a}</span><span>${b}</span></div>`, none = '<i>Chưa nhập</i>';
  $('#bkSide').innerHTML = `<h3>Thông tin đặt lịch</h3>
   <h4>Khách hàng</h4>${row('Họ tên', BK.name ? escH(BK.xung + ' ' + BK.name) : none)}${row('Điện thoại', BK.phone ? escH(BK.phone) : none)}
   <h4>Dịch vụ</h4>${BK.svcs.length ? BK.svcs.map(c => row(escH(OPTS[c].name), vnd(OPTS[c].price))).join('') : '<p class="bk-mut">Chưa có</p>'}
   ${ps.length ? `<h4>Sản phẩm</h4>${ps.map(p => row(escH(p.name) + ' × ' + p.qty, vnd(p.price * p.qty))).join('')}` : ''}
   <h4>Chi nhánh, thời gian & nhân viên</h4>${row('Chi nhánh', escH(BK.branch.replace('Nàng Ba – ', '')))}${row('Ngày', `${WD[dt.getDay()]}, ${BK.date.split('-').reverse().join('/')}`)}${row('Giờ', BK.time || '<i>Chưa chọn</i>')}${row('Nhân viên', escH(st ? st.name : 'Ai cũng được'))}
   <div class="bk-tot">${row('Tiền dịch vụ', vnd(sv))}${pr ? row('Tiền sản phẩm', vnd(pr)) : ''}<div class="bk-sr big"><span>Tổng cộng</span><b>${vnd(total)}</b></div></div>
   <button type="button" class="btn btn-primary btn-block" id="bkGo"><i class="fa-solid fa-check"></i> Xác nhận đặt lịch</button>
   <p class="bk-note"><b>Không cần thanh toán trước.</b> Bấm xác nhận là lịch hẹn được gửi ngay về chi nhánh, nhân viên sẽ gọi hoặc nhắn Zalo xác nhận. Muốn thanh toán ngay sau khi đặt được <b>giảm ${PAYNOW_PCT}%</b>.</p>`;
}
$('#bookRoot').addEventListener('input', e => { const k = e.target.dataset.bk; if (!k || k === 'addSvc') return; BK[k] = e.target.value; if (['name', 'phone', 'xung'].includes(k)) bkPaint(); });
$('#bookRoot').addEventListener('change', e => {
  const k = e.target.dataset.bk; if (k === 'xung') { BK.xung = e.target.value; bkPaint(); }
  if (k === 'addSvc' && e.target.value) { bookAdd(e.target.value); e.target.value = ''; bkPaint(); }
});
$('#bookRoot').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.rm) { BK.svcs = BK.svcs.filter(c => c !== b.dataset.rm); bkPaint(); }
  else if (b.dataset.q) { const id = b.dataset.q, n = Math.max(0, (cart[id] || 0) + Number(b.dataset.d)); if (n) cart[id] = n; else delete cart[id]; renderCart(); bkPaint(); }
  else if (b.dataset.branch !== undefined) { BK.branch = b.dataset.branch; BK.staff = ''; bkPaint(); loadBusy(); }
  else if (b.dataset.day) { BK.date = b.dataset.day; bkPaint(); loadBusy(); }
  else if (b.dataset.time) { BK.time = b.dataset.time; bkPaint(); }
  else if (b.dataset.staff !== undefined) { BK.staff = b.dataset.staff; bkPaint(); }
  else if (b.id === 'bkGo') submitBooking(b);
});
function submitBooking(btn) {
  const bad = (m, sel) => { toast(m); const el = sel && $(sel); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); if (el.focus) el.focus(); } };
  const phone = phoneOk(BK.phone);
  if (!BK.name.trim()) return bad('Vui lòng nhập họ tên.', '[data-bk="name"]');
  if (!phone) return bad('Số điện thoại chưa đúng (9–11 số).', '[data-bk="phone"]');
  if (BK.email && !/^\S+@\S+\.\S+$/.test(BK.email)) return bad('Email chưa đúng.', '[data-bk="email"]');
  if (!BK.svcs.length) return bad('Vui lòng chọn ít nhất một dịch vụ.', '[data-bk="addSvc"]');
  if (BK.branch === HOME && !BK.address.trim()) return bad('Phục vụ tại nhà cần địa chỉ.', '[data-bk="address"]');
  if (!BK.time) return bad('Vui lòng chọn giờ hẹn.', '#bkSlots');
  const { ps, total } = bkTotals(), st = bkStaff().find(s => s.id === BK.staff), code = newCode();
  const order = {
    id: 'web_' + code, code, createdAt: new Date().toISOString(), xung: BK.xung, name: BK.name.trim(), phone, email: BK.email || '', birthday: BK.birthday || '', address: BK.address || '',
    notes: BK.notes || '', date: BK.date, time: BK.time, duration: bkDur(), staffId: st ? st.id : '', staffName: st ? st.name : '', branch: BK.branch,
    items: BK.svcs.map(c => ({ code: c, name: OPTS[c].name, duration: OPTS[c].min + ' phút', pack: 'Gói đơn buổi', oil: 'Không chọn', price: OPTS[c].price })),
    products: ps, total, status: 'new'
  };
  sendOrder(order, btn).then(ok => {
    if (!ok) return;
    const k = BK.date + '|' + BK.branch; (BUSYMAP[k] = BUSYMAP[k] || []).push({ time: BK.time, duration: order.duration, staffId: order.staffId });
    cart = {}; renderCart(); Object.assign(BK, { svcs: [], time: '', staff: '', notes: '' }); renderBooking();
  });
}

// ---------- Kết quả + thanh toán ----------
const payAmt = d => d.server ? d.server.payAmount : Math.round(d.total * (100 - PAYNOW_PCT) / 100 / 1000) * 1000;
const payTotal = d => d.server ? d.server.total : d.total;
function renderPay() {
  const d = ORDER; if (!d) return;
  const tot = payTotal(d), amt = d.paidAmount || payAmt(d);
  const isShop = !d.items.length, dmy = d.date.split('-').reverse().join('/');
  const lines = d.items.map(i => `<div><span>${escH(i.name)}</span><span>${vnd(i.price)}</span></div>`).join('') +
    d.products.map(p => `<div><span>${escH(p.name)} × ${p.qty}</span><span>${vnd(p.price * p.qty)}</span></div>`).join('');
  let pay;
  if (d.paid && d.paidVia === 'sepay') pay = `<div class="pay-ok"><i class="fa-solid fa-circle-check"></i><h4>Thanh toán thành công</h4><p>Nàng Ba đã nhận <b>${vnd(amt)}</b> cho đơn <b>${escH(d.code)}</b>. ${isShop ? 'Đơn hàng' : 'Lịch hẹn'} của chị đã được xác nhận.</p></div>`;
  else if (d.paid) pay = `<div class="pay-ok"><i class="fa-solid fa-circle-check"></i><h4>Đã ghi nhận</h4><p>Chị báo đã chuyển <b>${vnd(amt)}</b>. Nàng Ba sẽ kiểm tra và xác nhận qua Zalo.</p></div>`;
  else if (!d.payOpen) pay = `<div class="pay-offer"><b>Ưu đãi thanh toán ngay −${PAYNOW_PCT}%</b><p>Không bắt buộc. Chuyển khoản ngay bây giờ chỉ còn <b>${vnd(amt)}</b> <s>${vnd(tot)}</s>.</p>
      <button class="btn btn-primary btn-block" data-pay="open">Thanh toán ngay – giảm ${PAYNOW_PCT}%</button><button class="btn btn-outline btn-block" data-close>${isShop ? 'Thanh toán khi nhận hàng' : 'Thanh toán tại spa'}</button></div>`;
  else pay = `<div class="pay-qr">${QRGEN.svg(vietqr(BANK.bin, BANK.acc, amt, d.code), 210)}<p>Quét mã bằng app ngân hàng – số tiền & nội dung đã điền sẵn</p></div>
      <table class="pay-kv"><tr><th>Ngân hàng</th><td>${BANK.bank}</td></tr><tr><th>Số tài khoản</th><td><b>${BANK.acc}</b> <button class="cp" data-copy="${BANK.acc}">Chép</button></td></tr>
      <tr><th>Chủ tài khoản</th><td>${BANK.holder}</td></tr><tr><th>Số tiền</th><td><b>${vnd(amt)}</b> <button class="cp" data-copy="${amt}">Chép</button></td></tr>
      <tr><th>Nội dung</th><td><b>${escH(d.code)}</b> <button class="cp" data-copy="${escH(d.code)}">Chép</button></td></tr></table>
      ${d.server ? `<div class="pay-wait"><i class="fa-solid fa-spinner fa-spin"></i><div><b>${d.payStatus === 'partial' ? `Đã nhận ${vnd(d.payReceived)}, còn thiếu ${vnd(amt - d.payReceived)}` : 'Đang chờ thanh toán…'}</b><small>Hệ thống tự xác nhận ngay khi tiền về, chị không cần làm gì thêm.</small></div></div>`
      : `<button class="btn btn-primary btn-block" data-pay="done">Tôi đã chuyển khoản</button>`}`;
  const what = [...d.items.map(i => i.name), ...d.products.map(p => p.name + ' x' + p.qty)].join(', ');
  const zmsg = `Nàng Ba ơi, mình vừa đặt ${isShop ? 'hàng' : 'lịch'} online mã ${d.code}: ${what}${isShop ? '' : ` lúc ${d.time} ${dmy}`}. Tên: ${d.name}, SĐT: ${d.phone}.`;
  $('#payBody').innerHTML = `<div class="pay-head"><i class="fa-solid fa-circle-check"></i><div><h3>${isShop ? 'Đặt hàng thành công' : 'Đặt lịch thành công'}</h3><p>Mã đơn <b>${escH(d.code)}</b> · ${escH(d.name)} · ${escH(d.phone)}</p></div></div>
    ${isShop ? '' : `<p class="pay-when"><i class="fa-regular fa-calendar"></i> ${escH(d.time)} · ${escH(dmy)}</p>`}
    <div class="pay-lines">${lines}<div class="pay-sum"><span>Tổng cộng</span><b>${vnd(tot)}</b></div></div>${pay}
    <a class="btn btn-outline btn-block" href="https://zalo.me/${SPA_PHONE}" target="_blank" rel="noopener" data-copy="${escH(zmsg)}"><i class="fa-solid fa-comment-dots"></i> Gửi xác nhận qua Zalo</a>`;
  managePoll();
}
function managePoll() {
  const want = ORDER && ORDER.server && !ORDER.paid && ORDER.payOpen && $('#payModal').classList.contains('open');
  if (want && !poll) poll = setInterval(async () => {
    if (!ORDER || ORDER.paid || !$('#payModal').classList.contains('open')) { clearInterval(poll); poll = null; return; }
    const j = await apiCall('GET', null, `?code=${encodeURIComponent(ORDER.code)}&phone=${encodeURIComponent(ORDER.phone)}`);
    if (j && j.pay) {
      ORDER.payStatus = j.pay.status; ORDER.payReceived = j.pay.received || 0;
      if (j.pay.status === 'paid') { ORDER.paid = true; ORDER.paidVia = 'sepay'; ORDER.paidAmount = j.pay.paidAmount; ORDER.payOpen = false; toast('Thanh toán thành công! Nàng Ba đã nhận tiền.'); }
      renderPay();
    }
  }, 4000);
  if (!want && poll) { clearInterval(poll); poll = null; }
}
$('#payBody').addEventListener('click', e => {
  const b = e.target.closest('[data-pay],[data-copy]'); if (!b) return;
  if (b.dataset.copy !== undefined) {
    if (navigator.clipboard) navigator.clipboard.writeText(b.dataset.copy).catch(() => {});
    if (b.tagName !== 'A') { e.preventDefault(); toast('Đã chép'); }
    return;
  }
  if (b.dataset.pay === 'open') { ORDER.payOpen = true; renderPay(); }
  if (b.dataset.pay === 'done' && ORDER && !ORDER.paid) {
    const amt = payAmt(ORDER), a = store.get(INBOX, []), o = a.find(x => x.id === ORDER.id);
    if (o) o.payClaim = { amount: amt, pct: PAYNOW_PCT, at: new Date().toISOString() };
    store.set(INBOX, a);
    ORDER.paid = true; ORDER.payOpen = false; renderPay(); toast('Đã báo chuyển khoản cho spa. Cảm ơn chị!');
  }
});

// ---------- Khách để lại số điện thoại (chat / hợp tác) → Lễ tân + Telegram ----------
function sendLead(phone, name, topic, note, branch) {
  const p = phoneOk(phone); if (!p) return;
  const code = 'CHAT' + Date.now().toString(36).toUpperCase();
  inboxPush({ id: 'lead_' + code, kind: 'lead', code, xung: '', name, phone: p, topic, branch: branch || '', notes: (topic ? topic + '. ' : '') + note, items: [], products: [], total: 0, createdAt: new Date().toISOString() });
  fetch('api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lead: { phone: p, name, topic, branch: branch || '', note: String(note).slice(0, 1500) } }) }).catch(() => {});
}

// Mở thẳng link …/#dat-lich: script.js chạy route() trước khi file này nạp xong
if (location.hash === '#dat-lich') renderBooking();
