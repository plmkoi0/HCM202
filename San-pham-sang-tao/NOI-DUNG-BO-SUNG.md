# NỘI DUNG BỔ SUNG — NHÁP CHỜ NHÓM DUYỆT

> Soạn ngày 28/9/2026 cho web "Của dân · Do dân · Vì dân — Bảo tàng số".
> Mọi dữ kiện đều lấy từ giáo trình (GT) hoặc nguồn chính thống có ghi ở mục 3. Đây là **bản nháp**: quy định môn học yêu cầu kiểm chứng thông tin và tự chịu trách nhiệm nội dung, nên nhóm cần mở nguồn để đối chiếu, sửa câu chữ theo lời của mình, rồi mới đánh dấu duyệt.

## Cách dùng

1. Đọc từng mục, mở nguồn tương ứng ở mục 3 để kiểm tra, sửa trực tiếp trong file này nếu cần.
2. Duyệt xong mục nào thì đổi `Duyệt: [ ]` thành `Duyệt: [x]`.
3. Giao cho Claude Code nhập vào web. Claude Code **chỉ nhập mục có `[x]`**, mục chưa duyệt giữ nguyên TODO.

Giới hạn độ dài theo tài liệu thiết kế: Câu chuyện ≤ 80 chữ, Ngày nay ≤ 60 chữ. Số chữ ghi trong ngoặc đã tính cả phần trích nguồn.

## 1. Lời dẫn (`site.json` → `intro.paragraph`)

Duyệt: [x]

> Theo Hồ Chí Minh, nhà nước của nhân dân là nhà nước mà tất cả mọi quyền lực trong nhà nước và trong xã hội đều thuộc về nhân dân (GT tr. 84). Bảo tàng số đưa bạn qua các hiện vật từ năm 1919 đến năm 1969 để thấy tư tưởng ấy trở thành một nhà nước dân chủ, pháp quyền, trong sạch, vững mạnh. Cuối hành trình là câu hỏi cho bạn: mình đang dùng quyền làm chủ thế nào?

## 2. Hiện vật (`artifacts.json`)

### HV-01 — Yêu sách của nhân dân An Nam (18/6/1919)

Duyệt: [x]

- **Câu chuyện** (79 chữ): Ngày 18/6/1919, Nguyễn Ái Quốc thay mặt Hội những người An Nam yêu nước gửi tới Hội nghị Véc-xây bản Yêu sách tám điểm (Đặng Kim Oanh & Vũ Thị Ngọc Liên, 2020). Yêu sách đòi người bản xứ được hưởng những bảo đảm về mặt pháp luật như người Âu châu, đòi thay chế độ ra các sắc lệnh bằng chế độ ra các đạo luật. Người sớm thấy tầm quan trọng của pháp luật (GT tr. 88).
- **Ngày nay** (46 chữ): Hiến pháp năm 2013 quy định Nhà nước "được tổ chức và hoạt động theo Hiến pháp và pháp luật, quản lý xã hội bằng Hiến pháp và pháp luật" (Quốc hội, 2013, Điều 8). Đòi hỏi năm 1919 nay đã thành nguyên tắc hiến định.
- **Câu hỏi gợi mở** (`todayPrompt`): Bạn đã từng đọc trọn một điều luật liên quan trực tiếp đến mình chưa?
- **Nguồn sự kiện** (`eventSource`): GT tr.88; ngày 18/6/1919: Đặng Kim Oanh & Vũ Thị Ngọc Liên (2020)
- **Thêm vào `sourceIds`**: `dang-kim-oanh-2020`, `hp-2013`
- **`verified`**: `true` (sau khi nhóm mở nguồn kiểm tra)

### HV-02 — Tuyên ngôn Độc lập (2/9/1945)

Duyệt: [x]

- **Câu chuyện** (77 chữ): Từ 25/8 đến 2/9/1945, Chủ tịch Hồ Chí Minh ở và làm việc tại tầng hai ngôi nhà 48 Hàng Ngang, Hà Nội, nơi Người viết bản Tuyên ngôn Độc lập. Ngày 2/9/1945, Người đọc Tuyên ngôn tại Quảng trường Ba Đình (Ban Quản lý di tích danh thắng Hà Nội, n.d.), khai sinh nước Việt Nam Dân chủ Cộng hòa, nhà nước dân chủ nhân dân đầu tiên ở Đông Nam châu Á (GT tr. 84).
- **Ngày nay** (46 chữ): Điều 3 Hiến pháp năm 2013 đặt mục tiêu "mọi người có cuộc sống ấm no, tự do, hạnh phúc, có điều kiện phát triển toàn diện" (Quốc hội, 2013). Độc lập phải gắn với hạnh phúc của người dân, đúng như lời Bác năm 1945.
- **Câu hỏi gợi mở** (`todayPrompt`): Với bạn, hạnh phúc của người dân được đo bằng những điều cụ thể nào?
- **Nguồn sự kiện** (`eventSource`): Địa điểm, thời gian: Ban Quản lý di tích danh thắng Hà Nội (n.d.); GT tr.84
- **Thêm vào `sourceIds`**: `bqldt-48-hang-ngang`, `giao-trinh`, `hp-2013`
- **`verified`**: `true` (sau khi nhóm mở nguồn kiểm tra)

### HV-03 — Phiên họp đầu tiên của Chính phủ lâm thời (3/9/1945)

Duyệt: [x]

- **Câu chuyện** (78 chữ): Ngày 3/9/1945, chỉ một ngày sau khi đọc Tuyên ngôn Độc lập, Hồ Chí Minh đề nghị tại phiên họp đầu tiên của Chính phủ lâm thời: phải có hiến pháp dân chủ và sớm tổ chức Tổng tuyển cử. Có Quốc hội do dân bầu, nước ta mới có cơ sở pháp lý vững chắc và một cơ chế quyền lực hợp pháp theo đúng thông lệ của nhà nước pháp quyền hiện đại (GT tr. 88).
- **Ngày nay** (57 chữ): Năm 2025, dự thảo sửa đổi, bổ sung một số điều của Hiến pháp được đưa ra lấy ý kiến Nhân dân từ 6/5 đến 29/5, có thể góp ý ngay trên ứng dụng VNeID; kết quả thu về 280.226.909 lượt ý kiến, 99,75% tán thành (Cổng Thông tin điện tử Chính phủ, 2025b; Thu Hằng, 2025).
- **Câu hỏi gợi mở** (`todayPrompt`): Bạn đã từng góp ý cho một dự thảo văn bản pháp luật chưa?
- **Nguồn sự kiện** (`eventSource`): GT tr.88
- **Thêm vào `sourceIds`**: `cp-2025-vneid`, `thu-hang-2025`
- **`verified`**: giữ nguyên

### HV-04 — Sắc lệnh số 14 về Tổng tuyển cử (8/9/1945)

Duyệt: [x]

- **Câu chuyện** (77 chữ): Ngày 8/9/1945, Sắc lệnh số 14 của Chủ tịch Chính phủ lâm thời quyết định mở cuộc Tổng tuyển cử bầu Quốc dân Đại hội trong thời hạn hai tháng. Sắc lệnh quy định: "Tất cả công dân Việt Nam, cả trai và gái, từ 18 tuổi trở lên, đều có quyền tuyển cử và ứng cử", trừ người bị tước công quyền và người trí óc không bình thường (Chủ tịch Chính phủ lâm thời, 1945).
- **Ngày nay** (37 chữ): Điều 27 Hiến pháp năm 2013 vẫn giữ mốc tuổi ấy: công dân đủ 18 tuổi có quyền bầu cử, đủ 21 tuổi có quyền ứng cử vào Quốc hội, Hội đồng nhân dân (Quốc hội, 2013).
- **Câu hỏi gợi mở** (`todayPrompt`): Bạn đã đủ tuổi bầu cử chưa, và đã dùng quyền ấy lần nào?
- **Câu trích đề xuất**: Dùng lại câu trích của HV-03 (t.4, tr.7) với quoteNote: "Đề nghị của Bác tại phiên họp Chính phủ ngày 3/9/1945, năm ngày trước khi có Sắc lệnh này (GT tr. 88)." Thêm "hcm-tt" và "giao-trinh" vào sourceIds.
- **Nguồn sự kiện** (`eventSource`): Chủ tịch Chính phủ lâm thời (1945), bản trên Thư viện Pháp luật
- **Thêm vào `sourceIds`**: `sl-14-1945`, `hp-2013`
- **`verified`**: `true` (sau khi nhóm mở nguồn kiểm tra)

### HV-05 — Thư gửi Ủy ban nhân dân các kỳ, tỉnh, huyện và làng (17/10/1945)

Duyệt: [x]

- **Câu chuyện** (80 chữ): Ngày 17/10/1945, Chủ tịch Hồ Chí Minh viết thư gửi Ủy ban nhân dân các kỳ, tỉnh, huyện và làng (Chu Đức Tính, 2020). Người nhắc cán bộ chính quyền mới rằng các cơ quan của Chính phủ, từ toàn quốc cho đến các làng, đều là "công bộc" của dân. Quyền lực nhà nước là do nhân dân ủy thác cho, nên cán bộ phải làm đầy tớ cho dân chứ không được đứng trên dân (GT tr. 85).
- **Ngày nay** (50 chữ): Điều 8 Hiến pháp năm 2013 yêu cầu cơ quan nhà nước, cán bộ, công chức, viên chức "tôn trọng Nhân dân, tận tụy phục vụ Nhân dân, liên hệ chặt chẽ với Nhân dân, lắng nghe ý kiến và chịu sự giám sát của Nhân dân" (Quốc hội, 2013).
- **Câu hỏi gợi mở** (`todayPrompt`): Lần gần nhất làm thủ tục hành chính, bạn có được phục vụ như một người chủ?
- **Nguồn sự kiện** (`eventSource`): Tên thư, ngày 17/10/1945: Chu Đức Tính (2020); GT tr.85
- **Thêm vào `sourceIds`**: `chu-duc-tinh-2020`, `giao-trinh`, `hp-2013`
- **`verified`**: `true` (sau khi nhóm mở nguồn kiểm tra)

### HV-06 — Sắc lệnh số 64/SL thành lập Ban Thanh tra đặc biệt (23/11/1945)

Duyệt: [x]

- **Câu chuyện** (67 chữ): Ngày 23/11/1945, Chủ tịch Hồ Chí Minh ký Sắc lệnh số 64/SL thành lập Ban Thanh tra đặc biệt, sự kiện đánh dấu sự ra đời của ngành Thanh tra Việt Nam (Toàn Thắng, 2025). Chỉ vài tháng sau ngày lập nước, Người đã thấy cán bộ nắm quyền có thể trở nên lạm quyền, vì thế phải kiểm soát quyền lực nhà nước (GT tr. 91).
- **Ngày nay** (41 chữ): Ngày 23/11 hằng năm là Ngày truyền thống Thanh tra Việt Nam. Năm 2025, kỷ niệm 80 năm, ngành Thanh tra được nhìn nhận là lực lượng nòng cốt trong đấu tranh phòng, chống tham nhũng, tiêu cực (Toàn Thắng, 2025).
- **Câu hỏi gợi mở** (`todayPrompt`): Ngoài cơ quan thanh tra, sinh viên có thể góp phần giám sát quyền lực bằng cách nào?
- **Nguồn sự kiện** (`eventSource`): Toàn Thắng (2025); GT tr.91
- **Thêm vào `sourceIds`**: `toan-thang-2025`, `giao-trinh`
- **`verified`**: `true` (sau khi nhóm mở nguồn kiểm tra)

### HV-07 — Cuộc Tổng tuyển cử đầu tiên (6/1/1946)

Duyệt: [x]

- **Câu chuyện**: giữ bản đang có.
- **Ngày nay** (47 chữ): Ngày 15/3/2026, cử tri cả nước bầu đại biểu Quốc hội khóa XVI và Hội đồng nhân dân các cấp nhiệm kỳ 2026–2031. Theo báo cáo sơ bộ, khoảng 76.198.214/76.423.940 cử tri đi bầu, đạt 99,7%, tỷ lệ cao nhất từ trước đến nay (Phan Phương, 2026).
- **Câu hỏi gợi mở** (`todayPrompt`): giữ bản đang có.
- **Thêm vào `sourceIds`**: `phan-phuong-2026`
- **`verified`**: giữ nguyên

### HV-08 — Phiên họp đầu tiên của Quốc hội khóa I (2/3/1946)

Duyệt: [x]

- **Câu chuyện** (75 chữ): Sáng 2/3/1946, tại Nhà hát Lớn Hà Nội, Quốc hội khóa I họp phiên đầu tiên với gần 300 đại biểu (Báo Điện tử Đảng Cộng sản Việt Nam, 2019). Quốc hội lập ra các tổ chức, bộ máy và chức vụ chính thức của Nhà nước; Hồ Chí Minh được bầu làm Chủ tịch Chính phủ liên hiệp đầu tiên. Từ đây, Chính phủ có đầy đủ tư cách pháp lý (GT tr. 88–89).
- **Ngày nay** (52 chữ): Điều 7 Hiến pháp năm 2013 quy định đại biểu Quốc hội, đại biểu Hội đồng nhân dân bị bãi nhiệm "khi không còn xứng đáng với sự tín nhiệm của Nhân dân" (Quốc hội, 2013). Lời Bác "bao giờ đồng bào cho tôi lui" nay đã thành cơ chế pháp lý.
- **Câu hỏi gợi mở** (`todayPrompt`): Bạn có biết đại biểu Quốc hội nào đại diện cho nơi mình cư trú?
- **Nguồn sự kiện** (`eventSource`): GT tr.88–89; địa điểm Nhà hát Lớn Hà Nội: Báo Điện tử Đảng Cộng sản Việt Nam (2019)
- **Thêm vào `sourceIds`**: `dcsvn-2019`, `hp-2013`
- **`verified`**: `true` (sau khi nhóm mở nguồn kiểm tra)

### HV-09 — Hiến pháp 1946 (9/11/1946)

Duyệt: [x]

- **Câu chuyện** (75 chữ): Ngày 9/11/1946, tại kỳ họp thứ hai, Quốc hội khóa I thông qua Hiến pháp đầu tiên của nước Việt Nam Dân chủ Cộng hòa với 240 phiếu thuận, 2 phiếu chống (Infonet, 2021). Hiến pháp gồm lời nói đầu, 7 chương, 70 điều; Điều thứ 1 ghi: "Nước Việt Nam là một nước dân chủ cộng hoà" (Quốc hội, 1946). Hồ Chí Minh tham gia lãnh đạo quá trình soạn thảo (GT tr. 89).
- **Ngày nay** (34 chữ): Luật Phổ biến, giáo dục pháp luật năm 2012 lấy ngày 9/11, ngày thông qua Hiến pháp năm 1946, làm Ngày Pháp luật nước Cộng hòa xã hội chủ nghĩa Việt Nam (Infonet, 2021).
- **Câu hỏi gợi mở** (`todayPrompt`): Ngày Pháp luật năm nay, bạn sẽ tìm hiểu một quy định nào?
- **Nguồn sự kiện** (`eventSource`): GT tr.89; ngày thông qua, số phiếu, 7 chương 70 điều, Ngày Pháp luật 9/11: Infonet (2021), Quốc hội (1946)
- **Thêm vào `sourceIds`**: `infonet-2021`, `hp-1946`
- **`verified`**: `true` (sau khi nhóm mở nguồn kiểm tra)

### HV-10 — Sắc lệnh số 223 về tội hối lộ (27/11/1946)

Duyệt: [x]

- **Câu chuyện** (71 chữ): Ngày 27/11/1946, Chủ tịch Hồ Chí Minh ký Sắc lệnh số 223 ấn định hình phạt tội đưa và nhận hối lộ (Cổng Thông tin điện tử Chính phủ, n.d.). Người phạm tội hối lộ, biển thủ công quỹ có thể bị phạt khổ sai từ 5 đến 20 năm, phạt tiền gấp đôi số tang vật và bị tịch thu tới ba phần tư gia sản (Nguyễn Đăng Luận, 2007).
- **Ngày nay** (50 chữ): Luật Phòng, chống tham nhũng số 36/2018/QH14, có hiệu lực từ 1/7/2019, quy định công dân có quyền phát hiện, phản ánh, tố cáo, tố giác, báo tin về hành vi tham nhũng (Quốc hội, 2018, Điều 5). Chống "giặc nội xâm" là việc của mọi người (GT tr. 81).
- **Câu hỏi gợi mở** (`todayPrompt`): Nếu bị đòi "bồi dưỡng" khi làm thủ tục, bạn biết phản ánh ở đâu?
- **Nguồn sự kiện** (`eventSource`): Cổng Thông tin điện tử Chính phủ (n.d.); Nguyễn Đăng Luận (2007)
- **Thêm vào `sourceIds`**: `sl-223-1946`, `nguyen-dang-luan-2007`, `luat-pctn-2018`, `giao-trinh`
- **`verified`**: `true` (sau khi nhóm mở nguồn kiểm tra)

### HV-11 — Sửa đổi lối làm việc (10/1947)

Duyệt: [x]

- **Câu chuyện** (71 chữ): Tháng 10/1947, Hồ Chí Minh viết tác phẩm Sửa đổi lối làm việc với bút danh X.Y.Z. Tác phẩm gồm 6 phần, bàn về chỉnh đốn Đảng trên các mặt chính trị, tư tưởng, tổ chức và đạo đức (Nguyễn Xuân Thắng, 2017). Người khẳng định cán bộ là gốc của mọi công việc, nên phải hiểu, huấn luyện, đề bạt và sử dụng cán bộ cho đúng (GT tr. 82).
- **Ngày nay** (54 chữ): Ngày 15/5/2016, Bộ Chính trị ban hành Chỉ thị số 05-CT/TW về đẩy mạnh học tập và làm theo tư tưởng, đạo đức, phong cách Hồ Chí Minh (Bộ Chính trị, 2016). Những yêu cầu về lối làm việc Bác nêu từ năm 1947 vẫn là chuẩn mực để cán bộ tự soi mình.
- **Câu hỏi gợi mở** (`todayPrompt`): Trong nhóm làm bài này, lối làm việc nào của chính chúng ta cần sửa?
- **Nguồn sự kiện** (`eventSource`): GT tr.78, 82; thời gian: Nguyễn Xuân Thắng (2017)
- **Thêm vào `sourceIds`**: `nguyen-xuan-thang-2017`, `ct-05-2016`
- **`verified`**: `true` (sau khi nhóm mở nguồn kiểm tra)

### HV-12 — Hiến pháp 1959

Duyệt: [x]

- **Câu chuyện** (73 chữ): Ngày 31/12/1959, Quốc hội thông qua Hiến pháp mới gồm 10 chương, 112 điều; Hiến pháp được công bố ngày 1/1/1960 (Cổng Thông tin điện tử Chính phủ, 2025a). Đây là lần thứ hai Hồ Chí Minh tham gia lãnh đạo soạn thảo Hiến pháp (GT tr. 89). Lời nói đầu khẳng định bản chất giai cấp công nhân của Nhà nước, dựa trên nền tảng liên minh công nông (GT tr. 83).
- **Ngày nay** (56 chữ): Điều 2 Hiến pháp năm 2013 khẳng định Nhà nước ta là "nhà nước pháp quyền xã hội chủ nghĩa của Nhân dân, do Nhân dân, vì Nhân dân"; tất cả quyền lực nhà nước thuộc về Nhân dân, nền tảng là liên minh công nhân, nông dân và đội ngũ trí thức (Quốc hội, 2013).
- **Câu hỏi gợi mở** (`todayPrompt`): Vì sao đội ngũ trí thức được nhắc tới trong nền tảng của quyền lực nhà nước?
- **Nguồn sự kiện** (`eventSource`): GT tr.83, 89; ngày thông qua, công bố, 10 chương 112 điều: Cổng Thông tin điện tử Chính phủ (2025a)
- **Thêm vào `sourceIds`**: `cp-2025-hien-phap`, `hp-2013`
- **`verified`**: giữ nguyên

### HV-13 — Nâng cao đạo đức cách mạng, quét sạch chủ nghĩa cá nhân (3/2/1969)

Duyệt: [x]

- **Câu chuyện** (75 chữ): Ngày 3/2/1969, báo Nhân Dân số 5409 đăng bài Nâng cao đạo đức cách mạng, quét sạch chủ nghĩa cá nhân, viết trong những tháng cuối đời của Hồ Chí Minh. Sau khi nêu ưu điểm của đảng viên, Người chỉ ra "còn một số ít cán bộ, đảng viên mà đạo đức, phẩm chất còn thấp kém", mang nặng chủ nghĩa cá nhân, sa vào tham ô, lãng phí, quan liêu (GT tr. 82).
- **Ngày nay** (49 chữ): Ngày 9/5/2024, Bộ Chính trị ban hành Quy định số 144-QĐ/TW về chuẩn mực đạo đức cách mạng của cán bộ, đảng viên trong giai đoạn mới (Bộ Chính trị, 2024). Cuộc đấu tranh với chủ nghĩa cá nhân mà Bác cảnh báo năm 1969 vẫn đang tiếp diễn.
- **Câu hỏi gợi mở** (`todayPrompt`): Chủ nghĩa cá nhân có thể lộ ra thế nào khi làm việc nhóm ở lớp?
- **Thêm vào `sourceIds`**: `qd-144-2024`
- **`verified`**: giữ nguyên

### Ghi chú ngữ cảnh chính xác hơn cho HV-02 (tùy chọn)

Duyệt: [x]

Thay `quoteNote` của HV-02 bằng: "Trích *Thư gửi Ủy ban nhân dân các kỳ, tỉnh, huyện và làng* ngày 17/10/1945 (Chu Đức Tính, 2020; GT tr. 79), không phải lời văn trong bản Tuyên ngôn Độc lập." Câu này và câu "công bộc" của HV-05 nằm trong cùng một bức thư.

## 3. Nguồn mới cho `sources.json` (APA7)

Xếp theo thứ tự chữ cái của tác giả. Cột trái là `id` dùng trong `sourceIds`.

| id | Trích dẫn APA7 |
|---|---|
| `bqldt-48-hang-ngang` | Ban Quản lý di tích danh thắng Hà Nội. (n.d.). *Di tích 48 phố Hàng Ngang – nơi Chủ tịch Hồ Chí Minh viết Tuyên ngôn Độc lập khai sinh nước Việt Nam Dân chủ Cộng hòa*. https://banqldtdthanoi.vn/di-tich-do-ban-quan-ly-truc-tiep/di-tich-ngoi-nha-48-hang-ngang-noi-ra-doi-tuyen-ngon-doc-lap/ |
| `dcsvn-2019` | Báo Điện tử Đảng Cộng sản Việt Nam. (2019, ngày 4 tháng 10). *Kỳ họp thứ nhất của Quốc hội khoá I*. https://dangcongsan.vn/tu-lieu-tham-khao-cuoc-thi-trac-nghiem-tim-hieu-90-nam-lich-su-ve-vang-cua-dang-cong-san-viet-nam/tu-lieu-90-nam-lich-su-dang/ky-hop-thu-nhat-cua-quoc-hoi-khoa-i-538108.html |
| `ct-05-2016` | Bộ Chính trị. (2016). *Chỉ thị số 05-CT/TW ngày 15/5/2016 về đẩy mạnh học tập và làm theo tư tưởng, đạo đức, phong cách Hồ Chí Minh*. Tư liệu văn kiện Đảng. https://tulieuvankien.dangcongsan.vn/he-thong-van-ban/van-ban-cua-dang/chi-thi-so-05-cttw-ngay-1552016-cua-bo-chinh-tri-ve-day-manh-hoc-tap-va-lam-theo-tu-tuong-dao-duc-phong-cach-ho-5005 |
| `qd-144-2024` | Bộ Chính trị. (2024). *Quy định số 144-QĐ/TW ngày 09/5/2024 về chuẩn mực đạo đức cách mạng của cán bộ, đảng viên trong giai đoạn mới*. Tư liệu văn kiện Đảng. https://tulieuvankien.dangcongsan.vn/he-thong-van-ban/van-ban-cua-dang/quy-dinh-so-144-qdtw-ngay-0952024-cua-bo-chinh-tri-ve-chuan-muc-dao-duc-cach-mang-cua-can-bo-dang-vien-trong-giai-doan-10415 |
| `chu-duc-tinh-2020` | Chu Đức Tính. (2020, ngày 3 tháng 9). "Việc gì lợi cho dân, ta phải hết sức làm". *Báo Nhân Dân*. https://nhandan.vn/baothoinay-chinhtri-diemnhan/viec-gi-loi-cho-dan-ta-phai-het-suc-lam-615409/ |
| `sl-14-1945` | Chủ tịch Chính phủ lâm thời. (1945). *Sắc lệnh số 14 ngày 8/9/1945 về việc mở cuộc tổng tuyển cử để bầu Quốc dân Đại hội*. Thư viện Pháp luật. https://thuvienphapluat.vn/van-ban/Bo-may-hanh-chinh/Sac-lenh-14-mo-cuoc-tong-tuyen-cu-bau-Quoc-dan-Dai-hoi-35858.aspx |
| `sl-223-1946` | Cổng Thông tin điện tử Chính phủ. (n.d.). *Sắc lệnh số 223 của Chủ tịch nước: Sắc lệnh ấn định hình phạt tội đưa và nhận hối lộ*. https://chinhphu.vn/default.aspx?pageid=27160&docid=6000 |
| `cp-2025-hien-phap` | Cổng Thông tin điện tử Chính phủ. (2025a, ngày 6 tháng 5). *Hiến pháp Việt Nam qua các thời kỳ*. https://xaydungchinhsach.chinhphu.vn/hien-phap-viet-nam-qua-cac-thoi-ky-119250506164837894.htm |
| `cp-2025-vneid` | Cổng Thông tin điện tử Chính phủ. (2025b, ngày 29 tháng 5). *Hướng dẫn thực hiện góp ý sửa đổi, bổ sung một số điều của Hiến pháp trên VNeID*. https://xaydungchinhsach.chinhphu.vn/huong-dan-thuc-hien-gop-y-sua-doi-bo-sung-mot-so-dieu-cua-hien-phap-tren-vneid-119250507153616593.htm |
| `dang-kim-oanh-2020` | Đặng Kim Oanh, & Vũ Thị Ngọc Liên. (2020, ngày 17 tháng 11). Bản yêu sách của nhân dân An Nam 100 năm với những âm hưởng hào hùng. *Tạp chí Lịch sử Đảng*. https://tapchilichsudang.vn/ban-yeu-sach-cua-nhan-dan-an-nam-100-nam-voi-nhung-am-huong-hao-hung.html |
| `infonet-2021` | Infonet. (2021, ngày 9 tháng 11). 75 năm ngày ra đời bản Hiến pháp 1946, 8 năm ngày Pháp luật Việt Nam: Khẳng định quyền lực thuộc về nhân dân. *Kiểm sát Online*. https://kiemsat.vn/75-nam-ngay-ra-doi-ban-hien-phap-1946-8-nam-ngay-phap-luat-viet-nam-khang-dinh-quyen-luc-thuoc-ve-nhan-dan-62664.html |
| `nguyen-dang-luan-2007` | Nguyễn Đăng Luận. (2007, ngày 8 tháng 5). Bác Hồ và đạo luật chống tham nhũng đầu tiên. *Báo Công an Nhân dân*. https://cand.vn/Phong-su-tu-lieu/Bac-Ho-va-dao-luat-chong-tham-nhung-dau-tien-i42714 |
| `nguyen-xuan-thang-2017` | Nguyễn Xuân Thắng. (2017, ngày 1 tháng 11). 70 năm tác phẩm "Sửa đổi lối làm việc": Vẹn nguyên giá trị lý luận và thực tiễn. *Báo Quân khu 7*. https://baoquankhu7.vn/70-nam-tac-pham-sua-doi-loi-lam-viec-ven-nguyen-gia-tri-ly-luan-va-thuc-tien--1208799921-006142s34510gs |
| `phan-phuong-2026` | Phan Phương. (2026, ngày 21 tháng 3). Họp báo công bố kết quả bầu cử: Tỷ lệ cử tri tham gia bỏ phiếu cao nhất từ trước đến nay. *Bnews*. https://bnews.vn/hop-bao-cong-bo-ket-qua-bau-cu-ty-le-cu-tri-tham-gia-bo-phieu-cao-nhat-tu-truoc-den-nay/414779.html |
| `hp-2013` | Quốc hội nước Cộng hòa xã hội chủ nghĩa Việt Nam. (2013). *Hiến pháp nước Cộng hòa xã hội chủ nghĩa Việt Nam*. Thư viện Pháp luật. https://thuvienphapluat.vn/van-ban/Bo-may-hanh-chinh/Hien-phap-nam-2013-215627.aspx |
| `luat-pctn-2018` | Quốc hội nước Cộng hòa xã hội chủ nghĩa Việt Nam. (2018). *Luật Phòng, chống tham nhũng số 36/2018/QH14*. LuatVietnam. https://luatvietnam.vn/can-bo/luat-phong-chong-tham-nhung-2018-169348-d1.html |
| `hp-1946` | Quốc hội nước Việt Nam Dân chủ Cộng hòa. (1946). *Hiến pháp nước Việt Nam Dân chủ Cộng hòa năm 1946*. Thư viện Pháp luật. https://thuvienphapluat.vn/van-ban/Bo-may-hanh-chinh/Hien-phap-1946-Viet-Nam-Dan-Chu-Cong-Hoa-36134.aspx |
| `thu-hang-2025` | Thu Hằng. (2025, ngày 16 tháng 6). Quốc hội thông qua Nghị quyết sửa đổi, bổ sung một số điều của Hiến pháp. *Báo Nhân Dân*. https://nhandan.vn/quoc-hoi-thong-qua-nghi-quyet-sua-doi-bo-sung-mot-so-dieu-cua-hien-phap-post887153.html |
| `toan-thang-2025` | Toàn Thắng. (2025, ngày 17 tháng 11). 80 năm Ngày truyền thống Thanh tra Việt Nam: Lực lượng nòng cốt trong đấu tranh, phòng, chống tham nhũng, tiêu cực. *Báo Điện tử Chính phủ*. https://baochinhphu.vn/80-nam-ngay-truyen-thong-thanh-tra-viet-nam-luc-luong-nong-cot-trong-dau-tranh-phong-chong-tham-nhung-tieu-cuc-102251117120525587.htm |

## 4. Ghi chú cho nhóm

- **Câu "công bộc" (HV-05) có hai dị bản.** Giáo trình (tr. 85) viết "gánh **vác** việc chung cho dân", còn bài của Chu Đức Tính (2020) trên báo Nhân Dân viết "gánh việc chung cho dân". Web đang theo giáo trình. Nhóm nên đối chiếu *Toàn tập* t.4, tr.64–65 để chốt.
- **Số liệu bầu cử 2026 (HV-07) là số sơ bộ** do Hội đồng Bầu cử quốc gia công bố ngày 21/3/2026 ("khoảng 76.198.214/76.423.940 cử tri, đạt 99,7%"). Nếu tìm được báo cáo chính thức sau đó, nhóm thay số và nguồn.
- **Người ký Sắc lệnh số 14 (HV-04).** Bản trên Thư viện Pháp luật ghi người ký là Võ Nguyên Giáp (Bộ trưởng Nội vụ), trong khi nhiều bài viết nói Chủ tịch Hồ Chí Minh ký. Bản nháp tránh nêu tên người ký, chỉ ghi "Sắc lệnh số 14 của Chủ tịch Chính phủ lâm thời" đúng như tên văn bản.
- **Điều 2, 3, 7, 8, 27 Hiến pháp 2013** dùng trong phần "Ngày nay" không bị sửa bởi Nghị quyết 203/2025/QH15 (Nghị quyết chỉ sửa Điều 9, 10, 84, 110, 111).
- **Vẫn còn thiếu (nhóm tự bổ sung):** thông tin xuất bản của giáo trình (file PDF không có trang bìa), giáo trình tr. 92–93, ảnh tư liệu kèm nguồn. Ảnh an toàn nhất là ảnh nhóm tự chụp tại Di tích 48 Hàng Ngang hoặc Bảo tàng Hồ Chí Minh; nếu dùng ảnh trên mạng phải ghi rõ nguồn và giấy phép.
