import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Trophy, Target, Clock, Zap, ChevronRight } from 'lucide-react'
import { getUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ProgressBar from '@/components/ui/ProgressBar'
import CountdownTimer from '@/components/ui/CountdownTimer'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Avatar from '@/components/ui/Avatar'

interface UserStats {
  completedExercises: number
  totalExercises: number
  currentStreak: number
  timeSaved: number
  recentAchievements: string[]
  completionPercentage: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<UserStats>({
    completedExercises: 0,
    totalExercises: 36, // 12 chapters × 3 exercises
    currentStreak: 0,
    timeSaved: 0,
    recentAchievements: [],
    completionPercentage: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentExercises, setRecentExercises] = useState<any[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const checkAuthAndLoadData = async () => {
    try {
      const currentUser = await getUser()
      if (!currentUser) {
        navigate('/auth/login')
        return
      }

      setUser(currentUser)
      await loadUserStats(currentUser.id)
      await loadRecentExercises(currentUser.id)
    } catch (error) {
      console.error('Error loading dashboard:', error)
      navigate('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const loadUserStats = async (userId: string) => {
    try {
      // Get completed exercises
      const { data: exercises } = await supabase
        .from('exercises')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', true)

      const completedCount = exercises?.length || 0
      const completionPercentage = (completedCount / stats.totalExercises) * 100

      // Get time saved from exercises
      const timeSaved = exercises?.reduce((total, exercise) => {
        if (exercise.exercise_type === 'timeTracking' && exercise.data?.time_saved) {
          return total + exercise.data.time_saved
        }
        return total
      }, 0) || 0

      // Get recent achievements
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false })
        .limit(3)

      // Calculate streak (simplified for demo)
      const streak = Math.floor(Math.random() * 15) + 1 // Mock streak

      setStats({
        completedExercises: completedCount,
        totalExercises: 36,
        currentStreak: streak,
        timeSaved: Math.round(timeSaved),
        recentAchievements: achievements?.map(a => a.achievement_type) || [],
        completionPercentage: Math.round(completionPercentage)
      })
    } catch (error) {
      console.error('Error loading user stats:', error)
    }
  }

  const loadRecentExercises = async (userId: string) => {
    try {
      const { data: exercises } = await supabase
        .from('exercises')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(5)

      setRecentExercises(exercises || [])
    } catch (error) {
      console.error('Error loading recent exercises:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const statCards = [
    {
      title: 'Exercises Completed',
      value: `${stats.completedExercises}/${stats.totalExercises}`,
      icon: Target,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50'
    },
    {
      title: 'Current Streak',
      value: `${stats.currentStreak} days`,
      icon: Zap,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Time Saved',
      value: `${stats.timeSaved}h`,
      icon: Clock,
      color: 'text-success-600',
      bgColor: 'bg-success-50'
    },
    {
      title: 'Achievements',
      value: stats.recentAchievements.length,
      icon: Trophy,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  const displayName = user?.user_metadata?.name || user?.email || 'there'

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-500 to-success-500 rounded-2xl p-8 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <Avatar user={user} size="lg" className="border-2 border-white/20" />
                <div>
                  <h1 className="text-3xl font-bold">
                    Welcome back, {displayName}! 👋
                  </h1>
                </div>
              </div>
              <p className="text-lg opacity-90 mb-6">
                You're {stats.completionPercentage}% through your AI integration journey. 
                Keep up the great work!
              </p>
              <Link to="/exercises" className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200 inline-flex items-center">
                Continue Learning
                <ChevronRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
            <div>
              <CountdownTimer startDate={user?.user_metadata?.start_date || user?.created_at} />
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Overall Progress</h2>
            <Badge variant="success" size="lg">
              {stats.completionPercentage}% Complete
            </Badge>
          </div>
          <ProgressBar 
            progress={stats.completionPercentage} 
            size="lg" 
            showPercentage={false}
            className="mb-4"
          />
          <p className="text-gray-600">
            {stats.completedExercises} of {stats.totalExercises} exercises completed
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="card">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.bgColor} mr-4`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.title}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Exercises */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Recent Exercises</h3>
              <Link to="/exercises" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentExercises.length > 0 ? (
                recentExercises.map((exercise) => (
                  <div key={exercise.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        Chapter {exercise.chapter_number} - Exercise {exercise.exercise_number}
                      </div>
                      <div className="text-sm text-gray-600 capitalize">
                        {exercise.exercise_type.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </div>
                    </div>
                    <div className="flex items-center">
                      {exercise.completed && (
                        <Badge variant="success" size="sm">Completed</Badge>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No exercises started yet</p>
                  <Link to="/exercises" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
                    Start your first exercise
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/chapters" className="block p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-primary-900">Browse Chapters</div>
                    <div className="text-sm text-primary-600">Explore all 12 chapters</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-primary-600" />
                </div>
              </Link>
              
              <Link to="/prompts" className="block p-4 bg-success-50 rounded-lg hover:bg-success-100 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-success-900">Prompt Library</div>
                    <div className="text-sm text-success-600">Manage your prompts</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-success-600" />
                </div>
              </Link>
              
              <Link to="/resources" className="block p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-yellow-900">AI Tools & Resources</div>
                    <div className="text-sm text-yellow-600">Discover new tools</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-yellow-600" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}