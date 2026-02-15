/**
 * เก็บ (collect) ค่า metrics: disk, RAM, เวลาอัปเดต
 * และส่งออก (export) ให้ endpoint /metrics ใช้
 */

const fs = require('node:fs/promises');
const client = require('prom-client');
const {
  METRICS_PREFIX,
  diskFree,
  diskTotal,
  memoryBytes,
  lastUpdateSeconds,
} = require('./gauges');

const DISK_PATH =
  process.env.METRICS_DISK_PATH ||
  (process.platform === 'win32' ? 'C:\\' : '/');
const DISK_INTERVAL_MS = Number(process.env.METRICS_DISK_INTERVAL_MS) || 15000;
const MEMORY_INTERVAL_MS =
  Number(process.env.METRICS_MEMORY_INTERVAL_MS) || 5000;

// Default metrics (CPU, event loop ฯลฯ)
client.collectDefaultMetrics({ prefix: METRICS_PREFIX });

// ----- Disk -----
async function updateDisk(path = DISK_PATH) {
  try {
    const s = await fs.statfs(path);
    const total = Number(s.blocks) * Number(s.bsize);
    const free = Number(s.bavail) * Number(s.bsize);
    diskTotal.set({ path }, total);
    diskFree.set({ path }, free);
  } catch {
    // ถ้าอ่านไม่ได้ (เช่น Windows เก่า / path ไม่มี) ปล่อยเงียบ
  }
}

// ----- RAM (จำนวนแรม) -----
function updateMemory() {
  const mem = process.memoryUsage();
  memoryBytes.set({ type: 'resident' }, mem.rss);
  memoryBytes.set({ type: 'heap_used' }, mem.heapUsed);
  memoryBytes.set({ type: 'heap_total' }, mem.heapTotal);
  memoryBytes.set({ type: 'external' }, mem.external);
}

// ----- เวลา save ล่าสุด -----
function updateLastUpdate() {
  lastUpdateSeconds.set(Math.floor(Date.now() / 1000));
}

// เริ่มอัปเดตตามช่วงเวลา
setInterval(() => updateDisk(), DISK_INTERVAL_MS);
updateDisk();

setInterval(() => {
  updateMemory();
  updateLastUpdate();
}, MEMORY_INTERVAL_MS);
updateMemory();
updateLastUpdate();

// ----- ส่งออกให้ route /metrics ใช้ -----
async function getMetrics() {
  return client.register.metrics();
}

function getContentType() {
  return client.register.contentType;
}

module.exports = {
  getMetrics,
  getContentType,
};
