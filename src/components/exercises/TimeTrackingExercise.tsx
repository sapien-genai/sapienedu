import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, Square, Clock, Target, TrendingUp, DollarSign, Calendar, BarChart3, PieChart, Zap, AlertCircle } from 'lucide-react'
import { Pie, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import Badge from '@/components/ui/Badge'
import ProgressBar from '@/components/ui/ProgressBar'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface TaskCategory {
  id: string
  name: string
  aiSavings: number
  color: string
}

interface TimeEntry {
  id: string
  categoryId: string
  duration: number // in seconds
  date: string
  description?: string
}

interface TimeTrackingData {
  entries: TimeEntry[]
  totalTime: number
  hourlyRate: number
  workDaysPerWeek: number
  weeksPerYear: number
}

const TASK_CATEGORIES: TaskCategory[] = [
  { id: "email", name: "Email Management", aiSavings: 0.7, color: "#3B82F6" },
  { id: "writing", name: "Content Writing", aiSavings: 0.6, color: "#10B981" },
  { id: "research", name: "Research", aiSavings: 0.8, color: "#F59E0B" },
  { id: "meetings", name: "Meeting Prep/Notes", aiSavings: 0.5, color: "#8B5CF6" },
  { id: "data", name: "Data Analysis", aiSavings: 0.7, color: "#EF4444" },
  { id: "planning", name: "Planning/Organizing", aiSavings: 0.5, color: "#06B6D4" },
  { id: "creative", name: "Creative Work", aiSavings: 0.4, color: "#F97316" },
  { id: "admin", name: "Administrative", aiSavings: 0.8, color: "#84CC16" }
]

interface TimeTrackingExerciseProps {
  initialData?: TimeTrackingData
  onDataChange: (data: TimeTrackingData) => void
  className?: string
}

export default function TimeTrackingExercise({
  initialData,
  onDataChange,
  className = ''
}: TimeTrackingExerciseProps) {
  const [data, setData] = useState<TimeTrackingData>(
    initialData || {
      entries: [],
      totalTime: 0,
      hourlyRate: 50,
      workDaysPerWeek: 5,
      weeksPerYear: 48
    }
  )

  // Timer state
  const [isRunning, setIsRunning] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [taskDescription, setTaskDescription] = useState('')
  const [activeTab, setActiveTab] = useState<'timer' | 'analytics' | 'savings'>('timer')
  const [pomodoroMode, setPomodoroMode] = useState(false)
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60) // 25 minutes in seconds

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('timeTrackingData')
    if (saved) {
      try {
        const parsedData = JSON.parse(saved)
        setData(parsedData)
      } catch (error) {
        console.error('Error loading saved time tracking data:', error)
      }
    }
  }, [])

  useEffect(() => {
    // Save to localStorage whenever data changes
    localStorage.setItem('timeTrackingData', JSON.stringify(data))
    onDataChange(data)
  }, [data, onDataChange])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1
          if (pomodoroMode && newTime >= pomodoroTime) {
            handleStopTimer()
            return pomodoroTime
          }
          return newTime
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, pomodoroMode, pomodoroTime])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartTimer = () => {
    if (!selectedCategory) {
      alert('Please select a task category first')
      return
    }
    setIsRunning(true)
    startTimeRef.current = Date.now()
  }

  const handlePauseTimer = () => {
    setIsRunning(false)
  }

  const handleStopTimer = () => {
    if (currentTime > 0 && selectedCategory) {
      const newEntry: TimeEntry = {
        id: Date.now().toString(),
        categoryId: selectedCategory,
        duration: currentTime,
        date: new Date().toISOString(),
        description: taskDescription || undefined
      }

      setData(prev => ({
        ...prev,
        entries: [...prev.entries, newEntry],
        totalTime: prev.totalTime + currentTime
      }))
    }

    setIsRunning(false)
    setCurrentTime(0)
    setTaskDescription('')
    startTimeRef.current = null
  }

  const getCategoryData = () => {
    const categoryTotals = TASK_CATEGORIES.map(category => {
      const totalSeconds = data.entries
        .filter(entry => entry.categoryId === category.id)
        .reduce((sum, entry) => sum + entry.duration, 0)
      
      return {
        ...category,
        totalSeconds,
        totalHours: totalSeconds / 3600,
        percentage: data.totalTime > 0 ? (totalSeconds / data.totalTime) * 100 : 0
      }
    }).filter(category => category.totalSeconds > 0)

    return categoryTotals.sort((a, b) => b.totalSeconds - a.totalSeconds)
  }

  const calculateSavings = () => {
    const categoryData = getCategoryData()
    const totalPotentialSavings = categoryData.reduce((sum, category) => {
      return sum + (category.totalHours * category.aiSavings)
    }, 0)

    const dailySavings = totalPotentialSavings * data.hourlyRate
    const weeklySavings = dailySavings * data.workDaysPerWeek
    const monthlySavings = weeklySavings * 4.33
    const yearlySavings = weeklySavings * data.weeksPerYear

    return {
      hoursPerWeek: totalPotentialSavings,
      dailySavings,
      weeklySavings,
      monthlySavings,
      yearlySavings,
      topCategory: categoryData[0],
      quickWin: categoryData.find(c => c.aiSavings >= 0.7) || categoryData[0]
    }
  }

  const getPieChartData = () => {
    const categoryData = getCategoryData()
    
    return {
      labels: categoryData.map(c => c.name),
      datasets: [{
        data: categoryData.map(c => c.totalHours),
        backgroundColor: categoryData.map(c => c.color),
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    }
  }

  const getBarChartData = () => {
    const categoryData = getCategoryData()
    
    return {
      labels: categoryData.map(c => c.name),
      datasets: [
        {
          label: 'Current Time (hours)',
          data: categoryData.map(c => c.totalHours),
          backgroundColor: categoryData.map(c => c.color),
          borderRadius: 4
        },
        {
          label: 'With AI (hours)',
          data: categoryData.map(c => c.totalHours * (1 - c.aiSavings)),
          backgroundColor: categoryData.map(c => c.color + '80'),
          borderRadius: 4
        }
      ]
    }
  }

  const savings = calculateSavings()
  const categoryData = getCategoryData()

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'timer', label: 'Time Tracker', icon: Clock },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'savings', label: 'AI Savings', icon: DollarSign }
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

      {/* Timer Tab */}
      {activeTab === 'timer' && (
        <div className="space-y-6">
          {/* Timer Display */}
          <div className="card text-center">
            <div className="text-6xl font-mono font-bold text-gray-900 mb-4">
              {formatTime(currentTime)}
            </div>
            
            {pomodoroMode && (
              <div className="mb-4">
                <ProgressBar 
                  progress={(currentTime / pomodoroTime) * 100} 
                  size="lg"
                  className="mb-2"
                />
                <div className="text-sm text-gray-600">
                  Pomodoro: {formatTime(pomodoroTime - currentTime)} remaining
                </div>
              </div>
            )}

            <div className="flex items-center justify-center space-x-4 mb-6">
              {!isRunning ? (
                <button
                  onClick={handleStartTimer}
                  disabled={!selectedCategory}
                  className="btn-primary flex items-center text-lg px-6 py-3"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start
                </button>
              ) : (
                <button
                  onClick={handlePauseTimer}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center text-lg"
                >
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </button>
              )}
              
              <button
                onClick={handleStopTimer}
                disabled={currentTime === 0}
                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center text-lg"
              >
                <Square className="w-5 h-5 mr-2" />
                Stop
              </button>
            </div>

            {/* Pomodoro Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={pomodoroMode}
                  onChange={(e) => setPomodoroMode(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Pomodoro Mode (25 min)</span>
              </label>
            </div>
          </div>

          {/* Task Setup */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Category</h3>
              <div className="grid grid-cols-2 gap-3">
                {TASK_CATEGORIES.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`p-3 text-left rounded-lg border-2 transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900 text-sm">{category.name}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      AI can save {Math.round(category.aiSavings * 100)}%
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Description</h3>
              <textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="What are you working on? (optional)"
                rows={4}
                className="input-field"
              />
              
              {selectedCategory && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center text-blue-800 text-sm">
                    <Zap className="w-4 h-4 mr-2" />
                    <span>
                      AI could potentially save you{' '}
                      <strong>{Math.round(TASK_CATEGORIES.find(c => c.id === selectedCategory)?.aiSavings! * 100)}%</strong>{' '}
                      of time on this task
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Entries */}
          {data.entries.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Entries</h3>
              <div className="space-y-3">
                {data.entries.slice(-5).reverse().map(entry => {
                  const category = TASK_CATEGORIES.find(c => c.id === entry.categoryId)
                  return (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: category?.color }}
                        />
                        <div>
                          <div className="font-medium text-gray-900">{category?.name}</div>
                          {entry.description && (
                            <div className="text-sm text-gray-600">{entry.description}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{formatTime(entry.duration)}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(entry.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {categoryData.length === 0 ? (
            <div className="card text-center py-12">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Time Data Yet</h3>
              <p className="text-gray-600">Start tracking your time to see analytics here.</p>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card text-center">
                  <div className="text-2xl font-bold text-primary-600 mb-1">
                    {Math.round(data.totalTime / 3600 * 10) / 10}h
                  </div>
                  <div className="text-sm text-gray-600">Total Tracked</div>
                </div>
                <div className="card text-center">
                  <div className="text-2xl font-bold text-success-600 mb-1">
                    {categoryData.length}
                  </div>
                  <div className="text-sm text-gray-600">Categories Used</div>
                </div>
                <div className="card text-center">
                  <div className="text-2xl font-bold text-yellow-600 mb-1">
                    {categoryData[0]?.name.split(' ')[0] || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Top Category</div>
                </div>
                <div className="card text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {Math.round(savings.hoursPerWeek * 10) / 10}h
                  </div>
                  <div className="text-sm text-gray-600">Potential Weekly Savings</div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <PieChart className="w-5 h-5 mr-2" />
                    Time Distribution
                  </h3>
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

                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Before vs After AI
                  </h3>
                  <div className="h-64">
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
                              text: 'Hours'
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
                <div className="space-y-4">
                  {categoryData.map(category => (
                    <div key={category.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: category.color }}
                        />
                        <div>
                          <div className="font-medium text-gray-900">{category.name}</div>
                          <div className="text-sm text-gray-600">
                            {Math.round(category.percentage)}% of total time
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          {Math.round(category.totalHours * 10) / 10}h
                        </div>
                        <div className="text-sm text-success-600">
                          Save {Math.round(category.totalHours * category.aiSavings * 10) / 10}h with AI
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Savings Tab */}
      {activeTab === 'savings' && (
        <div className="space-y-6">
          {/* Settings */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Calculation Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hourly Rate ($)
                </label>
                <input
                  type="number"
                  value={data.hourlyRate}
                  onChange={(e) => setData(prev => ({ ...prev, hourlyRate: Number(e.target.value) }))}
                  className="input-field"
                  min="0"
                  step="5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Days/Week
                </label>
                <input
                  type="number"
                  value={data.workDaysPerWeek}
                  onChange={(e) => setData(prev => ({ ...prev, workDaysPerWeek: Number(e.target.value) }))}
                  className="input-field"
                  min="1"
                  max="7"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Weeks/Year
                </label>
                <input
                  type="number"
                  value={data.weeksPerYear}
                  onChange={(e) => setData(prev => ({ ...prev, weeksPerYear: Number(e.target.value) }))}
                  className="input-field"
                  min="1"
                  max="52"
                />
              </div>
            </div>
          </div>

          {savings.hoursPerWeek > 0 ? (
            <>
              {/* Savings Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card text-center bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {Math.round(savings.hoursPerWeek * 10) / 10}h
                  </div>
                  <div className="text-sm text-green-700">Hours/Week Saved</div>
                </div>
                <div className="card text-center">
                  <div className="text-2xl font-bold text-primary-600 mb-1">
                    ${Math.round(savings.weeklySavings)}
                  </div>
                  <div className="text-sm text-gray-600">Weekly Value</div>
                </div>
                <div className="card text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    ${Math.round(savings.monthlySavings)}
                  </div>
                  <div className="text-sm text-gray-600">Monthly Value</div>
                </div>
                <div className="card text-center">
                  <div className="text-2xl font-bold text-yellow-600 mb-1">
                    ${Math.round(savings.yearlySavings)}
                  </div>
                  <div className="text-sm text-gray-600">Yearly Value</div>
                </div>
              </div>

              {/* Insights */}
              <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  AI Impact Insights
                </h3>
                <div className="space-y-3 text-blue-800">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 mr-2 mt-0.5 text-blue-600" />
                    <span>
                      Your biggest time drain is <strong>{savings.topCategory?.name}</strong> at{' '}
                      <strong>{Math.round(savings.topCategory?.totalHours * 10) / 10} hours</strong> tracked
                    </span>
                  </div>
                  <div className="flex items-start">
                    <Zap className="w-5 h-5 mr-2 mt-0.5 text-blue-600" />
                    <span>
                      AI could save you <strong>{Math.round(savings.hoursPerWeek * 10) / 10} hours/week</strong> on{' '}
                      <strong>{savings.quickWin?.name}</strong>
                    </span>
                  </div>
                  <div className="flex items-start">
                    <DollarSign className="w-5 h-5 mr-2 mt-0.5 text-blue-600" />
                    <span>
                      That's <strong>${Math.round(savings.yearlySavings)}</strong> worth of time you could reclaim annually
                    </span>
                  </div>
                  <div className="flex items-start">
                    <Target className="w-5 h-5 mr-2 mt-0.5 text-blue-600" />
                    <span>
                      Start with <strong>{savings.quickWin?.name}</strong> for immediate impact
                    </span>
                  </div>
                </div>
              </div>

              {/* Equivalent Values */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">What Your Time Savings Could Buy</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <div className="font-semibold text-gray-900">
                      {Math.round(savings.yearlySavings / 200)} vacation days
                    </div>
                    <div className="text-sm text-gray-600">@ $200/day</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <div className="font-semibold text-gray-900">
                      {Math.round(savings.monthlySavings / 500)} car payments
                    </div>
                    <div className="text-sm text-gray-600">@ $500/month</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <div className="font-semibold text-gray-900">
                      {Math.round(savings.hoursPerWeek)} extra hours
                    </div>
                    <div className="text-sm text-gray-600">per week for strategic work</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card text-center py-12">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Savings Data Yet</h3>
              <p className="text-gray-600">Track some time first to see your potential AI savings.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}