// =====================================================
// DỮ LIỆU WEBSITE SPA NÀNG BA
// Sửa nội dung, giá, ảnh... tại file này – trang sẽ tự cập nhật.
// =====================================================
const IMG = id => `https://images.unsplash.com/photo-${id}?w=900&q=80`;

// ---------- DỊCH VỤ ----------
// prices: [tên mức giá, giá hiển thị, MÃ] – mã dùng để máy chủ tính tiền (api/_catalog.js). Đổi giá ở đây thì đổi cả ở api/_catalog.js.
// group: 'spa' = Dịch vụ tại Spa | 'home' = Home Spa bầu & sau sinh
const SERVICES = [
  {
    id: 'spa-bau', group: 'spa', name: 'Chăm sóc mẹ bầu toàn diện tại Spa', img: IMG('1531983412531-1f49a365ffed'),
    short: 'Massage bầu, gội đầu dưỡng sinh, chăm sóc da an toàn cho thai kỳ từ tháng thứ 4.',
    desc: 'Liệu trình dành riêng cho mẹ bầu từ tuần thai thứ 14, giúp giảm đau lưng, phù chân, chuột rút, mất ngủ và căng thẳng. Kỹ thuật viên dùng gối bầu chuyên dụng, tinh dầu thảo mộc được kiểm nghiệm an toàn cho thai kỳ và tránh tuyệt đối các huyệt chống chỉ định.',
    steps: ['Đo huyết áp, hỏi tuần thai & tình trạng sức khỏe', 'Ngâm chân thảo dược ấm', 'Massage lưng – vai – gáy tư thế nằm nghiêng', 'Massage chân giảm phù, giảm chuột rút', 'Gội đầu dưỡng sinh thư giãn', 'Thưởng trà thảo mộc'],
    prices: [['Massage bầu 60 phút', '450.000đ', 'NB0101'], ['Massage bầu + gội đầu 90 phút', '590.000đ', 'NB0102'], ['Gói 10 buổi', '4.990.000đ', 'NB0103']]
  },
  {
    id: 'goidau', group: 'spa', name: 'Gội đầu dưỡng sinh & chăm sóc da mặt', img: IMG('1560750588-73207b1ef5b8'),
    short: 'Gội thảo dược kết hợp bấm huyệt đầu – cổ – vai gáy và làm sạch da mặt.',
    desc: 'Nước gội nấu từ bồ kết, hương nhu, sả, vỏ bưởi; kết hợp bấm huyệt vùng đầu giúp lưu thông khí huyết, giảm đau đầu, ngủ ngon. Phần chăm sóc da mặt gồm làm sạch, tẩy da chết dịu nhẹ, đắp mặt nạ phù hợp từng loại da.',
    steps: ['Tẩy trang, rửa mặt', 'Massage mặt & đắp mặt nạ', 'Gội thảo dược 2 lần', 'Bấm huyệt đầu, cổ, vai gáy', 'Xả, ủ tóc và sấy khô'],
    prices: [['Gội đầu dưỡng sinh 45 phút', '199.000đ', 'NB0201'], ['Gội đầu + chăm sóc da 75 phút', '349.000đ', 'NB0202']]
  },
  {
    id: 'massage', group: 'spa', name: 'Massage body chuyên sâu', img: IMG('1519823551278-64ac92734fb1'),
    short: 'Giải tỏa căng cơ, đau mỏi vai gáy, lưng hông cho dân văn phòng.',
    desc: 'Kết hợp kỹ thuật massage Thụy Điển, ấn huyệt và đá nóng để tác động sâu vào các nhóm cơ bị co cứng. Phù hợp người thường xuyên ngồi lâu, vận động nhiều hoặc mất ngủ kéo dài.',
    steps: ['Xông hơi thảo dược 10 phút', 'Massage toàn thân với tinh dầu', 'Chườm đá nóng vùng lưng', 'Ấn huyệt chuyên sâu vai gáy', 'Nghỉ ngơi, thưởng trà'],
    prices: [['Massage 60 phút', '390.000đ', 'NB0301'], ['Massage đá nóng 90 phút', '550.000đ', 'NB0302']]
  },
  {
    id: 'tambe', group: 'spa', name: 'Tắm & massage bé chuẩn quốc tế', img: IMG('1555252333-9f8e92e65df9'),
    short: 'Bơi thủy liệu pháp, massage giúp bé ăn ngon, ngủ sâu, phát triển vận động.',
    desc: 'Dành cho bé từ 0–12 tháng. Bé được bơi trong bể nước ấm tiệt trùng với phao cổ chuyên dụng, sau đó massage toàn thân theo trình tự giúp hỗ trợ tiêu hóa, giảm đầy hơi, kích thích phát triển vận động và gắn kết với mẹ.',
    steps: ['Kiểm tra nhiệt độ, sức khỏe bé', 'Bơi thủy liệu pháp 15 phút', 'Tắm thảo dược', 'Massage toàn thân cho bé', 'Vệ sinh rốn, mắt, mũi', 'Hướng dẫn mẹ massage tại nhà'],
    prices: [['Tắm + massage bé 1 buổi', '250.000đ', 'NB0401'], ['Gói 10 buổi', '1.990.000đ', 'NB0402']]
  },
  {
    id: 'facial', group: 'spa', name: 'Facial Nàng Ba', img: IMG('1570172619644-dfd03ed5d881'),
    short: 'Soi da, làm sạch sâu, cấp ẩm và phục hồi theo tình trạng từng làn da.',
    desc: 'Liệu trình chăm sóc da mặt chuyên sâu với 12 bước, sử dụng dòng sản phẩm thảo dược lành tính, an toàn cho cả mẹ bầu và mẹ đang cho con bú. Da được soi và tư vấn trước khi chọn phác đồ.',
    steps: ['Soi da & tư vấn', 'Tẩy trang, làm sạch 2 bước', 'Tẩy tế bào chết dịu nhẹ', 'Lấy nhân mụn chuẩn y khoa', 'Điện di tinh chất', 'Đắp mặt nạ & massage nâng cơ'],
    prices: [['Facial cơ bản 60 phút', '350.000đ', 'NB0501'], ['Facial chuyên sâu 90 phút', '590.000đ', 'NB0502']]
  },
  {
    id: 'tayu', group: 'spa', name: 'Tẩy ủ da sáng mịn', img: IMG('1540555700478-4be289fbecef'),
    short: 'Tẩy tế bào chết toàn thân và ủ dưỡng giúp da mịn màng, đều màu.',
    desc: 'Sử dụng muối khoáng, cám gạo, cà phê hoặc sữa chua tùy loại da, sau đó ủ dưỡng bằng mặt nạ thảo dược và bọc màng giữ nhiệt giúp dưỡng chất thẩm thấu sâu.',
    steps: ['Xông hơi mở lỗ chân lông', 'Tẩy tế bào chết toàn thân', 'Ủ dưỡng thảo dược 20 phút', 'Tắm tráng', 'Thoa kem dưỡng khóa ẩm'],
    prices: [['Tẩy + ủ toàn thân 75 phút', '290.000đ', 'NB0601'], ['Gói 5 buổi', '1.290.000đ', 'NB0602']]
  },
  {
    id: 'sanchac', group: 'spa', name: 'Liệu trình săn chắc', img: IMG('1600948836101-f9ffda59d250'),
    short: 'Định hình vóc dáng, săn chắc bụng – eo – đùi sau sinh, không xâm lấn.',
    desc: 'Kết hợp massage đánh tan mỡ, quấn nóng thảo dược và công nghệ sóng RF không xâm lấn giúp làm săn chắc da, giảm vòng eo. Được thiết kế riêng cho mẹ sau sinh từ tháng thứ 2 (sinh thường) hoặc tháng thứ 3 (sinh mổ).',
    steps: ['Đo số đo & tư vấn', 'Massage đánh tan mỡ', 'Công nghệ RF săn chắc', 'Quấn nóng thảo dược', 'Hướng dẫn chế độ ăn & vận động'],
    prices: [['1 buổi 90 phút', '590.000đ', 'NB0701'], ['Gói 10 buổi', '4.990.000đ', 'NB0702']]
  },
  {
    id: 'trietlong', group: 'spa', name: 'Triệt lông', img: IMG('1616394584738-fc6e612e71b9'),
    short: 'Công nghệ ánh sáng thế hệ mới, nhẹ nhàng, không đau rát.',
    desc: 'Triệt lông bằng công nghệ ánh sáng có đầu làm lạnh giúp hạn chế cảm giác nóng rát. Áp dụng cho nách, tay, chân, mép, bikini. Không áp dụng cho mẹ đang mang thai.',
    steps: ['Kiểm tra da', 'Cạo sạch vùng triệt', 'Thoa gel làm mát', 'Chiếu ánh sáng', 'Dưỡng làm dịu da'],
    prices: [['Nách – 1 lần', '199.000đ', 'NB0801'], ['Nách – trọn gói', '1.490.000đ', 'NB0802'], ['Chân/tay – 1 lần', '499.000đ', 'NB0803']]
  },
  {
    id: 'home-bau', group: 'home', name: 'Chăm sóc mẹ bầu toàn diện tại nhà', img: IMG('1498843053639-170ff2122f35'),
    short: 'Kỹ thuật viên mang đầy đủ dụng cụ đến tận nhà massage bầu cho mẹ.',
    desc: 'Mẹ không cần di chuyển – Nàng Ba mang giường gấp, gối bầu, tinh dầu và khăn sạch đến tận nhà. Phù hợp mẹ ở tháng cuối thai kỳ, mẹ bận rộn hoặc được chỉ định hạn chế đi lại.',
    steps: ['Đặt lịch & xác nhận', 'Kỹ thuật viên đến đúng giờ', 'Đo huyết áp, hỏi sức khỏe', 'Massage bầu 60–90 phút', 'Dọn dẹp gọn gàng'],
    prices: [['1 buổi 75 phút', '550.000đ', 'NB0901'], ['Gói 10 buổi', '4.990.000đ', 'NB0902']]
  },
  {
    id: 'home-sausinh', group: 'home', name: 'Chăm sóc mẹ sau sinh tại nhà', img: IMG('1519699047748-de8e457a634e'),
    short: 'Xông hơ, massage phục hồi, chăm sóc vết mổ và tắm bé ngay tại nhà.',
    desc: 'Gói chăm sóc trọn vẹn cho mẹ và bé trong giai đoạn ở cữ, do nữ hộ sinh thực hiện. Giúp mẹ phục hồi sức khỏe, giảm đau nhức, gọi sữa về, co hồi tử cung, đồng thời chăm sóc bé đúng cách.',
    steps: ['Xông hơ thảo dược', 'Massage phục hồi toàn thân', 'Massage bụng co hồi tử cung', 'Chăm sóc vết mổ/tầng sinh môn', 'Tắm & massage bé', 'Tư vấn dinh dưỡng, nuôi con'],
    prices: [['1 buổi (mẹ + bé)', '650.000đ', 'NB1001'], ['Gói 7 buổi', '4.290.000đ', 'NB1002'], ['Gói 15 buổi', '8.490.000đ', 'NB1003'], ['Gói 30 buổi', '15.990.000đ', 'NB1004']]
  },
  {
    id: 'home-tiasua', group: 'home', name: 'Thông tắc tia sữa tại nhà', img: IMG('1559599101-f09722fb4948'),
    short: 'Xử lý tắc sữa, căng tức ngực nhẹ nhàng, có mặt nhanh trong ngày.',
    desc: 'Nữ hộ sinh có chứng chỉ sẽ đến tận nhà xử lý tắc tia sữa bằng kỹ thuật massage chuyên biệt, chườm ấm và hướng dẫn mẹ cho bé bú đúng khớp ngậm để phòng tắc sữa tái phát.',
    steps: ['Kiểm tra tình trạng ngực', 'Chườm ấm thảo dược', 'Massage thông tắc', 'Vắt/hút sữa hỗ trợ', 'Hướng dẫn khớp ngậm & phòng ngừa'],
    prices: [['Thông tắc 1 lần', '500.000đ', 'NB1101'], ['Gọi sữa về (3 buổi)', '1.290.000đ', 'NB1102']]
  },
  {
    id: 'nangco', group: 'menu', name: 'Nâng cơ – Chống lão hóa', img: IMG('1612349317150-e413f6a5b16d'),
    short: 'Công nghệ nâng cơ không phẫu thuật, giúp da săn chắc, trẻ trung.',
    desc: 'Liệu trình sử dụng công nghệ sóng siêu âm hội tụ kết hợp massage nâng cơ thủ công, giúp kích thích tăng sinh collagen, cải thiện chảy xệ và nếp nhăn. Không áp dụng cho mẹ bầu.',
    steps: ['Soi da, chụp ảnh trước liệu trình', 'Làm sạch', 'Nâng cơ công nghệ', 'Massage nâng cơ thủ công', 'Đắp mặt nạ phục hồi'],
    prices: [['1 buổi', '1.500.000đ', 'NB1201'], ['Gói 5 buổi', '6.500.000đ', 'NB1202']]
  }
];

// ---------- CẢM NHẬN KHÁCH HÀNG (thay bằng đánh giá thật của spa) ----------
const TESTIMONIALS = [
  { name: 'Chị Minh Anh', role: 'Mẹ bầu song thai', img: IMG('1494790108377-be9c29b29330'), text: 'Mang song thai nên lưng mỏi khủng khiếp. Từ khi đi massage bầu ở Nàng Ba mỗi tuần, mình ngủ được trọn đêm, chân cũng đỡ phù hẳn.' },
  { name: 'Chị Thu Hà', role: 'Nhân viên văn phòng', img: IMG('1438761681033-6461ffad8d80'), text: 'Mình là khách quen gội đầu dưỡng sinh. Cứ mệt là ghé, 45 phút thôi mà như được sạc lại năng lượng. Nhân viên dễ thương, chỗ ngồi sạch sẽ.' },
  { name: 'Chị Lan Phương', role: 'Mẹ bé Sữa', img: IMG('1544005313-94ddf0286df2'), text: 'Sau sinh mổ mình đặt gói 15 buổi tại nhà. Cô hộ sinh rất nhẹ nhàng, vết mổ lành nhanh, sữa về đều. Một tháng sau mình về gần như cân nặng cũ.' },
  { name: 'Chị Ngọc Mai', role: 'Khách hàng thân thiết', img: IMG('1487412947147-5cebf100ffc2'), text: 'Da mình nhạy cảm, đi nhiều nơi bị kích ứng. Facial ở Nàng Ba dùng đồ lành, sau 3 tháng da đỡ đỏ, mụn giảm rõ.' },
  { name: 'Chị Hồng Nhung', role: 'Mẹ bé Bin', img: IMG('1573461160327-b450ce3d8e7f'), text: 'Bé nhà mình bơi và massage ở đây từ lúc 1 tháng. Bé ăn ngoan, ngủ sâu hơn, còn biết lẫy sớm nữa. Các cô yêu trẻ lắm.' },
  { name: 'Chị Thanh Tâm', role: 'Mẹ bỉm lần 2', img: IMG('1591343395082-e120087004b4'), text: 'Tắc sữa lúc nửa đêm, sáng gọi là trưa có cô tới. Làm xong nhẹ nhõm ngay, còn được chỉ cách cho bé ngậm đúng. Rất biết ơn Nàng Ba.' },
  { name: 'Chị Kim Oanh', role: 'Giáo viên', img: IMG('1522335789203-aabd1fc54bc9'), text: 'Liệu trình săn chắc sau sinh giúp mình giảm 7cm vòng eo sau 10 buổi. Được tư vấn cả chế độ ăn nên kết quả giữ khá tốt.' },
  { name: 'Chị Bảo Ngọc', role: 'Mẹ bầu tháng thứ 7', img: IMG('1629909613654-28e377c37b09'), text: 'Mình thích nhất là được đo huyết áp và hỏi han kỹ trước khi làm. Cảm giác an tâm tuyệt đối khi gửi gắm cả mẹ và con.' }
];

// ---------- CỐ VẤN CHUYÊN MÔN (thay bằng chuyên gia thật) ----------
const ADVISORS = [
  { name: 'BS.CKI Nguyễn Thu Trang', title: 'Cố vấn Sản phụ khoa', img: IMG('1559839734-2b71ea197ec2'), bio: '15 năm kinh nghiệm chăm sóc thai kỳ và hậu sản.' },
  { name: 'BS. Trần Minh Đức', title: 'Cố vấn Nhi khoa', img: IMG('1582750433449-648ed127bb54'), bio: 'Chuyên gia chăm sóc và phát triển trẻ sơ sinh.' },
  { name: 'ThS. Lê Hoài An', title: 'Cố vấn Da liễu thẩm mỹ', img: IMG('1612349317150-e413f6a5b16d'), bio: 'Chuyên điều trị da nhạy cảm, nám và mụn sau sinh.' },
  { name: 'NHS. Phạm Ngọc Ba', title: 'Trưởng bộ phận Đào tạo', img: IMG('1573461160327-b450ce3d8e7f'), bio: 'Nữ hộ sinh, giảng viên đào tạo kỹ thuật viên chăm sóc mẹ & bé.' },
  { name: 'ThS. Đỗ Thanh Hương', title: 'Cố vấn Dinh dưỡng', img: IMG('1594824476967-48c8b964273f'), bio: 'Xây dựng thực đơn cho mẹ bầu và mẹ cho con bú.' }
];

// ---------- TIN TỨC & KIẾN THỨC ----------
const BLOG = [
  { title: 'Chăm sóc trẻ sơ sinh trong 30 ngày đầu: 10 điều mẹ cần biết', date: '25/09/2026', img: IMG('1555252333-9f8e92e65df9'), excerpt: 'Từ cách giữ ấm, vệ sinh rốn đến nhận biết dấu hiệu bất thường – những kiến thức nền tảng giúp mẹ tự tin chăm con.' },
  { title: '8 dấu hiệu tắc tia sữa và cách xử lý tại nhà', date: '22/09/2026', img: IMG('1492725764893-90b379c2b6e7'), excerpt: 'Ngực căng cứng, nổi cục, sốt nhẹ… là những biểu hiện mẹ cần xử lý sớm để tránh viêm tuyến vú.' },
  { title: 'Nhận biết dấu hiệu chuyển dạ để vào viện đúng lúc', date: '18/09/2026', img: IMG('1531983412531-1f49a365ffed'), excerpt: 'Cơn gò đều đặn, ra dịch nhầy hồng, vỡ ối… Hiểu đúng để mẹ bình tĩnh vượt cạn.' },
  { title: 'Rụng tóc sau sinh: vì sao và làm gì để cải thiện?', date: '14/09/2026', img: IMG('1560750588-73207b1ef5b8'), excerpt: 'Rụng tóc sau sinh là tình trạng sinh lý phổ biến do thay đổi nội tiết. Chăm sóc đúng cách giúp tóc phục hồi nhanh.' },
  { title: 'Lịch theo dõi sức khỏe mẹ và bé sau sinh', date: '10/09/2026', img: IMG('1519699047748-de8e457a634e'), excerpt: 'Các mốc tái khám, tiêm chủng và những chỉ số cần theo dõi trong 6 tuần hậu sản.' },
  { title: 'Lấy lại vóc dáng sau sinh an toàn, không vội vàng', date: '05/09/2026', img: IMG('1600948836101-f9ffda59d250'), excerpt: 'Khi nào nên bắt đầu vận động? Chế độ ăn nào vừa giảm cân vừa đủ sữa? Nàng Ba giải đáp.' }
];

// ---------- BÁO CHÍ (thay bằng bài báo thật và link gốc) ----------
const PRESS = [
  { title: 'SPA Nàng Ba khai trương chi nhánh mới với không gian xanh', source: '[Tên báo]', date: '01/09/2026', img: IMG('1515377905703-c4788e51af15'), excerpt: 'Chi nhánh mới mang phong cách gần gũi thiên nhiên, dành riêng khu vực cho mẹ bầu và em bé.' },
  { title: 'Mô hình chăm sóc sau sinh tại nhà ngày càng được ưa chuộng', source: '[Tên báo]', date: '20/08/2026', img: IMG('1498843053639-170ff2122f35'), excerpt: 'Nhiều gia đình trẻ lựa chọn dịch vụ chăm sóc mẹ và bé tại nhà để tiết kiệm thời gian, an toàn hơn.' },
  { title: 'Nàng Ba tổ chức lớp tiền sản miễn phí cho 500 mẹ bầu', source: '[Tên báo]', date: '10/08/2026', img: IMG('1545205597-3d9d02c29597'), excerpt: 'Chương trình nằm trong chuỗi hoạt động cộng đồng thường niên của Nàng Ba.' },
  { title: 'Đào tạo nghề chăm sóc mẹ & bé cho phụ nữ khó khăn', source: '[Tên báo]', date: '28/07/2026', img: IMG('1540420773420-3366772f4999'), excerpt: 'Học viên được đào tạo miễn phí và có cơ hội làm việc tại hệ thống sau khi tốt nghiệp.' },
  { title: 'Xu hướng spa thảo dược lên ngôi', source: '[Tên báo]', date: '15/07/2026', img: IMG('1512290923902-8a9f81dc236c'), excerpt: 'Người tiêu dùng ngày càng quan tâm đến nguồn gốc sản phẩm và sự an toàn trong làm đẹp.' },
  { title: 'Nàng Ba ký kết hợp tác đào tạo chuyên môn', source: '[Tên báo]', date: '01/07/2026', img: IMG('1552693673-1bf958298935'), excerpt: 'Hợp tác nhằm chuẩn hóa quy trình chăm sóc và nâng cao tay nghề kỹ thuật viên.' }
];

// ---------- VIDEO (điền mã YouTube vào youtube: '...') ----------
const VIDEOS = [
  { title: 'Hành trình Nàng Ba – Chăm bằng tay, thương bằng tim', img: IMG('1544161515-4ab6ce6db874'), youtube: '' },
  { title: 'Khai giảng khóa đào tạo nghề chăm sóc mẹ & bé', img: IMG('1540420773420-3366772f4999'), youtube: '' },
  { title: 'Tham quan không gian chi nhánh mới', img: IMG('1515377905703-c4788e51af15'), youtube: '' },
  { title: 'Quy trình massage bầu chuẩn y khoa', img: IMG('1531983412531-1f49a365ffed'), youtube: '' },
  { title: 'Nàng Ba Thiện Nguyện: Tấm lòng nhỏ, yêu thương lớn', img: IMG('1545205597-3d9d02c29597'), youtube: '' },
  { title: 'Hướng dẫn mẹ tắm bé đúng cách tại nhà', img: IMG('1555252333-9f8e92e65df9'), youtube: '' },
  { title: 'Talkshow: Chăm sóc da mẹ bầu & sau sinh', img: IMG('1570172619644-dfd03ed5d881'), youtube: '' },
  { title: 'Tiệc tri ân khách hàng thân thiết', img: IMG('1507652313519-d4e9174996dd'), youtube: '' }
];

// ---------- KHÔNG GIAN ----------
const SPACE = [
  '1540555700478-4be289fbecef', '1600334089648-b0d9d3028eb2', '1515377905703-c4788e51af15', '1507652313519-d4e9174996dd',
  '1552693673-1bf958298935', '1629909613654-28e377c37b09', '1544161515-4ab6ce6db874', '1519823551278-64ac92734fb1'
].map(IMG);

// ---------- ĐỐI TÁC (thay bằng logo thật) ----------
const PARTNERS = [
  ['fa-leaf', 'GreenLeaf'], ['fa-seedling', 'Organica'], ['fa-baby', 'BabyCare'], ['fa-hospital', 'MediPlus'],
  ['fa-droplet', 'PureAqua'], ['fa-sun', 'SunHerb'], ['fa-heart', 'MomLove'], ['fa-spa', 'LotusCare'], ['fa-feather', 'SoftTouch']
];

// ---------- CHI NHÁNH (thay bằng địa chỉ thật) ----------
// staff: nhân viên hiện ở bước "Nhân viên phục vụ" khi đặt lịch – id trùng mã nhân viên trong phần mềm quản lý (st1…st12)
const BRANCHES = [
  { name: 'Nàng Ba – Trụ sở chính', area: 'TP. Hồ Chí Minh', address: '[Số nhà, đường], Quận 3, TP. Hồ Chí Minh', map: 'Quận 3, TP. Hồ Chí Minh', phone: '0785 568 539' , staff: [{ id: 'st1', name: 'Hoa', role: 'Chăm sóc da' }, { id: 'st2', name: 'Mai', role: 'Body, massage' }] },
  { name: 'Nàng Ba – Gò Vấp', area: 'TP. Hồ Chí Minh', address: '[Số nhà, đường], Gò Vấp, TP. Hồ Chí Minh', map: 'Gò Vấp, TP. Hồ Chí Minh', phone: '0785 568 539' , staff: [{ id: 'st3', name: 'Linh', role: 'Mi, mày' }, { id: 'st5', name: 'Ngọc', role: 'Massage bầu & sau sinh' }] },
  { name: 'Nàng Ba – Thủ Đức', area: 'TP. Hồ Chí Minh', address: '[Số nhà, đường], TP. Thủ Đức', map: 'Thủ Đức, TP. Hồ Chí Minh', phone: '0785 568 539' , staff: [{ id: 'st4', name: 'Thảo', role: 'Gội, dưỡng sinh' }, { id: 'st6', name: 'Hằng', role: 'Chăm sóc da' }] },
  { name: 'Nàng Ba – Cầu Giấy', area: 'Hà Nội', address: '[Số nhà, đường], Cầu Giấy, Hà Nội', map: 'Cầu Giấy, Hà Nội', phone: '0785 568 539' , staff: [{ id: 'st7', name: 'Trang', role: 'Nữ hộ sinh' }, { id: 'st8', name: 'Yến', role: 'Tắm bé, massage bé' }] },
  { name: 'Nàng Ba – Biên Hòa', area: 'Đồng Nai', address: '[Số nhà, đường], Biên Hòa, Đồng Nai', map: 'Biên Hòa, Đồng Nai', phone: '0785 568 539' , staff: [{ id: 'st9', name: 'Nhung', role: 'Massage body' }, { id: 'st10', name: 'Vân', role: 'Gội đầu dưỡng sinh' }] },
  { name: 'Nàng Ba – Ninh Kiều', area: 'Cần Thơ', address: '[Số nhà, đường], Ninh Kiều, Cần Thơ', map: 'Ninh Kiều, Cần Thơ', phone: '0785 568 539' , staff: [{ id: 'st11', name: 'Hạnh', role: 'Chăm sóc mẹ sau sinh' }, { id: 'st12', name: 'Duyên', role: 'Chăm sóc da' }] }
];

// ---------- DANH MỤC SẢN PHẨM ----------
const CATEGORIES = [
  { id: 'care', name: 'Nàng Ba Care' },
  { id: 'herbal', name: 'Nàng Ba Herbal' },
  { id: 'mom', name: 'Nàng Ba Mom' },
  { id: 'baby', name: 'Nàng Ba Baby' },
  { id: 'khac', name: 'Sản phẩm khác' }
];

// ---------- SẢN PHẨM ----------
// cat: mã danh mục ở trên | featured: hiện trong "Sản phẩm nổi bật" | old: giá gốc (nếu đang giảm giá)
// Thứ tự trong danh sách = thứ tự "Mới nhất" (sản phẩm đầu tiên là mới nhất)
const PRODUCTS = [
  { id: 'p1', cat: 'herbal', name: 'Tinh dầu massage thảo mộc 50ml', price: 280000, img: IMG('1617897903246-719242758050'), featured: true, size: '50ml',
    desc: 'Tinh dầu nền dừa và hạnh nhân kết hợp sả, gừng, quế giúp làm ấm cơ thể, giảm đau mỏi vai gáy và thư giãn tinh thần.',
    uses: ['Massage toàn thân hoặc vùng vai gáy', 'Nhỏ vài giọt vào nước ngâm chân', 'Không dùng cho vùng bụng mẹ bầu'] },
  { id: 'p2', cat: 'care', name: 'Serum dưỡng sáng da 30ml', price: 450000, old: 520000, img: IMG('1608571423902-eed4a5ad8108'), featured: true, size: '30ml',
    desc: 'Chiết xuất cam thảo, rau má và niacinamide giúp làm đều màu da, mờ thâm và cấp ẩm nhẹ nhàng, phù hợp da nhạy cảm.',
    uses: ['Dùng sáng và tối sau bước toner', 'Lấy 2–3 giọt, vỗ nhẹ lên mặt', 'Ban ngày dùng kèm kem chống nắng'] },
  { id: 'p3', cat: 'mom', name: 'Kem chống rạn da mẹ bầu 100g', price: 320000, img: IMG('1609097164673-7cfafb51b926'), featured: true, size: '100g',
    desc: 'Bơ hạt mỡ, dầu oliu và vitamin E giúp tăng độ đàn hồi, giảm ngứa và hạn chế rạn da ở bụng, đùi, ngực trong thai kỳ.',
    uses: ['Thoa 2 lần/ngày từ tháng thứ 3', 'Massage theo vòng tròn đến khi thấm', 'Tiếp tục dùng 3 tháng sau sinh'] },
  { id: 'p4', cat: 'care', name: 'Kem dưỡng ẩm ban đêm 50g', price: 390000, img: IMG('1601049541289-9b1b7bbbfe19'), featured: true, size: '50g',
    desc: 'Kết cấu kem mềm, thấm nhanh, giúp phục hồi hàng rào bảo vệ da và giữ ẩm suốt đêm.',
    uses: ['Dùng buổi tối ở bước cuối', 'Lấy lượng bằng hạt đậu, chấm 5 điểm và tán đều'] },
  { id: 'p5', cat: 'herbal', name: 'Bộ tinh dầu xông thảo dược', price: 350000, img: IMG('1612817288484-6f916006741a'), size: '3 chai × 10ml',
    desc: 'Bộ 3 tinh dầu tràm, bạc hà, oải hương dùng xông phòng hoặc xông hơi mặt, giúp thông thoáng đường thở và dễ ngủ.',
    uses: ['Nhỏ 3–5 giọt vào máy khuếch tán', 'Xông mặt: 2 giọt vào bát nước nóng'] },
  { id: 'p6', cat: 'care', name: 'Bộ serum & cây lăn đá mặt', price: 520000, img: IMG('1600428877878-1a0fd85beda8'), size: '1 serum 30ml + 1 cây lăn',
    desc: 'Cây lăn đá thạch anh hồng kết hợp serum dưỡng giúp giảm bọng mắt, nâng cơ nhẹ và tăng hiệu quả thẩm thấu dưỡng chất.',
    uses: ['Thoa serum, lăn từ trong ra ngoài, từ dưới lên', 'Để cây lăn trong tủ lạnh trước khi dùng'] },
  { id: 'p7', cat: 'mom', name: 'Tinh chất dưỡng da cho mẹ bầu', price: 380000, img: IMG('1576426863848-c21f53c60b19'), size: '30ml',
    desc: 'Công thức không chứa retinol, không hương liệu, an toàn cho mẹ bầu và mẹ cho con bú, giúp da căng mịn và giảm sạm.',
    uses: ['Dùng sáng và tối', 'Vỗ nhẹ 2–3 giọt lên mặt và cổ'] },
  { id: 'p8', cat: 'herbal', name: 'Xà phòng thảo dược thủ công (4 bánh)', price: 180000, img: IMG('1607006344380-b6775a0824a7'), size: '4 × 100g',
    desc: 'Xà phòng nấu thủ công từ dầu dừa, than tre, nghệ và hoa hồng, làm sạch dịu nhẹ, không làm khô da.',
    uses: ['Tạo bọt với nước, massage lên da rồi rửa sạch', 'Để nơi khô ráo sau khi dùng'] },
  { id: 'p9', cat: 'baby', name: 'Sữa tắm thảo dược cho bé 250ml', price: 165000, img: IMG('1555252333-9f8e92e65df9'), featured: true, size: '250ml',
    desc: 'Chiết xuất lá chè xanh, trầu không và kinh giới giúp làm sạch dịu nhẹ, hỗ trợ giảm rôm sảy, mẩn ngứa cho bé.',
    uses: ['Pha 1 nắp với 5 lít nước ấm', 'Dùng cho bé từ sơ sinh'] },
  { id: 'p10', cat: 'baby', name: 'Dầu dưỡng da cho bé 100ml', price: 185000, img: IMG('1600334089648-b0d9d3028eb2'), size: '100ml',
    desc: 'Dầu dưỡng từ hạt hướng dương và hoa cúc, dùng để massage cho bé sau khi tắm, giúp da mềm mại.',
    uses: ['Thoa lên tay mẹ rồi massage cho bé', 'Tránh vùng mắt'] },
  { id: 'p11', cat: 'care', name: 'Bộ chăm sóc da cơ bản 5 món', price: 890000, old: 1050000, img: IMG('1583209814683-c023dd293cc6'), size: '5 sản phẩm',
    desc: 'Gồm sữa rửa mặt, toner, serum, kem dưỡng và mặt nạ – đủ cho quy trình chăm sóc da hằng ngày.',
    uses: ['Làm sạch → toner → serum → kem dưỡng', 'Mặt nạ dùng 2–3 lần/tuần'] },
  { id: 'p12', cat: 'mom', name: 'Sáp dưỡng môi thiên nhiên', price: 95000, img: IMG('1599305090598-fe179d501227'), size: '10g',
    desc: 'Sáp ong, dầu dừa và bơ ca cao giúp môi mềm, giảm nứt nẻ; an toàn cho mẹ bầu.',
    uses: ['Thoa khi môi khô hoặc trước khi ngủ'] },
  { id: 'p13', cat: 'care', name: 'Mặt nạ bơ dưỡng ẩm (hộp 10 miếng)', price: 220000, img: IMG('1596755389378-c31d21fd1273'), size: '10 miếng',
    desc: 'Mặt nạ giấy thấm tinh chất bơ và mật ong, cấp ẩm tức thì cho da khô, da sau sinh.',
    uses: ['Đắp 15–20 phút sau bước toner', 'Vỗ nhẹ phần tinh chất còn lại'] },
  { id: 'p14', cat: 'khac', name: 'Bộ đá nóng massage tại nhà', price: 450000, img: IMG('1507652313519-d4e9174996dd'), size: '8 viên + túi vải',
    desc: 'Đá bazan tự nhiên giữ nhiệt lâu, dùng massage lưng, vai gáy giúp giảm căng cơ.',
    uses: ['Ngâm đá trong nước 50–55°C khoảng 10 phút', 'Thử nhiệt trên cổ tay trước khi dùng'] },
  { id: 'p15', cat: 'khac', name: 'Khăn ủ tóc sợi tre', price: 120000, img: IMG('1540555700478-4be289fbecef'), size: '1 chiếc',
    desc: 'Sợi tre mềm, thấm hút nhanh, giúp tóc khô nhanh và hạn chế gãy rụng sau khi gội.',
    uses: ['Quấn tóc 10–15 phút sau khi gội', 'Giặt riêng ở nhiệt độ dưới 40°C'] }
];

// ---------- HỌC VIỆN NÀNG BA – KHÓA ĐÀO TẠO (trang #dao-tao) ----------
// fee: để 'Liên hệ' hoặc ghi học phí thật (VD '8.500.000đ'). modules: nội dung học; outcomes: học xong làm được gì.
const COURSES = [
  { id: 'massage-bau', name: 'Massage bầu & chăm sóc sau sinh', img: IMG('1531983412531-1f49a365ffed'), duration: '1 tháng', sessions: '24 buổi', level: 'Cơ bản → Nâng cao', fee: 'Liên hệ',
    short: 'Kỹ thuật massage an toàn cho mẹ bầu từ tuần 14 và phục hồi mẹ sau sinh theo quy chuẩn y khoa.',
    forWho: 'Người mới vào nghề, kỹ thuật viên spa muốn mở rộng dịch vụ mẹ & bé.',
    modules: ['Sinh lý thai kỳ, các huyệt và vùng chống chỉ định', 'Tư thế nằm nghiêng, dùng gối bầu đúng cách', 'Massage lưng – vai – gáy, giảm phù chân, chuột rút', 'Chăm sóc mẹ sau sinh thường & sinh mổ: bụng, eo, lưng', 'Xông, chườm thảo dược và tư vấn phục hồi', 'Giao tiếp, xử lý tình huống với khách mẹ bầu'],
    outcomes: ['Tự tin thực hiện trọn liệu trình massage bầu 60–90 phút', 'Nhận biết dấu hiệu cần dừng và chuyển bác sĩ', 'Làm việc tại spa hoặc phục vụ tại nhà'] },
  { id: 'tia-sua', name: 'Thông tắc tia sữa', img: IMG('1559599101-f09722fb4948'), duration: '2 tuần', sessions: '10 buổi', level: 'Chuyên sâu', fee: 'Liên hệ',
    short: 'Kỹ thuật thông tắc, kích sữa và tư vấn nuôi con bằng sữa mẹ do nữ hộ sinh hướng dẫn.',
    forWho: 'Nữ hộ sinh, điều dưỡng, kỹ thuật viên chăm sóc mẹ sau sinh.',
    modules: ['Giải phẫu tuyến vú và cơ chế tiết sữa', 'Nhận biết tắc tia sữa, viêm tuyến vú cần chuyển viện', 'Kỹ thuật massage thông tắc, chườm ấm – lạnh', 'Kích sữa, gọi sữa về sau sinh', 'Hướng dẫn mẹ tư thế cho bú và vắt sữa'],
    outcomes: ['Xử lý ca tắc sữa thường gặp tại nhà', 'Tư vấn mẹ duy trì nguồn sữa', 'Nhận ca dịch vụ tại nhà cùng hệ thống Nàng Ba'] },
  { id: 'tam-be', name: 'Tắm & massage bé chuẩn quốc tế', img: IMG('1555252333-9f8e92e65df9'), duration: '2 tuần', sessions: '10 buổi', level: 'Cơ bản', fee: 'Liên hệ',
    short: 'Tắm, massage, vệ sinh rốn và chăm sóc bé sơ sinh 0–12 tháng đúng kỹ thuật, an toàn.',
    forWho: 'Người mới vào nghề, bảo mẫu, mẹ bỉm muốn tự chăm con chuyên nghiệp.',
    modules: ['Đặc điểm da và cơ thể trẻ sơ sinh', 'Quy trình tắm bé an toàn, nhiệt độ nước, phòng tắm', 'Massage bé theo từng tháng tuổi', 'Vệ sinh rốn, mắt, mũi, chăm sóc hăm – rôm sảy', 'Dấu hiệu bất thường cần đưa bé đi khám'],
    outcomes: ['Tắm và massage bé thành thạo, nhẹ nhàng', 'Tư vấn mẹ chăm sóc bé hằng ngày', 'Làm dịch vụ tắm bé tại spa hoặc tại nhà'] },
  { id: 'cham-soc-da', name: 'Chăm sóc da chuyên sâu', img: IMG('1570172619644-dfd03ed5d881'), duration: '1 tháng', sessions: '20 buổi', level: 'Cơ bản → Nâng cao', fee: 'Liên hệ',
    short: 'Soi da, phân loại da, quy trình facial và chăm sóc da nhạy cảm, da sau sinh.',
    forWho: 'Kỹ thuật viên spa, người muốn mở phòng chăm sóc da nhỏ.',
    modules: ['Cấu trúc da, phân loại da, soi da', 'Quy trình facial cơ bản và chuyên sâu', 'Chăm sóc da mụn, nám, da sau sinh', 'Mỹ phẩm: thành phần, chống chỉ định cho mẹ bầu', 'Vệ sinh, vô khuẩn dụng cụ và phòng làm việc'],
    outcomes: ['Tư vấn và lên liệu trình theo từng loại da', 'Thực hiện facial 60–90 phút chuẩn quy trình', 'Đủ kỹ năng làm việc tại spa, thẩm mỹ viện'] },
  { id: 'quan-ly-spa', name: 'Quản lý & vận hành spa', img: IMG('1544161515-4ab6ce6db874'), duration: '2 tháng', sessions: '16 buổi', level: 'Dành cho chủ spa', fee: 'Liên hệ',
    short: 'Vận hành spa bằng phần mềm VUA APP: lịch hẹn, khách hàng, thu ngân, kho, lương và nhiều chi nhánh.',
    forWho: 'Chủ spa, quản lý chi nhánh, người chuẩn bị mở spa.',
    modules: ['Xây dựng bảng giá, gói liệu trình, chính sách khuyến mãi', 'Quản lý lịch hẹn, khách hàng, chăm sóc khách quay lại', 'Thu ngân, công nợ, chi phí và báo cáo lợi nhuận', 'Tuyển dụng, xếp ca, chấm công, tính lương – hoa hồng', 'Bán hàng online: website, thanh toán QR, Zalo, Telegram', 'Quản lý nhiều chi nhánh'],
    outcomes: ['Tự vận hành spa trên phần mềm từ ngày đầu', 'Đọc báo cáo, kiểm soát doanh thu – chi phí', 'Được hỗ trợ khi mở spa hoặc nhượng quyền Nàng Ba'] }
];

// ---------- HỢP TÁC CÙNG NÀNG BA (trang #hop-tac) ----------
// invest: vốn/điều kiện tham khảo – để 'Liên hệ' hoặc ghi con số thật. Sửa nội dung từng mô hình tại đây.
const PARTNER_PROGRAMS = [
  { id: 'dao-tao-quan-ly', icon: 'fa-chalkboard-user', name: 'Đào tạo & Quản lý', tagline: 'Nâng tay nghề đội ngũ và chuẩn hóa vận hành cho spa của bạn',
    img: IMG('1544161515-4ab6ce6db874'), invest: 'Liên hệ', forWho: 'Chủ spa, thẩm mỹ viện, phòng khám mẹ & bé đang hoạt động muốn mở thêm dịch vụ mẹ bầu – sau sinh – em bé.',
    benefits: ['Đào tạo kỹ thuật viên theo quy trình chuẩn y khoa của Nàng Ba', 'Chuyển giao quy trình dịch vụ mẹ bầu, sau sinh, tắm bé, thông tắc tia sữa', 'Triển khai phần mềm quản lý VUA APP: lịch hẹn, khách hàng, thu ngân, lương, nhiều chi nhánh', 'Đánh giá định kỳ chất lượng dịch vụ và tay nghề'],
    support: ['Giảng viên đến tận cơ sở hoặc học tại Học viện Nàng Ba', 'Bộ tài liệu quy trình, biểu mẫu, kịch bản tư vấn khách', 'Hỗ trợ cài đặt phần mềm và đào tạo lễ tân, thu ngân'] },
  { id: 'khoi-nghiep', icon: 'fa-rocket', name: 'Khởi nghiệp', tagline: 'Mở spa mẹ & bé mang thương hiệu Nàng Ba – có người đồng hành từ ngày đầu',
    img: IMG('1600948836101-f9ffda59d250'), invest: 'Liên hệ', forWho: 'Cá nhân muốn mở spa mẹ & bé, kỹ thuật viên lâu năm muốn tự kinh doanh, mẹ bỉm muốn khởi nghiệp.',
    benefits: ['Sử dụng thương hiệu, hình ảnh và bộ nhận diện Nàng Ba', 'Tư vấn chọn mặt bằng, thiết kế không gian, danh mục thiết bị', 'Đào tạo trọn gói kỹ thuật viên, lễ tân và người quản lý', 'Kế hoạch khai trương, marketing và chương trình khách hàng đầu tiên'],
    support: ['Cung cấp sản phẩm, vật tư theo giá hệ thống', 'Phần mềm VUA APP, website đặt lịch và thanh toán QR', 'Đồng hành vận hành trong những tháng đầu sau khai trương'] },
  { id: 'phan-phoi', icon: 'fa-truck-fast', name: 'Phân phối', tagline: 'Trở thành đại lý, nhà phân phối sản phẩm Nàng Ba Care, Herbal, Mom, Baby',
    img: IMG('1617897903246-719242758050'), invest: 'Liên hệ', forWho: 'Cửa hàng mẹ & bé, nhà thuốc, spa, cộng tác viên bán hàng online.',
    benefits: ['Chiết khấu theo cấp đại lý và sản lượng', 'Sản phẩm thảo dược lành tính, phù hợp mẹ bầu, mẹ sau sinh và em bé', 'Hình ảnh, nội dung bán hàng, video hướng dẫn sử dụng có sẵn', 'Khu vực phân phối được bảo vệ theo thỏa thuận'],
    support: ['Đào tạo kiến thức sản phẩm và tư vấn khách', 'Hỗ trợ vận chuyển, đổi trả theo chính sách', 'Chương trình khuyến mãi theo mùa cho đại lý'] },
  { id: 'dau-tu', icon: 'fa-chart-line', name: 'Đầu tư', tagline: 'Đồng hành mở rộng hệ thống chi nhánh Nàng Ba',
    img: IMG('1519823551278-64ac92734fb1'), invest: 'Liên hệ', forWho: 'Nhà đầu tư cá nhân, doanh nghiệp quan tâm lĩnh vực chăm sóc sức khỏe mẹ & bé.',
    benefits: ['Góp vốn mở chi nhánh mới hoặc mở rộng chi nhánh hiện có', 'Minh bạch số liệu: doanh thu, chi phí, lợi nhuận từng chi nhánh trên phần mềm quản lý', 'Báo cáo định kỳ, quyền theo dõi trực tuyến', 'Phương án hợp tác, phân chia lợi nhuận thỏa thuận theo hợp đồng'],
    support: ['Nàng Ba trực tiếp vận hành chi nhánh theo quy chuẩn hệ thống', 'Khảo sát thị trường, lập phương án kinh doanh cho từng địa điểm', 'Tư vấn pháp lý, hợp đồng rõ ràng'] }
];

// ---------- TRANG NỘI DUNG (mở dạng popup) ----------
const PAGES = {
  about: { title: 'Câu chuyện Nàng Ba', html: `<p><strong>SPA Nàng Ba</strong> được thành lập bởi những người phụ nữ từng trải qua hành trình mang thai và nuôi con nhỏ, thấu hiểu những mệt mỏi, lo âu mà người mẹ phải đối mặt.</p><p>Chúng tôi mong muốn xây dựng một “ngôi nhà thứ hai”, nơi mọi người phụ nữ đều được chăm sóc bằng sự chuyên nghiệp của y khoa và sự ấm áp của người thân.</p><h4>Tầm nhìn</h4><p>Trở thành hệ thống chăm sóc mẹ & bé được tin yêu hàng đầu Việt Nam.</p><h4>Sứ mệnh</h4><p>Mang dịch vụ chăm sóc an toàn, tận tâm và giá hợp lý đến mọi gia đình Việt.</p><h4>Giá trị cốt lõi</h4><ul><li>Tận tâm</li><li>Chuyên nghiệp</li><li>Minh bạch</li><li>Sẻ chia</li></ul>` },
  awards: { title: 'Bằng cấp và giải thưởng', html: `<p>Khu vực trưng bày chứng nhận, giấy phép hoạt động và các giải thưởng của SPA Nàng Ba.</p><ul><li>Giấy phép kinh doanh dịch vụ spa – [cập nhật]</li><li>Chứng chỉ đào tạo kỹ thuật viên – [cập nhật]</li><li>Chứng nhận sản phẩm đạt chuẩn – [cập nhật]</li><li>Giải thưởng / danh hiệu – [cập nhật]</li></ul>` },
  training: { title: 'Đào tạo nghề', html: `<p>Học viện Nàng Ba đào tạo nghề chăm sóc mẹ & bé, spa trị liệu với lộ trình từ cơ bản đến nâng cao.</p><h4>Các khóa học</h4><ul><li>Massage bầu & sau sinh – 1 tháng</li><li>Thông tắc tia sữa – 2 tuần</li><li>Tắm & massage bé – 2 tuần</li><li>Chăm sóc da chuyên sâu – 1 tháng</li><li>Quản lý spa – 2 tháng</li></ul><p>Học viên được cấp chứng chỉ và giới thiệu việc làm sau khi tốt nghiệp.</p><a class="btn btn-primary" href="#dao-tao">Xem chi tiết các khóa học</a>` },
  promo: { title: 'Ưu đãi', html: `<ul><li><b>Giảm 20%</b> cho khách hàng lần đầu trải nghiệm</li><li><b>Tặng 1 buổi</b> gội đầu dưỡng sinh khi mua gói 10 buổi</li><li><b>Giảm 10%</b> gói sau sinh khi đăng ký trước ngày dự sinh 30 ngày</li><li>Sinh nhật khách hàng: <b>tặng voucher 200.000đ</b></li></ul><button class="btn btn-primary" data-open="bookingModal">Đặt lịch nhận ưu đãi</button>` },
  jobs: { title: 'Tuyển dụng', html: `<p>Nàng Ba luôn chào đón những người yêu nghề, tận tâm.</p><ul><li>Kỹ thuật viên spa (được đào tạo miễn phí)</li><li>Nữ hộ sinh chăm sóc mẹ & bé tại nhà</li><li>Lễ tân – Chăm sóc khách hàng</li><li>Quản lý chi nhánh</li></ul><p>Gửi CV về: <a href="mailto:tuyendung@spanangba.vn">tuyendung@spanangba.vn</a></p>` },
  'policy-buy': { title: 'Hướng dẫn mua hàng', html: `<ol><li>Chọn sản phẩm và bấm “Thêm vào giỏ”.</li><li>Mở giỏ hàng, kiểm tra và bấm “Thanh toán”.</li><li>Điền thông tin nhận hàng.</li><li>Nàng Ba gọi xác nhận và giao hàng.</li></ol>` },
  'policy-general': { title: 'Chính sách & Quy định chung', html: `<p>[Nội dung chính sách chung – cập nhật theo quy định của doanh nghiệp.]</p>` },
  'policy-warranty': { title: 'Chính sách bảo hành', html: `<p>[Nội dung bảo hành dịch vụ và sản phẩm – cập nhật.]</p>` },
  'policy-privacy': { title: 'Chính sách bảo mật', html: `<p>Nàng Ba cam kết bảo mật thông tin cá nhân của khách hàng, chỉ sử dụng để liên hệ, xác nhận lịch hẹn và chăm sóc khách hàng. [Bổ sung chi tiết.]</p>` },
  'policy-return': { title: 'Chính sách đổi trả hàng', html: `<p>[Điều kiện và thời hạn đổi trả – cập nhật.]</p>` },
  'policy-ship': { title: 'Chính sách vận chuyển', html: `<p>[Phí và thời gian giao hàng – cập nhật.]</p>` },
  'policy-pay': { title: 'Chính sách thanh toán', html: `<p>Thanh toán tiền mặt, chuyển khoản, thẻ ATM/Visa/Master hoặc ví điện tử. [Cập nhật số tài khoản.]</p>` }
};
