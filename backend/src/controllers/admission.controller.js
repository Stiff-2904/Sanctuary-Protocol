import { pool } from '../config/db.js';
import { evaluatePerson, assignProfession } from '../services/ai.service.js';
import { auditLogRepository } from '../repositories/auditLog.repository.js';

export const getAllAdmissions = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM admission_request ORDER BY request_date DESC`,
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching admissions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAdmissionById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM admission_request WHERE request_id = ?`,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Admission request not found',
      });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error getting admission:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createAdmission = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {
      person_id,
      camp_id,
      name,
      age,
      health_status,
      skills,
      experience,
      physical_condition,
      medical_history,
      reason,
    } = req.body;

    const [requestResult] = await connection.query(
      `INSERT INTO admission_request (
        person_id, camp_id, request_date, status, skills, name, age, health_status
      ) VALUES (?, ?, NOW(), 'pending_ai_review', ?, ?, ?, ?)`,
      [
        person_id || null,
        camp_id || req.user?.campId || 1,
        JSON.stringify(skills || []),
        name,
        age,
        health_status,
      ],
    );
    const requestId = requestResult.insertId;

    const aiResult = await evaluatePerson({
      name,
      age,
      health_status,
      skills: skills || [],
      experience,
      medical_history,
      reason,
    });

    const auditRecord = await auditLogRepository.create({
      person_name: name,
      ai_decision: aiResult.decision,
      ai_confidence: aiResult.confidence,
      ai_reasoning: aiResult.reasoning,
      rules_applied: JSON.stringify(aiResult.rules_applied || []),
      risk_factors: JSON.stringify(aiResult.risk_factors || []),
      suggested_profession: aiResult.suggested_profession,
      profession_justification: aiResult.profession_justification,
      final_decision: 'PENDIENTE_REVISION',
      user_override: false,
      camp_id: camp_id || req.user?.campId || 1,
      evaluated_at: new Date(),
    });

    await connection.query(
      `INSERT INTO admission_evaluation (
        request_id,
        ai_result,
        justification,
        final_decision,
        evaluation_date,
        suggested_profession
      ) VALUES (?, ?, ?, ?, NOW(), ?)`,
      [
        requestId,
        JSON.stringify(aiResult),
        aiResult.reasoning || aiResult.profession_justification,
        aiResult.decision,
        aiResult.suggested_profession,
      ],
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message:
        'Solicitud creada y evaluada por IA. Pendiente de aprobación humana.',
      data: {
        request_id: requestId,
        evaluation_id: auditRecord.id,
        ai_decision: aiResult.decision,
        suggested_profession: aiResult.suggested_profession,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error en admisión:', error);
    res.status(500).json({
      success: false,
      error: 'Error al procesar admisión',
      details:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  } finally {
    connection.release();
  }
};

export const decideAdmission = async (req, res) => {
  const { requestId } = req.params;
  const { final_decision, user_override_reason } = req.body;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE admission_evaluation
       SET final_decision = ?,
           justification = CONCAT(IFNULL(justification, ''), ' | Override: ', ?)
       WHERE request_id = ?`,
      [final_decision, user_override_reason || 'Sin razón', requestId],
    );

    const dbStatus = final_decision === 'approved' ? 'approved' : 'rejected';
    await connection.query(
      `UPDATE admission_request SET status = ? WHERE request_id = ?`,
      [dbStatus, requestId],
    );

    if (final_decision === 'approved') {
      console.log(`Solicitud ${requestId} aprobada.`);
    }

    await connection.commit();

    res.json({
      success: true,
      message: `Decisión final registrada: ${final_decision}`,
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al decidir admisión:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
};
