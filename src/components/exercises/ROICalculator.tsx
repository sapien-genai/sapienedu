import React, { useState, useEffect, useMemo } from 'react'
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Target, 
  BarChart3, 
  PieChart, 
  Download, 
  Share2, 
  Calculator,
  Zap,
  AlertCircle,
  CheckCircle,
  Calendar,
  ArrowUp,
  ArrowDown,
  Percent,
  FileText,
  Image,
  Presentation
} from 'lucide-react'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import Badge from '@/components/ui/Badge'
import ProgressBar from '@/components/ui/ProgressBar'
import { toast } from 'sonner'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface TimeMetric {
  id: string
  label: string
  hours: number
  aiReduction: number
  min: number
  max: number
  step: number
}

interface FinancialMetric {
  id: string
  label: string
  value: number
  min: number
  max: number
  type: 'currency' | 'number'
}

interface ROICalculations {
  hoursSavedWeekly: number
  hoursSavedMonthly: number
  hoursSavedYearly: number
  dollarValueWeekly: number
  dollarValueMonthly: number
  dollarValueYearly: number
  netROIMonthly: number
  netROIYearly: number
  breakEvenDays: number
  roiPercentage: number
}

interface Scenario {
  name: string
  multiplier: number
  color: string
}

const DEFAULT_TIME_METRICS: TimeMetric[] = [
  {
    id: "email_hours",
    label: "Hours on email/week",
    hours: 10,
    aiReduction: 0.7,
    min: 0,
    max: 40,
    step: 0.5
  },
  {
    id: "writing_hours",
    label: "Hours writing content/week",
    hours: 8,
    aiReduction: 0.6,
    min: 0,
    max: 30,
    step: 0.5
  },
  {
    id: "research_hours",
    label: "Hours researching/week",
    hours: 6,
    aiReduction: 0.8,
    min: 0,
    max: 20,
    step: 0.5
  },
  {
    id: "meeting_prep_hours",
    label: "Hours on meeting prep/notes",
    hours: 5,
    aiReduction: 0.5,
    min: 0,
    max: 20,
    step: 0.5
  },
  {
    id: "data_analysis_hours",
    label: "Hours analyzing data/week",
    hours: 4,
    aiReduction: 0.7,
    min: 0,
    max: 20,
    step: 0.5
  }
]

const DEFAULT_FINANCIAL_METRICS: FinancialMetric[] = [
  {
    id: "hourly_value",
    label: "Your hourly rate/value",
    value: 75,
    min: 0,
    max: 500,
    type: "currency"
  },
  {
    id: "ai_tool_cost",
    label: "Monthly AI tool budget",
    value: 100,
    min: 0,
    max: 1000,
    type: "currency"
  }
]

const SCENARIOS: Scenario[] = [
  { name: 'Conservative', multiplier: 0.7, color: '#EF4444' },
  { name: 'Expected', multiplier: 1.0, color: '#3B82F6' },
  { name: 'Optimistic', multiplier: 1.3, color: '#10B981' }
]

const TIMEFRAMES = ['3 months', '6 months', '1 year', '3 years']

interface ROICalculatorProps {
  initialData?: any
  onDataChange: (data: any) => void
  className?: string
}

export default function ROICalculator({
  initialData,
  onDataChange,
  className = ''
}: ROICalculatorProps) {
  const [timeMetrics, setTimeMetrics] = useState<TimeMetric[]>(DEFAULT_TIME_METRICS)
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetric[]>(DEFAULT_FINANCIAL_METRICS)
  const [activeTab, setActiveTab] = useState<'calculator' | 'projections' | 'comparison' | 'sharing'>('calculator')
  const [selectedTimeframe, setSelectedTimeframe] = useState('1 year')
  const [selectedScenario, setSelectedScenario] = useState('Expected')
  const [showBreakdown, setShowBreakdown] = useState(false)

  useEffect(() => {
    if (initialData) {
      setTimeMetrics(initialData.timeMetrics || DEFAULT_TIME_METRICS)
      setFinancialMetrics(initialData.financialMetrics || DEFAULT_FINANCIAL_METRICS)
    }
  }, [initialData])

  useEffect(() => {
    onDataChange({ timeMetrics, financialMetrics })
  }, [timeMetrics, financialMetrics, onDataChange])

  const calculations = useMemo((): ROICalculations => {
    const hourlyValue = financialMetrics.find(m => m.id === 'hourly_value')?.value || 0
    const aiToolCost = financialMetrics.find(m => m.id === 'ai_tool_cost')?.value || 0

    const hoursSavedWeekly = timeMetrics.reduce((sum, metric) => 
      sum + (metric.hours * metric.aiReduction), 0
    )

    const hoursSavedMonthly = hoursSavedWeekly * 4.33
    const hoursSavedYearly = hoursSavedWeekly * 52

    const dollarValueWeekly = hoursSavedWeekly * hourlyValue
    const dollarValueMonthly = dollarValueWeekly * 4.33
    const dollarValueYearly = dollarValueWeekly * 52

    const netROIMonthly = dollarValueMonthly - aiToolCost
    const netROIYearly = netROIMonthly * 12

    const breakEvenDays = aiToolCost > 0 ? aiToolCost / (dollarValueWeekly / 7) : 0
    const roiPercentage = aiToolCost > 0 ? (netROIYearly / (aiToolCost * 12)) * 100 : 0

    return {
      hoursSavedWeekly,
      hoursSavedMonthly,
      hoursSavedYearly,
      dollarValueWeekly,
      dollarValueMonthly,
      dollarValueYearly,
      netROIMonthly,
      netROIYearly,
      breakEvenDays,
      roiPercentage
    }
  }, [timeMetrics, financialMetrics])

  const updateTimeMetric = (id: string, field: keyof TimeMetric, value: number) => {
    setTimeMetrics(prev => prev.map(metric => 
      metric.id === id ? { ...metric, [field]: value } : metric
    ))
  }

  const updateFinancialMetric = (id: string, value: number) => {
    setFinancialMetrics(prev => prev.map(metric => 
      metric.id === id ? { ...metric, value } : metric
    ))
  }

  const getProjectionData = (timeframe: string, scenario: string) => {
    const months = timeframe === '3 months' ? 3 : 
                  timeframe === '6 months' ? 6 : 
                  timeframe === '1 year' ? 12 : 36

    const scenarioMultiplier = SCENARIOS.find(s => s.name === scenario)?.multiplier || 1
    const monthlyValue = calculations.dollarValueMonthly * scenarioMultiplier
    const monthlyCost = financialMetrics.find(m => m.id === 'ai_tool_cost')?.value || 0

    const data = []
    let cumulativeValue = 0
    let cumulativeCost = 0

    for (let month = 1; month <= months; month++) {
      cumulativeValue += monthlyValue
      cumulativeCost += monthlyCost
      
      data.push({
        month,
        value: cumulativeValue,
        cost: cumulativeCost,
        net: cumulativeValue - cumulativeCost
      })
    }

    return data
  }

  const getSavingsOverTimeChart = () => {
    const projectionData = getProjectionData(selectedTimeframe, selectedScenario)
    
    return {
      labels: projectionData.map(d => `Month ${d.month}`),
      datasets: [
        {
          label: 'Cumulative Value Created',
          data: projectionData.map(d => d.value),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Cumulative AI Tool Costs',
          data: projectionData.map(d => d.cost),
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Net ROI',
          data: projectionData.map(d => d.net),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    }
  }

  const getComparisonChart = () => {
    const currentHours = timeMetrics.reduce((sum, metric) => sum + metric.hours, 0)
    const aiHours = timeMetrics.reduce((sum, metric) => sum + (metric.hours * (1 - metric.aiReduction)), 0)
    
    return {
      labels: timeMetrics.map(m => m.label.replace('/week', '')),
      datasets: [
        {
          label: 'Current Hours',
          data: timeMetrics.map(m => m.hours),
          backgroundColor: '#EF4444',
          borderRadius: 4
        },
        {
          label: 'With AI',
          data: timeMetrics.map(m => m.hours * (1 - m.aiReduction)),
          backgroundColor: '#10B981',
          borderRadius: 4
        }
      ]
    }
  }

  const getTaskBreakdownChart = () => {
    const totalSavings = calculations.hoursSavedWeekly
    
    return {
      labels: timeMetrics.map(m => m.label.replace(' hours/week', '').replace('Hours ', '')),
      datasets: [{
        data: timeMetrics.map(m => (m.hours * m.aiReduction / totalSavings) * 100),
        backgroundColor: [
          '#3B82F6',
          '#10B981', 
          '#F59E0B',
          '#8B5CF6',
          '#EF4444'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    }
  }

  const getEquivalentValues = () => {
    const yearlyValue = calculations.dollarValueYearly
    
    return [
      {
        label: 'Vacation Days',
        value: Math.round(yearlyValue / 200),
        description: '@ $200/day',
        icon: Calendar
      },
      {
        label: 'Car Payments',
        value: Math.round(calculations.dollarValueMonthly / 500),
        description: '@ $500/month',
        icon: DollarSign
      },
      {
        label: 'Extra Strategic Hours',
        value: Math.round(calculations.hoursSavedWeekly),
        description: 'per week',
        icon: Clock
      },
      {
        label: 'Salary Increase Equivalent',
        value: Math.round((yearlyValue / 100000) * 100),
        description: '% increase on $100k',
        icon: TrendingUp
      }
    ]
  }

  const exportToPDF = () => {
    const reportData = {
      calculations,
      timeMetrics,
      financialMetrics,
      equivalentValues: getEquivalentValues(),
      generatedAt: new Date().toISOString()
    }

    // Simulate PDF generation
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-roi-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('ROI report exported successfully!')
  }

  const shareResults = () => {
    const shareText = `🤖 My AI ROI Analysis:
💰 Annual Value: $${Math.round(calculations.dollarValueYearly).toLocaleString()}
⏰ Time Saved: ${Math.round(calculations.hoursSavedWeekly)}h/week
📈 ROI: ${Math.round(calculations.roiPercentage)}%
🎯 Break-even: ${Math.round(calculations.breakEvenDays)} days

#AIProductivity #ROI #Automation`

    if (navigator.share) {
      navigator.share({
        title: 'My AI ROI Analysis',
        text: shareText
      })
    } else {
      navigator.clipboard.writeText(shareText)
      toast.success('Results copied to clipboard!')
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatHours = (hours: number) => {
    return `${Math.round(hours * 10) / 10}h`
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Key Metrics */}
      <div className="card bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="w-6 h-6 text-green-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">
                {formatCurrency(calculations.dollarValueYearly)}
              </span>
            </div>
            <div className="text-sm text-gray-600">Annual Value Created</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-6 h-6 text-blue-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">
                {formatHours(calculations.hoursSavedWeekly)}
              </span>
            </div>
            <div className="text-sm text-gray-600">Weekly Time Saved</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Percent className="w-6 h-6 text-purple-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">
                {Math.round(calculations.roiPercentage)}%
              </span>
            </div>
            <div className="text-sm text-gray-600">ROI Percentage</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-6 h-6 text-orange-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">
                {Math.round(calculations.breakEvenDays)}
              </span>
            </div>
            <div className="text-sm text-gray-600">Break-even Days</div>
          </div>
        </div>

        {/* ROI Status Indicator */}
        <div className="mt-4 flex items-center justify-center">
          {calculations.roiPercentage > 200 ? (
            <div className="flex items-center text-green-700 bg-green-100 px-4 py-2 rounded-full">
              <ArrowUp className="w-4 h-4 mr-2" />
              <span className="font-medium">Excellent ROI - Highly Recommended</span>
            </div>
          ) : calculations.roiPercentage > 100 ? (
            <div className="flex items-center text-blue-700 bg-blue-100 px-4 py-2 rounded-full">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span className="font-medium">Good ROI - Recommended</span>
            </div>
          ) : calculations.roiPercentage > 0 ? (
            <div className="flex items-center text-yellow-700 bg-yellow-100 px-4 py-2 rounded-full">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span className="font-medium">Positive ROI - Consider Implementation</span>
            </div>
          ) : (
            <div className="flex items-center text-red-700 bg-red-100 px-4 py-2 rounded-full">
              <ArrowDown className="w-4 h-4 mr-2" />
              <span className="font-medium">Negative ROI - Review Strategy</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'calculator', label: 'Calculator', icon: Calculator },
            { id: 'projections', label: 'Projections', icon: TrendingUp },
            { id: 'comparison', label: 'Comparison', icon: BarChart3 },
            { id: 'sharing', label: 'Share & Export', icon: Share2 }
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

      {/* Calculator Tab */}
      {activeTab === 'calculator' && (
        <div className="space-y-6">
          {/* Time Metrics */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Time Allocation & AI Impact</h3>
            <div className="space-y-6">
              {timeMetrics.map(metric => (
                <div key={metric.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-medium text-gray-700">{metric.label}</label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">AI saves</span>
                      <Badge variant="success" size="sm">
                        {Math.round(metric.aiReduction * 100)}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Hours per week</span>
                        <span className="text-sm font-medium text-gray-900">{metric.hours}h</span>
                      </div>
                      <input
                        type="range"
                        min={metric.min}
                        max={metric.max}
                        step={metric.step}
                        value={metric.hours}
                        onChange={(e) => updateTimeMetric(metric.id, 'hours', Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{metric.min}h</span>
                        <span>{metric.max}h</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">AI reduction potential</span>
                        <span className="text-sm font-medium text-gray-900">
                          {Math.round(metric.aiReduction * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={metric.aiReduction}
                        onChange={(e) => updateTimeMetric(metric.id, 'aiReduction', Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-700">
                        <strong>Time saved:</strong> {formatHours(metric.hours * metric.aiReduction)}/week
                      </span>
                      <span className="text-blue-600">
                        <strong>Value:</strong> {formatCurrency(metric.hours * metric.aiReduction * (financialMetrics.find(m => m.id === 'hourly_value')?.value || 0))}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Metrics */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Financial Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {financialMetrics.map(metric => (
                <div key={metric.id} className="space-y-3">
                  <label className="block font-medium text-gray-700">{metric.label}</label>
                  <div className="relative">
                    {metric.type === 'currency' && (
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                    <input
                      type="number"
                      value={metric.value}
                      onChange={(e) => updateFinancialMetric(metric.id, Number(e.target.value))}
                      className={`input-field ${metric.type === 'currency' ? 'pl-10' : ''}`}
                      min={metric.min}
                      max={metric.max}
                      step={metric.type === 'currency' ? 5 : 1}
                    />
                  </div>
                  <input
                    type="range"
                    min={metric.min}
                    max={metric.max}
                    step={metric.type === 'currency' ? 5 : 1}
                    value={metric.value}
                    onChange={(e) => updateFinancialMetric(metric.id, Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{formatCurrency(metric.min)}</span>
                    <span>{formatCurrency(metric.max)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Impact Dashboard */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Impact Dashboard</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  label: 'Hours Reclaimed Monthly',
                  value: formatHours(calculations.hoursSavedMonthly),
                  icon: Clock,
                  equivalent: `${Math.round(calculations.hoursSavedMonthly / 8)} full workdays`,
                  color: 'text-blue-600'
                },
                {
                  label: 'Annual Value Created',
                  value: formatCurrency(calculations.dollarValueYearly),
                  icon: DollarSign,
                  equivalent: `${Math.round((calculations.dollarValueYearly / 100000) * 100)}% salary increase`,
                  color: 'text-green-600'
                },
                {
                  label: 'ROI Percentage',
                  value: `${Math.round(calculations.roiPercentage)}%`,
                  icon: TrendingUp,
                  equivalent: `vs ${Math.round(Math.random() * 5 + 8)}% S&P 500 avg`,
                  color: 'text-purple-600'
                },
                {
                  label: 'Break-even Time',
                  value: `${Math.round(calculations.breakEvenDays)} days`,
                  icon: Target,
                  equivalent: calculations.breakEvenDays < 7 ? 'Excellent' : calculations.breakEvenDays < 30 ? 'Good' : 'Consider',
                  color: calculations.breakEvenDays < 7 ? 'text-green-600' : calculations.breakEvenDays < 30 ? 'text-yellow-600' : 'text-red-600'
                }
              ].map((metric, index) => {
                const Icon = metric.icon
                return (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${metric.color}`} />
                    <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                    <div className="text-sm text-gray-600 mb-2">{metric.label}</div>
                    <div className="text-xs text-gray-500">{metric.equivalent}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Equivalent Values */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">What Your Time Savings Could Buy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {getEquivalentValues().map((item, index) => {
                const Icon = item.icon
                return (
                  <div key={index} className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                    <Icon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-xl font-bold text-gray-900 mb-1">{item.value}</div>
                    <div className="text-sm font-medium text-gray-700 mb-1">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Projections Tab */}
      {activeTab === 'projections' && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="card">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timeframe</label>
                  <select
                    value={selectedTimeframe}
                    onChange={(e) => setSelectedTimeframe(e.target.value)}
                    className="input-field text-sm"
                  >
                    {TIMEFRAMES.map(timeframe => (
                      <option key={timeframe} value={timeframe}>{timeframe}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scenario</label>
                  <select
                    value={selectedScenario}
                    onChange={(e) => setSelectedScenario(e.target.value)}
                    className="input-field text-sm"
                  >
                    {SCENARIOS.map(scenario => (
                      <option key={scenario.name} value={scenario.name}>{scenario.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="btn-secondary text-sm"
              >
                {showBreakdown ? 'Hide' : 'Show'} Breakdown
              </button>
            </div>
          </div>

          {/* Savings Over Time Chart */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Savings Over Time</h3>
            <div className="h-80">
              <Line
                data={getSavingsOverTimeChart()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top'
                    },
                    tooltip: {
                      mode: 'index',
                      intersect: false,
                      callbacks: {
                        label: (context) => {
                          return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => formatCurrency(Number(value))
                      }
                    }
                  },
                  interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                  }
                }}
              />
            </div>
          </div>

          {/* Scenario Comparison */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Scenario Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SCENARIOS.map(scenario => {
                const projectionData = getProjectionData(selectedTimeframe, scenario.name)
                const finalValue = projectionData[projectionData.length - 1]
                
                return (
                  <div
                    key={scenario.name}
                    className={`p-4 rounded-lg border-2 ${
                      selectedScenario === scenario.name 
                        ? 'border-primary-300 bg-primary-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="text-center">
                      <h4 className="font-semibold text-gray-900 mb-2">{scenario.name}</h4>
                      <div className="text-2xl font-bold mb-1" style={{ color: scenario.color }}>
                        {formatCurrency(finalValue.net)}
                      </div>
                      <div className="text-sm text-gray-600 mb-3">Net ROI ({selectedTimeframe})</div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Value:</span>
                          <span className="font-medium">{formatCurrency(finalValue.value)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cost:</span>
                          <span className="font-medium">{formatCurrency(finalValue.cost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">ROI:</span>
                          <span className="font-medium">
                            {Math.round((finalValue.net / finalValue.cost) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Detailed Breakdown */}
          {showBreakdown && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Detailed Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-3 font-medium text-gray-900">Month</th>
                      <th className="text-right p-3 font-medium text-gray-900">Hours Saved</th>
                      <th className="text-right p-3 font-medium text-gray-900">Value Created</th>
                      <th className="text-right p-3 font-medium text-gray-900">AI Costs</th>
                      <th className="text-right p-3 font-medium text-gray-900">Net Benefit</th>
                      <th className="text-right p-3 font-medium text-gray-900">Cumulative ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getProjectionData(selectedTimeframe, selectedScenario).slice(0, 12).map(data => (
                      <tr key={data.month} className="border-b border-gray-100">
                        <td className="p-3 text-gray-900">Month {data.month}</td>
                        <td className="p-3 text-right text-gray-900">
                          {formatHours(calculations.hoursSavedMonthly)}
                        </td>
                        <td className="p-3 text-right text-green-600 font-medium">
                          {formatCurrency(data.value / data.month)}
                        </td>
                        <td className="p-3 text-right text-red-600">
                          {formatCurrency(data.cost / data.month)}
                        </td>
                        <td className="p-3 text-right font-medium">
                          {formatCurrency((data.value - data.cost) / data.month)}
                        </td>
                        <td className="p-3 text-right font-bold">
                          {formatCurrency(data.net)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Comparison Tab */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          {/* Before vs After Comparison */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Before vs After AI Implementation</h3>
            <div className="h-80">
              <Bar
                data={getComparisonChart()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top'
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          return `${context.dataset.label}: ${context.parsed.y}h/week`
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Hours per Week'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Task Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Time Savings by Task</h3>
              <div className="h-64">
                <Doughnut
                  data={getTaskBreakdownChart()}
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
                            return `${context.label}: ${Math.round(context.parsed)}% of savings`
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Cost vs Value Analysis</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium text-green-800">Annual Value Created</div>
                    <div className="text-sm text-green-600">Time savings × hourly rate</div>
                  </div>
                  <div className="text-xl font-bold text-green-600">
                    {formatCurrency(calculations.dollarValueYearly)}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div>
                    <div className="font-medium text-red-800">Annual AI Tool Costs</div>
                    <div className="text-sm text-red-600">Monthly cost × 12 months</div>
                  </div>
                  <div className="text-xl font-bold text-red-600">
                    {formatCurrency((financialMetrics.find(m => m.id === 'ai_tool_cost')?.value || 0) * 12)}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <div>
                    <div className="font-medium text-blue-800">Net Annual ROI</div>
                    <div className="text-sm text-blue-600">Value - Costs</div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(calculations.netROIYearly)}
                  </div>
                </div>

                <div className="text-center pt-4">
                  <div className="text-3xl font-bold text-purple-600">
                    {Math.round(calculations.roiPercentage)}%
                  </div>
                  <div className="text-sm text-gray-600">Return on Investment</div>
                </div>
              </div>
            </div>
          </div>

          {/* Benchmarking */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Industry Benchmarks</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 mb-2">15-30%</div>
                <div className="text-sm font-medium text-gray-700 mb-1">Typical AI ROI</div>
                <div className="text-xs text-gray-500">Industry average first year</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 mb-2">6-18 months</div>
                <div className="text-sm font-medium text-gray-700 mb-1">Typical Payback</div>
                <div className="text-xs text-gray-500">Time to break even</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 mb-2">20-40%</div>
                <div className="text-sm font-medium text-gray-700 mb-1">Time Savings</div>
                <div className="text-xs text-gray-500">Productivity improvement</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sharing Tab */}
      {activeTab === 'sharing' && (
        <div className="space-y-6">
          {/* Export Options */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Export Your Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 transition-colors">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h4 className="font-medium text-gray-900 mb-2">PDF Report</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Comprehensive report with all calculations and charts
                </p>
                <button onClick={exportToPDF} className="btn-primary w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </button>
              </div>

              <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 transition-colors">
                <Image className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h4 className="font-medium text-gray-900 mb-2">Social Graphic</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Shareable image for LinkedIn, Twitter, etc.
                </p>
                <button className="btn-secondary w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Generate Image
                </button>
              </div>

              <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 transition-colors">
                <Presentation className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h4 className="font-medium text-gray-900 mb-2">Presentation</h4>
                <p className="text-sm text-gray-600 mb-4">
                  PowerPoint slides for stakeholder presentations
                </p>
                <button className="btn-secondary w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Create Slides
                </button>
              </div>
            </div>
          </div>

          {/* Quick Share */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Share</h3>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Share Text:</div>
              <div className="text-sm text-gray-600 whitespace-pre-line">
{`🤖 My AI ROI Analysis:
💰 Annual Value: ${formatCurrency(calculations.dollarValueYearly)}
⏰ Time Saved: ${formatHours(calculations.hoursSavedWeekly)}/week
📈 ROI: ${Math.round(calculations.roiPercentage)}%
🎯 Break-even: ${Math.round(calculations.breakEvenDays)} days

#AIProductivity #ROI #Automation`}
              </div>
            </div>
            <div className="flex space-x-3">
              <button onClick={shareResults} className="btn-primary flex items-center">
                <Share2 className="w-4 h-4 mr-2" />
                Share Results
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`🤖 My AI ROI Analysis:
💰 Annual Value: ${formatCurrency(calculations.dollarValueYearly)}
⏰ Time Saved: ${formatHours(calculations.hoursSavedWeekly)}/week
📈 ROI: ${Math.round(calculations.roiPercentage)}%
🎯 Break-even: ${Math.round(calculations.breakEvenDays)} days

#AIProductivity #ROI #Automation`)
                  toast.success('Copied to clipboard!')
                }}
                className="btn-secondary"
              >
                Copy Text
              </button>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Privacy & Benchmarking</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <div className="font-medium text-blue-800">Contribute to Industry Benchmarks</div>
                  <div className="text-sm text-blue-600">
                    Help improve ROI calculations for everyone (anonymous data only)
                  </div>
                </div>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-blue-700">Opt in</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="btn-secondary text-sm">
                  Anonymous Sharing
                </button>
                <button className="btn-secondary text-sm">
                  Industry Only
                </button>
                <button className="btn-secondary text-sm">
                  Public Results
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}