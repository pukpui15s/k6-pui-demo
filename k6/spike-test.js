/**
 * K6 Spike Test - ทดสอบกรณีโหลดเพิ่มขึ้นฉับพลัน
 * เหมาะสำหรับ: จำลองข่าวดัง/โปรโมชั่น/Black Friday
 * ผู้ใช้: เพิ่มขึ้นแบบก้าวกระโดด
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  stages: [
    { duration: '30s', target: 5 },    // ปกติ 5 users
    { duration: '10s', target: 50 },   // กระโดดเป็น 50 ใน 10 วินาที!
    { duration: '1m', target: 50 },    // คงที่ 50
    { duration: '10s', target: 5 },    // กลับลงมา 5
    { duration: '30s', target: 0 },    // ปิด
  ],
};

export default function () {
  const res = http.get(`${BASE_URL}/api/users`);
  check(res, { 'status 200': (r) => r != null && r.status === 200 });
  sleep(0.5);
}
