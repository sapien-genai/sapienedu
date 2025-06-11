import React, { useState } from 'react'
import { 
  TrendingUp, 
  Target, 
  Clock, 
  BookOpen, 
  ChevronRight, 
  Star,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Users,
  Zap
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { 
  AI_READINESS_CATEGORIES, 
  AIReadinessScoring, 
  type MaturityLevel 
} from '@/data/aiReadinessAssessment'
import Badge from '@/components/ui/Badge'
import ProgressBar from '@/components/ui/ProgressBar'

interface AIReadinessResultsProps {
  responses: { [key: string]: number }
  onRetake?: () => void
  className?: string
}

export default function AIReadinessResults({ 
  responses, 
  onRetake, 
  className = '' 
}: AIReadinessResultsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'recommendations'>('overview')

  // Calculate scores
  const categoryScores = AI_READINESS_CATEGORIES.reduce((acc, category) => {
    acc[category.id] = AIReadinessScoring.calculateCategoryScore(responses, category)
    return acc
  }, {} as { [key: string]: number })

  const overallScore = AIReadinessScoring.getOverallScore(Object.values(categoryScores))
  const maturityLevel = AIReadinessScoring.getMaturityLevel(overallScore)
  const recommendations = AIReadinessScoring.getPersonalizedRecommendations(categoryScores)
  const insights = AIReadinessScoring.getCategoryInsights(categoryScores)

  const getScorePercentage = (score: number) => (score / 3) * 100

  const renderRadarChart = () => {
    const size = 200
    const center = size / 2
    const radius = 70
    const angleStep = (2 * Math.PI) / AI_READINESS_CATEGORIES.length

    const points = AI_READINESS_CATEGORIES.map((category, index) => {
      const angle = index * angleStep - Math.PI / 2
      const score = categoryScores[category.id] || 0
      const distance = (score / 3) * radius
      const x = center + Math.cos(angle) * distance
      const y = center + Math.sin(angle) * distance
      return { x, y, score, category }
    })

    const pathData = points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ') + ' Z'

    return (
      <div className="flex justify-center mb-6">
        <svg width={size} height={size} className="drop-shadow-sm">
          {/* Grid circles */}
          {[1, 2, 3].map(level => (
            <circle
              key={level}
              cx={center}
              cy={center}
              r={(level / 3) * radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
          
          {/* Grid lines */}
          {AI_READINESS_CATEGORIES.map((_, index) => {
            const angle = index * angleStep - Math.PI / 2
            const x2 = center + Math.cos(angle) * radius
            const y2 = center + Math.sin(angle) * radius
            return (
              <line
                key={index}
                x1={center}
                y1={center}
                x2={x2}
                y2={y2}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            )
          })}

          {/* Score area */}
          <path
            d={pathData}
            fill={`${maturityLevel.color}20`}
            stroke={maturityLevel.color}
            strokeWidth="2"
          />

          {/* Score points */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill={maturityLevel.color}
            />
          ))}

          {/* Category labels */}
          {AI_READINESS_CATEGORIES.map((category, index) => {
            const angle = index * angleStep - Math.PI / 2
            const labelDistance = radius + 25
            const x = center + Math.cos(angle) * labelDistance
            const y = center + Math.sin(angle) * labelDistance
            
            return (
              <text
                key={category.id}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-medium fill-gray-700"
              >
                {category.icon}
              </text>
            )
          })}
        </svg>
      </div>
    )
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Maturity Level Badge */}
      <div className="text-center">
        <div 
          className="inline-flex items-center justify-center w-24 h-24 rounded-full text-4xl mb-4 shadow-lg"
          style={{ backgroundColor: `${maturityLevel.color}20`, border: `3px solid ${maturityLevel.color}` }}
        >
          {maturityLevel.icon}
        </div>
        <h2 className="text-3xl font-bold mb-2" style={{ color: maturityLevel.color }}>
          {maturityLevel.level}
        </h2>
        <p className="text-lg text-gray-600 mb-4">{maturityLevel.description}</p>
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
          <span>Overall Score: {overallScore.toFixed(1)}/3.0</span>
          <span>•</span>
          <span>{Math.round(getScorePercentage(overallScore))}% AI Ready</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 justify-center">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'detailed', label: 'Detailed Analysis', icon: Target },
            { id: 'recommendations', label: 'Recommendations', icon: Lightbulb }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Radar Chart */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              Your AI Readiness Profile
            </h3>
            {renderRadarChart()}
            
            {/* Category Scores */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {AI_READINESS_CATEGORIES.map(category => {
                const score = categoryScores[category.id] || 0
                return (
                  <div key={category.id} className="text-center">
                    <div className="text-2xl mb-2">{category.icon}</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {score.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">{category.name}</div>
                    <ProgressBar 
                      progress={getScorePercentage(score)} 
                      size="sm" 
                      className="mt-2"
                    />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Key Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card bg-green-50 border-green-200">
              <div className="flex items-center mb-3">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <h4 className="font-semibold text-green-800">Strengths</h4>
              </div>
              <ul className="space-y-1 text-sm text-green-700">
                {insights.strengths.length > 0 ? (
                  insights.strengths.map((strength, index) => (
                    <li key={index}>• {strength}</li>
                  ))
                ) : (
                  <li>• Building foundation skills</li>
                )}
              </ul>
            </div>

            <div className="card bg-yellow-50 border-yellow-200">
              <div className="flex items-center mb-3">
                <Target className="w-5 h-5 text-yellow-600 mr-2" />
                <h4 className="font-semibold text-yellow-800">Growth Areas</h4>
              </div>
              <ul className="space-y-1 text-sm text-yellow-700">
                {insights.improvements.length > 0 ? (
                  insights.improvements.map((improvement, index) => (
                    <li key={index}>• {improvement}</li>
                  ))
                ) : (
                  <li>• Continue building all areas</li>
                )}
              </ul>
            </div>

            <div className="card bg-blue-50 border-blue-200">
              <div className="flex items-center mb-3">
                <ArrowRight className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="font-semibold text-blue-800">Next Steps</h4>
              </div>
              <ul className="space-y-1 text-sm text-blue-700">
                {insights.nextSteps.length > 0 ? (
                  insights.nextSteps.map((step, index) => (
                    <li key={index}>• {step}</li>
                  ))
                ) : (
                  <li>• Start with Chapter 1 exercises</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'detailed' && (
        <div className="space-y-6">
          {AI_READINESS_CATEGORIES.map(category => {
            const score = categoryScores[category.id] || 0
            const percentage = getScorePercentage(score)
            
            return (
              <div key={category.id} className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{category.icon}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Score: {score.toFixed(1)}/3.0</span>
                        <Badge 
                          variant={percentage >= 80 ? 'success' : percentage >= 60 ? 'default' : 'warning'}
                          size="sm"
                        >
                          {percentage >= 80 ? 'Strong' : percentage >= 60 ? 'Good' : 'Developing'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold" style={{ color: maturityLevel.color }}>
                      {Math.round(percentage)}%
                    </div>
                  </div>
                </div>

                <ProgressBar progress={percentage} size="md" className="mb-4" />

                <div className="space-y-3">
                  {category.questions.map(question => {
                    const answer = responses[question.id] || 0
                    const questionPercentage = (answer / 3) * 100
                    
                    return (
                      <div key={question.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">{question.text}</p>
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-gray-500 mr-2">Weight: {question.weight}x</span>
                            <ProgressBar progress={questionPercentage} size="sm" className="w-20" />
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900 ml-4">
                          {answer}/3
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          {/* Immediate Action */}
          <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
            <div className="flex items-center mb-4">
              <Zap className="w-6 h-6 text-primary-600 mr-3" />
              <h3 className="text-xl font-semibold text-primary-900">Start Right Now</h3>
            </div>
            <p className="text-primary-800 text-lg mb-4">{recommendations.immediate}</p>
            <Link to="/exercises" className="btn-primary">
              Begin First Exercise
            </Link>
          </div>

          {/* This Week Goals */}
          <div className="card">
            <div className="flex items-center mb-4">
              <Clock className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">This Week's Goals</h3>
            </div>
            <ul className="space-y-3">
              {recommendations.thisWeek.map((goal, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{goal}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="card">
            <div className="flex items-center mb-4">
              <BookOpen className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Recommended Resources</h3>
            </div>
            <ul className="space-y-3">
              {recommendations.resources.map((resource, index) => (
                <li key={index} className="flex items-start">
                  <Star className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{resource}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div className="card bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <div className="flex items-center mb-4">
              <Users className="w-5 h-5 text-purple-600 mr-2" />
              <h3 className="text-lg font-semibold text-purple-900">Join the Community</h3>
            </div>
            <p className="text-purple-800 mb-4">
              Connect with other learners at your level and share your progress.
            </p>
            <div className="flex space-x-3">
              <button className="btn-secondary">Join Discord</button>
              <button className="btn-secondary">Find Study Buddy</button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-center space-x-4 pt-6 border-t border-gray-200">
        {onRetake && (
          <button onClick={onRetake} className="btn-secondary">
            Retake Assessment
          </button>
        )}
        <Link to="/exercises" className="btn-primary flex items-center">
          Continue Learning Journey
          <ChevronRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </div>
  )
}