// Bảng giá dùng để máy chủ tự tính lại tiền đơn hàng (không tin số tiền do trình duyệt gửi lên).
// Khi đổi giá trên website (index.html) nhớ đổi cả ở đây.
const SERVICES = {
  DV01: { name: 'Chăm sóc da cơ bản', min: 60, price: 350000 },
  DV02: { name: 'Gội đầu dưỡng sinh', min: 45, price: 150000 },
  DV03: { name: 'Massage body đá nóng', min: 90, price: 450000 },
  DV04: { name: 'Nối mi', min: 60, price: 300000 },
  DV05: { name: 'Peel da sinh học', min: 60, price: 700000 },
  DV06: { name: 'Phun mày tán bột', min: 120, price: 2500000 },
  DV07: { name: 'Trị mụn chuyên sâu', min: 75, price: 550000 },
  DV08: { name: 'Triệt lông nách', min: 30, price: 400000 },
};
const DURATION_ADD = { '60 phút': 0, '90 phút': 150000, '120 phút': 300000 };
const PACK_MULT = { 'Gói đơn buổi': 1, 'Liệu trình 5 buổi': 4, 'Liệu trình VIP 10 buổi': 8 };
const OIL_ADD = { 'Không chọn': 0, 'Tràm trà': 0, 'Oải hương': 50000, 'Hoa hồng': 80000 };
const PRODUCTS = {
  pr1: { name: 'Serum Vitamin C 30ml', price: 599000 }, pr2: { name: 'Toner hoa hồng 200ml', price: 449000 },
  pr3: { name: 'Mặt nạ collagen 10 miếng', price: 699000 }, pr4: { name: 'Kem chống nắng SPF50', price: 649000 },
  pr5: { name: 'Sữa rửa mặt dịu nhẹ', price: 549000 }, pr6: { name: 'Tinh dầu oải hương 50ml', price: 999000 },
  pr7: { name: 'Muối tắm thảo dược', price: 399000 }, pr8: { name: 'Dầu gội thảo mộc 500ml', price: 699000 },
  pr9: { name: 'Dưỡng mi Mi Xinh', price: 499000 },
};
// 9 gói dịch vụ (trang Gói dịch vụ) – giá gói cố định
const PACKAGES = {
  GOI01: { name: 'Gói Thư Giãn Toàn Thân', min: 135, price: 520000 }, GOI02: { name: 'Gói Da Sáng Căng Mịn', min: 120, price: 890000 },
  GOI03: { name: 'Gói Sạch Mụn 5 Buổi', min: 75, price: 2200000 }, GOI04: { name: 'Gói Chăm Sóc Da 10 Buổi', min: 60, price: 2800000 },
  GOI05: { name: 'Gói Cô Dâu Rạng Rỡ', min: 165, price: 690000 }, GOI06: { name: 'Gói Mắt Mày Tự Nhiên', min: 180, price: 2500000 },
  GOI07: { name: 'Gói Vai Gáy Nhẹ Tênh 5 Buổi', min: 45, price: 600000 }, GOI08: { name: 'Gói Spa Trọn Ngày', min: 195, price: 790000 },
  GOI09: { name: 'Gói Triệt Lông Nách 10 Buổi', min: 30, price: 3200000 },
};
const PAYNOW_PCT = 20;
module.exports = { PACKAGES, SERVICES, DURATION_ADD, PACK_MULT, OIL_ADD, PRODUCTS, PAYNOW_PCT };
