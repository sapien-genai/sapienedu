export interface Chapter {
  number: number
  title: string
  part: number
}

export interface BookPrompt {
  id: string
  chapter: number
  category: string
  title: string
  prompt: string
  tags: string[]
  pro_tip?: string
  is_from_book: boolean
  sort_order: number
}

export interface BookExercise {
  id: string
  chapter: number
  exercise_number: number
  title: string
  description: string
  type: string
  fields: any
  sort_order: number
}

export const CHAPTERS: Chapter[] = [
  { number: 1, title: "AI Readiness Assessment", part: 1 },
  { number: 2, title: "Prompt Engineering Fundamentals", part: 1 },
  { number: 3, title: "Daily AI Habits", part: 1 },
  { number: 4, title: "Content Creation with AI", part: 2 },
  { number: 5, title: "Data Analysis & Insights", part: 2 },
  { number: 6, title: "Automation Strategies", part: 2 },
  { number: 7, title: "AI Tool Selection", part: 3 },
  { number: 8, title: "Workflow Integration", part: 3 },
  { number: 9, title: "Measuring ROI", part: 3 },
  { number: 10, title: "Advanced Techniques", part: 4 },
  { number: 11, title: "Team Collaboration", part: 4 },
  { number: 12, title: "Future-Proofing", part: 4 }
]

export const BOOK_PROMPTS: BookPrompt[] = [
  // Chapter 1: AI Readiness Assessment
  {
    id: "ch1-prompt-1",
    chapter: 1,
    category: "Getting Started",
    title: "AI Readiness Self-Assessment",
    prompt: "Evaluate my current AI knowledge and readiness. Ask me 5 specific questions about my experience with AI tools, my comfort level with technology, my learning goals, and my biggest challenges. Based on my responses, provide a personalized roadmap for the next 30 days.",
    tags: ["assessment", "planning", "personalization"],
    pro_tip: "Be honest about your current skill level - this will help create a more effective learning path.",
    is_from_book: true,
    sort_order: 1
  },
  {
    id: "ch1-prompt-2",
    chapter: 1,
    category: "Goal Setting",
    title: "90-Day AI Integration Goals",
    prompt: "Help me create SMART goals for AI integration over the next 90 days. I want to focus on [specific area like writing/analysis/automation]. Break this down into weekly milestones and suggest specific AI tools to learn each week.",
    tags: ["goals", "planning", "milestones"],
    pro_tip: "Start with one primary goal and add secondary goals once you build momentum.",
    is_from_book: true,
    sort_order: 2
  },

  // Chapter 2: Prompt Engineering
  {
    id: "ch2-prompt-1",
    chapter: 2,
    category: "Prompt Engineering",
    title: "Perfect Prompt Formula",
    prompt: "You are an expert prompt engineer. Help me create a high-quality prompt for [specific task]. Use this structure: 1) Clear role definition 2) Specific context 3) Detailed instructions 4) Output format 5) Examples. Make it as effective as possible.",
    tags: ["prompt-engineering", "structure", "optimization"],
    pro_tip: "Always include examples in your prompts - they dramatically improve output quality.",
    is_from_book: true,
    sort_order: 1
  },
  {
    id: "ch2-prompt-2",
    chapter: 2,
    category: "Prompt Engineering",
    title: "Prompt Iteration and Improvement",
    prompt: "Analyze this prompt I've written: [insert your prompt]. Identify weaknesses and suggest 3 specific improvements. Then rewrite it using best practices for clarity, specificity, and effectiveness.",
    tags: ["improvement", "analysis", "optimization"],
    is_from_book: true,
    sort_order: 2
  },

  // Chapter 3: Daily AI Habits
  {
    id: "ch3-prompt-1",
    chapter: 3,
    category: "Habit Formation",
    title: "Daily AI Routine Builder",
    prompt: "Create a personalized daily AI routine for me. I have [X minutes] available each day and work in [industry/role]. Suggest specific AI tools to use, tasks to automate, and a schedule that builds sustainable habits over 30 days.",
    tags: ["habits", "routine", "scheduling"],
    pro_tip: "Start with just 10-15 minutes daily - consistency beats intensity for habit formation.",
    is_from_book: true,
    sort_order: 1
  },

  // Chapter 4: Content Creation
  {
    id: "ch4-prompt-1",
    chapter: 4,
    category: "Content Creation",
    title: "Content Strategy Generator",
    prompt: "Act as a content strategist. Help me create a 30-day content calendar for [platform/audience]. Include post ideas, optimal posting times, engagement strategies, and AI tools to streamline creation. Focus on [specific niche/topic].",
    tags: ["content", "strategy", "planning"],
    is_from_book: true,
    sort_order: 1
  },
  {
    id: "ch4-prompt-2",
    chapter: 4,
    category: "Writing",
    title: "Writing Style Analyzer",
    prompt: "Analyze my writing style from this sample: [insert text]. Then help me create content in this same voice and tone for [specific purpose]. Maintain my unique style while improving clarity and engagement.",
    tags: ["writing", "style", "voice"],
    pro_tip: "Save successful style analyses to maintain consistency across all your content.",
    is_from_book: true,
    sort_order: 2
  },

  // Chapter 5: Data Analysis
  {
    id: "ch5-prompt-1",
    chapter: 5,
    category: "Data Analysis",
    title: "Data Insights Extractor",
    prompt: "Act as a data analyst. Analyze this dataset/information: [insert data]. Identify the top 3 most important insights, explain what they mean for my business/goals, and suggest 3 specific actions I should take based on these findings.",
    tags: ["data", "analysis", "insights"],
    is_from_book: true,
    sort_order: 1
  },

  // Chapter 6: Automation
  {
    id: "ch6-prompt-1",
    chapter: 6,
    category: "Automation",
    title: "Process Automation Identifier",
    prompt: "Help me identify automation opportunities in my workflow. I'll describe my typical day/week: [insert description]. Suggest specific tasks to automate, tools to use, and estimate time savings for each automation.",
    tags: ["automation", "workflow", "efficiency"],
    pro_tip: "Start with the most repetitive, time-consuming tasks for maximum impact.",
    is_from_book: true,
    sort_order: 1
  },

  // Chapter 7: Tool Selection
  {
    id: "ch7-prompt-1",
    chapter: 7,
    category: "Tool Selection",
    title: "AI Tool Recommendation Engine",
    prompt: "Recommend the best AI tools for my specific needs: [describe your use case, budget, technical skill level]. Compare top 3 options with pros/cons, pricing, and learning curve. Include integration possibilities with my current tools: [list current tools].",
    tags: ["tools", "comparison", "recommendations"],
    is_from_book: true,
    sort_order: 1
  },

  // Chapter 8: Workflow Integration
  {
    id: "ch8-prompt-1",
    chapter: 8,
    category: "Workflow Integration",
    title: "Workflow Optimization Planner",
    prompt: "Design an optimized workflow that integrates AI tools into my current process: [describe current workflow]. Identify bottlenecks, suggest AI solutions, and create a step-by-step implementation plan with timeline and success metrics.",
    tags: ["workflow", "integration", "optimization"],
    is_from_book: true,
    sort_order: 1
  },

  // Chapter 9: ROI Measurement
  {
    id: "ch9-prompt-1",
    chapter: 9,
    category: "ROI Tracking",
    title: "AI ROI Calculator",
    prompt: "Help me calculate the ROI of my AI tool investments. I spend [amount] on AI tools and [hours] using them weekly. Help me track time saved, quality improvements, and revenue impact. Create a simple tracking system I can use monthly.",
    tags: ["roi", "tracking", "metrics"],
    is_from_book: true,
    sort_order: 1
  },

  // Chapter 10: Advanced Techniques
  {
    id: "ch10-prompt-1",
    chapter: 10,
    category: "Advanced Techniques",
    title: "Multi-Step AI Workflow",
    prompt: "Design a multi-step AI workflow for [complex task]. Break it into stages, suggest the best AI tool for each step, and create prompts that build on each other. Include quality checkpoints and optimization opportunities.",
    tags: ["advanced", "workflow", "multi-step"],
    is_from_book: true,
    sort_order: 1
  },

  // Chapter 11: Team Collaboration
  {
    id: "ch11-prompt-1",
    chapter: 11,
    category: "Team Collaboration",
    title: "Team AI Adoption Strategy",
    prompt: "Create an AI adoption strategy for my team of [size] in [industry]. Include training plan, tool rollout schedule, success metrics, and change management approach. Address common concerns and resistance points.",
    tags: ["team", "adoption", "strategy"],
    is_from_book: true,
    sort_order: 1
  },

  // Chapter 12: Future-Proofing
  {
    id: "ch12-prompt-1",
    chapter: 12,
    category: "Future Planning",
    title: "AI Future Readiness Planner",
    prompt: "Help me future-proof my AI skills and workflows. Analyze current AI trends in [my industry], predict likely developments in the next 2 years, and create a learning roadmap to stay ahead. Include emerging tools to watch.",
    tags: ["future", "trends", "planning"],
    is_from_book: true,
    sort_order: 1
  }
]

export const BOOK_EXERCISES: BookExercise[] = [
  // Chapter 1 Exercises
  {
    id: "ch1-ex1",
    chapter: 1,
    exercise_number: 1,
    title: "AI Readiness Assessment",
    description: "Complete a comprehensive assessment of your current AI knowledge and readiness.",
    type: "assessment",
    fields: {
      questions: [
        {
          id: "tech_comfort",
          type: "rating",
          label: "How comfortable are you with new technology?",
          scale: 5
        },
        {
          id: "ai_experience",
          type: "rating",
          label: "How much experience do you have with AI tools?",
          scale: 5
        },
        {
          id: "learning_goals",
          type: "textarea",
          label: "What are your main learning goals for AI integration?"
        }
      ]
    },
    sort_order: 1
  },
  {
    id: "ch1-ex2",
    chapter: 1,
    exercise_number: 2,
    title: "90-Day Goal Setting",
    description: "Set specific, measurable goals for your AI integration journey.",
    type: "planning",
    fields: {
      goals: [
        {
          id: "primary_goal",
          type: "textarea",
          label: "Primary 90-day goal"
        },
        {
          id: "weekly_milestones",
          type: "textarea",
          label: "Weekly milestones"
        }
      ]
    },
    sort_order: 2
  },

  // Chapter 2 Exercises
  {
    id: "ch2-ex1",
    chapter: 2,
    exercise_number: 1,
    title: "Prompt Engineering Practice",
    description: "Practice writing effective prompts using the framework from the chapter.",
    type: "text_input",
    fields: {
      prompts: [
        {
          id: "task_prompt",
          type: "textarea",
          label: "Write a prompt for a specific task"
        },
        {
          id: "improved_prompt",
          type: "textarea",
          label: "Improve your prompt using the framework"
        }
      ]
    },
    sort_order: 1
  },

  // Chapter 3 Exercises
  {
    id: "ch3-ex1",
    chapter: 3,
    exercise_number: 1,
    title: "Daily AI Habit Tracker",
    description: "Track your daily AI tool usage to build consistent habits.",
    type: "tracking",
    fields: {
      daily_tracking: [
        {
          id: "tools_used",
          type: "checklist",
          label: "AI tools used today"
        },
        {
          id: "time_saved",
          type: "number",
          label: "Estimated time saved (minutes)"
        }
      ]
    },
    sort_order: 1
  }
]