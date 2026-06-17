import { registerUser, loginUser } from '../models/auth.model.js';
import { generateToken } from '../utils/jwt.js';

export const registerController = async (req, res) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const loginController = async (req, res) => {
  try {
    const { user, message } = await loginUser(req.body);

    const token = generateToken(user);

    res.json({
      success: true,
      message: message || 'Login exitoso',
      data: {
        token,
        user: {
          user_id: user.user_id,
          username: user.username,
          role: user.role,
          camp_id: user.camp_id,
        },
      },
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      message: err.message || 'Credenciales inválidas',
    });
  }
};
