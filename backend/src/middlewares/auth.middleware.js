import { verifyToken } from '../utils/jwt.js';
import { pool } from '../config/db.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ error: 'No se proporcionó token de autenticación' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE id = ? AND status = "active"',
      [decoded.id],
    );

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ error: 'Usuario no encontrado o inactivo' });
    }

    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      campId: decoded.campId,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(401).json({ error: 'Token inválido' });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'No tiene permisos para realizar esta acción',
      });
    }
    next();
  };
};
