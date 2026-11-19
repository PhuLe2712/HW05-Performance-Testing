# HW05 – Performance Testing (Kiểm Thử Hiệu Năng API)

**Mã bài tập:** HW05-AI  
**Mã số sinh viên (MSSV):** 23120325  
**Họ và tên sinh viên:** Lê Hoàng Phú  
**Hệ thống kiểm thử (SUT):** EShop Backend REST API  
**Công cụ kiểm thử:** k6 v2.3.0 (Tùy chọn k6 được khuyến khích tính điểm bonus)  
**Luồng nghiệp vụ lựa chọn:** **FR-02 → FR-11 → FR-10** (Đăng nhập → Xem lịch sử đơn hàng → Hủy đơn hàng và xác minh trạng thái)  
**Link kho chứa mã nguồn (GitHub Repo):** [https://github.com/PhuLe2712/HW05-Performance-Testing](https://github.com/PhuLe2712/HW05-Performance-Testing)

> **Số liệu chuẩn của lượt chạy lại ngày 19/11/2026:** xem execution summary và raw JSONL trong bộ hồ sơ kết quả. Video demo đã có tại [YouTube (Unlisted)](https://youtu.be/bfE4SoD0tQo). Ảnh tài nguyên phải khớp lượt rerun và các bản PDF vẫn cần hoàn thiện trước khi nộp.

---

## 1. Bảng Tự Đánh Giá Điểm (Self-Assessment Table)

Bảng dưới đây là mức tự đánh giá hiện tại; Agent Skill không thực hiện nên tự chấm 0/10.

| Tiêu chí | Điểm tối đa | Tự đánh giá |
|---|---:|---:|
| Task 1 — Load testing | 30 | 30 |
| Task 1 — Stress testing | 20 | 20 |
| Task 1 — Spike testing | 20 | 20 |
| Task 2 — AI analysis and misinterpretation hunt | 10 | 10 |
| Task 3 — Continuous Performance Testing proposal | 10 | 10 |
| Agent Skill | 10 | 0 |
| **Tổng** | **100** | **90** |

Bốn kịch bản k6 đã chạy. Link video demo đã được bổ sung. Bộ ảnh hiện có là ảnh lượt chạy trước; cần ảnh CPU/RAM đồng thời cho lượt rerun. PDF báo cáo và các tài liệu bắt buộc dạng PDF vẫn còn thiếu. Agent Skill không thực hiện (0/10).

### Tình trạng deliverables

| Hạng mục | Tình trạng | Minh chứng |
|---|---|---|
| Task 1 — Load, Stress, Spike, Soak | Kịch bản và CSV có trong repository; Soak scenario hoàn tất nhưng CLI trả mã 1 khi đóng dashboard. Raw JSONL và summary chưa có trong repository | test-plans/, test-data/ |
| Task 2 — AI analysis và review | Đã soạn trong workspace nhưng tài liệu chưa được thêm vào repository này | Cần bổ sung báo cáo và AI critique |
| Task 3 — Continuous performance proposal | Đã soạn trong workspace nhưng tài liệu chưa được thêm vào repository này | Cần bổ sung đề xuất và sơ đồ |
| Agent Skill | Không thực hiện; tự đánh giá 0/10 | — |
| Bằng chứng nộp bài | Link video đã có; ảnh CPU/RAM của lượt rerun và các PDF chưa có trong repository này |

---

## 2. Báo Cáo Tóm Tắt Kiểm Thử (Test Summary Report)

### 2.1. Các kịch bản kiểm thử đã thực thi (Scenarios Run)
1. **Load Test:** 5 VUs, 25 iterations (100 requests), think time 1.5s, xuất báo cáo HTML.
2. **Stress Test:** 20 VUs, 100 iterations (400 requests), think time 0.25s, xuất báo cáo JSON.
3. **Spike Test:** 100 VUs, 100 iterations (400 requests), think time 0s, xuất báo cáo Markdown.
4. **Soak Test (Ngâm tải):** Chạy phân tầng 12 phút (1 VU → 5 VU → 10 VU), 939 iterations (3,756 requests), 0 HTTP errors và 7,512/7,512 checks đạt. Kết quả được tóm tắt trong báo cáo kiểm thử của workspace; summary/raw chưa được thêm vào repository này.

Sau khi chạy xong, DB vẫn có đúng 1.625 đơn; 1.164 đơn đã bị hủy bởi kịch bản, 461 còn pending. Bản sao lưu DB trước khi tạo lại được giữ riêng ngoài thư mục hồ sơ nộp.

### 2.2. Các nhóm Endpoint được bao phủ (Endpoint Groups Covered)
Luồng kiểm thử **FR-02 → FR-11 → FR-10** bao phủ trọn vẹn 3 nhóm endpoint backend theo yêu cầu đề bài:
- **Nhóm Xác thực (Auth-heavy):** FR-02 `POST /api/login` (Xác thực mật khẩu bcrypt, sinh JWT token, kiểm soát khóa tài khoản).
- **Nhóm Đọc nhiều (Read-heavy):** FR-11 `GET /api/orders/my-orders` (Truy vấn danh sách đơn hàng của người dùng từ CSDL SQLite).
- **Nhóm Giao tác (Transactional):** FR-10 `PUT /api/orders/:id/cancel` (Giao tác thay đổi trạng thái đơn hàng sang `canceled` trong CSDL với kiểm tra máy trạng thái) và gọi lại FR-11 `GET /api/orders/my-orders` để xác minh trạng thái `canceled`.

### 2.3. Ngưỡng Chịu Tải Bền Vững (Endurance Threshold)
- **10 VUs plateau:** 2,275 requests trong cửa sổ 230 giây (9.891 requests/s), p95 20.220 ms.
- **Toàn lượt Soak:** 3,756 requests, 939 workflows, 0 HTTP errors, 7,512/7,512 checks đạt. Trung bình toàn lượt 5.193 requests/s.
- **CPU/RAM:** Không có mẫu tài nguyên mới ghép với lượt rerun; các CSV trước đó không được dùng để kết luận bộ nhớ/rò rỉ.
- **Trạng thái CLI:** Kịch bản Soak hoàn tất 12 phút, sau đó tiến trình k6 bị dừng thủ công để đóng dashboard và trả mã 1. Xem ghi chú trong báo cáo.

### 2.4. Số lượng lỗi phát hiện trên SUT (Bugs / Performance Issues)
Đã ghi nhận 3 lỗi qua review mã nguồn; bản nháp issue hiện ở workspace, chưa đăng lên GitHub Issues:
1. **FR-02:** Bộ đếm đăng nhập sai tăng gấp đôi (+2) và thời gian khóa tài khoản là 180s (sai lệch so với đặc tả là +1 và 30s).
2. **FR-10:** Cho phép hủy đơn hàng đang ở trạng thái vận chuyển (`shipping`), vi phạm quy tắc máy trạng thái.
3. **FR-08:** API checkout nhận trực tiếp `total_amount` từ Client mà không tính toán lại từ giỏ hàng, có thể làm sai lệch tổng tiền đơn; ảnh hưởng thanh toán downstream chưa được xác minh.

### 2.5. Link Video Demo (YouTube Video Link)
[Xem video demo trên YouTube](https://youtu.be/bfE4SoD0tQo) (Unlisted).

---

## 3. Tệp hiện có trong repository

~~~text
HW05-Performance-Testing/
├── README.md
├── demo/
│   └── link video demo.txt
├── prepare-order/
│   └── prepare-orders.mjs
├── test-data/
│   ├── load.csv
│   ├── stress.csv
│   ├── spike.csv
│   └── soak.csv
└── test-plans/
    ├── 23120325_Load_20261119.js
    ├── 23120325_Stress_20261119.js
    ├── 23120325_Spike_20261119.js
    ├── 23120325_Soak_20261119.js
    ├── common.js
    └── report.js
~~~

Raw JSONL, summary/report files, ảnh chụp và tài liệu Task 2/3 chưa nằm trong repository này. Cần bổ sung các deliverable bắt buộc vào gói nộp nếu nộp qua repository này.

## 4. Hướng Dẫn Thực Thi Kịch Bản (Execution Instructions)

### Bước 1: Khởi động Backend SUT
```powershell
cd eshop-sut\backend
npm install
node server.js
# Backend lắng nghe tại http://localhost:3000
```

### Bước 2: Chuẩn bị dữ liệu đơn hàng một chiều (Data-driven fixtures)

> Lưu ý: script bên dưới tạo thêm 1.625 đơn, không xóa đơn hiện có. Chỉ chạy khi đã kiểm tra đúng database đích và đã sao lưu; các CSV hiện tại là one-shot vì 1.164 fixture đã bị hủy.

```powershell
$env:BASE_URL = 'http://127.0.0.1:3002'
node prepare-order/prepare-orders.mjs
```

### Bước 3: Chạy các kịch bản kiểm thử k6
```powershell
# 1. Chạy Load Test (xuất raw JSONL và tóm tắt HTML)
$env:BASE_URL = 'http://127.0.0.1:3002'
$env:SCENARIO = 'load'
k6 run --out json=results/load.jsonl test-plans/23120325_Load_20261119.js

# 2. Chạy Stress Test (xuất raw JSONL và tóm tắt JSON)
$env:SCENARIO = 'stress'
k6 run --out json=results/stress.jsonl test-plans/23120325_Stress_20261119.js

# 3. Chạy Spike Test (xuất raw JSONL và tóm tắt Markdown)
$env:SCENARIO = 'spike'
k6 run --out json=results/spike.jsonl test-plans/23120325_Spike_20261119.js

# 4. Chạy Soak Test (12 phút ngâm tải đa tầng)
$env:SCENARIO = 'soak'
k6 run --out json=results/soak.jsonl test-plans/23120325_Soak_20261119.js
```






