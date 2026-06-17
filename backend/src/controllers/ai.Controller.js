import { evaluatePerson, assignProfession } from '../services/ai.service.js';
import { auditLogRepository } from '../repositories/auditLog.repository.js';
import { getServerTime } from '../utils/serverTime.js';

export const evaluatePersonController = async (req, res) => {
  try {
    const { name, age, health_status, skills, context_notes, image_url } =
      req.body;

    if (!name || !age || !health_status) {
      return res.status(400).json({
        success: false,
        error: 'Datos incompletos. Se requiere nombre, edad y estado de salud',
      });
    }

    const personData = {
      name,
      age: parseInt(age),
      health_status,
      skills: skills || [],
      context_notes: context_notes || '',
      image_url: image_url || null,
    };

    const aiResult = await evaluatePerson(personData);
    const serverTime = await getServerTime();

    await auditLogRepository.create({
      person_name: name,
      ai_decision: aiResult.decision,
      ai_confidence: aiResult.confidence,
      ai_reasoning: aiResult.reasoning,
      rules_applied: JSON.stringify(aiResult.rules_applied || []),
      risk_factors: JSON.stringify(aiResult.risk_factors || []),
      suggested_profession: aiResult.suggested_profession,
      profession_justification: aiResult.profession_justification || null,
      final_decision: 'PENDIENTE_REVISION',
      user_override: false,
      user_override_reason: null,
      camp_id: req.user?.campId || process.env.DEFAULT_CAMP_ID || 1,
      evaluated_at: serverTime,
    });

    return res.status(200).json({
      success: true,
      data: aiResult,
    });
  } catch (error) {
    console.error('Error en controller de evaluación IA:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Fallo en motor de IA',
    });
  }
};

export const assignProfessionController = async (req, res) => {
  try {
    const { skills, campNeeds } = req.body;

    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere array de habilidades',
      });
    }

    const professionAssignment = await assignProfession(
      skills,
      campNeeds || {},
    );

    return res.status(200).json({
      success: true,
      data: professionAssignment,
    });
  } catch (error) {
    console.error('Error en asignación de profesión:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const confirmDecisionController = async (req, res) => {
  try {
    const { id } = req.params;
    const { final_decision, user_override_reason } = req.body;

    if (!['APROBADO', 'RECHAZADO'].includes(final_decision)) {
      return res.status(400).json({
        success: false,
        error: 'Decisión inválida',
      });
    }

    const serverTime = await getServerTime();

    // Actualizar registro de auditoría
    const updated = await auditLogRepository.update(id, {
      final_decision,
      user_override: true,
      user_override_reason: user_override_reason || null,
      updated_at: serverTime,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Registro no encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Decisión registrada correctamente',
      data: updated,
    });
  } catch (error) {
    console.error('Error al confirmar decisión:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
