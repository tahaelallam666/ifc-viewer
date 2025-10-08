const sqlite3 = require('sqlite3').verbose();

const dbPath = process.env.DATABASE_PATH || './database.sqlite';
const db = new sqlite3.Database(dbPath);

// Enable foreign keys for data integrity
db.run('PRAGMA foreign_keys = ON');

// ============ DATABASE INITIALIZATION ============

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Sensors table (stores sensor metadata)
      db.run(`
        CREATE TABLE IF NOT EXISTS sensors (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sensor_id TEXT UNIQUE NOT NULL,
          element_id TEXT NOT NULL,
          element_name TEXT,
          location TEXT,
          sensor_type TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Sensor readings table (stores historical data)
      db.run(`
        CREATE TABLE IF NOT EXISTS sensor_readings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sensor_id TEXT NOT NULL,
          temperature REAL,
          humidity REAL,
          co2 REAL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (sensor_id) REFERENCES sensors(sensor_id) ON DELETE CASCADE
        )
      `);

      // Indexes for better performance
      db.run(`CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor_id ON sensor_readings(sensor_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_sensor_readings_timestamp ON sensor_readings(timestamp)`, (err) => {
        if (err) reject(err);
        else {
          console.log('✅ Database initialized');
          resolve();
        }
      });
    });
  });
}

// ============ QUERY FUNCTIONS ============

/**
 * Get all sensors with their latest readings
 * Used by: GET /api/sensors/latest
 */
function getAllSensorsWithLatestReadings() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        s.sensor_id,
        s.element_id,
        s.element_name,
        s.location,
        s.sensor_type,
        sr.temperature,
        sr.humidity,
        sr.co2,
        sr.timestamp
      FROM sensors s
      LEFT JOIN (
        SELECT 
          sensor_id,
          temperature,
          humidity,
          co2,
          timestamp
        FROM sensor_readings
        GROUP BY sensor_id
        HAVING MAX(timestamp)
      ) sr ON s.sensor_id = sr.sensor_id
      ORDER BY s.sensor_id
    `;
    
    db.all(query, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

/**
 * Get historical readings for a specific sensor
 * Used by: GET /api/sensors/:sensorId/history
 */
function getSensorHistory(sensorId, limit = 100) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT temperature, humidity, co2, timestamp
      FROM sensor_readings
      WHERE sensor_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `;
    
    db.all(query, [sensorId, limit], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// ============ INSERT FUNCTIONS ============

/**
 * Add new sensor
 * Used by: seed-data.js (initial setup)
 */
function addSensor(sensorData) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO sensors (sensor_id, element_id, element_name, location, sensor_type)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    db.run(query, [
      sensorData.sensor_id,
      sensorData.element_id,
      sensorData.element_name,
      sensorData.location,
      sensorData.sensor_type
    ], function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID });
    });
  });
}

/**
 * Add sensor reading
 * Used by: updateSensorReadings() in server.js
 */
function addSensorReading(reading) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO sensor_readings (sensor_id, temperature, humidity, co2, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    db.run(query, [
      reading.sensor_id,
      reading.temperature,
      reading.humidity,
      reading.co2,
      reading.timestamp || new Date().toISOString()
    ], function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID });
    });
  });
}

// ============ UTILITY FUNCTIONS ============

/**
 * Generate random sensor reading values
 * Used by: seed-data.js and server.js
 */
function generateRandomReading(baseTemp = 22, baseHumidity = 45, baseCO2 = 400) {
  return {
    temperature: parseFloat((baseTemp + (Math.random() * 4 - 2)).toFixed(1)),
    humidity: parseFloat((baseHumidity + (Math.random() * 10 - 5)).toFixed(1)),
    co2: parseFloat((baseCO2 + (Math.random() * 100 - 50)).toFixed(0))
  };
}

// ============ EXPORTS ============

module.exports = {
  initializeDatabase,
  getAllSensorsWithLatestReadings,
  getSensorHistory,
  addSensor,
  addSensorReading,
  generateRandomReading
};
