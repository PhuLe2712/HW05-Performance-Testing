# Kết quả chạy lại k6 — 19/11/2026

Các số liệu được tính lại từ từng point trong raw JSONL của lượt chạy lại. Raw logs, các báo cáo tóm tắt và HTML dashboard đều được lưu kèm trong thư mục này.

| Kịch bản | Iterations | HTTP requests | Lỗi HTTP | Checks đạt | Mean (ms) | p95 (ms) | Max (ms) | Request/s |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Load | 25 | 100 | 0/100 (0%) | 200/200 (100%) | 15.278 | 33.361 | 47.680 | 6.482 |
| Stress | 100 | 400 | 0/400 (0%) | 800/800 (100%) | 56.340 | 137.303 | 176.685 | 104.493 |
| Spike | 100 | 400 | 0/400 (0%) | 800/800 (100%) | 609.801 | 1078.077 | 1231.688 | 140.895 |
| Soak | 939 | 3756 | 0/3756 (0%) | 7512/7512 (100%) | 9.040 | 19.620 | 225.702 | 5.193 |

Ghi chú percentile: bảng này tính p95 theo nearest-rank trực tiếp trên raw samples. Các summary do k6 xuất ra dùng bộ ước lượng p95 riêng của k6, nên có thể lệch vài phần mười mili giây; tất cả cùng xuất phát từ cùng một lần chạy.

## Raw logs và báo cáo

- [Load raw JSONL](../../results/load.jsonl) · [Load HTML summary](../load-summary.html) · [Load dashboard](dashboard/load/index.html)
- [Stress raw JSONL](../../results/stress.jsonl) · [Stress JSON summary](../stress-summary.json) · [Stress dashboard](dashboard/stress/index.html)
- [Spike raw JSONL](../../results/spike.jsonl) · [Spike Markdown summary](../spike-summary.md) · [Spike dashboard](dashboard/spike/index.html)
- [Soak raw JSONL](../../results/soak.jsonl) · [Soak dashboard](dashboard/soak/index.html)

## Soak theo giai đoạn

| Giai đoạn | HTTP requests | Request/s | Workflows | Lỗi HTTP | Checks đạt | p95 (ms) | Max (ms) |
|---|---:|---:|---:|---:|---:|---:|---:|
| 1 VU plateau | 237 | 0.988 | 59 | 0 | 474/474 | 13.184 | 83.612 |
| Ramp 1→5 VUs | 22 | 2.200 | 4 | 0 | 44/44 | 37.939 | 50.474 |
| 5 VU plateau | 1133 | 4.926 | 283 | 0 | 2266/2266 | 19.140 | 225.702 |
| Ramp 5→10 VUs | 65 | 6.500 | 15 | 0 | 130/130 | 10.011 | 10.961 |
| 10 VU plateau | 2275 | 9.891 | 568 | 0 | 4550/4550 | 20.220 | 111.824 |

Soak chạy hết 12 phút: 939 iterations hoàn tất, 0 bị ngắt. Tốc độ 5.193 requests/s là trung bình trên toàn bộ lượt chạy; plateau 10 VUs đạt 9.891 requests/s và p95 20.220 ms. Cả lượt có 0 lỗi HTTP và 7,512/7,512 checks đạt.

## Trạng thái tiến trình k6

Sau khi scenario Soak hoàn tất, tiến trình k6 vẫn mở do web dashboard. Mình ngắt tiến trình thủ công để đóng dashboard; CLI trả mã thoát 1. Vì vậy không ghi nhận lần chạy Soak này là CLI exit 0. Raw JSONL và HTML dashboard đã được ghi; các tỷ lệ lỗi, checks và thống kê trên được tính trực tiếp từ raw points. Ba kịch bản Load, Stress và Spike kết thúc bình thường với mã thoát 0.

## Bằng chứng CPU/RAM

Không có mẫu CPU/RAM mới cho lượt chạy lại. Không có mẫu CPU/RAM mới; tài nguyên của lượt trước không được đưa vào bộ hồ sơ này hoặc gộp vào báo cáo. Ảnh chụp màn hình có sẵn trong [`screenshots`](../../screenshots/) cũng thuộc các lượt chạy trước. Cần ghi/chụp lại khi kịch bản đang chạy để chứng minh k6, backend và CPU/RAM cùng thời điểm.