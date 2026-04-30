import { verifyToken, isSessionActive } from '../utils/jwt.js';

const SESSION_TIMEOUT_MSG =
  'Sesión expirada por inactividad. Por favor, inicia sesión nuevamente.';

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!isSessionActive(decoded)) {
      return res.status(401).json({ message: SESSION_TIMEOUT_MSG });
    }

    req.user = { ...decoded, lastActivity: Date.now() };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Token inválido' });
    }
    return res
      .status(500)
      .json({ message: 'Error de autenticación', error: error.message });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Acceso denegado: No tienes los permisos necesarios',
      });
    }
    next();
  };
};
