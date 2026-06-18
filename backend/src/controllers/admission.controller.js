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
    console.log('🔵 Iniciando createAdmission');
    console.log('📦 Datos recibidos:', req.body);

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

    const [personResult] = await connection.query(
      `INSERT INTO person (name, birth_date, status, camp_id)
       VALUES (?, ?, 'pending', NULL)`,
      [name, birth_date],
    );
    const personId = personResult.insertId;
    console.log('✅ Persona creada:', personId);

    const [requestResult] = await connection.query(
      `INSERT INTO admission_request (person_id, camp_id, request_date, status, skills, name, birth_date)
       VALUES (?, ?, NOW(), 'pending_ai_review', ?, ?, ?)`,
      [personId, camp_id || 1, JSON.stringify(skills || []), name, birth_date],
    );
    const requestId = requestResult.insertId;
    console.log('✅ Solicitud creada:', requestId);

    console.log('🤖 Evaluando con IA...');
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
    console.log('✅ Evaluación IA completada:', aiResult.decision);

    const serverTime = await getServerTime();

    try {
      console.log('📝 Guardando en audit_log...');
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
      console.log('✅ Audit log guardado');
    } catch (auditError) {
      console.error('⚠️ Error en audit_log (no crítico):', auditError.message);
    }

    console.log('📝 Guardando en admission_evaluation...');
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
    console.log('✅ Evaluación guardada');

    await connection.commit();
    console.log('✅ Transacción completada');

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
    console.error('❌ ERROR EN createAdmission:', error);
    console.error('❌ Stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Error al procesar admisión',
      details: error.message,
    });
  } finally {
    connection.release();
  }
};

export const getAIEvaluationController = async (req, res) => {
  try {
    const { request_id } = req.params;

    const [evaluations] = await pool.query(
      `SELECT 
        ae.request_id,
        ae.ai_result,
        ae.justification as ai_reasoning,
        ae.final_decision as ai_decision,
        ae.suggested_profession,
        ae.evaluation_date as evaluated_at,
        ar.name as person_name
       FROM admission_evaluation ae
       JOIN admission_request ar ON ae.request_id = ar.request_id
       WHERE ae.request_id = ?`,
      [request_id],
    );

    if (evaluations.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Evaluación de IA no encontrada',
      });
    }

    const evaluation = evaluations[0];
    let aiData = {};

    try {
      aiData =
        typeof evaluation.ai_result === 'string'
          ? JSON.parse(evaluation.ai_result)
          : evaluation.ai_result || {};
    } catch (e) {
      console.warn('No se pudo parsear ai_result:', e.message);
    }

    res.json({
      success: true,
      data: {
        request_id: evaluation.request_id,
        ai_decision: evaluation.ai_decision,
        ai_reasoning:
          evaluation.ai_reasoning || aiData.reasoning || 'No disponible',
        ai_confidence: aiData.confidence || 0,
        suggested_profession:
          evaluation.suggested_profession || aiData.suggested_profession,
        profession_justification:
          aiData.profession_justification || 'No disponible',
        risk_factors: aiData.risk_factors || [],
        rules_applied: aiData.rules_applied || [],
        ai_provider: aiData.ai_provider || 'gemini-1.5-flash',
        evaluated_at: evaluation.evaluated_at,
        person_name: evaluation.person_name,
      },
    });
  } catch (error) {
    console.error('Error al obtener evaluación de IA:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener evaluación de IA',
      details: error.message,
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
