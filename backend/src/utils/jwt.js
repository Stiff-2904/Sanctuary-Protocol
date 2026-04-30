import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev_secret';
const SESSION_TIMEOUT = 20 * 60 * 1000;

export const generateToken = (user) => {
  return jwt.sign(
    {
      user_id: user.user_id,
      username: user.username,
      role: user.role_name,
      camp_id: user.camp_id || null,
      lastActivity: Date.now(),
    },
    SECRET,
    { expiresIn: '24h' },
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, SECRET);
};

export const isSessionActive = (decodedToken) => {
  if (!decodedToken?.lastActivity) return false;
  const now = Date.now();
  return now - decodedToken.lastActivity < SESSION_TIMEOUT;
};
