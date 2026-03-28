import { getCamps } from '../models/camp.model.js';

export const getCampsController = async (req, res) => {
  try {
    const camps = await getCamps();
    res.json(camps);
  } catch (error) {
    res.status(500).json({
      message: 'Error to get camps',
      error: error.message,
    });
  }
};
