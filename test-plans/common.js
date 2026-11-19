import http from 'k6/http';
import { check, fail, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import exec from 'k6/execution';

const scenario = __ENV.SCENARIO || 'load';
const data = new SharedArray(`${scenario} fixture rows`, () => {
  let content;
  try {
    content = open(`../test-data/${scenario}.csv`);
  } catch (e1) {
    try {
      content = open(`../data/${scenario}.csv`);
    } catch (e2) {
      throw new Error(`Không tìm thấy file dữ liệu: ../test-data/${scenario}.csv hoặc ../data/${scenario}.csv`);
    }
  }
  const lines = content.trim().split(/\r?\n/);
  if (!lines.length || lines[0].trim() !== 'email,password,order_id') {
    throw new Error(`Header file CSV không hợp lệ (yêu cầu 'email,password,order_id')`);
  }
  return lines.slice(1).filter(Boolean).map((line, index) => {
    const fields = line.split(',');
    if (fields.length !== 3 || fields.some((field) => !field.trim())) {
      throw new Error(`Dòng dữ liệu CSV số ${index + 2} không hợp lệ`);
    }
    return { email: fields[0].trim(), password: fields[1].trim(), orderId: fields[2].trim() };
  });
});

export const baseUrl = (__ENV.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

export function assertFixtureCount(expected) {
  if (data.length < expected) {
    throw new Error(`Dữ liệu CSV kịch bản ${scenario} có ${data.length} dòng; kịch bản yêu cầu ít nhất ${expected} dòng. Chạy 'node tools/prepare-orders.mjs' để tạo thêm.`);
  }
}

export function runWorkflow(thinkSeconds) {
  const iteration = exec.scenario.iterationInTest;
  const row = data[iteration];
  if (!row) fail(`Không tìm thấy fixture đơn hàng duy nhất cho iteration ${iteration}; hãy tạo mới dữ liệu trước khi chạy.`);

  // 1. FR-02: Đăng nhập
  const login = http.post(`${baseUrl}/api/login`, JSON.stringify({ email: row.email, password: row.password }), {
    headers: { 'Content-Type': 'application/json' }, tags: { step: 'FR-02 login' },
  });
  const loginOk = check(login, {
    'login returns 200': (r) => r.status === 200,
    'login returns JWT': (r) => Boolean(r.json('token')),
  });
  if (!loginOk) fail(`Đăng nhập thất bại cho iteration ${iteration}; kiểm tra thông tin tài khoản và trạng thái khóa tài khoản.`);
  const token = login.json('token');
  const headers = { Authorization: `Bearer ${token}` };

  if (thinkSeconds > 0) sleep(thinkSeconds);

  // 2. FR-11: Xem lịch sử đơn hàng và xác thực đơn hàng tồn tại ở trạng thái có thể hủy
  const history = http.get(`${baseUrl}/api/orders/my-orders`, {
    headers, tags: { step: 'FR-11 order history' },
  });
  const historyOk = check(history, {
    'order history returns 200': (r) => r.status === 200,
    'order history includes assigned order in cancellable state': (r) => {
      if (r.status !== 200) return false;
      const orders = r.json();
      const order = Array.isArray(orders) && orders.find((item) => String(item.id) === row.orderId);
      return Boolean(order && ['pending', 'confirmed'].includes(order.status));
    },
  });
  if (!historyOk) fail(`Đơn hàng ${row.orderId} không tồn tại, không thuộc về user, hoặc không ở trạng thái có thể hủy.`);

  if (thinkSeconds > 0) sleep(thinkSeconds);

  // 3. FR-10: Hủy đơn hàng (giao tác chuyển trạng thái state machine)
  const cancel = http.put(`${baseUrl}/api/orders/${encodeURIComponent(row.orderId)}/cancel`, null, {
    headers, tags: { step: 'FR-10 cancel order' },
  });
  const cancelOk = check(cancel, {
    'cancel returns 200': (r) => r.status === 200,
    'cancel confirms success': (r) => r.status === 200 && r.json('message') === 'Order canceled successfully',
  });
  if (!cancelOk) fail(`Hủy đơn hàng thất bại cho đơn ${row.orderId}.`);

  // 4. FR-11: Xác minh lại lịch sử đơn hàng để chắc chắn trạng thái đã chuyển thành 'canceled'
  const verify = http.get(`${baseUrl}/api/orders/my-orders`, {
    headers, tags: { step: 'FR-11 verify canceled order' },
  });
  check(verify, {
    'post-cancel history returns 200': (r) => r.status === 200,
    'order history shows canceled state': (r) => {
      if (r.status !== 200) return false;
      const orders = r.json();
      const order = Array.isArray(orders) && orders.find((item) => String(item.id) === row.orderId);
      return Boolean(order && order.status === 'canceled');
    },
  });
}

export function fixtureRows() {
  return data.length;
}
