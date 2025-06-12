import React, { useState, useEffect } from 'react'
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Clock, 
  Users, 
  Zap, 
  CheckCircle, 
  ArrowRight, 
  BarChart3,
  Star,
  Award,
  Lightbulb,
  BookOpen,
  MessageSquare,
  Calendar,
  Share2,
  Download,
  RefreshCw,
  ChevronRight,
  AlertCircle,
  Trophy,
  Flame
} from 'lucide-react'
import { Radar, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement
} from 'chart.js'
import Badge from '@/components/ui/Badge'
import ProgressBar from '@/components/ui/ProgressBar'
import { toast } from 'sonner'

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement
)

interface AssessmentQuestion {
  id: string
  text: string
  weight: number
  category: string
}

interface AssessmentCategory {
  id: string
  name: string
  icon: string
  color: string
  description: string
  questions: AssessmentQuestion[]
}

interface MaturityLevel {
  level: string
  score: [number, number]
  color: string
  icon: string
  description: string
  characteristics: string[]
  nextSteps: string[]
}

interface UserComparison {
  percentile: number
  averageScore: number
  topPerformer: number
  industryAverage: number
}

const ASSESSMENT_CATEGORIES: AssessmentCategory[] = [
  {
    id: "tech_comfort",
    name: "Technology Comfort",
    icon: "💻",
    color: "#3B82F6",
    description: "Your comfort level with adopting and using new technologies",
    questions: [
      {
        id: "tc1",
        text: "I actively seek out and try new software tools and applications",
        weight: 1.2,
        category: "tech_comfort"
      },
      {
        id: "tc2", 
        text: "I can troubleshoot technical issues independently without help",
        weight: 1.0,
        category: "tech_comfort"
      },
      {
        id: "tc3",
        text: "I enjoy learning about emerging technologies and their applications",
        weight: 1.3,
        category: "tech_comfort"
      },
      {
        id: "tc4",
        text: "I adapt quickly when software interfaces or workflows change",
        weight: 0.9,
        category: "tech_comfort"
      }
    ]
  },
  {
    id: "ai_experience",
    name: "AI Experience",
    icon: "🤖",
    color: "#10B981",
    description: "Your current experience and familiarity with AI tools",
    questions: [
      {
        id: "ae1",
        text: "I regularly use AI tools like ChatGPT, Claude, or similar platforms",
        weight: 1.5,
        category: "ai_experience"
      },
      {
        id: "ae2",
        text: "I understand how to write effective prompts for AI systems",
        weight: 1.4,
        category: "ai_experience"
      },
      {
        id: "ae3",
        text: "I've successfully automated tasks using AI or no-code tools",
        weight: 1.2,
        category: "ai_experience"
      },
      {
        id: "ae4",
        text: "I can evaluate the quality and reliability of AI-generated content",
        weight: 1.1,
        category: "ai_experience"
      }
    ]
  },
  {
    id: "workflow_optimization",
    name: "Workflow Optimization",
    icon: "⚡",
    color: "#F59E0B",
    description: "Your ability to identify and improve inefficient processes",
    questions: [
      {
        id: "wo1",
        text: "I regularly identify repetitive tasks that could be automated",
        weight: 1.3,
        category: "workflow_optimization"
      },
      {
        id: "wo2",
        text: "I track and measure my productivity and time allocation",
        weight: 1.1,
        category: "workflow_optimization"
      },
      {
        id: "wo3",
        text: "I actively look for ways to streamline my daily workflows",
        weight: 1.2,
        category: "workflow_optimization"
      },
      {
        id: "wo4",
        text: "I'm comfortable changing established processes for better efficiency",
        weight: 1.0,
        category: "workflow_optimization"
      }
    ]
  },
  {
    id: "learning_mindset",
    name: "Learning Mindset",
    icon: "📚",
    color: "#8B5CF6",
    description: "Your approach to continuous learning and skill development",
    questions: [
      {
        id: "lm1",
        text: "I dedicate regular time to learning new skills and knowledge",
        weight: 1.3,
        category: "learning_mindset"
      },
      {
        id: "lm2",
        text: "I'm comfortable with trial and error when learning new tools",
        weight: 1.2,
        category: "learning_mindset"
      },
      {
        id: "lm3",
        text: "I persist through initial confusion when mastering new concepts",
        weight: 1.4,
        category: "learning_mindset"
      },
      {
        id: "lm4",
        text: "I actively share knowledge and help others learn new skills",
        weight: 0.9,
        category: "learning_mindset"
      }
    ]
  }
]

const MATURITY_LEVELS: MaturityLevel[] = [
  {
    level: "AI Newcomer",
    score: [0, 1.5],
    color: "#EF4444",
    icon: "🌱",
    description: "Just starting your AI journey with basic awareness",
    characteristics: [
      "Limited experience with AI tools",
      "Curious but cautious about new technology",
      "Prefers familiar workflows and processes",
      "Learning foundational concepts"
    ],
    nextSteps: [
      "Start with user-friendly AI tools like ChatGPT",
      "Complete beginner tutorials and guides",
      "Join AI learning communities",
      "Set aside 15 minutes daily for AI exploration"
    ]
  },
  {
    level: "AI Explorer",
    score: [1.5, 2.2],
    color: "#F59E0B",
    icon: "🔍",
    description: "Actively exploring AI capabilities and building confidence",
    characteristics: [
      "Experimenting with various AI tools",
      "Understanding basic prompt engineering",
      "Identifying potential use cases",
      "Building confidence through practice"
    ],
    nextSteps: [
      "Focus on 2-3 core AI tools for your work",
      "Learn advanced prompting techniques",
      "Start automating simple tasks",
      "Track time savings and productivity gains"
    ]
  },
  {
    level: "AI Practitioner",
    score: [2.2, 2.7],
    color: "#3B82F6",
    icon: "🚀",
    description: "Regularly using AI tools with growing expertise",
    characteristics: [
      "Consistent daily AI tool usage",
      "Effective at prompt engineering",
      "Successfully automated multiple workflows",
      "Sharing knowledge with others"
    ],
    nextSteps: [
      "Integrate AI into complex workflows",
      "Explore advanced AI applications",
      "Mentor others in AI adoption",
      "Measure and optimize ROI"
    ]
  },
  {
    level: "AI Innovator",
    score: [2.7, 3.0],
    color: "#10B981",
    icon: "🏆",
    description: "Leading AI adoption with advanced skills and innovation",
    characteristics: [
      "Expert-level AI tool proficiency",
      "Creating custom AI solutions",
      "Driving organizational AI strategy",
      "Continuous innovation and optimization"
    ],
    nextSteps: [
      "Develop AI governance frameworks",
      "Create custom AI workflows",
      "Lead AI transformation initiatives",
      "Contribute to AI community knowledge"
    ]
  }
]

interface AIReadinessAssessmentProps {
  onComplete?: (results: any) => void
  onSave?: (data: any) => void
  initialData?: any
  className?: string
}

export default function AIReadinessAssessment({
  onComplete,
  onSave,
  initialData,
  className = ''
}: AIReadinessAssessmentProps) {
  const [responses, setResponses] = useState<{ [key: string]: number }>({})
  const [currentCategory, setCurrentCategory] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [animateProgress, setAnimateProgress] = useState(false)
  const [userComparison, setUserComparison] = useState<UserComparison>({
    percentile: 0,
    averageScore: 0,
    topPerformer: 0,
    industryAverage: 0
  })

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setResponses(initialData)
      setShowResults(true)
    }
  }, [initialData])

  useEffect(() => {
    if (Object.keys(responses).length > 0) {
      setAnimateProgress(true)
      const timer = setTimeout(() => setAnimateProgress(false), 500)
      return () => clearTimeout(timer)
    }
  }, [responses])

  const handleResponse = (questionId: string, value: number) => {
    setResponses(prev => ({ ...prev, [questionId]: value }))
    onSave?.(responses)
  }

  const calculateCategoryScore = (categoryId: string): number => {
    const category = ASSESSMENT_CATEGORIES.find(c => c.id === categoryId)
    if (!category) return 0

    let totalScore = 0
    let totalWeight = 0

    category.questions.forEach(question => {
      const response = responses[question.id] || 0
      totalScore += response * question.weight
      totalWeight += question.weight
    })

    return totalWeight > 0 ? totalScore / totalWeight : 0
  }

  const calculateOverallScore = (): number => {
    const categoryScores = ASSESSMENT_CATEGORIES.map(cat => calculateCategoryScore(cat.id))
    return categoryScores.reduce((sum, score) => sum + score, 0) / ASSESSMENT_CATEGORIES.length
  }

  const getMaturityLevel = (): MaturityLevel => {
    const overallScore = calculateOverallScore()
    return MATURITY_LEVELS.find(level => 
      overallScore >= level.score[0] && overallScore <= level.score[1]
    ) || MATURITY_LEVELS[0]
  }

  const getCompletionPercentage = (): number => {
    const totalQuestions = ASSESSMENT_CATEGORIES.reduce((sum, cat) => sum + cat.questions.length, 0)
    const answeredQuestions = Object.keys(responses).length
    return (answeredQuestions / totalQuestions) * 100
  }

  const generateUserComparison = () => {
    // Simulate comparison data (in real app, this would come from your database)
    const overallScore = calculateOverallScore()
    const normalizedScore = (overallScore / 3) * 100

    setUserComparison({
      percentile: Math.min(95, Math.max(5, normalizedScore + Math.random() * 20 - 10)),
      averageScore: 1.8 + Math.random() * 0.4,
      topPerformer: 2.7 + Math.random() * 0.3,
      industryAverage: 1.9 + Math.random() * 0.3
    })
  }

  const completeAssessment = () => {
    if (getCompletionPercentage() < 100) {
      toast.error('Please answer all questions before completing the assessment')
      return
    }

    generateUserComparison()
    setShowResults(true)
    
    const results = {
      responses,
      categoryScores: ASSESSMENT_CATEGORIES.reduce((acc, cat) => {
        acc[cat.id] = calculateCategoryScore(cat.id)
        return acc
      }, {} as { [key: string]: number }),
      overallScore: calculateOverallScore(),
      maturityLevel: getMaturityLevel(),
      completedAt: new Date().toISOString()
    }

    onComplete?.(results)
    toast.success('Assessment completed! 🎉')
  }

  const retakeAssessment = () => {
    setResponses({})
    setShowResults(false)
    setCurrentCategory(0)
    toast.info('Assessment reset. You can now retake it.')
  }

  const getRadarChartData = () => {
    const categoryScores = ASSESSMENT_CATEGORIES.map(cat => calculateCategoryScore(cat.id))
    
    return {
      labels: ASSESSMENT_CATEGORIES.map(cat => cat.name),
      datasets: [
        {
          label: 'Your Score',
          data: categoryScores,
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(59, 130, 246, 1)'
        },
        {
          label: 'Industry Average',
          data: [1.9, 1.7, 2.1, 1.8],
          backgroundColor: 'rgba(156, 163, 175, 0.1)',
          borderColor: 'rgba(156, 163, 175, 0.8)',
          borderWidth: 1,
          borderDash: [5, 5],
          pointBackgroundColor: 'rgba(156, 163, 175, 0.8)',
          pointBorderColor: '#fff'
        }
      ]
    }
  }

  const getComparisonChartData = () => {
    const overallScore = calculateOverallScore()
    
    return {
      labels: ['You', 'Industry Average', 'Top 10%'],
      datasets: [{
        data: [overallScore, userComparison.industryAverage, userComparison.topPerformer],
        backgroundColor: ['#3B82F6', '#9CA3AF', '#10B981'],
        borderWidth: 0
      }]
    }
  }

  const exportResults = () => {
    const results = {
      assessment: 'AI Readiness Assessment',
      completedAt: new Date().toISOString(),
      overallScore: calculateOverallScore(),
      maturityLevel: getMaturityLevel(),
      categoryScores: ASSESSMENT_CATEGORIES.reduce((acc, cat) => {
        acc[cat.id] = {
          name: cat.name,
          score: calculateCategoryScore(cat.id)
        }
        return acc
      }, {} as any),
      responses,
      userComparison
    }

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-readiness-assessment-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Assessment results exported!')
  }

  const shareResults = () => {
    const maturityLevel = getMaturityLevel()
    const shareText = `🤖 I just completed my AI Readiness Assessment!

📊 Maturity Level: ${maturityLevel.level}
⭐ Overall Score: ${calculateOverallScore().toFixed(1)}/3.0
📈 Percentile: ${Math.round(userComparison.percentile)}th

Ready to transform my workflow with AI! 🚀

#AIReadiness #ProductivityTransformation #AIAdoption`

    if (navigator.share) {
      navigator.share({
        title: 'My AI Readiness Assessment Results',
        text: shareText
      })
    } else {
      navigator.clipboard.writeText(shareText)
      toast.success('Results copied to clipboard!')
    }
  }

  if (showResults) {
    const maturityLevel = getMaturityLevel()
    const overallScore = calculateOverallScore()
    const categoryScores = ASSESSMENT_CATEGORIES.map(cat => ({
      ...cat,
      score: calculateCategoryScore(cat.id)
    }))

    return (
      <div className={`space-y-8 ${className}`}>
        {/* Results Header */}
        <div className="text-center">
          <div 
            className="inline-flex items-center justify-center w-32 h-32 rounded-full text-6xl mb-6 shadow-xl animate-bounce"
            style={{ 
              backgroundColor: `${maturityLevel.color}20`, 
              border: `4px solid ${maturityLevel.color}`,
              animation: 'bounce 2s infinite'
            }}
          >
            {maturityLevel.icon}
          </div>
          <h2 className="text-4xl font-bold mb-4" style={{ color: maturityLevel.color }}>
            {maturityLevel.level}
          </h2>
          <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
            {maturityLevel.description}
          </p>
          <div className="flex items-center justify-center space-x-8 text-lg">
            <div className="flex items-center">
              <Star className="w-6 h-6 text-yellow-500 mr-2" />
              <span className="font-semibold">{overallScore.toFixed(1)}/3.0</span>
            </div>
            <div className="flex items-center">
              <Trophy className="w-6 h-6 text-purple-500 mr-2" />
              <span className="font-semibold">{Math.round(userComparison.percentile)}th percentile</span>
            </div>
            <div className="flex items-center">
              <Users className="w-6 h-6 text-blue-500 mr-2" />
              <span className="font-semibold">vs {userComparison.industryAverage.toFixed(1)} avg</span>
            </div>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="card">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Your AI Readiness Profile</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-80">
              <Radar
                data={getRadarChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  },
                  scales: {
                    r: {
                      beginAtZero: true,
                      max: 3,
                      ticks: {
                        stepSize: 0.5
                      }
                    }
                  }
                }}
              />
            </div>
            <div className="space-y-4">
              {categoryScores.map(category => (
                <div key={category.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{category.icon}</span>
                    <div>
                      <div className="font-semibold text-gray-900">{category.name}</div>
                      <div className="text-sm text-gray-600">{category.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold" style={{ color: category.color }}>
                      {category.score.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-500">/ 3.0</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-6">How You Compare</h3>
            <div className="h-64">
              <Doughnut
                data={getComparisonChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          return `${context.label}: ${context.parsed.toFixed(1)}/3.0`
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Key Insights</h3>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center text-green-800 mb-2">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="font-semibold">Strengths</span>
                </div>
                <ul className="text-sm text-green-700 space-y-1">
                  {categoryScores
                    .filter(cat => cat.score >= 2.0)
                    .map(cat => (
                      <li key={cat.id}>• Strong {cat.name.toLowerCase()}</li>
                    ))}
                  {categoryScores.filter(cat => cat.score >= 2.0).length === 0 && (
                    <li>• Building solid foundation across all areas</li>
                  )}
                </ul>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center text-yellow-800 mb-2">
                  <Target className="w-5 h-5 mr-2" />
                  <span className="font-semibold">Growth Opportunities</span>
                </div>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {categoryScores
                    .filter(cat => cat.score < 2.0)
                    .sort((a, b) => a.score - b.score)
                    .slice(0, 2)
                    .map(cat => (
                      <li key={cat.id}>• Focus on {cat.name.toLowerCase()}</li>
                    ))}
                  {categoryScores.filter(cat => cat.score < 2.0).length === 0 && (
                    <li>• Continue advancing all areas to expert level</li>
                  )}
                </ul>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center text-blue-800 mb-2">
                  <Lightbulb className="w-5 h-5 mr-2" />
                  <span className="font-semibold">Recommendations</span>
                </div>
                <ul className="text-sm text-blue-700 space-y-1">
                  {maturityLevel.nextSteps.slice(0, 3).map((step, index) => (
                    <li key={index}>• {step}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Characteristics & Next Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Your Profile Characteristics</h3>
            <div className="space-y-3">
              {maturityLevel.characteristics.map((characteristic, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{characteristic}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Recommended Next Steps</h3>
            <div className="space-y-3">
              {maturityLevel.nextSteps.map((step, index) => (
                <div key={index} className="flex items-start">
                  <ArrowRight className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 pt-8 border-t border-gray-200">
          <button
            onClick={retakeAssessment}
            className="btn-secondary flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retake Assessment
          </button>
          <button
            onClick={exportResults}
            className="btn-secondary flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Results
          </button>
          <button
            onClick={shareResults}
            className="btn-secondary flex items-center"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Results
          </button>
          <button
            onClick={() => window.location.href = '/exercises'}
            className="btn-primary flex items-center"
          >
            Continue Learning Journey
            <ChevronRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    )
  }

  const completionPercentage = getCompletionPercentage()
  const currentCat = ASSESSMENT_CATEGORIES[currentCategory]

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Progress Header */}
      <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">AI Readiness Assessment</h2>
          <Badge variant="default" size="lg">
            {Math.round(completionPercentage)}% Complete
          </Badge>
        </div>
        <ProgressBar 
          progress={completionPercentage} 
          size="lg" 
          className={`mb-4 ${animateProgress ? 'animate-pulse' : ''}`}
        />
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {Object.keys(responses).length} of {ASSESSMENT_CATEGORIES.reduce((sum, cat) => sum + cat.questions.length, 0)} questions answered
          </span>
          <span>
            Category {currentCategory + 1} of {ASSESSMENT_CATEGORIES.length}
          </span>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {ASSESSMENT_CATEGORIES.map((category, index) => {
          const categoryQuestions = category.questions
          const answeredInCategory = categoryQuestions.filter(q => responses[q.id] !== undefined).length
          const categoryComplete = answeredInCategory === categoryQuestions.length
          const isActive = index === currentCategory

          return (
            <button
              key={category.id}
              onClick={() => setCurrentCategory(index)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                isActive 
                  ? 'border-primary-500 bg-primary-50' 
                  : categoryComplete
                    ? 'border-green-300 bg-green-50 hover:border-green-400'
                    : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{category.icon}</span>
                {categoryComplete && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
              <p className="text-xs text-gray-600 mb-2">{category.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {answeredInCategory}/{categoryQuestions.length}
                </span>
                <ProgressBar 
                  progress={(answeredInCategory / categoryQuestions.length) * 100}
                  size="sm"
                  className="w-16"
                />
              </div>
            </button>
          )
        })}
      </div>

      {/* Current Category Questions */}
      <div className="card">
        <div className="flex items-center mb-6">
          <span className="text-4xl mr-4">{currentCat.icon}</span>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{currentCat.name}</h3>
            <p className="text-gray-600">{currentCat.description}</p>
          </div>
        </div>

        <div className="space-y-8">
          {currentCat.questions.map((question, questionIndex) => {
            const value = responses[question.id] || 0
            const globalQuestionNumber = ASSESSMENT_CATEGORIES
              .slice(0, currentCategory)
              .reduce((sum, cat) => sum + cat.questions.length, 0) + questionIndex + 1

            return (
              <div key={question.id} className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <Badge variant="default" size="sm">
                        Question {globalQuestionNumber}
                      </Badge>
                      {question.weight > 1 && (
                        <Badge variant="warning" size="sm">
                          High Impact
                        </Badge>
                      )}
                    </div>
                    <p className="text-lg font-medium text-gray-900 leading-relaxed">
                      {question.text}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Never / Strongly Disagree</span>
                    <span>Always / Strongly Agree</span>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-4">
                    {[0, 1, 2, 3].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => handleResponse(question.id, rating)}
                        className={`w-16 h-16 rounded-full border-3 text-lg font-bold transition-all duration-300 transform hover:scale-110 ${
                          value === rating
                            ? 'border-primary-500 bg-primary-500 text-white shadow-lg scale-110'
                            : 'border-gray-300 text-gray-700 hover:border-primary-300 hover:bg-primary-50'
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-center space-x-8 text-xs text-gray-500">
                    <span>Never</span>
                    <span>Sometimes</span>
                    <span>Often</span>
                    <span>Always</span>
                  </div>

                  {value > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center text-blue-800 text-sm">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        <span>Response recorded: {value}/3</span>
                        {question.weight > 1 && (
                          <span className="ml-2 text-blue-600">
                            (Weighted {question.weight}x for impact)
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Category Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => setCurrentCategory(Math.max(0, currentCategory - 1))}
            disabled={currentCategory === 0}
            className="btn-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Previous Category
          </button>

          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">
              Category {currentCategory + 1} of {ASSESSMENT_CATEGORIES.length}
            </div>
            <div className="flex space-x-2">
              {ASSESSMENT_CATEGORIES.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentCategory 
                      ? 'bg-primary-500' 
                      : index < currentCategory 
                        ? 'bg-green-500' 
                        : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {currentCategory < ASSESSMENT_CATEGORIES.length - 1 ? (
            <button
              onClick={() => setCurrentCategory(Math.min(ASSESSMENT_CATEGORIES.length - 1, currentCategory + 1))}
              className="btn-primary flex items-center"
            >
              Next Category
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={completeAssessment}
              disabled={completionPercentage < 100}
              className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Complete Assessment
            </button>
          )}
        </div>
      </div>

      {/* Live Preview */}
      {Object.keys(responses).length > 0 && (
        <div className="card bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Live Assessment Preview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ASSESSMENT_CATEGORIES.map(category => {
              const score = calculateCategoryScore(category.id)
              const percentage = (score / 3) * 100
              
              return (
                <div key={category.id} className="text-center p-4 bg-white rounded-lg">
                  <span className="text-2xl mb-2 block">{category.icon}</span>
                  <div className="text-lg font-bold text-gray-900 mb-1">
                    {score.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{category.name}</div>
                  <ProgressBar progress={percentage} size="sm" />
                </div>
              )
            })}
          </div>
          <div className="mt-4 text-center">
            <div className="text-2xl font-bold text-gray-900">
              Overall Score: {calculateOverallScore().toFixed(1)}/3.0
            </div>
            <div className="text-sm text-gray-600">
              {completionPercentage < 100 && 'Complete all questions to see your full results'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}