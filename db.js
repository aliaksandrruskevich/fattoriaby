const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'properties.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    initDatabase();
  }
});

function initDatabase() {
  const sql = `
    CREATE TABLE IF NOT EXISTS properties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unid TEXT UNIQUE,
      title TEXT,
      location TEXT,
      price INTEGER,
      currency TEXT,
      type TEXT,
      operation TEXT,
      description TEXT,
      features TEXT, -- JSON string
      photos TEXT, -- JSON string
      lat REAL,
      lng REAL,
      contact_name TEXT,
      contact_phone TEXT,
      last_update TEXT,
      archive INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.run(sql, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Properties table ready.');
    }
  });
}

function insertProperty(property) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT OR REPLACE INTO properties
      (unid, title, location, price, currency, type, operation, description, features, photos, lat, lng, contact_name, contact_phone, last_update, archive, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;

    const values = [
      property.unid,
      property.title,
      property.location,
      property.price,
      property.currency,
      property.type,
      property.operation,
      property.description,
      JSON.stringify(property.features),
      JSON.stringify(property.photos),
      property.lat,
      property.lng,
      property.contact_name,
      property.contact_phone,
      property.last_update,
      property.archive
    ];

    db.run(sql, values, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
}

function getActiveProperties(limit = 12, offset = 0, filters = {}) {
  return new Promise((resolve, reject) => {
    let sql = 'SELECT * FROM properties WHERE archive = 0';
    const params = [];

    if (filters.operation) {
      sql += ' AND operation = ?';
      params.push(filters.operation);
    }

    if (filters.type) {
      sql += ' AND type = ?';
      params.push(filters.type);
    }

    if (filters.rooms) {
      sql += ' AND features LIKE ?';
      params.push(`%Комнаты: ${filters.rooms}%`);
    }

    if (filters.price_min) {
      sql += ' AND price >= ?';
      params.push(filters.price_min);
    }

    if (filters.price_max) {
      sql += ' AND price <= ?';
      params.push(filters.price_max);
    }

    if (filters.area_min) {
      sql += ' AND features LIKE ?';
      params.push(`%Площадь: ${filters.area_min}%`);
    }

    if (filters.area_max) {
      sql += ' AND features LIKE ?';
      params.push(`%Площадь: ${filters.area_max}%`);
    }

    if (filters.sort === 'price_asc') {
      sql += ' ORDER BY price ASC';
    } else if (filters.sort === 'price_desc') {
      sql += ' ORDER BY price DESC';
    } else if (filters.sort === 'date_desc') {
      sql += ' ORDER BY updated_at DESC';
    }

    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        // Parse JSON fields
        const properties = rows.map(row => ({
          ...row,
          features: JSON.parse(row.features || '[]'),
          photos: JSON.parse(row.photos || '[]')
        }));
        resolve(properties);
      }
    });
  });
}

function getPropertyByUnid(unid) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM properties WHERE unid = ? AND archive = 0';

    db.get(sql, [unid], (err, row) => {
      if (err) {
        reject(err);
      } else if (row) {
        resolve({
          ...row,
          features: JSON.parse(row.features || '[]'),
          photos: JSON.parse(row.photos || '[]')
        });
      } else {
        resolve(null);
      }
    });
  });
}

function archiveMissingProperties(currentUnids) {
  return new Promise((resolve, reject) => {
    const placeholders = currentUnids.map(() => '?').join(',');
    const sql = `UPDATE properties SET archive = 1, updated_at = CURRENT_TIMESTAMP WHERE unid NOT IN (${placeholders}) AND archive = 0`;

    db.run(sql, currentUnids, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
}

function getAllUnids() {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT unid FROM properties WHERE archive = 0';

    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows.map(row => row.unid));
      }
    });
  });
}

module.exports = {
  insertProperty,
  getActiveProperties,
  getPropertyByUnid,
  archiveMissingProperties,
  getAllUnids
};
