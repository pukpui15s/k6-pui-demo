/**
 * K6 Stress Test - ทดสอบขีดจำกัดของระบบ
 * เหมาะสำหรับ: หาว่าระบบรับโหลดได้มากแค่ไหน
 * ผู้ใช้: สูงมาก (เพิ่มขึ้นเรื่อยๆ จนระบบล่มหรือช้า)
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  stages: [
    { duration: '1m', target: 20 },   // เพิ่มเป็น 20 users
    { duration: '1m', target: 50 },   // เพิ่มเป็น 50 users
    { duration: '1m', target: 100 },  // เพิ่มเป็น 100 users (อาจเริ่มช้า)
    { duration: '1m', target: 150 },  // เพิ่มเป็น 150 users
    { duration: '2m', target: 0 },    // ลดลง 0
  ],
};

export default function () {
  const res = http.get(`${BASE_URL}/api/users`);
  const passed = check(res, {
    'status 200': (r) => r != null && r.status === 200,
  });
  if (!passed && res) {
    console.log(`Failed request - Status: ${res.status}`);
  }
  sleep(1);
}

export function handleSummary(data) {
  return {
    'k6/results/stress-report.html': htmlReport(data, { title: 'Stress Test' }),
  };
}
