import { pool } from '../config/db.js';
import { evaluateAdmission, assignProfession } from '../services/ai.service.js';

export const createAdmission = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {
      name,
      age,
      health_status,
      skills,
      experience,
      physical_condition,
      medical_history,
      reason,
      image_url,
      id_card_number,
    } = req.body;

    const aiEvaluation = await evaluateAdmission({
      name,
      age,
      health_status,
      skills,
      experience,
      physical_condition,
      medical_history,
      reason,
    });

    const profession = assignProfession(
      {
        skills,
        experience,
      },
      aiEvaluation.suggested_profession,
    );

    const [admissionResult] = await connection.query(
      `INSERT INTO admissions (
        name, age, health_status, skills, experience, 
        physical_condition, medical_history, reason,
        image_url, id_card_number,
        ai_decision, ai_confidence, ai_suggested_profession,
        ai_reasons, ai_risks, ai_recommendations,
        status, evaluated_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())`,
      [
        name,
        age,
        health_status,
        skills,
        experience,
        physical_condition,
        medical_history,
        reason,
        image_url,
        id_card_number,
        aiEvaluation.admitted,
        aiEvaluation.confidence,
        profession,
        JSON.stringify(aiEvaluation.reasons),
        JSON.stringify(aiEvaluation.risks),
        JSON.stringify(aiEvaluation.recommendations),
      ],
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Solicitud de admisión evaluada',
      data: {
        admission_id: admissionResult.insertId,
        ai_evaluation: aiEvaluation,
        assigned_profession: profession,
        requires_approval: true,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error en admisión:', error);
    res.status(500).json({
      error: 'Error al procesar admisión',
      details: error.message,
    });
  } finally {
    connection.release();
  }
};

export const decideAdmission = async (req, res) => {
  const { id } = req.params;
  const { decision, override_reason } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM admissions WHERE id = ?', [
      id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Admisión no encontrada' });
    }

    const admission = rows[0];

    await pool.query(
      `UPDATE admissions 
       SET status = ?, decided_at = NOW(), override_reason = ?
       WHERE id = ?`,
      [decision === 'approved' ? 'approved' : 'rejected', override_reason, id],
    );

    if (decision === 'approved') {
      const campId = req.user.campId;

      const [profRows] = await pool.query(
        'SELECT id FROM professions WHERE name = ?',
        [admission.ai_suggested_profession],
      );

      let professionId;
      if (profRows.length > 0) {
        professionId = profRows[0].id;
      } else {
        const [newProf] = await pool.query(
          'INSERT INTO professions (name, description) VALUES (?, ?)',
          [
            admission.ai_suggested_profession,
            'Asignada automáticamente por IA',
          ],
        );
        professionId = newProf.insertId;
      }

      await pool.query(
        `INSERT INTO persons (
          camp_id, name, age, health_status, profession_id,
          status, id_card_number, created_at
        ) VALUES (?, ?, ?, ?, ?, 'active', ?, NOW())`,
        [
          campId,
          admission.name,
          admission.age,
          admission.health_status,
          professionId,
          admission.id_card_number,
        ],
      );
    }

    res.json({
      success: true,
      message: `Admisión ${decision === 'approved' ? 'aprobada' : 'rechazada'}`,
      data: { admission_id: id },
    });
  } catch (error) {
    console.error('Error al decidir admisión:', error);
    res.status(500).json({
      error: 'Error al procesar decisión',
      details: error.message,
    });
  }
};
