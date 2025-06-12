import React, { useState, useEffect } from 'react'
import { 
  DollarSign, 
  Clock, 
  TrendingUp, 
  Calculator, 
  Calendar, 
  BarChart3, 
  PieChart, 
  Download, 
  Share2, 
  Zap,
  ArrowRight,
  CheckCircle,
  Settings,
  Save
} from 'lucide-react'
import { Bar, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import Badge from '@/components/ui/Badge'
import ProgressBar from '@/components/ui/ProgressBar'
import { toast } from 'sonner'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface TimeMetric {
  id: string
  label: string
  hours: number
  aiReduction: number
}

interface FinancialMetric {
  id: string
  label: string
  value: number
}

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
  const [timeMetrics, setTimeMetrics] = useState<TimeMetric[]>([
    { id: "email_hours", label: "Hours on email/week", hours: 10, aiReduction: 0.7 },
    { id: "writing_hours", label: "Hours writing content/week", hours: 8, aiReduction: 0.6 },
    { id: "research_hours", label: "Hours researching/week", hours: 6, aiReduction: 0.8 },
    { id: "meeting_prep_hours", label: "Hours on meeting prep/notes", hours: 5, aiReduction: 0.5 },
    { id: "data_analysis_hours", label: "Hours analyzing data/week", hours: 4, aiReduction: 0.7 }
  ])

  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetric[]>([
    { id: "hourly_value", label: "Your hourly rate/value", value: 75 },
    { id: "ai_tool_cost", label: "Monthly AI tool budget", value: 100 }
  ])

  const [activeTab, setActiveTab] = useState<'calculator' | 'charts' | 'report'>('calculator')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [comparisonMode, setComparisonMode] = useState<'hours' | 'cost'>('hours')

  useEffect(() => {
    if (initialData) {
      if (initialData.timeMetrics) setTimeMetrics(initialData.timeMetrics)
      if (initialData.financialMetrics) setFinancialMetrics(initialData.financialMetrics)
    }
  }, [initialData])

  useEffect(() => {
    onDataChange({
      timeMetrics,
      financialMetrics,
      results: calculateResults()
    })
  }, [timeMetrics, financialMetrics])

  const updateTimeMetric = (id: string, field: keyof TimeMetric, value: number) => {
    setTimeMetrics(prev => 
      prev.map(metric => 
        metric.id === id ? { ...metric, [field]: value } : metric
      )
    )
  }

  const updateFinancialMetric = (id: string, value: number) => {
    setFinancialMetrics(prev => 
      prev.map(metric => 
        metric.id === id ? { ...metric, value } : metric
      )
    )
  }

  const calculateResults = () => {
    // Calculate time savings
    const totalHoursPerWeek = timeMetrics.reduce((sum, metric) => sum + metric.hours, 0)
    const totalHoursSavedPerWeek = timeMetrics.reduce((sum, metric) => sum + (metric.hours * metric.aiReduction), 0)
    const totalHoursPerYear = totalHoursPerWeek * 50 // Assuming 50 work weeks per year
    const totalHoursSavedPerYear = totalHoursSavedPerWeek * 50
    
    // Calculate financial impact
    const hourlyRate = financialMetrics.find(m => m.id === 'hourly_value')?.value || 0
    const monthlyToolCost = financialMetrics.find(m => m.id === 'ai_tool_cost')?.value || 0
    const annualToolCost = monthlyToolCost * 12
    
    const weeklySavings = totalHoursSavedPerWeek * hourlyRate
    const monthlySavings = weeklySavings * 4.33 // Average weeks per month
    const annualSavings = totalHoursSavedPerYear * hourlyRate
    
    // Calculate ROI
    const netAnnualSavings = annualSavings - annualToolCost
    const roi = annualToolCost > 0 ? (netAnnualSavings / annualToolCost) * 100 : 0
    const paybackPeriod = monthlyToolCost > 0 ? (monthlyToolCost / (weeklySavings * 4.33)) * 12 : 0
    
    return {
      time: {
        totalHoursPerWeek,
        totalHoursSavedPerWeek,
        totalHoursPerYear,
        totalHoursSavedPerYear,
        percentageSaved: totalHoursPerWeek > 0 ? (totalHoursSavedPerWeek / totalHoursPerWeek) * 100 : 0
      },
      financial: {
        weeklySavings,
        monthlySavings,
        annualSavings,
        annualToolCost,
        netAnnualSavings,
        roi,
        paybackPeriod
      }
    }
  }

  const results = calculateResults()

  const getBarChartData = () => {
    return {
      labels: timeMetrics.map(metric => metric.label.replace('Hours on ', '').replace('Hours ', '').replace('/week', '')),
      datasets: [
        {
          label: 'Current Hours',
          data: timeMetrics.map(metric => metric.hours),
          backgroundColor: '#3B82F6',
          borderRadius: 4
        },
        {
          label: 'With AI',
          data: timeMetrics.map(metric => metric.hours * (1 - metric.aiReduction)),
          backgroundColor: '#10B981',
          borderRadius: 4
        }
      ]
    }
  }

  const getPieChartData = () => {
    if (comparisonMode === 'hours') {
      return {
        labels: ['Hours Saved', 'Remaining Hours'],
        datasets: [{
          data: [
            results.time.totalHoursSavedPerWeek,
            results.time.totalHoursPerWeek - results.time.totalHoursSavedPerWeek
          ],
          backgroundColor: ['#10B981', '#3B82F6'],
          borderWidth: 0
        }]
      }
    } else {
      return {
        labels: ['Net Savings', 'AI Tool Cost'],
        datasets: [{
          data: [
            results.financial.netAnnualSavings,
            results.financial.annualToolCost
          ],
          backgroundColor: ['#10B981', '#F59E0B'],
          borderWidth: 0
        }]
      }
    }
  }

  const addNewTimeMetric = () => {
    const newId = `custom_metric_${Date.now()}`
    setTimeMetrics([
      ...timeMetrics,
      { id: newId, label: "Custom task", hours: 5, aiReduction: 0.5 }
    ])
  }

  const removeTimeMetric = (id: string) => {
    setTimeMetrics(prev => prev.filter(metric => metric.id !== id))
  }

  const exportResults = () => {
    const data = {
      inputs: {
        timeMetrics,
        financialMetrics
      },
      results,
      exportDate: new Date().toISOString(),
      summary: {
        annualHoursSaved: Math.round(results.time.totalHoursSavedPerYear),
        annualDollarsSaved: Math.round(results.financial.netAnnualSavings),
        roi: Math.round(results.financial.roi)
      }
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-roi-calculator-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('ROI analysis exported successfully!')
  }

  const saveResults = () => {
    onDataChange({
      timeMetrics,
      financialMetrics,
      results: calculateResults()
    })
    toast.success('ROI analysis saved successfully!')
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'calculator', label: 'Calculator', icon: Calculator },
            { id: 'charts', label: 'Charts', icon: BarChart3 },
            { id: 'report', label: 'Report', icon: TrendingUp }
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
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Time Investment
              </h3>
              <button
                onClick={addNewTimeMetric}
                className="btn-secondary text-sm flex items-center"
              >
                <Zap className="w-4 h-4 mr-2" />
                Add Task
              </button>
            </div>

            <div className="space-y-4">
              {timeMetrics.map(metric => (
                <div key={metric.id} className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={metric.label}
                      onChange={(e) => updateTimeMetric(metric.id, 'label', e.target.value as any)}
                      className="input-field"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={metric.hours}
                      onChange={(e) => updateTimeMetric(metric.id, 'hours', Number(e.target.value))}
                      className="input-field"
                      min="0"
                      step="0.5"
                    />
                  </div>
                  <div className="col-span-4">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2 w-24">AI Savings:</span>
                      <input
                        type="range"
                        value={metric.aiReduction * 100}
                        onChange={(e) => updateTimeMetric(metric.id, 'aiReduction', Number(e.target.value) / 100)}
                        className="flex-1"
                        min="0"
                        max="100"
                        step="5"
                      />
                      <span className="text-sm font-medium text-gray-900 ml-2 w-12">
                        {Math.round(metric.aiReduction * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="col-span-1">
                    {timeMetrics.length > 1 && (
                      <button
                        onClick={() => removeTimeMetric(metric.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-lg font-semibold text-gray-900">
                <span>Total Weekly Time:</span>
                <span>{results.time.totalHoursPerWeek} hours</span>
              </div>
              <div className="flex items-center justify-between text-lg font-semibold text-success-600 mt-2">
                <span>Weekly Time Saved:</span>
                <span>{results.time.totalHoursSavedPerWeek.toFixed(1)} hours</span>
              </div>
            </div>
          </div>

          {/* Financial Metrics */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Financial Metrics
              </h3>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="btn-secondary text-sm flex items-center"
              >
                <Settings className="w-4 h-4 mr-2" />
                {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {financialMetrics.map(metric => (
                <div key={metric.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {metric.label}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={metric.value}
                      onChange={(e) => updateFinancialMetric(metric.id, Number(e.target.value))}
                      className="input-field pl-10"
                      min="0"
                      step="5"
                    />
                  </div>
                </div>
              ))}
            </div>

            {showAdvanced && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">Advanced Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Work Weeks Per Year
                    </label>
                    <input
                      type="number"
                      value="50"
                      className="input-field"
                      min="1"
                      max="52"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Implementation Cost
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        value="0"
                        className="input-field pl-10"
                        min="0"
                        disabled
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Training Hours
                    </label>
                    <input
                      type="number"
                      value="0"
                      className="input-field"
                      min="0"
                      disabled
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Results */}
          <div className="card bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              ROI Summary
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-success-600 mb-2">
                  {Math.round(results.financial.roi)}%
                </div>
                <div className="text-sm text-gray-600">Annual ROI</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  ${Math.round(results.financial.netAnnualSavings).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Annual Net Savings</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {results.financial.paybackPeriod < 1 
                    ? `${Math.round(results.financial.paybackPeriod * 30)} days` 
                    : `${results.financial.paybackPeriod.toFixed(1)} months`}
                </div>
                <div className="text-sm text-gray-600">Payback Period</div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Time Savings</span>
                <span className="text-sm text-gray-600">
                  {Math.round(results.time.percentageSaved)}% of current time
                </span>
              </div>
              <ProgressBar 
                progress={results.time.percentageSaved} 
                size="md"
              />
            </div>
          </div>
        </div>
      )}

      {/* Charts Tab */}
      {activeTab === 'charts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Time Comparison by Task
              </h3>
              <div className="h-80">
                <Bar
                  data={getBarChartData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
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

            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  {comparisonMode === 'hours' ? 'Time Savings' : 'Cost vs. Savings'}
                </h3>
                <select
                  value={comparisonMode}
                  onChange={(e) => setComparisonMode(e.target.value as any)}
                  className="input-field text-sm"
                >
                  <option value="hours">Time View</option>
                  <option value="cost">Financial View</option>
                </select>
              </div>
              <div className="h-64">
                <Pie
                  data={getPieChartData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Time Savings Over Time
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-primary-600 mb-1">
                  {results.time.totalHoursSavedPerWeek.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Hours/Week</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-600 mb-1">
                  {Math.round(results.time.totalHoursSavedPerWeek * 4.33)}
                </div>
                <div className="text-sm text-gray-600">Hours/Month</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-600 mb-1">
                  {Math.round(results.time.totalHoursSavedPerYear)}
                </div>
                <div className="text-sm text-gray-600">Hours/Year</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-600 mb-1">
                  {Math.round(results.time.totalHoursSavedPerYear / 8)}
                </div>
                <div className="text-sm text-gray-600">Workdays/Year</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Tab */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              ROI Analysis Report
            </h3>

            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-blue-900 mb-4">Executive Summary</h4>
                <p className="text-blue-800 mb-4">
                  Implementing AI tools for the analyzed tasks could save approximately{' '}
                  <strong>{Math.round(results.time.totalHoursSavedPerYear)} hours per year</strong>, equivalent to{' '}
                  <strong>${Math.round(results.financial.netAnnualSavings).toLocaleString()}</strong> in net annual savings.
                  This represents a return on investment of <strong>{Math.round(results.financial.roi)}%</strong>.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-success-600 mb-1">
                      {Math.round(results.time.percentageSaved)}%
                    </div>
                    <div className="text-sm text-gray-600">Time Reduction</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-primary-600 mb-1">
                      ${Math.round(results.financial.monthlySavings).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Monthly Savings</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {results.financial.paybackPeriod < 1 
                        ? `${Math.round(results.financial.paybackPeriod * 30)} days` 
                        : `${results.financial.paybackPeriod.toFixed(1)} months`}
                    </div>
                    <div className="text-sm text-gray-600">Payback Period</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Detailed Analysis</h4>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-3">Time Investment</h5>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2">Task</th>
                          <th className="text-right py-2">Current Hours</th>
                          <th className="text-right py-2">AI Reduction</th>
                          <th className="text-right py-2">Hours Saved</th>
                        </tr>
                      </thead>
                      <tbody>
                        {timeMetrics.map(metric => (
                          <tr key={metric.id} className="border-b border-gray-100">
                            <td className="py-2">{metric.label}</td>
                            <td className="text-right py-2">{metric.hours}</td>
                            <td className="text-right py-2">{Math.round(metric.aiReduction * 100)}%</td>
                            <td className="text-right py-2 font-medium text-success-600">
                              {(metric.hours * metric.aiReduction).toFixed(1)}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-gray-50 font-medium">
                          <td className="py-2">Total (Weekly)</td>
                          <td className="text-right py-2">{results.time.totalHoursPerWeek}</td>
                          <td className="text-right py-2">{Math.round(results.time.percentageSaved)}%</td>
                          <td className="text-right py-2 font-medium text-success-600">
                            {results.time.totalHoursSavedPerWeek.toFixed(1)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-3">Financial Impact</h5>
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="py-2">Hourly Value</td>
                          <td className="text-right py-2">${financialMetrics.find(m => m.id === 'hourly_value')?.value}</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2">Monthly AI Tool Cost</td>
                          <td className="text-right py-2">${financialMetrics.find(m => m.id === 'ai_tool_cost')?.value}</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2">Annual AI Tool Cost</td>
                          <td className="text-right py-2">${results.financial.annualToolCost}</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2">Weekly Time Value Saved</td>
                          <td className="text-right py-2">${Math.round(results.financial.weeklySavings)}</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2">Monthly Time Value Saved</td>
                          <td className="text-right py-2">${Math.round(results.financial.monthlySavings)}</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2">Annual Time Value Saved</td>
                          <td className="text-right py-2">${Math.round(results.financial.annualSavings).toLocaleString()}</td>
                        </tr>
                        <tr className="bg-gray-50 font-medium">
                          <td className="py-2">Net Annual Savings</td>
                          <td className="text-right py-2 text-success-600">${Math.round(results.financial.netAnnualSavings).toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-3">ROI Metrics</h5>
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="py-2">Return on Investment (ROI)</td>
                          <td className="text-right py-2 font-medium text-success-600">{Math.round(results.financial.roi)}%</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2">Payback Period</td>
                          <td className="text-right py-2">
                            {results.financial.paybackPeriod < 1 
                              ? `${Math.round(results.financial.paybackPeriod * 30)} days` 
                              : `${results.financial.paybackPeriod.toFixed(1)} months`}
                          </td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2">5-Year Net Savings</td>
                          <td className="text-right py-2">${Math.round(results.financial.netAnnualSavings * 5).toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-green-900 mb-4">Recommendations</h4>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-green-800">Proceed with AI implementation</div>
                      <div className="text-sm text-green-700">
                        With a {Math.round(results.financial.roi)}% ROI and payback period of {results.financial.paybackPeriod < 1 
                          ? `${Math.round(results.financial.paybackPeriod * 30)} days` 
                          : `${results.financial.paybackPeriod.toFixed(1)} months`}, 
                        this investment is highly favorable.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <ArrowRight className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-green-800">Focus on high-impact areas first</div>
                      <div className="text-sm text-green-700">
                        Start with {timeMetrics.sort((a, b) => (b.hours * b.aiReduction) - (a.hours * a.aiReduction))[0].label.toLowerCase()} 
                        for maximum initial time savings.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <ArrowRight className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-green-800">Reinvest time savings strategically</div>
                      <div className="text-sm text-green-700">
                        Allocate saved time to high-value strategic work that can't be automated.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          onClick={saveResults}
          className="btn-secondary flex items-center"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Analysis
        </button>
        <button
          onClick={exportResults}
          className="btn-secondary flex items-center"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Analysis
        </button>
      </div>
    </div>
  )
}