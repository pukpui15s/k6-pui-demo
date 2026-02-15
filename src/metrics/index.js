/**
 * Metrics module: โหลด collectors (ให้เริ่มเก็บ disk/RAM/เวลา)
 * และส่งออกฟังก์ชันสำหรับ endpoint /metrics
 */

const { getMetrics, getContentType } = require('./collectors');

module.exports = {
  getMetrics,
  getContentType,
};
