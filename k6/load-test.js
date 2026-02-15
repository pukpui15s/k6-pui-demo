/**
 * K6 Load Test - ทดสอบภายใต้ภาระโหลดปกติ
 * เหมาะสำหรับ: จำลองผู้ใช้จำนวนมากใช้งานพร้อมกัน
 * ผู้ใช้: ปานกลาง (10-50 คน)
 * Duration: ปานกลาง
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  stages: [
    { duration: '30s', target: 10 },  // รันขึ้นจาก 0 เป็น 10 users ใน 30 วินาที
    { duration: '1m', target: 10 },   // คงที่ 10 users เป็นเวลา 1 นาที
    { duration: '30s', target: 0 },   // ลดลงเหลือ 0 ใน 30 วินาที
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% ของ request ต้องตอบภายใน 500ms
    http_req_failed: ['rate<0.01'],    // อัตรา error ต้องน้อยกว่า 1%
  },
};

function ok(r) {
  return r != null && r.status === 200;
}

export default function () {
  const responses = http.batch([
    ['GET', `${BASE_URL}/`],
    ['GET', `${BASE_URL}/api/users`],
    ['GET', `${BASE_URL}/api/users/1`],
    ['GET', `${BASE_URL}/api/cpu?duration=1500`],
  ]);

  check(responses[0], { 'home ok': ok });
  check(responses[1], { 'users ok': ok });
  check(responses[2], { 'user 1 ok': ok });
  check(responses[3], { 'cpu ok': ok });

  sleep(0.5);
}

export function handleSummary(data) {
  return {
    'k6/results/load-report.html': htmlReport(data, { title: 'Load Test' }),
  };
}
