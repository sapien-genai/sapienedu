export interface RatingDimension {
  effectiveness: number
  clarity: number
  timeValue: number
}

export interface PromptRating {
  id: string
  user_id: string
  prompt_id: string
  prompt_type: 'book' | 'user' | 'library'
  dimensions: RatingDimension
  overall_score: number
  created_at: string
  updated_at: string
}

export interface PromptFeedback {
  id: string
  user_id: string
  prompt_id: string
  prompt_type: 'book' | 'user' | 'library'
  feedback_type: 'SUCCESS_STORY' | 'MODIFICATION' | 'ISSUE' | 'SUGGESTION'
  title: string
  content: string
  is_public: boolean
  helpful_count: number
  created_at: string
}

export interface QuickRating {
  id: string
  user_id: string
  prompt_id: string
  prompt_type: 'book' | 'user' | 'library'
  rating: number // 1-5 stars
  created_at: string
}

export interface SuccessStory {
  id: string
  user_id: string
  prompt_id: string
  prompt_type: 'book' | 'user' | 'library'
  title: string
  description: string
  output_shared: boolean
  output_content?: string
  time_saved?: number
  is_anonymous: boolean
  is_public: boolean
  helpful_count: number
  created_at: string
}

export interface UserReward {
  id: string
  user_id: string
  action_type: 'first_rating' | 'helpful_feedback' | 'prompt_improvement' | 'success_story' | 'community_contribution'
  points_earned: number
  badge_earned?: string
  prompt_id?: string
  created_at: string
}

export interface UserLevel {
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  points_range: [number, number]
  perks: string[]
  badge: string
}

export interface RatingStats {
  total_ratings: number
  average_overall: number
  average_effectiveness: number
  average_clarity: number
  average_time_value: number
  quick_rating_average: number
  success_rate: number
  distribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
  badges: string[]
  trending_score: number
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

export const USER_REWARDS = {
  actions: {
    first_rating: { points: 10, badge: "Critic" },
    helpful_feedback: { points: 25, badge: "Contributor" },
    prompt_improvement: { points: 50, badge: "Innovator" },
    success_story: { points: 30, badge: "Success Story" },
    community_contribution: { points: 40, badge: "Community Helper" }
  },
  levels: {
    beginner: { 
      range: [0, 100] as [number, number], 
      perks: ["Access to basic prompts", "Community forum access"],
      badge: "🌱 Beginner"
    },
    intermediate: { 
      range: [101, 500] as [number, number], 
      perks: ["Early access to new prompts", "Custom collections", "Priority support"],
      badge: "🚀 Intermediate"
    },
    advanced: { 
      range: [501, 1000] as [number, number], 
      perks: ["Beta feature access", "Prompt creation tools", "Analytics dashboard"],
      badge: "⭐ Advanced"
    },
    expert: { 
      range: [1001, Infinity] as [number, number], 
      perks: ["Influence prompt development", "Exclusive events", "Revenue sharing"],
      badge: "👑 Expert"
    }
  }
} as const

export const PROMPT_BADGES = {
  trending: { label: "🔥 Trending This Week", threshold: { views: 100, timeframe: 7 } },
  community_favorite: { label: "⭐ Community Favorite", threshold: { rating: 4.5, min_ratings: 20 } },
  quick_win: { label: "⚡ Quick Win", threshold: { avg_time_saved: 30 } },
  high_success: { label: "🎯 High Success Rate", threshold: { success_rate: 0.85 } },
  time_saver: { label: "⏰ Time Saver", threshold: { avg_time_saved: 60 } },
  beginner_friendly: { label: "🌟 Beginner Friendly", threshold: { difficulty: "Beginner", rating: 4.0 } }
} as const