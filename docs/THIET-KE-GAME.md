# THIẾT KẾ GAME — Con đường tư tưởng HCM

**Môn:** HCM202 · **Sản phẩm sáng tạo thứ hai** (độc lập với bảo tàng số) · **Chủ đề 4** — Tư tưởng Hồ Chí Minh về Nhà nước của nhân dân, do nhân dân, vì nhân dân
**Phiên bản:** 1.3 · 03/10/2026 · **Trạng thái:** G0 xong (rà soát, xác minh nền tảng, ước lượng chi phí) — **chờ nhóm duyệt các đề xuất ở mục 20** trước khi làm G1
**Vị trí:** nhánh `game` của repo `HCM202`, file `docs/THIET-KE-GAME.md` — nguồn chuẩn duy nhất cho game (luật, bàn cờ, màn hình, kiến trúc, kiểm thử, lộ trình).

---

## 1. Tổng quan

| Mục | Nội dung |
|---|---|
| Tên tạm | **Con đường tư tưởng HCM** (trong `site.json`, đổi được) |
| Thể loại | Board game đua **kiểu cờ cá ngựa**, theo lượt, tung xúc xắc |
| Người chơi | **Chơi đơn**, mỗi người trên máy tính hoặc điện thoại của mình |
| Phòng | **1–5 người**; chơi một mình được (phòng 1 người) |
| Vào phòng | **Mã phòng** 5 ký tự · **mã QR** · **đường link** |
| Chế độ | **Chơi qua phòng** (online, server trên Vercel) · **Chơi trên một máy** (1–5 người thay phiên, không cần mạng — dự phòng và bản offline) |
| Thông điệp | **"Chủ nhân không đứng ngoài"** |
| Đối tượng | Sinh viên đại học |
| Nguồn nội dung | Giáo trình HCM202, Chương IV, mục II (tr. 83–95) và *Hồ Chí Minh Toàn tập* (Nxb Chính trị quốc gia, 2011). **Bộ câu hỏi do nhóm biên soạn và cung cấp sau** (`docs/CAU-HOI-GAME.md`); trong lúc chờ, game dùng câu hỏi thử (mục 13) |
| Mã nguồn | **Nhánh `game` riêng** trong repo `HCM202` — nhánh mồ côi, không chung lịch sử, không chung mã với web; app nằm ở gốc nhánh |
| Triển khai | Project Vercel riêng, Production Branch = `game` |
| Quan hệ với bảo tàng số | **Sản phẩm độc lập.** Lúc tạo nhánh chỉ chép một lần dữ liệu khởi đầu (hiện vật, sơ đồ tư duy, màu trụ cột); từ đó dữ liệu thuộc về game, không đồng bộ lại với web. Không import mã hay dữ liệu từ nhánh web khi chạy hoặc build |
| Dùng trên lớp | Mini game kết thúc buổi thuyết trình: lớp chia nhiều phòng ≤ 5 người, quét QR, chơi 5–7 phút |

## 2. Luật cốt lõi (nhóm đã chốt — không đổi)

1. Chơi **theo lượt**, mỗi lượt **tung xúc xắc**.
2. **Ai về đích trước thắng.**
3. Trên đường có một số **ô power-up** và **ô bẫy/phạt**; **các ô còn lại là ô câu hỏi**.
4. Xúc xắc chỉ tới ô câu hỏi → **trả lời đúng thì nhảy lên ô đó, sai thì đứng yên ở ô cũ**.

**Không có luật đá ngựa.** Nhiều ngựa được đứng chung một ô.

## 3. Ý tưởng — gắn luật chơi với nội dung

- **Bàn cờ = con đường tư tưởng.** Mỗi đoạn đường chung mang màu một trụ cột (từ `mindmap.json`); ô câu hỏi trên đoạn đó hỏi về trụ cột đó. Số trụ cột và tên đọc từ dữ liệu, không viết cứng.
- **Muốn tiến phải hiểu bài:** mỗi bước tới ô câu hỏi là một câu hỏi.
- **Đường về đích = chặng cuối:** câu hỏi khó dần; ô Đích là câu "về đích" khó nhất.
- **Power-up** giúp trả lời (loại bớt đáp án, đổi câu) hoặc đi nhanh hơn; **bẫy** làm mất lượt hoặc lùi.
- **Học sau mỗi câu:** luôn hiện giải thích + nguồn (vd. "GT tr. 87", "HV-07"). Câu gắn với hiện vật có chip "Hiện vật liên quan" mở thẻ hiện vật (dữ liệu trong game).
- **Màn kết thúc:** ôn lại câu trả lời sai và thông điệp "Chủ nhân không đứng ngoài".

## 4. Bàn cờ (`board.json`)

**Hình dạng (đã chốt):**
- Bàn cờ cá ngựa **6 nhánh** (hình sao/lục giác), đủ chỗ cho tối đa 5 người.
- Nhánh không có người chơi để trống, làm mờ.

**Đường chung:**
- Vòng khép kín qua cả 6 nhánh, mặc định 6 nhánh × 3 ô = **18 ô**.

**Cổng:**
- Mỗi màu có một **ô cổng** trên vòng chung — là ô nghỉ, không hỏi.
- Cổng của màu không có người chơi trở thành ô câu hỏi.

**Đường của mỗi người:**

```
Cổng (màu mình) → đi gần trọn vòng chung → rẽ vào đường về đích (màu mình) → Đích (giữa bàn)
```

Mặc định đường về đích có 4 ô; tổng quãng đường mỗi người khoảng 21–22 ô.

**Phân bổ ô (bố cục Ngắn, mặc định):**

| Vị trí | Số ô | Loại |
|---|---|---|
| Vòng chung — cổng | 6 | Ô nghỉ (cổng không có người chơi → ô câu hỏi) |
| Vòng chung — còn lại | 12 | 2 power-up · 2 bẫy · 8 câu hỏi (độ khó 1) |
| Đường về đích (mỗi màu) | 4 | Câu hỏi, độ khó 2 → 3 |
| Đích | 1 | Câu "về đích", độ khó 3 |

**Bố cục Dài** (tùy chọn): nhánh 4 ô (vòng chung 24 ô), đường về đích 5 ô; tỉ lệ ô giữ tương tự.

Tên hiển thị, màu và biểu tượng từng loại ô nằm trong `board.json` và `site.json`.

## 5. Lượt chơi

1. **Tung:** người đến lượt tung 1 xúc xắc (1–6). Kết quả do engine quyết. Quá 15 s không tung thì tự tung.
2. **Tính ô đích của bước đi** = vị trí hiện tại + số chấm, theo đường của người đó. Không có luật chặn đường.
3. **Xử lý theo loại ô đích:**

| Ô đích của bước đi | Xử lý |
|---|---|
| **Câu hỏi** | Hiện câu hỏi của trụ cột ô đó (đồng hồ 20 s). **Đúng → nhảy lên. Sai hoặc hết giờ → đứng yên.** Luôn hiện giải thích + nguồn |
| **Power-up** | Nhảy lên, nhận một power-up (mục 6) |
| **Bẫy** | Nhảy lên, rút một thẻ bẫy (mục 7), trừ khi có Khiên |
| **Cổng (ô nghỉ)** | Nhảy lên, không hỏi |
| **Đích** | Câu "về đích" độ khó 3. Đúng → về đích; sai → đứng yên |

4. **Vượt quá Đích:** mặc định vẫn tính là tới Đích (vẫn phải trả lời câu về đích).
   - Tùy chọn **"Phải tung đúng số"** (luật gốc): không đúng số thì đứng yên.
5. **Ra 6:** nếu đã di chuyển được thì tung thêm một lần; tối đa một lần mỗi lượt.
6. **Hiệu ứng không dây chuyền:** khi power-up hoặc bẫy đẩy ngựa tới ô khác, ô mới không hỏi và không kích hoạt thêm hiệu ứng.
7. **Chuồng xuất phát:** mặc định mọi ngựa bắt đầu ngay ở cổng.
   - Tùy chọn **"Ra chuồng khi tung 1 hoặc 6"** (luật gốc).
8. **Số ngựa mỗi người:** mặc định **1**.
   - Tùy chọn **2 ngựa** cho ván dài: tung xong chọn ngựa để đi; thắng khi cả hai về đích.

Các tùy chọn luật và giá trị mặc định nằm trong `rules.json`; chủ phòng chỉnh trong phòng chờ.

## 6. Power-up (`powerups.json`)

| Power-up | Kiểu | Hiệu ứng |
|---|---|---|
| Tiến 3 ô | Dùng ngay | Đi thêm 3 ô (không dây chuyền) |
| Thêm lượt | Dùng ngay | Được tung thêm một lần sau lượt này |
| 50:50 | Cất vào túi | Khi đang trả lời: loại 2 đáp án sai (server chọn) |
| Đổi câu | Cất vào túi | Khi đang trả lời: đổi sang câu khác cùng trụ cột, cùng độ khó |
| Khiên | Cất vào túi | Tự dùng khi dính bẫy, chặn thẻ bẫy đó |
| Xúc xắc ×2 | Cất vào túi | Dùng trước khi tung: số chấm nhân đôi |

**Túi:** tối đa 2 món. Khi túi đầy mà nhận thêm, chọn bỏ món cũ hoặc bỏ món mới.

## 7. Bẫy (`traps.json`) — đã chốt

Dừng ở ô bẫy → rút ngẫu nhiên một thẻ bẫy. Chỉ có **hai loại thẻ**:

| Thẻ bẫy | Hiệu ứng | Tỉ lệ mặc định |
|---|---|---|
| **Mất lượt** | Bỏ lượt tiếp theo | 50% |
| **Lùi ngẫu nhiên** | Lùi **1, 2 hoặc 3 ô** — số ô chọn ngẫu nhiên, mỗi số 1/3 | 50% |

**Quy tắc:**
- Lùi không dây chuyền: ô bị lùi tới không hỏi và không kích hoạt hiệu ứng.
- Không lùi quá ô cổng của chính người đó.
- Khiên chặn được cả hai loại thẻ.
- Tỉ lệ giữa hai loại thẻ và khoảng lùi chỉnh trong `traps.json`.

**Nhãn thẻ:** mặc định trung tính (vd. "Bẫy — mất lượt", "Bẫy — lùi 2 ô"). Có thể gắn với nội dung môn học nếu có trích dẫn và số trang — xem mục 20.

## 8. Câu hỏi trong ván

- Mọi người trong phòng đều thấy câu hỏi và đồng hồ; chỉ người đến lượt có nút đáp án.
- Đáp án trộn khi hiện.
- **Không lặp** câu trong một ván cho tới khi dùng hết kho của trụ cột và độ khó đó; sau đó trộn lại, ưu tiên câu người đó chưa gặp.
- Sau khi chốt: hiện đáp án đúng, giải thích, nguồn, chip "Hiện vật liên quan" (nếu có).
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
- Bot trả lời đúng theo xác suất theo độ khó (gợi ý 70% / 50% / 35%) và dùng power-up theo luật đơn giản. Tham số trong `bots.json`.

**Chơi một mình:**
- Phòng 1 người chọn 0–4 máy.
- Mặc định 0 máy = **thử thách cá nhân**: về đích với ít lượt nhất; lưu **kỷ lục cá nhân** trên máy.

**Mất kết nối:**
- Đến lượt người đang mất kết nối → sau 20 s tự tung, câu hỏi tính là sai (đứng yên), không dùng power-up.
- Quay lại thì chơi tiếp ở vị trí cũ.

**Ván đã bắt đầu:** không nhận người mới; người cũ vẫn nối lại được.

**Thời hạn phòng:** phòng tự xóa sau 6 giờ.

## 10. Kết thúc

- **Người đầu tiên về đích thắng.** Chủ phòng chọn trước: dừng ngay, hoặc chơi tiếp để xếp hạng 2, 3…
- **Giới hạn thời gian:** 5 / 10 / 15 phút / không giới hạn — **mặc định 10 phút (đã chốt)**.
  - Hết giờ thì chơi nốt lượt đang dở.
  - Xếp hạng theo số ô còn lại tới đích.
- **Hòa:** so số câu trả lời đúng.

## 11. Cân bằng

Độ dài đường, tỉ lệ ô, power-up và bẫy được chỉnh bằng **mô phỏng 1.000 ván bot** cho 1, 2, 3, 5 người ở cả hai bố cục.

**Mục tiêu (bố cục Ngắn, ~20 s mỗi lượt, giới hạn mặc định 10 phút):**

| Số người | Mục tiêu |
|---|---|
| 1 người | Về đích trong ~3–5 phút |
| 3 người | Phần lớn ván có người về đích trong ~8–10 phút |
| 5 người | Nhiều ván có người về đích trước 10 phút; số còn lại kết thúc theo giờ với khoảng cách hợp lý |

Thêm một mục tiêu: không ai bị kẹt quá lâu vì bẫy hoặc trả lời sai liên tiếp.

**Chỉ số mô phỏng cần báo:**
- Số lượt trung bình để về đích.
- Thời gian ước tính.
- Tỉ lệ ván có người về đích trước 10 phút.
- Số lần dính bẫy trung bình.
- Chuỗi lượt đứng yên dài nhất.

**Kết quả mô phỏng:** `TODO` — điền ở G1.

## 12. Màn hình

Một giao diện co giãn cho cả máy tính và điện thoại.

1. **Trang chủ:** Tạo phòng · Vào phòng · Chơi trên một máy · Luật chơi · Kho câu hỏi · Cài đặt. Có "Vào lại phòng gần nhất" nếu còn phòng đang chơi. Khi kho còn câu hỏi thử, hiện dải báo "Đang dùng bộ câu hỏi thử".
2. **Tạo phòng** và **Vào phòng:** như mục 9.
3. **Phòng chờ:** như mục 9.
4. **Bàn cờ:**
   - Bàn cờ 6 nhánh co giãn; mỗi loại ô có biểu tượng + màu; ngựa các màu.
   - Sau khi tung, ô đích của bước đi được làm nổi.
   - **Bảng người chơi:** màu, số ô còn lại, power-up đang giữ, trạng thái (mất lượt, mất kết nối, máy), ai đang tới lượt.
   - **Khu điều khiển của mình:** nút Tung xúc xắc, túi power-up.
   - **Nhật ký** vài sự kiện gần nhất (vd. "Lan trả lời đúng, tiến 4 ô", "Minh dính bẫy, lùi 2 ô").
   - **Trạng thái kết nối:** "Trực tiếp" / "Đang dùng chế độ dự phòng" / "Mất kết nối — đang thử lại".
5. **Cửa sổ:**
   - Câu hỏi: đồng hồ, nút 50:50 / Đổi câu nếu có, giải thích sau khi chốt.
   - Power-up · Thẻ bẫy · Câu về đích.
   - Trên điện thoại hiện dạng tấm trượt từ dưới lên hoặc toàn màn hình, nút đáp án to.
   - Nếu phòng bật Đoán cùng: người đang chờ thấy nút chọn đáp án để tự kiểm tra.
6. **Kết thúc:**
   - Thứ tự về đích (hoặc xếp hạng theo khoảng cách nếu hết giờ).
   - Thống kê từng người: số câu đúng/sai, power-up đã dùng, số lần dính bẫy (và điểm Đoán cùng nếu bật).
   - Ôn lại câu mình trả lời sai (giải thích + nguồn).
   - Thông điệp kết.
   - Chơi lại · Về trang chủ · chia sẻ link game.
   - Chơi một mình: so với kỷ lục cá nhân.
7. **Chơi trên một máy:**
   - Nhập 1–5 người + số máy chơi cùng, thay phiên trên cùng thiết bị.
   - Lưu ván trên máy; tải lại → "Tiếp tục ván".
   - Có nút hoàn tác thao tác vừa rồi.
8. **Kho câu hỏi:** "Tổng số câu hỏi: N", lọc theo trụ cột, nhãn `[Chờ xác minh]` và nhãn `[Câu hỏi thử]`, nguồn từng câu, đáp án ẩn mặc định — có nút hiện.
9. **Luật chơi:** có hình minh họa các loại ô, power-up và thẻ bẫy.
10. **Chung:** hộp xác nhận thoát phòng, toast, cảnh báo khi đóng tab giữa ván.

## 13. Nội dung và nguồn

### 13.1 Bộ câu hỏi
- **Nhóm biên soạn và cung cấp sau** file `docs/CAU-HOI-GAME.md`, theo mẫu `docs/CAU-HOI-GAME.mau.md` (mục 13.4).
- Khi nhận được:
  1. Script `scripts/import-questions.mjs` chuyển file sang `src/data/questions.json` và kiểm tra định dạng (mục 17).
  2. Claude Code đối chiếu với các nguồn ở mục 13.2, báo câu thiếu nguồn, sai định dạng hoặc nghi sai nội dung để nhóm sửa.
  3. Thay toàn bộ câu hỏi thử bằng bộ câu hỏi của nhóm.
- **Claude Code không tự viết câu hỏi nội dung** về tư tưởng Hồ Chí Minh.

### 13.2 Nguồn tham chiếu trong nhánh `game`
- `docs/nguon/THIET-KE-WEB-APP.md` — bản sao tài liệu thiết kế bảo tàng số (đặc biệt mục 2 và mục 4).
- `src/data/artifacts.json` và `src/data/mindmap.json` — dữ liệu khởi đầu, chép một lần lúc tạo nhánh; nguồn gốc ghi trong `src/data/NGUON.md`.

Dùng để:
- Đối chiếu câu hỏi của nhóm.
- Hiện chip "Hiện vật liên quan".
- Lấy tên và màu trụ cột.
- Làm nhãn thẻ bẫy gắn nội dung (nếu nhóm chọn).

### 13.3 Câu hỏi thử (dùng cho tới khi có bộ câu hỏi của nhóm)
- **Mục đích:** chơi thử, chạy test, mô phỏng cân bằng, kiểm tra giao diện — không phải nội dung chính thức.
- **Nội dung:** không chứa kiến thức về tư tưởng Hồ Chí Minh. Hỏi về luật chơi của chính game (vd. "Trả lời sai ở ô câu hỏi thì ngựa đi đâu?"), hoặc câu giữ chỗ.
- **Đánh dấu rõ:**
  - id bắt đầu bằng `TEST-`;
  - trường `"test": true`;
  - `source.ref` = `"Câu hỏi thử"`, `verified: false`;
  - giao diện hiện nhãn `[Câu hỏi thử]`.
- **Phủ đủ:**
  - Mỗi trụ cột × mỗi độ khó (1, 2, 3) có ít nhất 2 câu (≈ 18–24 câu nếu có 3 trụ cột).
  - Có đủ 4 loại câu.
  - Có vài câu và đáp án rất dài, nhiều dấu tiếng Việt, để thử bố cục trên điện thoại.
- **Bản phát hành (G6) không được còn câu hỏi thử** — kiểm tra tự động (mục 17).

### 13.4 Quy tắc cho bộ câu hỏi chính thức
Nhóm áp dụng khi biên soạn; script và Claude Code kiểm tra khi nhập.

**Nội dung:**
- Câu hỏi và nhãn thẻ bẫy chỉ dựa trên giáo trình, *Toàn tập* và các nguồn tham chiếu ở mục 13.2. Không thêm sự kiện, năm, số liệu, trích dẫn không có nguồn.
- Power-up và thẻ bẫy mô tả hiệu ứng trò chơi bằng lời trung tính.
- Mỗi câu có `source.ref` (vd. `"GT tr. 85"`, `"HV-07"`). `verified: true` chỉ khi đã đối chiếu với giáo trình hoặc bản gốc; còn lại `false`.
- **Đáp án nhiễu không được là câu trích giả gán cho Hồ Chí Minh.** Dùng biến thể của khái niệm, đảo vai trò, nhầm trụ cột…

**Loại câu:**
- `single` — trắc nghiệm một đáp án.
- `truefalse` — đúng/sai.
- `fillQuote` — điền từ vào trích dẫn; trích dẫn phải có nguyên văn trong nguồn.
- `situation` — tình huống **giả định** trong đời sống sinh viên, không nêu sự kiện/số liệu thật.

**Số câu:** gần như mỗi lượt là một câu, nên mục tiêu **≥ 60 câu** (≈ 20 mỗi trụ cột).
- Độ khó 1 cho vòng chung; độ khó 2–3 cho đường về đích và câu về đích.
- Trụ cột thiếu tr. 92–93 (xem `todo` trong `mindmap.json`) cần nhóm bổ sung từ giáo trình.

**Mẫu `docs/CAU-HOI-GAME.md`:**
- Bảng Markdown, mỗi dòng một câu.
- Các cột: id · trụ cột · độ khó · loại · câu hỏi · đáp án A · đáp án B · đáp án C · đáp án D · đúng (A–D) · giải thích · nguồn · verified · hiện vật.
- Câu `truefalse` chỉ điền A = "Đúng", B = "Sai".
- Claude Code tạo file mẫu `docs/CAU-HOI-GAME.mau.md` kèm 2 dòng ví dụ (đánh dấu câu hỏi thử) và danh sách id trụ cột, id hiện vật hợp lệ.

**Định dạng `questions.json`:**

```json
{
  "id": "Q-01",
  "pillar": "<id trụ cột trong mindmap.json>",
  "artifact": "HV-07",
  "type": "single",
  "difficulty": 1,
  "question": "…",
  "answers": ["…", "…", "…", "…"],
  "correct": 0,
  "explanation": "…",
  "source": { "ref": "GT tr. …", "note": "…" },
  "verified": false
}
```

`artifact` là tùy chọn — ghi khi câu gắn với một hiện vật. Câu hỏi thử có thêm `"test": true`.

## 14. Dữ liệu (`src/data/`)

| File | Nội dung |
|---|---|
| `board.json` | Hai bố cục; từng ô: loại, trụ cột, độ khó; cổng và đường về đích của từng màu |
| `rules.json` | Tùy chọn luật và giá trị mặc định: giới hạn thời gian (mặc định 10 phút), đúng số về đích, ra chuồng 1/6, số ngựa, Đoán cùng (mặc định tắt), thời hạn tung/trả lời |
| `powerups.json` | Danh sách power-up, kiểu, hiệu ứng, tỉ lệ xuất hiện |
| `traps.json` | Hai loại thẻ bẫy (mất lượt / lùi ngẫu nhiên 1–3 ô), tỉ lệ, khoảng lùi, nhãn |
| `questions.json` | Kho câu hỏi (mục 13). Hiện là câu hỏi thử; thay bằng bộ câu hỏi của nhóm khi có |
| `bots.json` | Xác suất trả lời đúng theo độ khó, luật dùng power-up |
| `tokens.json` | Màu và ký hiệu ngựa |
| `site.json` | Chữ giao diện, tên game, thông điệp, `siteUrl` |
| `artifacts.json` | Dữ liệu khởi đầu chép từ nhánh web — hiện vật dùng cho chip "Hiện vật liên quan" |
| `mindmap.json` | Dữ liệu khởi đầu chép từ nhánh web — trụ cột và nội dung giáo trình tóm lược |
| `pillars.json` | Id, tên, màu trụ cột — lấy giá trị từ `pillars.ts` / `pillarStyles.ts` của nhánh web lúc tạo nhánh |
| `NGUON.md` | Ghi nguồn gốc dữ liệu khởi đầu: tên nhánh web, commit hash, danh sách file đã chép |

Sau khi chép, các file này **thuộc về game**: sửa trực tiếp trên nhánh `game` khi cần, không đồng bộ lại với web.

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
│   ├── CAU-HOI-GAME.md       ← bộ câu hỏi nhóm cung cấp (sau)
│   └── nguon/THIET-KE-WEB-APP.md   ← bản sao nguồn tham chiếu
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
  - State lưu `deadline` theo giờ server: tung, trả lời, bỏ qua người mất kết nối, bước của bot ~1,5 s.
  - Client đo độ lệch đồng hồ và đếm ngược.
  - Quá hạn thì **bất kỳ máy nào trong phòng** gửi TIMEOUT / AUTO_ROLL / SKIP_TURN / BOT_STEP; server chỉ nhận khi `now ≥ deadline`.
- **Nối lại:** `playerId` + `playerToken` lưu trên máy (localStorage, bọc try/catch). Tải lại trang → nhận snapshot đầy đủ, về đúng phòng.
- **Không lộ đáp án:** state gửi xuống máy người chơi không chứa đáp án đúng trước khi chốt câu.
- **Kiểm tra đầu vào:** biệt danh 1–20 ký tự, cắt khoảng trắng; giới hạn tần suất tạo phòng và gửi hành động; lỗi trả về thông báo tiếng Việt.
- `GET /api/health` để kiểm tra trước buổi chơi.
- **Tách lớp:** `server/` (test được không cần Vercel) và `api/` (lớp mỏng nối Vercel Functions).
- **Bí mật:** thông tin Redis chỉ ở biến môi trường phía server; có `.env.example`; không commit `.env`.
- **Chạy cục bộ:** server Node + Redis giả lập trong bộ nhớ (hoặc Redis thật qua `REDIS_URL`), không cần tài khoản Vercel.

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

### 15.6 Bản build

| Bản | Lệnh | Ghi chú |
|---|---|---|
| Online | `npm run build` (Vercel) | Giao diện + `api/`. Project Vercel riêng, nối repo `HCM202`, **Production Branch = `game`**, Root Directory = gốc nhánh. Không liệt kê công khai: meta robots, header `X-Robots-Tag: noindex`, `robots.txt` |
| Offline | `npm run build:offline` | Một file (vite-plugin-singlefile). **Chỉ "Chơi trên một máy"** (gồm chơi một mình, máy chơi cùng); ẩn Tạo/Vào phòng; không có request mạng |
| Gói nộp | `npm run package:offline` | `HCM202-Con-duong-tu-tuong.zip` kèm hướng dẫn chạy |

### 15.7 Khác
- **Âm thanh:** Web Audio API (oscillator), không file âm thanh — xúc xắc, bước đi, đúng/sai, power-up, bẫy, về đích; nút tắt/bật.
- **Quân cờ:** 5–6 con ngựa SVG tự vẽ, phân biệt bằng cả màu lẫn ký hiệu; máy chơi cùng có dấu riêng.
- **Icon:** SVG tự vẽ hoặc gói npm đóng gói sẵn (vd. lucide-react). Không icon font, không CDN, không Google Fonts.
- **Font:** tự host trong `src/assets/fonts` kèm giấy phép OFL (có thể chép bộ Be Vietnam Pro / Noto Serif từ nhánh web).
- **Mã QR:** gói `qrcode`.

### 15.8 Quy ước của nhánh `game` (ghi vào `CLAUDE.md` của nhánh)
- Trả lời và viết nội dung bằng **tiếng Việt**; commit message ngắn gọn bằng tiếng Việt.
- `docs/THIET-KE-GAME.md` là nguồn chuẩn duy nhất cho game; thay đổi đã duyệt thì cập nhật tài liệu trước rồi mới code.
- **Không tự thêm** sự kiện, số liệu, trích dẫn ngoài các nguồn ở mục 13; trường nào thiếu thì ghi `TODO`.
- **Không tự viết câu hỏi nội dung** về tư tưởng Hồ Chí Minh — bộ câu hỏi do nhóm cung cấp; trước đó chỉ dùng câu hỏi thử (mục 13.3).
- Nội dung về tư tưởng Hồ Chí Minh phải chính xác, có nguồn kèm số trang.
- Không tự lấy ảnh trên mạng khi chưa rõ bản quyền; không tự vẽ chân dung Bác.
- Nội dung nằm trong `src/data/*.json`, không viết cứng trong component.
- **Không gắn thống kê.** Tài nguyên bên ngoài duy nhất được phép: Vercel Functions + Redis (Vercel Marketplace) cho phòng chơi. Bản offline không có request mạng nào.
- Không commit lên nhánh web; không import mã hay dữ liệu từ nhánh web; không đồng bộ dữ liệu lại với web.
- Cập nhật `CLAUDE.md` và mục 18 sau mỗi mốc.

## 16. Giao diện

**Điện thoại dọc (≥ 360px):**
- Bàn cờ vừa chiều ngang; bảng người chơi gọn phía trên hoặc dưới.
- Nút Tung xúc xắc và nút đáp án ≥ 56px; trả lời không cần cuộn.

**Máy tính (1366–1920px):**
- Bàn cờ ở giữa; bảng người chơi và nhật ký bên cạnh.

**Khác:**
- **Trình duyệt nhúng Zalo/Messenger:** chạy được trong đó; tránh API không phổ biến; có phương án thay cho Web Share, rung, toàn màn hình.
- **Phong cách:** bản sắc riêng của game — bàn cờ cá ngựa vui mắt, màu tươi, đọc tốt trên điện thoại. Có thể dùng tông đỏ son – vàng đồng của bảo tàng số làm điểm nhấn, không bắt buộc.
- **Tiếp cận:** màu không phải tín hiệu duy nhất — mỗi loại ô có biểu tượng + nhãn; mỗi ngựa có cả màu lẫn ký hiệu; chữ đạt tương phản WCAG AA.
- **Phím tắt trên máy tính:** Space = tung / tiếp tục · 1–4 hoặc A–D = chọn đáp án · Q/W = dùng power-up 1/2 · M = tắt tiếng · F = toàn màn hình.
- **Hiệu ứng:** xúc xắc lăn, ngựa đi từng ô, ô đích nhấp nháy, ngựa trượt lùi khi dính bẫy, pháo giấy (canvas tự làm) khi về đích. Tắt khi `prefers-reduced-motion`.

## 17. Kiểm thử

### Engine
- **Đường đi:** đúng cho từng màu ở cả hai bố cục.
- **Luật cốt lõi:**
  - Ô câu hỏi: đúng → nhảy lên; sai/hết giờ → đứng yên.
  - Power-up/bẫy: nhảy lên rồi áp dụng.
  - Cổng: không hỏi.
  - Đích: câu về đích.
- **Di chuyển:**
  - Nhiều ngựa đứng chung một ô.
  - Vượt quá Đích ở cả hai luật.
  - Ra 6 tung thêm (tối đa một lần).
  - Hiệu ứng không dây chuyền.
- **Power-up:** từng loại; túi tối đa 2 món.
- **Bẫy:**
  - Chỉ ra hai loại thẻ theo tỉ lệ cấu hình.
  - Lùi ngẫu nhiên chỉ ra 1, 2 hoặc 3 ô, phân bố đều trên nhiều lần rút.
  - Mất lượt bỏ đúng một lượt.
  - Không lùi quá cổng.
  - Khiên chặn cả hai loại.
- **Tùy chọn luật:** ra chuồng 1/6; 2 ngựa; Đoán cùng khi bật không ảnh hưởng di chuyển và mặc định tắt.
- **Kết thúc:** người đầu tiên về đích thắng; chơi tiếp để xếp hạng; hết giờ (mặc định 10 phút) xếp theo khoảng cách; hòa.
- **Câu hỏi:** không lặp cho tới khi hết kho.
- **Tự động:** tự tung; tự xử lý khi mất kết nối; thử thách cá nhân đếm lượt.
- **Khác:** hoàn tác (chơi trên một máy); cùng seed → cùng kết quả (cả thẻ bẫy và bot).

### Dữ liệu
- id không trùng; 2–4 đáp án, không trùng nhau; `correct` hợp lệ.
- `pillar` có trong `mindmap.json`; `artifact` (nếu có) tồn tại; `source.ref` không rỗng.
- Câu `fillQuote` của bộ câu hỏi chính thức có trích dẫn nguyên văn trong nguồn.
- Mỗi màu có đường đi liền mạch tới Đích; số ô từng loại đúng cấu hình; mỗi trụ cột đủ câu ở mọi độ khó.
- `traps.json` chỉ có hai loại thẻ, tổng tỉ lệ 100%.
- **Câu hỏi thử:**
  - Mọi câu có id `TEST-` đều có `"test": true` và ngược lại.
  - Bộ câu hỏi thử phủ đủ trụ cột × độ khó.
  - Lệnh kiểm tra phát hành (`npm run check:release`, chạy ở G6) **báo lỗi nếu còn câu hỏi thử**.
- **Script nhập câu hỏi:**
  - Đọc đúng file mẫu.
  - Báo rõ dòng sai (thiếu cột, đáp án đúng không thuộc A–D, trụ cột không hợp lệ, thiếu nguồn).
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

### Lệnh kiểm tra cuối
`npm run test && npm run build && npm run build:offline && npm run lint` ở gốc nhánh `game`.

## 18. Lộ trình

| Mốc | Nội dung | Trạng thái |
|---|---|---|
| **G0 — Nhánh và rà soát** | Tạo nhánh mồ côi `game`; chép dữ liệu khởi đầu, nguồn tham chiếu và font từ nhánh web (ghi `NGUON.md`); tạo `CLAUDE.md` của nhánh; đối chiếu tài liệu này với dữ liệu; xác nhận nền tảng Vercel; ước lượng chi phí (15.5); tạo mẫu `docs/CAU-HOI-GAME.mau.md` để nhóm bắt đầu soạn câu hỏi; cập nhật mục 20. **Dừng chờ duyệt** | ☑ Xong 03/10/2026 — chờ nhóm duyệt (mục 20). Nhánh `game` đẩy được với đúng tên `game` |
| **G1 — Nền móng** | Khởi tạo dự án ở gốc nhánh, JSON + kiểu dữ liệu, **bộ câu hỏi thử** (13.3), script nhập câu hỏi, test dữ liệu, engine + bot + unit test, mô phỏng cân bằng (điền mục 11) | ☐ |
| **G2 — Chơi trên một máy** | Bàn cờ SVG, xúc xắc, ngựa đi từng ô, các loại ô, túi power-up, thẻ bẫy, bot, thử thách cá nhân + kỷ lục, lưu/tiếp tục ván, hoàn tác — chơi trọn ván | ☐ |
| **G3 — Server** | Tạo/vào phòng, sức chứa, chọn màu, hành động, bước bot, Redis, pub/sub, WebSocket + polling, nối lại, chuyển chủ phòng, `/api/health`; test server, mô phỏng tải, chạy cục bộ | ☐ |
| **G4 — Chơi qua phòng** | Trang chủ, tạo phòng, vào bằng mã / QR / link, phòng chờ, chơi qua mạng, trạng thái kết nối, mất kết nối, kết thúc + chơi lại, tùy chọn Đoán cùng | ☐ |
| **G5 — Hoàn thiện** | Ôn câu sai, thống kê, Kho câu hỏi, Luật chơi minh họa, Cài đặt, âm thanh, phím tắt, chỉnh giao diện, reduced motion | ☐ |
| **G6 — Phát hành** | Hướng dẫn tạo project Vercel (Production Branch = `game`) + gắn Redis (nhóm làm phần cần tài khoản), deploy preview, diễn tập, `npm run check:release` (không còn câu hỏi thử), bản offline, README, cập nhật `CLAUDE.md` | ☐ |

**Nhập bộ câu hỏi của nhóm** — làm bất cứ lúc nào nhóm gửi `docs/CAU-HOI-GAME.md`, không chờ mốc:
1. Chạy script nhập.
2. Đối chiếu nguồn (mục 13.1).
3. Báo các câu cần sửa.
4. Thay câu hỏi thử.
5. Chạy lại mô phỏng cân bằng.

**Danh sách diễn tập (G6):**
- ≥ 5 máy thật gồm điện thoại và laptop.
- Wi-Fi trường và 4G.
- Quét QR bằng Zalo; mở link trong Messenger.
- Phòng 1 người (có và không có máy chơi cùng) và phòng 5 người.

## 19. Đối chiếu tiêu chí chấm sản phẩm sáng tạo (10 điểm)

| Tiêu chí | Game đáp ứng bằng |
|---|---|
| Nội dung (3) | Gần như mỗi bước đi là một câu hỏi bám giáo trình, có giải thích + nguồn; chặng cuối câu khó dần; thẻ hiện vật; ôn lại câu sai |
| Ý tưởng (2) | Cờ cá ngựa quen thuộc được chuyển nghĩa: muốn tiến phải hiểu bài, sai thì đứng yên; đoạn đường theo trụ cột; power-up hỗ trợ trả lời |
| Hình thức (2) | Bàn cờ 6 nhánh rõ ràng trên cả điện thoại và máy tính, nút to, hiệu ứng vừa phải |
| Lan tỏa (2) | Ai cũng tạo phòng và mời bạn qua mã, QR hoặc link; chơi một mình để tự ôn; thông điệp "Chủ nhân không đứng ngoài" |
| Thái độ (1) | Tài liệu thiết kế, nguồn minh bạch, nhãn chờ xác minh, mô phỏng cân bằng, danh sách TODO |

**Buổi thuyết trình:** chế độ 5–7 phút làm mini game kết thúc (0,5 điểm "Khởi động + mini game"); lớp chia phòng ≤ 5 người, quét QR trên slide.

## 20. Việc còn mở

**Đã chốt (03/10/2026):**
- [x] Bàn cờ 6 nhánh, phòng tối đa 5 người.
- [x] Giới hạn thời gian mặc định 10 phút.
- [x] Đoán cùng tắt mặc định (vẫn là tùy chọn trong cài đặt phòng).
- [x] Thẻ bẫy chỉ có hai loại: mất lượt, hoặc lùi ngẫu nhiên 1–3 ô.
- [x] Không có luật đá ngựa.
- [x] Game là sản phẩm độc lập, làm trên nhánh `game` riêng; dữ liệu chép lúc tạo nhánh thuộc về game, không đồng bộ lại với web.
- [x] Bộ câu hỏi do nhóm cung cấp sau; trong lúc chờ dùng câu hỏi thử.

**Kết quả rà soát G0 (03/10/2026) — đối chiếu tài liệu này với dữ liệu đã chép:**

| Mục | Dữ liệu | Đối chiếu |
|---|---|---|
| Trụ cột | 3: `dan-chu`, `phap-quyen`, `trong-sach` (`mindmap.json`, `pillars.json`) | Khớp giả định 3 trụ cột (13.3). 6 nhánh chia đều 2 nhánh mỗi trụ cột (xem D1). Tên trụ cột có ở cả `mindmap.json` và `pillars.json`, hiện trùng khớp → đề xuất `pillars.json` là nguồn nhãn/tên/màu, test kiểm hai file khớp id và tên |
| Màu trụ cột | Đỏ son `#A4262C`, Xanh mực `#23395B`, Vàng đồng `#B8892B` (chữ trên nền sáng `#7A5A17`) | Trùng sắc với màu ngựa dễ nhầm (xem D6) |
| Hiện vật | 13 (HV-01 → HV-13), mọi `pillar` hợp lệ, mọi hiện vật `verified: true`, không có `hidden` | Phân bố dân chủ 5, pháp quyền 4, trong sạch 4. Chưa có ảnh. `sourceIds` trỏ tới `sources.json` của web — không được chép (xem N1) |
| `todo` trong `mindmap.json` | 1 mục, trụ cột `trong-sach`: giáo trình thiếu tr. 92–93 | Trụ cột này chỉ có 2 mục nội dung (dân chủ 5, pháp quyền 3) → khó đủ ~20 câu (xem N2) |
| Nhánh web | `CLAUDE.md` nằm ở `San-pham-sang-tao/web/CLAUDE.md`; không có `web/scripts/package-offline.mjs` — web hiện chỉ còn bản offline, script là `scripts/package.mjs` | Không ảnh hưởng game; game tự viết script đóng gói riêng |
| Cân bằng (ước tính thô) | Script tạm, **không phải mô phỏng chính thức G1**: bố cục Ngắn, xác suất đúng 70/50/35%, ~20 s/lượt, ván dừng khi người đầu tiên về đích | 1 người ~3,9 phút (trung vị 10 lượt) · 3 người ~8 phút, 84% ván xong ≤ 10 phút · 5 người ~11,7 phút, 42% xong ≤ 10 phút, **3% xong ≤ 5 phút**; dính bẫy ~0,8 lần/người; chuỗi đứng yên dài nhất ~3 lượt (xem T1) |

**Nhóm cần quyết** — mỗi mục có phương án Claude Code đề xuất (**in đậm**); nhóm đồng ý thì dùng làm mặc định, không thì ghi phương án khác. Duyệt xong mới làm G1.

*Bàn cờ:*
- [ ] **D1. Trụ cột của 6 nhánh.** Đề xuất: **lặp theo thứ tự trong `mindmap.json`** — nhánh 1–6 = dân chủ, pháp quyền, trong sạch, dân chủ, pháp quyền, trong sạch (tính từ dữ liệu: nhánh *i* → trụ cột *i* mod số trụ cột, không viết cứng). Cổng của màu trống thành ô câu hỏi độ khó 1 thuộc trụ cột của nhánh đó.
- [ ] **D2. Vị trí 2 power-up và 2 bẫy trên vòng chung.** 8 ô câu hỏi không chia đều cho 3 trụ cột. Đề xuất: **mỗi nhánh = [cổng, ô 2, ô 3]; power-up ở ô 3 nhánh 1 và nhánh 5, bẫy ở ô 3 nhánh 3 và nhánh 6** → ô câu hỏi: dân chủ 3, pháp quyền 3, trong sạch 2 (trụ cột ít nội dung nhất có ít ô câu hỏi nhất). Vị trí cuối chỉnh theo mô phỏng G1.
- [ ] **D3. Trụ cột và độ khó của đường về đích, Đích.** Thiết kế chưa nói ô về đích thuộc trụ cột nào. Đề xuất: **4 ô độ khó 2, 2, 3, 3; trụ cột xoay vòng bắt đầu từ trụ cột của nhánh có cổng người đó (vd. cổng ở nhánh pháp quyền → pháp quyền, trong sạch, dân chủ, pháp quyền); Đích: trụ cột ngẫu nhiên theo seed, độ khó 3.** Phương án khác: cả đường về đích theo trụ cột của nhánh mình.
- [ ] **D4. Bố cục Dài cụ thể.** Đề xuất: **vòng chung 24 ô = 6 cổng + 3 power-up + 3 bẫy + 12 câu hỏi; đường về đích 5 ô độ khó 2, 2, 3, 3, 3.**
- [ ] **D5. Quãng đường.** Đề xuất: **cổng (bước 0) → 17 ô vòng chung → rẽ vào đường về đích ở ô ngay trước cổng của mình → 4 ô về đích → Đích = 22 bước** (bố cục Dài: 23 + 5 + 1 = 29 bước). Khớp "khoảng 21–22 ô" ở mục 4.
- [ ] **D6. Màu ngựa khác màu trụ cột.** Bàn có 6 màu người chơi (cổng, đường về đích, ngựa) và 3 màu trụ cột (đoạn đường). Đề xuất: **ngựa dùng 6 màu tươi khác hẳn đỏ son / xanh mực / vàng đồng (vd. xanh lá, cam, tím, xanh ngọc, hồng, xanh dương sáng), mỗi màu một ký hiệu; ô câu hỏi hiện trụ cột bằng viền màu + biểu tượng và chữ viết tắt trụ cột**, không chỉ bằng màu.

*Luật — chi tiết thiếu:*
- [ ] **L1. Tiến 3 ô gần Đích.** Hiệu ứng không dây chuyền nên Tiến 3 ô tới Đích sẽ về đích không cần trả lời. Đề xuất: **Tiến 3 ô dừng tối đa ở ô cuối đường về đích; vào Đích luôn phải trả lời câu về đích.** Bẫy lùi đi lùi theo đường của người đó (có thể từ đường về đích ra vòng chung), không quá cổng.
- [ ] **L2. 50:50 với câu ít đáp án.** Câu `truefalse` chỉ có 2 đáp án, câu `single` có thể có 3. Đề xuất: **50:50 loại đáp án sai tới khi còn 2 (4 → 2, 3 → 2); câu 2 đáp án thì nút mờ, không mất power-up.**
- [ ] **L3. Xúc xắc ×2 và luật ra 6.** Đề xuất: **được tung thêm khi mặt xúc xắc là 6 (trước khi nhân đôi)**, không tính theo số sau khi nhân.
- [ ] **L4. Thử thách cá nhân và giới hạn giờ.** Đề xuất: **giữ mặc định 10 phút; kỷ lục (ít lượt nhất) chỉ lưu khi về đích; hết giờ thì báo số ô còn lại.**
- [ ] **L5. Lộ đáp án.** Bản online vẫn đóng gói `questions.json` (cho Kho câu hỏi và Chơi trên một máy), nên ai mở mã trang vẫn xem được đáp án; quy định "state không chứa đáp án" (15.4) chỉ chặn xem qua mạng. Đề xuất: **chấp nhận (game ôn tập), giữ quy định 15.4 và ẩn nút Kho câu hỏi khi đang ở trong phòng.** Phương án khác (tốn công hơn): bản online tải câu hỏi từ server, không đóng gói.

*Thời lượng trên lớp:*
- [ ] **T1. Mini game 5–7 phút và mặc định 10 phút.** Mục 1 và 19 dùng game 5–7 phút trên lớp; mặc định 10 phút đã chốt và không đổi. Theo ước tính thô, phòng 5 người chơi 5 phút gần như luôn kết thúc theo giờ (xếp theo số ô còn lại). Mức ~20 s/lượt cũng còn lạc quan (riêng đồng hồ trả lời đã 20 s). Đề xuất: **giữ mặc định 10 phút; trên lớp chủ phòng chọn 5 phút; màn kết thúc theo giờ vẫn tôn vinh người dẫn đầu; mô phỏng G1 chạy cả 20 s và 25 s/lượt.** Hỏi nhóm: có thêm mốc **7 phút** vào danh sách 5 / 10 / 15 / không giới hạn không?

*Dữ liệu và nội dung:*
- [ ] **N1. Thẻ hiện vật trong game.** `sourceIds` trỏ tới `sources.json` không được chép; chưa có ảnh. Đề xuất: **thẻ chỉ hiện mã, ngày, tên, trụ cột, câu chuyện, trích dẫn kèm `quote.cite` và ghi chú ngữ cảnh — không có ảnh, "Ngày nay" và danh sách nguồn APA; tôn trọng `hidden: true` (không hiện chip).** Nếu muốn hiện nguồn APA thì chép thêm `sources.json` (sửa mục 14 trước).
- [ ] **N2. Phân bổ câu hỏi.** Đề xuất: **mỗi trụ cột ≥ 10 câu độ khó 1, ≥ 6 câu độ khó 2, ≥ 4 câu độ khó 3** (đã ghi trong file mẫu). Trụ cột trong sạch ít nội dung: nếu không đủ 20 câu, có chấp nhận ít hơn không (D2 đã cho trụ cột này ít ô câu hỏi nhất)?
- [ ] **N3. Định dạng `fillQuote`.** Đề xuất: **đánh dấu chỗ trống bằng `___` trong cột câu hỏi; đáp án là từ/cụm từ điền vào** (đã ghi trong file mẫu).
- [ ] **N4. Nhãn thẻ bẫy (mục 7)** — chọn A hoặc B:
  - **A. Trung tính (mặc định):** "Bẫy — mất lượt" · "Bẫy — lùi {n} ô".
  - B. Gắn nội dung môn học; dòng hiệu ứng vẫn trung tính; chỉ dùng nguồn mục 13.2 có số trang. Nhóm đối chiếu lại với giáo trình / *Toàn tập* trước khi chọn:

    | Thẻ | Nhãn | Dòng hiệu ứng | Nguồn |
    |---|---|---|---|
    | Mất lượt | Cậy thế, cậy quyền | Bỏ lượt tiếp theo | t.4, tr.51 (HV-06); GT tr. 91 |
    | Lùi ngẫu nhiên | Chủ nghĩa cá nhân — "bệnh mẹ" | Lùi {n} ô | GT tr. 94–95 (`mindmap.json`, trụ cột trong sạch) |
    | Mất lượt (thêm, tùy chọn) | "Dĩ công vi tư" | Bỏ lượt tiếp theo | t.6, tr.127 (HV-10) |
    | Lùi ngẫu nhiên (thêm, tùy chọn) | Tham ô, lãng phí, quan liêu | Lùi {n} ô | GT tr. 82 (HV-13 — tóm ý, chưa có số trang *Toàn tập*) |

- [ ] Tên chính thức của game.

**Nội dung (nhóm cung cấp):**
- [ ] Soạn và gửi `docs/CAU-HOI-GAME.md` theo mẫu `docs/CAU-HOI-GAME.mau.md` (mục 13.4): mục tiêu ≥ 60 câu, đủ trụ cột và độ khó, mỗi câu có nguồn kèm số trang; nhớ phần giáo trình tr. 92–93.

**Hạ tầng (cần tài khoản nhóm):**
- [ ] Tạo project Vercel thứ hai, nối repo `HCM202`, Production Branch = `game`, Root Directory = gốc nhánh, Fluid Compute bật (mặc định).
- [ ] Gắn **Upstash for Redis** (gói Free) từ Vercel Marketplace (15.4, 15.5).
- [ ] Điền `siteUrl` của game.
- [ ] Đề xuất: deploy preview ngay sau G3 để thử WebSocket thật sớm, không đợi G6.

**Cần xác minh:**
- [x] Trạng thái WebSocket trên Vercel và cách chạy với Vite + `api/` — đã xác minh ở G0 (15.4).
- [x] Hạn mức miễn phí hiện hành của Vercel Hobby và gói Redis — đã ước lượng ở G0 (15.5).
- [ ] Trước G3: Upstash có tính mỗi tin pub/sub nhận được là một lệnh không; tên biến môi trường Marketplace đặt cho Redis (`REDIS_URL` / `KV_URL`…).
- [ ] Trên deploy preview: WebSocket qua `experimental_upgradeWebSocket` chạy được, đóng sau 300 giây, client tự nối lại.

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
