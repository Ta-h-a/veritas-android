const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:'); // Use file in production

db.serialize(() => {
  db.run(`CREATE TABLE devices (
    id TEXT PRIMARY KEY,
    barcode TEXT,
    model TEXT,
    serialNumber TEXT,
    description TEXT,
    images TEXT,
    status TEXT
  )`);
  
  db.run(`CREATE TABLE users (
    id TEXT PRIMARY KEY,
    role TEXT,
    credentials TEXT
  )`);
  
  db.run(`CREATE TABLE shipments (
    id TEXT PRIMARY KEY,
    destination TEXT,
    devices TEXT
  )`);
  
  db.run(`CREATE TABLE submissions (
    id TEXT PRIMARY KEY,
    deviceId TEXT,
    userId TEXT,
    encryptedData TEXT,
    signature TEXT,
    timestamp TEXT,
    status TEXT
  )`);
});

module.exports = db;