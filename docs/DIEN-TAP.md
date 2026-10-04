# DIỄN TẬP VÀ KỊCH BẢN TRÊN LỚP — Con đường tư tưởng HCM

> Theo mục 15.6, 18, 19 của [`THIET-KE-GAME.md`](THIET-KE-GAME.md). Nhóm điền cột **Đạt / Lỗi / Ghi chú** trong buổi diễn tập, rồi gửi lại file này (hoặc ảnh chụp) cho Claude Code. Claude Code chỉ sửa sau khi nhận kết quả.

- **Game:** https://hcm-202-web-omega.vercel.app (luôn dùng **tên miền chính** này; không dùng link bản deploy riêng)
- **Ảnh QR cho slide:** [`docs/phat-hanh/qr-game.png`](phat-hanh/qr-game.png)
- **Bản offline:** [`phat-hanh/HCM202-Con-duong-tu-tuong.zip`](../phat-hanh/HCM202-Con-duong-tu-tuong.zip) — giải nén, mở `index.html`
- **Kiểm nhanh server:** https://hcm-202-web-omega.vercel.app/api/health phải trả `"ok":true,"store":"redis"`

Ngày diễn tập: ………… · Người điền: ………… · Số máy dùng: ………… (≥ 5, gồm điện thoại và laptop)

**Tiến độ (04/10/2026, lần 1 — diễn tập một phần):** đạt 7 dòng (4, 5, 6, 11, 13, 14, 19), chưa ghi lỗi nào; đã đổi vùng function sang Singapore (dòng 21). **Còn phải thử:** 1–3, 7–10, 12, 15–18, 20, 22 và đo lệnh Redis của một ván.

## 1. Danh sách diễn tập

Đánh dấu ✓ vào cột **Đạt**, hoặc ghi ngắn lỗi gặp vào cột **Lỗi** (máy nào, trình duyệt nào, làm gì thì lỗi). Cột **Ghi chú** để ghi số liệu, ý kiến.

| # | Việc cần thử | Đạt | Lỗi | Ghi chú |
|---|---|---|---|---|
| 1 | Dùng ≥ 5 máy thật, có cả điện thoại (Android, iPhone) và laptop | | | |
| 2 | Wi-Fi trường: tạo phòng, vào phòng, chơi hết một ván | | | |
| 3 | 4G: tạo phòng, vào phòng, chơi hết một ván | | | |
| 4 | Quét **QR trên slide** bằng camera điện thoại → mở đúng trang game | ✓ | | |
| 5 | Quét **QR phòng chờ** bằng **Zalo** → mở màn **Vào phòng** có sẵn mã phòng; nhập biệt danh, chọn màu là vào | ✓ | | |
| 6 | Mở **link mời** `/p/ABCDE` trong **Messenger** (trình duyệt trong ứng dụng) → vào được phòng, chơi được | ✓ | | |
| 7 | Phòng 1 người, **0 máy chơi cùng** (thử thách cá nhân) — về đích hoặc hết giờ, có kỷ lục / số ô còn lại | | | |
| 8 | Phòng 1 người, **có máy chơi cùng** (2–4 máy) | | | |
| 9 | Phòng **5 người** thật, mốc **5 phút** — hết giờ xếp hạng theo số ô còn lại | | | |
| 10 | Phòng **5 người** thật, mốc **7 phút** | | | |
| 11 | Mở tên miền chính trong **cửa sổ ẩn danh** và trên điện thoại chưa đăng nhập Vercel → vào thẳng, **không** hiện trang đăng nhập Vercel (Deployment Protection, mục 15.6) | ✓ | | |
| 12 | Huy hiệu kết nối hiện **"Trực tiếp"** trên máy thật (không phải "Đang dùng chế độ dự phòng") | | | |
| 13 | Đang chơi, tắt Wi-Fi vài giây rồi bật lại → báo "Mất kết nối — đang thử lại", sau đó về "Trực tiếp", ván chơi tiếp đúng chỗ | ✓ | | |
| 14 | Tải lại trang giữa ván → về đúng phòng, đúng vị trí | ✓ | | |
| 15 | Âm thanh trên điện thoại (iPhone ở chế độ im lặng có thể không phát tiếng); nút loa / tắt tiếng hoạt động | | | |
| 16 | **Đọc kịp đáp án đúng trong 3 giây** sau khi trả lời (người trả lời bấm "Tiếp tục" được nếu muốn đi sớm) | | | |
| 17 | **Trong một ván không lặp câu** (ghi lại vài câu đã gặp; câu chỉ lặp khi đã hỏi hết 55 câu) | | | |
| 18 | **Ô Đích hỏi câu như các ô khác** (nhãn "Câu về đích", độ khó bất kỳ 1 / 2 / 3, không luôn là câu khó nhất) | | | |
| 19 | Bản offline: giải nén gói zip, mở `index.html` khi **tắt mạng** → "Chơi trên một máy" chơi được | ✓ | | |
| 20 | "Chơi trên một máy" trên **máy chiếu / laptop của lớp** (phương án dự phòng) | | | |
| 21 | Vùng function: trước buổi diễn tập đổi sang **Singapore (sin1)** (`docs/HUONG-DAN-VERCEL.md` bước 1.7), Redeploy; `/api/health` báo `pingMs` dưới ~20 ms; thao tác trong phòng phản hồi nhanh | | | `pingMs` trước: ~220 sau: ~60. Claude Code đo lại 04/10/2026: function chạy ở `sin1`, `pingMs` = 1 ms ổn định (~60 ms là lần đầu nối Redis) |
| 22 | Xem **Usage** của Vercel và Upstash trước và sau buổi diễn tập (`docs/HUONG-DAN-VERCEL.md` mục 5) | | | Lệnh Upstash trước: ……… sau: ……… |

**Đo lệnh Redis của một ván (để cập nhật mục 15.5):** ghi số **Commands** trên Upstash ngay trước khi tạo một phòng, chơi một ván **3 người** (mốc 5 hoặc 7 phút) tới hết, chờ 1–2 phút, ghi lại số **Commands**.

| Trước | Sau | Số người | Số phút | Ghi chú (có ai dùng chế độ dự phòng không) |
|---|---|---|---|---|
| | | | | |

## 2. Kịch bản trên lớp (mục 19)

Mini game kết thúc buổi thuyết trình (phần "Khởi động + mini game"), khoảng **10–12 phút** gồm cả chia phòng.

**Chuẩn bị (trước buổi học 1 ngày và 15 phút trước giờ):**
1. Mở https://hcm-202-web-omega.vercel.app/api/health → `"ok":true,"store":"redis"`; `pingMs` nhỏ (dưới ~20 ms nếu đã đổi vùng function sang Singapore — `docs/HUONG-DAN-VERCEL.md`, Hiện trạng).
2. Mở tên miền chính ở cửa sổ ẩn danh → vào thẳng được (không đăng nhập Vercel).
3. Xem Usage của Upstash: còn đủ lệnh trong tháng (hạn mức 500.000).
4. Slide cuối có **ảnh QR** (`docs/phat-hanh/qr-game.png`) và địa chỉ game viết rõ dưới QR.
5. Laptop máy chiếu có sẵn **bản offline** (đã giải nén) và đã mở thử.

**Trên lớp:**
1. **Chiếu QR** (khoảng 1 phút): cả lớp quét QR hoặc gõ địa chỉ.
2. **Chia phòng ≤ 5 người** (khoảng 2 phút): mỗi nhóm cử **một chủ phòng** bấm **Tạo phòng**, chọn số người, chọn mốc **5 phút** (hoặc **7 phút** nếu còn thời gian), rồi đưa QR / mã phòng cho các bạn trong nhóm. Bạn nào ngồi lẻ thì chơi một mình (phòng 1 người, có thể thêm máy chơi cùng).
3. **Chơi** (5 hoặc 7 phút): chủ phòng bấm **Bắt đầu** khi đủ người. Nhóm thuyết trình đi quanh hỗ trợ.
4. **Kết thúc** (khoảng 2 phút): mỗi phòng xem xếp hạng; người về đích trước, hoặc người dẫn đầu khi hết giờ, thắng. Mời vài bạn đọc câu mình trả lời sai (màn **Ôn lại câu trả lời sai**). Chốt thông điệp **"Chủ nhân không đứng ngoài"**.

**Dự phòng khi mạng trường lỗi:**

| Tình huống | Làm gì |
|---|---|
| Trang mở được nhưng tạo / vào phòng báo lỗi server | Bấm **"Chơi trên một máy"** trên laptop máy chiếu: cả lớp chia 2–5 đội, mỗi đội một màu ngựa, thay phiên trả lời trên màn chiếu |
| Không mở được trang game | Mở **bản offline** (`index.html` trong gói zip) trên laptop máy chiếu, chơi "Chơi trên một máy" như trên |
| Một số máy không vào được (mạng yếu) | Bạn đó không vào được phòng → xem chung máy với bạn bên cạnh, hoặc chơi "Chơi trên một máy" trên máy mình |
| Mất mạng giữa ván | Chờ vài giây: game tự chuyển chế độ dự phòng / tự nối lại. Tải lại trang vẫn về đúng phòng. Tới lượt người mất kết nối thì sau 20 giây game tự động tung, câu hỏi tính là sai |
| Chủ phòng rời phòng | Quyền chủ phòng tự chuyển cho người vào sớm nhất còn kết nối |

## 3. Gửi kết quả

Gửi lại bảng mục 1 (và số lệnh Redis nếu đo được) cho Claude Code, kèm:
- kết quả Deployment Protection (dòng 11);
- tên chính thức của game (nếu đã chốt; khi đổi tên, gói zip được đổi tên theo);
- các câu hỏi nhóm muốn sửa (sửa trực tiếp `docs/CAU-HOI-GAME.md`).
