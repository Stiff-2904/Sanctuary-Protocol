import { registerUser, loginUser } from '../models/auth.model.js';

// REGISTER
export const registerController = async (req, res) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      message: 'Error registering user',
      error: error.message,
    });
  }
};

// LOGIN
export const loginController = async (req, res) => {
  try {
    const result = await loginUser(req.body);
    res.json(result);
  } catch (error) {
    res.status(401).json({
      message: 'Login failed',
      error: error.message,
    });
  }
};
