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
  // COMMUNICATION PROMPTS (15)
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
    id: 'difficult-conversation',
    title: 'Difficult Conversation Navigator',
    prompt_template: `You are an expert in conflict resolution and difficult conversations. Help me prepare for this challenging discussion:

Situation: [DESCRIBE THE CONFLICT OR ISSUE]
Other Party: [WHO YOU'RE TALKING TO AND THEIR PERSPECTIVE]
Your Goal: [WHAT YOU WANT TO ACHIEVE]
Constraints: [ANY LIMITATIONS OR SENSITIVITIES]

Please provide:
1. Key talking points that acknowledge their perspective
2. Phrases to de-escalate tension
3. Questions to find common ground
4. Potential objections and how to address them
5. A suggested conversation flow
6. Backup strategies if the conversation goes poorly

Make this collaborative rather than confrontational.`,
    category: 'Communication',
    difficulty: 'Advanced',
    when_to_use: 'Before having difficult conversations at work or in personal relationships',
    why_it_works: 'Structures the conversation around empathy and problem-solving rather than blame',
    tags: ['conflict-resolution', 'difficult-conversations', 'negotiation', 'empathy'],
    rating: 4.7,
    times_used: 892,
    is_featured: true,
    author: 'system',
    created_at: '2024-01-20T14:30:00Z'
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
  },
  {
    id: 'meeting-facilitator',
    title: 'Meeting Facilitator Pro',
    prompt_template: `You are an expert meeting facilitator. Help me plan and run an effective meeting:

Meeting Type: [TEAM MEETING/BRAINSTORM/DECISION/UPDATE]
Duration: [TIME AVAILABLE]
Attendees: [WHO'S ATTENDING AND THEIR ROLES]
Objective: [WHAT NEEDS TO BE ACCOMPLISHED]
Current Challenges: [ANY KNOWN ISSUES OR DYNAMICS]

Create a meeting plan with:

1. Pre-meeting preparation:
   - Agenda with time allocations
   - Materials to send in advance
   - Room setup recommendations

2. Opening (5-10 minutes):
   - Welcome and introductions
   - Agenda review and ground rules
   - Objective clarification

3. Main Activities:
   - Structured discussion methods
   - Decision-making frameworks
   - Techniques to encourage participation
   - Ways to manage dominant voices

4. Closing (5-10 minutes):
   - Summary of decisions/actions
   - Next steps assignment
   - Follow-up plan

5. Facilitation Tips:
   - Phrases to redirect discussions
   - Methods to handle conflicts
   - Ways to keep energy high

Make this meeting productive and engaging for all participants.`,
    category: 'Communication',
    difficulty: 'Intermediate',
    when_to_use: 'When you need to facilitate productive meetings and ensure all voices are heard',
    why_it_works: 'Provides structure and techniques that keep meetings focused and participatory',
    tags: ['meetings', 'facilitation', 'teamwork', 'productivity'],
    rating: 4.6,
    times_used: 423,
    is_featured: false,
    author: 'system',
    created_at: '2024-02-20T09:45:00Z'
  },
  {
    id: 'feedback-giver',
    title: 'Constructive Feedback Framework',
    prompt_template: `You are an expert in giving constructive feedback. Help me prepare feedback for this situation:

Person: [WHO YOU'RE GIVING FEEDBACK TO]
Relationship: [YOUR WORKING RELATIONSHIP]
Situation: [WHAT HAPPENED THAT NEEDS ADDRESSING]
Impact: [HOW IT AFFECTED YOU/TEAM/WORK]
Desired Outcome: [WHAT YOU WANT TO SEE CHANGE]

Structure the feedback using:

1. Opening:
   - Set positive, collaborative tone
   - State the purpose clearly
   - Ensure good timing and privacy

2. Situation Description:
   - Specific, observable behaviors
   - Avoid generalizations or assumptions
   - Focus on facts, not interpretations

3. Impact Statement:
   - How it affected you/others/work
   - Be specific about consequences
   - Use "I" statements

4. Collaborative Problem-Solving:
   - Ask for their perspective
   - Explore solutions together
   - Agree on specific next steps

5. Positive Reinforcement:
   - Acknowledge their strengths
   - Express confidence in improvement
   - Offer ongoing support

Provide specific phrases and questions to use during the conversation.`,
    category: 'Communication',
    difficulty: 'Advanced',
    when_to_use: 'When you need to give constructive feedback that leads to positive change',
    why_it_works: 'Uses proven feedback models that focus on behavior change rather than criticism',
    tags: ['feedback', 'management', 'performance', 'development'],
    rating: 4.5,
    times_used: 334,
    is_featured: false,
    author: 'system',
    created_at: '2024-02-25T11:20:00Z'
  },

  // CONTENT CREATION PROMPTS (15)
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
    id: 'blog-post-writer',
    title: 'SEO Blog Post Creator',
    prompt_template: `You are an expert content writer and SEO specialist. Create a comprehensive blog post:

Topic: [YOUR BLOG POST TOPIC]
Target Keyword: [PRIMARY KEYWORD TO RANK FOR]
Audience: [WHO WILL READ THIS]
Word Count: [DESIRED LENGTH]
Tone: [PROFESSIONAL/CASUAL/AUTHORITATIVE]

Create a blog post with:

1. SEO-optimized title (include target keyword)
2. Meta description (150-160 characters)
3. Introduction that hooks readers and includes keyword
4. 5-7 main sections with H2 headings
5. Conclusion with clear call-to-action
6. Suggested internal/external links
7. Image suggestions with alt text

Writing guidelines:
- Use target keyword naturally 3-5 times
- Include related keywords and synonyms
- Write in active voice
- Use short paragraphs (2-3 sentences)
- Include actionable tips and examples
- Add bullet points and numbered lists for readability

Make it valuable, engaging, and optimized for search engines.`,
    category: 'Content Creation',
    difficulty: 'Intermediate',
    when_to_use: 'When creating blog posts that need to rank well in search engines',
    why_it_works: 'Combines SEO best practices with engaging content structure for better rankings',
    tags: ['blogging', 'seo', 'content-writing', 'marketing'],
    rating: 4.7,
    times_used: 1156,
    is_featured: true,
    author: 'system',
    created_at: '2024-01-25T16:15:00Z'
  },
  {
    id: 'social-media-creator',
    title: 'Social Media Content Creator',
    prompt_template: `You are a social media expert. Create engaging content for this platform:

Platform: [INSTAGRAM/LINKEDIN/TWITTER/TIKTOK/FACEBOOK]
Brand Voice: [DESCRIBE YOUR BRAND PERSONALITY]
Topic/Theme: [WHAT YOU WANT TO POST ABOUT]
Goal: [AWARENESS/ENGAGEMENT/LEADS/SALES]
Target Audience: [WHO YOU'RE TRYING TO REACH]

Create content including:

1. Main Post:
   - Attention-grabbing hook
   - Valuable content body
   - Clear call-to-action
   - Relevant hashtags (platform-appropriate number)

2. Visual Suggestions:
   - Image/video concepts
   - Text overlay ideas
   - Color scheme recommendations

3. Engagement Strategy:
   - Questions to ask audience
   - Ways to encourage comments
   - Story/poll ideas for additional engagement

4. Posting Optimization:
   - Best time to post for your audience
   - Cross-platform adaptation suggestions
   - Follow-up content ideas

Make it authentic to your brand while maximizing platform-specific engagement.`,
    category: 'Content Creation',
    difficulty: 'Beginner',
    when_to_use: 'When creating social media content that drives engagement and builds community',
    why_it_works: 'Tailors content to platform-specific best practices while maintaining brand consistency',
    tags: ['social-media', 'engagement', 'marketing', 'branding'],
    rating: 4.5,
    times_used: 987,
    is_featured: false,
    author: 'system',
    created_at: '2024-02-01T10:30:00Z'
  },
  {
    id: 'video-script-writer',
    title: 'Video Script Writer',
    prompt_template: `You are a professional video script writer. Create an engaging script for:

Video Type: [EXPLAINER/TUTORIAL/PROMOTIONAL/TESTIMONIAL]
Length: [DURATION IN MINUTES]
Platform: [YOUTUBE/SOCIAL/WEBSITE/PRESENTATION]
Topic: [WHAT THE VIDEO IS ABOUT]
Audience: [WHO WILL WATCH THIS]
Goal: [WHAT YOU WANT VIEWERS TO DO]

Create a script with:

1. Hook (First 5-10 seconds):
   - Attention-grabbing opening
   - Clear value proposition
   - Reason to keep watching

2. Introduction (10-20 seconds):
   - Brief personal introduction
   - What viewers will learn
   - Why it matters to them

3. Main Content (70% of video):
   - 3-5 key points with smooth transitions
   - Visual cues and B-roll suggestions
   - Examples and demonstrations
   - Engagement moments (questions, polls)

4. Conclusion (10-15 seconds):
   - Summary of key takeaways
   - Clear call-to-action
   - Next steps for viewers

5. Production Notes:
   - Scene descriptions
   - Visual elements needed
   - Tone and pacing guidance
   - Graphics/text overlay suggestions

Make it conversational, engaging, and optimized for the target platform.`,
    category: 'Content Creation',
    difficulty: 'Intermediate',
    when_to_use: 'When creating video content that needs to educate, engage, or convert viewers',
    why_it_works: 'Structures video content for maximum retention and clear messaging',
    tags: ['video', 'scripting', 'storytelling', 'marketing'],
    rating: 4.4,
    times_used: 445,
    is_featured: false,
    author: 'system',
    created_at: '2024-02-10T14:45:00Z'
  },
  {
    id: 'newsletter-writer',
    title: 'Newsletter Content Creator',
    prompt_template: `You are an expert newsletter writer. Create an engaging newsletter:

Newsletter Name: [YOUR NEWSLETTER NAME]
Audience: [DESCRIBE YOUR SUBSCRIBERS]
Theme/Topic: [THIS ISSUE'S FOCUS]
Tone: [PROFESSIONAL/CASUAL/FRIENDLY]
Length: [SHORT/MEDIUM/LONG]

Create a newsletter with:

1. Subject Line:
   - Compelling and curiosity-driven
   - 30-50 characters for mobile
   - Avoid spam trigger words

2. Header/Greeting:
   - Personal welcome message
   - Brief context for this issue
   - What readers will gain

3. Main Content Sections:
   - 3-5 valuable content pieces
   - Mix of original insights and curated content
   - Clear section headers
   - Scannable format with bullet points

4. Featured Section:
   - Spotlight on one main topic
   - Actionable tips or insights
   - Personal story or case study

5. Community/Social Proof:
   - Subscriber highlights or testimonials
   - User-generated content
   - Social media mentions

6. Call-to-Action:
   - Clear next step for readers
   - Link to relevant content/products
   - Engagement opportunity

7. Footer:
   - Personal sign-off
   - Social media links
   - Unsubscribe information

Make it valuable, personal, and action-oriented.`,
    category: 'Content Creation',
    difficulty: 'Intermediate',
    when_to_use: 'When creating newsletters that build relationships and drive engagement',
    why_it_works: 'Balances valuable content with relationship-building and clear calls-to-action',
    tags: ['newsletter', 'email-marketing', 'content', 'engagement'],
    rating: 4.3,
    times_used: 567,
    is_featured: false,
    author: 'system',
    created_at: '2024-02-15T09:20:00Z'
  },

  // PRODUCTIVITY PROMPTS (15)
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
    id: 'task-prioritizer',
    title: 'Smart Task Prioritizer',
    prompt_template: `You are a productivity expert specializing in task management. Help me prioritize my tasks:

Current Tasks: [LIST ALL YOUR TASKS]
Deadlines: [ANY SPECIFIC DEADLINES]
Available Time: [HOW MUCH TIME YOU HAVE]
Energy Level: [HIGH/MEDIUM/LOW]
Context: [WHERE YOU'LL BE WORKING]

Analyze and prioritize using:

1. Eisenhower Matrix (Urgent/Important):
   - Quadrant 1: Urgent + Important (Do First)
   - Quadrant 2: Important + Not Urgent (Schedule)
   - Quadrant 3: Urgent + Not Important (Delegate)
   - Quadrant 4: Not Urgent + Not Important (Eliminate)

2. Time and Energy Matching:
   - High-energy tasks for peak hours
   - Low-energy tasks for downtime
   - Quick wins for momentum

3. Recommended Schedule:
   - Specific time blocks for each task
   - Buffer time for unexpected issues
   - Break scheduling for sustained productivity

4. Productivity Tips:
   - Task batching opportunities
   - Potential automation or delegation
   - Ways to minimize context switching

Provide a clear, actionable daily schedule.`,
    category: 'Productivity',
    difficulty: 'Beginner',
    when_to_use: 'When you have multiple tasks and need help deciding what to work on first',
    why_it_works: 'Uses proven prioritization frameworks to match tasks with available time and energy',
    tags: ['prioritization', 'time-management', 'planning', 'focus'],
    rating: 4.8,
    times_used: 1234,
    is_featured: true,
    author: 'system',
    created_at: '2024-01-30T11:45:00Z'
  },
  {
    id: 'workflow-optimizer',
    title: 'Workflow Optimization Expert',
    prompt_template: `You are a process improvement expert. Help me optimize this workflow:

Current Process: [DESCRIBE YOUR CURRENT WORKFLOW STEP BY STEP]
Pain Points: [WHAT'S FRUSTRATING OR SLOW]
Tools Available: [WHAT TOOLS/SOFTWARE YOU HAVE ACCESS TO]
Constraints: [ANY LIMITATIONS OR REQUIREMENTS]
Success Metrics: [HOW YOU MEASURE SUCCESS]

Analyze and improve by:

1. Process Mapping:
   - Current state workflow diagram
   - Identify bottlenecks and inefficiencies
   - Time analysis for each step

2. Optimization Opportunities:
   - Steps that can be eliminated
   - Tasks that can be automated
   - Parallel processing possibilities
   - Tool integrations to reduce friction

3. Improved Workflow:
   - Streamlined step-by-step process
   - Automation recommendations
   - Quality checkpoints
   - Error prevention measures

4. Implementation Plan:
   - Priority order for changes
   - Quick wins vs. long-term improvements
   - Training or setup requirements
   - Success measurement methods

5. Maintenance Strategy:
   - Regular review schedule
   - Continuous improvement process
   - Feedback collection methods

Provide specific, actionable recommendations for immediate improvement.`,
    category: 'Productivity',
    difficulty: 'Advanced',
    when_to_use: 'When you want to systematically improve a recurring process or workflow',
    why_it_works: 'Uses process improvement methodologies to identify and eliminate inefficiencies',
    tags: ['workflow', 'optimization', 'automation', 'efficiency'],
    rating: 4.6,
    times_used: 445,
    is_featured: false,
    author: 'system',
    created_at: '2024-02-05T15:30:00Z'
  },
  {
    id: 'focus-session-planner',
    title: 'Deep Work Session Planner',
    prompt_template: `You are a focus and deep work expert. Help me plan a productive focus session:

Task/Project: [WHAT YOU NEED TO WORK ON]
Available Time: [HOW LONG YOU HAVE]
Current Energy: [HIGH/MEDIUM/LOW]
Environment: [WHERE YOU'LL BE WORKING]
Distractions: [WHAT TYPICALLY INTERRUPTS YOU]
Goal: [WHAT YOU WANT TO ACCOMPLISH]

Create a focus session plan with:

1. Pre-Session Setup (5-10 minutes):
   - Environment preparation
   - Distraction elimination
   - Tool and resource gathering
   - Mental preparation techniques

2. Session Structure:
   - Work blocks with specific objectives
   - Strategic break timing and activities
   - Progress checkpoints
   - Momentum maintenance strategies

3. Focus Techniques:
   - Pomodoro or time-blocking approach
   - Attention management methods
   - Flow state triggers
   - Motivation maintenance

4. Distraction Management:
   - Phone and notification handling
   - Interruption protocols
   - Mental wandering redirects
   - Emergency break procedures

5. Session Wrap-up:
   - Progress review and celebration
   - Next session preparation
   - Learning capture
   - Energy restoration

Optimize for sustained attention and maximum output quality.`,
    category: 'Productivity',
    difficulty: 'Intermediate',
    when_to_use: 'When you need to do focused, high-quality work without distractions',
    why_it_works: 'Combines attention science with practical techniques for sustained focus',
    tags: ['focus', 'deep-work', 'concentration', 'time-management'],
    rating: 4.5,
    times_used: 678,
    is_featured: false,
    author: 'system',
    created_at: '2024-02-12T08:45:00Z'
  },
  {
    id: 'habit-builder',
    title: 'Habit Formation Strategist',
    prompt_template: `You are a behavioral psychology expert specializing in habit formation. Help me build this habit:

Desired Habit: [WHAT HABIT YOU WANT TO BUILD]
Current Routine: [DESCRIBE YOUR TYPICAL DAY]
Motivation: [WHY THIS HABIT MATTERS TO YOU]
Past Attempts: [WHAT YOU'VE TRIED BEFORE]
Obstacles: [WHAT GETS IN YOUR WAY]
Timeline: [WHEN YOU WANT THIS ESTABLISHED]

Create a habit formation strategy using:

1. Habit Stacking:
   - Identify existing strong habits to anchor to
   - Create "after I [existing habit], I will [new habit]" formulas
   - Multiple trigger opportunities throughout the day

2. Environment Design:
   - Physical environment modifications
   - Cue placement and visibility
   - Friction reduction for good habits
   - Friction increase for competing bad habits

3. Start Small Strategy:
   - Minimum viable habit (2-minute rule)
   - Progressive difficulty increases
   - Celebration and reward systems
   - Consistency over intensity

4. Tracking and Accountability:
   - Simple tracking methods
   - Visual progress indicators
   - Accountability partner strategies
   - Streak protection plans

5. Obstacle Prevention:
   - Common failure point identification
   - If-then planning for obstacles
   - Recovery strategies for missed days
   - Motivation maintenance techniques

Design for long-term sustainability and automatic behavior.`,
    category: 'Productivity',
    difficulty: 'Intermediate',
    when_to_use: 'When you want to build new positive habits that stick long-term',
    why_it_works: 'Uses behavioral science principles to make habit formation easier and more sustainable',
    tags: ['habits', 'behavior-change', 'self-improvement', 'consistency'],
    rating: 4.7,
    times_used: 789,
    is_featured: true,
    author: 'system',
    created_at: '2024-02-18T12:15:00Z'
  },

  // DECISION MAKING PROMPTS (10)
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
    id: 'decision-matrix',
    title: 'Decision Matrix Creator',
    prompt_template: `You are a decision analysis expert. Help me make this important decision:

Decision: [WHAT YOU NEED TO DECIDE]
Options: [LIST ALL POSSIBLE CHOICES]
Important Factors: [WHAT MATTERS MOST TO YOU]
Timeline: [WHEN YOU NEED TO DECIDE]
Stakes: [WHAT'S AT RISK]

Create a decision framework with:

1. Criteria Identification:
   - List all important decision factors
   - Weight each factor by importance (1-10)
   - Ensure criteria are measurable

2. Option Evaluation:
   - Score each option against each criterion (1-10)
   - Calculate weighted scores
   - Identify clear winner and close alternatives

3. Risk Assessment:
   - Best-case scenario for top options
   - Worst-case scenario analysis
   - Probability of different outcomes
   - Reversibility of each decision

4. Gut Check:
   - Emotional reaction to top choice
   - Alignment with values and goals
   - Long-term satisfaction prediction
   - Regret minimization analysis

5. Implementation Planning:
   - Next steps for chosen option
   - Contingency plans
   - Success metrics
   - Review and adjustment schedule

Provide clear recommendation with supporting rationale.`,
    category: 'Decision Making',
    difficulty: 'Intermediate',
    when_to_use: 'When you have multiple options and need a systematic way to evaluate them',
    why_it_works: 'Combines quantitative analysis with qualitative factors for well-rounded decisions',
    tags: ['decision-analysis', 'evaluation', 'comparison', 'strategy'],
    rating: 4.6,
    times_used: 567,
    is_featured: false,
    author: 'system',
    created_at: '2024-02-08T10:30:00Z'
  },
  {
    id: 'risk-assessor',
    title: 'Risk Assessment Expert',
    prompt_template: `You are a risk management expert. Help me assess and manage risks for:

Situation/Decision: [WHAT YOU'RE EVALUATING]
Potential Outcomes: [WHAT COULD HAPPEN]
Timeline: [WHEN RISKS MIGHT OCCUR]
Resources: [WHAT YOU HAVE TO WORK WITH]
Risk Tolerance: [HOW MUCH RISK YOU CAN ACCEPT]

Conduct a comprehensive risk assessment:

1. Risk Identification:
   - List all potential risks
   - Categorize by type (financial, operational, strategic, etc.)
   - Consider both obvious and hidden risks
   - Include positive risks (opportunities)

2. Risk Analysis:
   - Probability of each risk occurring (1-10)
   - Impact severity if it occurs (1-10)
   - Risk score (probability × impact)
   - Time sensitivity of each risk

3. Risk Prioritization:
   - High-priority risks requiring immediate attention
   - Medium-priority risks to monitor
   - Low-priority risks to acknowledge
   - Risk interdependencies

4. Mitigation Strategies:
   - Prevention measures for each high-priority risk
   - Contingency plans if risks occur
   - Risk transfer options (insurance, partnerships)
   - Acceptance strategies for unavoidable risks

5. Monitoring Plan:
   - Early warning indicators
   - Regular review schedule
   - Escalation procedures
   - Adjustment triggers

Provide actionable risk management recommendations.`,
    category: 'Decision Making',
    difficulty: 'Advanced',
    when_to_use: 'When evaluating potential risks before making important decisions or investments',
    why_it_works: 'Systematically identifies and quantifies risks to enable informed decision-making',
    tags: ['risk-management', 'analysis', 'planning', 'strategy'],
    rating: 4.4,
    times_used: 334,
    is_featured: false,
    author: 'system',
    created_at: '2024-02-14T14:20:00Z'
  },

  // LEARNING PROMPTS (10)
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
    id: 'concept-explainer',
    title: 'Complex Concept Simplifier',
    prompt_template: `You are an expert educator who excels at making complex topics simple and memorable. Help me understand:

Topic/Concept: [WHAT YOU WANT TO UNDERSTAND]
My Background: [YOUR CURRENT KNOWLEDGE LEVEL]
Learning Goal: [WHAT YOU WANT TO ACHIEVE]
Preferred Style: [ANALOGIES/EXAMPLES/STEP-BY-STEP/VISUAL]

Explain this concept using:

1. Simple Definition:
   - Clear, jargon-free explanation
   - One-sentence summary
   - Why it matters

2. Building Blocks:
   - Break into smaller components
   - Explain each part simply
   - Show how parts connect

3. Analogies and Examples:
   - Real-world comparisons
   - Concrete examples
   - Relatable scenarios

4. Common Misconceptions:
   - What people often get wrong
   - Why these mistakes happen
   - Correct understanding

5. Practice Applications:
   - How to use this knowledge
   - Practice exercises
   - Real-world applications

6. Memory Aids:
   - Mnemonics or acronyms
   - Visual representations
   - Story-based learning

Make it engaging, memorable, and immediately applicable.`,
    category: 'Learning',
    difficulty: 'Beginner',
    when_to_use: 'When you need to understand complex concepts quickly and thoroughly',
    why_it_works: 'Uses multiple learning modalities and cognitive science principles for better comprehension',
    tags: ['explanation', 'understanding', 'education', 'simplification'],
    rating: 4.7,
    times_used: 1023,
    is_featured: true,
    author: 'system',
    created_at: '2024-02-16T09:45:00Z'
  },

  // BUSINESS STRATEGY PROMPTS (10)
  {
    id: 'business-model-analyzer',
    title: 'Business Model Canvas Creator',
    prompt_template: `You are a business strategy expert. Help me develop a business model canvas for:

Business Idea: [DESCRIBE YOUR BUSINESS CONCEPT]
Target Market: [WHO YOUR CUSTOMERS ARE]
Industry: [WHAT INDUSTRY YOU'RE IN]
Stage: [IDEA/STARTUP/EXISTING BUSINESS]
Goals: [WHAT YOU WANT TO ACHIEVE]

Create a comprehensive business model canvas covering:

1. Value Propositions:
   - Core value you provide to customers
   - Problems you solve
   - Unique differentiators

2. Customer Segments:
   - Primary target customers
   - Secondary markets
   - Customer personas and needs

3. Channels:
   - How you reach customers
   - Sales and distribution methods
   - Customer touchpoints

4. Customer Relationships:
   - How you acquire customers
   - How you retain them
   - Community building strategies

5. Revenue Streams:
   - How you make money
   - Pricing strategies
   - Revenue diversification

6. Key Resources:
   - Critical assets needed
   - Intellectual property
   - Human resources

7. Key Activities:
   - Most important things you do
   - Core competencies
   - Value creation activities

8. Key Partnerships:
   - Strategic alliances
   - Supplier relationships
   - Distribution partners

9. Cost Structure:
   - Major cost categories
   - Fixed vs. variable costs
   - Cost optimization opportunities

Provide actionable insights and recommendations for each area.`,
    category: 'Business Strategy',
    difficulty: 'Advanced',
    when_to_use: 'When developing or refining your business model and strategy',
    why_it_works: 'Uses the proven Business Model Canvas framework to systematically analyze all aspects of a business',
    tags: ['business-model', 'strategy', 'planning', 'entrepreneurship'],
    rating: 4.8,
    times_used: 445,
    is_featured: true,
    author: 'system',
    created_at: '2024-02-20T13:30:00Z'
  },
  {
    id: 'competitive-analysis',
    title: 'Competitive Intelligence Analyst',
    prompt_template: `You are a competitive intelligence expert. Help me analyze the competitive landscape for:

My Business/Product: [WHAT YOU'RE ANALYZING]
Industry: [YOUR INDUSTRY]
Market: [YOUR TARGET MARKET]
Key Competitors: [LIST MAIN COMPETITORS]
Analysis Purpose: [WHY YOU NEED THIS ANALYSIS]

Conduct a comprehensive competitive analysis:

1. Competitor Identification:
   - Direct competitors (same solution)
   - Indirect competitors (alternative solutions)
   - Emerging threats
   - Substitute products/services

2. Competitor Profiles:
   - Business model and strategy
   - Strengths and weaknesses
   - Market position and share
   - Financial performance (if available)

3. Product/Service Comparison:
   - Feature comparison matrix
   - Pricing analysis
   - Quality assessment
   - Customer experience evaluation

4. Marketing and Sales Analysis:
   - Messaging and positioning
   - Marketing channels and tactics
   - Sales process and approach
   - Customer acquisition strategies

5. SWOT Analysis:
   - Your strengths vs. competitors
   - Market opportunities
   - Competitive threats
   - Strategic gaps to exploit

6. Strategic Recommendations:
   - Differentiation opportunities
   - Competitive advantages to build
   - Market positioning strategy
   - Response to competitive threats

Provide actionable insights for competitive advantage.`,
    category: 'Business Strategy',
    difficulty: 'Advanced',
    when_to_use: 'When you need to understand your competitive landscape and find strategic advantages',
    why_it_works: 'Systematically analyzes competitors to identify opportunities and threats',
    tags: ['competitive-analysis', 'market-research', 'strategy', 'positioning'],
    rating: 4.6,
    times_used: 356,
    is_featured: false,
    author: 'system',
    created_at: '2024-02-22T11:15:00Z'
  },

  // CREATIVE PROMPTS (5)
  {
    id: 'creative-brainstormer',
    title: 'Creative Brainstorming Facilitator',
    prompt_template: `You are a creative thinking expert and brainstorming facilitator. Help me generate innovative ideas for:

Challenge/Opportunity: [WHAT YOU'RE BRAINSTORMING ABOUT]
Context: [BACKGROUND AND CONSTRAINTS]
Goal: [WHAT YOU WANT TO ACHIEVE]
Audience/Users: [WHO THIS IS FOR]
Success Criteria: [HOW YOU'LL MEASURE SUCCESS]

Facilitate a structured brainstorming session:

1. Problem Reframing:
   - Restate the challenge in different ways
   - "How might we..." questions
   - Alternative perspectives to consider

2. Divergent Thinking:
   - 20+ initial ideas (quantity over quality)
   - Wild and unconventional concepts
   - Building on and combining ideas
   - Cross-industry inspiration

3. Creative Techniques:
   - SCAMPER method applications
   - Random word associations
   - Reverse brainstorming
   - Role-playing different perspectives

4. Idea Development:
   - Top 5-7 most promising concepts
   - Detailed development of each
   - Potential implementation approaches
   - Resource requirements

5. Evaluation Framework:
   - Feasibility assessment
   - Impact potential
   - Alignment with goals
   - Risk considerations

6. Next Steps:
   - Prototype or test recommendations
   - Implementation priorities
   - Success measurement plan

Generate creative, actionable solutions that push beyond obvious answers.`,
    category: 'Creative',
    difficulty: 'Intermediate',
    when_to_use: 'When you need fresh, innovative ideas for challenges or opportunities',
    why_it_works: 'Uses proven creative thinking techniques to generate and develop breakthrough ideas',
    tags: ['brainstorming', 'creativity', 'innovation', 'problem-solving'],
    rating: 4.5,
    times_used: 678,
    is_featured: false,
    author: 'system',
    created_at: '2024-02-25T15:45:00Z'
  },

  // PERSONAL DEVELOPMENT PROMPTS (5)
  {
    id: 'goal-setting-coach',
    title: 'SMART Goal Setting Coach',
    prompt_template: `You are a personal development coach specializing in goal achievement. Help me set and plan for this goal:

Goal Area: [CAREER/HEALTH/RELATIONSHIPS/FINANCIAL/PERSONAL]
Current Situation: [WHERE YOU ARE NOW]
Desired Outcome: [WHAT YOU WANT TO ACHIEVE]
Timeline: [WHEN YOU WANT TO ACHIEVE IT]
Motivation: [WHY THIS MATTERS TO YOU]
Past Attempts: [WHAT YOU'VE TRIED BEFORE]

Create a comprehensive goal achievement plan:

1. SMART Goal Refinement:
   - Specific: Exactly what you'll accomplish
   - Measurable: How you'll track progress
   - Achievable: Realistic given your situation
   - Relevant: Why this matters to your life
   - Time-bound: Clear deadlines and milestones

2. Obstacle Analysis:
   - Potential challenges and barriers
   - Internal obstacles (habits, mindset)
   - External obstacles (time, resources)
   - Strategies to overcome each obstacle

3. Action Plan:
   - Break goal into smaller milestones
   - Weekly and daily action steps
   - Resource requirements
   - Skill development needs

4. Accountability System:
   - Progress tracking methods
   - Regular review schedule
   - Accountability partners
   - Reward and consequence system

5. Motivation Maintenance:
   - Why this goal matters (deep reasons)
   - Visual reminders and cues
   - Progress celebration plan
   - Motivation renewal strategies

6. Contingency Planning:
   - What to do if you fall behind
   - How to handle setbacks
   - Plan adjustments and pivots
   - Success redefinition if needed

Make this goal inevitable through systematic planning and execution.`,
    category: 'Personal Development',
    difficulty: 'Intermediate',
    when_to_use: 'When setting important personal or professional goals that you want to actually achieve',
    why_it_works: 'Combines goal-setting science with practical implementation strategies',
    tags: ['goal-setting', 'planning', 'achievement', 'personal-development'],
    rating: 4.7,
    times_used: 892,
    is_featured: true,
    author: 'system',
    created_at: '2024-02-28T10:30:00Z'
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