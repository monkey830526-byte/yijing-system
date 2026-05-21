const Datastore = require('@seald-io/nedb');
const path = require('path');

// 雲端部署時使用 /var/data（Render persistent disk）
// 本機開發時使用專案目錄
const DB_DIR = process.env.RENDER ? '/var/data' : __dirname;

const readings = new Datastore({
  filename: path.join(DB_DIR, 'readings.db'),
  autoload: true,
  timestampData: false,
});

// Compact on startup to keep file size down
readings.compactDatafile();

module.exports = { readings };
