import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Target, CheckCircle, Clock, Filter, Search } from 'lucide-react'
import { getUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { EXERCISES } from '@/lib/exercises'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface ExerciseWithProgress {
  id: string
  type: string
  title: string
  description: string
  chapter: number
  exercise: number
  completed: boolean
  lastUpdated?: string
}

export default function ExercisesPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [exercises, setExercises] = useState<ExerciseWithProgress[]>([])
  const [filteredExercises, setFilteredExercises] = useState<ExerciseWithProgress[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const navigate = useNavigate()

  const exerciseTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'assessment', label: 'Assessment' },
    { value: 'timeTracking', label: 'Time Tracking' },
    { value: 'promptBuilder', label: 'Prompt Building' },
    { value: 'goals', label: 'Goal Setting' },
    { value: 'reflection', label: 'Reflection' },
    { value: 'habits', label: 'Habit Tracking' }
  ]

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'not-started', label: 'Not Started' }
  ]

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  useEffect(() => {
    filterExercises()
  }, [exercises, searchTerm, filterType, filterStatus])

  const checkAuthAndLoadData = async () => {
    try {
      const currentUser = await getUser()
      if (!currentUser) {
        navigate('/auth/login')
        return
      }

      setUser(currentUser)
      await loadExercises(currentUser.id)
    } catch (error) {
      console.error('Error loading exercises:', error)
      navigate('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const loadExercises = async (userId: string) => {
    try {
      // Get user's exercise progress
      const { data: userExercises } = await supabase
        .from('exercises')
        .select('*')
        .eq('user_id', userId)

      const userExerciseMap = new Map()
      userExercises?.forEach(exercise => {
        userExerciseMap.set(exercise.id, exercise)
      })

      // Combine with exercise definitions
      const exercisesWithProgress: ExerciseWithProgress[] = EXERCISES.map(exercise => {
        const userExercise = userExerciseMap.get(exercise.id)
        return {
          id: exercise.id,
          type: exercise.type,
          title: exercise.title,
          description: exercise.description,
          chapter: exercise.chapter,
          exercise: exercise.exercise,
          completed: userExercise?.completed || false,
          lastUpdated: userExercise?.updated_at
        }
      })

      setExercises(exercisesWithProgress.sort((a, b) => {
        if (a.chapter !== b.chapter) return a.chapter - b.chapter
        return a.exercise - b.exercise
      }))
    } catch (error) {
      console.error('Error loading exercises:', error)
    }
  }

  const filterExercises = () => {
    let filtered = exercises

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(exercise =>
        exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(exercise => exercise.type === filterType)
    }

    // Filter by status
    if (filterStatus !== 'all') {
      if (filterStatus === 'completed') {
        filtered = filtered.filter(exercise => exercise.completed)
      } else if (filterStatus === 'in-progress') {
        filtered = filtered.filter(exercise => exercise.lastUpdated && !exercise.completed)
      } else if (filterStatus === 'not-started') {
        filtered = filtered.filter(exercise => !exercise.lastUpdated)
      }
    }

    setFilteredExercises(filtered)
  }

  const getExerciseTypeLabel = (type: string) => {
    const typeObj = exerciseTypes.find(t => t.value === type)
    return typeObj?.label || type
  }

  const getExerciseTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      assessment: 'bg-blue-50 text-blue-700',
      timeTracking: 'bg-green-50 text-green-700',
      promptBuilder: 'bg-purple-50 text-purple-700',
      goals: 'bg-yellow-50 text-yellow-700',
      reflection: 'bg-pink-50 text-pink-700',
      habits: 'bg-indigo-50 text-indigo-700'
    }
    return colors[type] || 'bg-gray-50 text-gray-700'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const stats = {
    total: exercises.length,
    completed: exercises.filter(e => e.completed).length,
    inProgress: exercises.filter(e => e.lastUpdated && !e.completed).length,
    notStarted: exercises.filter(e => !e.lastUpdated).length
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Exercises</h1>
            <p className="text-gray-600 mt-2">
              Complete interactive exercises to build your AI integration skills
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="text-sm text-gray-500">Progress</div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.completed}/{stats.total} completed
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Exercises</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-success-600 mb-1">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-primary-600 mb-1">{stats.inProgress}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-gray-600 mb-1">{stats.notStarted}</div>
            <div className="text-sm text-gray-600">Not Started</div>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="md:w-48">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="input-field"
              >
                {exerciseTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="md:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field"
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Exercises List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredExercises.map((exercise) => (
            <Link
              key={exercise.id}
              to={`/exercises/${exercise.id}`}
              className="card hover:shadow-lg transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                    exercise.completed 
                      ? 'bg-success-100 text-success-600' 
                      : exercise.lastUpdated 
                        ? 'bg-primary-100 text-primary-600' 
                        : 'bg-gray-100 text-gray-400'
                  }`}>
                    {exercise.completed ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : exercise.lastUpdated ? (
                      <Clock className="w-5 h-5" />
                    ) : (
                      <Target className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">
                      Chapter {exercise.chapter} - Exercise {exercise.exercise}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={exercise.completed ? 'success' : 'default'} 
                    size="sm"
                  >
                    {exercise.completed ? 'Completed' : exercise.lastUpdated ? 'In Progress' : 'Not Started'}
                  </Badge>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-200">
                {exercise.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {exercise.description}
              </p>

              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getExerciseTypeColor(exercise.type)}`}>
                  {getExerciseTypeLabel(exercise.type)}
                </span>
                
                {exercise.lastUpdated && (
                  <span className="text-xs text-gray-500">
                    Updated {new Date(exercise.lastUpdated).toLocaleDateString()}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>

        {filteredExercises.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No exercises found</h3>
            <p className="text-gray-600">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by completing your first exercise.'}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}