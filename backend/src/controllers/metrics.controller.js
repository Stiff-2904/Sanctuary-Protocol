import { getDashboardMetrics } from '../models/metrics.model.js';

export const getDashboardMetricsController = async (req, res) => {
  try {
    const camp_id = req.user.camp_id || req.query.camp_id;
    const data = await getDashboardMetrics(camp_id);
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching dashboard metrics',
      error: error.message,
    });
  }
};
