require('dotenv').config();
const express = require('express');
const cors = require('cors');
const {
  initializeDatabase,
  getAllSensorsWithLatestReadings,
  getSensorHistory,
  addSensorReading,
  generateRandomReading
} = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initializeDatabase().catch(err => console.error('Database init error:', err));

// ============ MOCK USER DATABASE ============
// In production, this would be in a real database with hashed passwords
const USERS = [
  {
    id: 1,
    username: 'admin',
    password: 'admin', // In production: use bcrypt to hash passwords!
    email: 'admin@ifcviewer.com'
  },
  {
    id: 2,
    username: 'user',
    password: 'user123',
    email: 'user@ifcviewer.com'
  }
];

// Simple token generation (in production, use JWT)
function generateToken(user) {
  return Buffer.from(`${user.id}:${user.username}:${Date.now()}`).toString('base64');
}

// ============ AUTHENTICATION ROUTES ============

/**
 * POST /api/auth/login
 * Login endpoint
 */
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  console.log('🔐 Login attempt:', username);
  
  // Validate input
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required'
    });
  }
  
  // Find user
  const user = USERS.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid username or password'
    });
  }
  
  // Generate token
  const token = generateToken(user);
  
  // Return user data (without password)
  const { password: _, ...userWithoutPassword } = user;
  
  res.json({
    success: true,
    message: 'Login successful',
    user: userWithoutPassword,
    token: token
  });
  
  console.log('✅ Login successful:', username);
});

/**
 * POST /api/auth/register
 * Registration endpoint (optional - for future use)
 */
app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  
  // Validate input
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }
  
  // Check if user exists
  const existingUser = USERS.find(u => u.username === username || u.email === email);
  
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'Username or email already exists'
    });
  }
  
  // Create new user
  const newUser = {
    id: USERS.length + 1,
    username,
    email,
    password // In production: hash with bcrypt!
  };
  
  USERS.push(newUser);
  
  const { password: _, ...userWithoutPassword } = newUser;
  
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    user: userWithoutPassword
  });
  
  console.log('✅ New user registered:', username);
});

// ============ API ROUTES ============

/**
 * GET /api/sensors/latest
 * Used by: Sensor Table Component
 * Returns: All sensors with their latest readings
 */
app.get('/api/sensors/latest', async (req, res) => {
  try {
    const sensors = await getAllSensorsWithLatestReadings();
    res.json({
      success: true,
      count: sensors.length,
      data: sensors,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching sensors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sensor data'
    });
  }
});

/**
 * GET /api/sensors/:sensorId/history
 * Used by: Historical Chart Component
 * Returns: Historical readings for a specific sensor
 */
app.get('/api/sensors/:sensorId/history', async (req, res) => {
  try {
    const { sensorId } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    
    const history = await getSensorHistory(sensorId, limit);
    
    res.json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    console.error('Error fetching sensor history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sensor history'
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint (optional - for testing)
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// ============ MOCK DATA GENERATOR ============
// Simulates real-time sensor updates every 30 seconds

async function updateSensorReadings() {
  try {
    const sensors = await getAllSensorsWithLatestReadings();
    
    for (const sensor of sensors) {
      const reading = generateRandomReading(); // ← Use shared function
      
      await addSensorReading({
        sensor_id: sensor.sensor_id,
        ...reading, // temperature, humidity, co2
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`📊 Updated ${sensors.length} sensors`);
  } catch (error) {
    console.error('Error updating sensors:', error);
  }
}

// Auto-update sensors every 30 seconds
setInterval(updateSensorReadings, 30000);

// ============ START SERVER ============

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Endpoints:`);
  console.log(`   - POST /api/auth/login (Login)`);
  console.log(`   - POST /api/auth/register (Register)`);
  console.log(`   - GET /api/sensors/latest (Sensor Table)`);
  console.log(`   - GET /api/sensors/:id/history (Historical Chart)`);
  console.log(`   - GET /api/health (Health Check)`);
  console.log(`🔄 Auto-updating sensors every 30 seconds`);
  console.log(`🔑 Test credentials: admin/admin or user/user123`);
});

module.exports = app;
