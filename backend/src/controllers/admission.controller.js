import { pool } from '../config/db.js';
import { evaluatePerson } from '../services/ai.service.js';
import { auditLogRepository } from '../repositories/auditLog.repository.js';
import { getServerTime } from '../utils/serverTime.js';

export const getAllAdmissions = async (req, res) => {
  try {
    const camp_id = req.user.camp_id || req.query.camp_id;

    let query = `
      SELECT ar.*, ae.ai_result, ae.justification, ae.suggested_profession
      FROM admission_request ar
      LEFT JOIN admission_evaluation ae ON ar.request_id = ae.request_id
    `;
    const params = [];

    if (camp_id) {
      query += ` WHERE ar.camp_id = ?`;
      params.push(camp_id);
    }

    query += ` ORDER BY ar.request_date DESC`;

    const [rows] = await pool.query(query, params);
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
      `SELECT ar.*, ae.ai_result, ae.justification, ae.suggested_profession
       FROM admission_request ar
       LEFT JOIN admission_evaluation ae ON ar.request_id = ae.request_id
       WHERE ar.request_id = ?`,
      [id],
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'Admission request not found' });
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
      name,
      birth_date,
      health_status,
      skills,
      experience,
      physical_condition,
      medical_history,
      reason,
      camp_id,
    } = req.body;

    // 1. Crear persona como candidata (sin campamento aún)
    const [personResult] = await connection.query(
      `INSERT INTO person (name, birth_date, status, camp_id)
       VALUES (?, ?, 'pending', NULL)`,
      [name, birth_date],
    );
    const personId = personResult.insertId;

    // 2. Crear solicitud de admisión
    const [requestResult] = await connection.query(
      `INSERT INTO admission_request (person_id, camp_id, request_date, status, skills, name, birth_date)
       VALUES (?, ?, NOW(), 'pending_ai_review', ?, ?, ?)`,
      [personId, camp_id || 1, JSON.stringify(skills || []), name, birth_date],
    );
    const requestId = requestResult.insertId;

    // 3. Evaluar con IA
    const aiResult = await evaluatePerson({
      name,
      birth_date,
      health_status,
      skills: skills || [],
      experience,
      physical_condition,
      medical_history,
      reason,
    });

    const serverTime = await getServerTime();

    // 4. Guardar en audit log
    await auditLogRepository.create(
      {
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
        camp_id: camp_id || 1,
        evaluated_at: serverTime,
      },
      connection,
    );

    // 5. Guardar evaluación
    await connection.query(
      `INSERT INTO admission_evaluation (request_id, ai_result, justification, final_decision, evaluation_date, suggested_profession)
       VALUES (?, ?, ?, ?, NOW(), ?)`,
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
        person_id: personId,
        ai_decision: aiResult.decision,
        ai_reasoning: aiResult.reasoning,
        suggested_profession: aiResult.suggested_profession,
        profession_justification: aiResult.profession_justification,
        confidence: aiResult.confidence,
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

export const getAIEvaluationController = async (req, res) => {
  try {
    const { request_id } = req.params;

    // Buscar la evaluación en la tabla ia_evaluations
    const [evaluations] = await pool.query(
      `SELECT * FROM ia_evaluations WHERE request_id = ?`,
      [request_id],
    );

    if (evaluations.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Evaluación de IA no encontrada',
      });
    }

    res.json({
      success: true,
      data: evaluations[0],
    });
  } catch (error) {
    console.error('Error al obtener evaluación de IA:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener evaluación de IA',
    });
  }
};

export const decideAdmission = async (req, res) => {
  const { id } = req.params;
  const { final_decision, user_override_reason } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `SELECT ar.*, ae.suggested_profession
       FROM admission_request ar
       LEFT JOIN admission_evaluation ae ON ar.request_id = ae.request_id
       WHERE ar.request_id = ?`,
      [id],
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'Solicitud no encontrada' });
    }

    const request = rows[0];

    await connection.query(
      `UPDATE admission_evaluation
       SET final_decision = ?,
           justification = CONCAT(IFNULL(justification, ''), ' | Override: ', ?)
       WHERE request_id = ?`,
      [final_decision, user_override_reason || 'Sin razón', id],
    );

    const dbStatus = final_decision === 'approved' ? 'approved' : 'rejected';
    await connection.query(
      `UPDATE admission_request SET status = ? WHERE request_id = ?`,
      [dbStatus, id],
    );

    if (final_decision === 'approved') {
      const [profRows] = await connection.query(
        `SELECT profession_id FROM profession WHERE name = ? LIMIT 1`,
        [request.suggested_profession],
      );
      const professionId =
        profRows.length > 0 ? profRows[0].profession_id : null;

      await connection.query(
        `UPDATE person SET camp_id = ?, profession_id = ?, status = 'active' WHERE person_id = ?`,
        [request.camp_id, professionId, request.person_id],
      );
    } else {
      await connection.query(
        `UPDATE person SET status = 'rejected' WHERE person_id = ?`,
        [request.person_id],
      );
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
