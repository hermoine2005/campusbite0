require('dotenv').config();
const express = require('express'), cors = require('cors');
const connectDB = require('./config/db');
const app = express();
app.use(cors({ origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(',') }));
app.use(express.json());
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/food', require('./routes/food'));
app.use('/api/orders', require('./routes/orders'));
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, req, res, next) => { // centralized error handler
  let status = err.status || 500, message = err.message;
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map(e => e.message).join(', '); }
  else if (err.name === 'CastError') { status = 400; message = 'Invalid id'; }
  else if (err.code === 11000) { status = 409; message = 'Duplicate value'; }
  if (status === 500) { console.error(err); message = 'Server error'; }
  res.status(status).json({ message });
});
const port = process.env.PORT || 5000;
if (!process.env.JWT_SECRET || !process.env.MONGO_URI) { console.error('Set MONGO_URI and JWT_SECRET in server/.env'); process.exit(1); }
connectDB().then(() => app.listen(port, () => console.log('API on port ' + port))).catch(e => { console.error('DB error:', e.message); process.exit(1); });
