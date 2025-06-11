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
  Presentation,
  ChevronDown,
  ChevronUp,
  Sliders,
  Printer,
  Mail
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
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

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
  fiveYearValue: number
  paybackPeriod: number
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
  },
  {
    id: "implementation_cost",
    label: "One-time implementation cost",
    value: 500,
    min: 0,
    max: 10000,
    type: "currency"
  },
  {
    id: "training_hours",
    label: "Training hours required",
    value: 10,
    min: 0,
    max: 100,
    type: "number"
  }
]

const SCENARIOS: Scenario[] = [
  { name: 'Conservative', multiplier: 0.7, color: '#EF4444' },
  { name: 'Expected', multiplier: 1.0, color: '#3B82F6' },
  { name: 'Optimistic', multiplier: 1.3, color: '#10B981' }
]

const TIMEFRAMES = ['3 months', '6 months', '1 year', '3 years', '5 years']

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
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [comparisonView, setComparisonView] = useState<'chart' | 'table'>('chart')
  const [reportRef, setReportRef] = useState<HTMLDivElement | null>(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  // Advanced settings
  const [settings, setSettings] = useState({
    workWeeksPerYear: 48,
    workDaysPerWeek: 5,
    productivityLoss: 10, // percentage during learning curve
    learningCurveWeeks: 4,
    annualValueIncrease: 5, // percentage increase in value year over year
    discountRate: 3, // for NPV calculations
  })

  useEffect(() => {
    if (initialData) {
      if (initialData.timeMetrics) setTimeMetrics(initialData.timeMetrics)
      if (initialData.financialMetrics) setFinancialMetrics(initialData.financialMetrics)
      if (initialData.settings) setSettings(initialData.settings)
    }
  }, [initialData])

  useEffect(() => {
    onDataChange({ 
      timeMetrics, 
      financialMetrics,
      settings,
      calculations: calculations
    })
  }, [timeMetrics, financialMetrics, settings])

  const calculations = useMemo((): ROICalculations => {
    const hourlyValue = financialMetrics.find(m => m.id === 'hourly_value')?.value || 0
    const aiToolCost = financialMetrics.find(m => m.id === 'ai_tool_cost')?.value || 0
    const implementationCost = financialMetrics.find(m => m.id === 'implementation_cost')?.value || 0
    const trainingHours = financialMetrics.find(m => m.id === 'training_hours')?.value || 0

    const hoursSavedWeekly = timeMetrics.reduce((sum, metric) => 
      sum + (metric.hours * metric.aiReduction), 0
    )

    const hoursSavedMonthly = hoursSavedWeekly * 4.33
    const hoursSavedYearly = hoursSavedWeekly * settings.workWeeksPerYear

    const dollarValueWeekly = hoursSavedWeekly * hourlyValue
    const dollarValueMonthly = dollarValueWeekly * 4.33
    const dollarValueYearly = dollarValueWeekly * settings.workWeeksPerYear

    // Account for learning curve
    const learningCurveLoss = (settings.productivityLoss / 100) * dollarValueWeekly * settings.learningCurveWeeks
    const firstYearValue = dollarValueYearly - learningCurveLoss - (trainingHours * hourlyValue)

    // Calculate 5-year value with annual increases
    let fiveYearValue = firstYearValue
    for (let year = 1; year < 5; year++) {
      const yearlyValue = dollarValueYearly * Math.pow(1 + (settings.annualValueIncrease / 100), year)
      const discountFactor = Math.pow(1 + (settings.discountRate / 100), year + 1)
      fiveYearValue += yearlyValue / discountFactor
    }

    const totalFirstYearCost = (aiToolCost * 12) + implementationCost
    const netROIMonthly = dollarValueMonthly - aiToolCost
    const netROIYearly = firstYearValue - totalFirstYearCost

    // Break-even calculation
    const dailyValue = dollarValueWeekly / settings.workDaysPerWeek
    const totalUpfrontCost = implementationCost + (trainingHours * hourlyValue)
    const breakEvenDays = totalUpfrontCost > 0 
      ? totalUpfrontCost / (dailyValue - (aiToolCost / 30))
      : aiToolCost > 0 
        ? aiToolCost / (dailyValue * 30)
        : 0

    // Payback period in months
    const paybackPeriod = totalFirstYearCost > 0 
      ? totalFirstYearCost / dollarValueMonthly
      : 0

    const roiPercentage = totalFirstYearCost > 0 
      ? (netROIYearly / totalFirstYearCost) * 100 
      : 0

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
      roiPercentage,
      fiveYearValue,
      paybackPeriod
    }
  }, [timeMetrics, financialMetrics, settings])

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

  const addCustomTimeMetric = () => {
    const newId = `custom_${Date.now()}`
    const newMetric: TimeMetric = {
      id: newId,
      label: "Custom task",
      hours: 5,
      aiReduction: 0.5,
      min: 0,
      max: 40,
      step: 0.5
    }
    setTimeMetrics(prev => [...prev, newMetric])
  }

  const removeTimeMetric = (id: string) => {
    setTimeMetrics(prev => prev.filter(metric => metric.id !== id))
  }

  const getProjectionData = (timeframe: string, scenario: string) => {
    const months = timeframe === '3 months' ? 3 : 
                  timeframe === '6 months' ? 6 : 
                  timeframe === '1 year' ? 12 : 
                  timeframe === '3 years' ? 36 : 60

    const scenarioMultiplier = SCENARIOS.find(s => s.name === scenario)?.multiplier || 1
    const monthlyValue = calculations.dollarValueMonthly * scenarioMultiplier
    const monthlyCost = financialMetrics.find(m => m.id === 'ai_tool_cost')?.value || 0
    const implementationCost = financialMetrics.find(m => m.id === 'implementation_cost')?.value || 0
    const trainingHours = financialMetrics.find(m => m.id === 'training_hours')?.value || 0
    const hourlyValue = financialMetrics.find(m => m.id === 'hourly_value')?.value || 0
    const trainingCost = trainingHours * hourlyValue

    const data = []
    let cumulativeValue = 0
    let cumulativeCost = implementationCost + trainingCost
    
    // Apply learning curve to first few months
    const learningCurveMonths = Math.ceil(settings.learningCurveWeeks / 4)
    
    for (let month = 1; month <= months; month++) {
      // Apply productivity loss during learning curve
      let monthValue = monthlyValue
      if (month <= learningCurveMonths) {
        const learningFactor = 1 - (settings.productivityLoss / 100) * (learningCurveMonths - month + 1) / learningCurveMonths
        monthValue = monthlyValue * learningFactor
      }
      
      // Apply annual value increase for later years
      if (month > 12) {
        const yearNumber = Math.floor(month / 12)
        const yearlyIncreaseFactor = Math.pow(1 + (settings.annualValueIncrease / 100), yearNumber)
        monthValue = monthValue * yearlyIncreaseFactor
      }
      
      // Apply discount rate for NPV
      const discountFactor = Math.pow(1 + (settings.discountRate / 100) / 12, month)
      const discountedValue = monthValue / discountFactor
      
      cumulativeValue += discountedValue
      cumulativeCost += monthlyCost
      
      data.push({
        month,
        value: cumulativeValue,
        cost: cumulativeCost,
        net: cumulativeValue - cumulativeCost,
        monthlyValue: discountedValue,
        monthlyCost: monthlyCost
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

  const getScenarioComparisonChart = () => {
    // Get data for all scenarios with the selected timeframe
    const scenarioData = SCENARIOS.map(scenario => {
      const projectionData = getProjectionData(selectedTimeframe, scenario.name)
      const finalData = projectionData[projectionData.length - 1]
      return {
        name: scenario.name,
        color: scenario.color,
        net: finalData.net,
        value: finalData.value,
        cost: finalData.cost,
        roi: (finalData.net / finalData.cost) * 100
      }
    })

    return {
      labels: scenarioData.map(s => s.name),
      datasets: [
        {
          label: 'Net ROI',
          data: scenarioData.map(s => s.net),
          backgroundColor: scenarioData.map(s => s.color),
          borderWidth: 1,
          borderColor: scenarioData.map(s => s.color),
          borderRadius: 4
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
          '#EF4444',
          '#06B6D4',
          '#F97316',
          '#84CC16'
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

  const generatePDF = async () => {
    if (!reportRef) return
    
    setIsGeneratingPDF(true)
    try {
      const canvas = await html2canvas(reportRef, {
        scale: 2,
        logging: false,
        useCORS: true
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      
      const imgWidth = 210
      const imgHeight = canvas.height * imgWidth / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      pdf.save(`ai-roi-report-${new Date().toISOString().split('T')[0]}.pdf`)
      
      toast.success('ROI report exported as PDF!')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Failed to generate PDF. Please try again.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const exportToJSON = () => {
    const reportData = {
      calculations,
      timeMetrics,
      financialMetrics,
      settings,
      scenarios: {
        conservative: getProjectionData('5 years', 'Conservative'),
        expected: getProjectionData('5 years', 'Expected'),
        optimistic: getProjectionData('5 years', 'Optimistic')
      },
      equivalentValues: getEquivalentValues(),
      generatedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-roi-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('ROI data exported successfully!')
  }

  const shareResults = () => {
    const shareText = `🤖 My AI ROI Analysis:
💰 Annual Value: $${Math.round(calculations.dollarValueYearly).toLocaleString()}
⏰ Time Saved: ${Math.round(calculations.hoursSavedWeekly)}h/week
📈 ROI: ${Math.round(calculations.roiPercentage)}%
🎯 Break-even: ${Math.round(calculations.breakEvenDays)} days
💵 5-Year Value: $${Math.round(calculations.fiveYearValue).toLocaleString()}

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

  const getRoiRating = () => {
    if (calculations.roiPercentage > 300) return { text: 'Exceptional', color: '#10B981' }
    if (calculations.roiPercentage > 200) return { text: 'Excellent', color: '#10B981' }
    if (calculations.roiPercentage > 100) return { text: 'Good', color: '#3B82F6' }
    if (calculations.roiPercentage > 50) return { text: 'Positive', color: '#F59E0B' }
    if (calculations.roiPercentage > 0) return { text: 'Marginal', color: '#F59E0B' }
    return { text: 'Negative', color: '#EF4444' }
  }

  const getBreakEvenRating = () => {
    if (calculations.breakEvenDays < 7) return { text: 'Immediate', color: '#10B981' }
    if (calculations.breakEvenDays < 30) return { text: 'Quick', color: '#10B981' }
    if (calculations.breakEvenDays < 90) return { text: 'Good', color: '#3B82F6' }
    if (calculations.breakEvenDays < 180) return { text: 'Moderate', color: '#F59E0B' }
    return { text: 'Long-term', color: '#EF4444' }
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
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Time Allocation & AI Impact</h3>
              <button 
                onClick={addCustomTimeMetric}
                className="btn-secondary text-sm flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Custom Task
              </button>
            </div>
            <div className="space-y-6">
              {timeMetrics.map((metric, index) => (
                <div key={metric.id} className="space-y-3 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={metric.label}
                        onChange={(e) => updateTimeMetric(metric.id, 'label', e.target.value as any)}
                        className="font-medium text-gray-700 bg-transparent border-b border-dashed border-gray-300 focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">AI saves</span>
                        <Badge variant="success" size="sm">
                          {Math.round(metric.aiReduction * 100)}%
                        </Badge>
                      </div>
                      {index >= DEFAULT_TIME_METRICS.length && (
                        <button
                          onClick={() => removeTimeMetric(metric.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
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
                        <strong>Value:</strong> {formatCurrency(metric.hours * metric.aiReduction * (financialMetrics.find(m => m.id === 'hourly_value')?.value || 0))}/week
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Metrics */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Financial Parameters</h3>
              <button
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                className="btn-secondary text-sm flex items-center"
              >
                <Sliders className="w-4 h-4 mr-2" />
                {showAdvancedSettings ? 'Hide' : 'Show'} Advanced Settings
              </button>
            </div>
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
                    <span>{metric.type === 'currency' ? formatCurrency(metric.min) : metric.min}</span>
                    <span>{metric.type === 'currency' ? formatCurrency(metric.max) : metric.max}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Advanced Settings */}
            {showAdvancedSettings && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">Advanced Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Work weeks per year
                    </label>
                    <input
                      type="number"
                      value={settings.workWeeksPerYear}
                      onChange={(e) => setSettings(prev => ({ ...prev, workWeeksPerYear: Number(e.target.value) }))}
                      className="input-field"
                      min={1}
                      max={52}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Work days per week
                    </label>
                    <input
                      type="number"
                      value={settings.workDaysPerWeek}
                      onChange={(e) => setSettings(prev => ({ ...prev, workDaysPerWeek: Number(e.target.value) }))}
                      className="input-field"
                      min={1}
                      max={7}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Learning curve (weeks)
                    </label>
                    <input
                      type="number"
                      value={settings.learningCurveWeeks}
                      onChange={(e) => setSettings(prev => ({ ...prev, learningCurveWeeks: Number(e.target.value) }))}
                      className="input-field"
                      min={0}
                      max={26}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Productivity loss during learning (%)
                    </label>
                    <input
                      type="number"
                      value={settings.productivityLoss}
                      onChange={(e) => setSettings(prev => ({ ...prev, productivityLoss: Number(e.target.value) }))}
                      className="input-field"
                      min={0}
                      max={100}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Annual value increase (%)
                    </label>
                    <input
                      type="number"
                      value={settings.annualValueIncrease}
                      onChange={(e) => setSettings(prev => ({ ...prev, annualValueIncrease: Number(e.target.value) }))}
                      className="input-field"
                      min={0}
                      max={50}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount rate (%)
                    </label>
                    <input
                      type="number"
                      value={settings.discountRate}
                      onChange={(e) => setSettings(prev => ({ ...prev, discountRate: Number(e.target.value) }))}
                      className="input-field"
                      min={0}
                      max={20}
                    />
                  </div>
                </div>
              </div>
            )}
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
                  equivalent: `${getRoiRating().text} return`,
                  color: 'text-purple-600'
                },
                {
                  label: 'Break-even Time',
                  value: `${Math.round(calculations.breakEvenDays)} days`,
                  icon: Target,
                  equivalent: getBreakEvenRating().text,
                  color: getBreakEvenRating().color
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
                className="btn-secondary text-sm flex items-center"
              >
                {showBreakdown ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
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
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Scenario Analysis</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">View:</span>
                <div className="flex rounded-lg overflow-hidden border border-gray-300">
                  <button
                    onClick={() => setComparisonView('chart')}
                    className={`px-3 py-1 text-sm ${
                      comparisonView === 'chart'
                        ? 'bg-primary-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Chart
                  </button>
                  <button
                    onClick={() => setComparisonView('table')}
                    className={`px-3 py-1 text-sm ${
                      comparisonView === 'table'
                        ? 'bg-primary-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Table
                  </button>
                </div>
              </div>
            </div>

            {comparisonView === 'chart' ? (
              <div className="h-80">
                <Bar
                  data={getScenarioComparisonChart()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            return `Net ROI: ${formatCurrency(context.parsed.y)}`
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
                    }
                  }}
                />
              </div>
            ) : (
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
            )}
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
                    {getProjectionData(selectedTimeframe, selectedScenario).map((data, index) => {
                      // Only show every 3rd month after the first year to avoid too many rows
                      if (data.month > 12 && data.month % 3 !== 0 && data.month !== parseInt(selectedTimeframe)) {
                        return null
                      }
                      
                      return (
                        <tr key={data.month} className="border-b border-gray-100">
                          <td className="p-3 text-gray-900">Month {data.month}</td>
                          <td className="p-3 text-right text-gray-900">
                            {formatHours(calculations.hoursSavedMonthly)}
                          </td>
                          <td className="p-3 text-right text-green-600 font-medium">
                            {formatCurrency(data.monthlyValue)}
                          </td>
                          <td className="p-3 text-right text-red-600">
                            {formatCurrency(data.monthlyCost)}
                          </td>
                          <td className="p-3 text-right font-medium">
                            {formatCurrency(data.monthlyValue - data.monthlyCost)}
                          </td>
                          <td className="p-3 text-right font-bold">
                            {formatCurrency(data.net)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Key Metrics */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Key Financial Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">Payback Period</div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {calculations.paybackPeriod < 1 
                    ? `${Math.round(calculations.paybackPeriod * 30)} days` 
                    : `${Math.round(calculations.paybackPeriod * 10) / 10} months`}
                </div>
                <div className="text-xs text-gray-500">Time to recoup investment</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">5-Year Value</div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {formatCurrency(calculations.fiveYearValue)}
                </div>
                <div className="text-xs text-gray-500">Net present value (NPV)</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">First Year ROI</div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {Math.round(calculations.roiPercentage)}%
                </div>
                <div className="text-xs text-gray-500">Return on investment</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">Monthly Net Benefit</div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {formatCurrency(calculations.netROIMonthly)}
                </div>
                <div className="text-xs text-gray-500">After AI tool costs</div>
              </div>
            </div>
          </div>
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

                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div>
                    <div className="font-medium text-yellow-800">Implementation Costs</div>
                    <div className="text-sm text-yellow-600">One-time costs + training</div>
                  </div>
                  <div className="text-xl font-bold text-yellow-600">
                    {formatCurrency(
                      (financialMetrics.find(m => m.id === 'implementation_cost')?.value || 0) +
                      (financialMetrics.find(m => m.id === 'training_hours')?.value || 0) *
                      (financialMetrics.find(m => m.id === 'hourly_value')?.value || 0)
                    )}
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

          {/* Scenario Comparison Table */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Scenario Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-3 font-medium text-gray-900">Metric</th>
                    {SCENARIOS.map(scenario => (
                      <th 
                        key={scenario.name} 
                        className="text-right p-3 font-medium text-gray-900"
                        style={{ color: scenario.color }}
                      >
                        {scenario.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Annual Value', getValue: (s: string) => {
                      const multiplier = SCENARIOS.find(sc => sc.name === s)?.multiplier || 1
                      return calculations.dollarValueYearly * multiplier
                    }},
                    { label: 'Annual Costs', getValue: (s: string) => {
                      const aiToolCost = (financialMetrics.find(m => m.id === 'ai_tool_cost')?.value || 0) * 12
                      const implementationCost = (financialMetrics.find(m => m.id === 'implementation_cost')?.value || 0)
                      const trainingCost = (financialMetrics.find(m => m.id === 'training_hours')?.value || 0) * 
                                          (financialMetrics.find(m => m.id === 'hourly_value')?.value || 0)
                      return aiToolCost + (implementationCost + trainingCost) / 3 // Amortize implementation over 3 years
                    }},
                    { label: 'Net Annual ROI', getValue: (s: string) => {
                      const multiplier = SCENARIOS.find(sc => sc.name === s)?.multiplier || 1
                      const value = calculations.dollarValueYearly * multiplier
                      const aiToolCost = (financialMetrics.find(m => m.id === 'ai_tool_cost')?.value || 0) * 12
                      const implementationCost = (financialMetrics.find(m => m.id === 'implementation_cost')?.value || 0)
                      const trainingCost = (financialMetrics.find(m => m.id === 'training_hours')?.value || 0) * 
                                          (financialMetrics.find(m => m.id === 'hourly_value')?.value || 0)
                      const costs = aiToolCost + (implementationCost + trainingCost) / 3
                      return value - costs
                    }},
                    { label: 'ROI Percentage', getValue: (s: string) => {
                      const multiplier = SCENARIOS.find(sc => sc.name === s)?.multiplier || 1
                      const value = calculations.dollarValueYearly * multiplier
                      const aiToolCost = (financialMetrics.find(m => m.id === 'ai_tool_cost')?.value || 0) * 12
                      const implementationCost = (financialMetrics.find(m => m.id === 'implementation_cost')?.value || 0)
                      const trainingCost = (financialMetrics.find(m => m.id === 'training_hours')?.value || 0) * 
                                          (financialMetrics.find(m => m.id === 'hourly_value')?.value || 0)
                      const costs = aiToolCost + (implementationCost + trainingCost) / 3
                      return costs > 0 ? ((value - costs) / costs) * 100 : 0
                    }},
                    { label: 'Break-even (days)', getValue: (s: string) => {
                      const multiplier = SCENARIOS.find(sc => sc.name === s)?.multiplier || 1
                      return calculations.breakEvenDays / multiplier
                    }},
                    { label: '5-Year Value', getValue: (s: string) => {
                      const multiplier = SCENARIOS.find(sc => sc.name === s)?.multiplier || 1
                      return calculations.fiveYearValue * multiplier
                    }}
                  ].map((row, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="p-3 font-medium text-gray-900">{row.label}</td>
                      {SCENARIOS.map(scenario => {
                        const value = row.getValue(scenario.name)
                        return (
                          <td 
                            key={scenario.name} 
                            className="p-3 text-right font-medium"
                            style={{ color: scenario.color }}
                          >
                            {row.label.includes('Percentage') 
                              ? `${Math.round(value)}%` 
                              : row.label.includes('days')
                                ? `${Math.round(value)} days`
                                : formatCurrency(value)}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
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
          {/* Report Preview */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Report Preview</h3>
            <div 
              ref={setReportRef}
              className="border border-gray-200 rounded-lg p-6 bg-white"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">AI ROI Analysis Report</h2>
                <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Annual Value:</span>
                      <span className="font-medium">{formatCurrency(calculations.dollarValueYearly)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Weekly Time Saved:</span>
                      <span className="font-medium">{formatHours(calculations.hoursSavedWeekly)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ROI Percentage:</span>
                      <span className="font-medium">{Math.round(calculations.roiPercentage)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Break-even:</span>
                      <span className="font-medium">{Math.round(calculations.breakEvenDays)} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">5-Year Value:</span>
                      <span className="font-medium">{formatCurrency(calculations.fiveYearValue)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Recommendation</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      {calculations.roiPercentage > 100 ? (
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                      )}
                      <span className="text-gray-700">
                        {calculations.roiPercentage > 200 
                          ? 'Strongly recommended implementation'
                          : calculations.roiPercentage > 100
                            ? 'Recommended implementation'
                            : calculations.roiPercentage > 50
                              ? 'Consider implementation'
                              : 'Review strategy before implementation'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Target className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-gray-700">
                        Focus first on {timeMetrics.sort((a, b) => 
                          (b.hours * b.aiReduction * (financialMetrics.find(m => m.id === 'hourly_value')?.value || 0)) - 
                          (a.hours * a.aiReduction * (financialMetrics.find(m => m.id === 'hourly_value')?.value || 0))
                        )[0]?.label.replace('/week', '')}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-purple-600 mr-2" />
                      <span className="text-gray-700">
                        Expected payback period: {calculations.paybackPeriod < 1 
                          ? `${Math.round(calculations.paybackPeriod * 30)} days` 
                          : `${Math.round(calculations.paybackPeriod * 10) / 10} months`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Time Savings by Task</h4>
                <div className="space-y-3">
                  {timeMetrics.map(metric => (
                    <div key={metric.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{metric.label}</div>
                        <div className="text-sm text-gray-600">
                          {metric.hours}h/week × {Math.round(metric.aiReduction * 100)}% reduction
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          {formatHours(metric.hours * metric.aiReduction)}/week
                        </div>
                        <div className="text-sm text-green-600">
                          {formatCurrency(metric.hours * metric.aiReduction * (financialMetrics.find(m => m.id === 'hourly_value')?.value || 0))}/week
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Scenario Comparison</h4>
                  <div className="space-y-2">
                    {SCENARIOS.map(scenario => {
                      const projectionData = getProjectionData('1 year', scenario.name)
                      const finalValue = projectionData[projectionData.length - 1]
                      
                      return (
                        <div 
                          key={scenario.name} 
                          className="flex items-center justify-between p-3 rounded-lg"
                          style={{ backgroundColor: `${scenario.color}10` }}
                        >
                          <span className="font-medium" style={{ color: scenario.color }}>
                            {scenario.name}
                          </span>
                          <span className="font-bold" style={{ color: scenario.color }}>
                            {formatCurrency(finalValue.net)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">What This Could Buy</h4>
                  <div className="space-y-2 text-sm">
                    {getEquivalentValues().map((item, index) => (
                      <div key={index} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">{item.label}</span>
                        <span className="font-medium text-gray-900">{item.value} {item.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-center text-sm text-gray-500">
                <p>This report was generated using the AI ROI Calculator.</p>
                <p>All calculations are estimates based on the provided inputs.</p>
              </div>
            </div>
          </div>

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
                <button 
                  onClick={generatePDF} 
                  disabled={isGeneratingPDF}
                  className="btn-primary w-full flex items-center justify-center"
                >
                  {isGeneratingPDF ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Export PDF
                    </>
                  )}
                </button>
              </div>

              <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 transition-colors">
                <Image className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h4 className="font-medium text-gray-900 mb-2">Social Graphic</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Shareable image for LinkedIn, Twitter, etc.
                </p>
                <button onClick={shareResults} className="btn-primary w-full flex items-center justify-center">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Results
                </button>
              </div>

              <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 transition-colors">
                <Presentation className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h4 className="font-medium text-gray-900 mb-2">Raw Data</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Export all data in JSON format for further analysis
                </p>
                <button onClick={exportToJSON} className="btn-primary w-full flex items-center justify-center">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
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
💵 5-Year Value: ${formatCurrency(calculations.fiveYearValue)}

#AIProductivity #ROI #Automation`}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
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
💵 5-Year Value: ${formatCurrency(calculations.fiveYearValue)}

#AIProductivity #ROI #Automation`)
                  toast.success('Copied to clipboard!')
                }}
                className="btn-secondary flex items-center"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Text
              </button>
              <button
                onClick={() => {
                  window.print()
                }}
                className="btn-secondary flex items-center"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Report
              </button>
              <button
                onClick={() => {
                  window.location.href = `mailto:?subject=AI ROI Analysis&body=🤖 My AI ROI Analysis:%0A%0A💰 Annual Value: ${formatCurrency(calculations.dollarValueYearly)}%0A⏰ Time Saved: ${formatHours(calculations.hoursSavedWeekly)}/week%0A📈 ROI: ${Math.round(calculations.roiPercentage)}%%0A🎯 Break-even: ${Math.round(calculations.breakEvenDays)} days%0A💵 5-Year Value: ${formatCurrency(calculations.fiveYearValue)}%0A%0A#AIProductivity #ROI #Automation`
                }}
                className="btn-secondary flex items-center"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}