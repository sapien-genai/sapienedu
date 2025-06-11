import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Target, CheckCircle, Clock, Filter, Search, BookOpen } from 'lucide-react'
import { getUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useBookExercises, useChapters } from '@/hooks/useBookContent'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ExerciseCard from '@/components/exercises/ExerciseCard'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ProgressBar from '@/components/ui/ProgressBar'

interface ExerciseWithProgress {
  id: string
  chapter: number
  exercise_number: number
  title: string
  description: string
  type: string
  fields: any
  sort_order: number
  completed: boolean
  completed_at?: string
}

export default function ExercisesPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [exercises, setExercises] = useState<ExerciseWithProgress[]>([])
  const [filteredExercises, setFilteredExercises] = useState<ExerciseWithProgress[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterChapter, setFilterChapter] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const navigate = useNavigate()

  const { exercises: bookExercises, loading: exercisesLoading } = useBookExercises()
  const { chapters } = useChapters()

  const exerciseTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'assessment', label: 'Assessment' },
    { value: 'timeTracking', label: 'Time Tracking' },
    { value: 'promptBuilder', label: 'Prompt Building' },
    { value: 'goals', label: 'Goal Setting' },
    { value: 'reflection', label: 'Reflection' },
    { value: 'habits', label: 'Habit Tracking' },
    { value: 'text_input', label: 'Text Input' },
    { value: 'planning', label: 'Planning' },
    { value: 'tracking', label: 'Progress Tracking' }
  ]

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'not-started', label: 'Not Started' }
  ]

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  useEffect(() => {
    if (bookExercises.length > 0) {
      loadExerciseProgress()
    }
  }, [bookExercises])

  useEffect(() => {
    filterExercises()
  }, [exercises, searchTerm, filterChapter, filterType, filterStatus])

  const checkAuthAndLoadData = async () => {
    try {
      const currentUser = await getUser()
      if (!currentUser) {
        navigate('/auth/login')
        return
      }

      setUser(currentUser)
    } catch (error) {
      console.error('Error loading exercises:', error)
      navigate('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const loadExerciseProgress = async () => {
    if (!user) return

    try {
      // Get user's exercise responses
      const { data: responses } = await supabase
        .from('exercise_responses')
        .select('exercise_id, completed_at')
        .eq('user_id', user.id)

      const responseMap = new Map()
      responses?.forEach(response => {
        responseMap.set(response.exercise_id, response.completed_at)
      })

      // Combine with exercise definitions
      const exercisesWithProgress: ExerciseWithProgress[] = bookExercises.map(exercise => ({
        ...exercise,
        completed: responseMap.has(exercise.id),
        completed_at: responseMap.get(exercise.id)
      }))

      // Sort by chapter and exercise number
      exercisesWithProgress.sort((a, b) => {
        if (a.chapter !== b.chapter) return a.chapter - b.chapter
        return a.exercise_number - b.exercise_number
      })

      setExercises(exercisesWithProgress)
    } catch (error) {
      console.error('Error loading exercise progress:', error)
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

    // Filter by chapter
    if (filterChapter !== 'all') {
      filtered = filtered.filter(exercise => exercise.chapter === parseInt(filterChapter))
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(exercise => exercise.type === filterType)
    }

    // Filter by status
    if (filterStatus !== 'all') {
      if (filterStatus === 'completed') {
        filtered = filtered.filter(exercise => exercise.completed)
      } else if (filterStatus === 'not-started') {
        filtered = filtered.filter(exercise => !exercise.completed)
      }
    }

    setFilteredExercises(filtered)
  }

  const getChapterTitle = (chapterNumber: number) => {
    const chapter = chapters.find(c => c.number === chapterNumber)
    return chapter ? chapter.title : `Chapter ${chapterNumber}`
  }

  if (loading || exercisesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const stats = {
    total: exercises.length,
    completed: exercises.filter(e => e.completed).length,
    notStarted: exercises.filter(e => !e.completed).length
  }

  const completionPercentage = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0

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

        {/* Overall Progress */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Overall Progress</h2>
            <Badge variant="success" size="lg">
              {Math.round(completionPercentage)}% Complete
            </Badge>
          </div>
          <ProgressBar 
            progress={completionPercentage} 
            size="lg" 
            showPercentage={false}
            className="mb-4"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Exercises</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-success-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">{stats.notStarted}</div>
              <div className="text-sm text-gray-600">Not Started</div>
            </div>
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

            {/* Chapter Filter */}
            <div className="md:w-48">
              <select
                value={filterChapter}
                onChange={(e) => setFilterChapter(e.target.value)}
                className="input-field"
              >
                <option value="all">All Chapters</option>
                {chapters.map(chapter => (
                  <option key={chapter.number} value={chapter.number}>
                    Chapter {chapter.number}
                  </option>
                ))}
              </select>
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
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              isCompleted={exercise.completed}
              completedAt={exercise.completed_at}
            />
          ))}
        </div>

        {filteredExercises.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No exercises found</h3>
            <p className="text-gray-600">
              {searchTerm || filterChapter !== 'all' || filterType !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by completing your first exercise.'}
            </p>
          </div>
        )}

        {/* Quick Start */}
        {stats.completed === 0 && filteredExercises.length > 0 && (
          <div className="card bg-gradient-to-r from-primary-50 to-success-50 border-primary-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-primary-900 mb-2">Ready to get started?</h3>
                <p className="text-primary-700 mb-4">
                  Begin with the AI Readiness Assessment to understand your current level.
                </p>
                <Link
                  to={`/exercises/${filteredExercises[0]?.id}`}
                  className="btn-primary"
                >
                  Start First Exercise
                </Link>
              </div>
              <BookOpen className="w-16 h-16 text-primary-300" />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}