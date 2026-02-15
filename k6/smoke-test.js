/**
 * K6 Smoke Test - ทดสอบพื้นฐานว่าทุกอย่างทำงานได้
 * เหมาะสำหรับ: ตรวจสอบว่า API พร้อมใช้งาน
 * ผู้ใช้: น้อยมาก (1-2 คน)
 * Duration: สั้น
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  vus: 2,           // Virtual Users = 2 คน
  duration: '10s',  // ระยะเวลา 10 วินาที
};

function safeStatus200(r) {
  return r != null && r.status === 200;
}

function safeBodyStatusOk(r) {
  if (!r || !r.body) return false;
  try {
    return JSON.parse(r.body).status === 'ok';
  } catch {
    return false;
  }
}

function safeUsersData(r) {
  if (!r || !r.body) return false;
  try {
    const body = JSON.parse(r.body);
    return body.success && Array.isArray(body.data);
  } catch {
    return false;
  }
}

export default function () {
  // ทดสอบ Health check
  const healthRes = http.get(`${BASE_URL}/`);
  check(healthRes, {
    'status 200': safeStatus200,
    'response มี status ok': safeBodyStatusOk,
  });

  // ทดสอบ API users
  const usersRes = http.get(`${BASE_URL}/api/users`);
  check(usersRes, {
    'users status 200': safeStatus200,
    'users มี data': safeUsersData,
  });

  sleep(1);
}

export function handleSummary(data) {
  return {
    'k6/results/smoke-report.html': htmlReport(data, { title: 'Smoke Test' }),
  };
}
