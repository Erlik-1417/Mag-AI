import sqlite3 from 'sqlite3';

// Veritabanı dosyasını oluştur (klasörde magai_memory.db diye bir dosya belirecek)
const db = new sqlite3.Database('./magai_memory.db');

// Tabloyu hazırlıyoruz
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS processed_news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      link TEXT UNIQUE,
      title TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

export const memory = {
  isSeen: (link) => {
    return new Promise((resolve, reject) => {
      db.get("SELECT id FROM processed_news WHERE link = ?", [link], (err, row) => {
        if (err) reject(err);
        resolve(!!row);
      });
    });
  },
  save: (link, title) => {
    return new Promise((resolve, reject) => {
      db.run("INSERT INTO processed_news (link, title) VALUES (?, ?)", [link, title], (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }
};