import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { checkSessionTimeout } from './middlewares/sessionTimeout.middleware.js';
import { authenticate } from './middlewares/auth.middleware.js';

import iaRoutes from './routes/ia.routes.js';
import authRoutes from './routes/auth.routes.js';
import campRoutes from './routes/camp.routes.js';
import admissionRoutes from './routes/admission.routes.js';
import campRequestRoutes from './routes/campRequest.routes.js';
import personRoutes from './routes/person.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import resourceRoutes from './routes/resource.routes.js';
import professionRoutes from './routes/profession.routes.js';
import explorationRoutes from './routes/exploration.routes.js';
import metricsRoutes from './routes/metrics.routes.js';
import temporaryAssignmentRoutes from './routes/temporaryAssignment.routes.js';
import productionRoutes from './routes/production.routes.js';
import { getServerTime } from './utils/serverTime.js';

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

app.use('/api/auth', authRoutes);

// Hora centralizada del servidor (público — no requiere token)
app.get('/api/time', async (req, res) => {
  try {
    const serverTime = await getServerTime();
    res.json({ server_time: serverTime });
  } catch {
    res.status(500).json({ error: 'Error al obtener la hora del servidor' });
  }
});
app.use('/api/admissions', authenticate, checkSessionTimeout, admissionRoutes);
app.use(
  '/api/camp-requests',
  authenticate,
  checkSessionTimeout,
  campRequestRoutes,
);
app.use('/api/persons', authenticate, checkSessionTimeout, personRoutes);
app.use('/api/inventory', authenticate, checkSessionTimeout, inventoryRoutes);
app.use('/api/resources', authenticate, checkSessionTimeout, resourceRoutes);
app.use(
  '/api/professions',
  authenticate,
  checkSessionTimeout,
  professionRoutes,
);

app.use('/api/production', authenticate, checkSessionTimeout, productionRoutes);

app.use(
  '/api/explorations',
  authenticate,
  checkSessionTimeout,
  explorationRoutes,
);

app.use(
  '/api/temporary-assignments',
  authenticate,
  checkSessionTimeout,
  temporaryAssignmentRoutes,
);

app.use('/api/metrics', authenticate, checkSessionTimeout, metricsRoutes);

app.use('/api/ia', authenticate, checkSessionTimeout, iaRoutes);
app.use('/api/camps', authenticate, checkSessionTimeout, campRoutes);
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error:
      process.env.NODE_ENV === 'production'
        ? 'Error interno del servidor'
        : err.message,
  });
});

export default app;