# MẪU BỘ CÂU HỎI — Con đường tư tưởng HCM

> File mẫu theo mục 13.4 của `docs/THIET-KE-GAME.md`. Nhóm **chép file này thành `docs/CAU-HOI-GAME.md`**, xóa 2 dòng ví dụ, rồi điền câu hỏi của nhóm. Script `scripts/import-questions.mjs` sẽ đọc bảng ở mục "Bảng câu hỏi" và chuyển sang `src/data/questions.json`; dòng nào sai định dạng sẽ được báo rõ số dòng, và `questions.json` không bị ghi đè khi còn lỗi.

## 1. Cách điền (ngắn gọn)

1. **Mỗi dòng của bảng là một câu hỏi.** Giữ nguyên dòng tiêu đề và thứ tự 14 cột.
2. **Không xuống dòng trong một ô.** Nếu chữ có dấu `|` thì viết `\|`.
3. **Ô để trống** khi không dùng (đáp án C, D của câu đúng/sai; cột hiện vật nếu câu không gắn hiện vật).
4. **Nội dung chỉ dựa trên** giáo trình HCM202 (Chương IV, mục II, tr. 83–95), *Hồ Chí Minh Toàn tập* (Nxb Chính trị quốc gia, 2011) và các nguồn tham chiếu ở mục 13.2 (`docs/nguon/THIET-KE-WEB-APP.md`, `src/data/artifacts.json`, `src/data/mindmap.json`). Không thêm sự kiện, năm, số liệu, trích dẫn không có nguồn.
5. **Đáp án nhiễu không được là câu trích giả gán cho Hồ Chí Minh.** Dùng biến thể của khái niệm, đảo vai trò, nhầm trụ cột…
6. **Xóa 2 dòng ví dụ** (`TEST-…`) trước khi gửi. Bộ câu hỏi chính thức không được có câu hỏi thử.

## 2. Ý nghĩa từng cột

| Cột | Bắt buộc | Cách ghi |
|---|---|---|
| **id** | Có | `Q-01`, `Q-02`… không trùng nhau. Không dùng tiền tố `TEST-` (dành cho câu hỏi thử) |
| **trụ cột** | Có | Một id ở mục 3 (`dan-chu`, `phap-quyen`, `trong-sach`) |
| **độ khó** | Có | `1` (vòng chung), `2` hoặc `3` (đường về đích và câu về đích; `3` là khó nhất) |
| **loại** | Có | `single` (trắc nghiệm một đáp án) · `truefalse` (đúng/sai) · `fillQuote` (điền từ vào trích dẫn) · `situation` (tình huống giả định) |
| **câu hỏi** | Có | Lời câu hỏi. Câu `fillQuote`: viết trích dẫn với chỗ trống là `___` (3 dấu gạch dưới), vd. `"… ___ …"` |
| **đáp án A–D** | A, B bắt buộc | 2–4 đáp án, không trùng nhau. Câu `truefalse`: chỉ điền A = `Đúng`, B = `Sai`, để trống C, D. Câu `fillQuote`: mỗi đáp án là từ/cụm từ điền vào chỗ trống |
| **đúng (A–D)** | Có | Một chữ `A`, `B`, `C` hoặc `D`, phải là đáp án đã điền. Game sẽ trộn thứ tự đáp án khi hiện |
| **giải thích** | Có | 1–3 câu, hiện sau khi trả lời (vì sao đáp án đúng) |
| **nguồn** | Có | Kèm số trang, vd. `GT tr. 85`, `t.4, tr.64–65`, `HV-07` |
| **verified** | Có | `true` chỉ khi đã đối chiếu với giáo trình hoặc bản gốc *Toàn tập*; còn lại `false` (game hiện nhãn `[Chờ xác minh]`) |
| **hiện vật** | Không | Một id ở mục 4 nếu câu gắn với hiện vật (game hiện chip "Hiện vật liên quan"); để trống nếu không |

**Theo loại câu:**
- `fillQuote` — trích dẫn phải có **nguyên văn** trong nguồn ghi ở cột nguồn (Claude Code sẽ đối chiếu).
- `situation` — tình huống **giả định** trong đời sống sinh viên; không nêu sự kiện, số liệu thật.

**Số câu:** mục tiêu **≥ 60 câu**, khoảng 20 câu mỗi trụ cột. Đề xuất (chờ nhóm duyệt, mục 20) mỗi trụ cột: **≥ 10 câu độ khó 1, ≥ 6 câu độ khó 2, ≥ 4 câu độ khó 3**. Trụ cột `trong-sach` còn thiếu giáo trình tr. 92–93 (xem `todo` trong `mindmap.json`) — nhóm bổ sung từ giáo trình.

## 3. Id trụ cột hợp lệ

| id | Nhãn | Tên trụ cột |
|---|---|---|
| `dan-chu` | Dân chủ | Nhà nước dân chủ |
| `phap-quyen` | Pháp quyền | Nhà nước pháp quyền |
| `trong-sach` | Trong sạch | Nhà nước trong sạch, vững mạnh |

## 4. Id hiện vật hợp lệ

| id | Thời gian | Hiện vật | Trụ cột |
|---|---|---|---|
| `HV-01` | 18/6/1919 | Yêu sách của nhân dân An Nam | `phap-quyen` |
| `HV-02` | 2/9/1945 | Tuyên ngôn Độc lập | `dan-chu` |
| `HV-03` | 3/9/1945 | Phiên họp đầu tiên của Chính phủ lâm thời | `phap-quyen` |
| `HV-04` | 8/9/1945 | Sắc lệnh số 14-SL về tổ chức Tổng tuyển cử | `dan-chu` |
| `HV-05` | 17/10/1945 | Thư gửi Ủy ban nhân dân các kỳ, tỉnh, huyện và làng | `dan-chu` |
| `HV-06` | 23/11/1945 | Sắc lệnh 64-SL thành lập Ban Thanh tra đặc biệt | `trong-sach` |
| `HV-07` | 6/1/1946 | Cuộc Tổng tuyển cử đầu tiên | `dan-chu` |
| `HV-08` | 2/3/1946 | Phiên họp đầu tiên của Quốc hội khóa I | `phap-quyen` |
| `HV-09` | 9/11/1946 | Hiến pháp 1946 | `phap-quyen` |
| `HV-10` | 27/11/1946 | Sắc lệnh 223-SL về tội hối lộ, tham ô công quỹ | `trong-sach` |
| `HV-11` | 10/1947 | Sửa đổi lối làm việc | `trong-sach` |
| `HV-12` | 1959 | Hiến pháp 1959 | `dan-chu` |
| `HV-13` | 3/2/1969 | Nâng cao đạo đức cách mạng, quét sạch chủ nghĩa cá nhân | `trong-sach` |

Câu gắn hiện vật nên cùng trụ cột với hiện vật đó (không bắt buộc).

## 5. Bảng câu hỏi

> Hai dòng dưới đây là **câu hỏi thử** (chỉ hỏi về luật chơi, không phải nội dung môn học) để minh họa cách điền. **Xóa cả hai trước khi gửi.**

| id | trụ cột | độ khó | loại | câu hỏi | đáp án A | đáp án B | đáp án C | đáp án D | đúng (A–D) | giải thích | nguồn | verified | hiện vật |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TEST-01 | dan-chu | 1 | single | [Câu hỏi thử] Trả lời sai ở ô câu hỏi thì ngựa của bạn đi đâu? | Đứng yên ở ô cũ | Lùi về cổng | Tiến 1 ô | Về chuồng | A | Theo luật chơi của game: trả lời sai hoặc hết giờ thì ngựa đứng yên ở ô cũ. | Câu hỏi thử | false | |
| TEST-02 | trong-sach | 2 | truefalse | [Câu hỏi thử] Trong game này, ngựa đi tới ô có ngựa khác sẽ đá ngựa đó về chuồng. | Đúng | Sai | | | B | Game không có luật đá ngựa; nhiều ngựa được đứng chung một ô. | Câu hỏi thử | false | |
