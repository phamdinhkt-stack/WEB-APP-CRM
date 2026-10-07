// =====================================================
// CHAT VỚI NÀNG BA 24/7 – chatbot tư vấn (góc phải)
// Trả lời: AI qua /api/chat nếu có ANTHROPIC_API_KEY; không có thì "bộ não" tư vấn bên dưới:
//   hỏi tên để xưng hô → nhận nhu cầu → hỏi thăm từng bước (tuần thai, sinh bao lâu, vấn đề da…) → đồng cảm,
//   lưu ý an toàn → gợi ý 1–2 dịch vụ hợp nhất kèm giá → hỏi đến spa hay tại nhà → xin SĐT + địa chỉ đúng lúc.
// Khách để lại họ tên + SĐT + địa chỉ → /api/chat {lead} → Telegram + phần mềm quản lý (khách mới, Danh sách chờ)
// của chi nhánh gần địa chỉ nhất (api/_branch.js). Dữ liệu dịch vụ, giá lấy từ data.js.
// =====================================================
const CB_ZALO = '0325637863';
const CB = { msgs: [], open: false, busy: false, ai: null, lead: false, ctx: {} };
try { Object.assign(CB, JSON.parse(sessionStorage.getItem('nb_chat') || '{}'), { open: false, busy: false }); } catch (e) {}
CB.ctx = CB.ctx || {};
const cbSave = () => { try { sessionStorage.setItem('nb_chat', JSON.stringify({ msgs: CB.msgs.slice(-50), ai: CB.ai, lead: CB.lead, ctx: CB.ctx })); } catch (e) {} };
const cbN = s => ' ' + String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, ' ').trim() + ' ';
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;
const SV = id => SERVICES.find(s => s.id === id);
const PV = (id, i = 0) => { const s = SV(id); return s && s.prices[i] ? s.prices[i][1] : ''; }; // giá của mức thứ i
const X = () => CB.ctx.xung || 'chị';                                   // xưng hô
const XN = () => CB.ctx.name ? `${X()} ${CB.ctx.name}` : X();            // xưng hô + tên
const T = (n, re) => re.test(n);

// ---------- nhận diện nhu cầu ----------
const TOPICS = [ // thứ tự ưu tiên: cụ thể trước
  ['tiasua', / tia sua | tac sua | cuong sua | sua ve it | it sua | goi sua | kich sua /, 'home-tiasua'],
  ['sausinh', / sau sinh | moi sinh | vua sinh | o cu | hau san | sinh mo | sinh thuong /, 'home-sausinh'],
  ['be', / tam be | massage be | em be | so sinh | cho be | be nha | con toi | con em | be duoc /, 'tambe'],
  ['bau', / bau | mang thai | thai ky | tuan thai | co thai /, 'spa-bau'],
  ['da', / da mat | cham soc da | facial | mun | tham | nam | da kho | da dau | sam da | lo chan long | da nhay cam /, 'facial'],
  ['massage', / massage | mat xa | dau lung | moi vai | vai gay | dau moi | nhuc moi | moi nguoi | da nong /, 'massage'],
  ['goidau', / goi dau | duong sinh | dau dau | kho ngu | mat ngu /, 'goidau'],
  ['tayu', / tay da | u trang | sang da | tam trang | da toan than /, 'tayu'],
  ['sanchac', / san chac | giam eo | mo bung | vong eo | bung nho | giam can | vong 2 /, 'sanchac'],
  ['trietlong', / triet long | wax | long nach | long chan | long tay /, 'trietlong'],
  ['nangco', / nang co | lao hoa | nep nhan | chay xe | cang da | tre hoa /, 'nangco']
];
const topicOf = n => (TOPICS.find(([, re]) => re.test(n)) || [])[0];
const topicSvc = t => (TOPICS.find(x => x[0] === t) || [])[2];
// số đi kèm đơn vị, viết theo cả hai cách: "20 tuần" hoặc "tuần 20"
const numBefore = (n, unit) => { const m = n.match(new RegExp(' (\\d{1,2}) ?(' + unit + ') ')) || n.match(new RegExp(' (?:' + unit + ') ?(\\d{1,2}) ')); return m ? +m[1] : null; };
const anyNum = n => { const m = n.match(/ (\d{1,2}) /); return m ? +m[1] : null; };
const no = n => T(n, / (khong|chua|ko|k|het) /);
const yes = n => T(n, / (co|dang|roi|vang|da|u|uh|ok|duoc|dung|phai|muon) /) && !no(n);

// ---------- các bước tư vấn: mỗi bước nhận câu trả lời (n = đã bỏ dấu), trả về [tin nhắn, bước kế] ----------
// '||' = tách thành nhiều tin liên tiếp; [[FORM]] = mở thẻ để lại thông tin
const FLOWS = {
  bau: {
    start: () => [`Dạ chúc mừng ${XN()} sắp được đón bé yêu ạ 💚||${cap(X())} đang mang thai tuần thứ mấy rồi ạ? Em hỏi để tư vấn kỹ thuật an toàn nhất cho ${X()} và bé.`, 1],
    1: n => {
      const w = numBefore(n, 'tuan|w') ?? anyNum(n);
      if (w == null) return [`Dạ ${X()} cho em biết khoảng tuần thai nhé ạ (VD: tuần 20), vì mỗi giai đoạn Nàng Ba sẽ chăm sóc khác nhau ạ.`, 1];
      CB.ctx.week = w;
      if (w < 14) return [`Dạ 3 tháng đầu cơ thể mẹ còn nhạy cảm, nên Nàng Ba chưa massage toàn thân cho ${X()} đâu ạ 🌿||Giai đoạn này ${X()} có thể thư giãn nhẹ nhàng với gội đầu dưỡng sinh thảo dược (${PV('goidau', 0)}), giúp đỡ mệt và dễ ngủ hơn. Từ tuần 14 em mời ${X()} trải nghiệm massage bầu nhé.||Dạo này ${X()} có hay bị mệt, nghén hay khó ngủ không ạ?`, 'gd'];
      return [`Dạ tuần ${w} là giai đoạn massage bầu rất tốt cho mẹ ạ.||Dạo này ${X()} hay khó chịu ở đâu nhất: đau lưng, phù chân, chuột rút hay khó ngủ ạ?`, 2];
    },
    gd: n => [`Dạ em hiểu ạ, giai đoạn đầu mẹ hay mệt lắm 💚 ${cap(X())} nhớ nghỉ ngơi nhiều, uống đủ nước nhé.||Khi nào ${X()} muốn thư giãn, em giữ lịch gội đầu dưỡng sinh cho ${X()} ạ. ${cap(X())} muốn đến spa hay để KTV đến nhà ạ?`, 'place'],
    2: n => {
      const issue = T(n, / lung /) ? 'đau lưng' : T(n, / phu | chan /) ? 'phù chân' : T(n, / chuot rut /) ? 'chuột rút' : T(n, / ngu /) ? 'khó ngủ' : '';
      return [`${issue ? `Dạ ${issue} khi mang bầu khó chịu lắm ạ, em rất hiểu 😔` : 'Dạ em hiểu ạ, mang bầu vất vả lắm 😔'}||Với ${X()}, em gợi ý Massage bầu 60 phút (${PV('spa-bau', 0)}) – KTV dùng gối bầu chuyên dụng, nằm nghiêng, tránh tuyệt đối các huyệt chống chỉ định. Nếu ${X()} muốn thư giãn trọn vẹn hơn thì gói kèm gội đầu 90 phút là ${PV('spa-bau', 1)} ạ.||${cap(X())} muốn đến spa hay để KTV đến tận nhà chăm sóc ạ?`, 'place'];
    }
  },
  sausinh: {
    start: () => [`Dạ chúc mừng ${XN()} mẹ tròn con vuông ạ 💚||${cap(X())} sinh bé được bao lâu rồi, sinh thường hay sinh mổ ạ?`, 1],
    1: n => [`Dạ em ghi nhận ạ.${T(n, / mo /) ? ` Sinh mổ thì mình cần chờ vết mổ lành (thường sau 4–6 tuần) mới chăm sóc vùng bụng; trước đó KTV chỉ chăm lưng, vai, chân và tắm bé cho ${X()} thôi ạ.` : ''}||Hiện ${X()} đang lo nhất điều gì ạ: đau mỏi người, sữa về ít, lấy lại vóc dáng hay chưa quen chăm bé?`, 2],
    2: n => {
      if (T(n, / sua /)) return [`Dạ nhiều mẹ cũng lo sữa về ít lắm ạ, ${X()} đừng căng thẳng nhé, căng thẳng sữa càng khó về 💚||Nữ hộ sinh Nàng Ba có gói gọi sữa về 3 buổi (${PV('home-tiasua', 1)}) và chăm sóc mẹ sau sinh tại nhà (${PV('home-sausinh', 0)}/buổi, chăm cả mẹ và bé), vừa kích sữa vừa giúp mẹ thư giãn ạ.||${cap(X())} đang ở khu vực nào để em xếp nữ hộ sinh gần nhất ạ?`, 'addr'];
      const e = T(n, / dang | eo | bung | can /) ? 'vóc dáng sau sinh sẽ về dần nếu mình chăm đúng cách ạ' : T(n, / be /) ? 'lần đầu chăm bé ai cũng bỡ ngỡ ạ, Nàng Ba sẽ hướng dẫn tận tình' : 'mẹ sau sinh đau mỏi nhiều lắm ạ, em rất hiểu';
      return [`Dạ ${e} 💚||Em gợi ý gói chăm sóc mẹ sau sinh tại nhà: KTV đến tận nhà chăm cả mẹ và bé – ${PV('home-sausinh', 0)}/buổi, gói 7 buổi ${PV('home-sausinh', 1)}. Nhiều mẹ chọn gói 15 buổi (${PV('home-sausinh', 2)}) để hồi phục trọn tháng ạ.||${cap(X())} đang ở khu vực nào để em xem chi nhánh gần nhất ạ?`, 'addr'];
    }
  },
  tiasua: {
    start: () => [`Dạ tắc sữa vừa đau vừa sốt ruột lắm ạ, em rất hiểu 😔||${cap(X())} bị bao lâu rồi, có sốt hay chỗ tắc sưng đỏ, nóng không ạ?`, 1],
    1: n => T(n, / sot | do | nong | mu /) && !T(n, / khong sot | ko sot /)
      ? [`Dạ nếu có sốt hoặc sưng đỏ nóng, ${X()} nên đi khám trước để loại trừ viêm tuyến vú nhé ạ, sức khỏe của ${X()} là quan trọng nhất 💚||Khi bác sĩ cho phép, nữ hộ sinh Nàng Ba sẽ đến nhà thông tắc nhẹ nhàng (${PV('home-tiasua', 0)}/lần). ${cap(X())} đang ở khu vực nào để em giữ người gần nhất cho ${X()} ạ?`, 'addr']
      : [`Dạ vậy mình nên xử lý sớm để sữa không vón thêm ạ. Trong lúc chờ, ${X()} chườm ấm và cho bé bú bên bị tắc trước nhé.||Nữ hộ sinh Nàng Ba có thể đến nhà ngay trong ngày, ${PV('home-tiasua', 0)}/lần ạ.||${cap(X())} đang ở khu vực nào để em điều người gần nhất ạ?`, 'addr']
  },
  be: {
    start: () => [`Dạ bé nhà mình được mấy tháng rồi ${X()} ơi? 👶`, 1],
    1: n => {
      const m = numBefore(n, 'thang|th') ?? (numBefore(n, 'ngay|tuan') != null ? 0 : anyNum(n));
      if (m == null) return [`Dạ ${X()} cho em biết bé được mấy tháng nhé ạ, để KTV chọn bài massage phù hợp với bé ạ.`, 1];
      if (m > 12) return [`Dạ dịch vụ tắm & massage bé của Nàng Ba dành cho bé 0–12 tháng ạ. Với bé lớn hơn, ${X()} để lại SĐT, em nhờ chuyên viên tư vấn thêm nhé. [[GOI_LAI]]`, 'after'];
      return [`Dạ bé ${m ? m + ' tháng' : 'mới sinh'} đáng yêu quá ạ 🥰||Tắm & massage giúp bé ngủ sâu, ăn ngon, tiêu hóa tốt và gắn kết với mẹ hơn. Giá ${PV('tambe', 0)}/buổi, gói 10 buổi ${PV('tambe', 1)} ạ.||${cap(X())} muốn đưa bé đến spa hay để KTV đến nhà tắm cho bé ạ?`, 'place'];
    }
  },
  da: {
    start: () => [`Dạ ${X()} đang muốn cải thiện điều gì nhất cho làn da ạ: mụn, thâm nám, da khô sạm hay chăm sóc định kỳ cho da khỏe?`, 1],
    1: n => {
      CB.ctx.skin = T(n, / mun /) ? 'mun' : T(n, / nam | tham | sam /) ? 'nam' : 'kho';
      const e = { mun: 'da mụn thì mình cần làm sạch đúng cách và kiên trì một chút ạ', nam: 'thâm nám làm mình kém tự tin lắm ạ, em hiểu', kho: 'da khô sạm thường do thiếu ẩm và căng thẳng ạ' }[CB.ctx.skin];
      return [`Dạ ${e} 💚||${cap(X())} có đang mang thai hoặc cho con bú không ạ? Em hỏi để chọn sản phẩm thật an toàn cho ${X()}.`, 2];
    },
    2: n => {
      const safe = yes(n), deep = CB.ctx.skin !== 'kho';
      return [`${safe ? 'Dạ vậy Nàng Ba sẽ dùng dòng sản phẩm lành tính, không retinol, an toàn cho mẹ bầu và mẹ cho con bú ạ. ' : 'Dạ em cảm ơn ạ. '}Với da ${X()}, em gợi ý ${deep ? `Facial chuyên sâu 90 phút (${PV('facial', 1)})` : `Facial cơ bản 60 phút (${PV('facial', 0)})`}.||Buổi đầu KTV sẽ soi da kỹ rồi mới lên liệu trình phù hợp, ${X()} không phải mua gì thêm nếu chưa cần ạ. Lần đầu trải nghiệm còn được giảm 20% nữa.||${cap(X())} muốn em giữ lịch cho ${X()} ở chi nhánh gần nhà không ạ?`, 'book'];
    }
  },
  massage: {
    start: () => [`Dạ ${X()} hay mỏi ở vùng nào nhất ạ: vai gáy, lưng hay toàn thân? Công việc của ${X()} có phải ngồi nhiều không ạ?`, 1],
    1: n => [`Dạ ngồi nhiều, căng thẳng lâu ngày cơ dễ co cứng lắm ạ 😔||Em gợi ý Massage body chuyên sâu 60 phút (${PV('massage', 0)}); nếu ${X()} mỏi nhiều thì massage đá nóng 90 phút (${PV('massage', 1)}) giúp giãn cơ sâu hơn ạ. KTV ấn huyệt vai gáy kỹ, về ngủ ngon lắm ${X()} ạ.||${cap(X())} muốn em giữ lịch cho ${X()} không ạ?`, 'book']
  },
  goidau: {
    start: () => [`Dạ gội đầu dưỡng sinh của Nàng Ba dùng nước nấu từ bồ kết, hương nhu, sả, vỏ bưởi, kết hợp bấm huyệt đầu – cổ – vai gáy ạ 🌿||Dạo này ${X()} có hay đau đầu, mỏi cổ hay khó ngủ không ạ?`, 1],
    1: n => [`Dạ ${yes(n) ? `vậy gội dưỡng sinh rất hợp với ${X()} đó ạ, nhiều khách ngủ thiếp đi luôn trong lúc gội` : 'gội dưỡng sinh cũng là cách thư giãn rất dễ chịu cuối tuần ạ'} 💚||Giá ${PV('goidau', 0)} (45 phút), hoặc gội kèm chăm sóc da mặt 75 phút ${PV('goidau', 1)} ạ.||${cap(X())} muốn em giữ lịch cho ${X()} không ạ?`, 'book']
  },
  trietlong: {
    start: () => [`Dạ ${X()} muốn triệt vùng nào ạ: nách, tay hay chân?`, 1],
    1: n => [`Dạ ${T(n, / nach /) ? `triệt nách ${PV('trietlong', 0)}/lần, trọn gói ${PV('trietlong', 1)}` : `chân/tay ${PV('trietlong', 2)}/lần, nách ${PV('trietlong', 0)}/lần`} ạ.||Năng lượng được điều chỉnh theo vùng da nên rất nhẹ nhàng, không đau rát. Mẹ bầu thì Nàng Ba chưa thực hiện nhé ạ.||${cap(X())} muốn em giữ lịch thử 1 buổi không ạ?`, 'book']
  },
  sanchac: {
    start: () => [`Dạ ${X()} muốn cải thiện vùng nào nhất ạ: bụng, eo hay bắp tay, đùi? ${cap(X())} có đang sau sinh không ạ?`, 1],
    1: n => [`Dạ em hiểu ạ 💚${T(n, / sinh /) ? ` Sau sinh mình nên đợi cơ thể ổn định (sinh mổ cần vết mổ lành hẳn) rồi mới làm săn chắc nhé ${X()}.` : ''}||Liệu trình săn chắc 90 phút ${PV('sanchac', 0)}, gói 10 buổi ${PV('sanchac', 1)}, kết hợp massage và quấn nóng thảo dược ạ.||${cap(X())} muốn em giữ lịch để KTV đo và tư vấn trực tiếp không ạ?`, 'book']
  },
  tayu: {
    start: () => [`Dạ ${X()} muốn da sáng đều màu hơn hay chủ yếu làm sạch, mềm mịn da toàn thân ạ?`, 1],
    1: n => [`Dạ em hiểu ạ 🌿||Tẩy + ủ toàn thân 75 phút ${PV('tayu', 0)}, gói 5 buổi ${PV('tayu', 1)} – dịu nhẹ cả với da nhạy cảm ạ.||${cap(X())} muốn em giữ lịch cho ${X()} không ạ?`, 'book']
  },
  nangco: {
    start: () => [`Dạ ${X()} đang lo nhất vùng nào ạ: nếp nhăn quanh mắt, chảy xệ vùng má cằm hay da kém săn chắc nói chung?`, 1],
    1: n => [`Dạ em hiểu ạ, ai cũng muốn giữ nét trẻ trung lâu hơn 💚||Liệu trình nâng cơ – chống lão hóa ${PV('nangco', 0)}/buổi, gói 5 buổi ${PV('nangco', 1)}. Buổi đầu chuyên viên sẽ đánh giá da trước rồi mới tư vấn liệu trình ạ.||${cap(X())} muốn em đặt lịch tư vấn cho ${X()} không ạ?`, 'book']
  }
};

// ---------- bước chung sau khi đã gợi ý dịch vụ ----------
const AFTER = {
  place: n => T(n, / nha | tai nha | den nha /) ? [`Dạ Nàng Ba có KTV chăm sóc tận nhà ạ 🏠||${cap(X())} đang ở khu vực nào để em xếp KTV ở chi nhánh gần nhất ạ?`, 'addr']
    : T(n, / spa | den | toi | qua | ghe /) ? [`Dạ ${X()} đến spa thì có phòng riêng yên tĩnh cho mẹ bầu và mẹ bỉm ạ.||${cap(X())} ở khu vực nào để em gợi ý chi nhánh gần nhất ạ?`, 'addr'] : null,
  book: n => no(n) || T(n, / de sau | suy nghi | tham khao /) ? [`Dạ không sao ạ, ${X()} cứ cân nhắc thoải mái nhé 💚 Khi cần ${X()} nhắn em bất cứ lúc nào, hoặc để lại SĐT em gửi ưu đãi qua Zalo ạ. [[GOI_LAI]]`, 'after']
    : yes(n) || T(n, / dat | giu | toi nay | ngay mai | cuoi tuan | thu /) ? [`Dạ tuyệt quá ạ!||${cap(X())} đang ở khu vực nào để em giữ lịch ở chi nhánh gần nhất ạ?`, 'addr'] : null,
  addr: (n, raw) => {
    if (raw.replace(/\s/g, '').length < 3 || no(n)) return null;
    CB.ctx.addr = raw.trim();
    return [`Dạ em cảm ơn ${XN()} ạ 💚||${cap(X())} cho em xin họ tên và số điện thoại để tư vấn viên chi nhánh gần ${X()} nhất gọi lại xếp lịch nhé ạ. [[FORM]]`, 'after'];
  }
};

// ---------- câu hỏi chung (nhận ở mọi lúc) ----------
function cbGeneral(n) {
  if (T(n, / nguoi that | robot | bot | tro ly ao /)) return `Dạ em là trợ lý tư vấn của Nàng Ba ạ 😊 Nếu ${X()} muốn nói chuyện trực tiếp, em nhờ chị tư vấn viên gọi lại ngay, hoặc ${X()} nhắn Zalo cho Nàng Ba nhé. [[GOI_LAI]] [[ZALO]]`;
  if (T(n, / cam on | thank | thanks /)) return `Dạ không có gì ạ, được hỗ trợ ${XN()} là niềm vui của Nàng Ba 💚 ${cap(X())} cần gì cứ nhắn em nhé!`;
  if (T(n, / tam biet | bye | hen gap /)) return `Dạ em chào ${XN()} ạ, chúc ${X()} một ngày thật nhẹ nhàng 🌿 Hẹn gặp ${X()} ở Nàng Ba nhé!`;
  if (T(n, / gio mo | mo cua | dong cua | may gio | gio lam /)) return `Dạ Nàng Ba mở cửa T2–T7 9:00–20:00, Chủ nhật 9:00–19:00; dịch vụ sau sinh & tại nhà 7:30–18:30 hằng ngày ạ.||${cap(X())} định qua khung giờ nào để em giữ chỗ cho ${X()} ạ?`;
  if (T(n, / chi nhanh | dia chi | o dau | gan nhat | co so /)) { CB.ctx.step = 'addr'; CB.ctx.topic = CB.ctx.topic || 'chung'; return `Dạ Nàng Ba có ${BRANCHES.length} chi nhánh: ${BRANCHES.map(b => b.name.replace('Nàng Ba – ', '')).join(', ')} ạ.||${cap(X())} đang ở khu vực nào để em chỉ chi nhánh gần ${X()} nhất ạ?`; }
  if (T(n, / uu dai | khuyen mai | giam gia | voucher | chuyen khoan | thanh toan /)) return `Dạ khách lần đầu được giảm 20% ạ; đặt lịch online và chuyển khoản ngay cũng được giảm ${PAYNOW_PCT}%, không bắt buộc trả trước đâu ${X()} nhé 💚||${cap(X())} đang quan tâm dịch vụ nào để em áp ưu đãi cho ${X()} ạ?`;
  if (T(n, / dao tao | hoc nghe | khoa hoc | hoc vien /)) return `Dạ ${X()} muốn học để đi làm hay để tự chăm sóc gia đình ạ?||Học viện Nàng Ba có ${COURSES.length} khóa: ${COURSES.map(c => `${c.name} (${c.duration})`).join(', ')}, học thực hành là chính ạ. [[DAO_TAO]] [[GOI_LAI]]`;
  if (T(n, / hop tac | nhuong quyen | dai ly | phan phoi | dau tu | mo spa /)) return `Dạ cảm ơn ${X()} đã quan tâm đồng hành cùng Nàng Ba ạ 🤝||Hiện có 4 hình thức: ${PARTNER_PROGRAMS.map(p => p.name).join(', ')}. ${cap(X())} để lại SĐT, chuyên viên phát triển hệ thống sẽ gọi trao đổi kỹ với ${X()} nhé. [[HOP_TAC]] [[GOI_LAI]]`;
  if (T(n, / san pham | serum | kem | sua tam | tinh dau | mat na | xa phong | dau duong | chong ran | sap duong /)) {
    const hit = PRODUCTS.filter(p => cbN(p.name).split(' ').some(w => w.length > 3 && n.includes(' ' + w + ' ')));
    const list = (hit.length ? hit : PRODUCTS.filter(p => p.featured)).slice(0, 3);
    return `Dạ ${list.map(p => `${p.name} (${vnd(p.price)})`).join(', ')} ạ – chiết xuất thảo dược, lành tính${list.some(p => p.cat === 'mom' || p.cat === 'baby') ? ', an toàn cho mẹ và bé' : ''}.||${cap(X())} định dùng cho mình hay cho bé ạ, để em hướng dẫn cách dùng phù hợp nhé? [[SAN_PHAM]]`;
  }
  return null;
}
function cbIntro(n, raw) { // nhận tên, xưng hô
  // chỉ đổi sang "anh" khi khách tự xưng anh (không nhầm với tên "Ngọc Anh")
  if (T(n, /^ anh (muon|can|hoi|dang|o|thay|la|tim|dat) | (toi|minh|em) la anh | cho anh /) && !T(n, / chi /)) CB.ctx.xung = 'anh';
  let nm = (raw.match(/(?:tên là|tên|mình là|tôi là|em là|chị là|anh là)\s+([A-Za-zÀ-ỹ]+(?:\s+[A-Za-zÀ-ỹ]+){0,2})/i) || [])[1];
  if (!nm && CB.ctx.askName && !CB.ctx.topic && raw.trim().split(/\s+/).length <= 3 && !topicOf(n) && !/\d/.test(raw) && !T(n, / (chao|hello|hi|alo|gia|bao nhieu) /)) nm = raw.trim().replace(/^(chị|anh|em|c|a)\s+/i, '');
  // không nhận nhầm câu trả lời ngắn ("ok em", "dạ", "có") là tên
  if (nm && /^(ok|oke|okay|vâng|vang|dạ|da|có|co|không|khong|ko|ừ|ừm|uh|em|chị|anh|được|duoc|rồi|roi|thôi|hihi|haha|cảm ơn|cam on|ok em|dạ vâng|vâng ạ|dạ có)$/i.test(nm.trim())) nm = '';
  if (nm) { const w = nm.trim().split(/\s+/); CB.ctx.name = cap(w[w.length - 1].toLowerCase()); CB.ctx.askName = false; return true; }
  return false;
}
function cbBrain(raw) {
  const n = cbN(raw), c = CB.ctx;
  const gotName = cbIntro(n, raw), hi = gotName ? `Dạ em chào ${XN()} ạ 💚||` : '';
  // biết tên ngay trong câu này → chào gộp vào tin đầu, không "Dạ… Dạ…"
  const greet = m => gotName ? m.replace(/^Dạ (\S)/, (x, ch) => `Dạ em chào ${XN()} ạ! ${ch.toUpperCase()}`) : m;
  const t = topicOf(n);
  // 1) đang hỏi dở một câu trong luồng tư vấn → ưu tiên hiểu là câu trả lời (VD "sữa về ít", "đau lưng")
  // chủ đề "liên quan" xuất hiện trong câu trả lời thì vẫn giữ mạch (VD đang hỏi sau sinh, khách nói "sữa về ít")
  const RELATED = { sausinh: ['tiasua', 'be', 'sanchac', 'massage'], bau: ['massage', 'goidau', 'da', 'sanchac'], be: ['sausinh', 'bau'], da: ['bau', 'sausinh', 'nangco', 'tayu'], tiasua: ['sausinh', 'be'],
    massage: ['goidau'], goidau: ['massage', 'da'], sanchac: ['sausinh', 'massage'], trietlong: ['bau'], tayu: ['da'], nangco: ['da'] };
  const askPrice = T(n, / gia | bao nhieu | chi phi | het bao | tien /);
  // khách muốn dừng / cảm ơn / hỏi chuyện chung → không ép trả lời câu đang hỏi dở
  if (c.topic && T(n, / suy nghi | de sau | tham khao them | khong can | thoi em | thoi chi /)) { c.step = 'after'; return `Dạ không sao ạ, ${X()} cứ cân nhắc thoải mái nhé 💚 Khi cần ${X()} nhắn em bất cứ lúc nào, hoặc để lại SĐT em gửi ưu đãi qua Zalo ạ. [[GOI_LAI]]`; }
  const generalAsk = T(n, / cam on | thank | tam biet | bye | gio mo | mo cua | may gio | chi nhanh | dia chi | o dau | uu dai | khuyen mai | dao tao | hoc nghe | hop tac | nhuong quyen | san pham | nguoi that | robot /);
  const step = c.topic && (FLOWS[c.topic] || {})[c.step];
  if (step && !generalAsk && (!t || t === c.topic || (RELATED[c.topic] || []).includes(t)) && !askPrice) { const r = step(n); c.step = r[1]; return greet(r[0]); }
  // 2) bắt đầu / đổi sang nhu cầu mới
  if (t && (t !== c.topic || c.step == null || c.step === 'after' || AFTER[c.step])) {
    c.topic = t;
    // khách nói luôn tuần thai / tuổi bé / sinh bao lâu → không hỏi lại, tư vấn tiếp
    const unit = { bau: 'tuan|w', be: 'thang|th|ngay|tuan', sausinh: 'thang|th|ngay|tuan' }[t];
    if (unit && numBefore(n, unit) != null) {
      const r = FLOWS[t][1](n); c.step = r[1];
      return greet({ bau: `Dạ chúc mừng ${XN()} sắp được đón bé yêu ạ 💚||`, sausinh: `Dạ chúc mừng ${XN()} mẹ tròn con vuông ạ 💚||`, be: '' }[t] + r[0]);
    }
    const [msg, st] = FLOWS[t].start(); c.step = st;
    // hỏi giá thẳng → trả lời giá trước, rồi mới hỏi thăm để tư vấn kỹ
    if (askPrice) {
      const s = SV(topicSvc(t)), q = msg.replace(/^Dạ chúc mừng[^|]*\|\|/, '').replace(/^Dạ /, '');
      return greet(`Dạ giá ${s.name.toLowerCase()}: ${s.prices.map(([a, b]) => `${a} ${b}`).join('; ')} ạ. Lần đầu trải nghiệm được giảm 20% nhé ${X()}.||Để em tư vấn kỹ hơn, ${q[0].toLowerCase() + q.slice(1)}`);
    }
    return greet(msg);
  }
  // hỏi giá
  if (askPrice) {
    const s = c.topic && SV(topicSvc(c.topic));
    if (s) return `Dạ giá ${s.name.toLowerCase()}: ${s.prices.map(([a, b]) => `${a} ${b}`).join('; ')} ạ.||Lần đầu trải nghiệm ${X()} được giảm 20% nhé. ${cap(X())} muốn em giữ lịch cho ${X()} không ạ?`;
    return `Dạ ${X()} đang quan tâm dịch vụ nào để em báo giá chính xác ạ: chăm sóc mẹ bầu, sau sinh, tắm bé, chăm sóc da hay massage thư giãn? [[BANG_GIA]]`;
  }
  const g = cbGeneral(n); if (g) return hi + g;
  // đang trong luồng tư vấn → xử lý câu trả lời
  if (c.step != null && c.step !== 'after') {
    const a = AFTER[c.step]; let r = a ? a(n, raw) : null; // các bước chung: spa/tại nhà, giữ lịch, khu vực
    // khách trả lời luôn khu vực (VD "Hà Nội", "quận 7") → coi như đồng ý, chuyển sang xin thông tin
    if (!r && c.step !== 'addr' && T(n, / quan | q\d+ | huyen | phuong | xa | tp | tinh | ha noi | hcm | sai gon | can tho | dong nai | bien hoa | thu duc | go vap | cau giay | binh duong | ninh kieu | da nang | vung tau /)) r = AFTER.addr(n, raw);
    if (r) { c.step = r[1]; return hi + r[0]; }
    if (c.step === 'addr') return `Dạ ${X()} cho em xin khu vực (quận/huyện, tỉnh) để em xếp chi nhánh gần nhất nhé ạ.`;
    if (c.step === 'place') return `Dạ Nàng Ba phục vụ cả tại spa và tại nhà ạ. ${cap(X())} thấy cách nào tiện hơn cho ${X()} ạ?`;
    if (c.step === 'book') return `Dạ ${X()} cứ thoải mái hỏi thêm nhé ạ. Nếu muốn giữ lịch, ${X()} bấm Đặt lịch hoặc để lại SĐT em sắp xếp giúp ạ. [[DAT_LICH]] [[GOI_LAI]]`;
  }
  // tâm sự mệt mỏi → hỏi thăm trước, chưa cần xin tên
  if (T(n, / met | stress | cang thang | buon | lo lang | ap luc | kiet suc /)) { c.topic = 'goidau'; c.step = 1; return greet(`Dạ nghe ${X()} nói em thương quá 😔 ${cap(X())} nhớ dành chút thời gian cho bản thân nhé.||Nàng Ba có gội đầu dưỡng sinh và massage thư giãn giúp mình nhẹ người, ngủ ngon hơn. Dạo này ${X()} có hay đau đầu, khó ngủ không ạ?`); }
  if (gotName) return `Dạ em chào ${XN()} ạ 💚||Hôm nay ${X()} cần Nàng Ba hỗ trợ gì ạ: chăm sóc mẹ bầu, mẹ sau sinh, tắm bé hay làm đẹp, thư giãn?`;
  // vừa xin tên mà khách chỉ "dạ / vâng" → hỏi lại nhẹ nhàng một lần, rồi thôi
  if (c.askName && !c.reasked && !t && raw.trim().split(/\s+/).length <= 2) { c.reasked = true; return `Dạ em nên gọi ${X()} là gì cho thân mật ạ? 😊 Hoặc ${X()} cứ kể em nghe nhu cầu, em tư vấn ngay ạ.`; }
  if (T(n, / chao | hello | hi | alo | xin chao | hey /) || (!c.name && !c.askName)) {
    if (!c.name) { c.askName = true; return `Dạ Nàng Ba xin chào ${X()} ạ 🌿 Em là Ba, trợ lý tư vấn của Nàng Ba.||${cap(X())} cho em xin tên để tiện xưng hô nhé ạ?`; }
    return `Dạ em chào ${XN()} ạ 💚 ${cap(X())} cần em hỗ trợ gì hôm nay ạ?`;
  }
  if (T(n, / dat lich | dat hen | book | hen lich /)) return `Dạ ${X()} muốn đặt dịch vụ nào ạ? ${cap(X())} có thể bấm Đặt lịch để chọn giờ và chi nhánh, hoặc kể em nghe nhu cầu, em tư vấn rồi giữ lịch giúp ${X()} nhé. [[DAT_LICH]]`;
  return `Dạ em chưa hiểu rõ ý ${X()} lắm ạ 😊 ${cap(X())} đang quan tâm chăm sóc mẹ bầu, mẹ sau sinh, em bé hay làm đẹp, thư giãn ạ? Hoặc ${X()} để lại SĐT, chị tư vấn viên sẽ gọi lại ngay nhé. [[GOI_LAI]]`;
}

// người hỏi là "anh" (chồng hỏi cho vợ) mà nhu cầu là bầu / sau sinh / tắc sữa → nói về "chị nhà"
function cbForWife(r) {
  if (CB.ctx.xung !== 'anh' || !['bau', 'sausinh', 'tiasua'].includes(CB.ctx.topic)) return r;
  return r.replace(/chúc mừng anh /g, 'chúc mừng anh chị ').replace(/Anh (đang mang thai|sinh bé|bị bao lâu|có thể thư giãn)/g, 'Chị nhà $1')
    .replace(/anh (hay khó chịu|có hay bị|đừng căng thẳng|chườm ấm|nên đi khám|nhớ nghỉ ngơi)/g, 'chị nhà $1')
    .replace(/(cho|của|mời|với) anh( và bé| đâu| nhé| thôi)/g, '$1 chị nhà$2').replace(/Dạo này anh /g, 'Dạo này chị nhà ').replace(/anh và bé/g, 'chị nhà và bé')
    .replace(/Với anh, /g, 'Với chị nhà, ').replace(/Nếu anh muốn thư giãn/g, 'Nếu chị nhà muốn thư giãn');
}

// ---------- giao diện tin nhắn ----------
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
  body.innerHTML = `<div class="cb-m bot">Dạ Nàng Ba xin chào 🌿 Em là Ba, trợ lý tư vấn 24/7. Chị đang mang bầu, vừa sinh bé hay muốn chăm sóc sắc đẹp, thư giãn ạ? Chị cứ chia sẻ, em tư vấn tận tình cho chị nhé!</div>` +
    CB.msgs.map(cbBubble).join('') + (typing ? '<div class="cb-typing"><i></i><i></i><i></i></div>' : '');
  $('#cbQuick').hidden = CB.msgs.length > 2;
  body.scrollTop = body.scrollHeight;
}
function cbToggle(open) {
  CB.open = open ?? !CB.open; $('#cbBox').classList.toggle('open', CB.open); $('#cbFab').classList.toggle('on', CB.open);
  if (CB.open) { cbRender(); setTimeout(() => $('#cbInput').focus(), 80); }
}
function cbShowForm(pre) {
  pre = { name: CB.ctx.name ? `${cap(X())} ${CB.ctx.name}` : '', address: CB.ctx.addr || '', ...(pre || {}) };
  const f = CB.msgs.find(m => m.role === 'form' && !m.done);
  if (f) Object.assign(f, Object.fromEntries(Object.entries(pre).filter(([, v]) => v))); else CB.msgs.push({ role: 'form', ...pre });
  cbSave(); cbRender(); const el = [...document.querySelectorAll('#cbBody [data-cbform] input')].find(i => !i.value); if (el) el.focus();
}
const cbSleep = ms => new Promise(r => setTimeout(r, ms));
async function cbSay(reply) { // nhiều tin liên tiếp, có "đang gõ" giữa các tin
  const parts = String(reply).split('||').map(s => s.trim()).filter(Boolean);
  for (let i = 0; i < parts.length; i++) {
    let p = parts[i]; const form = p.includes('[[FORM]]'); p = p.replace('[[FORM]]', '').trim();
    if (i) { cbRender(true); await cbSleep(Math.min(2200, 500 + p.length * 14)); }
    CB.msgs.push({ role: 'assistant', content: p }); cbSave(); cbRender();
    if (form && !CB.lead) cbShowForm();
  }
}
async function cbAsk(text) {
  text = String(text || '').trim(); if (!text || CB.busy) return;
  CB.msgs.push({ role: 'user', content: text }); cbSave(); CB.busy = true; cbRender(true);
  const digits = text.replace(/[\s.]/g, '').match(/0\d{8,10}/);
  let reply = null; const started = Date.now();
  if (!digits && CB.ai !== false) {
    try {
      const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 20000);
      const conv = CB.msgs.filter(m => m.role === 'user' || m.role === 'assistant').slice(-16);
      const r = await fetch('api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: conv }), signal: ctl.signal });
      clearTimeout(t); const j = await r.json().catch(() => null);
      if (r.ok && j && j.reply) { reply = j.reply; CB.ai = true; } else if ([404, 405, 503].includes(r.status)) CB.ai = false;
    } catch (e) {}
  }
  if (digits && !CB.lead) reply = `Dạ em cảm ơn ${XN()} ạ 💚||${cap(X())} cho em xin thêm họ tên và khu vực ${X()} đang ở để em xếp tư vấn viên chi nhánh gần nhất nhé.`;
  if (!reply) { try { reply = cbForWife(cbBrain(text)); } catch (e) { reply = `Dạ ${X()} để lại SĐT giúp em, chị tư vấn viên sẽ gọi lại ngay ạ. [[GOI_LAI]]`; } }
  const wait = Math.min(2400, 700 + String(reply).split('||')[0].length * 12) - (Date.now() - started); if (wait > 0) await cbSleep(wait);
  await cbSay(reply);
  if (digits && !CB.lead) cbShowForm({ phone: digits[0] });
  CB.busy = false; cbSave(); cbRender();
}
async function cbSubmitLead(form) {
  const d = Object.fromEntries(new FormData(form)), phone = phoneOk(d.phone);
  if (!d.name.trim()) return toast('Chị nhập giúp em họ tên ạ.');
  if (!phone) return toast('Số điện thoại chưa đúng (9–11 số).');
  const btn = form.querySelector('button'); btn.disabled = true; btn.textContent = 'Đang gửi…';
  const said = CB.msgs.filter(m => m.role === 'user').map(m => m.content).filter(t => !/^[\d\s.+()-]{9,}$/.test(t)).slice(-10);
  const topics = [...new Set(said.map(t => topicOf(cbN(t))).filter(Boolean).map(t => (SV(topicSvc(t)) || {}).name).filter(Boolean))].join(', ');
  const c = CB.ctx, info = [c.week ? `Thai tuần ${c.week}` : '', c.skin ? `Da: ${{ mun: 'mụn', nam: 'thâm nám', kho: 'khô sạm' }[c.skin]}` : ''].filter(Boolean).join(' · ');
  const note = (info ? info + ' · ' : '') + (said.length ? 'Nội dung chat: ' + said.join(' | ') : 'Khách để lại thông tin qua chat.');
  let branch = '';
  try {
    const r = await fetch('api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lead: { phone, name: d.name.trim(), address: d.address.trim(), topic: topics, note, source: 'Chat website' } }) });
    const j = await r.json().catch(() => ({})); branch = j.branch || '';
  } catch (e) {}
  // cùng trình duyệt với phần mềm quản lý (máy lễ tân) → vào ngay không cần chờ đồng bộ
  const code = 'CHAT' + Date.now().toString(36).toUpperCase();
  inboxPush({ id: 'lead_' + code, kind: 'lead', code, xung: '', name: d.name.trim(), phone, address: d.address.trim(), source: 'Chat website', branch, topic: topics, notes: note, items: [], products: [], total: 0, createdAt: new Date().toISOString() });
  const f = CB.msgs.find(m => m.role === 'form' && !m.done); Object.assign(f || {}, { done: true, name: d.name.trim(), phone, address: d.address.trim(), branch });
  CB.lead = true; if (!c.name) c.name = cap(d.name.trim().split(/\s+/).pop().toLowerCase());
  const br = BRANCHES.find(b => b.name === branch);
  await cbSay(`Dạ em đã chuyển thông tin của ${XN()} cho ${br ? br.name : 'Nàng Ba'} rồi ạ 💚||Chị tư vấn viên sẽ gọi lại ${X()} trong ít phút để xếp lịch và giữ ưu đãi 20% lần đầu. Trong lúc chờ, ${X()} có cần em hỗ trợ thêm gì không ạ? [[DAT_LICH]]`);
  c.step = 'after'; cbSave();
}

// ---------- khung chat ----------
document.body.insertAdjacentHTML('beforeend', `
<button class="cb-fab" id="cbFab" type="button" aria-label="Chat với Nàng Ba 24/7"><span class="cb-tip">Chat với Nàng Ba<b>Tư vấn 24/7</b></span><span class="cb-ic"><i class="fa-solid fa-comments"></i></span></button>
<section class="cb-box" id="cbBox" aria-label="Chat với Nàng Ba">
  <header class="cb-head"><span class="cb-av">NB</span><div><b>Chat với Nàng Ba</b><small><i></i>Trực tuyến 24/7</small></div>
    <a class="cb-zalo" href="https://zalo.me/${CB_ZALO}" target="_blank" rel="noopener" title="Nhắn Zalo 0325 637 863">Zalo</a><button type="button" id="cbClose" aria-label="Đóng">&times;</button></header>
  <div class="cb-body" id="cbBody"></div>
  <div class="cb-quick" id="cbQuick">${['Em đang mang bầu', 'Em mới sinh bé', 'Tư vấn tắm bé', 'Em muốn chăm sóc da', 'Bị tắc sữa'].map(q => `<button type="button" data-cbq="${q}">${q}</button>`).join('')}<button type="button" data-cblead>📞 Để lại thông tin</button></div>
  <form class="cb-in" id="cbForm" autocomplete="off"><input id="cbInput" maxlength="500" placeholder="Nhập tin nhắn…" aria-label="Tin nhắn"><button type="submit" aria-label="Gửi"><i class="fa-solid fa-paper-plane"></i></button></form>
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
