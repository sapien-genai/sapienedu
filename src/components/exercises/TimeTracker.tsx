import React, { useState, useEffect, useRef } from 'react'
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  Target, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  BarChart3, 
  PieChart, 
  Zap, 
  AlertCircle,
  Download,
  Share2,
  Settings,
  Timer,
  Activity,
  Briefcase,
  Coffee,
  Users,
  FileText,
  Lightbulb,
  Smartphone,
  Monitor,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Percent
} from 'lucide-react'
import { Pie, Bar, Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
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
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
)

interface TaskCategory {
  id: string
  name: string
  icon: React.ReactNode
  aiSavings: number
  color: string
  description: string
}

interface TimeEntry {
  id: string
  categoryId: string
  duration: number // in seconds
  date: string
  startTime: string
  endTime?: string
  description?: string
  productivity: number // 1-5 rating
  aiUsed: boolean
}

interface TimerSession {
  categoryId: string
  startTime: number
  description: string
  isRunning: boolean
}

interface ROISettings {
  hourlyRate: number
  workDaysPerWeek: number
  weeksPerYear: number
  aiToolCost: number
}

const TASK_CATEGORIES: TaskCategory[] = [
  {
    id: "email",
    name: "Email Management",
    icon: <Briefcase className="w-5 h-5" />,
    aiSavings: 0.7,
    color: "#3B82F6",
    description: "Reading, writing, and organizing emails"
  },
  {
    id: "writing",
    name: "Content Writing",
    icon: <FileText className="w-5 h-5" />,
    aiSavings: 0.6,
    color: "#10B981",
    description: "Creating documents, reports, and content"
  },
  {
    id: "research",
    name: "Research & Analysis",
    icon: <Lightbulb className="w-5 h-5" />,
    aiSavings: 0.8,
    color: "#F59E0B",
    description: "Information gathering and analysis"
  },
  {
    id: "meetings",
    name: "Meetings & Calls",
    icon: <Users className="w-5 h-5" />,
    aiSavings: 0.5,
    color: "#8B5CF6",
    description: "Video calls, meetings, and preparation"
  },
  {
    id: "data",
    name: "Data Processing",
    icon: <BarChart3 className="w-5 h-5" />,
    aiSavings: 0.7,
    color: "#EF4444",
    description: "Data entry, analysis, and reporting"
  },
  {
    id: "planning",
    name: "Planning & Strategy",
    icon: <Target className="w-5 h-5" />,
    aiSavings: 0.5,
    color: "#06B6D4",
    description: "Project planning and strategic thinking"
  },
  {
    id: "creative",
    name: "Creative Work",
    icon: <Smartphone className="w-5 h-5" />,
    aiSavings: 0.4,
    color: "#F97316",
    description: "Design, brainstorming, and creative tasks"
  },
  {
    id: "admin",
    name: "Administrative",
    icon: <Monitor className="w-5 h-5" />,
    aiSavings: 0.8,
    color: "#84CC16",
    description: "Filing, organizing, and routine tasks"
  }
]

interface TimeTrackerProps {
  onDataChange?: (data: any) => void
  initialData?: any
  className?: string
}

export default function TimeTracker({
  onDataChange,
  initialData,
  className = ''
}: TimeTrackerProps) {
  // Timer state
  const [currentSession, setCurrentSession] = useState<TimerSession | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [taskDescription, setTaskDescription] = useState('')
  const [productivity, setProductivity] = useState(3)
  const [aiUsed, setAiUsed] = useState(false)

  // Data state
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [roiSettings, setRoiSettings] = useState<ROISettings>({
    hourlyRate: 50,
    workDaysPerWeek: 5,
    weeksPerYear: 48,
    aiToolCost: 100
  })

  // UI state
  const [activeTab, setActiveTab] = useState<'timer' | 'analytics' | 'roi' | 'export'>('timer')
  const [selectedDateRange, setSelectedDateRange] = useState('week')
  const [showSettings, setShowSettings] = useState(false)
  const [pomodoroMode, setPomodoroMode] = useState(false)
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60) // 25 minutes

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const chartRef = useRef<HTMLDivElement>(null)

  // Load data on mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('timeTrackerEntries')
    const savedSettings = localStorage.getItem('timeTrackerSettings')
    
    if (savedEntries) {
      try {
        setEntries(JSON.parse(savedEntries))
      } catch (error) {
        console.error('Error loading entries:', error)
      }
    }
    
    if (savedSettings) {
      try {
        setRoiSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }

    if (initialData) {
      setEntries(initialData.entries || [])
      setRoiSettings(initialData.roiSettings || roiSettings)
    }
  }, [initialData])

  // Save data when it changes
  useEffect(() => {
    localStorage.setItem('timeTrackerEntries', JSON.stringify(entries))
    localStorage.setItem('timeTrackerSettings', JSON.stringify(roiSettings))
    onDataChange?.({ entries, roiSettings })
  }, [entries, roiSettings, onDataChange])

  // Timer effect
  useEffect(() => {
    if (currentSession?.isRunning) {
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - currentSession.startTime) / 1000)
        setCurrentTime(elapsed)
        
        if (pomodoroMode && elapsed >= pomodoroTime) {
          handleStopTimer()
          toast.success('Pomodoro session completed! 🍅')
        }
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
  }, [currentSession, pomodoroMode, pomodoroTime])

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
      toast.error('Please select a task category first')
      return
    }

    const session: TimerSession = {
      categoryId: selectedCategory,
      startTime: Date.now(),
      description: taskDescription,
      isRunning: true
    }

    setCurrentSession(session)
    setCurrentTime(0)
    toast.success('Timer started! 🚀')
  }

  const handlePauseTimer = () => {
    if (currentSession) {
      setCurrentSession({ ...currentSession, isRunning: false })
      toast.info('Timer paused')
    }
  }

  const handleResumeTimer = () => {
    if (currentSession) {
      const newStartTime = Date.now() - currentTime * 1000
      setCurrentSession({ 
        ...currentSession, 
        startTime: newStartTime,
        isRunning: true 
      })
      toast.success('Timer resumed')
    }
  }

  const handleStopTimer = () => {
    if (!currentSession || currentTime === 0) return

    const now = new Date()
    const startTime = new Date(currentSession.startTime)
    const endTime = new Date(startTime.getTime() + currentTime * 1000)

    const entry: TimeEntry = {
      id: Date.now().toString(),
      categoryId: currentSession.categoryId,
      duration: currentTime,
      date: now.toISOString().split('T')[0],
      startTime: startTime.toTimeString().split(' ')[0],
      endTime: endTime.toTimeString().split(' ')[0],
      description: currentSession.description || undefined,
      productivity,
      aiUsed
    }

    setEntries(prev => [...prev, entry])
    setCurrentSession(null)
    setCurrentTime(0)
    setTaskDescription('')
    setProductivity(3)
    setAiUsed(false)
    
    toast.success(`Session saved! ${formatTime(entry.duration)} tracked`)
  }

  const getFilteredEntries = () => {
    const now = new Date()
    const startDate = new Date()

    switch (selectedDateRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    return entries.filter(entry => new Date(entry.date) >= startDate)
  }

  const getCategoryData = () => {
    const filteredEntries = getFilteredEntries()
    
    return TASK_CATEGORIES.map(category => {
      const categoryEntries = filteredEntries.filter(entry => entry.categoryId === category.id)
      const totalSeconds = categoryEntries.reduce((sum, entry) => sum + entry.duration, 0)
      const totalHours = totalSeconds / 3600
      const avgProductivity = categoryEntries.length > 0 
        ? categoryEntries.reduce((sum, entry) => sum + entry.productivity, 0) / categoryEntries.length 
        : 0
      const aiUsageRate = categoryEntries.length > 0
        ? categoryEntries.filter(entry => entry.aiUsed).length / categoryEntries.length
        : 0

      return {
        ...category,
        totalSeconds,
        totalHours,
        avgProductivity,
        aiUsageRate,
        sessions: categoryEntries.length,
        potentialSavings: totalHours * category.aiSavings
      }
    }).filter(category => category.totalSeconds > 0)
      .sort((a, b) => b.totalSeconds - a.totalSeconds)
  }

  const calculateROI = () => {
    const categoryData = getCategoryData()
    const totalHours = categoryData.reduce((sum, cat) => sum + cat.totalHours, 0)
    const potentialSavings = categoryData.reduce((sum, cat) => sum + cat.potentialSavings, 0)
    
    const currentValue = totalHours * roiSettings.hourlyRate
    const potentialValue = potentialSavings * roiSettings.hourlyRate
    const monthlyCost = roiSettings.aiToolCost
    const yearlyValue = potentialValue * roiSettings.weeksPerYear
    const yearlyCost = monthlyCost * 12
    const netROI = yearlyValue - yearlyCost
    const roiPercentage = yearlyCost > 0 ? (netROI / yearlyCost) * 100 : 0
    const breakEvenDays = monthlyCost > 0 ? (monthlyCost / (potentialValue * roiSettings.workDaysPerWeek / 7)) : 0

    return {
      totalHours,
      potentialSavings,
      currentValue,
      potentialValue,
      yearlyValue,
      yearlyCost,
      netROI,
      roiPercentage,
      breakEvenDays
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

  const getComparisonChartData = () => {
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
          data: categoryData.map(c => c.totalHours - c.potentialSavings),
          backgroundColor: categoryData.map(c => c.color + '80'),
          borderRadius: 4
        }
      ]
    }
  }

  const getProductivityTrendData = () => {
    const filteredEntries = getFilteredEntries()
    const dailyData = new Map()

    filteredEntries.forEach(entry => {
      const date = entry.date
      if (!dailyData.has(date)) {
        dailyData.set(date, { totalTime: 0, totalProductivity: 0, count: 0 })
      }
      const day = dailyData.get(date)
      day.totalTime += entry.duration / 3600
      day.totalProductivity += entry.productivity
      day.count += 1
    })

    const sortedDates = Array.from(dailyData.keys()).sort()
    
    return {
      labels: sortedDates.map(date => new Date(date).toLocaleDateString()),
      datasets: [
        {
          label: 'Hours Tracked',
          data: sortedDates.map(date => dailyData.get(date).totalTime),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y'
        },
        {
          label: 'Avg Productivity',
          data: sortedDates.map(date => dailyData.get(date).totalProductivity / dailyData.get(date).count),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: false,
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    }
  }

  const exportToPDF = async () => {
    if (!chartRef.current) return

    try {
      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      })

      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgData = canvas.toDataURL('image/png')
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      // Add title
      pdf.setFontSize(20)
      pdf.text('Time Tracking Report', 20, 20)
      
      // Add date
      pdf.setFontSize(12)
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30)
      
      position = 40

      // Add image
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`time-tracking-report-${new Date().toISOString().split('T')[0]}.pdf`)
      toast.success('Report exported to PDF!')
    } catch (error) {
      console.error('Error exporting PDF:', error)
      toast.error('Failed to export PDF')
    }
  }

  const exportToImage = async () => {
    if (!chartRef.current) return

    try {
      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      })

      const link = document.createElement('a')
      link.download = `time-tracking-${new Date().toISOString().split('T')[0]}.png`
      link.href = canvas.toDataURL()
      link.click()
      
      toast.success('Chart exported as image!')
    } catch (error) {
      console.error('Error exporting image:', error)
      toast.error('Failed to export image')
    }
  }

  const shareResults = () => {
    const roi = calculateROI()
    const shareText = `⏰ My Time Tracking Results:

📊 Total Hours Tracked: ${roi.totalHours.toFixed(1)}h
💰 Potential Savings: $${Math.round(roi.potentialValue)}
📈 ROI: ${Math.round(roi.roiPercentage)}%
🎯 Break-even: ${Math.round(roi.breakEvenDays)} days

#TimeTracking #Productivity #AIOptimization`

    if (navigator.share) {
      navigator.share({
        title: 'My Time Tracking Results',
        text: shareText
      })
    } else {
      navigator.clipboard.writeText(shareText)
      toast.success('Results copied to clipboard!')
    }
  }

  const categoryData = getCategoryData()
  const roi = calculateROI()

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'timer', label: 'Timer', icon: Timer },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'roi', label: 'ROI Calculator', icon: DollarSign },
            { id: 'export', label: 'Export & Share', icon: Download }
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
            <div className="text-7xl font-mono font-bold text-gray-900 mb-6">
              {formatTime(currentTime)}
            </div>
            
            {pomodoroMode && currentSession?.isRunning && (
              <div className="mb-6">
                <ProgressBar 
                  progress={(currentTime / pomodoroTime) * 100} 
                  size="lg"
                  className="mb-3"
                />
                <div className="text-lg text-gray-600">
                  🍅 {formatTime(pomodoroTime - currentTime)} remaining
                </div>
              </div>
            )}

            <div className="flex items-center justify-center space-x-4 mb-6">
              {!currentSession?.isRunning ? (
                <button
                  onClick={currentSession ? handleResumeTimer : handleStartTimer}
                  disabled={!selectedCategory && !currentSession}
                  className="btn-primary flex items-center text-xl px-8 py-4"
                >
                  <Play className="w-6 h-6 mr-3" />
                  {currentSession ? 'Resume' : 'Start'}
                </button>
              ) : (
                <button
                  onClick={handlePauseTimer}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-4 px-8 rounded-lg transition-colors duration-200 flex items-center text-xl"
                >
                  <Pause className="w-6 h-6 mr-3" />
                  Pause
                </button>
              )}
              
              <button
                onClick={handleStopTimer}
                disabled={!currentSession}
                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-medium py-4 px-8 rounded-lg transition-colors duration-200 flex items-center text-xl"
              >
                <Square className="w-6 h-6 mr-3" />
                Stop
              </button>
            </div>

            {/* Current Session Info */}
            {currentSession && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center space-x-4 text-blue-800">
                  <div className="flex items-center">
                    {TASK_CATEGORIES.find(c => c.id === currentSession.categoryId)?.icon}
                    <span className="ml-2 font-medium">
                      {TASK_CATEGORIES.find(c => c.id === currentSession.categoryId)?.name}
                    </span>
                  </div>
                  {currentSession.description && (
                    <div className="text-blue-600">
                      "{currentSession.description}"
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timer Settings */}
            <div className="flex items-center justify-center space-x-6 text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={pomodoroMode}
                  onChange={(e) => setPomodoroMode(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-2"
                />
                <span className="text-gray-700">Pomodoro Mode (25 min)</span>
              </label>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </button>
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
                    disabled={currentSession?.isRunning}
                    className={`p-4 text-left rounded-lg border-2 transition-all duration-200 disabled:opacity-50 ${
                      selectedCategory === category.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      {category.icon}
                      <span className="ml-2 font-medium text-gray-900 text-sm">{category.name}</span>
                    </div>
                    <div className="text-xs text-gray-600 mb-2">{category.description}</div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-600">
                        AI saves {Math.round(category.aiSavings * 100)}%
                      </span>
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Description (optional)
                  </label>
                  <textarea
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    disabled={currentSession?.isRunning}
                    placeholder="What are you working on?"
                    rows={3}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Productivity (1-5)
                  </label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        onClick={() => setProductivity(rating)}
                        disabled={currentSession?.isRunning}
                        className={`w-10 h-10 rounded-full text-sm font-medium transition-colors disabled:opacity-50 ${
                          productivity === rating
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="ai-used"
                    checked={aiUsed}
                    onChange={(e) => setAiUsed(e.target.checked)}
                    disabled={currentSession?.isRunning}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="ai-used" className="ml-2 text-sm text-gray-700">
                    Planning to use AI tools for this task
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Sessions */}
          {entries.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h3>
              <div className="space-y-3">
                {entries.slice(-5).reverse().map(entry => {
                  const category = TASK_CATEGORIES.find(c => c.id === entry.categoryId)
                  return (
                    <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: category?.color }}
                        />
                        <div>
                          <div className="font-medium text-gray-900">{category?.name}</div>
                          <div className="text-sm text-gray-600">
                            {entry.startTime} - {entry.endTime}
                            {entry.description && ` • ${entry.description}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{formatTime(entry.duration)}</div>
                        <div className="flex items-center space-x-2 text-xs">
                          <div className="flex items-center">
                            {Array.from({ length: 5 }, (_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full mr-1 ${
                                  i < entry.productivity ? 'bg-yellow-400' : 'bg-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          {entry.aiUsed && (
                            <Badge variant="success" size="sm">AI</Badge>
                          )}
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
        <div className="space-y-6" ref={chartRef}>
          {/* Date Range Selector */}
          <div className="card">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Analytics Dashboard</h3>
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="input-field text-sm"
              >
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>

          {categoryData.length === 0 ? (
            <div className="card text-center py-12">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Yet</h3>
              <p className="text-gray-600">Start tracking your time to see analytics here.</p>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card text-center bg-gradient-to-r from-blue-50 to-blue-100">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {Math.round(roi.totalHours * 10) / 10}h
                  </div>
                  <div className="text-sm text-blue-700">Total Tracked</div>
                </div>
                <div className="card text-center bg-gradient-to-r from-green-50 to-green-100">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {Math.round(roi.potentialSavings * 10) / 10}h
                  </div>
                  <div className="text-sm text-green-700">Potential Savings</div>
                </div>
                <div className="card text-center bg-gradient-to-r from-purple-50 to-purple-100">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {categoryData.length}
                  </div>
                  <div className="text-sm text-purple-700">Active Categories</div>
                </div>
                <div className="card text-center bg-gradient-to-r from-yellow-50 to-yellow-100">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    {Math.round(categoryData.reduce((sum, cat) => sum + cat.avgProductivity, 0) / categoryData.length * 10) / 10}
                  </div>
                  <div className="text-sm text-yellow-700">Avg Productivity</div>
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
                          },
                          tooltip: {
                            callbacks: {
                              label: (context) => {
                                const hours = context.parsed.toFixed(1)
                                const percentage = ((context.parsed / roi.totalHours) * 100).toFixed(1)
                                return `${context.label}: ${hours}h (${percentage}%)`
                              }
                            }
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
                                return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}h`
                              }
                            }
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

              {/* Productivity Trend */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Productivity Trends
                </h3>
                <div className="h-64">
                  <Line
                    data={getProductivityTrendData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      interaction: {
                        mode: 'index',
                        intersect: false,
                      },
                      scales: {
                        y: {
                          type: 'linear',
                          display: true,
                          position: 'left',
                          title: {
                            display: true,
                            text: 'Hours'
                          }
                        },
                        y1: {
                          type: 'linear',
                          display: true,
                          position: 'right',
                          title: {
                            display: true,
                            text: 'Productivity (1-5)'
                          },
                          grid: {
                            drawOnChartArea: false,
                          },
                          min: 1,
                          max: 5
                        },
                      },
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Analysis</h3>
                <div className="space-y-4">
                  {categoryData.map(category => (
                    <div key={category.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-3"
                            style={{ backgroundColor: category.color }}
                          />
                          <div>
                            <div className="font-medium text-gray-900">{category.name}</div>
                            <div className="text-sm text-gray-600">
                              {category.sessions} sessions • Avg productivity: {category.avgProductivity.toFixed(1)}/5
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            {category.totalHours.toFixed(1)}h
                          </div>
                          <div className="text-sm text-green-600">
                            Save {category.potentialSavings.toFixed(1)}h with AI
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-medium text-gray-900">
                            {Math.round((category.totalHours / roi.totalHours) * 100)}%
                          </div>
                          <div className="text-gray-600">of total time</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-900">
                            {Math.round(category.aiUsageRate * 100)}%
                          </div>
                          <div className="text-gray-600">AI usage rate</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-900">
                            ${Math.round(category.potentialSavings * roiSettings.hourlyRate)}
                          </div>
                          <div className="text-gray-600">potential value</div>
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

      {/* ROI Calculator Tab */}
      {activeTab === 'roi' && (
        <div className="space-y-6">
          {/* Settings */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">ROI Calculation Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hourly Rate ($)
                </label>
                <input
                  type="number"
                  value={roiSettings.hourlyRate}
                  onChange={(e) => setRoiSettings(prev => ({ ...prev, hourlyRate: Number(e.target.value) }))}
                  className="input-field"
                  min="0"
                  step="5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Days/Week
                </label>
                <input
                  type="number"
                  value={roiSettings.workDaysPerWeek}
                  onChange={(e) => setRoiSettings(prev => ({ ...prev, workDaysPerWeek: Number(e.target.value) }))}
                  className="input-field"
                  min="1"
                  max="7"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Weeks/Year
                </label>
                <input
                  type="number"
                  value={roiSettings.weeksPerYear}
                  onChange={(e) => setRoiSettings(prev => ({ ...prev, weeksPerYear: Number(e.target.value) }))}
                  className="input-field"
                  min="1"
                  max="52"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly AI Tool Cost ($)
                </label>
                <input
                  type="number"
                  value={roiSettings.aiToolCost}
                  onChange={(e) => setRoiSettings(prev => ({ ...prev, aiToolCost: Number(e.target.value) }))}
                  className="input-field"
                  min="0"
                  step="10"
                />
              </div>
            </div>
          </div>

          {roi.totalHours > 0 ? (
            <>
              {/* ROI Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card text-center bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {roi.potentialSavings.toFixed(1)}h
                  </div>
                  <div className="text-sm text-green-700">Potential Weekly Savings</div>
                </div>
                <div className="card text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">
                    ${Math.round(roi.potentialValue * roiSettings.workDaysPerWeek)}
                  </div>
                  <div className="text-sm text-gray-600">Weekly Value</div>
                </div>
                <div className="card text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    ${Math.round(roi.yearlyValue)}
                  </div>
                  <div className="text-sm text-gray-600">Annual Value</div>
                </div>
                <div className="card text-center">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    {Math.round(roi.roiPercentage)}%
                  </div>
                  <div className="text-sm text-gray-600">ROI Percentage</div>
                </div>
              </div>

              {/* ROI Analysis */}
              <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <h3 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
                  <TrendingUp className="w-6 h-6 mr-2" />
                  ROI Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700">Current Time Investment:</span>
                      <span className="font-bold text-blue-900">{roi.totalHours.toFixed(1)} hours</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700">Potential Time Savings:</span>
                      <span className="font-bold text-blue-900">{roi.potentialSavings.toFixed(1)} hours</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700">Annual Value Created:</span>
                      <span className="font-bold text-blue-900">${Math.round(roi.yearlyValue)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700">Annual AI Tool Cost:</span>
                      <span className="font-bold text-blue-900">${Math.round(roi.yearlyCost)}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700">Net Annual ROI:</span>
                      <span className={`font-bold ${roi.netROI > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${Math.round(roi.netROI)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700">ROI Percentage:</span>
                      <span className={`font-bold ${roi.roiPercentage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.round(roi.roiPercentage)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700">Break-even Time:</span>
                      <span className="font-bold text-blue-900">{Math.round(roi.breakEvenDays)} days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700">Efficiency Gain:</span>
                      <span className="font-bold text-blue-900">
                        {Math.round((roi.potentialSavings / roi.totalHours) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ROI Status */}
              <div className="card">
                <div className="flex items-center justify-center">
                  {roi.roiPercentage > 200 ? (
                    <div className="flex items-center text-green-700 bg-green-100 px-6 py-3 rounded-full">
                      <ArrowUp className="w-5 h-5 mr-2" />
                      <span className="font-medium text-lg">Excellent ROI - Highly Recommended</span>
                    </div>
                  ) : roi.roiPercentage > 100 ? (
                    <div className="flex items-center text-blue-700 bg-blue-100 px-6 py-3 rounded-full">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span className="font-medium text-lg">Good ROI - Recommended</span>
                    </div>
                  ) : roi.roiPercentage > 0 ? (
                    <div className="flex items-center text-yellow-700 bg-yellow-100 px-6 py-3 rounded-full">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      <span className="font-medium text-lg">Positive ROI - Consider Implementation</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-700 bg-red-100 px-6 py-3 rounded-full">
                      <ArrowDown className="w-5 h-5 mr-2" />
                      <span className="font-medium text-lg">Negative ROI - Review Strategy</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Equivalent Values */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">What Your Time Savings Could Buy</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <div className="font-semibold text-gray-900">
                      {Math.round(roi.yearlyValue / 200)} vacation days
                    </div>
                    <div className="text-sm text-gray-600">@ $200/day</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <div className="font-semibold text-gray-900">
                      {Math.round((roi.potentialValue * roiSettings.workDaysPerWeek * 4.33) / 500)} car payments
                    </div>
                    <div className="text-sm text-gray-600">@ $500/month</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <div className="font-semibold text-gray-900">
                      {roi.potentialSavings.toFixed(1)} extra hours
                    </div>
                    <div className="text-sm text-gray-600">per week for strategic work</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card text-center py-12">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Time Data Yet</h3>
              <p className="text-gray-600">Start tracking your time to calculate ROI.</p>
            </div>
          )}
        </div>
      )}

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Export & Share Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 transition-colors">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h4 className="font-medium text-gray-900 mb-2">PDF Report</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Comprehensive report with charts and analysis
                </p>
                <button onClick={exportToPDF} className="btn-primary w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </button>
              </div>

              <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 transition-colors">
                <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h4 className="font-medium text-gray-900 mb-2">Chart Image</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Export charts as high-quality images
                </p>
                <button onClick={exportToImage} className="btn-secondary w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export Image
                </button>
              </div>

              <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 transition-colors">
                <Share2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h4 className="font-medium text-gray-900 mb-2">Share Results</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Share your productivity insights
                </p>
                <button onClick={shareResults} className="btn-secondary w-full">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Data Summary */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Data Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Tracking Statistics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Sessions:</span>
                    <span className="font-medium">{entries.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Time Tracked:</span>
                    <span className="font-medium">{roi.totalHours.toFixed(1)} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Categories:</span>
                    <span className="font-medium">{categoryData.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">AI Usage Rate:</span>
                    <span className="font-medium">
                      {entries.length > 0 ? Math.round((entries.filter(e => e.aiUsed).length / entries.length) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">ROI Highlights</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Potential Savings:</span>
                    <span className="font-medium">{roi.potentialSavings.toFixed(1)} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Annual Value:</span>
                    <span className="font-medium">${Math.round(roi.yearlyValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ROI Percentage:</span>
                    <span className={`font-medium ${roi.roiPercentage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.round(roi.roiPercentage)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Break-even:</span>
                    <span className="font-medium">{Math.round(roi.breakEvenDays)} days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Timer Settings</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pomodoro Duration (minutes)
                </label>
                <input
                  type="number"
                  value={pomodoroTime / 60}
                  onChange={(e) => setPomodoroTime(Number(e.target.value) * 60)}
                  className="input-field"
                  min="5"
                  max="60"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="btn-primary"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}