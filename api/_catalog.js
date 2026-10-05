// Bảng giá máy chủ dùng để tự tính lại tiền đơn hàng (không tin số tiền do trình duyệt gửi lên).
// Sinh từ data.js của website SPA Nàng Ba: mỗi mức giá có một MÃ (NBsso). Đổi giá trong data.js thì đổi cả ở đây.
// Tên dịch vụ = "<tên dịch vụ> – <mức giá>", trùng tên trong danh mục phần mềm quản lý để tự nối hồ sơ.
const SERVICES = {
  NB0101: { name: 'Chăm sóc mẹ bầu toàn diện tại Spa – Massage bầu 60 phút', min: 60, price: 450000 },
  NB0102: { name: 'Chăm sóc mẹ bầu toàn diện tại Spa – Massage bầu + gội đầu 90 phút', min: 90, price: 590000 },
  NB0103: { name: 'Chăm sóc mẹ bầu toàn diện tại Spa – Gói 10 buổi', min: 60, price: 4990000 },
  NB0201: { name: 'Gội đầu dưỡng sinh & chăm sóc da mặt – Gội đầu dưỡng sinh 45 phút', min: 45, price: 199000 },
  NB0202: { name: 'Gội đầu dưỡng sinh & chăm sóc da mặt – Gội đầu + chăm sóc da 75 phút', min: 75, price: 349000 },
  NB0301: { name: 'Massage body chuyên sâu – Massage 60 phút', min: 60, price: 390000 },
  NB0302: { name: 'Massage body chuyên sâu – Massage đá nóng 90 phút', min: 90, price: 550000 },
  NB0401: { name: 'Tắm & massage bé chuẩn quốc tế – Tắm + massage bé 1 buổi', min: 60, price: 250000 },
  NB0402: { name: 'Tắm & massage bé chuẩn quốc tế – Gói 10 buổi', min: 60, price: 1990000 },
  NB0501: { name: 'Facial Nàng Ba – Facial cơ bản 60 phút', min: 60, price: 350000 },
  NB0502: { name: 'Facial Nàng Ba – Facial chuyên sâu 90 phút', min: 90, price: 590000 },
  NB0601: { name: 'Tẩy ủ da sáng mịn – Tẩy + ủ toàn thân 75 phút', min: 75, price: 290000 },
  NB0602: { name: 'Tẩy ủ da sáng mịn – Gói 5 buổi', min: 60, price: 1290000 },
  NB0701: { name: 'Liệu trình săn chắc – 1 buổi 90 phút', min: 90, price: 590000 },
  NB0702: { name: 'Liệu trình săn chắc – Gói 10 buổi', min: 60, price: 4990000 },
  NB0801: { name: 'Triệt lông – Nách – 1 lần', min: 60, price: 199000 },
  NB0802: { name: 'Triệt lông – Nách – trọn gói', min: 60, price: 1490000 },
  NB0803: { name: 'Triệt lông – Chân/tay – 1 lần', min: 60, price: 499000 },
  NB0901: { name: 'Chăm sóc mẹ bầu toàn diện tại nhà – 1 buổi 75 phút', min: 75, price: 550000 },
  NB0902: { name: 'Chăm sóc mẹ bầu toàn diện tại nhà – Gói 10 buổi', min: 60, price: 4990000 },
  NB1001: { name: 'Chăm sóc mẹ sau sinh tại nhà – 1 buổi (mẹ + bé)', min: 60, price: 650000 },
  NB1002: { name: 'Chăm sóc mẹ sau sinh tại nhà – Gói 7 buổi', min: 60, price: 4290000 },
  NB1003: { name: 'Chăm sóc mẹ sau sinh tại nhà – Gói 15 buổi', min: 60, price: 8490000 },
  NB1004: { name: 'Chăm sóc mẹ sau sinh tại nhà – Gói 30 buổi', min: 60, price: 15990000 },
  NB1101: { name: 'Thông tắc tia sữa tại nhà – Thông tắc 1 lần', min: 60, price: 500000 },
  NB1102: { name: 'Thông tắc tia sữa tại nhà – Gọi sữa về (3 buổi)', min: 60, price: 1290000 },
  NB1201: { name: 'Nâng cơ – Chống lão hóa – 1 buổi', min: 60, price: 1500000 },
  NB1202: { name: 'Nâng cơ – Chống lão hóa – Gói 5 buổi', min: 60, price: 6500000 },
};
// Không dùng phụ thu thời lượng / tinh dầu / nhân gói như bản cũ – mỗi mức giá là một mã riêng.
const DURATION_ADD = {};
const PACK_MULT = { 'Gói đơn buổi': 1 };
const OIL_ADD = { 'Không chọn': 0 };
const PRODUCTS = {
  p1: { name: 'Tinh dầu massage thảo mộc 50ml', price: 280000 },
  p2: { name: 'Serum dưỡng sáng da 30ml', price: 450000 },
  p3: { name: 'Kem chống rạn da mẹ bầu 100g', price: 320000 },
  p4: { name: 'Kem dưỡng ẩm ban đêm 50g', price: 390000 },
  p5: { name: 'Bộ tinh dầu xông thảo dược', price: 350000 },
  p6: { name: 'Bộ serum & cây lăn đá mặt', price: 520000 },
  p7: { name: 'Tinh chất dưỡng da cho mẹ bầu', price: 380000 },
  p8: { name: 'Xà phòng thảo dược thủ công (4 bánh)', price: 180000 },
  p9: { name: 'Sữa tắm thảo dược cho bé 250ml', price: 165000 },
  p10: { name: 'Dầu dưỡng da cho bé 100ml', price: 185000 },
  p11: { name: 'Bộ chăm sóc da cơ bản 5 món', price: 890000 },
  p12: { name: 'Sáp dưỡng môi thiên nhiên', price: 95000 },
  p13: { name: 'Mặt nạ bơ dưỡng ẩm (hộp 10 miếng)', price: 220000 },
  p14: { name: 'Bộ đá nóng massage tại nhà', price: 450000 },
  p15: { name: 'Khăn ủ tóc sợi tre', price: 120000 },
};
const PACKAGES = {};
const PAYNOW_PCT = 20;
module.exports = { PACKAGES, SERVICES, DURATION_ADD, PACK_MULT, OIL_ADD, PRODUCTS, PAYNOW_PCT };
