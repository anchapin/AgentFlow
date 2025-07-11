const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const config = require('./config');

const DB_DIR = config.memory.dbDir;
const DB_PATH = path.join(DB_DIR, config.memory.dbName);

class Memory {
  constructor() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    this.db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error("Error opening database", err.message);
      } else {
        console.log("Connected to the SQLite database.");
      }
    });
  }

  async init() {
    return new Promise((resolve, reject) => {
      this.db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {
          console.error("Error creating table", err.message);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async saveMessage(agent, content) {
    return new Promise((resolve, reject) => {
      this.db.run('INSERT INTO messages (agent, content) VALUES (?, ?)', [agent, content], function(err) {
        if (err) {
          console.error("Error saving message", err.message);
          reject(err);
        } else {
          console.log(`A row has been inserted with rowid ${this.lastID}`);
          resolve(this.lastID);
        }
      });
    });
  }

  async getMessages() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT agent, content FROM messages ORDER BY timestamp ASC', [], (err, rows) => {
        if (err) {
          console.error("Error retrieving messages", err.message);
          reject(err);
        } else {
          resolve(rows.map(row => `${row.agent}: ${row.content}`));
        }
      });
    });
  }

  async clearMessages() {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM messages', [], function(err) {
        if (err) {
          console.error("Error clearing messages", err.message);
          reject(err);
        } else {
          console.log(`Cleared ${this.changes} messages.`);
          resolve();
        }
      });
    });
  }

  close() {
    this.db.close((err) => {
      if (err) {
        console.error("Error closing database", err.message);
      } else {
        console.log("Closed the SQLite database connection.");
      }
    });
  }
}

module.exports = { Memory };