#!/bin/bash
# Script รัน K6 tests - ใช้ sh/bash ได้
# วิธีใช้: ./run-tests.sh [smoke|load|stress|spike|all]

BASE_URL="${BASE_URL:-http://localhost:3000}"

case "${1:-smoke}" in
  smoke)
    echo "=== Smoke Test - ทดสอบพื้นฐาน ==="
    k6 run k6/smoke-test.js -e BASE_URL="$BASE_URL"
    ;;
  load)
    echo "=== Load Test - ทดสอบโหลดปกติ ==="
    k6 run k6/load-test.js -e BASE_URL="$BASE_URL"
    ;;
  stress)
    echo "=== Stress Test - ทดสอบความอดทน ==="
    k6 run k6/stress-test.js -e BASE_URL="$BASE_URL"
    ;;
  spike)
    echo "=== Spike Test - ทดสอบโหลดเพิ่มฉับพลัน ==="
    k6 run k6/spike-test.js -e BASE_URL="$BASE_URL"
    ;;
  all)
    echo "=== รันทุก tests ==="
    k6 run k6/smoke-test.js -e BASE_URL="$BASE_URL" && \
    k6 run k6/load-test.js -e BASE_URL="$BASE_URL"
    ;;
  *)
    echo "วิธีใช้: ./run-tests.sh [smoke|load|stress|spike|all]"
    echo ""
    echo "คำสั่ง k6 โดยตรง:"
    echo "  k6 run k6/smoke-test.js     # ทดสอบพื้นฐาน"
    echo "  k6 run k6/load-test.js      # ทดสอบโหลดปกติ"
    echo "  k6 run k6/stress-test.js    # ทดสอบความอดทน"
    echo "  k6 run k6/spike-test.js     # ทดสอบโหลดเพิ่มฉับพลัน"
    echo ""
    echo "เปลี่ยน URL: BASE_URL=https://api.example.com ./run-tests.sh smoke"
    exit 1
    ;;
esac
