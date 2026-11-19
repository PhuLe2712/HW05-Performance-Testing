import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const baseUrl = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const email = process.env.TEST_EMAIL || 'test@eshop.com';
const password = process.env.TEST_PASSWORD || 'Test1234!';
const address = process.env.TEST_SHIPPING_ADDRESS || 'Performance testing fixture';
const plans = [
  { name: 'load', count: 25 },
  { name: 'stress', count: 100 },
  { name: 'spike', count: 100 },
  { name: 'soak', count: 1400 },
];

async function request(path, body, token) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!response.ok) throw new Error(`${path} trả về mã lỗi ${response.status}: ${text}`);
  return data;
}

const login = await request('/api/login', { email, password });
if (!login.token) throw new Error('Phản hồi đăng nhập không chứa JWT token.');
const userId = login.user?.id ?? 'unknown';
const token = login.token;

const targetDirs = [];
if (existsSync(resolve('data'))) targetDirs.push(resolve('data'));
if (existsSync(resolve('test-data'))) targetDirs.push(resolve('test-data'));
if (!targetDirs.length) targetDirs.push(resolve('data'));

for (const dir of targetDirs) {
  await mkdir(dir, { recursive: true });
}

for (const plan of plans) {
  const rows = ['email,password,order_id'];
  for (let index = 0; index < plan.count; index += 1) {
    const order = await request('/api/checkout', {
      total_amount: 100000 + index,
      shipping_address: address,
    }, token);
    if (!order.orderId) throw new Error(`Checkout không trả về orderId cho kịch bản ${plan.name} tại fixture ${index + 1}.`);
    rows.push(`${email},${password},${order.orderId}`);
  }
  for (const dir of targetDirs) {
    await writeFile(resolve(dir, `${plan.name}.csv`), `${rows.join('\n')}\n`, 'utf8');
    console.log(`Đã chuẩn bị ${plan.count} đơn hàng chờ hủy cho ${plan.name}: ${dir}/${plan.name}.csv`);
  }
}
console.log(`Đã tạo thành công ${plans.reduce((sum, plan) => sum + plan.count, 0)} đơn hàng thử nghiệm cho User ID ${userId}.`);
