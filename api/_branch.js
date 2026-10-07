// Chọn chi nhánh gần khách nhất theo địa chỉ khách để lại (chat, hợp tác…).
// Tên chi nhánh trùng BRANCHES trong data.js và danh mục Chi nhánh của phần mềm quản lý.
// Thứ tự kiểm tra: quận/huyện cụ thể → tỉnh/thành → vùng miền → Trụ sở chính.
const B = {
  Q3: 'Nàng Ba – Trụ sở chính', GV: 'Nàng Ba – Gò Vấp', TD: 'Nàng Ba – Thủ Đức',
  CG: 'Nàng Ba – Cầu Giấy', BH: 'Nàng Ba – Biên Hòa', NK: 'Nàng Ba – Ninh Kiều',
};
const norm = s => ' ' + String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')
  .replace(/[^a-z0-9]+/g, ' ').replace(/\b(tp|thanh pho|tinh)\b/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
// [chi nhánh, các cụm từ] – kiểm tra theo thứ tự, cụm cụ thể đứng trước
const RULES = [
  // TP.HCM theo quận/huyện
  [B.TD, ['thu duc', 'quan 2', 'q 2', 'q2', 'quan 9', 'q 9', 'q9', 'thao dien', 'an phu', 'linh trung', 'hiep binh', 'di an', 'thuan an', 'binh duong', 'thu dau mot']],
  [B.GV, ['go vap', 'quan 12', 'q 12', 'q12', 'hoc mon', 'cu chi', 'binh thanh', 'tan binh', 'tan phu', 'an suong']],
  [B.Q3, ['quan 3', 'q 3', 'q3', 'quan 1', 'q 1', 'q1', 'quan 4', 'q4', 'quan 5', 'q5', 'quan 6', 'q6', 'quan 7', 'q7', 'quan 8', 'q8', 'quan 10', 'q10', 'quan 11', 'q11',
    'phu nhuan', 'binh tan', 'binh chanh', 'nha be', 'can gio', 'ho chi minh', 'hcm', 'sai gon', 'saigon', 'long an', 'tay ninh', 'tien giang', 'ben tre']],
  // Miền Bắc → Cầu Giấy
  [B.CG, ['cau giay', 'ha noi', 'hanoi', 'ha dong', 'dong da', 'ba dinh', 'hoan kiem', 'hai ba trung', 'thanh xuan', 'hoang mai', 'long bien', 'tay ho', 'nam tu liem', 'bac tu liem',
    'hai phong', 'quang ninh', 'bac ninh', 'bac giang', 'hai duong', 'hung yen', 'vinh phuc', 'phu tho', 'thai nguyen', 'nam dinh', 'ninh binh', 'thai binh', 'ha nam', 'hoa binh',
    'lang son', 'cao bang', 'ha giang', 'lao cai', 'yen bai', 'tuyen quang', 'son la', 'dien bien', 'lai chau', 'bac kan', 'thanh hoa', 'nghe an', 'ha tinh']],
  // Đông Nam Bộ, Nam Trung Bộ, Tây Nguyên → Biên Hòa
  [B.BH, ['bien hoa', 'dong nai', 'long thanh', 'nhon trach', 'trang bom', 'vung tau', 'ba ria', 'binh phuoc', 'binh thuan', 'phan thiet', 'ninh thuan', 'lam dong', 'da lat', 'dak lak', 'dak nong', 'gia lai', 'kon tum', 'khanh hoa', 'nha trang']],
  // Đồng bằng sông Cửu Long → Ninh Kiều
  [B.NK, ['ninh kieu', 'can tho', 'cai rang', 'binh thuy', 'vinh long', 'an giang', 'long xuyen', 'chau doc', 'kien giang', 'rach gia', 'phu quoc', 'hau giang', 'soc trang', 'bac lieu', 'ca mau', 'dong thap', 'tra vinh']],
];
function nearestBranch(address) {
  const a = norm(address); if (a.trim() === '') return '';
  for (const [branch, keys] of RULES) if (keys.some(k => a.includes(' ' + k + ' '))) return branch;
  return B.Q3;
}
module.exports = { nearestBranch, BRANCH_NAMES: Object.values(B) };
