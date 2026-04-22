const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./firebase');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes

// POST /api/sos - save SOS alert
app.post('/api/sos', async (req, res) => {
  try {
    const { latitude, longitude, location, time, user_name } = req.body;
    
    const sosRef = await db.collection('sos_alerts').add({
      latitude,
      longitude,
      location,
      time,
      user_name,
      createdAt: new Date().toISOString()
    });
    
    res.status(201).json({ id: sosRef.id, message: 'SOS alert saved successfully' });
  } catch (error) {
    console.error('Error saving SOS alert:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/report - save danger zone
app.post('/api/report', async (req, res) => {
  try {
    const { location_name, danger_type, description, timestamp, user_name, signature, wallet_address } = req.body;
    
    const reportRef = await db.collection('danger_zones').add({
      location_name,
      danger_type,
      description,
      user_name: user_name || 'Anonymous',
      signature: signature || null,
      wallet_address: wallet_address || null,
      timestamp: timestamp || new Date().toISOString(),
      createdAt: new Date().toISOString()
    });
    
    res.status(201).json({ id: reportRef.id, message: 'Danger zone reported successfully' });
  } catch (error) {
    console.error('Error reporting danger zone:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/dangers - fetch all danger zones
app.get('/api/dangers', async (req, res) => {
  try {
    const snapshot = await db.collection('danger_zones').get();
    const dangers = [];
    
    snapshot.forEach((doc) => {
      dangers.push({ id: doc.id, ...doc.data() });
    });
    
    res.status(200).json(dangers);
  } catch (error) {
    console.error('Error fetching danger zones:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
