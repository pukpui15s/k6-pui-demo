#!/usr/bin/env sh
# รัน K6 (โหลด .env ได้ เลือกประเภทเทส แบบถาม-ตอบ หรือส่งอาร์กิวเมนต์)
# ใช้ส่งผลไป Prometheus Remote Write ได้

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"

# โหลด .env ถ้ามี
if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
fi

BASE_URL="${BASE_URL:-http://localhost:3000}"
K6_PROMETHEUS_RW_SERVER_URL="${K6_PROMETHEUS_RW_SERVER_URL:-http://localhost:9090/api/v1/write}"
export BASE_URL K6_PROMETHEUS_RW_SERVER_URL

# รายการเทส: id|name|file|description
TESTS="smoke|Smoke|smoke-test.js|ทดสอบพื้นฐาน 2 VUs, 10s
load|Load|load-test.js|โหลดเทส 10 VUs, 30s
stress|Stress|stress-test.js|ความเครียด ค่อยๆ เพิ่ม VUs
spike|Spike|spike-test.js|สไปค์ ยิงเต็มที่ช่วงสั้นๆ"

show_menu() {
  echo "รันเทสอะไร?"
  echo ""
  n=1
  echo "$TESTS" | while IFS='|' read -r id name file desc; do
    printf "  %s) %-6s - %s\n" "$n" "$name" "$desc"
    n=$((n + 1))
  done
  echo "  q) ออก"
  echo ""
}

get_test_by_index() {
  idx=$1
  line=$(echo "$TESTS" | sed -n "${idx}p")
  [ -z "$line" ] && return 1
  echo "$line"
}

get_test_by_id() {
  want=$(echo "$1" | tr '[:upper:]' '[:lower:]')
  echo "$TESTS" | while IFS='|' read -r tid name file desc; do
    [ "$tid" = "$want" ] && echo "$tid|$name|$file|$desc" && break
  done
}

# โหมดถาม-ตอบ (ไม่มีอาร์กิวเมนต์) — รับค่าจากการพิมพ์
ask_and_run() {
  echo "--- ตั้งค่า (กด Enter = ใช้ค่าจาก .env หรือค่าเริ่มต้น) ---"
  echo ""
  printf "BASE_URL [%s]: " "$BASE_URL"
  read -r r
  if [ -n "$r" ]; then BASE_URL=$r; export BASE_URL; fi
  printf "K6_PROMETHEUS_RW_SERVER_URL [%s]: " "$K6_PROMETHEUS_RW_SERVER_URL"
  read -r r
  if [ -n "$r" ]; then K6_PROMETHEUS_RW_SERVER_URL=$r; export K6_PROMETHEUS_RW_SERVER_URL; fi
  echo ""
  show_menu
  printf "เลือกเทส (1-4 หรือชื่อ เช่น smoke): "
  read -r CHOICE
}

# อาร์กิวเมนต์แรก = ตัวเลือกเทส (ข้ามถาม)
CHOICE="${1:-}"

if [ -z "$CHOICE" ]; then
  ask_and_run
  [ -z "$CHOICE" ] && echo "ยกเลิก" && exit 0
  [ "$CHOICE" = "q" ] && exit 0
fi

# แปลงเป็น test line
TEST_LINE=""
if [ -n "$CHOICE" ] && [ "$CHOICE" -eq "$CHOICE" ] 2>/dev/null && [ "$CHOICE" -ge 1 ] && [ "$CHOICE" -le 4 ]; then
  TEST_LINE=$(get_test_by_index "$CHOICE")
else
  TEST_LINE=$(get_test_by_id "$CHOICE")
fi

if [ -z "$TEST_LINE" ]; then
  echo "ไม่รู้จัก '$CHOICE' ใช้: smoke, load, stress, spike หรือ 1-4"
  exit 1
fi

TEST_FILE=$(echo "$TEST_LINE" | cut -d'|' -f3)
TEST_NAME=$(echo "$TEST_LINE" | cut -d'|' -f2)
TEST_PATH="$SCRIPT_DIR/$TEST_FILE"

if [ ! -f "$TEST_PATH" ]; then
  echo "ไม่พบไฟล์ $TEST_FILE"
  exit 1
fi

echo "--- สรุป ---"
echo "BASE_URL = $BASE_URL"
echo "K6_PROMETHEUS_RW_SERVER_URL = $K6_PROMETHEUS_RW_SERVER_URL"
echo "เทส = $TEST_NAME ($TEST_FILE)"
echo ""

# สร้างโฟลเดอร์เก็บรายงานถ้ายังไม่มี (กัน error ไม่พบ path)
mkdir -p "$SCRIPT_DIR/results"

cd "$ROOT_DIR"
exec k6 run -o experimental-prometheus-rw -e "BASE_URL=$BASE_URL" "$TEST_PATH"
