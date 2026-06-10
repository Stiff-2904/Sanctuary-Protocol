import { randomUUID } from 'crypto';
import { pool } from '../config/db.js';

export const auditLogRepository = {
  async create(data, connection = null) {
    const id = randomUUID();
    const db = connection || pool;

    const campId =
      data.camp_id ||
      data.campId ||
      data.user?.campId ||
      parseInt(process.env.DEFAULT_CAMP_ID) ||
      1;

    const query = `
      INSERT INTO ia_evaluations (
        id,
        person_name,
        ai_decision,
        ai_confidence,
        ai_reasoning,
        rules_applied,
        risk_factors,
        suggested_profession,
        profession_justification,
        final_decision,
        user_override,
        user_override_reason,
        camp_id,
        evaluated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const values = [
      id,
      data.person_name,
      data.ai_decision,
      data.ai_confidence || null,
      data.ai_reasoning || null,
      data.rules_applied || '[]',
      data.risk_factors || '[]',
      data.suggested_profession || data.suggested_role || null,
      data.profession_justification || null,
      data.final_decision || 'PENDIENTE_REVISION',
      data.user_override || false,
      data.user_override_reason || null,
      campId,
    ];

    try {
      const [result] = await db.query(query, values);
      return {
        id,
        success: true,
        affectedRows: 'affectedRows' in result ? result.affectedRows : undefined,
      };
    } catch (error) {
      console.error('Error guardando auditoría IA:', error.code, error.message);
      throw new Error(`No se pudo registrar la auditoría: ${error.message}`, {
        cause: error,
      });
    }
  },

  async update(id, data) {
    const query = `
      UPDATE ia_evaluations
      SET final_decision = COALESCE(?, final_decision),
          user_override = COALESCE(?, user_override),
          user_override_reason = COALESCE(?, user_override_reason),
          updated_at = NOW()
      WHERE id = ?
    `;

    const values = [
      data.final_decision,
      data.user_override,
      data.user_override_reason,
      id,
    ];

    try {
      const [result] = await pool.query(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error actualizando auditoría:', error.message);
      throw error;
    }
  },

  async findByCamp(campId, limit = 50, offset = 0) {
    const query = `
      SELECT * FROM ia_evaluations
      WHERE camp_id = ?
      ORDER BY evaluated_at DESC
      LIMIT ? OFFSET ?
    `;

    try {
      const [rows] = await pool.query(query, [campId, limit, offset]);
      return rows;
    } catch (error) {
      console.error('Error consultando auditorías:', error.message);
      return [];
    }
  },

  async getStats(campId) {
    const query = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN ai_decision = 'APROBADO' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN user_override = TRUE THEN 1 ELSE 0 END) as overrides,
        ROUND(AVG(ai_confidence) * 100, 1) as avg_confidence
      FROM ia_evaluations
      WHERE camp_id = ?
    `;

    try {
      const [rows] = await pool.query(query, [campId]);
      return rows[0] || { total: 0, approved: 0, overrides: 0, avg_confidence: 0 };
    } catch (error) {
      console.error('Error en estadísticas:', error.message);
      return { total: 0, approved: 0, overrides: 0, avg_confidence: 0, error: true };
    }
  },
};