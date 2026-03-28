import express from 'express';
import cors from 'cors';
import { pool } from './config/db.js';
import campRoutes from './routes/camp.routes.js';
import admissionRoutes from './routes/admissionroutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('RUNNING SANCTUARY PROTOCOL BACKEND');
});

app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1');
    res.json({ message: 'DB connected', result: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use('/api', campRoutes);
app.use('/api', admissionRoutes);

export default app;
