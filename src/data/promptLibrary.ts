export interface PromptTemplate {
  id: string
  title: string
  prompt_template: string
  category: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  when_to_use: string
  why_it_works: string
  tags: string[]
  rating: number
  times_used: number
  is_featured: boolean
  author: string
  created_at: string
}

export const PROMPT_LIBRARY: PromptTemplate[] = [
  {
    id: 'email-writer-pro',
    title: 'Professional Email Writer',
    prompt_template: `You are a professional communication expert. Write a [TYPE] email for the following situation:

Context: [DESCRIBE THE SITUATION]
Recipient: [WHO YOU'RE WRITING TO]
Goal: [WHAT YOU WANT TO ACHIEVE]
Tone: [PROFESSIONAL/FRIENDLY/FORMAL]

Please write an email that:
- Has a clear, compelling subject line
- Opens with appropriate greeting
- States the purpose clearly in the first paragraph
- Provides necessary details in a logical order
- Includes a clear call-to-action
- Closes professionally

Email:`,
    category: 'Communication',
    difficulty: 'Beginner',
    when_to_use: 'When you need to write professional emails quickly and effectively',
    why_it_works: 'Provides a clear structure that ensures all important elements are included while maintaining professional tone',
    tags: ['email', 'communication', 'professional', 'business'],
    rating: 4.8,
    times_used: 1247,
    is_featured: true,
    author: 'system',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'content-strategy-generator',
    title: 'Content Strategy Generator',
    prompt_template: `Act as a content marketing strategist. Create a comprehensive content strategy for:

Business/Brand: [YOUR BUSINESS]
Target Audience: [DESCRIBE YOUR AUDIENCE]
Goals: [WHAT YOU WANT TO ACHIEVE]
Platforms: [WHERE YOU'LL PUBLISH]
Timeline: [HOW LONG/HOW OFTEN]

Please provide:
1. Content pillars (3-5 main themes)
2. Content types that work best for this audience
3. Posting frequency recommendations
4. 10 specific content ideas with headlines
5. Engagement strategies
6. Metrics to track success

Make it actionable and specific to my industry.`,
    category: 'Content Creation',
    difficulty: 'Intermediate',
    when_to_use: 'When planning content marketing campaigns or developing content calendars',
    why_it_works: 'Breaks down complex strategy into actionable components with specific deliverables',
    tags: ['content', 'marketing', 'strategy', 'social media'],
    rating: 4.6,
    times_used: 892,
    is_featured: true,
    author: 'system',
    created_at: '2024-01-20T14:30:00Z'
  },
  {
    id: 'meeting-agenda-optimizer',
    title: 'Meeting Agenda Optimizer',
    prompt_template: `You are a productivity expert specializing in efficient meetings. Create an optimized agenda for:

Meeting Type: [TEAM MEETING/CLIENT CALL/BRAINSTORM/etc.]
Duration: [HOW LONG]
Attendees: [WHO'S ATTENDING]
Main Objective: [PRIMARY GOAL]
Key Topics: [LIST MAIN TOPICS TO COVER]

Create an agenda that includes:
- Pre-meeting preparation items
- Time-boxed agenda items with specific durations
- Clear objectives for each agenda item
- Assigned roles (facilitator, note-taker, etc.)
- Decision points and action items format
- Follow-up plan

Make it efficient and ensure we achieve our objectives.`,
    category: 'Productivity',
    difficulty: 'Beginner',
    when_to_use: 'Before any important meeting to ensure it\'s productive and well-structured',
    why_it_works: 'Provides time management and clear objectives that prevent meetings from going off-track',
    tags: ['meetings', 'productivity', 'planning', 'teamwork'],
    rating: 4.7,
    times_used: 654,
    is_featured: false,
    author: 'system',
    created_at: '2024-01-25T09:15:00Z'
  },
  {
    id: 'problem-solving-framework',
    title: 'Strategic Problem Solver',
    prompt_template: `You are a strategic consultant with expertise in problem-solving frameworks. Help me analyze and solve this problem:

Problem Statement: [DESCRIBE THE PROBLEM]
Context: [BACKGROUND INFORMATION]
Constraints: [LIMITATIONS/RESOURCES]
Stakeholders: [WHO'S AFFECTED]
Timeline: [WHEN SOLUTION IS NEEDED]

Please use a structured approach:

1. Problem Analysis:
   - Root cause analysis
   - Problem breakdown
   - Impact assessment

2. Solution Generation:
   - 3-5 potential solutions
   - Pros and cons for each
   - Resource requirements

3. Recommendation:
   - Best solution with rationale
   - Implementation steps
   - Risk mitigation
   - Success metrics

4. Next Steps:
   - Immediate actions
   - Timeline
   - Stakeholder communication plan`,
    category: 'Decision Making',
    difficulty: 'Advanced',
    when_to_use: 'When facing complex business or personal problems that need systematic analysis',
    why_it_works: 'Uses proven consulting frameworks to break down complex problems into manageable components',
    tags: ['problem-solving', 'strategy', 'analysis', 'decision-making'],
    rating: 4.9,
    times_used: 423,
    is_featured: true,
    author: 'system',
    created_at: '2024-02-01T16:45:00Z'
  },
  {
    id: 'learning-plan-creator',
    title: 'Personalized Learning Plan Creator',
    prompt_template: `You are a learning and development expert. Create a personalized learning plan for:

Skill/Topic: [WHAT YOU WANT TO LEARN]
Current Level: [BEGINNER/INTERMEDIATE/ADVANCED]
Available Time: [HOURS PER WEEK]
Learning Style: [VISUAL/AUDITORY/KINESTHETIC/READING]
Goal Timeline: [WHEN YOU WANT TO ACHIEVE PROFICIENCY]
Specific Goals: [WHAT YOU WANT TO ACCOMPLISH]

Create a comprehensive plan including:

1. Learning Objectives (SMART goals)
2. Curriculum Breakdown:
   - Week-by-week topics
   - Learning resources for each topic
   - Practical exercises/projects
   - Assessment methods

3. Resource Recommendations:
   - Books, courses, videos
   - Practice platforms
   - Communities to join

4. Progress Tracking:
   - Milestones and checkpoints
   - Self-assessment methods
   - Portfolio/project ideas

5. Tips for Success:
   - Study techniques
   - Common pitfalls to avoid
   - Motivation strategies

Make it actionable and tailored to my specific situation.`,
    category: 'Learning',
    difficulty: 'Intermediate',
    when_to_use: 'When you want to learn a new skill systematically and efficiently',
    why_it_works: 'Combines learning science principles with personalized approach for maximum retention',
    tags: ['learning', 'education', 'skill-development', 'planning'],
    rating: 4.5,
    times_used: 789,
    is_featured: false,
    author: 'system',
    created_at: '2024-02-10T11:20:00Z'
  },
  {
    id: 'presentation-storyteller',
    title: 'Compelling Presentation Builder',
    prompt_template: `You are a presentation expert who specializes in storytelling and audience engagement. Help me create a compelling presentation:

Topic: [YOUR PRESENTATION TOPIC]
Audience: [WHO YOU'RE PRESENTING TO]
Duration: [HOW LONG]
Objective: [WHAT YOU WANT TO ACHIEVE]
Key Messages: [MAIN POINTS TO CONVEY]
Context: [WHERE/WHEN/WHY]

Create a presentation structure that includes:

1. Opening Hook:
   - Attention-grabbing opener
   - Clear value proposition
   - Agenda overview

2. Main Content:
   - 3-5 key sections with logical flow
   - Supporting evidence/examples
   - Visual suggestions for each section
   - Transition statements

3. Storytelling Elements:
   - Relevant anecdotes or case studies
   - Emotional connection points
   - Conflict and resolution

4. Closing:
   - Summary of key takeaways
   - Clear call-to-action
   - Memorable ending

5. Engagement Strategies:
   - Interactive elements
   - Q&A preparation
   - Audience participation ideas

Make it engaging and persuasive for my specific audience.`,
    category: 'Communication',
    difficulty: 'Intermediate',
    when_to_use: 'When preparing important presentations that need to persuade or inform effectively',
    why_it_works: 'Combines storytelling principles with presentation best practices for maximum impact',
    tags: ['presentation', 'storytelling', 'communication', 'persuasion'],
    rating: 4.4,
    times_used: 567,
    is_featured: false,
    author: 'system',
    created_at: '2024-02-15T13:10:00Z'
  }
]

export function getPromptsByCategory(category: string): PromptTemplate[] {
  return PROMPT_LIBRARY.filter(prompt => prompt.category === category)
}

export function getFeaturedPrompts(): PromptTemplate[] {
  return PROMPT_LIBRARY.filter(prompt => prompt.is_featured)
}

export function getPromptsByDifficulty(difficulty: PromptTemplate['difficulty']): PromptTemplate[] {
  return PROMPT_LIBRARY.filter(prompt => prompt.difficulty === difficulty)
}

export function searchPrompts(query: string): PromptTemplate[] {
  const lowercaseQuery = query.toLowerCase()
  return PROMPT_LIBRARY.filter(prompt =>
    prompt.title.toLowerCase().includes(lowercaseQuery) ||
    prompt.prompt_template.toLowerCase().includes(lowercaseQuery) ||
    prompt.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
    prompt.category.toLowerCase().includes(lowercaseQuery)
  )
}

export function getUniqueCategories(): string[] {
  return Array.from(new Set(PROMPT_LIBRARY.map(prompt => prompt.category))).sort()
}

export function getUniqueTags(): string[] {
  const allTags = PROMPT_LIBRARY.flatMap(prompt => prompt.tags)
  return Array.from(new Set(allTags)).sort()
}

export function getPromptById(id: string): PromptTemplate | undefined {
  return PROMPT_LIBRARY.find(prompt => prompt.id === id)
}