import { processDailyProduction } from '../models/production.model.js';

export const processDailyProductionController = async (req, res) => {
  try {
    const { camp_id } = req.params;

    const result = await processDailyProduction(camp_id);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Error processing daily production',
      error: error.message,
    });
  }
};
