//react-native/api/db.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use a file-based database instead of in-memory
const dbPath = path.join(__dirname, 'veritas.db');
console.log('Attempting to create database at:', dbPath);
console.log('Current directory:', __dirname);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Database connected successfully at:', dbPath);
  }
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY,
    barcode TEXT,
    model TEXT,
    serialNumber TEXT,
    description TEXT,
    images TEXT,
    status TEXT
  )`, (err) => {
    if (err) console.error('Error creating devices table:', err);
    else console.log('Devices table ready');
  });
  
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    role TEXT,
    credentials TEXT
  )`, (err) => {
    if (err) console.error('Error creating users table:', err);
    else console.log('Users table ready');
  });
  
  db.run(`CREATE TABLE IF NOT EXISTS shipments (
    id TEXT PRIMARY KEY,
    destination TEXT,
    devices TEXT
  )`, (err) => {
    if (err) console.error('Error creating shipments table:', err);
    else console.log('Shipments table ready');
  });
  
  db.run(`CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    deviceId TEXT,
    userId TEXT,
    encryptedData TEXT,
    signature TEXT,
    timestamp TEXT,
    status TEXT
  )`, (err) => {
    if (err) console.error('Error creating submissions table:', err);
    else console.log('Submissions table ready');
  });
});

module.exports = db;