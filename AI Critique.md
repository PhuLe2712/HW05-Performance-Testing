## **IV. AI Critique**
Trong quá trình thực hiện bài tập, em sử dụng Codex để hỗ trợ tạo các kịch bản kiểm thử k6, chuẩn bị dữ liệu và phân tích kết quả kiểm thử hiệu năng. AI giúp em tiết kiệm thời gian, đặc biệt trong việc tạo các file Load Test, Stress Test, Spike Test và Soak Test. Tuy nhiên, sau khi kiểm tra và chạy thử, em nhận thấy một số nội dung AI đưa ra vẫn cần được điều chỉnh.

Đầu tiên, AI có sự nhầm lẫn khi phân tích chỉ số p95 trong Spike Test. AI sử dụng giá trị p95 tổng thể là 1078.077 ms, nhưng khi kiểm tra từng bước nghiệp vụ, em nhận thấy thao tác hủy đơn hàng (FR-10) có p95 lên đến 1128.594 ms. Vì vậy, em đã đối chiếu lại raw JSONL và tách kết quả theo từng bước để tránh bỏ sót thao tác có độ trễ cao.

Thứ hai, một số nhận định của AI vượt quá những gì dữ liệu thực tế chứng minh. Chẳng hạn, kết quả Soak Test cho thấy hệ thống có thể duy trì hoạt động trong 12 phút, nhưng do thiếu dữ liệu CPU và RAM được ghi nhận đồng bộ nên chưa thể kết luận hệ thống không bị memory leak hoặc đã xác định được giới hạn phần cứng.

Ngoài ra, các đề xuất như Database Index, SQLite WAL và Connection Pool chỉ là những hướng tối ưu cần thử nghiệm thêm. Em không xem chúng là giải pháp chắc chắn hiệu quả khi chưa có kết quả benchmark để xác nhận.

Qua bài tập, em nhận thấy AI phù hợp để hỗ trợ viết mã, chuẩn bị dữ liệu và phân tích ban đầu. Tuy nhiên, người thực hiện vẫn phải kiểm tra mã nguồn, đối chiếu raw logs và tự đánh giá kết quả trước khi đưa ra kết luận.


