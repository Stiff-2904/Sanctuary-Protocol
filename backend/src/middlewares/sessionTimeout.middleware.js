export const checkSessionTimeout = (req, res, next) => {
  const AUTH_HEADER = req.headers.authorization;

  if (!AUTH_HEADER) {
    return next();
  }

  try {
    const token = AUTH_HEADER.split(' ')[1];
    const decoded = require('jsonwebtoken').verify(
      token,
      process.env.JWT_SECRET,
    );

    if (decoded.lastActivity) {
      const lastActivity = new Date(decoded.lastActivity);
      const now = new Date();
      const diffMinutes = (now - lastActivity) / 1000 / 60;

      if (diffMinutes > 20) {
        return res.status(401).json({
          error: 'Sesión expirada por inactividad',
          message: 'Por favor, inicie sesión nuevamente',
        });
      }
    }

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Sesión inválida o expirada',
    });
  }
};
