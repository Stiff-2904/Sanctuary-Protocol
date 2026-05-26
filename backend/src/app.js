import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { pool } from './config/db.js';

import campRoutes from './routes/camp.routes.js';
import admissionRoutes from './routes/admission.routes.js';
import campRequestRoutes from './routes/campRequest.routes.js';
import personRoutes from './routes/person.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import resourceRoutes from './routes/resource.routes.js';
import professionRoutes from './routes/profession.routes.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

app.use(helmet());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: '🧟 Sanctuary Protocol Backend',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/camps', campRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/camp-requests', campRequestRoutes);
app.use('/api/persons', personRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/professions', professionRoutes);
app.use('/api/auth', authRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    error:
      process.env.NODE_ENV === 'production'
        ? 'Error interno del servidor'
        : err.message,
  });
});

export default app;
