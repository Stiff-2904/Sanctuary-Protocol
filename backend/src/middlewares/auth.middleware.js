import { verifyToken } from '../utils/jwt.js';

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'No token provided',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(500).json({
      message: 'Role validation error',
      error: error.message,
    });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Verificamos si el usuario existe (puesto por authenticate) y si su rol está permitido
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Acceso denegado: No tienes los permisos necesarios'
      });
    }
    next();
  };
};
