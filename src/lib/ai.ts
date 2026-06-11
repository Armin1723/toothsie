import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY || '',
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

const DAILY_LIMIT = 20;
const MODEL = 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning';

interface Flashcard {
  question: string;
  answer: string;
  difficulty: string;
}

interface CaseStudy {
  title: string;
  patient: {
    name: string;
    age: number;
    gender: string;
    occupation: string;
  };
  chief_complaint: string;
  history: string;
  clinical_findings: string;
  diagnosis: string;
  differential_diagnosis: string[];
  treatment_plan: string;
  key_learning_points: string[];
}

export async function generateFlashcards(
  topic: string,
  context: string = '',
  count: number = 5
): Promise<Flashcard[]> {
  const prompt = `You are a dental education expert generating flashcards for a BDS student.

Topic: ${topic}
${context ? `\nPast study context: ${context}\n` : ''}
Generate exactly ${count} high-quality flashcards covering key concepts, definitions, clinical features, and important facts.

Return ONLY valid JSON array with objects containing:
- question: the question or term to learn
- answer: concise but complete answer
- difficulty: "easy", "medium", or "hard"

Make questions progressively harder. Include clinical scenarios when possible.

Return format: [{"question":"...","answer":"...","difficulty":"easy"},...]`;

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.6,
    top_p: 0.95,
    max_tokens: 4096,
    stream: false,
  } as any);

  const content = completion.choices[0]?.message?.content || '[]';
  try {
    // Extract JSON from the response (may have markdown code blocks)
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(content);
  } catch {
    return [
      { question: topic, answer: content.substring(0, 200), difficulty: 'medium' }
    ];
  }
}

export async function generateCaseStudy(
  specialty: string,
  context: string = '',
  difficulty: string = 'medium'
): Promise<CaseStudy> {
  const prompt = `You are a dental education expert creating a clinical case study for a BDS student.

Specialty: ${specialty}
Difficulty: ${difficulty}
${context ? `\nPast study context: ${context}\n` : ''}
Create a realistic, educational patient case that tests clinical reasoning.

Return ONLY valid JSON with these fields:
{
  "title": "brief case title",
  "patient": {"name": "first name", "age": number, "gender": "M/F", "occupation": "job"},
  "chief_complaint": "patient's main complaint",
  "history": "detailed patient history including onset, duration, progression",
  "clinical_findings": "examination findings, vital signs, oral examination results",
  "diagnosis": "final diagnosis",
  "differential_diagnosis": ["diagnosis1", "diagnosis2", "diagnosis3"],
  "treatment_plan": "step-by-step treatment approach",
  "key_learning_points": ["point1", "point2", "point3"]
}`;

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    top_p: 0.95,
    max_tokens: 4096,
    stream: false,
  } as any);

  const content = completion.choices[0]?.message?.content || '{}';
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(content);
  } catch {
    return {
      title: `Case in ${specialty}`,
      patient: { name: 'Patient', age: 35, gender: 'F', occupation: 'Teacher' },
      chief_complaint: content.substring(0, 200),
      history: 'Details generated',
      clinical_findings: 'Examination pending',
      diagnosis: specialty,
      differential_diagnosis: [specialty],
      treatment_plan: 'Refer to specialist',
      key_learning_points: ['Review case thoroughly']
    };
  }
}

export function canMakeApiCall(usage: { api_calls: number }): boolean {
  return usage.api_calls < DAILY_LIMIT;
}

export function getRemainingCalls(usage: { api_calls: number }): number {
  return Math.max(0, DAILY_LIMIT - usage.api_calls);
}

export function getUsageStats(usage: { api_calls: number; tokens_used: number }) {
  return {
    used: usage.api_calls,
    limit: DAILY_LIMIT,
    remaining: getRemainingCalls(usage),
    tokens_used: usage.tokens_used,
    percentage: Math.round((usage.api_calls / DAILY_LIMIT) * 100),
  };
}
