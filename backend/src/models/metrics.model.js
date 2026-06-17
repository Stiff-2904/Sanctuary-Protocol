import { pool } from '../config/db.js';

export const getDashboardMetrics = async (camp_id) => {
  const campFilter = camp_id ? `AND camp_id = ${pool.escape(camp_id)}` : '';
  const campFilterWhere = camp_id ? `WHERE camp_id = ${pool.escape(camp_id)}` : '';

  const [[activePersons]] = await pool.query(`
    SELECT COUNT(*) AS total FROM person WHERE status = 'active' ${campFilter}
  `);

  const [[pendingAdmissions]] = await pool.query(`
    SELECT COUNT(*) AS total FROM admission_request 
    WHERE status IN ('pending', 'pending_ai_review') ${campFilter}
  `);

  const [[activeExplorations]] = await pool.query(`
    SELECT COUNT(*) AS total FROM exploration WHERE status = 'active' ${campFilter}
  `);

  const [[resources]] = await pool.query(`
    SELECT COALESCE(SUM(quantity), 0) AS total FROM inventory ${campFilterWhere}
  `);

  const [[criticalInventory]] = await pool.query(`
    SELECT COUNT(*) AS total FROM inventory 
    WHERE quantity < minimum_quantity ${campFilter}
  `);

  return {
    active_persons: activePersons.total,
    pending_admissions: pendingAdmissions.total,
    active_explorations: activeExplorations.total,
    total_resources: Number(resources.total),
    critical_inventory: criticalInventory.total,
  };
};
