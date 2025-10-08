require('dotenv').config();
const { initializeDatabase, addSensor, addSensorReading, generateRandomReading } = require('./database');

async function seedDatabase() {
  console.log('🌱 Seeding database with mock data...\n');

  // Initialize database
  await initializeDatabase();

// Mock sensors data (linked to IFC elements)
const mockSensors = [
  {
    sensor_id: 'SENS-001',
    element_id: 'wall-001',
    element_name: 'Exterior Wall - North',
    location: 'Floor 1, North Wall',
    sensor_type: 'multi'
  },
  {
    sensor_id: 'SENS-002',
    element_id: 'room-001',
    element_name: 'Conference Room A',
    location: 'Floor 1, Room 101',
    sensor_type: 'multi'
  },
  {
    sensor_id: 'SENS-003',
    element_id: 'hvac-001',
    element_name: 'HVAC Unit 1',
    location: 'Floor 1, Mechanical Room',
    sensor_type: 'multi'
  },
  {
    sensor_id: 'SENS-004',
    element_id: 'wall-002',
    element_name: 'Interior Wall - Office',
    location: 'Floor 2, Office Space',
    sensor_type: 'multi'
  },
  {
    sensor_id: 'SENS-005',
    element_id: 'room-002',
    element_name: 'Server Room',
    location: 'Floor 1, Room 105',
    sensor_type: 'multi'
  },
  {
    sensor_id: 'SENS-006',
    element_id: 'window-001',
    element_name: 'Window - South Facade',
    location: 'Floor 2, South Side',
    sensor_type: 'multi'
  },
  {
    sensor_id: 'SENS-007',
    element_id: 'room-003',
    element_name: 'Meeting Room B',
    location: 'Floor 1, Room 102',
    sensor_type: 'multi'
  },
  {
    sensor_id: 'SENS-008',
    element_id: 'corridor-001',
    element_name: 'Main Corridor',
    location: 'Floor 1, Main Hallway',
    sensor_type: 'multi'
  }
];

  // Add sensors to database
  console.log('Adding sensors...');
  let sensorCount = 0;
  for (const sensor of mockSensors) {
    try {
      await addSensor(sensor);
      sensorCount++;
      console.log(`✓ Added sensor: ${sensor.sensor_id} (${sensor.element_name})`);
    } catch (error) {
      if (error.message && error.message.includes('UNIQUE constraint failed')) {
        console.log(`→ Sensor ${sensor.sensor_id} already exists`);
      } else {
        console.error(`✗ Error adding sensor ${sensor.sensor_id}:`, error.message);
      }
    }
  }

  console.log(`\n📊 Added ${sensorCount} sensors\n`);

  // Generate initial readings for each sensor (last 24 hours)
  console.log('Generating historical readings (last 24 hours)...');
  let readingCount = 0;
  const now = new Date();

  for (const sensor of mockSensors) {
    // Generate 48 readings (every 30 minutes for 24 hours)
    for (let i = 48; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - (i * 30 * 60 * 1000));
      
      // Base values vary per sensor
      const sensorIndex = mockSensors.indexOf(sensor);
      const baseTemp = 20 + (sensorIndex % 5);
      const baseHumidity = 40 + (sensorIndex % 15);
      const baseCO2 = 400 + (sensorIndex * 20);
      
      // Generate random reading with sensor-specific base values
      const reading = generateRandomReading(baseTemp, baseHumidity, baseCO2);
      
      // Add day/night cycle variation
      const hour = timestamp.getHours();
      const dayFactor = Math.sin((hour / 24) * Math.PI);
      
      try {
        await addSensorReading({
          sensor_id: sensor.sensor_id,
          temperature: parseFloat((reading.temperature + dayFactor * 2).toFixed(1)),
          humidity: parseFloat((reading.humidity - dayFactor * 5).toFixed(1)),
          co2: parseFloat((reading.co2 + dayFactor * 100).toFixed(0)),
          timestamp: timestamp.toISOString()
        });
        readingCount++;
      } catch (error) {
        console.error(`Error adding reading for ${sensor.sensor_id}:`, error.message);
      }
    }
    
    console.log(`✓ Generated 49 readings for ${sensor.sensor_id}`);
  }

  console.log(`\n✅ Database seeding complete!`);
  console.log(`   - ${sensorCount} sensors`);
  console.log(`   - ${readingCount} sensor readings`);
  console.log(`\n🚀 Run 'npm start' to start the server\n`);
}

// Run the seed function
seedDatabase().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
