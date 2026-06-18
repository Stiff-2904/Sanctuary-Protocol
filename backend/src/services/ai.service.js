import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const convertDecision = (decision) => {
  if (!decision) return 'REVISION_MANUAL';
  const decisionLower = decision.toLowerCase().trim();
  if (
    decisionLower.includes('approved') ||
    decisionLower.includes('aprobado')
  ) {
    return 'APROBADO';
  } else if (
    decisionLower.includes('rejected') ||
    decisionLower.includes('rechazado')
  ) {
    return 'RECHAZADO';
  }
  return 'REVISION_MANUAL';
};

export const evaluatePerson = async (personData, imageBase64 = null) => {
  if (!process.env.GROQ_API_KEY) {
    console.warn('⚠️ GROQ_API_KEY no configurada, usando mock');
    return evaluateWithMock(personData);
  }

  try {
    const age = calculateAge(personData.birth_date);
    console.log('🤖 [IA] Llamando a Groq (Llama 3.3)...');

    const prompt = `Eres el sistema de SEGURIDAD CRÍTICA de un campamento post-apocalíptico zombie.

REGLAS DE SEGURIDAD ABSOLUTAS (NO NEGOCIABLES):

REGLA 0 - EDAD MÍNIMA:
- Menores de 16 años → RECHAZAR INMEDIATAMENTE

REGLA 1 - RECHAZO INMEDIATO (CUALQUIERA DE ESTAS):
- Persona mordida (cualquier tiempo)
- Signos de infección: fiebre, comportamiento errático, heridas sospechosas
- Estado de salud: "sospechoso", "infectado", "herido crítico" o "enfermo"
- Historial médico: mordeduras o infección documentadas

REGLA 2 - SOLO si pasa Regla 0 y 1:
- Evaluar habilidades útiles
- Asignar profesión basada en habilidades

INFORMACIÓN DE LA PERSONA:
- Nombre: ${personData.name}
- Edad calculada: ${age} años
- Fecha de nacimiento: ${personData.birth_date || 'No especificada'}
- Estado de salud: ${personData.health_status}
- Condición física: ${personData.physical_condition || 'Desconocida'}
- Habilidades: ${JSON.stringify(personData.skills || [])}
- Experiencia: ${personData.experience || 'Ninguna'}
- Historial médico: ${personData.medical_history || 'Ninguno'}
- Razón de llegada: ${personData.reason || 'No especificada'}

⚠️ PRIORIDAD: La seguridad del campamento es MÁS importante que las habilidades.
Es mejor rechazar a alguien útil pero riesgoso, que aceptar a alguien que infecte todo el campamento.

Responde EXACTAMENTE en este formato JSON (sin markdown, sin explicaciones adicionales):
{
  "decision": "APROBADO" o "RECHAZADO",
  "confidence": 0.85,
  "reasoning": "explicación detallada de la decisión",
  "suggested_profession": "profesión sugerida (solo si APROBADO)",
  "profession_justification": "justificación de la profesión",
  "risk_factors": ["riesgo 1", "riesgo 2"],
  "rules_applied": ["regla aplicada 1", "regla aplicada 2"]
}`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            'Eres un sistema de evaluación de seguridad para un campamento zombie. Responde SOLO en formato JSON válido.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    });

    const response = completion.choices[0].message.content;
    console.log('✅ [IA] Respuesta recibida de Groq');

    const aiResult = JSON.parse(response);
    aiResult.decision = convertDecision(aiResult.decision);

    return {
      ...aiResult,
      ai_provider: 'groq-llama-3.3-70b',
      evaluated_at: new Date().toISOString(),
      input_data: { ...personData, calculated_age: age },
      image_analyzed: !!imageBase64,
    };
  } catch (error) {
    console.error('❌ Error en IA (Groq):', error.message);
    return evaluateWithMock(personData);
  }
};

const evaluateWithMock = (personData) => {
  const skills = personData.skills || [];
  const healthStatus = personData.health_status?.toLowerCase() || '';
  const age = calculateAge(personData.birth_date);

  let decision = 'APROBADO';
  const reasoning = [];
  const riskFactors = [];
  const rulesApplied = [];

  if (age !== null && age < 16) {
    decision = 'RECHAZADO';
    riskFactors.push(`Edad insuficiente: ${age} años (mínimo 16)`);
    rulesApplied.push('Regla de edad mínima: 16 años');
  }

  if (
    ['infectado', 'sospechoso', 'mordido', 'enfermo'].includes(healthStatus)
  ) {
    decision = 'RECHAZADO';
    riskFactors.push('Posible infección zombie');
    rulesApplied.push('Regla de seguridad: No aceptar posibles infectados');
  }

  const usefulSkills = [
    'medicina',
    'construcción',
    'combate',
    'cocina',
    'mecánica',
    'agricultura',
  ];
  const hasUsefulSkill = skills.some((s) =>
    usefulSkills.includes(s.toLowerCase()),
  );

  if (hasUsefulSkill) {
    reasoning.push('Posee habilidades valiosas para el campamento');
    rulesApplied.push('Regla de priorización: Habilidades útiles');
  }

  const professionMap = {
    Medicina: 'Médico',
    Construcción: 'Constructor',
    Cocina: 'Cocinero',
    Combate: 'Seguridad',
    Mecánica: 'Mecánico',
    Agricultura: 'Agricultor',
    Comunicaciones: 'Comunicador',
    Exploración: 'Explorador',
  };

  let suggestedProfession = 'Trabajador general';
  let professionJustification = 'Asignación por defecto';

  for (const skill of skills) {
    if (professionMap[skill]) {
      suggestedProfession = professionMap[skill];
      professionJustification = `Habilidad detectada: ${skill}`;
      reasoning.push(`Profesión sugerida basada en habilidad: ${skill}`);
      break;
    }
  }

  return {
    decision,
    confidence: decision === 'APROBADO' ? 0.85 : 0.9,
    reasoning: reasoning.join('. ') || 'Evaluación estándar completada',
    suggested_profession: suggestedProfession,
    profession_justification: professionJustification,
    risk_factors: riskFactors,
    rules_applied: rulesApplied,
    ai_provider: 'mock-rule-based',
    evaluated_at: new Date().toISOString(),
    input_data: { ...personData, calculated_age: age },
    image_analyzed: false,
  };
};

export const assignProfession = (personData, suggestedProfession) => {
  const professionRules = {
    Médico: ['medicina', 'doctor', 'enfermero', 'cirujano'],
    Constructor: ['construcción', 'albañil', 'carpintero', 'ingeniero'],
    Cocinero: ['cocina', 'chef', 'panadero'],
    Seguridad: ['combate', 'militar', 'policía', 'guía'],
    Mecánico: ['mecánica', 'técnico', 'electricista'],
    Agricultor: ['agricultura', 'granjero', 'jardinero'],
  };

  const skills = personData.skills?.join(' ').toLowerCase() || '';

  for (const [profession, keywords] of Object.entries(professionRules)) {
    for (const keyword of keywords) {
      if (skills.includes(keyword)) {
        return profession;
      }
    }
  }

  return suggestedProfession || 'Trabajador general';
};
