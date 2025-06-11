import React, { useState, useEffect } from 'react'
import { 
  Calendar, 
  Flame, 
  Trophy, 
  Star, 
  Clock, 
  Target, 
  TrendingUp, 
  Users, 
  Bell, 
  Settings,
  CheckCircle,
  Plus,
  BarChart3,
  Award,
  Zap,
  Crown,
  Gift,
  Share2
} from 'lucide-react'
import Badge from '@/components/ui/Badge'
import ProgressBar from '@/components/ui/ProgressBar'
import { toast } from 'sonner'

interface AIHabit {
  id: string
  name: string
  description: string
  icon: string
  points: number
  streak_multiplier: number
  category: 'morning' | 'productivity' | 'learning' | 'creative' | 'optimization'
}

interface HabitEntry {
  id: string
  habitId: string
  date: string
  completed: boolean
  completionTime?: string
  qualityRating?: number
  timeSaved?: number
  notes?: string
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  points: number
  unlocked: boolean
  unlockedAt?: string
}

interface Streak {
  habitId: string
  current: number
  longest: number
  lastDate: string
}

interface WeeklyStats {
  totalPoints: number
  habitsCompleted: number
  currentStreak: number
  timeSaved: number
  level: number
  nextLevelPoints: number
}

const AI_HABITS: AIHabit[] = [
  {
    id: "morning_ai",
    name: "Morning AI Planning",
    description: "Ask AI to prioritize your day",
    icon: "🌅",
    points: 10,
    streak_multiplier: 1.1,
    category: "morning"
  },
  {
    id: "ai_email",
    name: "AI Email Assistant",
    description: "Use AI for at least one email",
    icon: "📧",
    points: 15,
    streak_multiplier: 1.15,
    category: "productivity"
  },
  {
    id: "ai_learning",
    name: "Learn Something New",
    description: "Use AI to research or learn",
    icon: "🎓",
    points: 20,
    streak_multiplier: 1.2,
    category: "learning"
  },
  {
    id: "ai_creative",
    name: "Creative AI Use",
    description: "Try AI for creative tasks",
    icon: "🎨",
    points: 25,
    streak_multiplier: 1.25,
    category: "creative"
  },
  {
    id: "ai_optimization",
    name: "Optimize a Process",
    description: "Improve a workflow with AI",
    icon: "⚡",
    points: 30,
    streak_multiplier: 1.3,
    category: "optimization"
  }
]

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "early_bird",
    name: "Early Bird",
    description: "Complete morning AI task before 7 AM",
    icon: "🐦",
    points: 50,
    unlocked: false
  },
  {
    id: "efficiency_expert",
    name: "Efficiency Expert",
    description: "Save 10+ hours in one week",
    icon: "📊",
    points: 100,
    unlocked: false
  },
  {
    id: "prompt_master",
    name: "Prompt Master",
    description: "Create 10 successful prompts",
    icon: "💬",
    points: 150,
    unlocked: false
  },
  {
    id: "teacher",
    name: "AI Teacher",
    description: "Help 3 people with AI",
    icon: "👨‍🏫",
    points: 200,
    unlocked: false
  },
  {
    id: "week_warrior",
    name: "Week Warrior",
    description: "Complete all habits for 7 days",
    icon: "⚔️",
    points: 100,
    unlocked: false
  },
  {
    id: "habit_builder",
    name: "Habit Builder",
    description: "Maintain 21-day streak",
    icon: "🏗️",
    points: 300,
    unlocked: false
  },
  {
    id: "ai_native",
    name: "AI Native",
    description: "30-day streak milestone",
    icon: "🤖",
    points: 500,
    unlocked: false
  }
]

const STREAK_MILESTONES = [
  { days: 3, badge: "Starter", bonus: 50, reward: "Basic prompts unlocked" },
  { days: 7, badge: "Week Warrior", bonus: 100, reward: "Advanced prompts unlocked" },
  { days: 14, badge: "Fortnight Fighter", bonus: 200, reward: "Pro workflows unlocked" },
  { days: 21, badge: "Habit Builder", bonus: 300, reward: "Custom habits feature" },
  { days: 30, badge: "AI Native", bonus: 500, reward: "Mentor program access" },
  { days: 60, badge: "AI Master", bonus: 1000, reward: "Beta features access" },
  { days: 90, badge: "AI Transformer", bonus: 2000, reward: "Certification eligible" }
]

interface WeeklyAIHabitTrackerProps {
  initialData?: any
  onDataChange: (data: any) => void
  className?: string
}

export default function WeeklyAIHabitTracker({
  initialData,
  onDataChange,
  className = ''
}: WeeklyAIHabitTrackerProps) {
  const [entries, setEntries] = useState<HabitEntry[]>([])
  const [streaks, setStreaks] = useState<Streak[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS)
  const [activeTab, setActiveTab] = useState<'today' | 'calendar' | 'analytics' | 'achievements' | 'leaderboard'>('today')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showHabitModal, setShowHabitModal] = useState(false)
  const [selectedHabit, setSelectedHabit] = useState<AIHabit | null>(null)
  const [habitForm, setHabitForm] = useState({
    qualityRating: 5,
    timeSaved: 0,
    notes: ''
  })
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    totalPoints: 0,
    habitsCompleted: 0,
    currentStreak: 0,
    timeSaved: 0,
    level: 1,
    nextLevelPoints: 100
  })

  useEffect(() => {
    // Load data from localStorage
    const savedEntries = localStorage.getItem('aiHabitEntries')
    const savedStreaks = localStorage.getItem('aiHabitStreaks')
    const savedAchievements = localStorage.getItem('aiHabitAchievements')

    if (savedEntries) setEntries(JSON.parse(savedEntries))
    if (savedStreaks) setStreaks(JSON.parse(savedStreaks))
    if (savedAchievements) setAchievements(JSON.parse(savedAchievements))
  }, [])

  useEffect(() => {
    // Save to localStorage and calculate stats
    localStorage.setItem('aiHabitEntries', JSON.stringify(entries))
    localStorage.setItem('aiHabitStreaks', JSON.stringify(streaks))
    localStorage.setItem('aiHabitAchievements', JSON.stringify(achievements))
    
    calculateWeeklyStats()
    onDataChange({ entries, streaks, achievements })
  }, [entries, streaks, achievements, onDataChange])

  const calculateWeeklyStats = () => {
    const today = new Date()
    const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay())
    const weekEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate >= weekStart && entryDate <= today && entry.completed
    })

    const totalPoints = weekEntries.reduce((sum, entry) => {
      const habit = AI_HABITS.find(h => h.id === entry.habitId)
      const streak = streaks.find(s => s.habitId === entry.habitId)
      const basePoints = habit?.points || 0
      const streakMultiplier = streak && streak.current > 1 ? Math.pow(habit?.streak_multiplier || 1, Math.min(streak.current, 10)) : 1
      return sum + (basePoints * streakMultiplier)
    }, 0)

    const timeSaved = weekEntries.reduce((sum, entry) => sum + (entry.timeSaved || 0), 0)
    const currentStreak = Math.max(...streaks.map(s => s.current), 0)
    const level = Math.floor(totalPoints / 100) + 1
    const nextLevelPoints = level * 100

    setWeeklyStats({
      totalPoints,
      habitsCompleted: weekEntries.length,
      currentStreak,
      timeSaved,
      level,
      nextLevelPoints
    })
  }

  const completeHabit = (habit: AIHabit) => {
    setSelectedHabit(habit)
    setShowHabitModal(true)
  }

  const submitHabitCompletion = () => {
    if (!selectedHabit) return

    const now = new Date()
    const entry: HabitEntry = {
      id: Date.now().toString(),
      habitId: selectedHabit.id,
      date: selectedDate,
      completed: true,
      completionTime: now.toTimeString().split(' ')[0],
      qualityRating: habitForm.qualityRating,
      timeSaved: habitForm.timeSaved,
      notes: habitForm.notes || undefined
    }

    // Remove any existing entry for this habit today
    const filteredEntries = entries.filter(e => !(e.habitId === selectedHabit.id && e.date === selectedDate))
    setEntries([...filteredEntries, entry])

    // Update streak
    updateStreak(selectedHabit.id, selectedDate)

    // Check for achievements
    checkAchievements(entry)

    // Calculate points with streak multiplier
    const streak = streaks.find(s => s.habitId === selectedHabit.id)
    const streakMultiplier = streak && streak.current > 1 ? Math.pow(selectedHabit.streak_multiplier, Math.min(streak.current + 1, 10)) : 1
    const points = Math.round(selectedHabit.points * streakMultiplier)

    toast.success(`🎉 +${points} points! ${selectedHabit.name} completed!`)

    setShowHabitModal(false)
    setHabitForm({ qualityRating: 5, timeSaved: 0, notes: '' })
    setSelectedHabit(null)
  }

  const updateStreak = (habitId: string, date: string) => {
    const existingStreak = streaks.find(s => s.habitId === habitId)
    const yesterday = new Date(date)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if (existingStreak) {
      const isConsecutive = existingStreak.lastDate === yesterdayStr
      const newCurrent = isConsecutive ? existingStreak.current + 1 : 1
      
      setStreaks(prev => prev.map(s => 
        s.habitId === habitId 
          ? {
              ...s,
              current: newCurrent,
              longest: Math.max(s.longest, newCurrent),
              lastDate: date
            }
          : s
      ))

      // Check for streak milestones
      const milestone = STREAK_MILESTONES.find(m => m.days === newCurrent)
      if (milestone) {
        toast.success(`🔥 ${milestone.badge} achieved! +${milestone.bonus} bonus points!`)
      }
    } else {
      setStreaks(prev => [...prev, {
        habitId,
        current: 1,
        longest: 1,
        lastDate: date
      }])
    }
  }

  const checkAchievements = (entry: HabitEntry) => {
    // Early Bird achievement
    if (entry.habitId === 'morning_ai' && entry.completionTime && entry.completionTime < '07:00:00') {
      unlockAchievement('early_bird')
    }

    // Efficiency Expert achievement
    const weekTimeSaved = entries
      .filter(e => e.date >= getWeekStart() && e.timeSaved)
      .reduce((sum, e) => sum + (e.timeSaved || 0), 0) + (entry.timeSaved || 0)
    
    if (weekTimeSaved >= 10) {
      unlockAchievement('efficiency_expert')
    }
  }

  const unlockAchievement = (achievementId: string) => {
    const achievement = achievements.find(a => a.id === achievementId)
    if (achievement && !achievement.unlocked) {
      setAchievements(prev => prev.map(a => 
        a.id === achievementId 
          ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() }
          : a
      ))
      toast.success(`🏆 Achievement Unlocked: ${achievement.name}! +${achievement.points} points!`)
    }
  }

  const getWeekStart = () => {
    const today = new Date()
    const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay())
    return weekStart.toISOString().split('T')[0]
  }

  const isHabitCompletedToday = (habitId: string) => {
    return entries.some(entry => 
      entry.habitId === habitId && 
      entry.date === selectedDate && 
      entry.completed
    )
  }

  const getHabitStreak = (habitId: string) => {
    return streaks.find(s => s.habitId === habitId)?.current || 0
  }

  const generateCalendarHeatmap = () => {
    const today = new Date()
    const startDate = new Date(today.getFullYear(), today.getMonth() - 2, 1)
    const days = []
    
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      const dayEntries = entries.filter(e => e.date === dateStr && e.completed)
      const intensity = Math.min(dayEntries.length, 4)
      
      days.push({
        date: dateStr,
        intensity,
        count: dayEntries.length
      })
    }
    
    return days
  }

  const getIntensityColor = (intensity: number) => {
    const colors = ['#EBEDF0', '#C7E9C0', '#73C276', '#238B45', '#00441B']
    return colors[intensity] || colors[0]
  }

  const renderCalendarHeatmap = () => {
    const days = generateCalendarHeatmap()
    
    return (
      <div className="space-y-2">
        <h4 className="font-medium text-gray-900">Activity Heatmap</h4>
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-xs text-gray-500 text-center p-1">
              {day}
            </div>
          ))}
          {days.map(day => (
            <div
              key={day.date}
              className="w-3 h-3 rounded-sm cursor-pointer"
              style={{ backgroundColor: getIntensityColor(day.intensity) }}
              title={`${day.date}: ${day.count} habits completed`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Less</span>
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map(intensity => (
              <div
                key={intensity}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: getIntensityColor(intensity) }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Stats */}
      <div className="card bg-gradient-to-r from-primary-50 to-success-50 border-primary-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Flame className="w-6 h-6 text-orange-500 mr-2" />
              <span className="text-2xl font-bold text-gray-900">{weeklyStats.currentStreak}</span>
            </div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Star className="w-6 h-6 text-yellow-500 mr-2" />
              <span className="text-2xl font-bold text-gray-900">{weeklyStats.totalPoints}</span>
            </div>
            <div className="text-sm text-gray-600">Total Points</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="w-6 h-6 text-purple-500 mr-2" />
              <span className="text-2xl font-bold text-gray-900">Level {weeklyStats.level}</span>
            </div>
            <div className="text-sm text-gray-600">
              {weeklyStats.nextLevelPoints - weeklyStats.totalPoints} to next level
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-6 h-6 text-green-500 mr-2" />
              <span className="text-2xl font-bold text-gray-900">{weeklyStats.timeSaved}h</span>
            </div>
            <div className="text-sm text-gray-600">Time Saved</div>
          </div>
        </div>
        
        {/* Level Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Level {weeklyStats.level} Progress</span>
            <span>{weeklyStats.totalPoints % 100}/100 XP</span>
          </div>
          <ProgressBar 
            progress={(weeklyStats.totalPoints % 100)} 
            size="md"
            className="bg-white"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'today', label: 'Today', icon: Target },
            { id: 'calendar', label: 'Calendar', icon: Calendar },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'achievements', label: 'Achievements', icon: Award },
            { id: 'leaderboard', label: 'Leaderboard', icon: Users }
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

      {/* Today Tab */}
      {activeTab === 'today' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Today's AI Habits</h3>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AI_HABITS.map(habit => {
              const isCompleted = isHabitCompletedToday(habit.id)
              const streak = getHabitStreak(habit.id)
              
              return (
                <div
                  key={habit.id}
                  className={`card cursor-pointer transition-all duration-200 ${
                    isCompleted 
                      ? 'bg-success-50 border-success-200' 
                      : 'hover:shadow-md hover:border-primary-300'
                  }`}
                  onClick={() => !isCompleted && completeHabit(habit)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">{habit.icon}</div>
                    <div className="flex items-center space-x-2">
                      {streak > 0 && (
                        <div className="flex items-center text-orange-600">
                          <Flame className="w-4 h-4 mr-1" />
                          <span className="text-sm font-medium">{streak}</span>
                        </div>
                      )}
                      {isCompleted && (
                        <CheckCircle className="w-5 h-5 text-success-600" />
                      )}
                    </div>
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-2">{habit.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{habit.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant={isCompleted ? 'success' : 'default'} 
                      size="sm"
                    >
                      {habit.points} points
                    </Badge>
                    <span className="text-xs text-gray-500 capitalize">
                      {habit.category}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Daily Summary */}
          <div className="card">
            <h4 className="font-semibold text-gray-900 mb-4">Daily Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-600 mb-1">
                  {entries.filter(e => e.date === selectedDate && e.completed).length}
                </div>
                <div className="text-sm text-gray-600">Habits Completed</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-success-600 mb-1">
                  {entries
                    .filter(e => e.date === selectedDate && e.completed)
                    .reduce((sum, e) => sum + (e.timeSaved || 0), 0)}h
                </div>
                <div className="text-sm text-gray-600">Time Saved</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 mb-1">
                  {entries
                    .filter(e => e.date === selectedDate && e.completed)
                    .reduce((sum, e) => {
                      const habit = AI_HABITS.find(h => h.id === e.habitId)
                      return sum + (habit?.points || 0)
                    }, 0)}
                </div>
                <div className="text-sm text-gray-600">Points Earned</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <div className="card">
            {renderCalendarHeatmap()}
          </div>

          <div className="card">
            <h4 className="font-semibold text-gray-900 mb-4">Habit Streaks</h4>
            <div className="space-y-3">
              {AI_HABITS.map(habit => {
                const streak = streaks.find(s => s.habitId === habit.id)
                return (
                  <div key={habit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{habit.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900">{habit.name}</div>
                        <div className="text-sm text-gray-600">
                          Longest: {streak?.longest || 0} days
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="font-bold text-orange-600">
                        {streak?.current || 0}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h4 className="font-semibold text-gray-900 mb-4">Habit Completion Rate</h4>
              <div className="space-y-3">
                {AI_HABITS.map(habit => {
                  const totalDays = 30 // Last 30 days
                  const completedDays = entries.filter(e => 
                    e.habitId === habit.id && 
                    e.completed &&
                    new Date(e.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                  ).length
                  const rate = (completedDays / totalDays) * 100

                  return (
                    <div key={habit.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {habit.icon} {habit.name}
                        </span>
                        <span className="text-sm text-gray-600">{Math.round(rate)}%</span>
                      </div>
                      <ProgressBar progress={rate} size="sm" />
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="card">
              <h4 className="font-semibold text-gray-900 mb-4">Weekly Trends</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Best Day</span>
                  <span className="font-medium">Monday</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Most Skipped</span>
                  <span className="font-medium">Weekend</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Peak Time</span>
                  <span className="font-medium">9:00 AM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Avg. Daily Score</span>
                  <span className="font-medium">{Math.round(weeklyStats.totalPoints / 7)} pts</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h4 className="font-semibold text-gray-900 mb-4">Insights & Recommendations</h4>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <TrendingUp className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-800">You're most consistent with morning habits</div>
                    <div className="text-sm text-blue-600">Try scheduling other habits in the morning too</div>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-start">
                  <Target className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <div className="font-medium text-yellow-800">Creative AI use needs attention</div>
                    <div className="text-sm text-yellow-600">Only 40% completion rate this month</div>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-start">
                  <Zap className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                  <div>
                    <div className="font-medium text-green-800">Email habits lead to longer streaks</div>
                    <div className="text-sm text-green-600">This habit correlates with overall success</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map(achievement => (
              <div
                key={achievement.id}
                className={`card ${
                  achievement.unlocked 
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{achievement.icon}</div>
                  {achievement.unlocked && (
                    <Crown className="w-5 h-5 text-yellow-600" />
                  )}
                </div>
                
                <h4 className={`font-semibold mb-2 ${
                  achievement.unlocked ? 'text-yellow-800' : 'text-gray-500'
                }`}>
                  {achievement.name}
                </h4>
                
                <p className={`text-sm mb-3 ${
                  achievement.unlocked ? 'text-yellow-700' : 'text-gray-500'
                }`}>
                  {achievement.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={achievement.unlocked ? 'success' : 'default'} 
                    size="sm"
                  >
                    {achievement.points} points
                  </Badge>
                  {achievement.unlocked && achievement.unlockedAt && (
                    <span className="text-xs text-yellow-600">
                      {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Streak Milestones */}
          <div className="card">
            <h4 className="font-semibold text-gray-900 mb-4">Streak Milestones</h4>
            <div className="space-y-3">
              {STREAK_MILESTONES.map(milestone => {
                const achieved = weeklyStats.currentStreak >= milestone.days
                return (
                  <div
                    key={milestone.days}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      achieved ? 'bg-success-50 border border-success-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        achieved ? 'bg-success-100 text-success-600' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {achieved ? <CheckCircle className="w-4 h-4" /> : milestone.days}
                      </div>
                      <div>
                        <div className={`font-medium ${achieved ? 'text-success-800' : 'text-gray-700'}`}>
                          {milestone.badge}
                        </div>
                        <div className={`text-sm ${achieved ? 'text-success-600' : 'text-gray-500'}`}>
                          {milestone.reward}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${achieved ? 'text-success-600' : 'text-gray-500'}`}>
                        +{milestone.bonus}
                      </div>
                      <div className="text-xs text-gray-500">{milestone.days} days</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-semibold text-gray-900">Weekly Leaderboard</h4>
              <select className="input-field text-sm">
                <option>This Week</option>
                <option>This Month</option>
                <option>All Time</option>
              </select>
            </div>

            <div className="space-y-3">
              {[
                { rank: 1, name: 'You', points: weeklyStats.totalPoints, streak: weeklyStats.currentStreak },
                { rank: 2, name: 'Alex Chen', points: 1250, streak: 15 },
                { rank: 3, name: 'Sarah Kim', points: 1180, streak: 12 },
                { rank: 4, name: 'Mike Johnson', points: 980, streak: 8 },
                { rank: 5, name: 'Lisa Wang', points: 850, streak: 6 }
              ].map(user => (
                <div
                  key={user.rank}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    user.name === 'You' ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold ${
                      user.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                      user.rank === 2 ? 'bg-gray-100 text-gray-700' :
                      user.rank === 3 ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {user.rank === 1 ? '👑' : user.rank}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-600 flex items-center">
                        <Flame className="w-3 h-3 mr-1 text-orange-500" />
                        {user.streak} day streak
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{user.points}</div>
                    <div className="text-xs text-gray-500">points</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h4 className="font-semibold text-gray-900 mb-4">Categories</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Longest Streak</h5>
                <div className="text-2xl font-bold text-orange-600">#2</div>
                <div className="text-sm text-gray-600">15 days</div>
              </div>
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Time Saved</h5>
                <div className="text-2xl font-bold text-green-600">#1</div>
                <div className="text-sm text-gray-600">{weeklyStats.timeSaved}h this week</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Habit Completion Modal */}
      {showHabitModal && selectedHabit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">{selectedHabit.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedHabit.name}</h3>
                    <p className="text-sm text-gray-600">{selectedHabit.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHabitModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quality Rating (1-10)
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setHabitForm(prev => ({ ...prev, qualityRating: rating }))}
                      className={`w-8 h-8 rounded-full text-sm font-medium ${
                        habitForm.qualityRating === rating
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Saved (minutes)
                </label>
                <input
                  type="number"
                  value={habitForm.timeSaved}
                  onChange={(e) => setHabitForm(prev => ({ ...prev, timeSaved: Number(e.target.value) }))}
                  className="input-field"
                  min="0"
                  placeholder="How much time did this save?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={habitForm.notes}
                  onChange={(e) => setHabitForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="input-field"
                  rows={3}
                  placeholder="Any additional notes about this habit..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowHabitModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={submitHabitCompletion}
                className="btn-primary flex items-center"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Habit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}