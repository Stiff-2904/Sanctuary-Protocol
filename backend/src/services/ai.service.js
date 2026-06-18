import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const evaluatePerson = async (personData, imageBase64 = null) => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('️ GEMINI_API_KEY no configurada, usando mock');
    return evaluateWithMock(personData);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
    });

    const prompt = `Eres el sistema de seguridad de un campamento post-apocalíptico zombie.
Debes evaluar si una persona debe ser admitida basándote en reglas estrictas.

REGLAS DEL CAMPAMENTO:
1. NO aceptar personas con signos de infección zombie (mordeduras, fiebre alta, comportamiento errático)
2. PRIORIZAR personas con habilidades útiles (médico, constructor, cocinero, cazador, mecánico, agricultor)
3. Evaluar si representa un riesgo para el campamento
4. Considerar su estado de salud actual
5. Valorar su potencial contribución al campamento
6. La edad extrema (menores de 12 o mayores de 70) puede requerir cuidados especiales

INFORMACIÓN DE LA PERSONA:
- Nombre: ${personData.name}
- Fecha de nacimiento: ${personData.birth_date}
- Estado de salud: ${personData.health_status}
- Habilidades: ${JSON.stringify(personData.skills || [])}
- Experiencia: ${personData.experience || 'Ninguna'}
- Condición física: ${personData.physical_condition || 'Desconocida'}
- Historial médico: ${personData.medical_history || 'Ninguno'}
- Razón de llegada: ${personData.reason || 'No especificada'}

${imageBase64 ? 'IMAGEN ADJUNTA: Analiza la imagen (foto o tarjeta de identificación) y extrae información relevante sobre el estado físico, signos de infección, o detalles de la identificación.' : ''}

Responde EXACTAMENTE en este formato JSON:
{
  "decision": "approved" o "rejected",
  "confidence": 0.0 a 1.0,
  "reasoning": "explicación detallada de por qué se tomó esta decisión",
  "suggested_profession": "profesión sugerida basada en habilidades",
  "profession_justification": "por qué esa profesión es adecuada",
  "risk_factors": ["riesgo 1", "riesgo 2"],
  "rules_applied": ["regla 1 aplicada", "regla 2 aplicada"],
  "image_analysis": "análisis de la imagen si fue proporcionada"
}`;

    const content = [prompt];

    if (imageBase64) {
      content.push({
        inlineData: {
          data: imageBase64,
          mimeType: 'image/jpeg',
        },
      });
    }

    const result = await model.generateContent(content);
    const response = await result.response.text();

    const aiResult = JSON.parse(response);

    return {
      ...aiResult,
      ai_provider: 'gemini-1.5-flash',
      evaluated_at: new Date().toISOString(),
      input_data: personData,
      image_analyzed: !!imageBase64,
    };
  } catch (error) {
    console.error('❌ Error en IA (Gemini):', error.message);
    return evaluateWithMock(personData);
  }
};

const evaluateWithMock = (personData) => {
  const skills = personData.skills || [];
  const healthStatus = personData.health_status?.toLowerCase() || '';

  let decision = 'approved';
  const reasoning = [];
  const riskFactors = [];
  const rulesApplied = [];

  if (['infectado', 'sospechoso', 'mordido'].includes(healthStatus)) {
    decision = 'rejected';
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
    confidence: decision === 'approved' ? 0.85 : 0.9,
    reasoning: reasoning.join('. ') || 'Evaluación estándar completada',
    suggested_profession: suggestedProfession,
    profession_justification: professionJustification,
    risk_factors: riskFactors,
    rules_applied: rulesApplied,
    ai_provider: 'mock-rule-based',
    evaluated_at: new Date().toISOString(),
    input_data: personData,
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
