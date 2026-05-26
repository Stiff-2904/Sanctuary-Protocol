import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-demo-key',
});

export const evaluateAdmission = async (personData) => {
  const prompt = `
    Eres el sistema de seguridad de un campamento post-apocalíptico zombie.
    Debes evaluar si una persona debe ser admitida basándote en:
    
    INFORMACIÓN DE LA PERSONA:
    - Nombre: ${personData.name}
    - Edad: ${personData.age}
    - Estado de salud: ${personData.health_status}
    - Habilidades: ${personData.skills || 'Ninguna'}
    - Experiencia previa: ${personData.experience || 'Ninguna'}
    - Condición física: ${personData.physical_condition || 'Desconocida'}
    - Historial médico: ${personData.medical_history || 'Ninguno'}
    - Motivo de llegada: ${personData.reason || 'Desconocido'}
    
    REGLAS DEL CAMPAMENTO:
    1. No aceptar personas con signos de infección zombie
    2. Priorizar personas con habilidades útiles (médico, constructor, cocinero, etc.)
    3. Evaluar si representa un riesgo para el campamento
    4. Considerar su estado de salud actual
    5. Valorar su potencial contribución al campamento
    
    DECISIÓN:
    Responde EXACTAMENTE en este formato JSON:
    {
      "admitted": true/false,
      "confidence": 0.0-1.0,
      "suggested_profession": "profesión sugerida",
      "reasons": ["razón 1", "razón 2"],
      "risks": ["riesgo 1", "riesgo 2"],
      "recommendations": ["recomendación 1"]
    }
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'Eres un sistema de evaluación de seguridad para campamentos post-apocalípticos.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const decision = JSON.parse(completion.choices[0].message.content);

    return {
      ...decision,
      evaluated_at: new Date(),
      model_used: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      input_data: personData,
    };
  } catch (error) {
    console.error('Error en evaluación IA:', error);

    return evaluateWithRules(personData);
  }
};

const evaluateWithRules = (personData) => {
  let admitted = true;
  const reasons = [];
  const risks = [];
  let suggestedProfession = 'Trabajador general';

  if (
    personData.health_status === 'infectado' ||
    personData.health_status === 'sospechoso'
  ) {
    admitted = false;
    risks.push('Posible infección zombie');
  }

  const usefulSkills = [
    'médico',
    'doctor',
    'enfermero',
    'constructor',
    'cocinero',
    'mecánico',
    'electricista',
  ];
  const skills = personData.skills?.toLowerCase() || '';

  for (const skill of usefulSkills) {
    if (skills.includes(skill)) {
      suggestedProfession = skill.charAt(0).toUpperCase() + skill.slice(1);
      reasons.push(`Habilidad útil: ${skill}`);
      break;
    }
  }

  if (
    personData.health_status === 'herido grave' ||
    personData.health_status === 'enfermo crítico'
  ) {
    risks.push('Requiere atención médica inmediata');
    reasons.push('Estado de salud delicado');
  }

  if (personData.age < 12 || personData.age > 70) {
    risks.push('Edad extrema puede requerir cuidados especiales');
  }

  if (personData.physical_condition === 'pobre') {
    risks.push('Condición física limitada');
  }

  return {
    admitted,
    confidence: 0.7,
    suggested_profession: suggestedProfession,
    reasons:
      reasons.length > 0
        ? reasons
        : ['Evaluación basada en reglas del campamento'],
    risks,
    recommendations: ['Monitorear de cerca'],
    evaluated_at: new Date(),
    model_used: 'rule-based-fallback',
    input_data: personData,
  };
};

export const assignProfession = (personData, suggestedProfession) => {
  const professionRules = {
    médico: ['doctor', 'enfermero', 'paramédico', 'cirujano'],
    constructor: ['albañil', 'carpintero', 'ingeniero civil', 'arquitecto'],
    cocinero: ['chef', 'panadero', 'carnicero'],
    mecánico: ['técnico', 'ingeniero mecánico', 'electricista'],
    agricultor: ['granjero', 'jardinero', 'biólogo'],
    seguridad: ['policía', 'militar', 'guardia'],
  };

  const skills = personData.skills?.toLowerCase() || '';
  const experience = personData.experience?.toLowerCase() || '';
  const combined = `${skills} ${experience}`;

  for (const [profession, keywords] of Object.entries(professionRules)) {
    for (const keyword of keywords) {
      if (combined.includes(keyword)) {
        return profession.charAt(0).toUpperCase() + profession.slice(1);
      }
    }
  }
  return suggestedProfession || 'Trabajador general';
};
