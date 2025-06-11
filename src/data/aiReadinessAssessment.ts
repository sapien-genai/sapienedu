export interface AssessmentQuestion {
  id: string
  text: string
  weight: number
}

export interface AssessmentCategory {
  id: string
  name: string
  icon: string
  questions: AssessmentQuestion[]
}

export interface MaturityLevel {
  level: string
  color: string
  icon: string
  description: string
  range: [number, number]
}

export interface PersonalizedRecommendation {
  immediate: string
  thisWeek: string[]
  resources: string[]
}

export const AI_READINESS_CATEGORIES: AssessmentCategory[] = [
  {
    id: "tech_comfort",
    name: "Technology Comfort",
    icon: "💻",
    questions: [
      {
        id: "tc1",
        text: "I try new software/apps without hesitation",
        weight: 1
      },
      {
        id: "tc2", 
        text: "I can usually figure out tech without help",
        weight: 1
      },
      {
        id: "tc3",
        text: "I enjoy learning about new technologies",
        weight: 1.2
      },
      {
        id: "tc4",
        text: "I adapt quickly to software updates",
        weight: 0.8
      }
    ]
  },
  {
    id: "ai_usage",
    name: "Current AI Usage",
    icon: "🤖",
    questions: [
      {
        id: "au1",
        text: "I've used ChatGPT or similar AI tools",
        weight: 1.5
      },
      {
        id: "au2",
        text: "I've automated tasks in my work/life",
        weight: 1.2
      },
      {
        id: "au3",
        text: "I've used AI for creative projects",
        weight: 1
      },
      {
        id: "au4",
        text: "I understand basic AI capabilities",
        weight: 0.8
      }
    ]
  },
  {
    id: "time_challenges",
    name: "Time Management Challenges",
    icon: "⏰",
    questions: [
      {
        id: "tm1",
        text: "I spend too much time on repetitive tasks",
        weight: 1.3
      },
      {
        id: "tm2",
        text: "I struggle with research efficiency",
        weight: 1.1
      },
      {
        id: "tm3",
        text: "Writing tasks take longer than I'd like",
        weight: 1
      },
      {
        id: "tm4",
        text: "I wish I had more time for strategic work",
        weight: 1.2
      }
    ]
  },
  {
    id: "learning_readiness",
    name: "Learning Readiness",
    icon: "📚",
    questions: [
      {
        id: "lr1",
        text: "I set aside time for skill development",
        weight: 1.3
      },
      {
        id: "lr2",
        text: "I'm comfortable learning independently",
        weight: 1
      },
      {
        id: "lr3",
        text: "I persist through initial confusion",
        weight: 1.4
      },
      {
        id: "lr4",
        text: "I share knowledge with others",
        weight: 0.9
      }
    ]
  }
]

export const MATURITY_LEVELS: MaturityLevel[] = [
  {
    level: "AI Newcomer",
    color: "#8B5CF6",
    icon: "🌱",
    description: "Perfect starting point for your AI journey",
    range: [0, 12]
  },
  {
    level: "AI Curious",
    color: "#F59E0B", 
    icon: "💡",
    description: "Building awareness and interest in AI",
    range: [13, 24]
  },
  {
    level: "AI Explorer",
    color: "#3B82F6",
    icon: "🔍", 
    description: "Actively exploring AI capabilities",
    range: [25, 36]
  },
  {
    level: "AI Enthusiast",
    color: "#10B981",
    icon: "🚀",
    description: "Ready to integrate AI into daily workflows",
    range: [37, 48]
  }
]

export class AIReadinessScoring {
  static calculateCategoryScore(answers: { [key: string]: number }, category: AssessmentCategory): number {
    let totalScore = 0
    let totalWeight = 0
    
    category.questions.forEach(q => {
      const answer = answers[q.id] || 0
      totalScore += answer * q.weight
      totalWeight += q.weight
    })
    
    return totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) / 100 : 0
  }

  static getOverallScore(categoryScores: number[]): number {
    if (categoryScores.length === 0) return 0
    const avg = categoryScores.reduce((a, b) => a + b, 0) / categoryScores.length
    return Math.round(avg * 10) / 10
  }

  static getMaturityLevel(score: number): MaturityLevel {
    // Convert 0-3 scale to 0-48 total possible points
    const totalPossiblePoints = AI_READINESS_CATEGORIES.reduce((total, category) => {
      const categoryMaxPoints = category.questions.reduce((sum, q) => sum + (3 * q.weight), 0)
      return total + categoryMaxPoints
    }, 0)
    
    const normalizedScore = (score / 3) * totalPossiblePoints
    
    for (const level of MATURITY_LEVELS) {
      if (normalizedScore >= level.range[0] && normalizedScore <= level.range[1]) {
        return level
      }
    }
    
    return MATURITY_LEVELS[MATURITY_LEVELS.length - 1]
  }

  static getPersonalizedRecommendations(
    categoryScores: { [key: string]: number }
  ): PersonalizedRecommendation {
    // Find the weakest category
    const weakestCategory = Object.entries(categoryScores).reduce((min, [category, score]) => 
      score < min.score ? { category, score } : min,
      { category: '', score: Infinity }
    ).category

    const recommendations: { [key: string]: PersonalizedRecommendation } = {
      tech_comfort: {
        immediate: "Start with user-friendly AI tools like ChatGPT's voice mode",
        thisWeek: [
          "Watch 5-minute AI tool tutorials daily",
          "Join beginner-friendly AI communities on Discord"
        ],
        resources: [
          "Practice with one new AI feature each week",
          "Follow AI tool YouTube channels",
          "Join our beginner's AI workshop"
        ]
      },
      ai_usage: {
        immediate: "Complete the 'First AI Task' exercise in Chapter 1",
        thisWeek: [
          "Try AI for email drafting this week",
          "Experiment with AI image generation for fun"
        ],
        resources: [
          "Set a goal: Use AI for 3 different tasks this week",
          "Explore ChatGPT prompt templates",
          "Try Midjourney for creative projects"
        ]
      },
      time_challenges: {
        immediate: "Track your repetitive tasks for 3 days",
        thisWeek: [
          "Identify your #1 time waster to tackle with AI",
          "Try the Email Batch Processor prompt"
        ],
        resources: [
          "Calculate potential ROI from time savings",
          "Use automation tools like Zapier",
          "Learn about AI writing assistants"
        ]
      },
      learning_readiness: {
        immediate: "Schedule 15 minutes daily for AI practice",
        thisWeek: [
          "Find an AI learning buddy for accountability",
          "Start with the Quick Wins chapter"
        ],
        resources: [
          "Join our 90-day challenge for structure",
          "Set up a learning schedule",
          "Connect with AI learning communities"
        ]
      }
    }

    return recommendations[weakestCategory] || recommendations.tech_comfort
  }

  static getCategoryInsights(categoryScores: { [key: string]: number }): {
    strengths: string[]
    improvements: string[]
    nextSteps: string[]
  } {
    const strengths: string[] = []
    const improvements: string[] = []
    const nextSteps: string[] = []

    Object.entries(categoryScores).forEach(([category, score]) => {
      const categoryData = AI_READINESS_CATEGORIES.find(c => c.id === category)
      if (!categoryData) return

      if (score >= 2.5) {
        strengths.push(`Strong ${categoryData.name.toLowerCase()}`)
      } else if (score <= 1.5) {
        improvements.push(`Develop ${categoryData.name.toLowerCase()}`)
        nextSteps.push(`Focus on ${categoryData.name.toLowerCase()} exercises`)
      }
    })

    return { strengths, improvements, nextSteps }
  }
}