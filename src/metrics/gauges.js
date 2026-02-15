/**
 * กำหนด Prometheus gauges ที่ใช้เก็บค่า (disk, RAM, เวลาอัปเดตล่าสุด)
 * ไม่เกี่ยวกับการส่งออก — แค่ประกาศ metric
 */

const client = require('prom-client');

// prefix จาก ENV (เช่น myapp, tester_demo) — จะต่อ _ ให้เอง
const METRICS_PREFIX =
  (process.env.METRICS_PREFIX || 'myapp').replace(/_+$/, '') + '_';

// ----- Disk -----
const diskFree = new client.Gauge({
  name: METRICS_PREFIX + 'disk_free_bytes',
  help: 'Free disk bytes on path',
  labelNames: ['path'],
});
const diskTotal = new client.Gauge({
  name: METRICS_PREFIX + 'disk_total_bytes',
  help: 'Total disk bytes on path',
  labelNames: ['path'],
});

// ----- RAM (จำนวนแรม) -----
const memoryBytes = new client.Gauge({
  name: METRICS_PREFIX + 'process_memory_bytes',
  help: 'Process memory usage in bytes',
  labelNames: ['type'], // resident, heap_used, heap_total, external
});

// ----- เวลา save/อัปเดต metrics ล่าสุด -----
const lastUpdateSeconds = new client.Gauge({
  name: METRICS_PREFIX + 'metrics_last_update_timestamp_seconds',
  help: 'Unix timestamp of last metrics update (save time)',
});

module.exports = {
  client,
  METRICS_PREFIX,
  diskFree,
  diskTotal,
  memoryBytes,
  lastUpdateSeconds,
};
