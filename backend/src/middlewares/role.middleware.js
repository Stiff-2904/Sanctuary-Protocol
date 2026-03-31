export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          message: 'Access denied (role)',
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        message: 'Role validation error',
        error: error.message,
      });
    }
  };
};
