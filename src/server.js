/**
 * Node.js Backend สำหรับทดสอบด้วย K6
 * เหมาะสำหรับมือใหม่หัดใช้
 */

require('dotenv').config();

const express = require('express');
const metrics = require('./metrics');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// ข้อมูลตัวอย่างจำลอง
const users = [
  { id: 1, name: 'สมชาย', email: 'somchai@example.com' },
  { id: 2, name: 'สมหญิง', email: 'somying@example.com' },
  { id: 3, name: 'วิชัย', email: 'wichai@example.com' },
];

// ========== API Endpoints สำหรับทดสอบ ==========

// GET / - Health check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend ทำงานปกติ',
    timestamp: new Date().toISOString(),
  });
});

// GET /api/users - ดึงรายชื่อผู้ใช้ทั้งหมด
app.get('/api/users', (req, res) => {
  res.json({
    success: true,
    count: users.length,
    data: users,
  });
});

// GET /api/users/:id - ดึงผู้ใช้ตาม ID
app.get('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const user = users.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'ไม่พบผู้ใช้',
    });
  }
  res.json({
    success: true,
    data: user,
  });
});

// POST /api/users - สร้างผู้ใช้ใหม่ (จำลอง)
app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({
      success: false,
      error: 'กรุณากรอก name และ email',
    });
  }
  const newUser = {
    id: users.length + 1,
    name,
    email,
  };
  users.push(newUser);
  res.status(201).json({
    success: true,
    message: 'สร้างผู้ใช้สำเร็จ',
    data: newUser,
  });
});

// GET /api/slow - endpoint ที่ช้า (จำลองการประมวลผล)
app.get('/api/slow', (req, res) => {
  const delay = parseInt(req.query.delay, 10) || 1000;
  setTimeout(() => {
    res.json({
      success: true,
      delay,
      message: `รอ ${delay}ms สำเร็จ`,
    });
  }, Math.min(delay, 3000)); // จำกัดสูงสุด 3 วินาที
});

// GET /metrics - Prometheus metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', metrics.getContentType());
  res.end(await metrics.getMetrics());
});

// Start server (bind 0.0.0.0 เพื่อให้ Render / cloud เข้าถึงได้)
const host = process.env.HOST || '0.0.0.0';
app.listen(PORT, host, () => {
  console.log(`🚀 Server รันที่ http://${host}:${PORT}`);
  console.log(`   - GET  /          - Health check`);
  console.log(`   - GET  /api/users - รายชื่อผู้ใช้`);
  console.log(`   - GET  /api/users/:id - ผู้ใช้ตาม ID`);
  console.log(`   - POST /api/users - สร้างผู้ใช้`);
  console.log(`   - GET  /api/slow?delay=500 - ทดสอบ latency`);
  console.log(`   - GET  /metrics - Prometheus metrics`);
});
