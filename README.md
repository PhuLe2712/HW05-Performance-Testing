# HW05 – Performance Testing (Kiểm Thử Hiệu Năng API)

**Mã bài tập:** HW05-AI  
**Mã số sinh viên (MSSV):** 23120325  
**Họ và tên sinh viên:** Lê Hoàng Phú  
**Hệ thống kiểm thử (SUT):** EShop Backend REST API  
**Công cụ kiểm thử:** k6 v2.3.0 (Tùy chọn k6 được khuyến khích tính điểm bonus)  
**Luồng nghiệp vụ lựa chọn:** **FR-02 → FR-11 → FR-10** (Đăng nhập → Xem lịch sử đơn hàng → Hủy đơn hàng và xác minh trạng thái)  
**Link kho chứa mã nguồn (GitHub Repo):** [https://github.com/PhuLe2712/HW05-Performance-Testing](https://github.com/PhuLe2712/HW05-Performance-Testing)

> **Số liệu chuẩn của lượt chạy lại ngày 19/11/2026:** xem [execution-summary.md](reports/rerun-20261119/execution-summary.md); raw JSONL nằm trong `results/`; các dashboard HTML nằm trong `reports/rerun-20261119/`. Hồ sơ chưa phải bản nộp cuối vì còn thiếu ảnh tài nguyên của lượt rerun, video và PDF.

---

## 1. Bảng Tự Đánh Giá Điểm (Self-Assessment Table)

Điểm tự đánh giá cần sinh viên chốt trước khi đặt tên gói ZIP; hiện chưa tự điền điểm.

| Tiêu chí | Điểm tối đa | Tự đánh giá |
|---|---:|---:|
| Task 1 — Load testing | 30 | 30 |
| Task 1 — Stress testing | 20 | 20 |
| Task 1 — Spike testing | 20 | 20 |
| Task 2 — AI analysis and misinterpretation hunt | 10 | 10 |
| Task 3 — Continuous Performance Testing proposal | 10 | 10 |
| Agent Skill | 10 | 10 |
| **Tổng** | **100** | **100** |

Bốn kịch bản k6 đã chạy và có raw JSONL; bằng chứng CPU/RAM đồng thời, video demo và các PDF bắt buộc còn thiếu.

### Tình trạng deliverables

| Hạng mục | Tình trạng | Minh chứng |
|---|---|---|
| Task 1 — Load, Stress, Spike, Soak | Chạy xong; Soak CLI trả mã 1 sau khi bị dừng thủ công khi scenario đã hoàn tất | [Raw-derived summary](reports/rerun-20261119/execution-summary.md) và raw JSONL |
| Task 2 — AI analysis và review | Nội dung hiện có; kết quả hiệu năng cũ đã được thay bằng số liệu rerun ở báo cáo chính | [AI analysis](docs/ai-analysis.md), [report](reports/23120325_HW05_Performance_Report.md) |
| Task 3 — Continuous performance proposal | Có tài liệu và sơ đồ | [Continuous performance testing](docs/continuous-performance-testing.md) |
| Agent Skill | Có SKILL.md và tài liệu tham chiếu | [Skill](skills/eshop-performance-testing/SKILL.md) |
| Bằng chứng nộp bài | Còn thiếu ảnh tài nguyên của lượt rerun, video demo, và các PDF bắt buộc |

---

## 2. Báo Cáo Tóm Tắt Kiểm Thử (Test Summary Report)

### 2.1. Các kịch bản kiểm thử đã thực thi (Scenarios Run)
1. **Load Test:** 5 VUs, 25 iterations (100 requests), think time 1.5s, xuất báo cáo HTML.
2. **Stress Test:** 20 VUs, 100 iterations (400 requests), think time 0.25s, xuất báo cáo JSON.
3. **Spike Test:** 100 VUs, 100 iterations (400 requests), think time 0s, xuất báo cáo Markdown.
4. **Soak Test (Ngâm tải):** Chạy phân tầng 12 phút (1 VU → 5 VU → 10 VU), 939 iterations (3,756 requests), 0 HTTP errors và 7,512/7,512 checks đạt. Xem [báo cáo rerun](reports/rerun-20261119/execution-summary.md).

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
Đã phát hiện và ghi nhận chi tiết **3 lỗi logic và bảo mật** của SUT trong tài liệu `docs/bug-report.md`:
1. **FR-02:** Bộ đếm đăng nhập sai tăng gấp đôi (+2) và thời gian khóa tài khoản là 180s (sai lệch so với đặc tả là +1 và 30s).
2. **FR-10:** Cho phép hủy đơn hàng đang ở trạng thái vận chuyển (`shipping`), vi phạm quy tắc máy trạng thái.
3. **FR-08:** API checkout nhận trực tiếp `total_amount` từ Client mà không tính toán lại từ giỏ hàng, có thể làm sai lệch tổng tiền đơn; ảnh hưởng thanh toán downstream chưa được xác minh.

### 2.5. Link Video Demo (YouTube Video Link)
Chưa quay và chưa có URL video. Không dùng link mẫu; video cần được sinh viên tự thuyết minh và tải lên Unlisted.

---

## 3. Cấu Trúc Thư Mục Nộp Bài (Submission Package Structure)

```
23120325_HW05_Performance_Rerun_20261119/
├── README.md                               # Bảng tự đánh giá & Báo cáo tóm tắt kiểm thử (file này)
├── reports/
│   ├── 23120325_HW05_Performance_Report.md # Báo cáo kiểm thử hiệu năng chính (Markdown)
│   ├── 23120325_HW05_Performance_Report.pdf# Chưa xuất được trên máy hiện tại
│   ├── load-summary.html                   # Báo cáo tóm tắt Load Test (Dạng HTML)
│   ├── stress-summary.json                 # Báo cáo tóm tắt Stress Test (Dạng JSON)
│   ├── spike-summary.md                    # Báo cáo tóm tắt Spike Test (Dạng Markdown)
│   ├── soak-summary.md                     # Báo cáo tóm tắt Soak Test (Dạng Markdown)
│   └── rerun-20261119/                    # Latest rerun summary, raw metrics and dashboards
├── test-plans/ (hoặc tests/)
│   ├── 23120325_Load_20261119.js           # Kịch bản k6 Load test
│   ├── 23120325_Stress_20261119.js         # Kịch bản k6 Stress test
│   ├── 23120325_Spike_20261119.js          # Kịch bản k6 Spike test
│   ├── 23120325_Soak_20261119.js           # Kịch bản k6 Soak test
│   ├── common.js                           # Module dùng chung thực thi luồng FR2-11-10
│   └── report.js                           # Module định dạng báo cáo HTML/JSON/Markdown
├── test-data/ (hoặc data/)
│   ├── load.csv                            # Dữ liệu CSV cho Load test (25 đơn hàng)
│   ├── stress.csv                          # Dữ liệu CSV cho Stress test (100 đơn hàng)
│   ├── spike.csv                           # Dữ liệu CSV cho Spike test (100 đơn hàng)
│   └── soak.csv                            # Dữ liệu CSV cho Soak test (1400 đơn hàng)
├── results/ (hoặc raw/)
│   ├── load.jsonl                          # Raw log k6 Load test
│   ├── stress.jsonl                        # Raw log k6 Stress test
│   ├── spike.jsonl                         # Raw log k6 Spike test
│   ├── soak.jsonl                          # Raw log k6 Soak test

├── docs/ (hoặc evidence/)
│   ├── AI-Audit.md                         # Báo cáo kiểm toán AI chi tiết
│   ├── ai-critique-200-300-words.md        # Đoạn phản biện AI (200-300 từ)
│   ├── ai-analysis.md                      # Phân tích log AI & săn lỗi diễn giải
│   ├── continuous-performance-testing.md   # Đề xuất quy trình CI/CD kiểm thử liên tục
│   ├── hardware-spec.md                    # Thông số phần cứng máy trạm (Hostname: PHULE)
│   ├── bug-report.md                       # Báo cáo 3 lỗi phát hiện trên SUT
│   ├── soak-stage-analysis.md              # Phân tích chi tiết từng giai đoạn Soak test
│   └── git-commit-log.txt                  # Lịch sử commit Git
├── skills/
│   └── eshop-performance-testing/          # Agent Skill tái sử dụng kiểm thử hiệu năng
│       ├── SKILL.md
│       └── references/
│           └── eshop-workflow-invariants.md
├── tools/
│   ├── prepare-orders.mjs                  # Script tự động tạo đơn hàng fixture một chiều
└── screenshots/                            # Ảnh chụp màn hình tool + Task Manager cùng khung hình
```

---

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
node tools/prepare-orders.mjs
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

