# THIẾT KẾ GAME — Con đường tư tưởng HCM

**Môn:** HCM202 · **Sản phẩm sáng tạo thứ hai** (độc lập với bảo tàng số) · **Chủ đề 4** — Tư tưởng Hồ Chí Minh về Nhà nước của nhân dân, do nhân dân, vì nhân dân
**Phiên bản:** 1.6 · 04/10/2026 · **Trạng thái:** G1–G5 xong. Bản 1.6 đơn giản hóa câu hỏi (bỏ trụ cột, giải thích, nguồn, xác minh, hiện vật; câu hỏi trộn ngẫu nhiên các mức độ khó suốt ván) — làm mốc **Đ1.6** (mục 18) trước G6
**Vị trí:** nhánh `game` của repo `HCM202`, file `docs/THIET-KE-GAME.md` — nguồn chuẩn duy nhất cho game (luật, bàn cờ, màn hình, kiến trúc, kiểm thử, lộ trình).

---

## 1. Tổng quan

| Mục | Nội dung |
|---|---|
| Tên tạm | **Con đường tư tưởng HCM** (trong `site.json`, đổi được; tên chính thức để sau) |
| Thể loại | Board game đua **kiểu cờ cá ngựa**, theo lượt, tung xúc xắc |
| Người chơi | **Chơi đơn**, mỗi người trên máy tính hoặc điện thoại của mình |
| Phòng | **1–5 người**; chơi một mình được (phòng 1 người) |
| Vào phòng | **Mã phòng** 5 ký tự · **mã QR** · **đường link** |
| Chế độ | **Chơi qua phòng** (online, server trên Vercel) · **Chơi trên một máy** (1–5 người thay phiên, không cần mạng — dự phòng và bản offline) |
| Thông điệp | **"Chủ nhân không đứng ngoài"** |
| Đối tượng | Sinh viên đại học |
| Nội dung | Chủ đề 4 theo giáo trình HCM202, Chương IV, mục II. **Bộ câu hỏi do nhóm biên soạn và chịu trách nhiệm** (`docs/CAU-HOI-GAME.md`, 55 câu, mục 13). Game không hiện giải thích, nguồn hay trụ cột |
| Mã nguồn | **Nhánh `game` riêng** trong repo `HCM202` — nhánh mồ côi, không chung lịch sử, không chung mã với web; app nằm ở gốc nhánh |
| Triển khai | Project Vercel riêng, Production Branch = `game` |
| Quan hệ với bảo tàng số | **Sản phẩm độc lập.** Không import mã hay dữ liệu từ nhánh web. Dữ liệu chép lúc tạo nhánh (hiện vật, sơ đồ tư duy, màu trụ cột) không còn dùng từ bản 1.6; `docs/nguon/` giữ làm hồ sơ nguồn gốc 12 câu khởi đầu |
| Dùng trên lớp | Mini game kết thúc buổi thuyết trình: lớp chia nhiều phòng ≤ 5 người, quét QR, chủ phòng chọn mốc **5 hoặc 7 phút** |

## 2. Luật cốt lõi (nhóm đã chốt — không đổi)

1. Chơi **theo lượt**, mỗi lượt **tung xúc xắc**.
2. **Ai về đích trước thắng.**
3. Trên đường có một số **ô power-up** và **ô bẫy/phạt**; **các ô còn lại là ô câu hỏi**.
4. Xúc xắc chỉ tới ô câu hỏi → **trả lời đúng thì nhảy lên ô đó, sai thì đứng yên ở ô cũ**.

**Không có luật đá ngựa.** Nhiều ngựa được đứng chung một ô.

## 3. Ý tưởng — gắn luật chơi với nội dung

- **Bàn cờ = con đường tư tưởng:** mỗi ô câu hỏi rút một câu ngẫu nhiên từ toàn bộ kho; các mức độ khó trộn lẫn suốt ván (mục 5), không theo chủ đề hay trụ cột.
- **Muốn tiến phải hiểu bài:** mỗi bước tới ô câu hỏi là một câu hỏi.
- **Power-up** giúp trả lời (loại bớt đáp án, đổi câu) hoặc đi nhanh hơn; **bẫy** làm mất lượt hoặc lùi.
- **Sau mỗi câu:** chỉ hiện Đúng / Sai và đáp án đúng — không có giải thích, nguồn hay thẻ hiện vật (bản 1.6).
- **Màn kết thúc:** ôn lại câu trả lời sai (câu hỏi + đáp án đúng) và thông điệp "Chủ nhân không đứng ngoài".

## 4. Bàn cờ (`board.json`)

**Hình dạng (đã chốt):**
- Bàn cờ cá ngựa **6 nhánh** (hình sao/lục giác), đủ chỗ cho tối đa 5 người.
- Nhánh không có người chơi để trống, làm mờ.

**Đường chung (bố cục Ngắn, mặc định):**
- Vòng khép kín qua cả 6 nhánh; mỗi nhánh 3 ô theo chiều đi: [cổng, ô 2, ô 3] → **18 ô**.
- Ô **không gắn trụ cột hay độ khó** (bản 1.6): câu hỏi rút ngẫu nhiên từ toàn bộ kho (mục 5).

| Nhánh | Ô 1 | Ô 2 | Ô 3 |
|---|---|---|---|
| 1 | Cổng | Câu hỏi | **Power-up** |
| 2 | Cổng | Câu hỏi | Câu hỏi |
| 3 | Cổng | Câu hỏi | **Bẫy** |
| 4 | Cổng | Câu hỏi | Câu hỏi |
| 5 | Cổng | Câu hỏi | **Power-up** |
| 6 | Cổng | Câu hỏi | **Bẫy** |

- 8 ô câu hỏi trên vòng chung.
- Vị trí power-up và bẫy có thể chỉnh theo kết quả mô phỏng; thay đổi nào cũng ghi lại ở mục 11.

**Cổng:**
- Mỗi màu người chơi gắn với cổng của một nhánh; ô cổng là ô nghỉ, không hỏi.
- Cổng của màu không có người chơi trở thành ô câu hỏi.

**Đường của mỗi người — 22 bước:**

```
Cổng (bước 0) → 17 ô vòng chung → rẽ vào đường về đích ở ô ngay trước cổng của mình → 4 ô về đích → Đích (bước 22)
```

**Đường về đích và Đích:**
- 4 ô câu hỏi; **Đích:** câu "về đích".
- Mọi ô câu hỏi (kể cả đường về đích và Đích) rút câu ngẫu nhiên như nhau (mục 5).

**Phân bổ ô (bố cục Ngắn):**

| Vị trí | Số ô | Loại |
|---|---|---|
| Vòng chung — cổng | 6 | Ô nghỉ (cổng không có người chơi → ô câu hỏi) |
| Vòng chung — còn lại | 12 | 2 power-up · 2 bẫy · 8 câu hỏi |
| Đường về đích (mỗi màu) | 4 | Câu hỏi |
| Đích | 1 | Câu "về đích" |

**Bố cục Dài (tùy chọn):**
- Mỗi nhánh 4 ô → vòng chung **24 ô** = 6 cổng + 3 power-up + 3 bẫy + 12 câu hỏi:

| Nhánh | Ô 1 | Ô 2 | Ô 3 | Ô 4 |
|---|---|---|---|---|
| 1 | Cổng | Câu hỏi | Câu hỏi | **Power-up** |
| 2 | Cổng | Câu hỏi | **Bẫy** | Câu hỏi |
| 3 | Cổng | Câu hỏi | Câu hỏi | **Bẫy** |
| 4 | Cổng | Câu hỏi | Câu hỏi | Câu hỏi |
| 5 | Cổng | Câu hỏi | Câu hỏi | **Power-up** |
| 6 | Cổng | **Power-up** | Câu hỏi | **Bẫy** |

- Đường về đích 5 ô.
- Quãng đường: 23 + 5 + 1 = **29 bước**.

Tên hiển thị, màu và biểu tượng từng loại ô nằm trong `board.json` và `site.json`.

## 5. Lượt chơi

1. **Tung:** người đến lượt tung 1 xúc xắc (1–6). Kết quả do engine quyết. Quá 15 s không tung thì tự tung.
2. **Tính ô đích của bước đi** = vị trí hiện tại + số chấm, theo đường của người đó. Không có luật chặn đường.
3. **Xử lý theo loại ô đích:**

| Ô đích của bước đi | Xử lý |
|---|---|
| **Câu hỏi** | Hiện một câu rút ngẫu nhiên từ kho (bên dưới), đồng hồ 20 s. **Đúng → nhảy lên. Sai hoặc hết giờ → đứng yên.** Sau khi chốt chỉ hiện Đúng / Sai và đáp án đúng: **3 giây khi đúng, 5 giây khi sai hoặc hết giờ** (05/10/2026) |
| **Power-up** | Nhảy lên, nhận một power-up (mục 6) |
| **Bẫy** | Nhảy lên, rút một thẻ bẫy (mục 7), trừ khi có Khiên |
| **Cổng (ô nghỉ)** | Nhảy lên, không hỏi |
| **Đích** | Câu "về đích" (rút ngẫu nhiên như mọi ô câu hỏi). Đúng → về đích; sai → đứng yên |

4. **Vượt quá Đích:** mặc định vẫn tính là tới Đích (vẫn phải trả lời câu về đích).
   - Tùy chọn **"Phải tung đúng số"** (luật gốc): không đúng số thì đứng yên; cửa sổ kết quả ghi rõ "Cần tung đúng số để về Đích" (05/10/2026).
5. **Ra 6:** nếu đã di chuyển được thì tung thêm một lần; tối đa một lần mỗi lượt. Khi dùng Xúc xắc ×2, xét mặt xúc xắc **trước** khi nhân đôi.
6. **Hiệu ứng không dây chuyền:** khi power-up hoặc bẫy đẩy ngựa tới ô khác, ô mới không hỏi và không kích hoạt thêm hiệu ứng.
   - Hiệu ứng đẩy **không bao giờ đưa ngựa vào Đích**: Tiến 3 ô dừng tối đa ở ô cuối đường về đích; vào Đích luôn phải trả lời câu về đích.
7. **Chuồng xuất phát:** mặc định mọi ngựa bắt đầu ngay ở cổng.
   - Tùy chọn **"Ra chuồng khi tung 1 hoặc 6"** (luật gốc).
8. **Số ngựa mỗi người:** mặc định **1**.
   - Tùy chọn **2 ngựa** cho ván dài: tung xong chọn ngựa để đi; thắng khi cả hai về đích.

Các tùy chọn luật và giá trị mặc định nằm trong `rules.json`; chủ phòng chỉnh trong phòng chờ.

**Chọn câu hỏi (bản 1.6) — trộn ngẫu nhiên các mức suốt ván:**
- Mỗi lần hỏi rút ngẫu nhiên một câu từ **toàn bộ kho**, không xét vị trí trên bàn cờ, không xét độ khó.
- Kho có ba mức gần bằng nhau (18 / 19 / 18) nên các mức xuất hiện xen kẽ, đều nhau suốt ván.
- Không lặp câu cho tới khi dùng hết kho (mục 8).
- Độ khó chỉ còn dùng để: hiện nhãn "Độ khó n" trong cửa sổ câu hỏi, lọc trong Kho câu hỏi, và tính xác suất trả lời đúng của máy chơi cùng (`bots.json`).

## 6. Power-up (`powerups.json`)

| Power-up | Kiểu | Hiệu ứng |
|---|---|---|
| Tiến 3 ô | Dùng ngay | Đi thêm 3 ô (không dây chuyền); dừng tối đa ở ô cuối đường về đích, không vào thẳng Đích |
| Thêm lượt | Dùng ngay | Được tung thêm một lần sau lượt này |
| 50:50 | Cất vào túi | Khi đang trả lời: loại đáp án sai (server chọn) tới khi còn 2 đáp án (4 → 2, 3 → 2). Câu chỉ có 2 đáp án: nút mờ, không mất power-up |
| Đổi câu | Cất vào túi | Khi đang trả lời: đổi sang một câu ngẫu nhiên khác chưa hỏi |
| Khiên | Cất vào túi | Tự dùng khi dính bẫy, chặn thẻ bẫy đó |
| Xúc xắc ×2 | Cất vào túi | Dùng trước khi tung: số chấm nhân đôi. Luật ra 6 xét mặt xúc xắc trước khi nhân |

**Túi:** tối đa 2 món. Khi túi đầy mà nhận thêm, chọn bỏ món cũ hoặc bỏ món mới.

## 7. Bẫy (`traps.json`) — đã chốt

Dừng ở ô bẫy → rút ngẫu nhiên một thẻ bẫy. Chỉ có **hai loại thẻ**:

| Thẻ bẫy | Hiệu ứng | Tỉ lệ mặc định |
|---|---|---|
| **Mất lượt** | Bỏ lượt tiếp theo | 50% |
| **Lùi ngẫu nhiên** | Lùi **1, 2 hoặc 3 ô** — số ô chọn ngẫu nhiên, mỗi số 1/3 | 50% |

**Quy tắc:**
- Lùi không dây chuyền: ô bị lùi tới không hỏi và không kích hoạt hiệu ứng.
- Lùi theo đường của chính người đó — có thể từ đường về đích lùi ra vòng chung — và không lùi quá ô cổng của mình.
- Khiên chặn được cả hai loại thẻ.
- Tỉ lệ giữa hai loại thẻ và khoảng lùi chỉnh trong `traps.json`.

**Nhãn thẻ (đã chốt — trung tính):** "Bẫy — mất lượt" · "Bẫy — lùi {n} ô", với {n} là số ô lùi thực tế (vd. "Bẫy — lùi 2 ô").

## 8. Câu hỏi trong ván

- Mọi người trong phòng đều thấy câu hỏi và đồng hồ; chỉ người đến lượt có nút đáp án.
- Đáp án trộn khi hiện.
- **Không lặp** câu trong một ván cho tới khi dùng hết toàn bộ kho; sau đó trộn lại, ưu tiên câu người đó chưa gặp; câu vừa hỏi không ra ngay ở đầu vòng mới.
- Sau khi chốt: hiện **Đúng / Sai và đáp án đúng**, không có giải thích, nguồn, chip hiện vật. Thời gian hiện ngắn lại (`revealMs` đề xuất 3 giây, như kết quả bước đi; người đến lượt bấm "Tiếp tục" để đi sớm).
- **Đoán cùng — tắt mặc định (đã chốt).** Là tùy chọn trong cài đặt phòng. Khi bật: người đang chờ lượt bấm chọn đáp án để tự kiểm tra, **không ảnh hưởng di chuyển**, chỉ tính vào thống kê cá nhân cuối ván.

## 9. Phòng chơi và người chơi

**Tạo phòng:**
- Nhập biệt danh (nhớ lần trước), chọn màu ngựa.
- Chọn **số người tối đa 1–5** (mặc định 5), cài đặt ván.
- Chọn 1 người → chọn số máy chơi cùng rồi vào ván ngay, bỏ qua phòng chờ.

**Vào phòng — 3 cách:**
- Nhập **mã phòng** 5 ký tự (không dùng ký tự dễ nhầm: 0/O, 1/I/L).
- Quét **mã QR** → mở link vào phòng.
- Mở **đường link** `/p/ABCDE` → mã tự điền, chỉ cần biệt danh + màu.
- Lỗi báo rõ bằng tiếng Việt: không tìm thấy phòng · phòng đã đủ người · ván đã bắt đầu · phòng đã hết hạn.

**Phòng chờ:**
- Mã phòng to, mã QR, nút **Sao chép link**, nút **Chia sẻ** (Web Share nếu máy hỗ trợ).
- Danh sách "x/5" kèm màu ngựa và trạng thái kết nối.
- Mỗi người một màu, không trùng.

**Chủ phòng:**
- Chỉnh cài đặt ván, thêm/bớt máy chơi cùng, mời người ra, bấm **Bắt đầu** (từ 1 người trở lên), bấm **Chơi lại** sau ván.
- Chủ phòng rời → quyền chuyển cho người vào sớm nhất còn kết nối.

**Máy chơi cùng (bot):**
- Chủ phòng thêm vào chỗ trống; bot tính vào sức chứa (tổng ≤ 5).
- Bot "suy nghĩ" 4–6 giây trước khi trả lời (câu càng dài càng lâu); các bước khác ~1,5 s (05/10/2026).
- Bot trả lời đúng theo xác suất theo độ khó (gợi ý 70% / 50% / 35%) và dùng power-up theo luật đơn giản. Tham số trong `bots.json`.

**Chơi một mình:**
- Phòng 1 người chọn 0–4 máy.
- Mặc định 0 máy = **thử thách cá nhân**: về đích với ít lượt nhất; giới hạn thời gian vẫn mặc định 10 phút.
- **Kỷ lục cá nhân** (ít lượt nhất) lưu trên máy, **chỉ lưu khi về đích**; hết giờ thì báo số ô còn lại.

**Mất kết nối:**
- Đến lượt người đang mất kết nối → sau **8 s** tự tung (05/10/2026; trước là 20 s), câu hỏi tính là sai (đứng yên), không dùng power-up: **Khiên không tự chặn bẫy, power-up dùng ngay (Tiến 3 ô, Thêm lượt) không có tác dụng** (05/10/2026); túi đầy thì bỏ món mới.
- (Server coi một người là mất kết nối khi vắng 20 s — mục 15.4; 8 s tính từ lúc tới lượt người đã bị coi là mất kết nối.)
- Quay lại thì chơi tiếp ở vị trí cũ.

**Ván đã bắt đầu:** không nhận người mới; người cũ vẫn nối lại được.

**Thời hạn phòng:** phòng tự xóa sau 6 giờ.

## 10. Kết thúc

- **Người đầu tiên về đích thắng.** Chủ phòng chọn trước: dừng ngay, hoặc chơi tiếp để xếp hạng 2, 3…
- **Giới hạn thời gian:** 5 / 7 / 10 / 15 phút / không giới hạn — **mặc định 10 phút (đã chốt)**. Trên lớp, chủ phòng chọn 5 hoặc 7 phút.
  - Hết giờ thì chơi nốt lượt đang dở.
  - Xếp hạng theo số ô còn lại tới đích; người dẫn đầu được tôn vinh như người thắng.
- **Hòa:** so số câu trả lời đúng.

## 11. Cân bằng

Độ dài đường, tỉ lệ ô, power-up và bẫy được chỉnh bằng **mô phỏng 1.000 ván bot** cho 1, 2, 3, 5 người ở cả hai bố cục.

**Mục tiêu (bố cục Ngắn, giới hạn mặc định 10 phút):**

| Số người | Mục tiêu |
|---|---|
| 1 người | Về đích trong ~3–5 phút |
| 3 người | Phần lớn ván có người về đích trong ~8–10 phút |
| 5 người | Nhiều ván có người về đích trước 10 phút; số còn lại kết thúc theo giờ với khoảng cách hợp lý |
| Trên lớp (5 hoặc 7 phút) | Phần lớn ván kết thúc theo giờ là chấp nhận được; xếp hạng theo khoảng cách phải phân định rõ người dẫn đầu |

Thêm một mục tiêu: không ai bị kẹt quá lâu vì bẫy hoặc trả lời sai liên tiếp.

**Chỉ số mô phỏng cần báo** — chạy với cả **20 s và 25 s mỗi lượt** (riêng đồng hồ trả lời đã 20 s):
- Số lượt trung bình để về đích.
- Thời gian ước tính.
- Tỉ lệ ván có người về đích trong 5, 7 và 10 phút.
- Số lần dính bẫy trung bình.
- Chuỗi lượt đứng yên dài nhất.

Ước tính thô ở G0 (chưa phải mô phỏng chính thức) ghi ở mục 20.

> **Bản 1.6:** bảng dưới đây là kết quả chạy lại ở mốc Đ1.6 (câu hỏi trộn ngẫu nhiên các mức, kho 55 câu, hiện đáp án 3 giây); mục tiêu giữ nguyên. Kết quả bản 1.5 (độ khó theo ô) xem lịch sử git của file này (commit `f1bee88`).

**Kết quả mô phỏng (Đ1.6, 04/10/2026 — `npm run simulate`, 1.000 ván mỗi cấu hình):**

*Cách mô phỏng:*
- Mọi người chơi là bot (đại diện cho người thật): đúng 70% / 50% / 35% ở độ khó 1 / 2 / 3 (`bots.json`); dùng 50:50 từ độ khó 2, Đổi câu ở độ khó 3 (không đổi sau 50:50), Xúc xắc ×2 khi còn ≥ 8 ô.
- **Kho câu hỏi:** 55 câu (18 / 19 / 18 theo độ khó), mỗi ô câu hỏi — kể cả Đích — rút ngẫu nhiên từ toàn bộ kho (mục 5) → xác suất đúng trung bình của bot ≈ 52% ở mọi ô (bản 1.5: 70% ở vòng chung, 50% / 35% ở đường về đích).
- Luật mặc định (1 ngựa, xuất phát ở cổng, vượt Đích vẫn tính tới Đích); ván dừng khi có người đầu tiên về đích.
- **Mô hình thời gian:** mỗi lần tung dẫn tới câu hỏi tính T giây (tung + đọc + trả lời + xem đáp án đúng); lần tung không có câu hỏi (cổng, power-up, bẫy, không đi được) tính T/2; lượt bị bỏ (thẻ mất lượt) tính 2 giây. Với T = 20 s, trung bình thực tế 17,6–19,7 s mỗi lượt; T = 25 s → 22,0–24,7 s mỗi lượt. Hiện đáp án rút từ 8 giây xuống 3 giây làm lượt thật nhanh hơn — mô hình vẫn giữ T như cũ (ước lượng thận trọng).
- Ván "có người về đích với giới hạn L phút" gồm cả ván có người về đích trong lượt đang dở lúc hết giờ (mục 10: chơi nốt lượt).

*Bố cục Ngắn (mặc định):*

| s/lượt | Người | Lượt của người về đích đầu tiên (TB) | Phút tới người đầu về đích (TB · trung vị · P90) | Ván có người về đích với giới hạn 5 / 7 / 10 phút | Dính bẫy TB / người | Chuỗi đứng yên dài nhất trong ván (TB · P95 · max) |
|---|---|---|---|---|---|---|
| 20 | 1 | 11,5 | 3,7 · 3,5 · 5,3 | 90% / 99% / 100% | 0,96 | 2,6 · 6 · 10 |
| 20 | 2 | 8,8 | 5,4 · 5,2 · 7,5 | 52% / 87% / 100% | 0,84 | 2,7 · 5 · 10 |
| 20 | 3 | 7,6 | 6,7 · 6,7 · 9,4 | 27% / 63% / 95% | 0,73 | 2,7 · 5 · 7 |
| 20 | 5 | 6,0 | 8,2 · 7,9 · 11,4 | 12% / 39% / 81% | 0,58 | 2,3 · 4 · 7 |
| 25 | 1 | 11,5 | 4,6 · 4,4 · 6,7 | 71% / 95% / 100% | 0,96 | 2,6 · 6 · 10 |
| 25 | 2 | 8,8 | 6,7 · 6,5 · 9,4 | 27% / 67% / 95% | 0,84 | 2,7 · 5 · 10 |
| 25 | 3 | 7,6 | 8,4 · 8,3 · 11,7 | 12% / 38% / 78% | 0,73 | 2,7 · 5 · 7 |
| 25 | 5 | 6,0 | 10,2 · 9,9 · 14,3 | 5% / 20% / 55% | 0,58 | 2,3 · 4 · 7 |

*Bố cục Dài (tùy chọn, cho ván dài):*

| s/lượt | Người | Lượt của người về đích đầu tiên (TB) | Phút tới người đầu về đích (TB · trung vị · P90) | Ván có người về đích với giới hạn 5 / 7 / 10 phút | Dính bẫy TB / người | Chuỗi đứng yên dài nhất (TB · P95 · max) |
|---|---|---|---|---|---|---|
| 20 | 1 | 14,0 | 4,5 · 4,3 · 6,4 | 77% / 97% / 100% | 1,54 | 2,8 · 6 · 10 |
| 20 | 2 | 11,5 | 7,1 · 6,9 · 9,7 | 18% / 59% / 94% | 1,25 | 3,1 · 6 · 10 |
| 20 | 3 | 9,9 | 8,9 · 8,8 · 11,8 | 6% / 26% / 74% | 1,11 | 3,1 · 6 · 10 |
| 20 | 5 | 8,5 | 11,9 · 11,8 · 15,7 | 1% / 6% / 32% | 0,91 | 2,9 · 5 · 8 |
| 25 | 1 | 14,0 | 5,6 · 5,4 · 8,0 | 50% / 86% / 99% | 1,54 | 2,8 · 6 · 10 |
| 25 | 2 | 11,5 | 8,8 · 8,6 · 12,1 | 6% / 32% / 76% | 1,25 | 3,1 · 6 · 10 |
| 25 | 3 | 9,9 | 11,1 · 11,0 · 14,8 | 2% / 10% / 42% | 1,11 | 3,1 · 6 · 10 |
| 25 | 5 | 8,5 | 14,8 · 14,8 · 19,6 | 0% / 2% / 13% | 0,91 | 2,9 · 5 · 8 |

*Kết thúc theo giờ (bố cục Ngắn):* tỉ lệ ván hết giờ mà chưa ai về đích · tỉ lệ hai người đầu bằng hạng (không phân định được người dẫn đầu) · cách biệt TB giữa người thứ nhất và thứ hai (số ô).

| s/lượt | Người | 5 phút | 7 phút | 10 phút |
|---|---|---|---|---|
| 20 | 2 | 48% · 1% · 5,5 | 13% · 1% · 4,6 | 1% · 0% · 3,6 |
| 20 | 3 | 73% · 2% · 4,3 | 37% · 3% · 3,4 | 5% · 6% · 1,9 |
| 20 | 5 | 88% · 3% · 3,5 | 61% · 3% · 2,7 | 19% · 2% · 1,9 |
| 25 | 2 | 73% · 1% · 6,0 | 33% · 2% · 5,0 | 5% · 2% · 4,1 |
| 25 | 3 | 88% · 2% · 4,8 | 62% · 2% · 4,0 | 22% · 5% · 2,9 |
| 25 | 5 | 95% · 3% · 3,8 | 80% · 4% · 3,2 | 45% · 4% · 2,5 |

*Đối chiếu mục tiêu (bố cục Ngắn, giới hạn 10 phút) — đạt, không cần chỉnh `board.json`, `powerups.json`, `traps.json`:*
- **1 người:** về đích trung bình 3,7 phút (20 s/lượt) – 4,6 phút (25 s/lượt) → trong khoảng 3–5 phút.
- **3 người:** 95% (20 s) / 78% (25 s) số ván có người về đích trong 10 phút, trung bình 6,7–8,4 phút → "phần lớn ván".
- **5 người:** 81% (20 s) / 55% (25 s) số ván có người về đích trong 10 phút → "nhiều ván" (bản 1.5: 72% / 44%); số còn lại hết giờ với cách biệt người nhất – người nhì TB 1,9–2,5 ô.
- **Trên lớp (5 hoặc 7 phút):** phòng 5 người 61–95% kết thúc theo giờ; chỉ 3–4% số ván đó đồng hạng đầu → xếp hạng theo khoảng cách (rồi số câu đúng) phân định được người dẫn đầu ở ~96% số ván.
- **Không bị kẹt quá lâu:** chuỗi đứng yên dài nhất trong ván trung bình 2,3–2,7 lượt, P95 4–6 lượt, dài nhất 10 lượt (bản 1.5: P95 tới 7, dài nhất 16). Đường về đích không còn dồn câu độ khó 2–3 nên ít bị kẹt ở chặng cuối hơn.
- Bố cục Dài chậm hơn rõ (5 người chỉ 13–32% về đích trong 10 phút) → hợp với giới hạn 15 phút / không giới hạn, đúng vai trò "cho ván dài".

## 12. Màn hình

Một giao diện co giãn cho cả máy tính và điện thoại.

1. **Trang chủ:** Tạo phòng · Vào phòng · Chơi trên một máy · Luật chơi · Kho câu hỏi (khóa bằng mã — mục 12.8) · Cài đặt. Có "Vào lại phòng gần nhất" nếu còn phòng đang chơi. Khi kho còn câu hỏi thử, hiện dải báo "Đang dùng bộ câu hỏi thử" (với 55 câu hiện tại thì không còn). Trang chủ không hiện dòng thông điệp và dòng giới thiệu "Muốn tiến phải hiểu bài…" (nhóm bỏ, 04/10/2026); thông điệp vẫn ở màn kết thúc.
2. **Tạo phòng** và **Vào phòng:** như mục 9.
3. **Phòng chờ:** như mục 9.
4. **Bàn cờ:**
   - Bàn cờ 6 nhánh co giãn; mỗi loại ô có biểu tượng + màu; ngựa các màu.
   - Ô câu hỏi đồng nhất (không trụ cột, không độ khó).
   - Sau khi tung, ô đích của bước đi được làm nổi.
   - **Bảng người chơi:** màu, số ô còn lại, power-up đang giữ, trạng thái (mất lượt, mất kết nối, máy), ai đang tới lượt.
   - **Khu điều khiển của mình:** nút Tung xúc xắc, túi power-up.
   - **Nhật ký** vài sự kiện gần nhất (vd. "Lan trả lời đúng, tiến 4 ô", "Minh dính bẫy, lùi 2 ô").
   - **Trạng thái kết nối:** "Trực tiếp" / "Đang dùng chế độ dự phòng" / "Mất kết nối — đang thử lại".
5. **Cửa sổ:**
   - Câu hỏi: chip màu + tên người đang trả lời ("Câu hỏi của Minh"), nhãn "Độ khó 1/2/3", đồng hồ, nút 50:50 / Đổi câu nếu có; sau khi chốt chỉ hiện Đúng / Sai (kèm tên, vd. "Máy Sen: Đúng!") và đáp án đúng — 3 s khi đúng, 5 s khi sai (05/10/2026).
   - Power-up · Thẻ bẫy · Câu về đích.
   - Trên điện thoại hiện dạng tấm trượt từ dưới lên hoặc toàn màn hình, nút đáp án to.
   - Nếu phòng bật Đoán cùng: người đang chờ thấy nút chọn đáp án để tự kiểm tra.
6. **Kết thúc:**
   - Thứ tự về đích (hoặc xếp hạng theo khoảng cách nếu hết giờ; người dẫn đầu được tôn vinh như người thắng).
   - Thống kê từng người: số câu đúng/sai, power-up đã dùng, số lần dính bẫy (và điểm Đoán cùng nếu bật).
   - Ôn lại câu mình trả lời sai (câu hỏi + đáp án đúng).
   - Thông điệp kết.
   - Chơi lại · Về trang chủ · chia sẻ link game.
   - Chơi một mình: so với kỷ lục cá nhân.
7. **Chơi trên một máy:**
   - Nhập 1–5 người + số máy chơi cùng, thay phiên trên cùng thiết bị.
   - Lưu ván trên máy; tải lại → "Tiếp tục ván".
   - Có nút hoàn tác thao tác vừa rồi. **Chỉ hoàn tác được thao tác chọn** (vd. bật Xúc xắc ×2 trước khi tung, chọn món bỏ khi túi đầy, chọn ngựa tới ô nghỉ): lịch sử hoàn tác bị xóa khi đã tung, đã hiện câu hỏi, đã dùng 50:50 / Đổi câu, đã nhận power-up hoặc rút thẻ bẫy (05/10/2026, phương án (a) mục 20).
8. **Kho câu hỏi — khóa bằng mã** (05/10/2026: sáng bỏ hẳn để tránh gian lận, cùng ngày đưa trở lại có khóa mã — mục 20):
   - Bấm "Kho câu hỏi" ở trang chủ → ô nhập mã kèm dòng "Nhóm sẽ cho mã sau khi chơi xong". Chưa đúng mã thì không thấy câu hỏi, đáp án hay nút "Ôn tập N câu". Khóa cả bản online lẫn bản offline.
   - Mã do nhóm đặt; nhập không phân biệt hoa thường, bỏ khoảng trắng hai đầu. Repo chỉ lưu salt + SHA-256 (`src/data/bank-lock.json`), không lưu mã gốc; đổi mã bằng `npm run set:bank-code -- <mã>`.
   - Đúng mã → Kho mở, máy nhớ đã mở theo băm hiện tại (đổi mã thì mọi máy khóa lại). Sai → "Mã chưa đúng"; sai 5 lần → chờ 30 giây.
   - Mở rồi: "Tổng số câu hỏi: N", lọc theo độ khó, **Sổ ôn tập** ("Câu từng trả lời sai trên máy này" — khôi phục, cũng sau mã), đáp án ẩn mặc định (nút hiện), ôn tập các câu đang lọc.
   - Vẫn ẩn nút Kho khi đang ở trong phòng chơi (L5).
   - **Không khóa:** "Ôn lại câu trả lời sai" và "Làm lại các câu sai" ở màn kết thúc ván; Luật chơi; Cài đặt; dòng "Tổng số câu hỏi: N" trên trang chủ.
9. **Luật chơi:** có hình minh họa các loại ô, power-up và thẻ bẫy.
10. **Chung:** hộp xác nhận thoát phòng, toast, cảnh báo khi đóng tab giữa ván.

## 13. Bộ câu hỏi (bản 1.6)

### 13.1 Bộ câu hỏi hiện tại
- `docs/CAU-HOI-GAME.md`, **55 câu**, do nhóm biên soạn và chịu trách nhiệm về độ chính xác:
  - Q-01 → Q-12: 12 câu khởi đầu (từ `QUIZ-KIEN-THUC.md`, nhóm đã duyệt), giữ nguyên câu hỏi, đáp án và độ khó.
  - Q-13 → Q-55: từ file `Câu hỏi.docx` nhóm gửi 03/10/2026, đã lọc câu trùng (danh sách câu bỏ ghi ở đầu file).
- **Ba mức độ khó gần bằng nhau** để các mức xen kẽ đều khi rút ngẫu nhiên (mục 5): 18 câu mức 1 · 19 câu mức 2 · 18 câu mức 3.
- **Không có** trụ cột, chủ đề, giải thích, nguồn, xác minh (`verified`), hiện vật.
- Nhóm thêm hay sửa câu thì sửa trực tiếp file này; Claude Code chạy script nhập.
- **Claude Code không tự viết hay sửa nội dung câu hỏi.** Chỉ báo lỗi định dạng hoặc câu trùng.

### 13.2 Hồ sơ nguồn gốc
- `docs/nguon/QUIZ-KIEN-THUC.md` (nguồn 12 câu khởi đầu) và `docs/nguon/THIET-KE-WEB-APP.md` giữ lại làm hồ sơ, không dùng khi chạy game.
- Nhóm tự lưu bản gốc `Câu hỏi.docx` (có nguồn kèm số trang ở một phần câu) để chứng minh tính chính xác khi cần.

### 13.3 Câu hỏi thử
- Chỉ lấp độ khó nào còn **dưới 2 câu** chính thức. Với 55 câu hiện tại: **không dùng câu hỏi thử nào**.
- Giữ cơ chế (id `TEST-`, `"test": true`, nhãn `[Câu hỏi thử]`) cho trường hợp bộ câu hỏi thay đổi. Bản phát hành không được còn câu hỏi thử (`npm run check:release`).

### 13.4 Định dạng `docs/CAU-HOI-GAME.md`
- Một bảng Markdown, **8 cột**: id · độ khó · câu hỏi · đáp án A · đáp án B · đáp án C · đáp án D · đúng.
- **độ khó:** 1, 2 hoặc 3. **đúng:** một chữ A–D, phải là đáp án đã điền.
- 2–4 đáp án, không trùng nhau; câu đúng/sai: A = "Đúng", B = "Sai".
- Câu điền từ: lời câu hỏi có đúng một chỗ trống `___`.
- Đáp án nhiễu không được là câu trích giả gán cho Hồ Chí Minh.
- Mẫu điền: `docs/CAU-HOI-GAME.mau.md` (cập nhật theo 8 cột).

**Loại câu** — script tự suy ra, không cần cột riêng:
- `fillQuote` nếu câu hỏi có `___`;
- `truefalse` nếu hai đáp án đúng là "Đúng", "Sai";
- còn lại `single`.

**Định dạng `questions.json`:**

```json
{
  "id": "Q-01",
  "difficulty": 1,
  "type": "single",
  "question": "…",
  "answers": ["…", "…", "…", "…"],
  "correct": 0
}
```

Câu hỏi thử có thêm `"test": true`.

## 14. Dữ liệu (`src/data/`)

| File | Nội dung |
|---|---|
| `board.json` | Hai bố cục; từng ô: loại; cổng và đường về đích của từng màu (không còn trụ cột, độ khó theo ô) |
| `rules.json` | Tùy chọn luật và giá trị mặc định: giới hạn thời gian (5 / 7 / 10 / 15 phút / không giới hạn; mặc định 10 phút), đúng số về đích, ra chuồng 1/6, số ngựa, Đoán cùng (mặc định tắt), thời hạn tung/trả lời/hiện đáp án |
| `powerups.json` | Danh sách power-up, kiểu, hiệu ứng, tỉ lệ xuất hiện |
| `traps.json` | Hai loại thẻ bẫy (mất lượt / lùi ngẫu nhiên 1–3 ô), tỉ lệ, khoảng lùi, nhãn trung tính |
| `questions.json` | Kho câu hỏi (mục 13), sinh từ `docs/CAU-HOI-GAME.md` bằng `npm run import:questions` |
| `bots.json` | Xác suất trả lời đúng theo độ khó, luật dùng power-up |
| `tokens.json` | Màu và ký hiệu ngựa |
| `site.json` | Chữ giao diện, tên game, thông điệp, `siteUrl` |
| `test-questions.json` | Câu hỏi thử (chỉ dùng khi một độ khó thiếu câu) |
| `NGUON.md` | Ghi nguồn gốc dữ liệu đã chép từ nhánh web và việc gỡ bỏ ở bản 1.6 |

**Bản 1.6 gỡ** `artifacts.json`, `mindmap.json`, `pillars.json` và mọi mã dùng chúng (trụ cột, thẻ hiện vật). `docs/nguon/` giữ làm hồ sơ.

## 15. Kiến trúc kỹ thuật

### 15.1 Nhánh git và cấu trúc thư mục
- **Nhánh:** `game` — tạo dạng nhánh mồ côi (`git switch --orphan game`), không chung lịch sử với nhánh web.
  - Không commit, không push, không merge gì lên nhánh web.
  - Nhánh web không bị sửa.
- **Cấu trúc gốc nhánh `game`:**

```
/
├── CLAUDE.md                 ← quy ước và tiến độ riêng của game
├── README.md                 ← chạy, sửa câu hỏi, deploy Vercel, bản offline
├── vercel.json
├── package.json, vite.config.ts, tsconfig…, index.html
├── docs/
│   ├── THIET-KE-GAME.md      ← tài liệu này
│   ├── CAU-HOI-GAME.mau.md   ← mẫu để nhóm soạn câu hỏi
│   ├── CAU-HOI-GAME.md       ← bộ câu hỏi của nhóm (bắt đầu bằng 12 câu đã duyệt)
│   └── nguon/                ← bản sao nguồn tham chiếu: THIET-KE-WEB-APP.md, QUIZ-KIEN-THUC.md
├── public/                   ← favicon, robots.txt
├── api/                      ← lớp mỏng Vercel Functions
├── server/                   ← kho phòng, token, pub/sub, xử lý hành động
├── scripts/                  ← nhập câu hỏi, mô phỏng cân bằng, mô phỏng tải, đóng gói offline
└── src/
    ├── data/                 ← mục 14
    ├── engine/               ← reducer thuần + bot
    ├── net/                  ← WebSocket + polling, đo lệch đồng hồ
    ├── components/, screens/
    ├── assets/fonts/         ← font tự host + giấy phép OFL
    └── lib/
```

### 15.2 Giao diện
- Vite + React + TypeScript + Tailwind CSS v4 + Vitest.
- Route: `/` trang chủ, `/p/:code` link vào phòng (mã QR trỏ tới đây). Rewrite SPA trong `vercel.json`, trừ `/api/*`.
- Bàn cờ vẽ bằng SVG để co giãn sắc nét.

### 15.3 Engine dùng chung (`src/engine/`)
Reducer thuần, không phụ thuộc trình duyệt hay Node. Hành động:
- Tung và đi: ROLL, AUTO_ROLL, CHOOSE_HORSE, RESOLVE_TARGET, MOVE.
- Câu hỏi: ASK, ANSWER, GUESS (khi bật Đoán cùng).
- Power-up và bẫy: GAIN_POWERUP, USE_POWERUP, DISCARD_POWERUP, DRAW_TRAP.
- Điều phối: BOT_STEP, TIMEOUT, SKIP_TURN, NEXT_TURN, UNDO, END.

Đặc điểm:
- Có hàm tính đường đi riêng cho từng màu (cổng → vòng chung → đường về đích → Đích).
- **Chạy trên server** (nguồn sự thật khi chơi qua phòng) **và trên trình duyệt** (Chơi trên một máy).
- RNG có seed lưu trong state: xúc xắc, power-up nhận được, thẻ bẫy và số ô lùi, chọn câu, thứ tự lượt, quyết định của bot.
- State có **danh sách sự kiện** để client diễn hoạt cảnh tuần tự.

### 15.4 Server trên Vercel
**Nền tảng (đã xác minh ở G0, 03/10/2026 — xác minh lại trước G3 và trước buổi chơi):**
- WebSocket trên Vercel Functions **public beta từ 22/06/2026**, mọi gói, cần Fluid Compute (mặc định cho project tạo từ 23/04/2025).
- Mỗi kết nối gắn cố định với instance đã nhận nó suốt đời kết nối. Gói Hobby: kết nối mặc định và tối đa **300 giây** rồi bị đóng (Pro/Enterprise 800 giây; mức mở rộng 1.800 giây khi beta chỉ cho Pro/Enterprise) → client phải tự nối lại.
- Tính phí như mọi lần gọi function: Active CPU chỉ tính lúc code xử lý tin; **Provisioned Memory tính suốt đời instance**, kết nối mở giữ instance sống. Gói Hobby luôn chạy 2 GB / 1 vCPU, không chỉnh được.
- Các instance **không chung bộ nhớ** → trạng thái phòng và phát tin chéo instance đi qua **Redis từ Vercel Marketplace**.
- **Cách chạy với project Vite có thư mục `api/` (đã xác nhận): không cần framework.**
  - Vite build giao diện tĩnh; mỗi file trong `api/` là một Vercel Function Node.js dùng handler kiểu Web (`export async function GET(request: Request)` trả `Response`).
  - Nâng cấp WebSocket bằng `experimental_upgradeWebSocket(handler, { maxPayload })` của gói `@vercel/functions` (có từ 3.7.0, bản hiện hành 3.9.10; `maxPayload` mặc định 256 KiB), cần thêm gói `ws`. Hàm này chỉ chạy trong runtime Vercel có hỗ trợ upgrade; ở nơi khác báo lỗi "not available in the current runtime environment".
  - Tên hàm còn tiền tố `experimental_` → khóa phiên bản `@vercel/functions` trong `package.json`; chỉ gọi hàm này ở `api/` để khi đổi chỉ sửa một chỗ.
  - Gói Hobby giới hạn **12 function mỗi deployment** khi dùng `api/` không framework → dùng **một function bắt tất cả** `api/[...path].ts` chuyển tiếp vào `server/` (code ngoài `api/` không bị tính là function). Một function chung còn giúp các request dùng chung instance và bộ nhớ đệm.
  - Chạy cục bộ và test: server Node riêng (`ws` + `http`) gọi cùng `server/`, Redis giả lập trong bộ nhớ — không phụ thuộc runtime Vercel.
  - WebSocket thật trên Vercel chỉ kiểm được khi có deploy preview (cần tài khoản nhóm) → **polling dự phòng là bắt buộc** và làm trước WebSocket ở G3; nên deploy preview sớm (ngay sau G3) thay vì đợi G6.
  - Client chủ động nối lại trước mốc 300 giây (vd. ở ~280 giây, lúc không có câu hỏi đang mở) để tránh bị cắt giữa lúc trả lời.
- **Redis:** chọn **Upstash for Redis** trên Marketplace (gói Free: 500.000 lệnh/tháng, 256 MB, 10.000 kết nối đồng thời, có pub/sub và Lua). Không chọn Redis Cloud gói Free (30 MB, **30 kết nối, 100 lệnh/giây**) vì mỗi instance cần 2 kết nối (lệnh + subscribe) và lúc polling dự phòng có thể chạm 100 lệnh/giây.
- Nguồn đã dùng: tài liệu và changelog Vercel (WebSockets, Functions Limits, Hobby Plan, Configuring Memory) qua trích đoạn tìm kiếm; mã nguồn gói `@vercel/functions@3.9.10` trên npm; bảng giá Upstash, so sánh Upstash/Redis Cloud. Môi trường làm G0 bị chặn truy cập trực tiếp `vercel.com`, `upstash.com`, nên **nhóm nên mở lại các trang này khi tạo project**: vercel.com/docs/functions/websockets, vercel.com/docs/plans/hobby, vercel.com/docs/functions/limitations, upstash.com/pricing/redis.

**Thiết kế:**
- **Client → server:** HTTP `POST /api/rooms` (tạo), `POST /api/rooms/:code/join`, `POST /api/rooms/:code/actions`. Mỗi hành động có `actionId` (chống gửi trùng) và token người chơi.
- **Server → client:** đẩy trạng thái qua WebSocket (snapshot hoặc diff kèm `version`).
  - **Dự phòng tự động:** polling `GET /api/rooms/:code/state?since=<version>` khoảng 1,5 s/lần khi WebSocket không nối được.
  - Hai đường cho cùng kết quả.
- **Server là nguồn sự thật**, mỗi hành động đi qua các bước:
  1. Đọc state từ Redis.
  2. Kiểm tra quyền: đúng người, đúng lượt, đúng pha, quyền chủ phòng, có power-up thật.
  3. Chạy reducer.
  4. Ghi lại có kiểm tra `version` (Lua/WATCH hoặc tương đương).
  5. Phát tin qua Redis pub/sub tới mọi instance giữ kết nối của phòng.
- **Sức chứa phòng** kiểm tra nguyên tử: nhiều người vào cùng lúc không vượt giới hạn; không trùng màu.
- **Hạn thời gian:** không chạy timer trên server.
  - State lưu `deadline` theo giờ server: tung, trả lời, bỏ qua người mất kết nối (8 s), bước của bot ~1,5 s, bot trả lời 4–6 s.
  - Client đo độ lệch đồng hồ và đếm ngược.
  - Quá hạn thì **bất kỳ máy nào trong phòng** gửi TIMEOUT / AUTO_ROLL / SKIP_TURN / BOT_STEP; server chỉ nhận khi `now ≥ deadline`.
- **Nối lại:** `playerId` + `playerToken` lưu trên máy (localStorage, bọc try/catch). Tải lại trang → nhận snapshot đầy đủ, về đúng phòng.
- **Không lộ đáp án:** state gửi xuống máy người chơi không chứa đáp án đúng trước khi chốt câu.
  - Bản online vẫn đóng gói `questions.json` (cho Chơi trên một máy và Kho câu hỏi) nên đáp án đọc được trong mã trang — **chấp nhận vì đây là game ôn tập (đã chốt)**. Khi đang ở trong phòng chơi thì ẩn nút Kho câu hỏi.
  - **Kho câu hỏi khóa bằng mã (05/10/2026, mục 12.8).** Giới hạn: đáp án vẫn nằm trong mã trang (cần cho chơi trên một máy và chơi offline), nên người biết dùng công cụ nhà phát triển vẫn đọc được; mã khóa chỉ chặn việc tra cứu thông thường.
- **Kiểm tra đầu vào:** biệt danh 1–20 ký tự, cắt khoảng trắng; giới hạn tần suất tạo phòng và gửi hành động; lỗi trả về thông báo tiếng Việt.
- `GET /api/health` để kiểm tra trước buổi chơi.
- **Tách lớp:** `server/` (test được không cần Vercel) và `api/` (lớp mỏng nối Vercel Functions).
- **Bí mật:** thông tin Redis chỉ ở biến môi trường phía server; có `.env.example`; không commit `.env`.
- **Chạy cục bộ:** server Node + Redis giả lập trong bộ nhớ (hoặc Redis thật qua `REDIS_URL`), không cần tài khoản Vercel.

**Đã làm ở G3 (03/10/2026):**

*Lõi server — thư mục `server/`, chạy và test được không cần Vercel.*
- `rooms.ts` xử lý: tạo phòng, xem phòng, vào phòng, phòng chờ, hành động trong ván (gọi engine sẵn có), polling, mở/đóng kết nối.
- Mỗi lần thay đổi đi theo trình tự:
  1. Đọc phòng (bộ nhớ đệm của instance, hoặc kho).
  2. Rà trạng thái kết nối.
  3. Chạy hành động.
  4. Ghi có kiểm tra `version`.
  5. Có người ghi trước thì đọc lại và thử lại (tối đa 12 lần).
- Lỗi phát hiện trên bản đệm cũ được đọc lại từ kho trước khi báo.

*Kho phòng — `store.ts`: một giao diện chung.*
- Bản giả lập trong bộ nhớ: `memoryStore.ts`.
- Redis thật: `redisStore.ts`, thư viện `redis`, giao thức TCP `rediss://`. Đổi kho không phải sửa lõi.
- Khóa của mỗi phòng:
  - `r:{CODE}`: phòng (JSON);
  - `r:{CODE}:v`: version;
  - `r:{CODE}:s`: lần poll gần nhất;
  - kênh pub/sub `room:CODE`.
- Mỗi lần ghi là **một lệnh EVAL** (Lua) làm cùng lúc các việc: kiểm version, ghi phòng và version, đặt hạn, publish.

*API — `http.ts`, kiểu Web Request/Response, dùng chung cho Node và Vercel.*
- Các đường:
  - `GET /api/health`
  - `POST /api/rooms`
  - `GET /api/rooms/:code` (xem trước: màu đã chọn, còn chỗ không)
  - `POST /api/rooms/:code/join`
  - `POST /api/rooms/:code/actions` (`{actionId, action}`)
  - `GET /api/rooms/:code/state?since=N`
- Polling khi không đổi trả **204** (không có nội dung), kèm header `x-server-now`, thay cho 304.
- Xác thực: `Authorization: Bearer <playerId>.<token>`. Server chỉ giữ mã băm SHA-256 của token.

*WebSocket — `socket.ts`, `hub.ts`.*
- Đường `GET /api/ws`.
- Máy gửi `{t:"hello", code, playerId, token}`; server đẩy ảnh chụp trạng thái riêng cho từng người.
- Có `ping`/`pong` để đo đồng hồ. Hành động vẫn đi qua HTTP.
- Mỗi instance theo dõi kênh pub/sub của phòng chỉ khi có kết nối của phòng đó.

*Lớp mỏng Vercel — `api/[...path].ts`.*
- Gọi `experimental_upgradeWebSocket` (khóa `@vercel/functions` 3.9.11).
- Vercel biên dịch từng file TypeScript sang Node ESM mà **không** sửa đường dẫn import. Vì vậy mọi import tương đối trong `server/`, `api/`, `src/engine/` ghi đuôi `.js`; JSON nạp bằng `with { type: 'json' }`.
- Test `tests/vercel-api.test.ts` làm lại đúng cách biên dịch đó rồi gọi thử API.

*Server Node cục bộ — `node.ts`, `dev.ts`.*
- `npm run server`: API + WebSocket ở cổng 8787.
- `npm run serve`: thêm trang tĩnh `dist/`.
- Server tự đóng mỗi kết nối WebSocket sau 300 s, như Vercel.
- `npm run dev` chuyển `/api` (cả WebSocket) sang server cục bộ.

*Client mạng — `src/net/` (G4 dùng).*
- WebSocket trước. Không nối được thì polling 1,5 s/lần, thử lại WebSocket lùi dần (1 → 30 s).
- Ở ~280 s mở kết nối mới; nhận trạng thái từ kết nối mới rồi mới đóng kết nối cũ. Nếu mình đang trả lời câu hỏi thì hoãn, chậm nhất ~290 s.
- Đang dùng WebSocket vẫn hỏi lại 30 s/lần, phòng khi lỡ tin.
- Quá hạn thì gửi `TICK`. Người đến lượt gửi trước, các máy khác chờ thêm 0,7 s mỗi bậc. Server tự chọn hành động tự động đang chờ.
- Mất mạng thì gửi lại hành động với cùng `actionId`.
- Bản offline không nạp `src/net/`: `npm run build:offline` kiểm không còn `/api`, `WebSocket`, `fetch` trong file.

*Biến môi trường (`.env.example`).*
- URL Redis TCP lấy theo thứ tự `REDIS_URL` → `KV_URL` → `UPSTASH_REDIS_URL`.
- Chạy cục bộ không có biến nào → kho trong bộ nhớ.
- Trên Vercel (`VERCEL` có giá trị) mà chưa có biến nào:
  - API phòng trả 503 "Server chưa sẵn sàng";
  - `/api/health` liệt kê biến còn thiếu.

*Kiểm bản deploy thật:* `npm run check:deploy -- <địa chỉ> [--long]` kiểm health, WebSocket, polling và đóng/nối lại ở 300 s. Hướng dẫn tạo project cho nhóm: `docs/HUONG-DAN-VERCEL.md`.

**Kiểm trên bản deploy thật — lần 1 (G4, 03/10/2026): chưa chạy được** — môi trường làm việc bị chặn mạng tới `hcm-202-web-omega.vercel.app`.

**Kiểm trên bản deploy thật — lần 2 (G5, 03/10/2026), https://hcm-202-web-omega.vercel.app (nhóm đã mở Network access):**
- Trang chủ là game (tiêu đề "Con đường tư tưởng HCM", có meta `noindex` và header `X-Robots-Tag`) → đúng project game, Production Branch = `game`, Root Directory = gốc nhánh.
- `/api/health` → `{"ok":true,"store":"redis","pingMs":…}` → **đã gắn Upstash Redis**.
- **Lỗi tìm thấy và đã sửa:** ngoài Next.js, file `api/[...path].ts` chỉ khớp **một cấp** (`/api/health`, `/api/rooms`, `/api/ws` chạy; `/api/rooms/ABCDE/join` nhận 404 `NOT_FOUND` của Vercel) — đúng rủi ro đã ghi ở mục 20.
  - Sửa: thêm rewrite `/api/(.*)` → `/api/[...path]?__p=$1` trong `vercel.json`; lớp `api/` khôi phục đường gốc từ `__p` (chạy đúng dù Vercel đưa URL gốc hay URL đích) và bỏ `__p` khỏi truy vấn. `tests/vercel-api.test.ts` kiểm cả hai dạng.
  - Đẩy lên `game` → Vercel deploy lại sau ~40 giây → đường nhiều cấp trả JSON của server.
- `npm run check:deploy -- https://hcm-202-web-omega.vercel.app --long` sau khi sửa: **đạt toàn bộ**.
  - [x] `/api/health`: kho `redis`, ping 220 ms (lần gọi đầu ~930 ms khi function khởi động lạnh).
  - [x] WebSocket qua `experimental_upgradeWebSocket` nối được.
  - [x] Polling dự phòng chạy; máy WebSocket và máy polling cùng trạng thái.
  - [x] Vercel đóng kết nối WebSocket ở ~300 s; client tự nối lại (2 kết nối trong 313 s), trạng thái không đổi.
  - [x] `api/[...path].ts` + rewrite bắt mọi `/api/*`.
- **Phòng 3 máy trên bản deploy** (`npm run e2e:online -- --url https://hcm-202-web-omega.vercel.app`, Chromium thật, hạn thật, mốc 5 phút): tạo phòng, vào bằng link `/p/ABCDE` và bằng mã, mã sai báo lỗi, phòng chờ 3/3, chơi tới kết thúc (149 s), một máy mất mạng 22 s rồi có lại, một máy tải lại trang, 3 máy cùng trạng thái cuối, Chơi lại → phòng chờ, chủ phòng rời → chuyển quyền, axe không lỗi, không lỗi trang → **đạt**.
  - Ghi chú: trong môi trường của Claude Code, **Chromium** đi qua proxy chặn TLS của môi trường nên không nâng cấp được WebSocket (yêu cầu tới function mất header `Upgrade` → 404 của server). Gửi đúng từng byte yêu cầu đó bằng Node hoặc curl qua cùng proxy thì Vercel trả 101 — lỗi nằm ở proxy của môi trường, không ở game. Ván trên vẫn chạy trọn nhờ polling dự phòng. Máy thật kết nối thẳng tới Vercel → **cần nhóm kiểm huy hiệu "Trực tiếp" trên điện thoại / laptop thật ở buổi diễn tập G6**.
- Chạy lại sau mỗi lần deploy: `npm run check:deploy -- <địa chỉ> --long` và `E2E_PROXY_CA=<CA proxy, nếu có> npm run e2e:online -- --url <địa chỉ>`.

**Kiểm trên bản deploy thật — lần 3 (Đ1.6, 04/10/2026), sau khi đẩy bản 1.6 lên `game`:** `/api/health` kho `redis`; `npm run check:deploy` đạt (WebSocket, polling, chơi qua mạng); phòng 3 máy (`e2e:online -- --url`, mốc 5 phút) chơi tới kết thúc theo giờ (305 s), mất mạng / tải lại / Chơi lại / chuyển chủ phòng, không có Kho câu hỏi trong phòng, axe không lỗi → **đạt**.

**Các việc cần kiểm trên bản deploy thật:**
- [x] WebSocket chạy được qua `experimental_upgradeWebSocket` (Node client, G5).
- [x] Đường `api/[...path].ts` bắt được mọi `/api/*` (sau khi thêm rewrite, G5).
- [x] Kết nối bị đóng sau 300 giây và client tự nối lại (G5).
- [x] Polling dự phòng hoạt động (G5).
- [ ] Huy hiệu "Trực tiếp" (WebSocket) trong trình duyệt trên máy thật — diễn tập G6.

### 15.5 Quyền riêng tư và chi phí
- Chỉ lưu biệt danh và thao tác trong ván; không đăng nhập, không thống kê, không lưu gì sau khi phòng hết hạn.
- **Tình huống ước lượng:**
  - Lớp 40 người chia 8 phòng × 5 người chơi cùng lúc 10 phút.
  - Cộng 20 người chơi một mình.
  - Tính cả lúc dùng polling dự phòng và các buổi tập.
- **Cần ước lượng:** số kết nối đồng thời, lượt gọi function, số lệnh Redis; so với hạn mức miễn phí của Vercel Hobby và gói Redis miễn phí trên Marketplace.
- **Kết quả ước lượng (G0, 03/10/2026):**
  - **Giả định cho một buổi:** 8 phòng × 5 người + 20 phòng 1 người = **28 phòng, 60 máy**; mỗi máy mở game ~15 phút (gồm phòng chờ); ~100 hành động mỗi phòng mỗi ván 10 phút (tung, trả lời, power-up, hành động hết hạn gửi trùng từ nhiều máy, bước bot); state phòng ~10 KB.
  - **Kết nối đồng thời:** tối đa ~60 WebSocket. Mỗi kết nối bị đóng sau 300 giây → ~4 lần nối mỗi máy mỗi buổi.
  - **Hai trường hợp:** *bình thường* (WebSocket chạy) và *xấu nhất* (cả 60 máy dùng polling 1,5 s/lần suốt 15 phút = 36.000 lần gọi).

  | Hạn mức (Free) | Bình thường / buổi | Xấu nhất / buổi | Hạn mức / tháng | Số buổi tối đa (xấu nhất) |
  |---|---|---|---|---|
  | Vercel — lượt gọi function | ~3.500 (2.800 hành động + 240 lần nối + vào phòng) | ~40.000 | 1.000.000 | ~25 |
  | Vercel — Active CPU (~20 ms/lần gọi) | ~1 phút | ~13 phút | 4 giờ | ~18 |
  | Vercel — Provisioned Memory (2 GB cố định) | ~1,5 GB-giờ (vài instance dùng chung) | ~30 GB-giờ (mỗi kết nối một instance) | 360 GB-giờ | ~12 |
  | Vercel — Fast Data Transfer | ~0,2 GB | ~0,3 GB | 100 GB | > 300 |
  | Vercel — CDN Requests | ~5.000 | ~40.000 | 1.000.000 | ~25 |
  | **Upstash — lệnh Redis** (~10 lệnh/hành động gồm đọc, ghi có kiểm tra version, chống trùng `actionId`, giới hạn tần suất, publish và tin pub/sub nhận ở mỗi instance) | ~30.000 | ~66.000 (+1 lệnh mỗi lần poll) | 500.000 | **~7** |
  | Upstash — kết nối đồng thời (2 mỗi instance) | ≤ 10 | ≤ 120 | 10.000 | — |
  | Upstash — băng thông (~70 KB/hành động) | ~0,2 GB | ~0,3 GB | 10 GB | ~30 |

  - **Kết luận:** một buổi trên lớp và vài buổi tập **nằm trong hạn mức miễn phí**. Hạn mức chặt nhất là **số lệnh Upstash** (khoảng 16 buổi bình thường hoặc 7 buổi xấu nhất mỗi tháng), sau đó là Provisioned Memory nếu Vercel xếp mỗi kết nối vào một instance riêng.
  - **Rủi ro:** gói Hobby vượt hạn mức thì **project bị tạm dừng tới khi hết chu kỳ 30 ngày** (không trả thêm được). Chưa xác nhận được Upstash có tính mỗi tin pub/sub nhận được là một lệnh hay không — bảng trên đã tính trường hợp có. Gói Hobby chỉ dùng cho mục đích cá nhân, phi thương mại (bài tập môn học phù hợp).
  - **Cách giữ an toàn (áp dụng khi làm G3):** một function chung `api/[...path].ts`; polling chỉ đọc khóa `version` (1 lệnh) và trả `304` khi không đổi, có bộ đệm ~1 s trong instance cho mỗi phòng; chỉ publish `version` + diff; không ghi nhịp tim (heartbeat) vào Redis, trạng thái kết nối lấy từ sự kiện mở/đóng WebSocket và lần gọi gần nhất; buổi tập dùng ít máy; xem trang Usage của Vercel và Upstash trước buổi chơi; luôn có "Chơi trên một máy" và bản offline làm dự phòng.
- **Phương án thay nếu vượt hạn mức:** nhà cung cấp realtime trên Vercel Marketplace (Ably, Pusher, Supabase Realtime…) với một function cấp token.
- **Đo bằng mô phỏng tải (G3, `npm run sim:load`).**
  - Thiết lập: 30 phòng (10 × 5 người + 20 phòng 1 người), 70 máy, 3 instance dùng chung một kho, cả kho bộ nhớ lẫn redis-server thật. Hạn từng pha rút còn 3%; polling 0,3 s.
  - **Mỗi lần ghi phòng ≈ 1,1 lệnh EVAL.** Phần 0,1 là khoảng 10% lần ghi bị người khác ghi trước, phải ghi lại.
  - **Mỗi lần poll:** 1 lệnh GET khóa version, cộng 1 GET phòng khi có thay đổi (instance có bản đệm mới thì không cần).
  - **Mỗi kết nối WebSocket:** 2 lần ghi (mở và đóng); không có nhịp tim vào Redis.
  - **Máy đang polling:** ghi "lần poll gần nhất" tối đa 1 lệnh mỗi 10 s.
  - **Cả mô phỏng:** khoảng 2,7–3,1 lệnh trên mỗi lần ghi phòng, kể cả polling dày gấp 5 lần thực tế.
  - **Kết luận:** thấp hơn mức ~10 lệnh/hành động đã giả định ở G0. Bảng ước lượng trên **vẫn giữ trường hợp xấu** (tính cả tin pub/sub nhận được) cho tới khi xác minh được cách Upstash tính tin pub/sub (mục 20).

### 15.6 Bản build

| Bản | Lệnh | Ghi chú |
|---|---|---|
| Online | `npm run build` (Vercel) | Giao diện + `api/`. Project Vercel riêng, nối repo `HCM202`, **Production Branch = `game`**, Root Directory = gốc nhánh. Không liệt kê công khai: meta robots, header `X-Robots-Tag: noindex`, `robots.txt` |
| Offline | `npm run build:offline` | Một file (vite-plugin-singlefile). **Chỉ "Chơi trên một máy"** (gồm chơi một mình, máy chơi cùng); ẩn Tạo/Vào phòng; không có request mạng |
| Gói nộp | `npm run package:offline` | Build offline rồi đóng `phat-hanh/HCM202-Con-duong-tu-tuong.zip` = `index.html` (một file) + `HUONG-DAN.txt`. Gói được **commit vào nhánh `game`** để nhóm tải từ GitHub; chạy lại mỗi khi đổi câu hỏi hoặc mã (`check:release` báo khi gói cũ). Zip ghi bằng zlib có sẵn của Node, thời gian cố định → cùng nội dung ra cùng file. Đổi tên gói khi nhóm chốt tên game (`scripts/lib/release.mjs`) |
| Ảnh QR | `npm run qr` | `docs/phat-hanh/qr-game.png` (1024 px, mức sửa lỗi M) từ `siteUrl`, sinh bằng gói `qrcode` trên máy — không gọi mạng. Đặt lên slide |
| Kiểm phát hành | `npm run check:release` | Lỗi nếu: còn câu hỏi thử hoặc một mức độ khó dưới 2 câu chính thức; `questions.json` không khớp `docs/CAU-HOI-GAME.md`; bản offline có mã mạng (build lại rồi gọi kiểm tra của `build:offline`); `siteUrl` trống / không phải `https://`; ảnh QR hoặc gói zip cũ; `bank-lock.json` chưa có băm mã mở Kho, hoặc mã gốc lộ trong mã nguồn / `dist/` / `dist-offline/` / gói zip (dò từng từ, băm với salt rồi so) |
| Đổi mã Kho | `npm run set:bank-code -- <mã>` | Ghi salt mới + SHA-256 vào `src/data/bank-lock.json` (không ghi mã gốc); sau đó `npm run package:offline` để gói offline mang khóa mới |

**Deployment Protection:** mặc định Standard Protection bảo vệ mọi URL **trừ tên miền chính** (production domain) — kể cả link bản deploy thử và URL riêng của từng bản deploy, nên mở những link đó phải đăng nhập Vercel. Khi thử trên điện thoại, dùng Shareable Links; khi chơi thật, luôn mở game và tạo mã QR, link mời từ **tên miền chính**; trước buổi học, kiểm tra tên miền chính mở được mà không cần đăng nhập.

**Kết quả nhóm kiểm Deployment Protection (G6):** **đạt** (diễn tập lần 1, 04/10/2026 — dòng 11 của `docs/DIEN-TAP.md`): mở tên miền chính trong cửa sổ ẩn danh và trên điện thoại chưa đăng nhập Vercel thì vào thẳng game.

### 15.7 Khác
- **Âm thanh:** Web Audio API (oscillator), không file âm thanh — xúc xắc, bước đi, đúng/sai, power-up, bẫy, về đích; nút tắt/bật.
- **Quân cờ:** ngựa SVG tự vẽ, **6 màu tươi** — vd. xanh lá, cam, tím, xanh ngọc, hồng, xanh dương sáng; mỗi màu một ký hiệu; máy chơi cùng có dấu riêng. Cổng và đường về đích mang màu ngựa của người đó.
- **Icon:** SVG tự vẽ hoặc gói npm đóng gói sẵn (vd. lucide-react). Không icon font, không CDN, không Google Fonts.
- **Font:** tự host trong `src/assets/fonts` kèm giấy phép OFL (có thể chép bộ Be Vietnam Pro / Noto Serif từ nhánh web).
- **Mã QR:** gói `qrcode`.

### 15.8 Quy ước của nhánh `game` (ghi vào `CLAUDE.md` của nhánh)
- Trả lời và viết nội dung bằng **tiếng Việt**; commit message ngắn gọn bằng tiếng Việt.
- `docs/THIET-KE-GAME.md` là nguồn chuẩn duy nhất cho game; thay đổi đã duyệt thì cập nhật tài liệu trước rồi mới code.
- **Không tự viết hay sửa nội dung câu hỏi** về tư tưởng Hồ Chí Minh — bộ câu hỏi do nhóm biên soạn và chịu trách nhiệm (mục 13); chỉ báo lỗi định dạng, câu trùng.
- Không tự thêm sự kiện, số liệu, trích dẫn vào chữ giao diện.
- Không tự lấy ảnh trên mạng khi chưa rõ bản quyền; không tự vẽ chân dung Bác.
- Nội dung nằm trong `src/data/*.json`, không viết cứng trong component.
- **Không gắn thống kê.** Tài nguyên bên ngoài duy nhất được phép: Vercel Functions + Redis (Vercel Marketplace) cho phòng chơi. Bản offline không có request mạng nào.
- Không commit lên nhánh web; không import mã hay dữ liệu từ nhánh web; không đồng bộ dữ liệu lại với web.
- Cập nhật `CLAUDE.md` và mục 18 sau mỗi mốc.
- **Kiểm tra sau mỗi mốc:** chỉ chạy kiểm tra tự động (test, build, build offline, lint; thêm `npm run e2e` khi đổi giao diện). Không rà soát bằng sub agent sau từng mốc.
- **Rà soát bằng sub agent:** chỉ một lần trước phát hành (G6), hoặc khi nhóm yêu cầu. Mỗi lần dùng **tối đa 6 sub agent**, tính cả người rà soát lẫn người phản biện; sub agent không tạo thêm sub agent; chỉ giao phần cần góc nhìn độc lập (vd. đối chiếu nội dung với nguồn, rà soát mã server).
- **Dừng sau mỗi mốc G:** xong một mốc thì chạy kiểm tra tự động, commit, push, cập nhật `CLAUDE.md` và mục 18, báo cáo ngắn (đã làm gì, chi tiết tự chọn, cần nhóm làm gì), rồi dừng chờ nhóm cho phép làm mốc tiếp theo. Không tự sang mốc mới. Trong một mốc chỉ dừng giữa chừng khi: cần nhóm quyết; cần tài khoản hoặc quyền mạng cho việc không làm cục bộ được; kiểm tra cho thấy không đạt yêu cầu trong tài liệu. Phiên quá dài thì dừng ở chỗ hợp lý, ghi tiến độ vào `CLAUDE.md`.

## 16. Giao diện

**Điện thoại dọc (≥ 360px):**
- Bàn cờ vừa chiều ngang; bảng người chơi gọn phía trên hoặc dưới.
- Nút Tung xúc xắc và nút đáp án ≥ 56px; trả lời không cần cuộn.

**Máy tính (1366–1920px):**
- Bàn cờ ở giữa; bảng người chơi và nhật ký bên cạnh.
- **Màn hình ≥ 1600 px** (máy chiếu, màn lớn): phóng to bàn cờ, chữ, cửa sổ câu hỏi theo bề rộng màn hình (05/10/2026).

**Khác:**
- **Trình duyệt nhúng Zalo/Messenger:** chạy được trong đó; tránh API không phổ biến; có phương án thay cho Web Share, rung, toàn màn hình.
- **Phong cách:** bản sắc riêng của game — bàn cờ cá ngựa vui mắt, màu tươi, đọc tốt trên điện thoại. Có thể dùng tông đỏ son – vàng đồng của bảo tàng số làm điểm nhấn, không bắt buộc.
- **Biểu tượng ô:** ô bẫy dùng biểu tượng cảnh báo (tam giác chấm than), không dùng tia sét (dễ hiểu nhầm là tăng tốc); chú thích các loại ô luôn hiện (không gấp lại), gọn trên một dòng: biểu tượng + tên ô; mô tả chi tiết ở Luật chơi (05/10/2026).
- **Tiếp cận:** màu không phải tín hiệu duy nhất — mỗi loại ô có biểu tượng + nhãn; mỗi ngựa có cả màu lẫn ký hiệu; chữ đạt tương phản WCAG AA.
- **Phím tắt trên máy tính:** Space = tung / tiếp tục · 1–4 hoặc A–D = chọn đáp án · Q/W = dùng power-up 1/2 · M = tắt tiếng · F = toàn màn hình.
- **Hiệu ứng:** xúc xắc lăn, ngựa đi từng ô, ô đích nhấp nháy, ngựa trượt lùi khi dính bẫy, pháo giấy (canvas tự làm) khi về đích. Tắt khi `prefers-reduced-motion`.

## 17. Kiểm thử

### Engine
- **Đường đi:** đúng cho từng màu ở cả hai bố cục; quãng đường 22 bước (bố cục Dài 29).
- **Bàn cờ:**
  - Vị trí power-up và bẫy đúng `board.json`; cổng của màu trống thành ô câu hỏi.
  - **Chọn câu ngẫu nhiên:** mọi ô câu hỏi (kể cả Đích) rút từ toàn bộ kho, không phụ thuộc vị trí; qua nhiều ván, tỉ lệ các mức xấp xỉ tỉ lệ trong kho.
- **Luật cốt lõi:**
  - Ô câu hỏi: đúng → nhảy lên; sai/hết giờ → đứng yên.
  - Power-up/bẫy: nhảy lên rồi áp dụng.
  - Cổng: không hỏi.
  - Đích: câu về đích.
- **Di chuyển:**
  - Nhiều ngựa đứng chung một ô.
  - Vượt quá Đích ở cả hai luật.
  - Ra 6 tung thêm (tối đa một lần); với Xúc xắc ×2 xét mặt xúc xắc trước khi nhân.
  - Hiệu ứng không dây chuyền; Tiến 3 ô không bao giờ vào Đích.
- **Power-up:**
  - Từng loại; túi tối đa 2 món.
  - 50:50: 4 → 2 đáp án, 3 → 2 đáp án; câu 2 đáp án thì nút mờ và không mất power-up.
- **Bẫy:**
  - Chỉ ra hai loại thẻ theo tỉ lệ cấu hình, nhãn trung tính.
  - Lùi ngẫu nhiên chỉ ra 1, 2 hoặc 3 ô, phân bố đều trên nhiều lần rút.
  - Mất lượt bỏ đúng một lượt.
  - Lùi được từ đường về đích ra vòng chung; không lùi quá cổng.
  - Khiên chặn cả hai loại.
- **Tùy chọn luật:** ra chuồng 1/6; 2 ngựa; Đoán cùng khi bật không ảnh hưởng di chuyển và mặc định tắt.
- **Kết thúc:** người đầu tiên về đích thắng; chơi tiếp để xếp hạng; các mốc 5 / 7 / 10 / 15 phút / không giới hạn, mặc định 10 phút; hết giờ xếp theo khoảng cách; hòa.
- **Câu hỏi:** không lặp cho tới khi hết toàn bộ kho; Đổi câu lấy một câu ngẫu nhiên khác chưa hỏi.
- **Tự động:** tự tung; tự xử lý khi mất kết nối; thử thách cá nhân đếm lượt, kỷ lục chỉ lưu khi về đích.
- **Khác:** hoàn tác (chơi trên một máy) chỉ cho thao tác chọn — tung / hiện câu / 50:50 / Đổi câu / nhận power-up / rút thẻ bẫy xóa lịch sử; cùng seed → cùng kết quả (cả thẻ bẫy và bot); Kho câu hỏi ẩn khi đang ở trong phòng.
- **Mất kết nối (05/10/2026):** tự tung sau 8 s; Khiên không tự chặn, power-up dùng ngay không có tác dụng; hiện đáp án 3 s khi đúng / 5 s khi sai; bot trả lời sau 4–6 s; "Phải tung đúng số" có lý do riêng khi không đi được.
- **Khóa Kho câu hỏi (05/10/2026):** mã đúng mở được kể cả khác hoa thường / khoảng trắng hai đầu; mã sai không mở; sai 5 lần chờ 30 s; đổi băm thì khóa lại; SHA-256 thuần JS khớp `node:crypto`; mã gốc không có trong mã nguồn, `dist/`, `dist-offline/`, gói zip. e2e: trang chủ có Kho, Kho khóa khi mở lần đầu, mở bằng **mã thử** riêng (biến `BANK_TEST_CODE`, chỉ khi build để chạy thử).

### Dữ liệu
- id không trùng; 2–4 đáp án, không trùng nhau; `correct` hợp lệ.
- Câu có `___` thì có đúng một chỗ trống và loại `fillQuote`; loại câu suy ra đúng quy tắc mục 13.4.
- Không có trường `pillar`, `explanation`, `source`, `verified`, `artifact` trong `questions.json`.
- **12 câu khởi đầu** (Q-01 → Q-12) trùng nguyên văn với `docs/nguon/QUIZ-KIEN-THUC.md` ở câu hỏi, đáp án, đáp án đúng.
- Không có hai câu trùng lời câu hỏi; mỗi độ khó có ≥ 2 câu chính thức; số câu ba mức chênh nhau không quá 3 (cảnh báo, không chặn).
- Mỗi màu có đường đi liền mạch tới Đích; số ô từng loại đúng cấu hình.
- `traps.json` chỉ có hai loại thẻ, tổng tỉ lệ 100%.
- **Câu hỏi thử:**
  - Mọi câu có id `TEST-` đều có `"test": true` và ngược lại.
  - Câu hỏi thử chỉ có ở độ khó còn dưới 2 câu chính thức (hiện tại: không có).
  - Lệnh kiểm tra phát hành (`npm run check:release`, có từ G6) **báo lỗi nếu còn câu hỏi thử** (và các ý ở mục 15.6). `tests/release.test.ts` kiểm gói zip, kiểm tra mã mạng, `HUONG-DAN.txt`, ảnh QR.
- **Script nhập câu hỏi:**
  - Đọc đúng file mẫu.
  - Báo rõ dòng sai (thiếu cột, độ khó không thuộc 1–3, đáp án đúng không thuộc A–D, đáp án trùng, câu trùng).
  - Không ghi đè `questions.json` khi còn lỗi.

### Mô phỏng cân bằng
Như mục 11; dùng kết quả để chỉnh `board.json`, `powerups.json`, `traps.json`.

### Server (Redis giả lập)
- **Sức chứa:**
  - 6 người cùng vào phòng 5 chỗ → đúng 5 vào, người thứ 6 nhận lỗi "phòng đã đủ người".
  - Bot tính vào sức chứa; phòng 1 chỗ không nhận thêm; không trùng màu.
- **Vào phòng:** bắt đầu được với 1 người; người mới bị từ chối sau khi ván bắt đầu; người cũ nối lại được.
- **Chủ phòng** rời → quyền chuyển đúng người.
- **Quyền và đồng thời:**
  - Sai lượt / không phải chủ phòng / dùng power-up không có → bị từ chối.
  - `actionId` trùng không áp dụng hai lần.
  - Hai hành động đồng thời không mất dữ liệu.
- **Hạn thời gian:** TIMEOUT / AUTO_ROLL / SKIP_TURN / BOT_STEP trước hạn bị từ chối.
- **Trạng thái:** không chứa đáp án; nối lại nhận đúng snapshot; phòng hết hạn; polling cho cùng kết quả với WebSocket.

### Tải và ngắt kết nối
- Giả lập 10 phòng × 5 người + 20 phòng 1 người chơi cùng lúc → không mất hành động, mọi máy cập nhật đúng. Chạy thêm một lượt có bật Đoán cùng để thử tải nặng nhất.
- Ép đóng WebSocket giữa lúc trả lời (mô phỏng giới hạn 300 s) → client tự nối lại, câu trả lời không mất.

**Đã có ở G3:**
- `tests/server.test.ts`: các ý "Server (Redis giả lập)" ở trên, gồm:
  - sức chứa khi vào đồng thời;
  - màu trùng;
  - máy chơi cùng;
  - chủ phòng;
  - từ chối sai quyền;
  - `actionId` trùng;
  - Đoán cùng đồng thời;
  - TICK trước hạn;
  - state không lộ đáp án;
  - mất kết nối và nối lại;
  - hết hạn;
  - chơi lại;
  - bộ nhớ đệm cũ giữa hai instance.
- `tests/store.test.ts`: cùng bộ kiểm tra cho kho bộ nhớ và **redis-server thật** (bật tự động nếu máy có), gồm cả hai instance dùng chung Redis qua pub/sub.
- `tests/server-net.test.ts`: HTTP + WebSocket thật, gồm:
  - WebSocket và polling cho cùng trạng thái cuối;
  - thay kết nối trước khi bị đóng;
  - cắt WebSocket ngay lúc trả lời → câu trả lời không mất, client nối lại;
  - bị mời ra.
- `tests/vercel-api.test.ts`: lớp `api/` chạy được bằng Node ESM như trên Vercel.
- `npm run sim:load [-- --guess] [-- --redis]`:
  - 10 × 5 + 20 × 1 phòng, 3 instance;
  - một nửa số máy chỉ dùng polling;
  - WebSocket bị đóng mỗi 1,5 s.
  - Kiểm: mọi ván kết thúc; mọi máy hội tụ đúng trạng thái trong kho; không lỗi server.

### Lệnh kiểm tra cuối
`npm run test && npm run build && npm run build:offline && npm run lint && npm run check:release` ở gốc nhánh `game`, cộng `npm run e2e` (từ G2) và `npm run sim:load` khi đổi server (từ G3).

## 18. Lộ trình

| Mốc | Nội dung | Trạng thái |
|---|---|---|
| **G0 — Nhánh và rà soát** | Tạo nhánh mồ côi `game`; chép dữ liệu khởi đầu, nguồn tham chiếu và font từ nhánh web (ghi `NGUON.md`); tạo `CLAUDE.md` của nhánh; đối chiếu tài liệu này với dữ liệu; xác nhận nền tảng Vercel; ước lượng chi phí (15.5); tạo mẫu `docs/CAU-HOI-GAME.mau.md` để nhóm bắt đầu soạn câu hỏi; cập nhật mục 20. **Dừng chờ duyệt** | ☑ Xong và được nhóm duyệt 03/10/2026 — quyết định ghi ở mục 20. Nhánh `game` đẩy được với đúng tên `game` |
| **G1 — Nền móng** | Khởi tạo dự án ở gốc nhánh, JSON + kiểu dữ liệu, **12 câu khởi đầu** từ `QUIZ-KIEN-THUC.md` (13.1) + **câu hỏi thử** lấp chỗ thiếu (13.3), script nhập câu hỏi, test dữ liệu, engine + bot + unit test, mô phỏng cân bằng ở 20 s và 25 s/lượt (điền mục 11) | ☑ Xong 03/10/2026 — 120 test; mô phỏng đạt mục tiêu mục 11; chi tiết tự chọn ghi ở mục 20 |
| **G2 — Chơi trên một máy** | Bàn cờ SVG, xúc xắc, ngựa đi từng ô, các loại ô, túi power-up, thẻ bẫy, bot, thử thách cá nhân + kỷ lục, lưu/tiếp tục ván, hoàn tác — chơi trọn ván | ☑ Xong 03/10/2026 — 131 test; chạy thử trong Chromium (360 × 780 sáng, 1366 × 768 tối, có và không có hiệu ứng): chơi trọn ván, 2 ngựa, thử thách cá nhân, tải lại, hoàn tác, axe không lỗi; chi tiết tự chọn ghi ở mục 20 |
| **G3 — Server** | Tạo/vào phòng, sức chứa, chọn màu, hành động, bước bot, Redis, pub/sub, WebSocket + polling, nối lại, chuyển chủ phòng, `/api/health`; test server, mô phỏng tải, chạy cục bộ | ☑ Xong 03/10/2026 — 170 test; mô phỏng tải đạt với kho bộ nhớ và redis-server thật, có và không Đoán cùng; rà soát 6 sub agent, đã sửa các lỗi xác nhận. Chờ nhóm tạo project để kiểm trên Vercel (`docs/HUONG-DAN-VERCEL.md`) |
| **G4 — Chơi qua phòng** | Trang chủ, tạo phòng, vào bằng mã / QR / link, phòng chờ, chơi qua mạng, trạng thái kết nối, mất kết nối, kết thúc + chơi lại, tùy chọn Đoán cùng | ☑ Xong 03/10/2026 trên server cục bộ — `npm run e2e` gồm chạy thử 3 máy (`e2e:online`). Kiểm trên bản deploy thật làm ở đầu G5 (mục 15.4) |
| **G5 — Hoàn thiện** | Ôn câu sai, thống kê, Kho câu hỏi, Luật chơi minh họa, Cài đặt, âm thanh, phím tắt, chỉnh giao diện, reduced motion | ☑ Xong 03/10/2026 — 178 test; `npm run e2e` (một máy 360 × 780 sáng + 1366 × 768 tối, có Luật chơi, Kho câu hỏi, Cài đặt, ôn tập, phím tắt; 3 máy cục bộ) đạt, axe không lỗi. Kiểm bản deploy thật (mục 15.4): sửa catch-all `/api/*`, `check:deploy --long` đạt, phòng 3 máy trên deploy đạt. Chi tiết tự chọn ở mục 20. Dừng chờ nhóm cho phép làm G6 |
| **Đ1.6 — Đơn giản hóa câu hỏi** | Định dạng câu hỏi 8 cột (13.4) + script nhập; nhập 55 câu; câu hỏi trộn ngẫu nhiên các mức suốt ván (mục 5); bỏ trụ cột, giải thích, nguồn, xác minh, hiện vật khỏi engine, server, giao diện, dữ liệu; hiện đáp án đúng ngắn lại; Kho câu hỏi, thống kê, ôn câu sai theo định dạng mới; mô phỏng lại (mục 11); sửa test, e2e | ☑ Xong 04/10/2026 — 157 test; nhập 55 câu (18 / 19 / 18, không lỗi, không câu trùng); mô phỏng đạt mục tiêu (mục 11); `npm run e2e` đạt; deploy thật: `check:deploy` + phòng 3 máy đạt. Chi tiết tự chọn ở mục 20. Dừng chờ nhóm cho phép G6 |
| **G6 — Phát hành** | Hướng dẫn tạo project Vercel (Production Branch = `game`) + gắn Redis (nhóm làm phần cần tài khoản), deploy preview, diễn tập, `npm run check:release` (không còn câu hỏi thử), bản offline, README, cập nhật `CLAUDE.md` | ☑ phần Claude Code — chờ diễn tập (04/10/2026). Đã xong từ G4–G5: project Vercel (Production Branch = `game`), Upstash Redis, thử bản deploy (mục 15.4). G6: `check:release`, `package:offline` (gói zip trong `phat-hanh/`), ảnh QR `docs/phat-hanh/qr-game.png`, README, `docs/DIEN-TAP.md`, hiện trạng `docs/HUONG-DAN-VERCEL.md`, rà soát 5 sub agent, đã sửa lỗi kỹ thuật, việc cần nhóm quyết ở mục 20. Còn: nhóm diễn tập theo `docs/DIEN-TAP.md` và gửi kết quả |
| **Sau G6 — 05/10** | Quyết định của nhóm cho các câu hỏi rà soát G6 (mục 20); Kho câu hỏi đưa trở lại, khóa bằng mã (12.8); lỗi từ đợt kiểm tra độc lập 04/10 (Redis, pub/sub, waitUntil, giao diện, e2e) | ☑ 05/10/2026 — 184 test; `npm run e2e` đạt; `e2e-online` 5 lần liên tiếp đạt; `check:release` đạt (gồm dò lộ mã Kho). Diễn tập lần 1 (04/10) đạt 7 dòng; chờ diễn tập lần 2 (`docs/DIEN-TAP.md`, thêm dòng 23–26) |

**Nhập bộ câu hỏi của nhóm** — làm bất cứ lúc nào nhóm gửi bản mới của `docs/CAU-HOI-GAME.md`, không chờ mốc:
1. Chạy script nhập.
2. Báo lỗi định dạng và câu trùng (không sửa nội dung).
3. Câu hỏi thử tự lấp độ khó còn thiếu (nếu có).
4. Chạy lại mô phỏng cân bằng.

**Danh sách diễn tập (G6):**
- ≥ 5 máy thật gồm điện thoại và laptop.
- Wi-Fi trường và 4G.
- Quét QR bằng Zalo; mở link trong Messenger.
- Phòng 1 người (có và không có máy chơi cùng) và phòng 5 người; thử cả mốc 5 và 7 phút.
- Link mở được mà không cần đăng nhập Vercel (Deployment Protection, mục 15.6).
- Huy hiệu kết nối hiện "Trực tiếp" (WebSocket) trên máy thật; tắt Wi-Fi vài giây rồi bật lại → về "Trực tiếp" (mục 15.4).
- Âm thanh trên điện thoại (iPhone ở chế độ im lặng có thể không phát tiếng Web Audio); nút tắt tiếng.

## 19. Đối chiếu tiêu chí chấm sản phẩm sáng tạo (10 điểm)

| Tiêu chí | Game đáp ứng bằng |
|---|---|
| Nội dung (3) | 55 câu bám giáo trình Chương IV do nhóm biên soạn và chịu trách nhiệm; gần như mỗi bước đi là một câu hỏi; ba mức độ khó trộn lẫn; ôn lại câu sai |
| Ý tưởng (2) | Cờ cá ngựa quen thuộc được chuyển nghĩa: muốn tiến phải hiểu bài, sai thì đứng yên; câu dễ khó xen kẽ bất ngờ; power-up hỗ trợ trả lời |
| Hình thức (2) | Bàn cờ 6 nhánh rõ ràng trên cả điện thoại và máy tính, nút to, hiệu ứng vừa phải |
| Lan tỏa (2) | Ai cũng tạo phòng và mời bạn qua mã, QR hoặc link; chơi một mình để tự ôn; thông điệp "Chủ nhân không đứng ngoài" |
| Thái độ (1) | Tài liệu thiết kế, lọc câu trùng, mô phỏng cân bằng, kiểm thử tự động, danh sách TODO |

**Buổi thuyết trình:** chế độ 5 hoặc 7 phút làm mini game kết thúc (0,5 điểm "Khởi động + mini game"); lớp chia phòng ≤ 5 người, quét QR trên slide.

## 20. Việc còn mở

**Thay đổi sau G6 (nhóm quyết định):**
- [x] **05/10/2026 (sáng) — Bỏ Kho câu hỏi** để tránh gian lận (commit `d53b016`): gỡ màn Kho câu hỏi, nút trên trang chủ và Sổ ôn tập.
- [x] **05/10/2026 — Đưa Kho câu hỏi trở lại, khóa bằng mã** (nhóm đổi quyết định cùng ngày): Kho và Sổ ôn tập khôi phục, chỉ mở khi nhập đúng mã nhóm đưa sau khi chơi (mục 12.8). Repo chỉ có salt + SHA-256 (`src/data/bank-lock.json`); `npm run set:bank-code -- <mã>` đổi mã. **Giới hạn (L5):** đáp án vẫn nằm trong mã trang (cần cho chơi trên một máy / offline) — người biết dùng công cụ nhà phát triển vẫn đọc được; khóa chỉ chặn tra cứu thông thường.
- [x] **05/10/2026 — Nhóm trả lời các câu hỏi rà soát G6:** hoàn tác phương án (a) (chỉ hoàn tác thao tác chọn); người mất kết nối: Khiên và power-up không tự có tác dụng (đúng mục 9); thêm dòng "Cần tung đúng số để về Đích"; màn hình ≥ 1600 px phóng to bàn cờ, chữ, cửa sổ câu hỏi; hiện đáp án 3 s khi đúng / 5 s khi sai; tự tung cho người mất kết nối sau 8 s (thay 20 s); Sổ ôn tập khôi phục sau mã; giữ tên tạm. Diễn tập: chưa có kết quả mới sau lần 1.
- [x] **05/10/2026 — Sửa lỗi từ đợt kiểm tra độc lập 04/10** (mỗi lỗi có test; đã kiểm test hỏng trên mã cũ):
  - Kết nối Redis lần đầu chậm hơn hạn chờ làm hỏng instance ("Socket already opened" → 503 tới khi instance bị thu hồi): giữ promise kết nối gốc, hạn chờ chỉ áp cho lượt gọi, không gọi `connect()` khi đã mở (`tests/redis-faults.test.ts`, proxy TCP làm chậm redis-server thật).
  - Theo dõi phòng (subscribe) lỗi không thử lại — tập listener rỗng ở lại, máy hiện "Trực tiếp" mà chỉ nhận nước đi qua lượt hỏi 30 s: kho xóa mục khi lỗi; hub thử lại sau 1, 2, 4… tối đa 10 s.
  - Dọn kết nối sau khi WebSocket đóng chạy trong `waitUntil` của `@vercel/functions` (chủ phòng đã rời được thay ngay, không chờ ~5 phút) (`tests/socket-cleanup.test.ts`).
  - Giao diện: chip màu + tên trong cửa sổ câu hỏi ("Câu hỏi của …") và kết quả ("Tên: Đúng!"); máy chơi cùng trả lời sau 4–6 s theo độ dài câu (không dùng RNG — cùng seed vẫn cùng kết quả); ô bẫy dùng biểu tượng cảnh báo thay tia sét; chú thích ô luôn hiện, gọn một dòng; phòng chờ cuộn về đầu khi đổi trạng thái (trước đó sau "Tạo phòng" trên 360 × 780 trang còn cuộn 572 px, mã phòng ở ngoài màn hình).
  - e2e chập chờn ở bước "máy từng mất mạng đã nối lại WebSocket": nguyên nhân chính là **thời gian chờ của test** — server cục bộ của e2e đóng mỗi WebSocket sau 25 s (giả lập 300 s của Vercel, rút ngắn) mà client chỉ thay kết nối ở mốc 280 s, nên cứ 25 s máy về polling ~1 s; bước kiểm chỉ nhìn một lần → nay chờ tối đa 6 s. Kèm sửa một lỗi thật của game tìm ra khi xem xét: có mạng lại thì máy vẫn ở chế độ dự phòng tới hết khoảng lùi đã tăng lúc mất mạng (tới 10–30 s) → nay thử WebSocket ngay khi lần poll đầu thành công hoặc trình duyệt báo `online` (`tests/reconnect.test.ts`). `e2e-online` chạy 5 lần liên tiếp đều đạt.
- [x] **04/10/2026 — Trang chủ** bỏ dòng thông điệp và dòng giới thiệu "Muốn tiến phải hiểu bài…" (thông điệp vẫn ở màn kết thúc).

**Thay đổi bản 1.6 (04/10/2026) — nhóm quyết định, ưu tiên hơn mọi ghi chép cũ trong mục này:**
- [x] **Bỏ trụ cột / chủ đề** khỏi câu hỏi, bàn cờ, thống kê, Kho câu hỏi. Quyết định cũ D1, D2 (phần trụ cột), D3, D6 (phần trụ cột), N2 hết hiệu lực.
- [x] **Bỏ giải thích và nguồn** (kèm `verified`, nhãn `[Chờ xác minh]`, thẻ và chip hiện vật). Quyết định cũ N1, quy tắc chữ cái phương án trong giải thích, hai lời giải thích Q-02/Q-11 hết hiệu lực.
- [x] **Câu hỏi trộn ngẫu nhiên các mức độ khó suốt ván**: mỗi ô câu hỏi rút ngẫu nhiên từ toàn bộ kho, không theo vị trí (mục 5). Thay cho "vòng chung độ khó 1, về đích 2, 2, 3, 3".
- [x] **Bộ câu hỏi 55 câu** (12 câu khởi đầu + 43 câu từ `Câu hỏi.docx`, đã lọc 17 câu trùng và 12 câu dán lặp); 18 / 19 / 18 câu theo độ khó.
- [x] Sau khi trả lời chỉ hiện Đúng / Sai và đáp án đúng; thời gian hiện đề xuất 3 giây.
- [x] Gỡ `artifacts.json`, `mindmap.json`, `pillars.json`; giữ `docs/nguon/` làm hồ sơ.
- Các ghi chép G1–G5 bên dưới còn nhắc trụ cột, giải thích, nguồn, hiện vật, "8 giây"… là lịch sử của bản 1.5; Đ1.6 đã đánh dấu *(đã bỏ ở 1.6)* / *(đã đổi ở 1.6)* ở từng chỗ.


**Đã chốt (03/10/2026):**
- [x] Bàn cờ 6 nhánh, phòng tối đa 5 người.
- [x] Giới hạn thời gian mặc định 10 phút.
- [x] Đoán cùng tắt mặc định (vẫn là tùy chọn trong cài đặt phòng).
- [x] Thẻ bẫy chỉ có hai loại: mất lượt, hoặc lùi ngẫu nhiên 1–3 ô.
- [x] Không có luật đá ngựa.
- [x] Game là sản phẩm độc lập, làm trên nhánh `game` riêng; dữ liệu chép lúc tạo nhánh thuộc về game, không đồng bộ lại với web.
- [x] Bộ câu hỏi do nhóm biên soạn, bắt đầu bằng 12 câu kiến thức đã duyệt (`QUIZ-KIEN-THUC.md`); câu hỏi thử chỉ lấp chỗ còn thiếu.
- [x] **Duyệt G0:** D1–D6, L1–L5, N1–N3 theo đúng phương án Claude Code đề xuất ở G0; N2 chấp nhận trụ cột trong sạch ít hơn 20 câu.
- [x] **T1:** thêm mốc 7 phút (5 / 7 / 10 / 15 phút / không giới hạn); mặc định vẫn 10 phút.
- [x] **N4:** nhãn thẻ bẫy trung tính (phương án A).
- [x] Tên game: giữ tên tạm; tên chính thức để sau.
- [x] Ghi chú Deployment Protection (mục 15.6, 18, 20) là nội dung cố ý thêm ở bản 1.4.
- [x] Hai lời giải thích Q-02, Q-11 nhắc chữ cái phương án: nhóm sửa câu chữ (cách a) — Q-02 bỏ câu cuối, Q-11 nêu thẳng hai phương án. *(đã bỏ ở 1.6)*
- [x] Độ khó 12 câu khởi đầu: duyệt theo đề xuất của Claude Code.
- [x] Kiểm tra sau mỗi mốc chỉ bằng kiểm tra tự động; rà soát bằng sub agent (tối đa 6) chỉ một lần trước phát hành (G6) hoặc khi nhóm yêu cầu (mục 15.8). Thay quy định cũ "tối đa 6 sub agent mỗi khâu kiểm tra".
- [x] Dừng sau mỗi mốc G, chờ nhóm cho phép làm mốc tiếp theo (mục 15.8), áp dụng từ G4.

**Quyết định G0 đã ghi vào tài liệu:**

| Mã | Quyết định | Ghi ở mục |
|---|---|---|
| D1 | Trụ cột của nhánh lặp theo thứ tự trong `mindmap.json` *(đã bỏ ở 1.6)* | 4 |
| D2 | Power-up ở ô 3 nhánh 1 và 5; bẫy ở ô 3 nhánh 3 và 6 → ô câu hỏi dân chủ 3, pháp quyền 3, trong sạch 2 *(vị trí giữ; phần trụ cột đã bỏ ở 1.6)* | 4 |
| D3 | Đường về đích độ khó 2, 2, 3, 3, trụ cột xoay vòng từ nhánh có cổng; Đích độ khó 3, trụ cột theo seed *(đã bỏ ở 1.6 — câu rút ngẫu nhiên từ toàn bộ kho, mục 5)* | 4 |
| D4 | Bố cục Dài: vòng chung 24 ô, đường về đích 5 ô | 4 |
| D5 | Quãng đường 22 bước (bố cục Dài 29) | 4 |
| D6 | Màu ngựa khác hẳn màu trụ cột; trụ cột trên ô hiện bằng viền + biểu tượng + chữ viết tắt *(phần trụ cột đã bỏ ở 1.6; ngựa vẫn 6 màu + ký hiệu)* | 12, 15.7, 16 |
| L1 | Tiến 3 ô không vào thẳng Đích; bẫy lùi theo đường của người đó, có thể ra vòng chung | 5, 6, 7 |
| L2 | 50:50 loại tới khi còn 2 đáp án; câu 2 đáp án không dùng được, không mất power-up | 6 |
| L3 | Luật ra 6 xét mặt xúc xắc trước khi nhân đôi | 5, 6 |
| L4 | Kỷ lục cá nhân chỉ lưu khi về đích; hết giờ báo số ô còn lại | 9 |
| L5 | Chấp nhận đáp án nằm trong mã trang; ẩn Kho câu hỏi khi đang ở trong phòng *(05/10/2026: Kho khóa bằng mã — mục 12.8)* | 12, 15.4 |
| T1 | Thêm mốc 7 phút; trên lớp chọn 5 hoặc 7 phút; hết giờ tôn vinh người dẫn đầu; mô phỏng ở 20 s và 25 s/lượt | 10, 11 |
| N1 | Nội dung thẻ hiện vật trong game (không ảnh, không "Ngày nay", không nguồn APA) *(đã bỏ ở 1.6)* | 12 |
| N2 | Mỗi trụ cột ≥ 10 / 6 / 4 câu theo độ khó 1 / 2 / 3; trụ cột trong sạch được ít hơn; quy tắc lấy câu khi thiếu *(đã bỏ ở 1.6)* | 8, 13.4 |
| N3 | Câu `fillQuote` đánh dấu chỗ trống bằng `___` | 13.4 |
| N4 | Nhãn thẻ bẫy trung tính | 7 |
| — | Ghi chú Deployment Protection: chỉ tên miền chính mở công khai; thử trên điện thoại dùng Shareable Links | 15.6, 18, 20 |
| — | Giải thích không nhắc chữ cái phương án; sửa Q-02, Q-11 *(đã bỏ ở 1.6)* | 13.1, 13.4, 17 |
| — | Độ khó 12 câu khởi đầu | 13.1 |

**Kết quả rà soát G0 (03/10/2026) — đối chiếu tài liệu này với dữ liệu đã chép:**

| Mục | Dữ liệu | Đối chiếu |
|---|---|---|
| Trụ cột | 3: `dan-chu`, `phap-quyen`, `trong-sach` (`mindmap.json`, `pillars.json`) | Khớp giả định 3 trụ cột (13.3). 6 nhánh chia đều 2 nhánh mỗi trụ cột (xem D1). Tên trụ cột có ở cả `mindmap.json` và `pillars.json`, hiện trùng khớp → đề xuất `pillars.json` là nguồn nhãn/tên/màu, test kiểm hai file khớp id và tên *(đã bỏ ở 1.6)* |
| Màu trụ cột | Đỏ son `#A4262C`, Xanh mực `#23395B`, Vàng đồng `#B8892B` (chữ trên nền sáng `#7A5A17`) | Trùng sắc với màu ngựa dễ nhầm (xem D6) *(đã bỏ ở 1.6)* |
| Hiện vật | 13 (HV-01 → HV-13), mọi `pillar` hợp lệ, mọi hiện vật `verified: true`, không có `hidden` | Phân bố dân chủ 5, pháp quyền 4, trong sạch 4. Chưa có ảnh. `sourceIds` trỏ tới `sources.json` của web — không được chép (xem N1) *(đã bỏ ở 1.6)* |
| `todo` trong `mindmap.json` | 1 mục, trụ cột `trong-sach`: giáo trình thiếu tr. 92–93 | Trụ cột này chỉ có 2 mục nội dung (dân chủ 5, pháp quyền 3) → khó đủ ~20 câu (xem N2) *(đã bỏ ở 1.6)* |
| Nhánh web | `CLAUDE.md` nằm ở `San-pham-sang-tao/web/CLAUDE.md`; không có `web/scripts/package-offline.mjs` — web hiện chỉ còn bản offline, script là `scripts/package.mjs` | Không ảnh hưởng game; game tự viết script đóng gói riêng |
| Cân bằng (ước tính thô) | Script tạm, **không phải mô phỏng chính thức G1**: bố cục Ngắn, xác suất đúng 70/50/35%, ~20 s/lượt, ván dừng khi người đầu tiên về đích | 1 người ~3,9 phút (trung vị 10 lượt) · 3 người ~8 phút, 84% ván xong ≤ 10 phút · 5 người ~11,7 phút, 42% xong ≤ 10 phút, **3% xong ≤ 5 phút**; dính bẫy ~0,8 lần/người; chuỗi đứng yên dài nhất ~3 lượt (xem T1) |

**Chi tiết engine G1 tự chọn trong phạm vi thiết kế (nhóm xem lại; đổi được trong `rules.json`, `bots.json` hoặc mã, không chặn các mốc):**
- Mặc định "khi có người về đích": **dừng ngay** (`afterFirstFinish: "stop"`); chủ phòng đổi sang "chơi tiếp để xếp hạng". Ở chế độ chơi tiếp, khi chỉ còn một người chưa về đích thì người đó xếp cuối và ván kết thúc.
- Sau khi chốt câu, đáp án + giải thích hiện **8 giây** (`revealMs`) *(đã đổi ở 1.6: chỉ Đúng / Sai + đáp án đúng, 3 giây)*; kết quả bước đi không có câu hỏi (ô nghỉ, power-up, bẫy) hiện **3 giây** (`noticeMs`); người đến lượt bấm "Tiếp tục" để đi sớm hơn. Túi đầy hoặc chọn ngựa: 15 giây, quá hạn thì bỏ món mới / đi ngựa đầu tiên.
- Đổi câu đặt lại đồng hồ trả lời 20 giây cho câu mới.
- Mượn câu khi thiếu (mục 8): hai độ khó cách đều thì lấy độ khó **thấp hơn** *(đã bỏ ở 1.6)*. Trộn lại khi hết kho: câu vừa hỏi gần nhất không ra ngay ở đầu vòng mới.
- Ra 6 đi tới ô bẫy vẫn được tung thêm (đã di chuyển được); thẻ "mất lượt" bỏ lượt **kế tiếp**.
- Nhãn "Bẫy — lùi {n} ô" dùng số ô lùi thực tế (bị chặn ở cổng thì nhỏ hơn số rút); khi Khiên chặn thẻ lùi, nhãn dùng số đã rút.
- 2 ngựa: chỉ hỏi chọn ngựa khi hai ngựa ở hai vị trí khác nhau và cùng đi được.
- Người đang trả lời không thấy lựa chọn Đoán cùng của người khác (chỉ thấy sau khi chốt, qua thống kê).
- "Chuỗi đứng yên": lượt mà cuối lượt ngựa không tiến hơn đầu lượt (trả lời sai, không đi được, bị bỏ lượt, bị bẫy lùi về chỗ cũ).
- Với bố cục hiện tại, bẫy chỉ nằm trên vòng chung nên trường hợp "lùi từ đường về đích ra vòng chung" không xảy ra trong ván; engine vẫn xử lý đúng nếu sau này đổi bố cục.

**Chi tiết giao diện G2 tự chọn trong phạm vi thiết kế (nhóm xem lại; không chặn các mốc):**
- Bàn cờ luôn nền sáng (như bàn cờ thật), kể cả khi máy bật chế độ tối, để màu trụ cột và màu ngựa giữ đủ tương phản. Chữ viết tắt trụ cột trong sạch dùng màu chữ `#7A5A17` thay cho vàng đồng *(đã bỏ ở 1.6)*. Có mục "Chú thích" thu gọn dưới bàn cờ.
- Cửa sổ câu hỏi mở sau khi xúc xắc lăn xong (không che xúc xắc); khi bật hiệu ứng, người trả lời mất khoảng 0,9 giây của 20 giây vì đồng hồ tính từ lúc tung. Giải thích hiện ngay khi chốt; ngựa đi phía sau cửa sổ.
- Cửa sổ kết quả luôn hiện đủ 8 giây (giải thích) / 3 giây (bước đi) *(đã đổi ở 1.6: 3 giây đáp án đúng)* tính từ lúc diễn hoạt xong, có đồng hồ "Tự sang lượt sau … giây"; trong lượt của máy, người ngồi cùng bấm "Tiếp tục" được để đi sớm.
- 2 ngựa: chọn ngựa ngay trong khu điều khiển (không che bàn cờ), bấm nút hoặc bấm ngựa có viền vàng trên bàn cờ; mỗi ngựa có số 1 / 2.
- Hoàn tác: tối đa 10 bước, chỉ lùi về trước thao tác của người (bỏ luôn các bước tự động sau đó); **khi đáp án một câu đã hiện thì xóa lịch sử hoàn tác** để không trả lời lại câu đã lộ đáp án.
- Lưu ván trên máy sau mỗi thay đổi; tải lại → "Tiếp tục ván", đồng hồ ván và hạn pha dời đúng bằng khoảng thời gian màn chơi bị đóng (không được hoàn giờ khi tải lại). Ván lưu không còn hợp lệ với dữ liệu mới (câu hỏi bị bỏ, bố cục đổi) thì bị bỏ. Rời trang khi đang chơi: trình duyệt hỏi lại.
- Mở thẻ hiện vật *(đã bỏ ở 1.6)* hoặc hộp "Thoát ván?" thì tạm dừng đồng hồ ván và hạn pha (chỉ ở "Chơi trên một máy").
- 50:50 với câu 2 đáp án: nút mờ kèm ghi chú, không mất power-up (L2).

**Chi tiết server G3 tự chọn trong phạm vi thiết kế (nhóm xem lại; không chặn các mốc):**
- **Sang lượt sớm (chơi qua phòng):** chỉ người đến lượt bấm "Tiếp tục" để đi sớm được. Trong lượt của máy chơi cùng, mọi người chờ hết 8 giây hiện giải thích để ai cũng kịp đọc *(đã đổi ở 1.6: 3 giây hiện đáp án đúng)*. "Chơi trên một máy" vẫn cho người ngồi cùng bấm sớm.
- **Hành động tự động khi quá hạn:**
  - Máy gửi `TICK`; server tự chọn hành động đang chờ theo giờ server (tự tung, hết giờ, bỏ lượt, bước của máy).
  - Máy của người đến lượt gửi trước; các máy khác chờ thêm 0,7 s mỗi bậc để không gửi trùng nhiều.
- **Trạng thái kết nối:**
  - Có kết nối WebSocket đang mở, hoặc có gọi server (hành động, poll) trong 20 s gần nhất → còn kết nối.
  - Kết nối WebSocket rớt được chờ 20 s để tự nối lại hoặc chuyển polling.
  - Cờ "mất kết nối" chỉ đổi ở lần ghi phòng kế tiếp. Trong ván, lần ghi xảy ra liên tục; ở phòng chờ yên lặng, danh sách có thể chậm cập nhật.
  - Mất kết nối đúng lúc tới lượt → engine tự bỏ lượt sau 20 s (mục 9).
- **Chuyển chủ phòng:**
  - Khi chủ phòng bấm rời, hoặc bị coi là mất kết nối → chuyển cho người vào sớm nhất còn kết nối.
  - Chủ phòng cũ quay lại **không** lấy lại quyền.
- **Rời phòng:**
  - Ở phòng chờ: bỏ khỏi danh sách.
  - Trong ván: đánh dấu đã rời và mất kết nối (lượt tự bỏ qua). Người đó vẫn quay lại được bằng phiên cũ.
  - Mọi người đều rời → phòng đóng.
- **Mời ra:** chỉ ở phòng chờ. Phiên của người bị mời ra không dùng được nữa ("Bạn đã được mời ra khỏi phòng"); người đó vẫn vào lại được như người mới.
- **Chơi lại:** chủ phòng bấm sau ván → **về phòng chờ** với cùng người và máy chơi cùng (bỏ người đã rời). Ở đó chỉnh được cài đặt, người mới vào được, rồi bấm Bắt đầu.
- **Kết thúc sớm:** chủ phòng kết thúc được ván đang chơi; engine ghi lý do "host" và xếp hạng như hết giờ.
- **Phòng 1 chỗ:**
  - Vào ván ngay khi tạo, với 0–4 máy chơi cùng do người tạo chọn. Máy chơi cùng không tính vào "1 chỗ".
  - Người khác vào thì nhận "phòng đã đủ người".
- **Đổi màu ở phòng chờ:** được, nếu màu mới chưa ai chọn.
- **Mã phòng:** không phân biệt chữ hoa/thường, bỏ qua khoảng trắng và dấu gạch.
- **Phòng hết hạn:** sau 6 giờ báo "Phòng đã hết hạn" thêm 10 phút, sau đó báo "Không tìm thấy phòng".
- **Giới hạn tần suất:**
  - Tạo phòng: 120 phòng / 10 phút mỗi địa chỉ IP, đếm chung qua Redis. Cả lớp có thể chung một IP Wi-Fi.
  - Xem / vào phòng: 240 lần / phút mỗi IP, đếm trong từng instance.
  - Hành động: 60 lần / 10 s mỗi người, đếm trong từng instance.
- **Polling không đổi:** trả 204 (không có nội dung) thay cho 304, để trình duyệt nào cũng xử lý giống nhau.

**Chi tiết giao diện G4 tự chọn trong phạm vi thiết kế (nhóm xem lại; không chặn các mốc):**
- **Trang chủ bản online:**
  - các nút: "Vào lại phòng gần nhất" (khi máy còn phiên phòng), Tạo phòng, Vào phòng, Chơi trên một máy;
  - Luật chơi, Kho câu hỏi, Cài đặt làm ở G5.
  - Bản offline không có phần chơi qua phòng: mã không được nạp, chỉ có "Chơi trên một máy".
- **Link `/p/ABCDE`:**
  - máy đã có phiên của phòng đó → vào thẳng phòng (tải lại trang khi đang chơi cũng vậy);
  - chưa có → màn Vào phòng, mã điền sẵn, tự tìm phòng.
  - Khi ở trong phòng, thanh địa chỉ hiện `/p/ABCDE`.
- **Biệt danh và màu** nhớ lần trước. Màu đã có người chọn thì mờ, không bấm được. Màu nhớ trùng người khác → tự chọn màu trống đầu tiên.
- **Phòng chờ:**
  - Chủ phòng: đổi số chỗ (không nhỏ hơn số người đang có), thêm / bỏ máy chơi cùng, mời người ra, chỉnh cài đặt ván. Mỗi thay đổi áp dụng ngay cho mọi máy.
  - Mọi người: đổi màu được.
  - Có nút "Chia sẻ" khi trình duyệt hỗ trợ Web Share.
  - Mã QR tạo ngay trên máy (gói `qrcode`, không gọi mạng).
- **Trong ván:**
  - Mọi người thấy câu hỏi của người đang trả lời. Bật Đoán cùng thì người đang chờ bấm được đáp án để tự kiểm tra (mỗi người một lần).
  - Chỉ người đến lượt có nút Tiếp tục.
  - Huy hiệu kết nối: "Trực tiếp" / "Đang dùng chế độ dự phòng" / "Mất kết nối — đang thử lại".
  - Trở thành chủ phòng thì có thông báo.
- **Kết thúc:**
  - Nút "Chơi lại (về phòng chờ)" chỉ chủ phòng bấm được; người khác thấy "Chờ chủ phòng bấm Chơi lại…".
  - "Về trang chủ" = rời phòng (có hộp xác nhận).
- **Rời phòng:** có hộp xác nhận; xóa phiên trên máy. Đóng tab giữa ván thì trình duyệt hỏi lại.
- **Sau rà soát G3 (6 sub agent):**
  - **Đã sửa:**
    - giới hạn tần suất hành động chỉ đếm sau khi xác thực;
    - token sai trên bản đệm bị từ chối mà không tốn lệnh Redis;
    - mã phòng không tồn tại được nhớ 10 s;
    - TICK, poll và thay kết nối không còn hủy việc "Rời phòng";
    - client dừng sau khi rời;
    - ghi "đã nối lại" trước khi chạy hành động;
    - chuyển chủ phòng khi mở kết nối, và khi người khác poll lúc chủ phòng đã đi ở phòng chờ;
    - Redis: hạn 4 s cho mỗi lệnh, báo lỗi thay vì treo khi sai URL hoặc mất kết nối;
    - WebSocket im lặng quá 70 s thì server cắt, để phát hiện kết nối nửa mở;
    - bỏ qua hello trùng;
    - máy dùng WebSocket không ghi "lần poll gần nhất";
    - mã `%` hỏng không làm sập server cục bộ;
    - `layout` không nhận khóa prototype;
    - client gửi lại hành động trong ~15 s, hẹn lại TICK sau mọi lỗi, thử lại kết nối thay thế bị hỏng.
  - **Còn lại (rủi ro thấp, ghi nhận):**
    - Người lạ dò mã phòng bừa vẫn tốn 1 lệnh Redis cho mỗi mã mới.
    - Seed / RNG của engine 31 bit; người rành kỹ thuật về lý thuyết đoán được xúc xắc. Đây là game ôn tập, chấp nhận như L5.
    - Vào phòng chưa chống gửi trùng khi mất phản hồi: có thể sinh một người "ma" ở phòng chờ, chủ phòng mời ra được. G4 sẽ xử lý phía giao diện.

**Chi tiết G5 tự chọn trong phạm vi thiết kế (nhóm xem lại; không chặn các mốc):**
- **Trang chủ:** hàng nút Luật chơi · Kho câu hỏi · Cài đặt dưới các nút chơi; dòng "Tổng số câu hỏi: N". Bỏ dòng "đang được hoàn thiện".
- **Ôn câu sai (màn kết thúc):**
  - Chơi qua phòng: chỉ ôn câu **mình** trả lời sai ("Câu bạn trả lời sai"); chơi trên một máy: câu của từng người (không phải máy).
  - Mỗi câu sai có đáp án đúng, giải thích, nguồn, chip "Hiện vật liên quan" *(đã đổi ở 1.6: câu hỏi + đáp án đúng + độ khó)*.
  - Nút "Làm lại các câu sai": trả lời lại từng câu (đáp án trộn lại), hiện giải thích *(đã đổi ở 1.6: hiện đáp án đúng)*, cuối cùng báo "đúng x/y". Không ảnh hưởng ván.
  - **Sổ ôn tập trên máy:** câu sai ở các ván đã kết thúc được lưu id vào localStorage (`review.v1`, tối đa 300, mới nhất trước). Kho câu hỏi lọc được "Câu từng trả lời sai trên máy này"; ôn tập trả lời đúng thì câu đó được bỏ khỏi sổ. Không gửi đi đâu. *(05/10/2026: bỏ rồi khôi phục cùng ngày, nay sau mã Kho câu hỏi)*
- **Thống kê (màn kết thúc):** thêm cột "Tỉ lệ đúng" và mục "Theo trụ cột" (đúng / đã trả lời theo trụ cột của câu). Engine thêm `stats.byPillar` (tùy chọn — ván lưu cũ không có thì hiện "chưa trả lời câu nào") *(mục "Theo trụ cột" và `stats.byPillar` đã bỏ ở 1.6)*. Bảng thống kê trên điện thoại cuộn ngang được (vùng cuộn nhận tiêu điểm bàn phím).
- **Chia sẻ game** ở màn kết thúc: Web Share nếu có, không thì sao chép `siteUrl` (trình duyệt nhúng Zalo/Messenger).
- **Kho câu hỏi** *(đã đổi ở 1.6: bỏ lọc trụ cột, `[Chờ xác minh]`, nguồn, chip hiện vật, giải thích)*: lọc theo trụ cột, độ khó, Sổ ôn tập, chỉ câu hỏi thử; tìm chữ (không phân biệt dấu); mỗi câu có id, trụ cột, độ khó, loại, nhãn `[Câu hỏi thử]` / `[Chờ xác minh]`, nguồn, chip hiện vật; đáp án + giải thích ẩn mặc định, nút "Hiện đáp án" từng câu và "Hiện mọi đáp án"; "Ôn tập N câu đang lọc". Chỉ mở từ trang chủ; Menu trong ván không có Kho câu hỏi (L5; `e2e:online` kiểm). *(05/10/2026: bỏ rồi khôi phục cùng ngày, nay sau mã Kho câu hỏi)*
- **Luật chơi minh họa:** màn riêng và tab trong Menu của ván. Gồm: mục tiêu, sơ đồ đường đi (cổng → 17 ô vòng chung → 4 ô về đích → Đích, số liệu tính từ `board.json`), một lượt chơi, các loại ô (hình mẫu giống bàn cờ + chữ viết tắt trụ cột *(đã đổi ở 1.6: bỏ trụ cột, thêm câu "rút ngẫu nhiên từ toàn bộ kho")*), power-up (biểu tượng, dùng ngay / cất vào túi, hiệu ứng từ `powerups.json`), thẻ bẫy (nhãn trung tính, tỉ lệ từ `traps.json`), kết thúc, cách chơi, tùy chọn, phím tắt. Chỉ nói về luật chơi, không có nội dung tư tưởng Hồ Chí Minh.
- **Cài đặt** (lưu `settings.v1`): Âm thanh bật/tắt + "Nghe thử"; Hiệu ứng chuyển động Theo máy / Giảm / Đầy đủ; Giao diện Theo máy / Sáng / Tối; Cỡ chữ Vừa / Lớn (112,5%); Toàn màn hình (khi trình duyệt hỗ trợ); "Xóa dữ liệu trên máy này" (ván lưu, kỷ lục, Sổ ôn tập, biệt danh, phiên phòng — giữ cài đặt; có hộp xác nhận; chỉ ở màn Cài đặt từ trang chủ). Ghi rõ game không thu thập thống kê.
- **Menu trong ván** (nút ☰ cạnh đồng hồ): tab Luật chơi / Cài đặt + nút toàn màn hình. "Chơi trên một máy": mở Menu thì tạm dừng đồng hồ (như hộp "Thoát ván?"). Chơi qua phòng: không tạm dừng (ván chung).
- **Âm thanh** (Web Audio, mặc định bật): xúc xắc, bước đi từng ô (tắt khi giảm hiệu ứng), đúng, sai/hết giờ, nhận power-up, dính bẫy, về đích; chơi qua phòng thêm tiếng báo "Tới lượt bạn" (phòng ≥ 2 người). Âm phát đúng lúc diễn hoạt tới sự kiện. AudioContext chỉ tạo sau thao tác đầu tiên; máy không hỗ trợ thì im lặng. Nút loa trên thanh đầu + phím M.
- **Phím tắt** (mục 16): Space = tung / tiếp tục (Space trên một nút đang có tiêu điểm thì để trình duyệt bấm nút đó) · 1–4 hoặc A–D = đáp án (cả Đoán cùng; lúc chọn ngựa: 1 / 2 = ngựa 1 / 2) · Q/W = power-up thứ 1/2 trong túi (không dùng được lúc đó thì báo toast; Khiên tự dùng) · M · F · Esc đóng cửa sổ. Không bắt phím khi đang gõ chữ hay có Ctrl/Alt/⌘, hoặc khi đang mở hộp thoại khác. Nhãn phím (Space, Q, W) chỉ hiện trên máy có chuột.
- **Pháo giấy:** canvas tự vẽ ~2,6 giây khi có người về đích (không chạy lại khi sang màn kết thúc); tắt khi giảm hiệu ứng.
- **Giảm hiệu ứng:** "Theo máy" = `prefers-reduced-motion`; "Giảm" tắt xúc xắc lăn, ngựa đi từng ô, nhấp nháy, cửa sổ trượt, pháo giấy; "Đầy đủ" bật hiệu ứng kể cả khi máy đặt giảm.
- **Giao diện điện thoại:** mục "Chú thích" chuyển xuống dưới khu điều khiển (trên máy tính vẫn dưới bàn cờ) để nút Tung xúc xắc không phải cuộn ở 360 × 780. Thanh đầu: đồng hồ, loa, Menu, hoàn tác, thoát.

**Chi tiết Đ1.6 tự chọn trong phạm vi thiết kế (nhóm xem lại; không chặn các mốc):**
- **Nhập câu hỏi:** script đọc bảng 8 cột; bảng 14 cột cũ không còn được nhận. Báo lỗi: thiếu cột, độ khó ngoài 1–3, đáp án không liền nhau / trùng, cột "đúng" ngoài A–D hoặc chưa điền, câu điền từ không đúng một `___`, câu "Sai / Đúng" đảo thứ tự, **câu trùng lời câu hỏi** (so sau khi bỏ dấu câu, khoảng trắng, chữ hoa). Cảnh báo (không chặn) khi ba mức chênh nhau quá 3. Kết quả với 55 câu: không lỗi, 18 / 19 / 18, 51 câu `single` + 4 câu điền từ (Q-14, Q-27, Q-42, Q-44), 0 câu đúng/sai; không dùng câu hỏi thử.
- **Câu trùng:** không có câu trùng lời. Vài câu cùng khuôn ("Điểm cốt lõi thứ nhất / thứ hai / thứ ba…" Q-49, Q-51, Q-52; Q-02 / Q-03) hỏi khác ý nên không coi là trùng.
- **Rút câu:** mỗi lần hỏi rút theo RNG có seed từ toàn bộ kho, không lặp tới khi hết kho; hết kho thì trộn lại, câu vừa hỏi không ra ngay; trong vòng ưu tiên câu người đó chưa gặp. Đổi câu: một câu ngẫu nhiên khác chưa hỏi; nhãn "Độ khó" đổi theo câu mới. Kho chỉ 1 câu thì Đổi câu báo "Không còn câu khác để đổi" và không mất power-up.
- **Ván lưu / phòng định dạng cũ:** state ván đổi `schema` 1 → 2. Ván "Chơi trên một máy" lưu trước 1.6 bị bỏ (không có "Tiếp tục ván"); phòng tạo trước 1.6 còn trong Redis coi như không còn ("Không tìm thấy phòng").
- **Giao diện:** ô câu hỏi một màu viền + biểu tượng "?"; dải vòng chung màu trung tính. Sau khi chốt: Đúng / Sai — tiến n ô / đứng yên, đáp án đúng được tô trong danh sách và nhắc lại một dòng "Đáp án đúng: …". Nhật ký ghi "… trả lời câu hỏi (độ khó n)" (ẩn như trước). Luật chơi thêm câu "rút ngẫu nhiên từ toàn bộ kho {N} câu" kèm số câu từng mức (đọc từ dữ liệu).
- **Câu hỏi thử:** kho `test-questions.json` còn 17 câu chỉ về luật chơi (bỏ câu hỏi về giải thích/hiện vật), định dạng mới; chỉ dùng khi một mức còn dưới 2 câu.
- **Mô phỏng:** giữ mô hình thời gian T giây mỗi lần hỏi dù hiện đáp án ngắn lại (ước lượng thận trọng).

**Rà soát trước phát hành G6 (04/10/2026) — 5 sub agent chỉ đọc (máy chủ, engine, giao diện, bộ câu hỏi, bản offline + README):**

*Đã sửa (lỗi kỹ thuật, không đổi luật):*
- Server: giới hạn số request và số lần sai mã / token theo IP **trước khi** đọc kho (chống dò mã phòng, chống đốt lệnh Redis); nhớ ngắn hạn mã phòng không tồn tại; mỗi người tối đa 3 kết nối WebSocket ghi trong phòng; `/api/health` giữ kết quả 5 giây và không trả chi tiết lỗi Redis; body `null` / mảng → `BAD_REQUEST`; biệt danh bỏ ký tự điều khiển / vô hình, phải có ít nhất một ký tự nhìn thấy.
- Engine: Đổi câu sau 50:50 không còn khóa 50:50 của câu mới; máy chơi cùng không dùng Xúc xắc ×2 khi mọi ngựa còn trong chuồng.
- Giao diện: bàn cờ trên điện thoại tràn ngang khi có từ 3 người (chữ `sr-only` trong dải người chơi thoát vùng cuộn → cửa sổ câu hỏi bị đẩy ra ngoài màn hình, cả khi chơi qua phòng) — đã sửa, e2e kiểm thêm không cuộn ngang trên bàn cờ 4 người ở 360 px; nút đáp án cao ≥ 56 px trên mọi màn (mục 16); sau khi chốt, kết quả + đáp án đúng + nút Tiếp tục đặt trên danh sách đáp án, nhãn "✓ Đáp án đúng / ✗ Lựa chọn" trên điện thoại chỉ còn biểu tượng (vẫn đọc cho trình đọc màn hình); chỉ báo "Xúc xắc ×2 đã bật" hiện được; đồng hồ ván không xuống dòng; nút "← Quay lại", "Chú thích", nút độ khó, nút "Bỏ người này" đủ vùng bấm; ô tiêu đề rỗng trong bảng thống kê; chữ Luật chơi "máy tự tung" → "game tự động tung", "Chủ phòng có thể chọn chơi tiếp" → "Khi tạo phòng hoặc thiết lập ván có thể chọn chơi tiếp" (vì Chơi trên một máy không có chủ phòng); gỡ chữ và component không dùng.
- Chạy thử: e2e một máy hết chập chờn (bấm "Tung xúc xắc" khi cửa sổ vừa mở; vòng phím tắt quá ngắn); README ghi rõ cần Chromium, thêm `serve`, `e2e:local`; DIEN-TAP và HUONG-DAN-VERCEL sửa vài câu lệch với game.

*Cần nhóm quyết (không tự sửa vì đổi luật / thiết kế / nội dung câu hỏi):*
- [x] **Hoàn tác trong "Chơi trên một máy" bị lợi dụng được:** hoàn tác sau khi dùng 50:50 rồi dùng lại; hoàn tác + tung lại để có thêm thời gian trả lời; hoàn tác sau khi thấy mặt xúc xắc để quyết định có dùng ×2 hay không. Phương án: (a) xóa lịch sử hoàn tác khi đã hiện câu hỏi / tung / rút thẻ bẫy — chỉ hoàn tác được thao tác chọn (đề xuất); (b) không cho hoàn tác lượt có dùng power-up; (c) giữ nguyên (chơi trên một máy là chơi thân thiện). → **nhóm chọn (a), đã làm 05/10/2026.**
- [x] **Mất kết nối tới lượt:** game tự động tung và câu tính sai như Luật chơi, nhưng Khiên và power-up dùng ngay vẫn có tác dụng cho người vắng mặt (mục 9 ghi "không dùng power-up"). Hỏi: Khiên tự chặn bẫy cho người vắng có được không? → **nhóm chọn: không tự có tác dụng, đã làm 05/10/2026.**
- [x] **"Phải tung đúng số":** khi tung quá Đích và mọi ngựa khác đều không đi được, lượt bị bỏ mà không có dòng giải thích riêng. Đề xuất thêm một chữ "Cần tung đúng số để về Đích". → **nhóm đồng ý, đã làm 05/10/2026.**
- [x] **Bàn cờ ở 1920 × 1080** chỉ rộng ~700 px (khung `max-w-6xl`); khi chiếu trên lớp có thể cho bàn cờ lớn hơn. Đổi bố cục màn chơi → hỏi nhóm. → **nhóm chọn phóng to ở ≥ 1600 px, đã làm 05/10/2026.**
- [x] **Vùng function (hạ tầng, nhóm làm):** kiểm deploy G6 thấy function chạy ở `iad1` (Mỹ) mà `pingMs` tới Redis ≈ 220 ms. Nhóm đã đổi sang `sin1` (diễn tập lần 1); Claude Code đo lại: `x-vercel-id` có `sin1`, `pingMs` = 1 ms.
- [ ] **Tường lửa Vercel:** `check:deploy` chạy bằng Node bị chặn `403` (`x-vercel-mitigated: deny`) ở bước vào phòng; đi qua proxy của môi trường thì đạt; trình duyệt (e2e 3 máy trên deploy) đạt. Nếu khi diễn tập có máy bị 403, xem Firewall của project.
- [ ] **Máy chủ (thấp):** báo lỗi khác nhau cho "không có phòng" và "sai token" (đã giới hạn theo IP nên khó dò); server Node cục bộ tin `x-forwarded-for` (chỉ dùng khi chạy thử, Vercel không dùng); Upstash có tính EVAL Lua như một lệnh — đo ở buổi diễn tập (DIEN-TAP).
- [ ] **Bộ câu hỏi — nhóm xem và tự sửa `docs/CAU-HOI-GAME.md` (Claude Code không sửa nội dung):** Q-27 "quyền binh" (nguyên văn thường là "quyền bính"); Q-52 có đáp án đúng trùng lời câu hỏi Q-53 (lộ đáp án); Q-48 bị lộ qua Q-49 / Q-51 / Q-52; Q-43 và Q-45 (cả Q-44) gần trùng ý; đáp án "đầy tớ" của Q-14 lộ qua Q-31 và một phương án nhiễu của Q-03; Q-02 và Q-03 hỏi gần cùng ý; Q-14 chính tả "uỷ" / câu trích; Q-13 "gánh vác" hay "gánh"; Q-50 "Nhà nước ta" hay "của ta"; Q-45 "có thể bị bãi nhiệm"; Q-27 viết hoa phương án nhiễu; dấu câu / ngữ pháp Q-36, Q-37, Q-52, Q-55; dấu ngoặc kép lẫn kiểu; Q-40 cách gọi "Bác Hồ"; nhãn "Tình huống giả định" lúc có lúc không; Q-39 có thể hiểu hai cách; Q-46, Q-52, Q-53 nên đối chiếu lại giáo trình; Q-04 / Q-29 có phương án nhiễu tương đương đáp án đúng; Q-24 / Q-34 / Q-38 cùng ý; độ khó Q-43 → Q-47 có vẻ dễ hơn mức ghi, Q-38 có vẻ khó hơn. Không thấy câu trích dẫn Bác bị bịa; không thấy lỗi trộn đáp án.
- Ghi chú: byte của gói zip phụ thuộc phiên bản zlib của Node (nội dung giải nén không đổi; `check:release` so nội dung).

*Mục 0 của yêu cầu G6 (nhóm chưa điền):* chưa nhận kết quả kiểm Deployment Protection, chưa có file câu hỏi mới (giữ 55 câu), chưa có tên chính thức (giữ tên tạm), chưa kiểm Upstash pub/sub — giữ nguyên các mục chưa xong bên dưới, kiểm ở buổi diễn tập (`docs/DIEN-TAP.md`).

**Nhóm cần quyết:**
- [ ] Tên chính thức của game — để sau, không chặn các mốc.

**Nội dung (nhóm cung cấp):**
- [x] Bộ câu hỏi 55 câu (bản 1.6). Thêm câu thì giữ ba mức độ khó gần bằng nhau (mục 13.4).

**Hạ tầng (cần tài khoản nhóm):**
- [x] Tạo project Vercel thứ hai (nhóm đã tạo: https://hcm-202-web-omega.vercel.app). Đã kiểm ở G5: trang chủ là game, Production Branch = `game`, Root Directory = gốc nhánh.
- [x] Gắn **Upstash for Redis** (gói Free) từ Vercel Marketplace (15.4, 15.5) — G5: `/api/health` trả `"store":"redis"`.
- [x] Điền `siteUrl` của game: `https://hcm-202-web-omega.vercel.app` (G4); đã xác nhận đúng project game (G5, mục 15.4).
- [x] Thử WebSocket thật trên bản deploy (G5, mục 15.4).
- [ ] Kiểm tra Deployment Protection (mục 15.6): khi thử trên điện thoại dùng Shareable Links; trước buổi học, tên miền chính phải mở được mà không cần đăng nhập Vercel. — G6: **đạt** ở diễn tập lần 1 (dòng 11 của `docs/DIEN-TAP.md`); trước buổi học vẫn mở thử ở cửa sổ ẩn danh.

**Cần xác minh:**
- [x] Trạng thái WebSocket trên Vercel và cách chạy với Vite + `api/` — đã xác minh ở G0 (15.4).
- [x] Hạn mức miễn phí hiện hành của Vercel Hobby và gói Redis — đã ước lượng ở G0 (15.5).
- [ ] **Upstash có tính mỗi tin pub/sub nhận được là một lệnh không — chưa xác minh được (G3, 03/10/2026).**
  - Đã thử: môi trường làm việc vẫn bị chặn truy cập `upstash.com`. Trang giá Redis trong mã nguồn tài liệu Upstash (GitHub `upstash/docs`, `redis/overall/pricing.mdx`) chỉ trỏ sang upstash.com/pricing/redis.
  - Bằng chứng gián tiếp: bảng lệnh của **Upstash Realtime** (cùng tài liệu, `realtime/overall/pricing.mdx`) liệt kê lệnh được tính khi nối, nối lại, ping, phát tin (SUBSCRIBE, UNSUBSCRIBE, PUBLISH, XADD, XRANGE), **không** có dòng nào cho tin nhận được. Điều này gợi ý tin nhận không bị tính.
  - Chưa có câu nói thẳng, nên ước lượng chi phí (mục 15.5) **giữ trường hợp xấu**: có tính.
  - Nhóm có thể xem câu hỏi thường gặp ở upstash.com/pricing/redis khi tạo database.
  - G6: nhóm chưa gửi kết quả. Cách đo trực tiếp ở buổi diễn tập: số **Commands** trước / sau một ván (`docs/DIEN-TAP.md` mục 1).
- [x] **Tên biến môi trường Redis — xác minh một phần (G3).**
  - Mã nguồn gói `@upstash/redis` 1.39.0 (`Redis.fromEnv`) đọc `UPSTASH_REDIS_REST_URL` hoặc `KV_REST_API_URL`, cùng `…_TOKEN` tương ứng. Đây là các biến REST.
  - Kết quả tìm kiếm cho biết Marketplace thêm `KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN`, có khi thêm `REDIS_URL`.
  - Server dùng giao thức TCP (cần cho pub/sub), đọc lần lượt `REDIS_URL` → `KV_URL` → `UPSTASH_REDIS_URL` (`.env.example`).
  - Chỉ có biến REST thì `/api/health` báo thiếu; hướng dẫn chỉ cách thêm `REDIS_URL` bằng tay (`docs/HUONG-DAN-VERCEL.md`).
- [x] **Trên bản deploy thật** (https://hcm-202-web-omega.vercel.app) — G5, kết quả ở mục 15.4:
  - `npm run check:deploy -- <địa chỉ> --long` đạt sau khi sửa catch-all: WebSocket, đóng ở 300 s và tự nối lại, polling, mọi `/api/*`.
  - Catch-all `api/[...path].ts` ngoài Next.js chỉ khớp một cấp → đã thêm rewrite `/api/(.*)` trong `vercel.json`.
  - Phòng 3 máy trên bản deploy (`npm run e2e:online -- --url …`) đạt.
- [ ] **Huy hiệu "Trực tiếp" trong trình duyệt trên máy thật** — Chromium trong môi trường của Claude Code đi qua proxy chặn TLS nên WebSocket bị mất header `Upgrade` (proxy của môi trường, không phải game; Node/curl qua cùng proxy vẫn nhận 101). Kiểm ở buổi diễn tập G6 (danh sách mục 18).

---

## Phụ lục A — Game tham khảo (chỉ lấy cảm hứng)

"Cuộc Đua Kỳ Thú — Party Board Game & Quiz" (cuocduakythu-chi.vercel.app). Đã thấy trong mã nguồn:
- Chế độ offline nhiều người trên một máy.
- Chế độ online tạo/vào phòng bằng mã 5 ký tự (server riêng), phòng chờ, chủ phòng bắt đầu và chơi lại ván.
- Nhớ tên người chơi lần trước và mã phòng gần nhất.
- Ô câu hỏi, ô bẫy, ô thưởng, vòng quay, mỗi loại có cửa sổ riêng.
- Kho câu hỏi trắc nghiệm xem được trong game.
- Hộp xác nhận thoát, cảnh báo khi đóng tab giữa ván, toast, âm thanh khi bấm, màn chiến thắng, cài đặt.

Không sao chép mã, giao diện, tên, đồ họa, âm thanh của game đó. Cờ cá ngựa là trò dân gian; mọi đồ họa của game này tự vẽ.
