import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Clock, Target, BookOpen, ChevronRight } from 'lucide-react'
import { getUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useBookExercises } from '@/hooks/useBookContent'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ExerciseForm from '@/components/exercises/ExerciseForm'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ProgressBar from '@/components/ui/ProgressBar'
import Badge from '@/components/ui/Badge'
import { toast } from 'sonner'
import type { BookExercise } from '@/data/bookContent'

interface ExerciseResponse {
  id: string
  user_id: string
  exercise_id: string
  response: any
  completed_at: string
}

export default function ExerciseDetailPage() {
  const { exerciseId } = useParams<{ exerciseId: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [exercise, setExercise] = useState<BookExercise | null>(null)
  const [existingResponse, setExistingResponse] = useState<ExerciseResponse | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [exerciseProgress, setExerciseProgress] = useState({ current: 0, total: 0 })

  const { exercises: allExercises } = useBookExercises()

  useEffect(() => {
    checkAuthAndLoadData()
  }, [exerciseId])

  const checkAuthAndLoadData = async () => {
    try {
      const currentUser = await getUser()
      if (!currentUser) {
        navigate('/auth/login')
        return
      }

      setUser(currentUser)
      await loadExerciseData(currentUser.id)
      await loadExerciseProgress(currentUser.id)
    } catch (error) {
      console.error('Error loading exercise:', error)
      navigate('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const loadExerciseData = async (userId: string) => {
    if (!exerciseId) return

    try {
      // Load exercise details
      const { data: exerciseData, error: exerciseError } = await supabase
        .from('book_exercises')
        .select('*')
        .eq('id', exerciseId)
        .single()

      if (exerciseError) {
        console.warn('Supabase fetch failed, using local data:', exerciseError.message)
        // Try to find the exercise in local data
        const localExercise = allExercises.find(ex => ex.id === exerciseId)
        if (!localExercise) {
          throw new Error('Exercise not found')
        }
        setExercise(localExercise)
      } else {
        // Ensure fields is properly handled
        let fields = exerciseData.fields
        
        // If fields is a string, try to parse it
        if (typeof fields === 'string') {
          try {
            fields = JSON.parse(fields)
          } catch (e) {
            console.error(`Error parsing fields for exercise ${exerciseData.id}:`, e)
            fields = {} // Fallback to empty object
          }
        }
        
        setExercise({
          ...exerciseData,
          fields
        })
      }

      // Load existing response if any
      const { data: responseData, error: responseError } = await supabase
        .from('exercise_responses')
        .select('*')
        .eq('user_id', userId)
        .eq('exercise_id', exerciseId)
        .single()

      if (!responseError) {
        setExistingResponse(responseData)
      }
    } catch (error) {
      console.error('Error loading exercise data:', error)
      toast.error('Failed to load exercise')
    }
  }

  const loadExerciseProgress = async (userId: string) => {
    try {
      const { data: responses, error } = await supabase
        .from('exercise_responses')
        .select('exercise_id')
        .eq('user_id', userId)

      if (error) {
        console.warn('Error fetching responses:', error.message)
      }

      const completedExerciseIds = new Set(responses?.map(r => r.exercise_id) || [])
      const currentIndex = allExercises.findIndex(ex => ex.id === exerciseId)
      
      setExerciseProgress({
        current: currentIndex + 1,
        total: allExercises.length
      })
    } catch (error) {
      console.error('Error loading exercise progress:', error)
    }
  }

  const handleSubmit = async (formData: any) => {
    if (!user || !exercise) return

    setSubmitting(true)
    try {
      const responseData = {
        user_id: user.id,
        exercise_id: exercise.id,
        response: formData
      }

      if (existingResponse) {
        // Update existing response
        const { error } = await supabase
          .from('exercise_responses')
          .update(responseData)
          .eq('id', existingResponse.id)

        if (error) throw error
        toast.success('Response updated successfully!')
      } else {
        // Create new response
        const { error } = await supabase
          .from('exercise_responses')
          .insert(responseData)

        if (error) throw error
        toast.success('Exercise completed successfully!')
      }

      setShowSuccess(true)
      await loadExerciseData(user.id)
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000)

    } catch (error) {
      console.error('Error submitting exercise:', error)
      toast.error('Failed to save response')
    } finally {
      setSubmitting(false)
    }
  }

  const getNextExercise = () => {
    const currentIndex = allExercises.findIndex(ex => ex.id === exerciseId)
    return currentIndex < allExercises.length - 1 ? allExercises[currentIndex + 1] : null
  }

  const getPreviousExercise = () => {
    const currentIndex = allExercises.findIndex(ex => ex.id === exerciseId)
    return currentIndex > 0 ? allExercises[currentIndex - 1] : null
  }

  const calculateMaturityLevel = (responses: any) => {
    if (!responses || typeof responses !== 'object') return null

    // Calculate for AI Readiness Assessment
    const scaleFields = Object.entries(responses).filter(([key, value]) => 
      typeof value === 'number' && value >= 0 && value <= 3
    )

    if (scaleFields.length === 0) return null

    const totalScore = scaleFields.reduce((sum, [, value]) => sum + (value as number), 0)
    const maxScore = scaleFields.length * 3
    const percentage = (totalScore / maxScore) * 100

    if (percentage >= 80) return { level: 'Advanced', color: 'text-green-600', description: 'You have strong AI readiness!' }
    if (percentage >= 60) return { level: 'Intermediate', color: 'text-blue-600', description: 'Good foundation with room to grow' }
    if (percentage >= 40) return { level: 'Developing', color: 'text-yellow-600', description: 'Building your AI capabilities' }
    return { level: 'Beginner', color: 'text-red-600', description: 'Great starting point for your AI journey' }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!exercise) {
    return (
      <DashboardLayout user={user}>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">Exercise not found</div>
          <Link to="/exercises" className="btn-primary">
            Back to Exercises
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const nextExercise = getNextExercise()
  const previousExercise = getPreviousExercise()
  const maturityResult = existingResponse ? calculateMaturityLevel(existingResponse.response) : null

  return (
    <DashboardLayout user={user}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/exercises"
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Badge variant="default" size="sm">
                  Chapter {exercise.chapter}
                </Badge>
                <span className="text-sm text-gray-500">
                  Exercise {exerciseProgress.current} of {exerciseProgress.total}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{exercise.title}</h1>
            </div>
          </div>
          
          {existingResponse && (
            <div className="flex items-center space-x-2 text-success-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Completed</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-600">
              {exerciseProgress.current}/{exerciseProgress.total} exercises
            </span>
          </div>
          <ProgressBar 
            progress={(exerciseProgress.current / exerciseProgress.total) * 100} 
            size="md" 
          />
        </div>

        {/* Success Animation */}
        {showSuccess && (
          <div className="card bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <div className="flex items-center justify-center space-x-3 text-green-700">
              <CheckCircle className="w-8 h-8 animate-bounce" />
              <div>
                <div className="text-lg font-semibold">Exercise Completed!</div>
                <div className="text-sm">Your progress has been saved</div>
              </div>
            </div>
          </div>
        )}

        {/* Exercise Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="card">
              <div className="flex items-center mb-4">
                <Target className="w-5 h-5 text-primary-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Exercise Overview</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">{exercise.description}</p>
            </div>

            {/* Exercise Form */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {existingResponse ? 'Update Your Response' : 'Complete Exercise'}
                </h2>
                {existingResponse && (
                  <Badge variant="success" size="sm">
                    Previously completed on {new Date(existingResponse.completed_at).toLocaleDateString()}
                  </Badge>
                )}
              </div>

              <ExerciseForm
                exercise={exercise}
                initialData={existingResponse?.response}
                onSubmit={handleSubmit}
                submitting={submitting}
                isUpdate={!!existingResponse}
              />
            </div>

            {/* Maturity Level Result */}
            {maturityResult && exercise.type === 'assessment' && (
              <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <div className="flex items-center mb-4">
                  <BookOpen className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Your AI Readiness Level</h3>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${maturityResult.color} mb-2`}>
                    {maturityResult.level}
                  </div>
                  <p className="text-gray-700">{maturityResult.description}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Exercise Info */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Exercise Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Type</span>
                  <Badge variant="default" size="sm">
                    {exercise.type.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Chapter</span>
                  <span className="font-medium">{exercise.chapter}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Exercise #</span>
                  <span className="font-medium">{exercise.exercise_number}</span>
                </div>
                {existingResponse && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status</span>
                    <div className="flex items-center text-success-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span className="font-medium">Complete</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Navigation</h3>
              <div className="space-y-3">
                {previousExercise && (
                  <Link
                    to={`/exercises/${previousExercise.id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900">Previous</div>
                      <div className="text-xs text-gray-600 truncate">{previousExercise.title}</div>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-gray-400" />
                  </Link>
                )}
                
                {nextExercise && (
                  <Link
                    to={`/exercises/${nextExercise.id}`}
                    className="flex items-center justify-between p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-primary-900">Next</div>
                      <div className="text-xs text-primary-700 truncate">{nextExercise.title}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-primary-600" />
                  </Link>
                )}
                
                <Link
                  to="/exercises"
                  className="block w-full text-center py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Back to All Exercises
                </Link>
              </div>
            </div>

            {/* Tips */}
            <div className="card bg-yellow-50 border-yellow-200">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">💡 Tips</h3>
              <ul className="text-sm text-yellow-700 space-y-2">
                <li>• Take your time to think through each response</li>
                <li>• You can update your answers anytime</li>
                <li>• Your progress is automatically saved</li>
                <li>• Use specific examples when possible</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}