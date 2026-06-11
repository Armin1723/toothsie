import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY || '',
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

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
  count: number = 5,
  eli5: boolean = false
): Promise<Flashcard[]> {
  const simplicity = eli5
    ? 'Use VERY simple language — explain like the student is a 5-year-old. Use short sentences, fun analogies, and avoid jargon. Be cute and playful! 🧒'
    : 'Make questions progressively harder. Include clinical scenarios when possible.';

  const prompt = `You are a dental education expert generating flashcards for a BDS student.

Topic: ${topic}
${context ? `\nPast study context: ${context}\n` : ''}
Generate exactly ${count} high-quality flashcards covering key concepts, definitions, clinical features, and important facts.

Return ONLY valid JSON array with objects containing:
- question: the question or term to learn
- answer: concise but complete answer
- difficulty: "easy", "medium", or "hard"

${simplicity}

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

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function generateChatResponse(messages: ChatMessage[], eli5: boolean = false): Promise<string> {
  const eli5Note = eli5
    ? '\n\nIMPORTANT: Explain everything like Piyuuu is 5 years old! Use very simple words, fun analogies, and cute comparisons. Pretend you are explaining dentistry to a child. Short sentences, no jargon! 🧒✨'
    : '';

  const systemMessage = {
    role: 'system',
    content: `You are Toothsie 🦷, a friendly and enthusiastic dental study buddy for a BDS student named Piyuuu.
Your personality:
- Cheerful, encouraging, and a little silly like a cute tooth mascot
- Use dental puns and tooth-related expressions naturally
- Keep responses concise (2-4 sentences usually) and easy to understand
- Explain dental concepts clearly but simply
- Celebrate their learning progress with enthusiasm
- Never be mean or discouraging
- Use occasional emojis (🦷✨💪📚🩺) but not too many
- If you don't know something, admit it cutely and suggest asking a professor

Stay in character as a tiny tooth buddy helping Piyuuu study dentistry! 🦷${eli5Note}`,
  };

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [systemMessage, ...messages.map(m => ({ role: m.role, content: m.content } as any))],
    temperature: 0.8,
    top_p: 0.95,
    max_tokens: 1024,
    stream: false,
  } as any);

  return completion.choices[0]?.message?.content || '*Toothsie tilts head cutely, confused* 🦷❓';
}

export async function identifyHistoSlide(base64Image: string): Promise<{
  tissue: string;
  stain: string;
  magnification: string;
  features: string[];
  description: string;
  confidence: string;
}> {
  const prompt = `You are an expert oral pathologist and histologist. Analyze this histology slide image and identify:

1. **Tissue type** — what specific tissue/organ is shown (e.g., "parotid gland — serous acini", "filiform papillae of tongue", "compact bone with osteons")
2. **Stain** — what stain was likely used (e.g., H&E, Masson's Trichrome, PAS)
3. **Estimated magnification** (e.g., 40x, 100x, 400x)
4. **Key histological features** — 3-5 specific structures visible
5. **Brief educational description** — 1-2 sentences for a BDS dental student
6. **Confidence** — how certain you are (high/medium/low)

Respond ONLY with valid JSON:
{"tissue":"...","stain":"...","magnification":"...","features":["...","..."],"description":"...","confidence":"high|medium|low"}`;

  const completion = await openai.chat.completions.create({
    model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: base64Image } },
        ] as any,
      },
    ],
    temperature: 0.3,
    top_p: 0.95,
    max_tokens: 1024,
  } as any);

  const content = completion.choices[0]?.message?.content || '{}';
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return JSON.parse(content);
  } catch {
    return {
      tissue: 'Unable to identify',
      stain: 'Unknown',
      magnification: 'Unknown',
      features: ['Could not analyze the image clearly'],
      description: 'The image could not be analyzed. Please try a clearer photo of the slide.',
      confidence: 'low',
    };
  }
}

export function getUsageStats(usage: { api_calls: number; tokens_used: number }) {
  return {
    used: usage.api_calls,
    tokens_used: usage.tokens_used,
  };
}

export async function generateExamPlan(paperName: string): Promise<{
  topics: { name: string; description: string; keyPoints: string[]; studyTime: string }[];
  resources: { type: string; title: string; description: string }[];
  quiz: { question: string; options: string[]; correct: number; explanation: string }[];
  checklist: { item: string; phase: string }[];
}> {
  const prompt = `You are a senior dental education curriculum planner. A BDS student needs a complete study plan for their exam paper: "${paperName}".

Generate a comprehensive, structured study plan in valid JSON. Be thorough — this is an exam prep plan.

Return EXACTLY this JSON structure (no markdown, no code fences):

{
  "topics": [
    {
      "name": "Topic name",
      "description": "2-3 sentence overview of what this topic covers and why it matters",
      "keyPoints": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"],
      "studyTime": "Estimated hours (e.g. '3-4 hours')"
    }
  ],
  "resources": [
    {
      "type": "Textbook | YouTube | Website | Research Paper | App",
      "title": "Resource name with author/channel if applicable",
      "description": "Why this resource is useful for this paper"
    }
  ],
  "quiz": [
    {
      "question": "Multiple choice question relevant to the paper",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Brief explanation of why this answer is correct"
    }
  ],
  "checklist": [
    {
      "item": "Specific actionable study task",
      "phase": "Week 1 | Week 2 | Week 3 | Week 4 | Revision | Ongoing"
    }
  ]
}

Requirements:
- Generate 8-12 relevant topics based on the paper name
- Generate 5-8 resources with a mix of types
- Generate 10-15 quiz questions covering the topics
- Generate 15-20 checklist items across different phases
- All content must be specific to "${paperName}" for BDS dentistry
- Include clinical correlations and exam-focused content`;

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.6,
    top_p: 0.95,
    max_tokens: 8192,
    stream: false,
  } as any);

  const content = completion.choices[0]?.message?.content || '{}';
  let parsed: any;
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    else parsed = JSON.parse(content);
    if (!parsed.topics || !parsed.quiz || !parsed.checklist || !parsed.resources) {
      throw new Error('Missing required fields in exam plan');
    }
    return parsed;
  } catch {
    throw new Error('Failed to parse exam plan from AI response');
  }
}
