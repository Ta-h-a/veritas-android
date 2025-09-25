// api/test-db.js - Force create database file
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./veritas.db', (err) => {
  if (err) {
    console.error('Error:', err.message);
  } else {
    console.log('Database created at ./veritas.db');
  }
});

db.run('CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)', (err) => {
  if (err) {
    console.error('Table creation error:', err.message);
  } else {
    console.log('Test table created');
  }
});

db.run('INSERT INTO test (name) VALUES (?)', ['test record'], (err) => {
  if (err) {
    console.error('Insert error:', err.message);
  } else {
    console.log('Test record inserted');
  }
});

db.close((err) => {
  if (err) {
    console.error('Close error:', err.message);
  } else {
    console.log('Database connection closed');
    console.log('Check if veritas.db file now exists');
  }
});