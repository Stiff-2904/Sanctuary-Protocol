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

    if (!token) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const decoded = verifyToken(token);

    const [rows] = await pool.query(
      `SELECT ua.*, p.camp_id, sr.name AS role_name
       FROM user_account ua
       LEFT JOIN person p ON ua.person_id = p.person_id
       LEFT JOIN system_role sr ON ua.role_id = sr.role_id
       WHERE ua.user_id = ?`,
      [decoded.user_id],
    );

    if (rows.length === 0) {
      console.warn('Usuario no encontrado en BD:', decoded.user_id);
      return res
        .status(401)
        .json({ error: 'Usuario no encontrado o inactivo' });
    }

    const dbUser = rows[0];

    req.user = {
      id: dbUser.user_id,
      user_id: dbUser.user_id,
      username: dbUser.username,
      role_id: dbUser.role_id,
      role: dbUser.role_name,
      camp_id: dbUser.camp_id || decoded.camp_id || null, // snake_case
    };
    next();
  } catch (error) {
    console.error('Error en authenticate:', error.name, error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }

    return res.status(401).json({ error: 'Sesión inválida o expirada' });
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;  // usar role no role_id
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'No tiene permisos para realizar esta acción',
      });
    }
    next();
  };
};
