export const AI_VIBE_CHECK_SLUG = 'ai-vibe-check-2026';
export const AI_VIBE_CHECK_PROGRAM = 'PROGRAM AI VIBE CHECK 2026';
export const AI_VIBE_CHECK_TITLE = 'AI Vibe Check 2026';
export const AI_VIBE_CHECK_DESCRIPTION =
  'Share how you use AI at work — 5 quick questions, anonymous and confidential.';

export type QuestionType = 'single' | 'multi' | 'open';

export interface ProgramOption {
  id: string;
  label: string;
}

export interface ProgramQuestion {
  id: string;
  prompt: string;
  type: QuestionType;
  options?: ProgramOption[];
  placeholder?: string;
}

export const AI_VIBE_CHECK_QUESTIONS: ProgramQuestion[] = [
  {
    id: 'q1',
    prompt: 'How often do you use AI tools in your daily work?',
    type: 'single',
    options: [
      { id: 'multiple-daily', label: 'Multiple times a day' },
      { id: 'once-daily', label: 'Once a day' },
      { id: 'few-weekly', label: 'A few times a week' },
      { id: 'rarely', label: 'Rarely' },
      { id: 'never', label: 'Never' },
    ],
  },
  {
    id: 'q2',
    prompt: 'Which AI tools do you use regularly?',
    type: 'multi',
    options: [
      { id: 'chatgpt', label: 'ChatGPT' },
      { id: 'claude', label: 'Claude' },
      { id: 'gemini', label: 'Gemini' },
      { id: 'copilot', label: 'GitHub Copilot' },
      { id: 'perplexity', label: 'Perplexity' },
      { id: 'cursor', label: 'Cursor' },
      { id: 'other', label: 'Other' },
    ],
  },
  {
    id: 'q3',
    prompt: 'What tasks do you use AI for most often?',
    type: 'multi',
    options: [
      { id: 'writing', label: 'Writing & Documentation' },
      { id: 'coding', label: 'Coding & Development' },
      { id: 'research', label: 'Research' },
      { id: 'data', label: 'Data Analysis' },
      { id: 'support', label: 'Customer Support' },
      { id: 'brainstorm', label: 'Brainstorming & Ideation' },
      { id: 'meetings', label: 'Meeting Summaries' },
      { id: 'other', label: 'Other' },
    ],
  },
  {
    id: 'q4',
    prompt: 'How much has AI improved your productivity?',
    type: 'single',
    options: [
      { id: 'significant', label: 'Significantly improved' },
      { id: 'somewhat', label: 'Somewhat improved' },
      { id: 'none', label: 'No noticeable impact' },
      { id: 'difficult', label: 'Made work more difficult' },
    ],
  },
  {
    id: 'q5',
    prompt: "What's one thing that would help you get more value from AI at work?",
    type: 'open',
    placeholder: 'Share your thoughts…',
  },
];

export type ProgramAnswers = Record<string, string | string[]>;

export function isQuestionAnswered(
  question: ProgramQuestion,
  answers: ProgramAnswers,
): boolean {
  const value = answers[question.id];
  if (question.type === 'open') {
    return typeof value === 'string' && value.trim().length > 0;
  }
  if (question.type === 'single') {
    return typeof value === 'string' && value.length > 0;
  }
  return Array.isArray(value) && value.length > 0;
}

export function countAnswered(answers: ProgramAnswers): {
  answered: number;
  unanswered: number;
  total: number;
} {
  const total = AI_VIBE_CHECK_QUESTIONS.length;
  const answered = AI_VIBE_CHECK_QUESTIONS.filter((q) =>
    isQuestionAnswered(q, answers),
  ).length;
  return { answered, unanswered: total - answered, total };
}
