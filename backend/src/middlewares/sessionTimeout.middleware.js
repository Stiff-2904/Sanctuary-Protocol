export const checkSessionTimeout = (req, res, next) => {
  console.log('checkSessionTimeout:', {
    hasUser: !!req.user?.id,
    userId: req.user?.id,
    lastActivity: req.user?.lastActivity,
    now: Date.now(),
    diff: req.user?.lastActivity ? Date.now() - req.user.lastActivity : 'N/A',
  });
  if (!req.user?.id) {
    return next();
  }

  const now = Date.now();
  const TIMEOUT_MS = 20 * 60 * 1000;

  const lastActivity =
    req.user?.lastActivity || parseInt(req.headers['x-last-activity']) || now;

  if (now - lastActivity > TIMEOUT_MS) {
    console.warn(`Sesión expirada para usuario ${req.user.id}`);
    return res.status(401).json({ error: 'Sesión inválida o expirada' });
  }

  res.setHeader('X-Last-Activity', now.toString());
  next();
};
