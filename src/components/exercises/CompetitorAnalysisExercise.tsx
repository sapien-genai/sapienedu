import React, { useState, useEffect } from 'react'
import { Search, Plus, X, Download, Share2, Eye, BarChart3, Target, TrendingUp, AlertTriangle, CheckCircle, ExternalLink, Lightbulb, Calendar, DollarSign } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import ProgressBar from '@/components/ui/ProgressBar'
import { toast } from 'sonner'

interface Competitor {
  id: string
  name: string
  website?: string
  industry?: string
  size?: string
}

interface SearchResult {
  id: string
  competitorId: string
  query: string
  aiTools: string[]
  useCases: string[]
  results: string[]
  timeline: string
  sentiment: 'positive' | 'neutral' | 'negative'
  sources: string[]
  lastUpdated: string
}

interface ComparisonDimension {
  id: string
  name: string
  weight: number
  description: string
}

interface CompetitorScore {
  competitorId: string
  dimensionId: string
  score: number
  evidence: string
  confidence: number
}

interface SWOTAnalysis {
  competitorId: string
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
  aiGenerated: boolean
}

interface ActionItem {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  timeline: '30-days' | '60-days' | '90-days'
  resourceEstimate: string
  category: 'technology' | 'strategy' | 'operations' | 'marketing'
}

interface CompetitorAnalysisData {
  competitors: Competitor[]
  searchResults: SearchResult[]
  dimensions: ComparisonDimension[]
  scores: CompetitorScore[]
  swotAnalyses: SWOTAnalysis[]
  actionPlan: ActionItem[]
}

const DEFAULT_DIMENSIONS: ComparisonDimension[] = [
  { id: 'ai-tools', name: 'AI Tool Usage', weight: 1.2, description: 'Adoption and integration of AI technologies' },
  { id: 'automation', name: 'Automation Level', weight: 1.1, description: 'Process automation and efficiency' },
  { id: 'innovation', name: 'Innovation Score', weight: 1.0, description: 'Rate of innovation and new feature releases' },
  { id: 'customer-exp', name: 'Customer Experience', weight: 1.3, description: 'AI-enhanced customer interactions' },
  { id: 'efficiency', name: 'Operational Efficiency', weight: 1.0, description: 'Internal process optimization' },
  { id: 'time-to-market', name: 'Time to Market', weight: 0.9, description: 'Speed of product/feature delivery' },
  { id: 'cost-optimization', name: 'Cost Optimization', weight: 0.8, description: 'AI-driven cost reduction initiatives' }
]

const SEARCH_TEMPLATES = [
  '{competitor} AI adoption',
  '{competitor} automation tools',
  '{competitor} productivity initiatives',
  '{competitor} digital transformation',
  '{competitor} artificial intelligence strategy',
  '{competitor} machine learning implementation'
]

interface CompetitorAnalysisExerciseProps {
  initialData?: CompetitorAnalysisData
  onDataChange: (data: CompetitorAnalysisData) => void
  className?: string
}

export default function CompetitorAnalysisExercise({
  initialData,
  onDataChange,
  className = ''
}: CompetitorAnalysisExerciseProps) {
  const [data, setData] = useState<CompetitorAnalysisData>(
    initialData || {
      competitors: [],
      searchResults: [],
      dimensions: DEFAULT_DIMENSIONS,
      scores: [],
      swotAnalyses: [],
      actionPlan: []
    }
  )

  const [activeTab, setActiveTab] = useState<'competitors' | 'research' | 'comparison' | 'swot' | 'action'>('competitors')
  const [newCompetitor, setNewCompetitor] = useState({ name: '', website: '', industry: '', size: '' })
  const [searchingCompetitor, setSearchingCompetitor] = useState<string | null>(null)
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([])
  const [matrixView, setMatrixView] = useState<'matrix' | 'spider' | 'gap'>('matrix')

  useEffect(() => {
    onDataChange(data)
  }, [data, onDataChange])

  const addCompetitor = () => {
    if (!newCompetitor.name.trim()) {
      toast.error('Please enter a competitor name')
      return
    }

    const competitor: Competitor = {
      id: Date.now().toString(),
      name: newCompetitor.name.trim(),
      website: newCompetitor.website.trim() || undefined,
      industry: newCompetitor.industry.trim() || undefined,
      size: newCompetitor.size.trim() || undefined
    }

    setData(prev => ({
      ...prev,
      competitors: [...prev.competitors, competitor]
    }))

    setNewCompetitor({ name: '', website: '', industry: '', size: '' })
    toast.success('Competitor added successfully')
  }

  const removeCompetitor = (id: string) => {
    setData(prev => ({
      ...prev,
      competitors: prev.competitors.filter(c => c.id !== id),
      searchResults: prev.searchResults.filter(r => r.competitorId !== id),
      scores: prev.scores.filter(s => s.competitorId !== id),
      swotAnalyses: prev.swotAnalyses.filter(s => s.competitorId !== id)
    }))
    toast.success('Competitor removed')
  }

  const simulateWebSearch = async (competitor: Competitor) => {
    setSearchingCompetitor(competitor.id)
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Generate mock search results
      const mockResults: SearchResult[] = SEARCH_TEMPLATES.map((template, index) => ({
        id: `${competitor.id}-${index}`,
        competitorId: competitor.id,
        query: template.replace('{competitor}', competitor.name),
        aiTools: generateMockAITools(),
        useCases: generateMockUseCases(),
        results: generateMockResults(competitor.name),
        timeline: generateMockTimeline(),
        sentiment: Math.random() > 0.3 ? 'positive' : Math.random() > 0.5 ? 'neutral' : 'negative',
        sources: generateMockSources(),
        lastUpdated: new Date().toISOString()
      }))

      setData(prev => ({
        ...prev,
        searchResults: [
          ...prev.searchResults.filter(r => r.competitorId !== competitor.id),
          ...mockResults
        ]
      }))

      // Auto-generate SWOT analysis
      generateSWOTAnalysis(competitor, mockResults)

      toast.success(`Research completed for ${competitor.name}`)
    } catch (error) {
      toast.error('Search failed. Please try again.')
    } finally {
      setSearchingCompetitor(null)
    }
  }

  const generateMockAITools = (): string[] => {
    const tools = ['ChatGPT', 'Claude', 'Midjourney', 'Notion AI', 'Jasper', 'Copy.ai', 'Zapier', 'Salesforce Einstein', 'HubSpot AI', 'Intercom Resolution Bot']
    return tools.slice(0, Math.floor(Math.random() * 4) + 2)
  }

  const generateMockUseCases = (): string[] => {
    const useCases = ['Customer Support Automation', 'Content Generation', 'Data Analysis', 'Lead Scoring', 'Email Marketing', 'Process Automation', 'Predictive Analytics', 'Chatbots']
    return useCases.slice(0, Math.floor(Math.random() * 3) + 2)
  }

  const generateMockResults = (competitorName: string): string[] => {
    return [
      `${competitorName} reports 40% reduction in customer service response time`,
      `AI implementation led to 25% increase in lead conversion`,
      `Automated content generation saves 15 hours per week`,
      `Machine learning models improved prediction accuracy by 30%`
    ].slice(0, Math.floor(Math.random() * 2) + 2)
  }

  const generateMockTimeline = (): string => {
    const timelines = ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2023', 'H1 2024']
    return timelines[Math.floor(Math.random() * timelines.length)]
  }

  const generateMockSources = (): string[] => {
    return ['Company Blog', 'Press Release', 'Industry Report', 'LinkedIn Post', 'Conference Presentation']
      .slice(0, Math.floor(Math.random() * 2) + 2)
  }

  const generateSWOTAnalysis = (competitor: Competitor, searchResults: SearchResult[]) => {
    const swot: SWOTAnalysis = {
      competitorId: competitor.id,
      strengths: [
        'Strong AI tool adoption across multiple departments',
        'Proven ROI from automation initiatives',
        'Advanced data analytics capabilities'
      ],
      weaknesses: [
        'Limited integration between AI tools',
        'Slow adoption in customer-facing processes',
        'Lack of AI governance framework'
      ],
      opportunities: [
        'Expand AI to supply chain optimization',
        'Implement predictive maintenance',
        'Develop AI-powered product recommendations'
      ],
      threats: [
        'Competitors accelerating AI adoption',
        'Regulatory changes affecting AI use',
        'Talent shortage in AI/ML expertise'
      ],
      aiGenerated: true
    }

    setData(prev => ({
      ...prev,
      swotAnalyses: [
        ...prev.swotAnalyses.filter(s => s.competitorId !== competitor.id),
        swot
      ]
    }))
  }

  const updateScore = (competitorId: string, dimensionId: string, score: number, evidence: string) => {
    setData(prev => ({
      ...prev,
      scores: [
        ...prev.scores.filter(s => !(s.competitorId === competitorId && s.dimensionId === dimensionId)),
        {
          competitorId,
          dimensionId,
          score,
          evidence,
          confidence: evidence.length > 20 ? 0.8 : 0.5
        }
      ]
    }))
  }

  const generateActionPlan = () => {
    const actions: ActionItem[] = [
      {
        id: '1',
        title: 'Implement AI-powered customer support',
        description: 'Deploy chatbots and automated response systems to match competitor capabilities',
        priority: 'high',
        timeline: '30-days',
        resourceEstimate: '$15,000 - $25,000',
        category: 'technology'
      },
      {
        id: '2',
        title: 'Develop content automation strategy',
        description: 'Create AI-driven content generation workflows for marketing and communications',
        priority: 'high',
        timeline: '60-days',
        resourceEstimate: '$10,000 - $20,000',
        category: 'marketing'
      },
      {
        id: '3',
        title: 'Establish AI governance framework',
        description: 'Create policies and procedures for responsible AI implementation',
        priority: 'medium',
        timeline: '90-days',
        resourceEstimate: '$5,000 - $10,000',
        category: 'strategy'
      },
      {
        id: '4',
        title: 'Train team on AI tools',
        description: 'Comprehensive training program for staff on AI tool usage and best practices',
        priority: 'medium',
        timeline: '60-days',
        resourceEstimate: '$8,000 - $15,000',
        category: 'operations'
      }
    ]

    setData(prev => ({ ...prev, actionPlan: actions }))
    toast.success('Action plan generated successfully')
  }

  const getCompetitorScore = (competitorId: string, dimensionId: string): number => {
    const score = data.scores.find(s => s.competitorId === competitorId && s.dimensionId === dimensionId)
    return score?.score || 0
  }

  const getOverallScore = (competitorId: string): number => {
    const scores = data.dimensions.map(dim => {
      const score = getCompetitorScore(competitorId, dim.id)
      return score * dim.weight
    })
    const totalWeight = data.dimensions.reduce((sum, dim) => sum + dim.weight, 0)
    const totalScore = scores.reduce((sum, score) => sum + score, 0)
    return totalWeight > 0 ? totalScore / totalWeight : 0
  }

  const exportData = () => {
    const exportData = {
      analysis: data,
      generatedAt: new Date().toISOString(),
      summary: {
        competitorsAnalyzed: data.competitors.length,
        searchQueriesExecuted: data.searchResults.length,
        dimensionsEvaluated: data.dimensions.length,
        actionItemsGenerated: data.actionPlan.length
      }
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `competitor-analysis-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Analysis exported successfully')
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'competitors', label: 'Competitors', icon: Target },
            { id: 'research', label: 'Research', icon: Search },
            { id: 'comparison', label: 'Comparison', icon: BarChart3 },
            { id: 'swot', label: 'SWOT Analysis', icon: TrendingUp },
            { id: 'action', label: 'Action Plan', icon: CheckCircle }
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

      {/* Competitors Tab */}
      {activeTab === 'competitors' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Competitors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <input
                type="text"
                placeholder="Competitor name *"
                value={newCompetitor.name}
                onChange={(e) => setNewCompetitor(prev => ({ ...prev, name: e.target.value }))}
                className="input-field"
              />
              <input
                type="url"
                placeholder="Website URL"
                value={newCompetitor.website}
                onChange={(e) => setNewCompetitor(prev => ({ ...prev, website: e.target.value }))}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Industry"
                value={newCompetitor.industry}
                onChange={(e) => setNewCompetitor(prev => ({ ...prev, industry: e.target.value }))}
                className="input-field"
              />
              <select
                value={newCompetitor.size}
                onChange={(e) => setNewCompetitor(prev => ({ ...prev, size: e.target.value }))}
                className="input-field"
              >
                <option value="">Company Size</option>
                <option value="startup">Startup (1-50)</option>
                <option value="small">Small (51-200)</option>
                <option value="medium">Medium (201-1000)</option>
                <option value="large">Large (1000+)</option>
              </select>
            </div>
            <button onClick={addCompetitor} className="btn-primary flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Add Competitor
            </button>
          </div>

          {data.competitors.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Competitors</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.competitors.map(competitor => (
                  <div key={competitor.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{competitor.name}</h4>
                        {competitor.industry && (
                          <Badge variant="default" size="sm">{competitor.industry}</Badge>
                        )}
                      </div>
                      <button
                        onClick={() => removeCompetitor(competitor.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {competitor.website && (
                      <a
                        href={competitor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-500 flex items-center mb-2"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Visit Website
                      </a>
                    )}
                    
                    {competitor.size && (
                      <div className="text-sm text-gray-600 mb-3">
                        Size: {competitor.size}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {data.searchResults.filter(r => r.competitorId === competitor.id).length} searches
                      </div>
                      <Badge 
                        variant={data.searchResults.some(r => r.competitorId === competitor.id) ? 'success' : 'default'}
                        size="sm"
                      >
                        {data.searchResults.some(r => r.competitorId === competitor.id) ? 'Researched' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Research Tab */}
      {activeTab === 'research' && (
        <div className="space-y-6">
          {data.competitors.length === 0 ? (
            <div className="card text-center py-12">
              <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Competitors Added</h3>
              <p className="text-gray-600">Add competitors first to start researching their AI adoption.</p>
            </div>
          ) : (
            <>
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Adoption Research</h3>
                <p className="text-gray-600 mb-4">
                  Research each competitor's AI adoption, automation tools, and digital transformation initiatives.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.competitors.map(competitor => {
                    const hasResults = data.searchResults.some(r => r.competitorId === competitor.id)
                    const isSearching = searchingCompetitor === competitor.id
                    
                    return (
                      <div key={competitor.id} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">{competitor.name}</h4>
                        
                        {isSearching ? (
                          <div className="flex items-center text-primary-600 mb-3">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                            <span className="text-sm">Researching...</span>
                          </div>
                        ) : hasResults ? (
                          <div className="flex items-center text-success-600 mb-3">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            <span className="text-sm">Research Complete</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-500 mb-3">
                            <Search className="w-4 h-4 mr-2" />
                            <span className="text-sm">Not Researched</span>
                          </div>
                        )}

                        <button
                          onClick={() => simulateWebSearch(competitor)}
                          disabled={isSearching}
                          className={`w-full ${hasResults ? 'btn-secondary' : 'btn-primary'} text-sm`}
                        >
                          {hasResults ? 'Re-research' : 'Start Research'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Research Results */}
              {data.searchResults.length > 0 && (
                <div className="space-y-4">
                  {data.competitors.map(competitor => {
                    const results = data.searchResults.filter(r => r.competitorId === competitor.id)
                    if (results.length === 0) return null

                    return (
                      <div key={competitor.id} className="card">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">{competitor.name} - Research Results</h4>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">AI Tools Identified</h5>
                            <div className="space-y-1">
                              {Array.from(new Set(results.flatMap(r => r.aiTools))).map((tool, index) => (
                                <Badge key={index} variant="default" size="sm">{tool}</Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Use Cases</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {Array.from(new Set(results.flatMap(r => r.useCases))).map((useCase, index) => (
                                <li key={index}>• {useCase}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Key Results</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {Array.from(new Set(results.flatMap(r => r.results))).slice(0, 3).map((result, index) => (
                                <li key={index}>• {result}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Comparison Tab */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          {data.competitors.length === 0 ? (
            <div className="card text-center py-12">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Competitors to Compare</h3>
              <p className="text-gray-600">Add competitors first to create comparison matrices.</p>
            </div>
          ) : (
            <>
              {/* Comparison Matrix */}
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Comparison Matrix</h3>
                  <div className="flex items-center space-x-2">
                    <select
                      value={matrixView}
                      onChange={(e) => setMatrixView(e.target.value as any)}
                      className="input-field text-sm"
                    >
                      <option value="matrix">Matrix View</option>
                      <option value="spider">Spider Chart</option>
                      <option value="gap">Gap Analysis</option>
                    </select>
                  </div>
                </div>

                {matrixView === 'matrix' && (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="text-left p-3 border-b border-gray-200 font-medium text-gray-900">
                            Dimension
                          </th>
                          {data.competitors.map(competitor => (
                            <th key={competitor.id} className="text-center p-3 border-b border-gray-200 font-medium text-gray-900">
                              {competitor.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.dimensions.map(dimension => (
                          <tr key={dimension.id}>
                            <td className="p-3 border-b border-gray-100">
                              <div>
                                <div className="font-medium text-gray-900">{dimension.name}</div>
                                <div className="text-xs text-gray-500">Weight: {dimension.weight}x</div>
                              </div>
                            </td>
                            {data.competitors.map(competitor => {
                              const score = getCompetitorScore(competitor.id, dimension.id)
                              return (
                                <td key={competitor.id} className="p-3 border-b border-gray-100 text-center">
                                  <div className="space-y-2">
                                    <div className="flex justify-center space-x-1">
                                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
                                        <button
                                          key={rating}
                                          onClick={() => {
                                            const evidence = prompt(`Evidence for ${competitor.name} - ${dimension.name} (Score: ${rating}):`)
                                            if (evidence !== null) {
                                              updateScore(competitor.id, dimension.id, rating, evidence)
                                            }
                                          }}
                                          className={`w-6 h-6 text-xs rounded ${
                                            score === rating
                                              ? 'bg-primary-500 text-white'
                                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                          }`}
                                        >
                                          {rating}
                                        </button>
                                      ))}
                                    </div>
                                    {score > 0 && (
                                      <div className="text-sm font-medium text-gray-900">{score}/10</div>
                                    )}
                                  </div>
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                        <tr className="bg-gray-50">
                          <td className="p-3 font-semibold text-gray-900">Overall Score</td>
                          {data.competitors.map(competitor => (
                            <td key={competitor.id} className="p-3 text-center">
                              <div className="text-lg font-bold text-primary-600">
                                {getOverallScore(competitor.id).toFixed(1)}
                              </div>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {matrixView === 'gap' && (
                  <div className="space-y-4">
                    {data.dimensions.map(dimension => {
                      const scores = data.competitors.map(c => ({
                        competitor: c,
                        score: getCompetitorScore(c.id, dimension.id)
                      })).filter(s => s.score > 0).sort((a, b) => b.score - a.score)

                      if (scores.length === 0) return null

                      const leader = scores[0]
                      const gaps = scores.slice(1).map(s => ({
                        ...s,
                        gap: leader.score - s.score
                      }))

                      return (
                        <div key={dimension.id} className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3">{dimension.name}</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                              <span className="font-medium text-green-800">👑 {leader.competitor.name}</span>
                              <span className="text-green-600 font-bold">{leader.score}/10</span>
                            </div>
                            {gaps.map(gap => (
                              <div key={gap.competitor.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="text-gray-700">{gap.competitor.name}</span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-600">{gap.score}/10</span>
                                  <span className="text-red-600 text-sm">(-{gap.gap})</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* SWOT Tab */}
      {activeTab === 'swot' && (
        <div className="space-y-6">
          {data.swotAnalyses.length === 0 ? (
            <div className="card text-center py-12">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No SWOT Analyses Yet</h3>
              <p className="text-gray-600">Research competitors first to generate SWOT analyses.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {data.swotAnalyses.map(swot => {
                const competitor = data.competitors.find(c => c.id === swot.competitorId)
                if (!competitor) return null

                return (
                  <div key={swot.competitorId} className="card">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">{competitor.name} - SWOT Analysis</h3>
                      {swot.aiGenerated && (
                        <Badge variant="default" size="sm">AI Generated</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Strengths
                          </h4>
                          <ul className="space-y-2">
                            {swot.strengths.map((strength, index) => (
                              <li key={index} className="text-green-700 text-sm">• {strength}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                            <Lightbulb className="w-4 h-4 mr-2" />
                            Opportunities
                          </h4>
                          <ul className="space-y-2">
                            {swot.opportunities.map((opportunity, index) => (
                              <li key={index} className="text-blue-700 text-sm">• {opportunity}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <h4 className="font-semibold text-yellow-800 mb-3 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Weaknesses
                          </h4>
                          <ul className="space-y-2">
                            {swot.weaknesses.map((weakness, index) => (
                              <li key={index} className="text-yellow-700 text-sm">• {weakness}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Threats
                          </h4>
                          <ul className="space-y-2">
                            {swot.threats.map((threat, index) => (
                              <li key={index} className="text-red-700 text-sm">• {threat}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Action Plan Tab */}
      {activeTab === 'action' && (
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Strategic Action Plan</h3>
              <button
                onClick={generateActionPlan}
                disabled={data.competitors.length === 0}
                className="btn-primary flex items-center"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Generate Action Plan
              </button>
            </div>

            {data.actionPlan.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Action Plan Yet</h3>
                <p className="text-gray-600">Generate an action plan based on your competitor analysis.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Timeline View */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {['30-days', '60-days', '90-days'].map(timeline => {
                    const items = data.actionPlan.filter(item => item.timeline === timeline)
                    return (
                      <div key={timeline} className="space-y-4">
                        <h4 className="font-semibold text-gray-900 flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {timeline.replace('-', ' ').toUpperCase()}
                        </h4>
                        {items.map(item => (
                          <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium text-gray-900">{item.title}</h5>
                              <Badge 
                                variant={item.priority === 'high' ? 'error' : item.priority === 'medium' ? 'warning' : 'default'}
                                size="sm"
                              >
                                {item.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">{item.category}</span>
                              <span className="font-medium text-gray-700">{item.resourceEstimate}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>

                {/* Priority Matrix */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Priority Matrix</h4>
                  <div className="space-y-3">
                    {['high', 'medium', 'low'].map(priority => {
                      const items = data.actionPlan.filter(item => item.priority === priority)
                      return (
                        <div key={priority} className="flex items-center space-x-4">
                          <Badge 
                            variant={priority === 'high' ? 'error' : priority === 'medium' ? 'warning' : 'default'}
                            size="sm"
                            className="w-16 justify-center"
                          >
                            {priority}
                          </Badge>
                          <div className="flex-1">
                            <ProgressBar 
                              progress={(items.length / data.actionPlan.length) * 100}
                              size="sm"
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-16">{items.length} items</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Export Actions */}
      {(data.competitors.length > 0 || data.actionPlan.length > 0) && (
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            onClick={exportData}
            className="btn-secondary flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Analysis
          </button>
          <button className="btn-secondary flex items-center">
            <Share2 className="w-4 h-4 mr-2" />
            Share Report
          </button>
        </div>
      )}
    </div>
  )
}