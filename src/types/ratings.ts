export interface RatingDimension {
  effectiveness: number
  clarity: number
  timeValue: number
}

export interface PromptRating {
  id: string
  user_id: string
  prompt_id: string
  prompt_type: 'book' | 'user'
  dimensions: RatingDimension
  overall_score: number
  created_at: string
  updated_at: string
}

export interface PromptFeedback {
  id: string
  user_id: string
  prompt_id: string
  prompt_type: 'book' | 'user'
  feedback_type: 'SUCCESS_STORY' | 'MODIFICATION' | 'ISSUE' | 'SUGGESTION'
  title: string
  content: string
  is_public: boolean
  helpful_count: number
  created_at: string
}

export interface RatingStats {
  total_ratings: number
  average_overall: number
  average_effectiveness: number
  average_clarity: number
  average_time_value: number
  distribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

export const RATING_DIMENSIONS = {
  effectiveness: {
    question: "Did this prompt produce useful results?",
    scale: 5,
    weight: 0.4,
    description: "How well did the prompt achieve its intended purpose?"
  },
  clarity: {
    question: "Was the prompt easy to understand and use?",
    scale: 5,
    weight: 0.3,
    description: "How clear and well-structured was the prompt?"
  },
  timeValue: {
    question: "Did this save you significant time?",
    scale: 5,
    weight: 0.3,
    description: "How much time did this prompt save you?"
  }
} as const

export const FEEDBACK_TYPES = {
  SUCCESS_STORY: {
    label: "Success Story",
    description: "This worked great! Here's how...",
    icon: "🎉",
    color: "success"
  },
  MODIFICATION: {
    label: "Modification",
    description: "I tweaked it like this...",
    icon: "🔧",
    color: "primary"
  },
  ISSUE: {
    label: "Issue",
    description: "I had trouble with...",
    icon: "⚠️",
    color: "warning"
  },
  SUGGESTION: {
    label: "Suggestion",
    description: "It would be better if...",
    icon: "💡",
    color: "info"
  }
} as const