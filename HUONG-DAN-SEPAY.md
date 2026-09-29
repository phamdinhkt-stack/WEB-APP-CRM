# Hướng dẫn bật thanh toán SePay (Spa HOA MAI)

## Luồng hoạt động

1. **Khách đặt lịch trên website.** Đơn được gửi về máy chủ (`/api/orders`). Máy chủ tự tính lại tiền theo bảng giá trong `api/_catalog.js` và báo cho Lễ tân qua Telegram nếu đã cài.
2. **Khách chọn "Thanh toán trước giảm 20%".** Trang hiện mã VietQR đúng số tiền, nội dung chuyển khoản là mã đơn (ví dụ `HM260928C372`). Trang tự kiểm tra trạng thái mỗi 4 giây.
3. **Khách chuyển khoản.** SePay gọi `/api/sepay-webhook` và máy chủ khớp mã đơn với số tiền:
   - Đơn được đánh dấu **đã thanh toán**.
   - Trang của khách tự đổi sang **"Thanh toán thành công"**.
   - Khách nhận **email xác nhận** nếu có để lại email và đã cài Resend.
   - Thu ngân, Kế toán và Lễ tân nhận **tin Telegram** nếu đã cài.
4. **Phần mềm quản lý (`/app/`) tự lấy dữ liệu mỗi 30 giây:**
   - **Lễ tân:** lịch vào *Danh sách chờ* với nhãn **"Đã TT …"** và ghi chú "KHÔNG THU LẠI".
   - **Thu ngân và Kế toán:** tự tạo **Hóa đơn** (kind `online`, đã trừ ưu đãi) và **phiếu thu chuyển khoản**, có mặt trong Báo cáo.
   - **Hồ sơ khách:** thêm ghi chú được ghim "Đã thanh toán trước …".

Chuyển khoản không khớp đơn nào vẫn được lưu lại (`sepay:unmatched`), và Kế toán được báo qua Telegram. Chuyển thiếu tiền thì đơn ở trạng thái "thiếu", kèm số tiền còn thiếu.

## Cài đặt (làm một lần, khoảng 15 phút)

1. **Kho dữ liệu:** trên Vercel vào dự án → **Storage** (hoặc Marketplace) → **Upstash for Redis** → *Create & Connect*. Chọn gói Free là đủ. Vercel tự thêm `KV_REST_API_URL` và `KV_REST_API_TOKEN`.
2. **SePay:**
   - Đăng ký tại my.sepay.vn và liên kết tài khoản **Sacombank 060241562975**. Sacombank dùng mã thanh toán trong nội dung chuyển khoản, không cần tài khoản ảo.
   - Vào **Cấu hình công ty → Cấu trúc mã thanh toán**, đặt tiền tố `HM` để SePay nhận ra mã đơn.
   - Vào **Tích hợp Webhooks → Thêm webhook**:
     - Sự kiện: *Có tiền vào*.
     - URL: `https://<ten-mien-cua-ban>/api/sepay-webhook`.
     - Kiểu chứng thực: **API Key**. Tự đặt một chuỗi bí mật và nhập vào đây.
   - Trên Vercel, thêm biến `SEPAY_API_KEY` bằng đúng chuỗi đó.
3. **Khóa CRM:** trên Vercel, thêm biến `CRM_SYNC_KEY` là một chuỗi dài, khó đoán. Trong phần mềm quản lý, vào **Cài đặt → Kết nối website & thanh toán SePay**, nhập chuỗi này rồi bấm **Lưu kết nối**. Làm trên mỗi máy dùng phần mềm.
4. **Email cho khách (tuỳ chọn):** tạo tài khoản resend.com và xác minh tên miền. Trên Vercel, thêm `RESEND_API_KEY` và `RESEND_FROM`.
5. **Telegram cho các bộ phận (tuỳ chọn):**
   - Tạo bot qua @BotFather, rồi thêm bot vào nhóm của Lễ tân, Thu ngân và Kế toán.
   - Trên Vercel, thêm `TELEGRAM_BOT_TOKEN` và `TELEGRAM_CHAT_LETAN`, `TELEGRAM_CHAT_THUNGAN`, `TELEGRAM_CHAT_KETOAN`. Nếu chỉ có một nhóm chung thì chỉ cần `TELEGRAM_CHAT_ID`.
6. **Triển khai lại (Redeploy)** trên Vercel để các biến có hiệu lực.
7. **Kiểm tra:** trong SePay có nút **Gửi thử webhook**. Bạn cũng có thể đặt thử một lịch trên website rồi chuyển khoản số tiền nhỏ theo đúng mã.

## Lưu ý

- Khi đổi giá dịch vụ hoặc sản phẩm trên website, nhớ đổi cả trong `api/_catalog.js`. Máy chủ luôn tính tiền theo file này để khách không sửa được giá.
- Giá Flash sale được máy chủ đọc từ `flashsale.json`. Sau khi sửa Flash sale trong phần mềm, nhớ xuất file và tải lên.
- Nếu chưa cài máy chủ, website vẫn chạy như trước: lịch chỉ tự vào phần mềm khi mở trên cùng trình duyệt, và khách tự bấm "Tôi đã chuyển khoản".
- Gửi xác nhận qua **Zalo ZNS** cần Zalo OA đã xác thực và mẫu tin được Zalo duyệt. Phần này chưa làm, có thể bổ sung sau.

## Chatbot "Tư vấn trực tiếp" (góc phải website)

- **Chưa có khóa AI:** chatbot dùng bộ trả lời có sẵn. Nó trả lời được các câu hay gặp như chào hỏi, giá từng dịch vụ, ưu đãi và Flash sale, da mụn, da khô, đau mỏi, địa chỉ, giờ nhận khách, thanh toán, đặt lịch. Mỗi câu trả lời kèm nút Đặt lịch, trang chi tiết dịch vụ hoặc Zalo.
- **Có AI:** trên Vercel thêm `ANTHROPIC_API_KEY` (lấy tại console.anthropic.com), tuỳ chọn thêm `ANTHROPIC_MODEL`, rồi Redeploy. Chatbot sẽ trò chuyện tự nhiên theo đúng bảng giá, ưu đãi và Flash sale hiện tại. Nội dung hướng dẫn cho AI nằm trong `api/chat.js`, sửa được nếu muốn đổi giọng điệu hoặc thông tin.
- **Khi khách nhắn số điện thoại trong khung chat:**
  - Số được lưu thành "khách cần gọi lại" và vào **Danh sách chờ** của phần mềm, mục Lễ tân.
  - Lễ tân nhận tin Telegram nếu đã cài.
- Nếu khách hỏi, chatbot luôn nói thật mình là trợ lý ảo, và mời khách nhắn Zalo hoặc để lại số để gặp tư vấn viên.

## Báo Zalo cho admin khi có khách mới

Khách để lại số điện thoại trong chat, khách đặt lịch online hoặc đơn được thanh toán qua SePay → hệ thống **gửi ngay tin Zalo cho admin**. Tin gồm tên, số điện thoại, thời gian, dịch vụ khách quan tâm và toàn bộ vấn đề khách đã nhắn.

Zalo chỉ cho gửi tin tự động qua **Zalo Official Account (OA)**. Không có cách gửi từ một nick Zalo cá nhân sang nick cá nhân khác.

1. **Tạo Zalo OA cho spa** tại oa.zalo.me. Admin dùng Zalo cá nhân bấm **Quan tâm** OA này.
2. **Tạo ứng dụng liên kết OA** tại developers.zalo.me:
   - Lấy `ZALO_APP_ID` và `ZALO_APP_SECRET`.
   - Cấp quyền gửi tin cho OA để lấy `ZALO_REFRESH_TOKEN`. Refresh token chỉ dùng được một lần; hệ thống tự đổi token mới và lưu lại, nên bạn chỉ nhập một lần.
3. **Cài webhook OA:**
   - URL: `https://<tên-miền>/api/zalo-webhook`, bật sự kiện **user_send_text**.
   - Chép *OA Secret Key* vào biến `ZALO_OA_SECRET_KEY`.
   - Tự đặt một mã bí mật vào biến `ZALO_ADMIN_CODE`, ví dụ `hoamai2026`.
4. **Redeploy** trên Vercel.
5. **Đăng ký nhận tin:** admin nhắn cho OA câu `ADMIN hoamai2026` (theo mã ở bước 3). OA sẽ trả lời "Đã đăng ký…". Từ đây mọi khách mới sẽ được báo về Zalo của admin. Có thể đăng ký nhiều admin.

**Lưu ý quan trọng:** theo chính sách Zalo, OA chỉ gửi được tin tư vấn trong **7 ngày** kể từ lần cuối admin nhắn cho OA, và 48 giờ đầu miễn phí. Vì vậy admin nên nhắn "ok" cho OA vài ngày một lần.

**Muốn chắc chắn nhận tin không phụ thuộc khung 7 ngày:** đăng ký **ZNS** (tính phí theo tin) và tạo mẫu tin với 4 tham số `ten_khach`, `sdt_khach`, `noi_dung`, `thoi_gian`. Khi mẫu được duyệt, điền `ZALO_ZNS_TEMPLATE_ID` và `ZALO_ADMIN_PHONE`.
