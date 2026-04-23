const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class CacheService {
  constructor(dbPath, defaultTtlMinutes = 60) {
    const resolvedPath = path.resolve(dbPath);
    const dir = path.dirname(resolvedPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    this.db = new Database(resolvedPath);
    this.defaultTtl = defaultTtlMinutes;
    this._init();
    this.cleanup();

    // Cleanup expired entries every 10 minutes
    setInterval(() => this.cleanup(), 10 * 60 * 1000);
  }

  _init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cache_key TEXT UNIQUE NOT NULL,
        data TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        ttl_minutes INTEGER NOT NULL DEFAULT 60
      );
      CREATE INDEX IF NOT EXISTS idx_cache_key ON cache(cache_key);
    `);
  }

  get(key) {
    const row = this.db.prepare('SELECT * FROM cache WHERE cache_key = ?').get(key);
    if (!row) return null;

    const ageMinutes = (Date.now() - row.created_at) / 60000;
    if (ageMinutes > row.ttl_minutes) {
      this.invalidate(key);
      return null;
    }

    try {
      return JSON.parse(row.data);
    } catch {
      return null;
    }
  }

  set(key, data, ttlMinutes = this.defaultTtl) {
    const serialized = JSON.stringify(data);
    this.db.prepare(`
      INSERT OR REPLACE INTO cache (cache_key, data, created_at, ttl_minutes)
      VALUES (?, ?, ?, ?)
    `).run(key, serialized, Date.now(), ttlMinutes);
  }

  invalidate(key) {
    this.db.prepare('DELETE FROM cache WHERE cache_key = ?').run(key);
  }

  invalidateAll(prefix) {
    this.db.prepare("DELETE FROM cache WHERE cache_key LIKE ?").run(`${prefix}%`);
  }

  cleanup() {
    const now = Date.now();
    const result = this.db.prepare(`
      DELETE FROM cache
      WHERE (? - created_at) / 60000 > ttl_minutes
    `).run(now);
    if (result.changes > 0) {
      console.log(`[Cache] Cleaned up ${result.changes} expired entries`);
    }
  }

  close() {
    this.db.close();
  }
}

module.exports = CacheService;
