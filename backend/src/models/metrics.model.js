import { pool } from '../config/db.js';

export const getDashboardMetrics = async () => {
  const [[activePersons]] = await pool.query(`
    SELECT COUNT(*) AS total
    FROM person
    WHERE status = 'active'
  `);

  const [[healthyPersons]] = await pool.query(`
  SELECT COUNT(*) AS total
  FROM person
  WHERE status = 'active'
    AND health_status = 'healthy'
`);

  const [[injuredPersons]] = await pool.query(`
  SELECT COUNT(*) AS total
  FROM person
  WHERE status = 'active'
    AND health_status = 'injured'
`);

  const [[sickPersons]] = await pool.query(`
  SELECT COUNT(*) AS total
  FROM person
  WHERE status = 'active'
    AND health_status = 'sick'
`);

  const [[awayPersons]] = await pool.query(`
  SELECT COUNT(*) AS total
  FROM person
  WHERE status = 'active'
    AND health_status = 'away'
`);

  const [[pendingAdmissions]] = await pool.query(`
    SELECT COUNT(*) AS total
    FROM admission_request
    WHERE status IN ('pending', 'pending_ai_review')
  `);

  const [[activeExplorations]] = await pool.query(`
    SELECT COUNT(*) AS total
    FROM exploration
    WHERE status = 'active'
  `);

  const [[activeCamps]] = await pool.query(`
    SELECT COUNT(*) AS total
    FROM camp
    WHERE status = 'activo'
  `);

  const [[resources]] = await pool.query(`
    SELECT COALESCE(SUM(quantity), 0) AS total
    FROM inventory
  `);

  return {
    active_persons: activePersons.total,
    healthy_persons: healthyPersons.total,
    injured_persons: injuredPersons.total,
    sick_persons: sickPersons.total,
    away_persons: awayPersons.total,
    pending_admissions: pendingAdmissions.total,
    active_explorations: activeExplorations.total,
    active_camps: activeCamps.total,
    total_resources: Number(resources.total),
  };
};
