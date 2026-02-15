# Tester Demo - Node.js Backend + K6 Load Testing

โปรเจกต์ตัวอย่างสำหรับมือใหม่ เรียนรู้การสร้าง Backend ด้วย Node.js และทดสอบประสิทธิภาพด้วย K6

## สิ่งที่ต้องติดตั้งก่อน

1. **Node.js** (v18 ขึ้นไป) - [ดาวน์โหลดที่นี่](https://nodejs.org/)
2. **K6** - [ดาวน์โหลดที่นี่](https://k6.io/docs/getting-started/installation/)

### ติดตั้ง K6 บน Windows

```powershell
# ใช้ Chocolatey
choco install k6

# หรือใช้ winget
winget install k6 --source winget

# หรือดาวน์โหลด .msi จาก https://github.com/grafana/k6/releases
```

## โครงสร้างโปรเจกต์

```
tester-demo/
├── src/
│   └── server.js      # Node.js Backend (Express)
├── k6/
│   ├── smoke-test.js   # ทดสอบพื้นฐาน
│   ├── load-test.js    # ทดสอบโหลดปกติ
│   ├── stress-test.js  # ทดสอบขีดจำกัด
│   ├── spike-test.js   # ทดสอบโหลดเพิ่มฉับพลัน
│   └── คำสั่ง.txt      # คำสั่ง k6 ทั้งหมด (copy ไปรันเอง)
├── package.json
└── README.md
```

## ขั้นตอนการใช้งาน

### 1. ติดตั้ง dependencies

```bash
npm install
```

### 2. รัน Backend

```bash
npm start
```

Backend จะรันที่ http://localhost:3000

### 3. ทดสอบด้วย K6

**เปิด Terminal ใหม่อีกหน้าต่าง** ดูคำสั่งทั้งหมดใน `k6/คำสั่ง.txt` แล้ว copy ไปรัน

#### คำสั่ง k6
```bash
k6 run k6/smoke-test.js     # ทดสอบพื้นฐาน
k6 run k6/load-test.js      # ทดสอบโหลดปกติ
k6 run k6/stress-test.js    # ทดสอบความอดทน
k6 run k6/spike-test.js     # ทดสอบโหลดเพิ่มฉับพลัน
```

| เคส | คำอธิบาย |
|-----|----------|
| smoke | ทดสอบพื้นฐาน - ตรวจว่า API ทำงานได้ |
| load | ทดสอบโหลด - จำลองผู้ใช้ 10 คน |
| stress | ทดสอบความอดทน - เพิ่มโหลดจนถึงขีดจำกัด |
| spike | ทดสอบสไปค์ - โหลดเพิ่มขึ้นฉับพลัน |

## API Endpoints สำหรับทดสอบ

| Method | Path | คำอธิบาย |
|--------|------|----------|
| GET | `/` | Health check |
| GET | `/api/users` | ดึงรายชื่อผู้ใช้ |
| GET | `/api/users/:id` | ดึงผู้ใช้ตาม ID |
| POST | `/api/users` | สร้างผู้ใช้ใหม่ |
| GET | `/api/slow?delay=500` | ทดสอบ latency (จำลองช้า) |

## เคสทดสอบ K6 แต่ละประเภท

### 1. Smoke Test (การทดสอบควัน)
- **จุดประสงค์:** ตรวจว่า API พร้อมใช้งานหรือไม่
- **ผู้ใช้:** 2 คน, 10 วินาที
- **ใช้เมื่อ:** ก่อน deploy, หลังแก้ไขโค้ด

### 2. Load Test (การทดสอบโหลด)
- **จุดประสงค์:** จำลองการใช้งานจริง
- **ผู้ใช้:** เพิ่มจาก 0 → 10 → คงที่ 1 นาที → ลดลง 0
- **ใช้เมื่อ:** ทดสอบภายใต้ภาระโหลดปกติ

### 3. Stress Test (การทดสอบความอดทน)
- **จุดประสงค์:** หาขีดจำกัดของระบบ
- **ผู้ใช้:** เพิ่มเรื่อยๆ 20 → 50 → 100 → 150 users
- **ใช้เมื่อ:** ต้องการรู้ว่าระบบรับโหลดได้มากแค่ไหน

### 4. Spike Test (การทดสอบสไปค์)
- **จุดประสงค์:** จำลองโหลดเพิ่มขึ้นฉับพลัน (ข่าวดัง, โปรโมชั่น)
- **ผู้ใช้:** กระโดดจาก 5 → 50 users ใน 10 วินาที
- **ใช้เมื่อ:** ระบบอาจมี traffic spike ได้

## การเปลี่ยน URL สำหรับทดสอบ

```bash
# ทดสอบ server อื่น (เช่น production)
BASE_URL=https://api.example.com k6 run k6/smoke-test.js

# หรือบน Windows PowerShell
$env:BASE_URL="https://api.example.com"; k6 run k6/smoke-test.js
```

## คำแนะนำสำหรับมือใหม่

1. รัน **smoke test** ก่อนเสมอ เพื่อให้แน่ใจว่า Backend ทำงาน
2. ดูผลลัพธ์ K6 - ค่าที่สำคัญคือ:
   - `http_req_duration` - เวลาตอบสนอง
   - `http_req_failed` - อัตราความล้มเหลว
   - `iterations` - จำนวนครั้งที่รันสำเร็จ
3. ค่อยๆ ลอง load → stress → spike เพื่อเห็นความแตกต่าง

## เอกสารเพิ่มเติม

- [K6 Documentation](https://k6.io/docs/)
- [Express.js Guide](https://expressjs.com/)
