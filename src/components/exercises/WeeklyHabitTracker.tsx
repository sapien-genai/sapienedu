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
  Share2,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Edit3,
  Trash2,
  Heart,
  MessageSquare,
  Eye,
  EyeOff
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
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedTime: number // minutes
  isCustom?: boolean
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
  mood?: 'great' | 'good' | 'okay' | 'poor'
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  points: number
  unlocked: boolean
  unlockedAt?: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  progress?: number
  maxProgress?: number
}

interface Streak {
  habitId: string
  current: number
  longest: number
  lastDate: string
  freezeUsed: boolean
}

interface WeeklyStats {
  totalPoints: number
  habitsCompleted: number
  currentStreak: number
  timeSaved: number
  level: number
  nextLevelPoints: number
  weeklyGoal: number
  perfectDays: number
}

interface Notification {
  id: string
  type: 'reminder' | 'achievement' | 'streak' | 'social'
  title: string
  message: string
  time: string
  read: boolean
}

const AI_HABITS: AIHabit[] = [
  {
    id: "morning_ai",
    name: "Morning AI Planning",
    description: "Ask AI to prioritize your day and set intentions",
    icon: "🌅",
    points: 10,
    streak_multiplier: 1.1,
    category: "morning",
    difficulty: "easy",
    estimatedTime: 5
  },
  {
    id: "ai_email",
    name: "AI Email Assistant",
    description: "Use AI for drafting, summarizing, or organizing emails",
    icon: "📧",
    points: 15,
    streak_multiplier: 1.15,
    category: "productivity",
    difficulty: "easy",
    estimatedTime: 10
  },
  {
    id: "ai_learning",
    name: "Learn Something New",
    description: "Use AI to research, explain, or teach you something",
    icon: "🎓",
    points: 20,
    streak_multiplier: 1.2,
    category: "learning",
    difficulty: "medium",
    estimatedTime: 15
  },
  {
    id: "ai_creative",
    name: "Creative AI Use",
    description: "Try AI for brainstorming, writing, or creative projects",
    icon: "🎨",
    points: 25,
    streak_multiplier: 1.25,
    category: "creative",
    difficulty: "medium",
    estimatedTime: 20
  },
  {
    id: "ai_optimization",
    name: "Optimize a Process",
    description: "Improve a workflow or automate a task with AI",
    icon: "⚡",
    points: 30,
    streak_multiplier: 1.3,
    category: "optimization",
    difficulty: "hard",
    estimatedTime: 30
  },
  {
    id: "ai_analysis",
    name: "Data Analysis",
    description: "Use AI to analyze data, create reports, or gain insights",
    icon: "📊",
    points: 25,
    streak_multiplier: 1.2,
    category: "productivity",
    difficulty: "medium",
    estimatedTime: 25
  },
  {
    id: "ai_content",
    name: "Content Creation",
    description: "Create content with AI assistance (blogs, social, etc.)",
    icon: "✍️",
    points: 20,
    streak_multiplier: 1.15,
    category: "creative",
    difficulty: "medium",
    estimatedTime: 20
  }
]

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "early_bird",
    name: "Early Bird",
    description: "Complete morning AI task before 7 AM",
    icon: "🐦",
    points: 50,
    unlocked: false,
    rarity: "common"
  },
  {
    id: "efficiency_expert",
    name: "Efficiency Expert",
    description: "Save 10+ hours in one week",
    icon: "📊",
    points: 100,
    unlocked: false,
    rarity: "rare"
  },
  {
    id: "prompt_master",
    name: "Prompt Master",
    description: "Use AI for 5 different categories in one day",
    icon: "💬",
    points: 150,
    unlocked: false,
    rarity: "epic"
  },
  {
    id: "week_warrior",
    name: "Week Warrior",
    description: "Complete all habits for 7 consecutive days",
    icon: "⚔️",
    points: 200,
    unlocked: false,
    rarity: "epic"
  },
  {
    id: "habit_builder",
    name: "Habit Builder",
    description: "Maintain 21-day streak on any habit",
    icon: "🏗️",
    points: 300,
    unlocked: false,
    rarity: "legendary"
  },
  {
    id: "ai_native",
    name: "AI Native",
    description: "Reach 30-day overall streak",
    icon: "🤖",
    points: 500,
    unlocked: false,
    rarity: "legendary"
  },
  {
    id: "perfectionist",
    name: "Perfectionist",
    description: "Complete all daily habits with 5-star quality",
    icon: "⭐",
    points: 100,
    unlocked: false,
    rarity: "rare"
  },
  {
    id: "time_saver",
    name: "Time Saver",
    description: "Save 100+ hours total",
    icon: "⏰",
    points: 250,
    unlocked: false,
    rarity: "epic",
    progress: 0,
    maxProgress: 100
  }
]

const STREAK_MILESTONES = [
  { days: 3, badge: "Starter", bonus: 50, reward: "Basic prompts unlocked", color: "#10B981" },
  { days: 7, badge: "Week Warrior", bonus: 100, reward: "Advanced prompts unlocked", color: "#3B82F6" },
  { days: 14, badge: "Fortnight Fighter", bonus: 200, reward: "Pro workflows unlocked", color: "#8B5CF6" },
  { days: 21, badge: "Habit Builder", bonus: 300, reward: "Custom habits feature", color: "#F59E0B" },
  { days: 30, badge: "AI Native", bonus: 500, reward: "Mentor program access", color: "#EF4444" },
  { days: 60, badge: "AI Master", bonus: 1000, reward: "Beta features access", color: "#EC4899" },
  { days: 90, badge: "AI Transformer", bonus: 2000, reward: "Certification eligible", color: "#6366F1" }
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
  const [customHabits, setCustomHabits] = useState<AIHabit[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  
  const [activeTab, setActiveTab] = useState<'today' | 'calendar' | 'analytics' | 'achievements' | 'leaderboard' | 'social'>('today')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [showHabitModal, setShowHabitModal] = useState(false)
  const [showCustomHabitModal, setShowCustomHabitModal] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [selectedHabit, setSelectedHabit] = useState<AIHabit | null>(null)
  
  const [habitForm, setHabitForm] = useState({
    qualityRating: 5,
    timeSaved: 0,
    notes: '',
    mood: 'good' as 'great' | 'good' | 'okay' | 'poor'
  })

  const [customHabitForm, setCustomHabitForm] = useState({
    name: '',
    description: '',
    icon: '🎯',
    category: 'productivity' as AIHabit['category'],
    difficulty: 'medium' as AIHabit['difficulty'],
    estimatedTime: 15
  })

  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    totalPoints: 0,
    habitsCompleted: 0,
    currentStreak: 0,
    timeSaved: 0,
    level: 1,
    nextLevelPoints: 100,
    weeklyGoal: 21, // 3 habits × 7 days
    perfectDays: 0
  })

  const [settings, setSettings] = useState({
    reminderTime: '09:00',
    weeklyGoal: 21,
    enableNotifications: true,
    shareProgress: true,
    showInLeaderboard: true
  })

  const allHabits = [...AI_HABITS, ...customHabits]

  useEffect(() => {
    loadData()
    generateMockNotifications()
  }, [])

  useEffect(() => {
    saveData()
    calculateWeeklyStats()
    checkAchievements()
    onDataChange({ entries, streaks, achievements, customHabits, settings })
  }, [entries, streaks, achievements, customHabits])

  const loadData = () => {
    const savedEntries = localStorage.getItem('aiHabitEntries')
    const savedStreaks = localStorage.getItem('aiHabitStreaks')
    const savedAchievements = localStorage.getItem('aiHabitAchievements')
    const savedCustomHabits = localStorage.getItem('aiCustomHabits')
    const savedSettings = localStorage.getItem('aiHabitSettings')

    if (savedEntries) setEntries(JSON.parse(savedEntries))
    if (savedStreaks) setStreaks(JSON.parse(savedStreaks))
    if (savedAchievements) setAchievements(JSON.parse(savedAchievements))
    if (savedCustomHabits) setCustomHabits(JSON.parse(savedCustomHabits))
    if (savedSettings) setSettings(JSON.parse(savedSettings))
  }

  const saveData = () => {
    localStorage.setItem('aiHabitEntries', JSON.stringify(entries))
    localStorage.setItem('aiHabitStreaks', JSON.stringify(streaks))
    localStorage.setItem('aiHabitAchievements', JSON.stringify(achievements))
    localStorage.setItem('aiCustomHabits', JSON.stringify(customHabits))
    localStorage.setItem('aiHabitSettings', JSON.stringify(settings))
  }

  const calculateWeeklyStats = () => {
    const today = new Date()
    const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay())
    const weekEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate >= weekStart && entryDate <= today && entry.completed
    })

    const totalPoints = weekEntries.reduce((sum, entry) => {
      const habit = allHabits.find(h => h.id === entry.habitId)
      const streak = streaks.find(s => s.habitId === entry.habitId)
      const basePoints = habit?.points || 0
      const streakMultiplier = streak && streak.current > 1 ? Math.pow(habit?.streak_multiplier || 1, Math.min(streak.current, 10)) : 1
      return sum + (basePoints * streakMultiplier)
    }, 0)

    const timeSaved = weekEntries.reduce((sum, entry) => sum + (entry.timeSaved || 0), 0)
    const currentStreak = Math.max(...streaks.map(s => s.current), 0)
    const level = Math.floor(totalPoints / 100) + 1
    const nextLevelPoints = level * 100

    // Calculate perfect days (days with all habits completed with 4+ star rating)
    const perfectDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      const dayEntries = entries.filter(e => e.date === dateStr && e.completed)
      const highQualityEntries = dayEntries.filter(e => (e.qualityRating || 0) >= 4)
      return dayEntries.length >= 3 && highQualityEntries.length === dayEntries.length
    }).filter(Boolean).length

    setWeeklyStats({
      totalPoints,
      habitsCompleted: weekEntries.length,
      currentStreak,
      timeSaved,
      level,
      nextLevelPoints,
      weeklyGoal: settings.weeklyGoal,
      perfectDays
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
      notes: habitForm.notes || undefined,
      mood: habitForm.mood
    }

    // Remove any existing entry for this habit today
    const filteredEntries = entries.filter(e => !(e.habitId === selectedHabit.id && e.date === selectedDate))
    setEntries([...filteredEntries, entry])

    // Update streak
    updateStreak(selectedHabit.id, selectedDate)

    // Calculate points with streak multiplier
    const streak = streaks.find(s => s.habitId === selectedHabit.id)
    const streakMultiplier = streak && streak.current > 1 ? Math.pow(selectedHabit.streak_multiplier, Math.min(streak.current + 1, 10)) : 1
    const points = Math.round(selectedHabit.points * streakMultiplier)

    // Add celebration notification
    addNotification({
      type: 'achievement',
      title: `${selectedHabit.name} Completed! 🎉`,
      message: `+${points} points earned!`,
      time: now.toISOString()
    })

    toast.success(`🎉 +${points} points! ${selectedHabit.name} completed!`)

    setShowHabitModal(false)
    setHabitForm({ qualityRating: 5, timeSaved: 0, notes: '', mood: 'good' })
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
        addNotification({
          type: 'streak',
          title: `🔥 ${milestone.badge} Achieved!`,
          message: `${milestone.days}-day streak! +${milestone.bonus} bonus points!`,
          time: new Date().toISOString()
        })
        toast.success(`🔥 ${milestone.badge} achieved! +${milestone.bonus} bonus points!`)
      }
    } else {
      setStreaks(prev => [...prev, {
        habitId,
        current: 1,
        longest: 1,
        lastDate: date,
        freezeUsed: false
      }])
    }
  }

  const checkAchievements = () => {
    const newAchievements = [...achievements]
    let hasNewAchievement = false

    // Early Bird achievement
    const earlyMorningEntries = entries.filter(e => 
      e.habitId === 'morning_ai' && 
      e.completionTime && 
      e.completionTime < '07:00:00'
    )
    if (earlyMorningEntries.length > 0 && !achievements.find(a => a.id === 'early_bird')?.unlocked) {
      unlockAchievement('early_bird', newAchievements)
      hasNewAchievement = true
    }

    // Efficiency Expert achievement
    const weekTimeSaved = entries
      .filter(e => e.date >= getWeekStart() && e.timeSaved)
      .reduce((sum, e) => sum + (e.timeSaved || 0), 0)
    
    if (weekTimeSaved >= 10 && !achievements.find(a => a.id === 'efficiency_expert')?.unlocked) {
      unlockAchievement('efficiency_expert', newAchievements)
      hasNewAchievement = true
    }

    // Week Warrior achievement
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - date.getDay() + i)
      return date.toISOString().split('T')[0]
    })
    
    const allDaysComplete = weekDays.every(date => 
      entries.some(e => e.date === date && e.completed)
    )
    
    if (allDaysComplete && !achievements.find(a => a.id === 'week_warrior')?.unlocked) {
      unlockAchievement('week_warrior', newAchievements)
      hasNewAchievement = true
    }

    if (hasNewAchievement) {
      setAchievements(newAchievements)
    }
  }

  const unlockAchievement = (achievementId: string, achievementsList: Achievement[]) => {
    const achievement = achievementsList.find(a => a.id === achievementId)
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true
      achievement.unlockedAt = new Date().toISOString()
      
      addNotification({
        type: 'achievement',
        title: `🏆 Achievement Unlocked!`,
        message: `${achievement.name}: ${achievement.description}`,
        time: new Date().toISOString()
      })
      
      toast.success(`🏆 Achievement Unlocked: ${achievement.name}! +${achievement.points} points!`)
    }
  }

  const addNotification = (notification: Omit<Notification, 'id' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      read: false
    }
    setNotifications(prev => [newNotification, ...prev].slice(0, 20)) // Keep only latest 20
  }

  const addCustomHabit = () => {
    if (!customHabitForm.name.trim()) {
      toast.error('Please enter a habit name')
      return
    }

    const newHabit: AIHabit = {
      id: `custom_${Date.now()}`,
      name: customHabitForm.name.trim(),
      description: customHabitForm.description.trim(),
      icon: customHabitForm.icon,
      category: customHabitForm.category,
      difficulty: customHabitForm.difficulty,
      estimatedTime: customHabitForm.estimatedTime,
      points: customHabitForm.difficulty === 'easy' ? 10 : customHabitForm.difficulty === 'medium' ? 20 : 30,
      streak_multiplier: 1.1,
      isCustom: true
    }

    setCustomHabits(prev => [...prev, newHabit])
    setCustomHabitForm({
      name: '',
      description: '',
      icon: '🎯',
      category: 'productivity',
      difficulty: 'medium',
      estimatedTime: 15
    })
    setShowCustomHabitModal(false)
    toast.success('Custom habit created!')
  }

  const generateMockNotifications = () => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'reminder',
        title: 'Daily Reminder',
        message: "Don't forget to complete your morning AI planning!",
        time: new Date().toISOString(),
        read: false
      },
      {
        id: '2',
        type: 'social',
        title: 'Friend Update',
        message: 'Alex just completed a 7-day streak! 🔥',
        time: new Date(Date.now() - 3600000).toISOString(),
        read: false
      }
    ]
    setNotifications(mockNotifications)
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
        count: dayEntries.length,
        day: d.getDay()
      })
    }
    
    return days
  }

  const getIntensityColor = (intensity: number) => {
    const colors = ['#EBEDF0', '#C7E9C0', '#73C276', '#238B45', '#00441B']
    return colors[intensity] || colors[0]
  }

  const exportData = () => {
    const exportData = {
      habits: allHabits,
      entries,
      streaks,
      achievements,
      stats: weeklyStats,
      settings,
      exportedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-habits-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Habit data exported!')
  }

  const shareProgress = () => {
    const shareText = `🤖 My AI Habit Progress:
🔥 Current Streak: ${weeklyStats.currentStreak} days
⭐ Total Points: ${weeklyStats.totalPoints}
🏆 Level: ${weeklyStats.level}
⏰ Time Saved: ${weeklyStats.timeSaved}h this week

Building AI habits one day at a time! 💪

#AIHabits #ProductivityHacking #AITransformation`

    if (navigator.share) {
      navigator.share({
        title: 'My AI Habit Progress',
        text: shareText
      })
    } else {
      navigator.clipboard.writeText(shareText)
      toast.success('Progress copied to clipboard!')
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Stats */}
      <div className="card bg-gradient-to-r from-primary-50 to-success-50 border-primary-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Weekly AI Habit Tracker</h2>
            <p className="text-gray-600">Build consistent AI habits and track your transformation</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => setShowCustomHabitModal(true)}
              className="btn-secondary text-sm flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Habit
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
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
              {weeklyStats.nextLevelPoints - weeklyStats.totalPoints} to next
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-6 h-6 text-green-500 mr-2" />
              <span className="text-2xl font-bold text-gray-900">{weeklyStats.timeSaved}h</span>
            </div>
            <div className="text-sm text-gray-600">Time Saved</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-6 h-6 text-blue-500 mr-2" />
              <span className="text-2xl font-bold text-gray-900">{weeklyStats.perfectDays}</span>
            </div>
            <div className="text-sm text-gray-600">Perfect Days</div>
          </div>
        </div>
        
        {/* Level Progress */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Level {weeklyStats.level} Progress</span>
            <span>{weeklyStats.totalPoints % 100}/100 XP</span>
          </div>
          <ProgressBar 
            progress={(weeklyStats.totalPoints % 100)} 
            size="md"
            className="bg-white"
          />
        </div>

        {/* Weekly Goal Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Weekly Goal</span>
            <span>{weeklyStats.habitsCompleted}/{weeklyStats.weeklyGoal} habits</span>
          </div>
          <ProgressBar 
            progress={(weeklyStats.habitsCompleted / weeklyStats.weeklyGoal) * 100} 
            size="sm"
            className="bg-white"
          />
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <button
              onClick={() => setShowNotifications(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${
                    notification.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{notification.title}</div>
                      <div className="text-sm text-gray-600">{notification.message}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(notification.time).toLocaleTimeString()}
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'today', label: 'Today', icon: Target },
            { id: 'calendar', label: 'Calendar', icon: Calendar },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'achievements', label: 'Achievements', icon: Award },
            { id: 'leaderboard', label: 'Leaderboard', icon: Users },
            { id: 'social', label: 'Social', icon: Heart }
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
            {allHabits.map(habit => {
              const isCompleted = isHabitCompletedToday(habit.id)
              const streak = getHabitStreak(habit.id)
              const entry = entries.find(e => e.habitId === habit.id && e.date === selectedDate)
              
              return (
                <div
                  key={habit.id}
                  className={`card cursor-pointer transition-all duration-200 relative ${
                    isCompleted 
                      ? 'bg-success-50 border-success-200 shadow-md' 
                      : 'hover:shadow-md hover:border-primary-300 hover:scale-105'
                  }`}
                  onClick={() => !isCompleted && completeHabit(habit)}
                >
                  {habit.isCustom && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // Handle custom habit edit/delete
                      }}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  )}

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
                  
                  <div className="flex items-center justify-between mb-3">
                    <Badge 
                      variant={isCompleted ? 'success' : 'default'} 
                      size="sm"
                    >
                      {habit.points} points
                    </Badge>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={habit.difficulty === 'easy' ? 'success' : habit.difficulty === 'medium' ? 'warning' : 'error'}
                        size="sm"
                      >
                        {habit.difficulty}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {habit.estimatedTime}min
                      </span>
                    </div>
                  </div>

                  {isCompleted && entry && (
                    <div className="space-y-2 pt-3 border-t border-success-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-success-700">Quality:</span>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < (entry.qualityRating || 0)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {entry.timeSaved && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-success-700">Time saved:</span>
                          <span className="font-medium">{entry.timeSaved}min</span>
                        </div>
                      )}
                      {entry.mood && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-success-700">Mood:</span>
                          <span className="font-medium">
                            {entry.mood === 'great' ? '😄' : 
                             entry.mood === 'good' ? '😊' : 
                             entry.mood === 'okay' ? '😐' : '😔'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Daily Summary */}
          <div className="card">
            <h4 className="font-semibold text-gray-900 mb-4">Daily Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    .reduce((sum, e) => sum + (e.timeSaved || 0), 0)}min
                </div>
                <div className="text-sm text-gray-600">Time Saved</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 mb-1">
                  {entries
                    .filter(e => e.date === selectedDate && e.completed)
                    .reduce((sum, e) => {
                      const habit = allHabits.find(h => h.id === e.habitId)
                      return sum + (habit?.points || 0)
                    }, 0)}
                </div>
                <div className="text-sm text-gray-600">Points Earned</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {entries
                    .filter(e => e.date === selectedDate && e.completed && (e.qualityRating || 0) >= 4)
                    .length}
                </div>
                <div className="text-sm text-gray-600">High Quality</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          {/* GitHub-style Heatmap */}
          <div className="card">
            <h4 className="font-semibold text-gray-900 mb-4">Activity Heatmap</h4>
            <div className="space-y-2">
              <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center p-1">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {generateCalendarHeatmap().map((day, index) => (
                  <div
                    key={index}
                    className="w-4 h-4 rounded-sm cursor-pointer hover:ring-2 hover:ring-primary-300"
                    style={{ backgroundColor: getIntensityColor(day.intensity) }}
                    title={`${day.date}: ${day.count} habits completed`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
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
          </div>

          {/* Habit Streaks */}
          <div className="card">
            <h4 className="font-semibold text-gray-900 mb-4">Habit Streaks</h4>
            <div className="space-y-3">
              {allHabits.map(habit => {
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

          {/* Weekly Calendar View */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Weekly View</h4>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const newWeek = new Date(currentWeek)
                    newWeek.setDate(newWeek.getDate() - 7)
                    setCurrentWeek(newWeek)
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium text-gray-700">
                  Week of {currentWeek.toLocaleDateString()}
                </span>
                <button
                  onClick={() => {
                    const newWeek = new Date(currentWeek)
                    newWeek.setDate(newWeek.getDate() + 7)
                    setCurrentWeek(newWeek)
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }, (_, i) => {
                const date = new Date(currentWeek)
                date.setDate(date.getDate() - date.getDay() + i)
                const dateStr = date.toISOString().split('T')[0]
                const dayEntries = entries.filter(e => e.date === dateStr && e.completed)
                
                return (
                  <div key={i} className="text-center">
                    <div className="text-xs text-gray-500 mb-2">
                      {date.toLocaleDateString('en', { weekday: 'short' })}
                    </div>
                    <div className="text-sm font-medium text-gray-900 mb-2">
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {allHabits.slice(0, 3).map(habit => {
                        const completed = dayEntries.some(e => e.habitId === habit.id)
                        return (
                          <div
                            key={habit.id}
                            className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center text-xs ${
                              completed 
                                ? 'bg-success-100 text-success-600' 
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {habit.icon}
                          </div>
                        )
                      })}
                      {dayEntries.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{dayEntries.length - 3} more
                        </div>
                      )}
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
                {allHabits.map(habit => {
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
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Quality Average</span>
                  <div className="flex items-center">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-sm">4.2</span>
                  </div>
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
                className={`card relative overflow-hidden ${
                  achievement.unlocked 
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                {achievement.unlocked && (
                  <div className="absolute top-2 right-2">
                    <Crown className="w-5 h-5 text-yellow-600" />
                  </div>
                )}

                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{achievement.icon}</div>
                  <Badge 
                    variant={
                      achievement.rarity === 'legendary' ? 'error' :
                      achievement.rarity === 'epic' ? 'warning' :
                      achievement.rarity === 'rare' ? 'default' : 'success'
                    }
                    size="sm"
                  >
                    {achievement.rarity}
                  </Badge>
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

                {achievement.progress !== undefined && achievement.maxProgress && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{achievement.progress}/{achievement.maxProgress}</span>
                    </div>
                    <ProgressBar 
                      progress={(achievement.progress / achievement.maxProgress) * 100} 
                      size="sm" 
                    />
                  </div>
                )}
                
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
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 text-white font-bold text-sm ${
                          achieved ? 'bg-success-500' : 'bg-gray-400'
                        }`}
                        style={{ backgroundColor: achieved ? milestone.color : undefined }}
                      >
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
                { rank: 1, name: 'You', points: weeklyStats.totalPoints, streak: weeklyStats.currentStreak, avatar: '🤖' },
                { rank: 2, name: 'Alex Chen', points: 1250, streak: 15, avatar: '👨‍💻' },
                { rank: 3, name: 'Sarah Kim', points: 1180, streak: 12, avatar: '👩‍🎨' },
                { rank: 4, name: 'Mike Johnson', points: 980, streak: 8, avatar: '👨‍🚀' },
                { rank: 5, name: 'Lisa Wang', points: 850, streak: 6, avatar: '👩‍🔬' }
              ].map(user => (
                <div
                  key={user.rank}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    user.name === 'You' ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold text-sm ${
                      user.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                      user.rank === 2 ? 'bg-gray-100 text-gray-700' :
                      user.rank === 3 ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {user.rank === 1 ? '👑' : user.rank}
                    </div>
                    <div className="text-2xl mr-3">{user.avatar}</div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h4 className="font-semibold text-gray-900 mb-4">Your Rankings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Overall Rank</span>
                  <Badge variant="success" size="sm">#1</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Longest Streak</span>
                  <Badge variant="warning" size="sm">#2</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Time Saved</span>
                  <Badge variant="success" size="sm">#1</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Consistency</span>
                  <Badge variant="default" size="sm">#3</Badge>
                </div>
              </div>
            </div>

            <div className="card">
              <h4 className="font-semibold text-gray-900 mb-4">Global Stats</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Users</span>
                  <span className="font-medium">12,847</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Habits Completed Today</span>
                  <span className="font-medium">45,231</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Time Saved This Week</span>
                  <span className="font-medium">8,432h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Longest Active Streak</span>
                  <span className="font-medium">127 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Social Tab */}
      {activeTab === 'social' && (
        <div className="space-y-6">
          <div className="card">
            <h4 className="font-semibold text-gray-900 mb-4">Share Your Progress</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Quick Share</h5>
                <div className="space-y-3">
                  <button
                    onClick={shareProgress}
                    className="btn-primary w-full flex items-center justify-center"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Progress
                  </button>
                  <button
                    onClick={exportData}
                    className="btn-secondary w-full flex items-center justify-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </button>
                </div>
              </div>
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Privacy Settings</h5>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.shareProgress}
                      onChange={(e) => setSettings(prev => ({ ...prev, shareProgress: e.target.checked }))}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Share progress publicly</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.showInLeaderboard}
                      onChange={(e) => setSettings(prev => ({ ...prev, showInLeaderboard: e.target.checked }))}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Show in leaderboard</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h4 className="font-semibold text-gray-900 mb-4">Community Feed</h4>
            <div className="space-y-4">
              {[
                {
                  user: 'Alex Chen',
                  avatar: '👨‍💻',
                  action: 'completed a 7-day streak',
                  time: '2 hours ago',
                  likes: 12
                },
                {
                  user: 'Sarah Kim',
                  avatar: '👩‍🎨',
                  action: 'unlocked the Prompt Master achievement',
                  time: '4 hours ago',
                  likes: 8
                },
                {
                  user: 'Mike Johnson',
                  avatar: '👨‍🚀',
                  action: 'saved 45 minutes with AI automation',
                  time: '6 hours ago',
                  likes: 15
                }
              ].map((post, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl">{post.avatar}</div>
                  <div className="flex-1">
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">{post.user}</span>
                      <span className="text-gray-600"> {post.action}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">{post.time}</span>
                      <button className="flex items-center text-xs text-gray-500 hover:text-red-500">
                        <Heart className="w-3 h-3 mr-1" />
                        {post.likes}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h4 className="font-semibold text-gray-900 mb-4">Find Friends</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">👩‍💼</div>
                  <div>
                    <div className="font-medium text-gray-900">Emma Wilson</div>
                    <div className="text-sm text-gray-600">Level 8 • 45-day streak</div>
                  </div>
                </div>
                <button className="btn-secondary text-sm">Follow</button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">👨‍🎓</div>
                  <div>
                    <div className="font-medium text-gray-900">David Park</div>
                    <div className="text-sm text-gray-600">Level 6 • 23-day streak</div>
                  </div>
                </div>
                <button className="btn-secondary text-sm">Follow</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Habit Completion Modal */}
      {showHabitModal && selectedHabit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
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

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quality Rating (1-5 stars)
                </label>
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setHabitForm(prev => ({ ...prev, qualityRating: rating }))}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          rating <= habitForm.qualityRating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 hover:text-yellow-200'
                        }`}
                      />
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
                  How did it go?
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 'great', label: 'Great', emoji: '😄' },
                    { value: 'good', label: 'Good', emoji: '😊' },
                    { value: 'okay', label: 'Okay', emoji: '😐' },
                    { value: 'poor', label: 'Poor', emoji: '😔' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setHabitForm(prev => ({ ...prev, mood: option.value as any }))}
                      className={`p-2 text-center rounded-lg border-2 transition-colors ${
                        habitForm.mood === option.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{option.emoji}</div>
                      <div className="text-xs font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
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

      {/* Custom Habit Modal */}
      {showCustomHabitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Create Custom Habit</h3>
                <button
                  onClick={() => setShowCustomHabitModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Habit Name *
                </label>
                <input
                  type="text"
                  value={customHabitForm.name}
                  onChange={(e) => setCustomHabitForm(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder="e.g., AI Research Session"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={customHabitForm.description}
                  onChange={(e) => setCustomHabitForm(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field"
                  rows={2}
                  placeholder="What does this habit involve?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon
                  </label>
                  <select
                    value={customHabitForm.icon}
                    onChange={(e) => setCustomHabitForm(prev => ({ ...prev, icon: e.target.value }))}
                    className="input-field"
                  >
                    {['🎯', '🤖', '📝', '💡', '📊', '🔍', '📱', '⚙️', '🧠', '🚀'].map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={customHabitForm.category}
                    onChange={(e) => setCustomHabitForm(prev => ({ ...prev, category: e.target.value as any }))}
                    className="input-field"
                  >
                    <option value="morning">Morning</option>
                    <option value="productivity">Productivity</option>
                    <option value="learning">Learning</option>
                    <option value="creative">Creative</option>
                    <option value="optimization">Optimization</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={customHabitForm.difficulty}
                    onChange={(e) => setCustomHabitForm(prev => ({ ...prev, difficulty: e.target.value as any }))}
                    className="input-field"
                  >
                    <option value="easy">Easy (10 pts)</option>
                    <option value="medium">Medium (20 pts)</option>
                    <option value="hard">Hard (30 pts)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={customHabitForm.estimatedTime}
                    onChange={(e) => setCustomHabitForm(prev => ({ ...prev, estimatedTime: Number(e.target.value) }))}
                    className="input-field"
                    min="1"
                    max="120"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowCustomHabitModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={addCustomHabit}
                disabled={!customHabitForm.name.trim()}
                className="btn-primary flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Habit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-center space-x-4 pt-6 border-t border-gray-200">
        <button
          onClick={exportData}
          className="btn-secondary flex items-center"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </button>
        <button
          onClick={shareProgress}
          className="btn-primary flex items-center"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share Progress
        </button>
      </div>
    </div>
  )
}