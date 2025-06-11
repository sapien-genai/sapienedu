export interface Exercise {
  id: string
  type: 'assessment' | 'timeTracking' | 'promptBuilder' | 'goals' | 'reflection' | 'habits'
  title: string
  description: string
  chapter: number
  exercise: number
  fields: ExerciseField[]
}

export interface ExerciseField {
  id: string
  type: 'text' | 'textarea' | 'number' | 'select' | 'radio' | 'checkbox' | 'rating'
  label: string
  placeholder?: string
  required?: boolean
  options?: string[]
  min?: number
  max?: number
}

export const EXERCISES: Exercise[] = [
  // Chapter 1: AI Readiness Assessment
  {
    id: 'ch1-ex1',
    type: 'assessment',
    title: 'AI Readiness Assessment',
    description: 'Evaluate your current understanding and readiness for AI integration.',
    chapter: 1,
    exercise: 1,
    fields: [
      {
        id: 'tech_comfort',
        type: 'rating',
        label: 'How comfortable are you with new technology?',
        min: 0,
        max: 3,
        required: true
      },
      {
        id: 'ai_experience',
        type: 'rating',
        label: 'How much experience do you have with AI tools?',
        min: 0,
        max: 3,
        required: true
      },
      {
        id: 'learning_time',
        type: 'rating',
        label: 'How much time can you dedicate to learning AI tools weekly?',
        min: 0,
        max: 3,
        required: true
      },
      {
        id: 'automation_goals',
        type: 'rating',
        label: 'How important is task automation to your work?',
        min: 0,
        max: 3,
        required: true
      },
      {
        id: 'data_comfort',
        type: 'rating',
        label: 'How comfortable are you with data analysis?',
        min: 0,
        max: 3,
        required: true
      }
    ]
  },
  {
    id: 'ch1-ex2',
    type: 'goals',
    title: '90-Day AI Integration Goals',
    description: 'Set your primary goals for the next 90 days of AI integration.',
    chapter: 1,
    exercise: 2,
    fields: [
      {
        id: 'goal1',
        type: 'textarea',
        label: 'Primary Goal #1',
        placeholder: 'What is your most important AI integration goal?',
        required: true
      },
      {
        id: 'goal2',
        type: 'textarea',
        label: 'Primary Goal #2',
        placeholder: 'What is your second most important goal?',
        required: true
      },
      {
        id: 'goal3',
        type: 'textarea',
        label: 'Primary Goal #3',
        placeholder: 'What is your third most important goal?',
        required: true
      }
    ]
  },
  {
    id: 'ch1-ex3',
    type: 'timeTracking',
    title: 'Current Time Baseline',
    description: 'Track time spent on repetitive tasks that could be automated.',
    chapter: 1,
    exercise: 3,
    fields: [
      {
        id: 'task_name',
        type: 'text',
        label: 'Task Name',
        placeholder: 'e.g., Writing emails, Data entry',
        required: true
      },
      {
        id: 'current_time',
        type: 'number',
        label: 'Current Time Spent (hours/week)',
        min: 0,
        required: true
      },
      {
        id: 'target_time',
        type: 'number',
        label: 'Target Time with AI (hours/week)',
        min: 0,
        required: true
      }
    ]
  },
  // Chapter 2: Prompt Engineering
  {
    id: 'ch2-ex1',
    type: 'promptBuilder',
    title: 'Your First Prompt Library',
    description: 'Create and save your most effective prompts.',
    chapter: 2,
    exercise: 1,
    fields: [
      {
        id: 'prompt_title',
        type: 'text',
        label: 'Prompt Title',
        placeholder: 'e.g., Email Writing Template',
        required: true
      },
      {
        id: 'prompt_text',
        type: 'textarea',
        label: 'Prompt Text',
        placeholder: 'Enter your complete prompt here...',
        required: true
      },
      {
        id: 'category',
        type: 'select',
        label: 'Category',
        options: ['Writing', 'Analysis', 'Creative', 'Technical', 'Communication', 'Other'],
        required: true
      },
      {
        id: 'success_rating',
        type: 'rating',
        label: 'Success Rating',
        min: 1,
        max: 5,
        required: true
      },
      {
        id: 'notes',
        type: 'textarea',
        label: 'Notes',
        placeholder: 'What worked well? What could be improved?'
      }
    ]
  },
  // Chapter 3: Daily Habits
  {
    id: 'ch3-ex1',
    type: 'habits',
    title: 'Daily AI Usage Tracker',
    description: 'Track your daily AI tool usage to build consistent habits.',
    chapter: 3,
    exercise: 1,
    fields: [
      {
        id: 'date',
        type: 'text',
        label: 'Date',
        required: true
      },
      {
        id: 'used_ai',
        type: 'checkbox',
        label: 'Used AI tools today',
        required: false
      },
      {
        id: 'tools_used',
        type: 'textarea',
        label: 'Which tools did you use?',
        placeholder: 'List the AI tools you used today...'
      },
      {
        id: 'time_saved',
        type: 'number',
        label: 'Estimated time saved (minutes)',
        min: 0
      }
    ]
  }
]

export function getExercisesByChapter(chapter: number): Exercise[] {
  return EXERCISES.filter(ex => ex.chapter === chapter)
}

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISES.find(ex => ex.id === id)
}

export function getAllChapters(): number[] {
  const chapters = EXERCISES.map(ex => ex.chapter)
  return Array.from(new Set(chapters)).sort()
}