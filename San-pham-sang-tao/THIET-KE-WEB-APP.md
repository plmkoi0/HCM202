# THIẾT KẾ TỔNG QUÁT — WEB APP "CỦA DÂN · DO DÂN · VÌ DÂN"

> Sản phẩm sáng tạo HCM202 — Chủ đề 4: Tư tưởng Hồ Chí Minh về Nhà nước của nhân dân, do nhân dân, vì nhân dân.
> Tài liệu này là bản giao việc cho Claude Code. **Mọi nội dung học thuật trong web phải lấy từ tài liệu này hoặc do nhóm cung cấp. Claude Code không tự viết thêm sự kiện, số liệu, trích dẫn.**

---

## 1. Tổng quan

| Mục | Nội dung |
|---|---|
| Tên sản phẩm | **Của dân · Do dân · Vì dân — Bảo tàng số** |
| Thông điệp xuyên suốt | **"Chủ nhân không đứng ngoài"** |
| Hình thức | Web app tĩnh, một trang cuộn dài, chạy tốt trên điện thoại |
| Cấu trúc | Phần 1: Bảo tàng số (dòng thời gian hiện vật) → Phần 2: Quiz kiến thức "Bạn hiểu Nhà nước của dân đến đâu?" → Chia sẻ kết quả |
| Đối tượng | Sinh viên đại học |
| Nguồn chuẩn | Giáo trình HCM202, Chương IV, mục II (tr. 83–95) và *Hồ Chí Minh Toàn tập* (Nxb Chính trị quốc gia, 2011) |

### Mạch ý tưởng
Người xem đi qua các hiện vật lịch sử để thấy nhà nước "của dân, do dân, vì dân" được Bác xây dựng thế nào (quá khứ). Sau đó họ làm quiz kiến thức để kiểm tra mình hiểu tư tưởng ấy đến đâu; mỗi câu có giải thích theo giáo trình và dẫn về hiện vật liên quan (hiện tại). Cuối cùng họ nhận một thẻ kết quả để chia sẻ (lan tỏa).

### Đối chiếu với tiêu chí chấm SPST

| Tiêu chí | Web đáp ứng bằng |
|---|---|
| Nội dung (3đ) | Mỗi hiện vật và câu hỏi gắn với luận điểm giáo trình, có trích dẫn kèm số tập và số trang |
| Ý tưởng (2đ) | Kết hợp "bảo tàng" với "quiz kiến thức": trả lời xong thấy ngay đúng/sai, giải thích và hiện vật liên quan; phần "Ngày nay" của hiện vật gắn với đời sống sinh viên |
| Hình thức (2đ) | Phong cách hồ sơ lưu trữ: giấy ngà, con dấu đỏ, phiếu hiện vật |
| Lan tỏa (2đ) | Thẻ kết quả tải về được, link chia sẻ theo kết quả, bộ đếm lượt truy cập |
| Thái độ (1đ) | Trang "Nguồn tham khảo" theo APA7 và trang "Nhóm thực hiện" |

---

## 2. Khung lý thuyết (theo giáo trình)

Web tổ chức nội dung theo **3 trụ cột** của giáo trình. Mỗi hiện vật được gắn một nhãn trụ cột, có màu riêng.

### Trụ cột 1 — Nhà nước dân chủ (nhãn `dan-chu`, màu đỏ son)
- **Bản chất giai cấp**: mang bản chất giai cấp công nhân, thống nhất với tính nhân dân và tính dân tộc (GT tr. 83–84).
- **Của nhân dân**: "dân là chủ". Tất cả mọi quyền lực đều là của nhân dân (t.8, tr.262).
- **Do nhân dân**: "dân làm chủ". Dân bầu ra nhà nước; quyền làm chủ đi đôi với nghĩa vụ công dân (t.9, tr.258); phải có năng lực làm chủ (t.12, tr.527).
- **Vì nhân dân**: "Việc gì có lợi cho dân thì làm. Việc gì có hại cho dân thì phải tránh" (t.4, tr.21). Thước đo là được lòng dân (t.4, tr.52).
- **Dân chủ trực tiếp và gián tiếp**: quyền lực nhà nước là "thừa ủy quyền" của nhân dân; cán bộ là "công bộc" (t.4, tr.64–65); dân có quyền kiểm soát, phê bình, bãi miễn đại biểu (t.9, tr.81; t.12, tr.375; t.5, tr.75).

### Trụ cột 2 — Nhà nước pháp quyền (nhãn `phap-quyen`, màu xanh mực)
- **Hợp hiến, hợp pháp**: Yêu sách 1919, phiên họp Chính phủ 3/9/1945, Tổng tuyển cử 6/1/1946, Quốc hội khóa I (GT tr. 88–89).
- **Thượng tôn pháp luật**: làm tốt lập pháp (Hiến pháp 1946, 1959; 16 đạo luật, 613 sắc lệnh); đưa pháp luật vào cuộc sống; giáo dục pháp luật để dân "dám nói, dám làm" (t.15, tr.293); cán bộ gương mẫu "phụng công, thủ pháp, chí công, vô tư" (t.5, tr.473) (GT tr. 89–90).
- **Pháp quyền nhân nghĩa**: tôn trọng quyền con người; pháp luật nhân văn, khuyến thiện (t.6, tr.437) (GT tr. 90–91).

### Trụ cột 3 — Nhà nước trong sạch, vững mạnh (nhãn `trong-sach`, màu vàng đồng)
- **Kiểm soát quyền lực là tất yếu**: cán bộ có quyền dễ lạm quyền (t.4, tr.51); Đảng kiểm tra; nhân dân giám sát (GT tr. 91).
- **Phòng chống tiêu cực**: "bệnh mẹ" là chủ nghĩa cá nhân. Năm nhóm biện pháp: phát huy dân chủ; pháp luật, kỷ luật nghiêm minh, không có vùng cấm; lấy giáo dục làm chủ yếu; cán bộ nêu gương; huy động sức mạnh của lòng yêu nước (t.6, tr.127) (GT tr. 94–95).

> ⚠️ **Lưu ý cho nhóm:** file giáo trình tải lên thiếu **tr. 92–93** (phần cuối mục "Kiểm soát quyền lực" và phần đầu mục "Phòng, chống tiêu cực"). Nhóm cần bổ sung hai trang này trước khi chốt nội dung trụ cột 3.

---

## 3. Cấu trúc trang (một trang cuộn, có menu neo)

```
[Thanh điều hướng cố định: Bảo tàng · Quiz · Nguồn · Nhóm]

§0 HERO
   "Của dân. Do dân. Vì dân." (hiệu ứng đóng dấu đỏ)
   Phụ đề: "Chủ nhân không đứng ngoài"
   2 nút: [Vào bảo tàng] [Làm quiz ngay]

§1 LỜI DẪN (1 đoạn ngắn)
   Trích: "Trong Nhà nước Việt Nam Dân chủ Cộng hòa của chúng ta,
   tất cả mọi quyền lực đều là của nhân dân" (t.8, tr.262)

§2 BẢO TÀNG SỐ
   - Bộ lọc: [Tất cả] [Dân chủ] [Pháp quyền] [Trong sạch]
   - Dòng thời gian dọc, các phiếu hiện vật HV-01 → HV-13
   - Bấm phiếu → mở cửa sổ chi tiết gồm 3 khối:
       Câu chuyện · Bác nói gì · Ngày nay
   - Thanh tiến độ "Bạn đã xem 5/13 hiện vật"

§3 CẦU NỐI
   "Bác đã trao quyền làm chủ. Còn bạn dùng nó thế nào?" → [Bắt đầu quiz]

§4 QUIZ KIẾN THỨC "BẠN HIỂU NHÀ NƯỚC CỦA DÂN ĐẾN ĐÂU?"
   10 câu, mỗi câu 4 lựa chọn, 1 câu mỗi màn hình ("Câu x/10")
   Chọn xong: khóa câu, hiện Đúng/Chưa đúng + đáp án đúng + giải thích
   + chip hiện vật liên quan → [Câu tiếp theo] / [Xem kết quả]

§5 KẾT QUẢ
   - Điểm x/10 + tên mức + lời nhắn + "Chủ nhân không đứng ngoài"
   - [Tải thẻ kết quả] [Sao chép link] [Chia sẻ]
   - Danh sách câu chưa đúng (lựa chọn của bạn, đáp án đúng, giải thích)
   - [Xem lại tất cả] [Làm lại]

§6 SƠ ĐỒ TƯ DUY (tóm tắt 3 trụ cột, dạng cây mở/đóng được)

§7 NGUỒN THAM KHẢO (APA7)

§8 NHÓM THỰC HIỆN (tên, vai trò) — nhóm điền
```

---

## 4. Nội dung Bảo tàng số — danh sách hiện vật

Quy ước cột "Nguồn sự kiện":
- **GT tr.x**: có trong giáo trình, dùng được ngay.
- **Cần xác minh**: kiến thức lịch sử ngoài giáo trình. Nhóm phải đối chiếu với nguồn chính thống (Bảo tàng Hồ Chí Minh, Bảo tàng Lịch sử Quốc gia, Cổng TTĐT Quốc hội quochoi.vn, Thư viện pháp luật) và ghi nguồn APA7 trước khi đưa lên web. Trên bản web, các trường này hiển thị nhãn `[Chờ xác minh]` cho đến khi nhóm cập nhật.

| Mã | Thời gian | Hiện vật / tư liệu | Trụ cột | Câu nói của Bác (nguồn) | Ghi chú ngữ cảnh | Nguồn sự kiện |
|---|---|---|---|---|---|---|
| HV-01 | 18/6/1919 | *Yêu sách của nhân dân An Nam* gửi Hội nghị Véc-xây | pháp quyền | "Thay thế chế độ ra các sắc lệnh bằng chế độ ra các đạo luật" (t.1, tr.441) | — | GT tr.88; ngày 18/6/1919: Đặng Kim Oanh & Vũ Thị Ngọc Liên (2020) |
| HV-02 | 2/9/1945 | *Tuyên ngôn Độc lập* (soạn tại 48 Hàng Ngang, đọc tại Quảng trường Ba Đình) | dân chủ | "Nếu nước độc lập mà dân không hưởng hạnh phúc, tự do, thì độc lập cũng chẳng có nghĩa lý gì" (t.4, tr.64) | Trích *Thư gửi Ủy ban nhân dân các kỳ, tỉnh, huyện và làng* ngày 17/10/1945 (Chu Đức Tính, 2020; GT tr. 79), không phải lời văn trong bản Tuyên ngôn Độc lập. | Địa điểm, thời gian: Ban Quản lý di tích danh thắng Hà Nội (n.d.); GT tr.84 |
| HV-03 | 3/9/1945 | Phiên họp đầu tiên của Chính phủ lâm thời | pháp quyền | "Chúng ta phải có một hiến pháp dân chủ. Tôi đề nghị Chính phủ tổ chức càng sớm càng hay cuộc TỔNG TUYỂN CỬ với chế độ phổ thông đầu phiếu" (t.4, tr.7) | — | GT tr.88 |
| HV-04 | 8/9/1945 | Sắc lệnh số 14-SL về tổ chức Tổng tuyển cử | dân chủ | Dùng lại trích dẫn HV-03: "Chúng ta phải có một hiến pháp dân chủ. Tôi đề nghị Chính phủ tổ chức càng sớm càng hay cuộc TỔNG TUYỂN CỬ với chế độ phổ thông đầu phiếu" (t.4, tr.7) | Đề nghị của Bác tại phiên họp Chính phủ ngày 3/9/1945, năm ngày trước khi có Sắc lệnh này (GT tr. 88). | Chủ tịch Chính phủ lâm thời (1945), bản trên Thư viện Pháp luật |
| HV-05 | 17/10/1945 | Thư gửi Ủy ban nhân dân các kỳ, tỉnh, huyện và làng | dân chủ | Cán bộ là "công bộc" của dân, "gánh vác việc chung cho dân, chứ không phải để đè đầu dân" (t.4, tr.64–65) | _(không có ghi chú; câu trích có ở GT tr. 85)_ | Tên thư, ngày 17/10/1945: Chu Đức Tính (2020); GT tr.85 |
| HV-06 | 23/11/1945 | Sắc lệnh 64-SL thành lập Ban Thanh tra đặc biệt | trong sạch | "dân ghét các ông chủ tịch, các ông Ủy viên vì cái tật ngông nghênh, cậy thế, cậy quyền…" (t.4, tr.51) | Bác chỉ ra cán bộ nắm quyền có thể lạm quyền, vì thế cần kiểm soát quyền lực nhà nước (GT tr. 91); không phải lời văn trong Sắc lệnh 64-SL. | Toàn Thắng (2025); GT tr.91 |
| HV-07 | 6/1/1946 | Cuộc Tổng tuyển cử đầu tiên: lá phiếu, thẻ cử tri, ảnh cử tri xếp hàng | dân chủ | "Nước ta là nước dân chủ, nghĩa là nước nhà do nhân dân làm chủ" (t.9, tr.258) | Đây là "nhà nước do nhân dân", tức dân tự lập ra nhà nước bằng lá phiếu (GT tr. 86). | GT tr.88: phổ thông đầu phiếu, trực tiếp, bỏ phiếu kín, từ 18 tuổi, không phân biệt nam nữ, giàu nghèo, dân tộc, tôn giáo; lần đầu ở Đông Nam Á |
| HV-08 | 2/3/1946 | Phiên họp đầu tiên của Quốc hội khóa I | pháp quyền | "vì đồng bào ủy thác thì tôi phải gắng sức làm… Bao giờ đồng bào cho tôi lui, thì tôi rất vui lòng lui" (t.4, tr.187) | Bác nói về chức Chủ tịch nước của mình (GT tr. 79). | GT tr.88–89; địa điểm Nhà hát Lớn Hà Nội: Báo Điện tử Đảng Cộng sản Việt Nam (2019) |
| HV-09 | 9/11/1946 | *Hiến pháp 1946*, hiến pháp đầu tiên | pháp quyền | "Chính phủ Việt Nam sẽ tha thứ hay trừng trị họ theo luật pháp… Nhưng sẽ không có ai bị tàn sát" (t.6, tr.437) | Câu nói về cách đối xử với những kẻ phản bội Tổ quốc, minh họa pháp quyền nhân nghĩa (GT tr. 91); không phải lời văn trong Hiến pháp 1946. | GT tr.89; ngày thông qua, số phiếu, 7 chương 70 điều, Ngày Pháp luật 9/11: Infonet (2021), Quốc hội (1946) |
| HV-10 | 27/11/1946 | Sắc lệnh 223-SL về tội hối lộ, tham ô công quỹ | trong sạch | "có quyền mà thiếu lương tâm là có dịp đục khoét, có dịp ăn của đút, có dịp 'dĩ công vi tư'" (t.6, tr.127) | Câu nói về cán bộ có quyền mà thiếu lương tâm (GT tr. 94); không phải lời văn trong Sắc lệnh 223-SL. | Cổng Thông tin điện tử Chính phủ (n.d.); Nguyễn Đăng Luận (2007) |
| HV-11 | 10/1947 | Tác phẩm *Sửa đổi lối làm việc* | trong sạch | "muôn việc thành công hoặc thất bại đều do cán bộ tốt hoặc kém" (t.5, tr.280) | — | GT tr.78, 82; thời gian: Nguyễn Xuân Thắng (2017) |
| HV-12 | 1959 | *Hiến pháp 1959* | dân chủ | Lời nói đầu: "Nhà nước của ta là Nhà nước dân chủ nhân dân, dựa trên nền tảng liên minh công nông, do giai cấp công nhân lãnh đạo" (Hiến pháp 1959, Lời nói đầu; dẫn theo GT tr. 83) | — | GT tr.83, 89; ngày thông qua, công bố, 10 chương 112 điều: Cổng Thông tin điện tử Chính phủ (2025a) |
| HV-13 | 3/2/1969 | Bài báo *Nâng cao đạo đức cách mạng, quét sạch chủ nghĩa cá nhân* (báo Nhân Dân số 5409) | trong sạch | Tóm ý: một số cán bộ, đảng viên sa vào tham ô, lãng phí, quan liêu vì chủ nghĩa cá nhân | — | GT tr.82 |

Cột "Nguồn sự kiện" đã cập nhật theo `NOI-DUNG-BO-SUNG.md` (nhóm đã duyệt và kiểm chứng; mọi hiện vật `verified: true`). Nội dung "Câu chuyện", "Ngày nay", câu hỏi gợi mở của từng hiện vật nằm trong file đó và trong `artifacts.json`.

Cột "Ghi chú ngữ cảnh" tương ứng trường `quoteNote` trong `artifacts.json`, hiển thị dưới câu trích ở khối "Bác nói gì". Nội dung đã đối chiếu với giáo trình (bản PDF); "GT tr." là số trang giáo trình.

**Quy định hiển thị:**
- Bắt buộc có tối thiểu 8 hiện vật lúc nộp. Ưu tiên theo thứ tự: HV-02, 03, 05, 07, 08, 09, 11, 13.
- Ảnh: nhóm tự cung cấp, kèm tên nguồn. Nếu chưa có ảnh, dùng khung SVG giữ chỗ có dòng "Ảnh tư liệu — đang bổ sung". **Không tự lấy ảnh trên mạng khi chưa rõ bản quyền.**

### Mẫu nội dung một phiếu hiện vật (HV-07)
- **Câu chuyện** (tối đa 80 chữ): Ngày 6/1/1946, lần đầu tiên trong lịch sử, mọi người dân Việt Nam từ 18 tuổi trở lên, không phân biệt nam nữ, giàu nghèo, dân tộc, tôn giáo, được trực tiếp bỏ phiếu kín bầu Quốc hội. Đây cũng là lần đầu tiên ở Đông Nam Á có cuộc bầu cử như vậy (GT tr. 88).
- **Bác nói gì**: "Nước ta là nước dân chủ, nghĩa là nước nhà do nhân dân làm chủ" (Hồ Chí Minh, 2011, t.9, tr.258). Kèm một dòng giải thích: đây là "nhà nước do nhân dân", tức dân tự lập ra nhà nước bằng lá phiếu (GT tr. 86).
- **Ngày nay** (nhóm viết, tối đa 60 chữ, có nguồn): liên hệ với việc sinh viên lần đầu đi bầu. Câu hỏi gợi mở: "Lần bầu cử gần nhất, bạn đã tìm hiểu ứng cử viên chưa?"

Nhóm viết các phiếu còn lại theo đúng mẫu này. Claude Code chỉ dựng khung, điền phần có sẵn trong bảng, và để `TODO` ở các trường còn thiếu.

---

## 5. Quiz kiến thức "Bạn hiểu Nhà nước của dân đến đâu?"

> Đổi từ quiz tính cách sang quiz kiến thức ngày 2/10/2026 (nội dung: QUIZ-KIEN-THUC.md).

Câu hỏi, lựa chọn và giải thích (kèm số trang giáo trình) lấy nguyên văn từ `QUIZ-KIEN-THUC.md` (nhóm đã duyệt) vào `src/data/quiz.json`. Web chỉ dùng 10 câu chính; Câu 11, 12 là câu dự phòng, giữ trong file .md, không đưa vào web.

### 5.1 Cách chơi
- 10 câu, mỗi câu 4 lựa chọn, 1 đáp án đúng; một câu mỗi màn hình, có "Câu x/10" và thanh tiến độ.
- Thứ tự đáp án được trộn mỗi lượt và giữ cố định trong lượt đó (`correctIndex` tính theo thứ tự gốc). Lựa chọn không đánh chữ A–D.
- Chọn đáp án thì câu bị khóa: hiện "Đúng" / "Chưa đúng" (đặt trong vùng aria-live), tô đáp án đúng và đáp án đã chọn kèm ký hiệu ✓/✗ và nhãn chữ "Đáp án đúng", "Lựa chọn của bạn" (không dùng màu làm tín hiệu duy nhất); hiện giải thích và chip hiện vật liên quan (mở cửa sổ hiện vật, tính vào tiến độ "đã xem"). Sau đó mới có nút "Câu tiếp theo" / "Xem kết quả".
- Không có nút quay lại câu trước: câu đã trả lời không sửa lại được. Chuyển câu thì tiêu điểm về tiêu đề câu.

### 5.2 Mười câu hỏi

| Câu | Chủ đề | Trụ cột | Đáp án đúng | Hiện vật liên quan |
|---|---|---|---|---|
| 1 | Bản chất nhà nước | Dân chủ | Giai cấp công nhân | HV-12 |
| 2 | Nhà nước của nhân dân | Dân chủ | Nhân dân là chủ thể tối cao của mọi quyền lực | HV-02 |
| 3 | Nhà nước do nhân dân | Dân chủ | Quyền lợi và nghĩa vụ của nhân dân với tư cách người chủ | HV-07 |
| 4 | Hình thức dân chủ | Dân chủ | Dân chủ trực tiếp | HV-08 |
| 5 | Dân chủ gián tiếp | Dân chủ | "Thừa ủy quyền" của nhân dân | HV-05 |
| 6 | Nhà nước vì nhân dân | Dân chủ | Được lòng dân | HV-02 |
| 7 | Nhà nước hợp hiến, hợp pháp | Pháp quyền | Sớm tổ chức Tổng tuyển cử với chế độ phổ thông đầu phiếu để có hiến pháp dân chủ | HV-03 |
| 8 | Thượng tôn pháp luật | Pháp quyền | 16 đạo luật và 613 sắc lệnh | HV-09 |
| 9 | Pháp quyền nhân nghĩa | Pháp quyền | Nhà nước tôn trọng, bảo đảm đầy đủ các quyền con người, chăm lo lợi ích của mọi người | HV-09 |
| 10 | Phòng, chống tiêu cực | Trong sạch, vững mạnh | Nâng cao trình độ dân chủ, thực hành dân chủ rộng rãi, phát huy quyền làm chủ của nhân dân | HV-06 |

### 5.3 Mức xếp loại

| Điểm | Mức | id (dùng cho `?kq=`) | Lời nhắn |
|---|---|---|---|
| 9–10 | Chủ nhân am hiểu | `am-hieu` | Bạn nắm chắc tư tưởng Hồ Chí Minh về nhà nước của dân, do dân, vì dân. Hãy chia sẻ để bạn bè cùng thử! |
| 6–8 | Chủ nhân đang học | `dang-hoc` | Bạn đã hiểu phần lớn. Xem lại các câu chưa đúng và ghé hiện vật liên quan nhé. |
| 0–5 | Hãy ghé thêm bảo tàng | `ghe-bao-tang` | Quay lại Bảo tàng số, đọc các hiện vật rồi thử lại. Hiểu quyền làm chủ là bước đầu để dùng quyền ấy. |

Mọi mức đều kết bằng câu "Chủ nhân không đứng ngoài".

### 5.4 Cách tính điểm
- Mỗi câu đúng được 1 điểm, tổng 0–10.
- Mức xếp loại lấy theo `levels` trong `quiz.json` (khoảng min–max, phủ kín 0–10, không chồng lấn); không viết cứng ngưỡng trong code.
- Không lưu câu trả lời lên máy chủ; mọi xử lý chạy trên trình duyệt.

---

## 6. Lan tỏa và chia sẻ
- **Thẻ kết quả**: tạo ảnh PNG khổ 1080×1920 (vừa story) và 1080×1080 bằng `html-to-image`. Thẻ gồm tiêu đề quiz, điểm x/10, tên mức, thông điệp "Chủ nhân không đứng ngoài", tên web và mã QR dẫn về web.
- **Link theo kết quả**: `?kq=<id mức>` (`am-hieu`, `dang-hoc`, `ghe-bao-tang`). Khi mở link này, web hiện thẻ của mức đó (không có điểm cụ thể) kèm nút "Làm quiz của bạn". Giá trị `?kq` không hợp lệ bị bỏ qua.
- **Nút chia sẻ**: dùng Web Share API trên điện thoại; trên máy tính thì sao chép link.
- **Thẻ xem trước khi chia sẻ link**: thêm thẻ Open Graph (tiêu đề, mô tả, ảnh 1200×630).
- **Đếm lượt truy cập**: không gắn dịch vụ thống kê (thay đổi ở M5: bản online không liệt kê công khai, bản offline không có request mạng).

---

## 7. Thiết kế giao diện

**Phong cách**: "hồ sơ lưu trữ", trang trọng nhưng trẻ trung.

| Thành phần | Quy định |
|---|---|
| Màu nền | Giấy ngà `#F4EDE0`; chế độ tối `#1C1A17` |
| Màu chữ | Mực `#1F1B16` |
| Màu nhấn | Đỏ son `#A4262C` (dân chủ), Xanh mực `#23395B` (pháp quyền), Vàng đồng `#B8892B` (trong sạch) |
| Font tiêu đề | Noto Serif (hỗ trợ đầy đủ tiếng Việt) |
| Font nội dung | Be Vietnam Pro |
| Phiếu hiện vật | Dạng phiếu thư mục: mã HV-xx góc trên, năm lớn, nhãn trụ cột, viền răng cưa nhẹ |
| Hiệu ứng | Con dấu "đóng" ở hero; phiếu hiện ra dần khi cuộn; tôn trọng cài đặt `prefers-reduced-motion` |
| Bố cục | Ưu tiên điện thoại (từ 360px), lề 16px, không cuộn ngang |
| Khả năng tiếp cận | Tương phản đạt chuẩn WCAG AA, dùng được bằng bàn phím, ảnh có `alt` |

Không dùng hình ảnh nhân vật có bản quyền. Không tự vẽ chân dung Bác; chỉ dùng ảnh tư liệu do nhóm cung cấp kèm nguồn.

---

## 8. Kỹ thuật

- **Nền tảng**: Vite + React + TypeScript + Tailwind CSS. Web tĩnh, không có backend.
- **Dữ liệu tách khỏi code**, để nhóm sửa nội dung không cần động vào code:
  - `src/data/artifacts.json` — hiện vật
  - `src/data/quiz.json` — 10 câu hỏi kiến thức và các mức xếp loại
  - `src/data/sources.json` — nguồn APA7
  - `src/data/team.json` — thành viên
- **Triển khai**: GitHub Pages qua GitHub Actions (repo `HCM202` đã có sẵn trên GitHub). Phương án dự phòng: Vercel.
- **Thư viện**: `html-to-image` (tạo thẻ kết quả), `qrcode` (mã QR). Hạn chế thêm thư viện khác.

### Cấu trúc thư mục đề xuất
```
San-pham-sang-tao/
├── THIET-KE-WEB-APP.md        ← tài liệu này
└── web/
    ├── index.html
    ├── public/
    │   ├── images/artifacts/   ← ảnh tư liệu (HV-01.jpg …)
    │   └── og-image.png
    └── src/
        ├── data/ (artifacts.json, quiz.json, sources.json, team.json)
        ├── components/
        │   ├── Hero.tsx
        │   ├── Museum/ (Timeline.tsx, ArtifactCard.tsx, ArtifactModal.tsx, PillarFilter.tsx)
        │   ├── Quiz/ (Quiz.tsx, QuestionCard.tsx, Result.tsx, Review.tsx, RelatedChips.tsx, ShareActions.tsx, ShareCard.tsx)
        │   ├── MindMap.tsx
        │   ├── Sources.tsx
        │   └── Team.tsx
        ├── lib/scoring.ts
        └── App.tsx
```

### Cấu trúc dữ liệu

`artifacts.json` (mỗi phần tử):
```json
{
  "id": "HV-07",
  "date": "6/1/1946",
  "year": 1946,
  "title": "Cuộc Tổng tuyển cử đầu tiên",
  "pillar": "dan-chu",
  "image": { "src": "images/artifacts/HV-07.jpg", "alt": "…", "credit": "TODO: nguồn ảnh" },
  "story": "…",
  "quote": { "text": "…", "cite": "Hồ Chí Minh, 2011, t.9, tr.258" },
  "quoteNote": "…",
  "today": "TODO",
  "sourceIds": ["hcm-tt", "giao-trinh"],
  "verified": false,
  "hidden": false
}
```
Khi `verified: false`, phiếu hiện vật hiển thị nhãn nhỏ `[Chờ xác minh]`.

Trường tùy chọn `hidden` (phương án dự phòng khi nộp): đặt `"hidden": true` để tạm ẩn hiện vật chưa sẵn sàng. Bỏ trường này hoặc để `false` thì hiện vật hiển thị bình thường. Mặc định không ẩn hiện vật nào. Hiện vật ẩn không xuất hiện ở dòng thời gian, số đếm của bộ lọc, tổng tiến độ, nút Trước/Sau và chip "Hiện vật liên quan". Tiến độ "đã xem" chỉ đếm hiện vật đang hiển thị. Lúc nộp vẫn phải còn tối thiểu 8 hiện vật hiển thị (mục 4).

`quiz.json`:
```json
{
  "closing": "Chủ nhân không đứng ngoài",
  "levels": [{ "id": "am-hieu", "min": 9, "max": 10, "name": "…", "message": "…" }],
  "questions": [{ "id": "q1", "pillar": "dan-chu", "title": "…", "prompt": "…",
    "options": ["…", "…", "…", "…"], "correctIndex": 0, "explain": "…", "relatedArtifacts": ["HV-12"] }]
}
```

---

## 9. Nguồn tham khảo (APA7)

Dữ liệu trong `sources.json` (id trong ngoặc). Trang Nguồn xếp theo tên tác giả (`localeCompare('vi')`); nguồn web hiển thị URL là link mở tab mới.

- Ban Quản lý di tích danh thắng Hà Nội. (n.d.). *Di tích 48 phố Hàng Ngang – nơi Chủ tịch Hồ Chí Minh viết Tuyên ngôn Độc lập khai sinh nước Việt Nam Dân chủ Cộng hòa*. https://banqldtdthanoi.vn/di-tich-do-ban-quan-ly-truc-tiep/di-tich-ngoi-nha-48-hang-ngang-noi-ra-doi-tuyen-ngon-doc-lap/ (`bqldt-48-hang-ngang`)
- Báo Điện tử Đảng Cộng sản Việt Nam. (2019, ngày 4 tháng 10). *Kỳ họp thứ nhất của Quốc hội khoá I*. https://dangcongsan.vn/tu-lieu-tham-khao-cuoc-thi-trac-nghiem-tim-hieu-90-nam-lich-su-ve-vang-cua-dang-cong-san-viet-nam/tu-lieu-90-nam-lich-su-dang/ky-hop-thu-nhat-cua-quoc-hoi-khoa-i-538108.html (`dcsvn-2019`)
- Bộ Chính trị. (2016). *Chỉ thị số 05-CT/TW ngày 15/5/2016 về đẩy mạnh học tập và làm theo tư tưởng, đạo đức, phong cách Hồ Chí Minh*. Tư liệu văn kiện Đảng. https://tulieuvankien.dangcongsan.vn/he-thong-van-ban/van-ban-cua-dang/chi-thi-so-05-cttw-ngay-1552016-cua-bo-chinh-tri-ve-day-manh-hoc-tap-va-lam-theo-tu-tuong-dao-duc-phong-cach-ho-5005 (`ct-05-2016`)
- Bộ Chính trị. (2024). *Quy định số 144-QĐ/TW ngày 09/5/2024 về chuẩn mực đạo đức cách mạng của cán bộ, đảng viên trong giai đoạn mới*. Tư liệu văn kiện Đảng. https://tulieuvankien.dangcongsan.vn/he-thong-van-ban/van-ban-cua-dang/quy-dinh-so-144-qdtw-ngay-0952024-cua-bo-chinh-tri-ve-chuan-muc-dao-duc-cach-mang-cua-can-bo-dang-vien-trong-giai-doan-10415 (`qd-144-2024`)
- Chu Đức Tính. (2020, ngày 3 tháng 9). "Việc gì lợi cho dân, ta phải hết sức làm". *Báo Nhân Dân*. https://nhandan.vn/baothoinay-chinhtri-diemnhan/viec-gi-loi-cho-dan-ta-phai-het-suc-lam-615409/ (`chu-duc-tinh-2020`)
- Chủ tịch Chính phủ lâm thời. (1945). *Sắc lệnh số 14 ngày 8/9/1945 về việc mở cuộc tổng tuyển cử để bầu Quốc dân Đại hội*. Thư viện Pháp luật. https://thuvienphapluat.vn/van-ban/Bo-may-hanh-chinh/Sac-lenh-14-mo-cuoc-tong-tuyen-cu-bau-Quoc-dan-Dai-hoi-35858.aspx (`sl-14-1945`)
- Cổng Thông tin điện tử Chính phủ. (2025a, ngày 6 tháng 5). *Hiến pháp Việt Nam qua các thời kỳ*. https://xaydungchinhsach.chinhphu.vn/hien-phap-viet-nam-qua-cac-thoi-ky-119250506164837894.htm (`cp-2025-hien-phap`)
- Cổng Thông tin điện tử Chính phủ. (2025b, ngày 29 tháng 5). *Hướng dẫn thực hiện góp ý sửa đổi, bổ sung một số điều của Hiến pháp trên VNeID*. https://xaydungchinhsach.chinhphu.vn/huong-dan-thuc-hien-gop-y-sua-doi-bo-sung-mot-so-dieu-cua-hien-phap-tren-vneid-119250507153616593.htm (`cp-2025-vneid`)
- Cổng Thông tin điện tử Chính phủ. (n.d.). *Sắc lệnh số 223 của Chủ tịch nước: Sắc lệnh ấn định hình phạt tội đưa và nhận hối lộ*. https://chinhphu.vn/default.aspx?pageid=27160&docid=6000 (`sl-223-1946`)
- Đặng Kim Oanh, & Vũ Thị Ngọc Liên. (2020, ngày 17 tháng 11). Bản yêu sách của nhân dân An Nam 100 năm với những âm hưởng hào hùng. *Tạp chí Lịch sử Đảng*. https://tapchilichsudang.vn/ban-yeu-sach-cua-nhan-dan-an-nam-100-nam-voi-nhung-am-huong-hao-hung.html (`dang-kim-oanh-2020`)
- Hồ Chí Minh. (2011). *Toàn tập* (Tập 1–15). Nhà xuất bản Chính trị quốc gia. (`hcm-tt`)
  - Một mục chung cho bộ nhiều tập; không tách từng tập.
- Infonet. (2021, ngày 9 tháng 11). 75 năm ngày ra đời bản Hiến pháp 1946, 8 năm ngày Pháp luật Việt Nam: Khẳng định quyền lực thuộc về nhân dân. *Kiểm sát Online*. https://kiemsat.vn/75-nam-ngay-ra-doi-ban-hien-phap-1946-8-nam-ngay-phap-luat-viet-nam-khang-dinh-quyen-luc-thuoc-ve-nhan-dan-62664.html (`infonet-2021`)
- Nguyễn Đăng Luận. (2007, ngày 8 tháng 5). Bác Hồ và đạo luật chống tham nhũng đầu tiên. *Báo Công an Nhân dân*. https://cand.vn/Phong-su-tu-lieu/Bac-Ho-va-dao-luat-chong-tham-nhung-dau-tien-i42714 (`nguyen-dang-luan-2007`)
- Nguyễn Xuân Thắng. (2017, ngày 1 tháng 11). 70 năm tác phẩm "Sửa đổi lối làm việc": Vẹn nguyên giá trị lý luận và thực tiễn. *Báo Quân khu 7*. https://baoquankhu7.vn/70-nam-tac-pham-sua-doi-loi-lam-viec-ven-nguyen-gia-tri-ly-luan-va-thuc-tien--1208799921-006142s34510gs (`nguyen-xuan-thang-2017`)
- Phan Phương. (2026, ngày 21 tháng 3). Họp báo công bố kết quả bầu cử: Tỷ lệ cử tri tham gia bỏ phiếu cao nhất từ trước đến nay. *Bnews*. https://bnews.vn/hop-bao-cong-bo-ket-qua-bau-cu-ty-le-cu-tri-tham-gia-bo-phieu-cao-nhat-tu-truoc-den-nay/414779.html (`phan-phuong-2026`)
- Quốc hội nước Cộng hòa xã hội chủ nghĩa Việt Nam. (2013). *Hiến pháp nước Cộng hòa xã hội chủ nghĩa Việt Nam*. Thư viện Pháp luật. https://thuvienphapluat.vn/van-ban/Bo-may-hanh-chinh/Hien-phap-nam-2013-215627.aspx (`hp-2013`)
- Quốc hội nước Cộng hòa xã hội chủ nghĩa Việt Nam. (2018). *Luật Phòng, chống tham nhũng số 36/2018/QH14*. LuatVietnam. https://luatvietnam.vn/can-bo/luat-phong-chong-tham-nhung-2018-169348-d1.html (`luat-pctn-2018`)
- Quốc hội nước Việt Nam Dân chủ Cộng hòa. (1946). *Hiến pháp nước Việt Nam Dân chủ Cộng hòa năm 1946*. Thư viện Pháp luật. https://thuvienphapluat.vn/van-ban/Bo-may-hanh-chinh/Hien-phap-1946-Viet-Nam-Dan-Chu-Cong-Hoa-36134.aspx (`hp-1946`)
- Thu Hằng. (2025, ngày 16 tháng 6). Quốc hội thông qua Nghị quyết sửa đổi, bổ sung một số điều của Hiến pháp. *Báo Nhân Dân*. https://nhandan.vn/quoc-hoi-thong-qua-nghi-quyet-sua-doi-bo-sung-mot-so-dieu-cua-hien-phap-post887153.html (`thu-hang-2025`)
- Toàn Thắng. (2025, ngày 17 tháng 11). 80 năm Ngày truyền thống Thanh tra Việt Nam: Lực lượng nòng cốt trong đấu tranh, phòng, chống tham nhũng, tiêu cực. *Báo Điện tử Chính phủ*. https://baochinhphu.vn/80-nam-ngay-truyen-thong-thanh-tra-viet-nam-luc-luong-nong-cot-trong-dau-tranh-phong-chong-tham-nhung-tieu-cuc-102251117120525587.htm (`toan-thang-2025`)
- `TODO (nhóm điền)`: [Tác giả/Đơn vị biên soạn]. ([Năm]). *[Tên giáo trình Tư tưởng Hồ Chí Minh]* (tr. 72–98). [Nhà xuất bản/Trường]. (`giao-trinh`)
- `TODO`: nguồn cho từng ảnh.

Trích dẫn trong bài viết vẫn ghi số tập và số trang, theo dạng: (Hồ Chí Minh, 2011, t.4, tr.64–65).

---

## 10. Kế hoạch triển khai cho Claude Code

| Giai đoạn | Việc | Kết quả |
|---|---|---|
| M1 | Khởi tạo Vite + React + TS + Tailwind; tạo 4 file JSON từ mục 4, 5, 9; màu và font theo mục 7 | Chạy được local, có dữ liệu |
| M2 | Hero, bộ lọc, dòng thời gian, phiếu và cửa sổ chi tiết hiện vật, thanh tiến độ | Bảo tàng hoạt động đầy đủ |
| M3 | Quiz 10 câu kiến thức (ban đầu là quiz tính cách 8 câu, đổi ngày 2/10/2026 — xem mục 5), tính điểm và xếp mức (`scoring.ts` có unit test), trang kết quả, xem lại câu chưa đúng và toàn bộ | Quiz hoạt động đầy đủ |
| M4 | Thẻ kết quả PNG (điểm, mức), link `?kq=<id mức>`, Web Share, Open Graph, sơ đồ tư duy, trang nguồn và nhóm | Chia sẻ được |
| M5 | GitHub Actions để deploy lên Pages; tích hợp thống kê; kiểm tra trên điện thoại | Có link công khai |

### Tiêu chí nghiệm thu
- [ ] Hiển thị đúng ở màn hình 360px và 1440px; không cuộn ngang
- [ ] Bộ lọc 3 trụ cột lọc đúng hiện vật
- [ ] Mọi trích dẫn hiển thị kèm số tập và số trang
- [ ] Quiz tính đúng điểm và mức xếp loại, levels phủ kín 0–10 (có unit test)
- [ ] Thẻ kết quả tải về hiển thị đúng dấu tiếng Việt
- [ ] Link `?kq=dang-hoc` mở đúng thẻ mức "Chủ nhân đang học"
- [ ] Không có nội dung nào do Claude Code tự thêm ngoài tài liệu; chỗ thiếu ghi `TODO`
- [ ] Lighthouse trên điện thoại: Performance ≥ 85, Accessibility ≥ 90

---

## 11. Việc nhóm cần làm (không giao cho Claude Code)
1. Bổ sung giáo trình **tr. 92–93** và ghi chính xác tên, năm, nơi xuất bản giáo trình.
2. Xác minh các mục "Cần xác minh" ở mục 4 và ghi nguồn APA7.
3. Tìm ảnh tư liệu cho từng hiện vật, ghi rõ nguồn ảnh. Có thể tự chụp tại Bảo tàng Hồ Chí Minh hoặc 48 Hàng Ngang.
4. Viết phần "Ngày nay" cho từng hiện vật, có nguồn tin chính thống.
5. Đối chiếu mọi trích dẫn với bản gốc *Toàn tập*.
6. Điền `team.json`; đăng ký tài khoản thống kê; chạy thử quiz với 5–10 bạn và sửa câu chữ.

---

## 12. Prompt mẫu để giao cho Claude Code

```
Đọc CLAUDE.md và San-pham-sang-tao/THIET-KE-WEB-APP.md.
Thực hiện giai đoạn M1 và M2 theo mục 10: dựng web app trong San-pham-sang-tao/web/.
Chỉ dùng nội dung có trong tài liệu thiết kế; trường nào thiếu thì để "TODO",
không tự viết thêm sự kiện, số liệu hay trích dẫn.
Xong mỗi giai đoạn thì commit với message ngắn gọn bằng tiếng Việt và báo lại những gì còn TODO.
Sau mỗi giai đoạn, cập nhật CLAUDE.md: chủ đề, hình thức, thông điệp (theo mục 1),
cấu trúc thư mục hiện tại, giai đoạn đã xong, danh sách TODO còn lại,
và ghi quy ước "không tự thêm sự kiện, số liệu, trích dẫn ngoài tài liệu thiết kế".
```
