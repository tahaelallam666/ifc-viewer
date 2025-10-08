# IFC Viewer Backend API

Node.js/Express backend for streaming sensor data to the IFC Viewer frontend.

## 🚀 Features

- **RESTful API** for sensor data
- **SQLite Database** for data persistence
- **Mock Data Generation** simulates real-time sensor updates
- **CORS Enabled** for frontend integration
- **Historical Data** tracking with timestamps

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm

## 🛠️ Installation

```bash
cd backend
npm install
```

## 🎯 Setup & Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed Database with Mock Data
```bash
npm run seed
```

This will create:
- 8 sensors linked to IFC elements
- ~400 historical readings (last 24 hours)

### 3. Start Server
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

Server will run on `http://localhost:3000`

## 📡 API Endpoints

### Get All Sensors with Latest Readings
```
GET /api/sensors/latest
```

**Response:**
```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "sensor_id": "SENS-001",
      "element_id": "wall-001",
      "element_name": "Exterior Wall - North",
      "location": "Floor 1, North Wall",
      "sensor_type": "multi",
      "temperature": 22.3,
      "humidity": 45.2,
      "co2": 420,
      "timestamp": "2025-10-04T18:30:00.000Z"
    }
  ],
  "timestamp": "2025-10-04T18:30:00.000Z"
}
```

### Get Sensor by Element ID
```
GET /api/sensors/element/:elementId
```

Example: `/api/sensors/element/wall-001`

**Response:**
```json
{
  "success": true,
  "data": {
    "sensor_id": "SENS-001",
    "element_id": "wall-001",
    "element_name": "Exterior Wall - North",
    "temperature": 22.3,
    "humidity": 45.2,
    "co2": 420,
    "timestamp": "2025-10-04T18:30:00.000Z"
  }
}
```

### Get Sensor History
```
GET /api/sensors/:sensorId/history?limit=100
```

Example: `/api/sensors/SENS-001/history?limit=50`

**Response:**
```json
{
  "success": true,
  "count": 50,
  "data": [
    {
      "temperature": 22.3,
      "humidity": 45.2,
      "co2": 420,
      "timestamp": "2025-10-04T18:30:00.000Z"
    }
  ]
}
```

### Health Check
```
GET /api/health
```

## 📊 Sensor Data

Each sensor provides:
- **Temperature** (°C) - Range: 18-26°C
- **Humidity** (%) - Range: 30-60%
- **CO2** (ppm) - Range: 350-600 ppm

## 🔄 Real-Time Updates

In development mode, mock data is automatically generated every 30 seconds to simulate real sensor updates.

## 🗄️ Database

Uses SQLite with two tables:

### `sensors`
- sensor_id (unique)
- element_id (links to IFC element)
- element_name
- location
- sensor_type
- created_at

### `sensor_readings`
- sensor_id (foreign key)
- temperature
- humidity
- co2
- timestamp

## 🔧 Configuration

Edit `.env` file:

```env
PORT=3000
DATABASE_PATH=./database.sqlite
NODE_ENV=development
```

## 🧪 Testing

Test endpoints with curl:

```bash
# Get all sensors
curl http://localhost:3000/api/sensors/latest

# Get sensor by element
curl http://localhost:3000/api/sensors/element/wall-001

# Health check
curl http://localhost:3000/api/health
```

## 📝 Notes

- Database file `database.sqlite` is created automatically
- Mock sensors are linked to common IFC elements (walls, rooms, HVAC, windows)
- Historical data includes day/night variation patterns
- CORS is enabled for all origins (configure for production)

## 🚀 Production Deployment

For production:
1. Set `NODE_ENV=production` in `.env`
2. Configure proper CORS origins
3. Use PostgreSQL instead of SQLite (optional)
4. Add authentication/authorization
5. Implement rate limiting
6. Add request validation

## 📚 Integration with Frontend

The Angular frontend can fetch sensor data and display it in the IFC viewer when elements are selected.

See main README for full integration instructions.
