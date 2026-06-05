import { getDashboardMetrics } from '../models/metrics.model.js';

export const getDashboardMetricsController = async (req, res) => {
  try {
    const data = await getDashboardMetrics();

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching dashboard metrics',
      error: error.message,
    });
  }
};
