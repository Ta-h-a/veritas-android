//react-native/api/index.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const deviceRoutes = require('./routes/devices');
const shipmentRoutes = require('./routes/shipments');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(morgan('combined')); // Logging
app.use(express.json());

app.use('/api/v1/devices', deviceRoutes);
app.use('/api/v1/shipments', shipmentRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Prism React API' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;