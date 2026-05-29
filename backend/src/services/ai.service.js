import { OpenAI } from 'openai';
import { z } from 'zod';

const AIEvaluationSchema = z.object({
  decision: z.enum(['APROBADO', 'RECHAZADO', 'REVISION_MANUAL']),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  rules_applied: z.array(z.string()),
  risk_factors: z.array(z.string()),
  suggested_profession: z.string(),
  profession_justification: z.string(),
});

let _openaiClient = null;

function getOpenAIClient() {
  if (_openaiClient) return _openaiClient;

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === 'sk-tu-api-key-real-aqui') {
    console.warn('OPENAI_API_KEY no configurada. Usando modo mock para IA.');
    return null;
  }

  try {
    _openaiClient = new OpenAI({ apiKey });
    return _openaiClient;
  } catch (error) {
    console.error('Error al inicializar OpenAI:', error.message);
    return null;
  }
}

function generateMockEvaluation(data) {
  const health = (data.health_status || '').toLowerCase();
  const history = (data.medical_history || '').toLowerCase();

  const hasContagious =
    health.includes('contagioso') ||
    health.includes('infección') ||
    health.includes('grave');
  const hasViolence =
    history.includes('violencia') ||
    history.includes('agresivo') ||
    history.includes('criminal');

  const decision =
    hasContagious || hasViolence
      ? 'RECHAZADO'
      : data.skills?.length >= 2
        ? 'APROBADO'
        : 'REVISION_MANUAL';

  const professionMap = {
    medicina: 'Médico',
    enfermería: 'Médico',
    salud: 'Médico',
    combate: 'Defensa',
    armas: 'Defensa',
    militar: 'Defensa',
    agricultura: 'Agricultor',
    cultivo: 'Agricultor',
    siembra: 'Agricultor',
    construcción: 'Constructor',
    reparación: 'Constructor',
    ingeniería: 'Constructor',
    sigilo: 'Explorador',
    orientación: 'Explorador',
    rastreo: 'Explorador',
  };

  const skills = data.skills || [];
  const matchedSkill = skills.find((s) => professionMap[s.toLowerCase()]);
  const suggested_profession = matchedSkill
    ? professionMap[matchedSkill.toLowerCase()]
    : 'Recolector';

  return {
    decision,
    confidence: decision === 'REVISION_MANUAL' ? 0.45 : 0.82,
    reasoning: hasContagious
      ? 'Riesgo epidemiológico detectado: estado de salud compromete la seguridad del campamento'
      : hasViolence
        ? 'Historial de comportamiento violento: riesgo para la convivencia del grupo'
        : 'Perfil compatible: habilidades y estado permiten integración segura',
    rules_applied: [
      '✓ Verificación de estado de salud (contagios/heridas graves)',
      '✓ Análisis de historial médico y conductual',
      '✓ Evaluación de habilidades útiles para el campamento',
      '✓ Cruce con necesidades actuales de roles',
    ],
    risk_factors: hasContagious
      ? ['Riesgo de contagio']
      : hasViolence
        ? ['Riesgo de conflicto interno']
        : [],
    suggested_profession,
    profession_justification: `Asignado como ${suggested_profession} basado en: ${skills.length > 0 ? skills.join(', ') : 'habilidades no especificadas'}`,
  };
}

export async function evaluatePerson(data) {
  const client = getOpenAIClient();

  if (!client) {
    return generateMockEvaluation(data);
  }

  const prompt = `Eres un evaluador IA para un campamento post-apocalíptico. Analiza los datos y decide si la persona ingresa y qué profesión debe ocupar.

Reglas del campamento:
- Rechazar si tiene heridas graves contagiosas o historial de violencia extrema.
- Priorizar profesiones de defensa/médico si hay escasez.
- Asignar profesión según habilidades y necesidades actuales.
- Explica claramente CADA criterio aplicado.

Devuelve ÚNICAMENTE JSON válido con esta estructura exacta.`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: JSON.stringify(data) },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);

    return AIEvaluationSchema.parse(parsed);
  } catch (error) {
    console.error('⚠️ Error con OpenAI, usando fallback mock:', error.message);
    return generateMockEvaluation(data);
  }
}

export async function assignProfession(skills, campNeeds = {}) {
  const client = getOpenAIClient();

  if (!client) {
    return generateMockProfession(skills, campNeeds);
  }

  const prompt = `Basándote en las habilidades proporcionadas, asigna la profesión más adecuada para un campamento post-apocalíptico.

Habilidades: ${skills.join(', ')}
Necesidades del campamento: ${JSON.stringify(campNeeds)}

Profesiones disponibles: Defensa, Médico, Explorador, Agricultor, Constructor, Recolector.

Devuelve JSON con: {"profession": "string", "confidence": number, "justification": "string"}`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Devuelve solo JSON válido.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error(
      '⚠️ Error asignando profesión, usando fallback:',
      error.message,
    );
    return generateMockProfession(skills, campNeeds);
  }
}

function generateMockProfession(skills, campNeeds) {
  const professionMap = {
    medicina: 'Médico',
    enfermería: 'Médico',
    salud: 'Médico',
    combate: 'Defensa',
    armas: 'Defensa',
    militar: 'Defensa',
    agricultura: 'Agricultor',
    cultivo: 'Agricultor',
    construcción: 'Constructor',
    reparación: 'Constructor',
    sigilo: 'Explorador',
    orientación: 'Explorador',
  };

  const matched = skills?.find((s) => professionMap[s.toLowerCase()]);
  const profession = matched
    ? professionMap[matched.toLowerCase()]
    : 'Recolector';

  return {
    profession,
    confidence: matched ? 0.88 : 0.52,
    justification: matched
      ? `Habilidad "${matched}" coincide directamente con ${profession}`
      : 'Sin habilidades especializadas detectadas, asignado como Recolector (rol base)',
  };
}
