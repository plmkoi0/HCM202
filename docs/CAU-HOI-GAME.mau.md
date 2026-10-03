# MẪU BỘ CÂU HỎI — Con đường tư tưởng HCM

> File mẫu theo mục 13.4 của `docs/THIET-KE-GAME.md` (bản 1.6). File thật là `docs/CAU-HOI-GAME.md` (hiện 55 câu). Muốn thêm câu thì **thêm dòng mới vào bảng của file đó** (id tiếp theo, vd. `Q-56`), đúng 8 cột như dưới đây. Script `npm run import:questions` đọc bảng và chuyển sang `src/data/questions.json`; dòng nào sai định dạng được báo rõ số dòng, và `questions.json` không bị ghi đè khi còn lỗi.

## 1. Cách điền

1. **Mỗi dòng của bảng là một câu hỏi.** Giữ nguyên dòng tiêu đề và thứ tự 8 cột.
2. **Không xuống dòng trong một ô.** Nếu chữ có dấu `|` thì viết `\|`.
3. **Ô để trống** khi không dùng (đáp án C, D của câu 2 đáp án).
4. **Không có** cột trụ cột, giải thích, nguồn, xác minh, hiện vật (bản 1.6). Sau khi trả lời, game chỉ hiện Đúng / Sai và đáp án đúng. Nhóm biên soạn và chịu trách nhiệm về độ chính xác; nên tự lưu nguồn kèm số trang ở bản gốc của nhóm.
5. **Đáp án nhiễu không được là câu trích giả gán cho Hồ Chí Minh.**
6. **Không trùng câu:** script báo lỗi khi hai câu có cùng lời câu hỏi.
7. **Không chép 2 dòng ví dụ** (`TEST-…`) sang `docs/CAU-HOI-GAME.md`. Bộ câu hỏi chính thức không được có câu hỏi thử (script nhập báo lỗi).

## 2. Ý nghĩa từng cột

| Cột | Bắt buộc | Cách ghi |
|---|---|---|
| **id** | Có | `Q-01`, `Q-02`… không trùng nhau. Không dùng tiền tố `TEST-` (dành cho câu hỏi thử) |
| **độ khó** | Có | `1`, `2` hoặc `3`. Game rút câu ngẫu nhiên từ toàn bộ kho, các mức trộn lẫn suốt ván (mục 5); độ khó chỉ để hiện nhãn "Độ khó n", lọc Kho câu hỏi và tính xác suất đúng của máy chơi cùng. Giữ số câu ba mức gần bằng nhau (chênh nhau không quá 3 — script cảnh báo) |
| **câu hỏi** | Có | Lời câu hỏi. Câu điền từ: viết **đúng một** chỗ trống là `___` (3 dấu gạch dưới) |
| **đáp án A–D** | A, B bắt buộc | 2–4 đáp án, điền liền nhau từ A, không trùng nhau. Câu đúng/sai: A = `Đúng`, B = `Sai`, để trống C, D |
| **đúng** | Có | Một chữ `A`, `B`, `C` hoặc `D`, phải là đáp án đã điền. Game trộn thứ tự đáp án khi hiện |

**Loại câu — script tự suy ra, không cần cột riêng:**
- câu hỏi có `___` → câu điền từ (`fillQuote`);
- hai đáp án đúng là `Đúng`, `Sai` → câu đúng/sai (`truefalse`);
- còn lại → trắc nghiệm một đáp án (`single`).

## 3. Bảng câu hỏi

> Hai dòng dưới đây là **câu hỏi thử** (chỉ hỏi về luật chơi, không phải nội dung môn học) để minh họa cách điền. **Không chép hai dòng này sang file thật.**

| id | độ khó | câu hỏi | đáp án A | đáp án B | đáp án C | đáp án D | đúng |
|---|---|---|---|---|---|---|---|
| TEST-01 | 1 | [Câu hỏi thử] Trả lời sai ở ô câu hỏi thì ngựa của bạn đi đâu? | Đứng yên ở ô cũ | Lùi về cổng | Tiến 1 ô | Về chuồng | A |
| TEST-02 | 2 | [Câu hỏi thử] Trong game này, ngựa đi tới ô có ngựa khác sẽ đá ngựa đó về chuồng. | Đúng | Sai | | | B |
