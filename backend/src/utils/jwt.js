import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev_secret';

export const generateToken = (user) => {
  return jwt.sign(
    {
      user_id: user.user_id,
      role: user.role_name,
      camp_id: user.camp_id || null,
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' },
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, SECRET);
};
