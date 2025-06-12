import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, BookOpen, Target, CheckCircle, ChevronRight, MessageSquare } from 'lucide-react'
import { getUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useChapters, useBookPrompts, useBookExercises } from '@/hooks/useBookContent'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PromptCard from '@/components/prompts/PromptCard'
import ExerciseCard from '@/components/exercises/ExerciseCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ProgressBar from '@/components/ui/ProgressBar'
import Badge from '@/components/ui/Badge'

interface ChapterProgress {
  completedExercises: number
  totalExercises: number
  completionPercentage: number
}

export default function ChapterDetailPage() {
  const { chapterNumber } = useParams<{ chapterNumber: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState<ChapterProgress>({
    completedExercises: 0,
    totalExercises: 0,
    completionPercentage: 0
  })
  const [exerciseResponses, setExerciseResponses] = useState<Set<string>>(new Set())

  const chapterNum = parseInt(chapterNumber || '1')
  const { chapters } = useChapters()
  const { prompts, loading: promptsLoading } = useBookPrompts({ chapter: chapterNum })
  const { exercises, loading: exercisesLoading } = useBookExercises(chapterNum)

  const currentChapter = chapters.find(c => c.number === chapterNum)

  useEffect(() => {
    checkAuthAndLoadData()
  }, [chapterNumber])

  const checkAuthAndLoadData = async () => {
    try {
      const currentUser = await getUser()
      if (!currentUser) {
        navigate('/auth/login')
        return
      }

      setUser(currentUser)
      await loadChapterProgress(currentUser.id)
    } catch (error) {
      console.error('Error loading chapter:', error)
      navigate('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const loadChapterProgress = async (userId: string) => {
    try {
      // Get user's exercise responses for this chapter
      const { data: responses, error } = await supabase
        .from('exercise_responses')
        .select('exercise_id')
        .eq('user_id', userId)

      if (error) {
        console.warn('Error loading exercise responses:', error.message)
      }

      const responseSet = new Set(responses?.map(r => r.exercise_id) || [])
      setExerciseResponses(responseSet)

      // Calculate progress for this chapter
      const chapterExercises = exercises.filter(ex => ex.chapter === chapterNum)
      const completedCount = chapterExercises.filter(ex => responseSet.has(ex.id)).length
      const totalCount = chapterExercises.length

      setProgress({
        completedExercises: completedCount,
        totalExercises: totalCount,
        completionPercentage: totalCount > 0 ? (completedCount / totalCount) * 100 : 0
      })
    } catch (error) {
      console.error('Error loading chapter progress:', error)
    }
  }

  const getNextChapter = () => {
    return chapters.find(c => c.number === chapterNum + 1)
  }

  const getPreviousChapter = () => {
    return chapters.find(c => c.number === chapterNum - 1)
  }

  if (loading || promptsLoading || exercisesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!currentChapter) {
    return (
      <DashboardLayout user={user}>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">Chapter not found</div>
          <Link to="/chapters" className="btn-primary">
            Back to Chapters
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const nextChapter = getNextChapter()
  const previousChapter = getPreviousChapter()

  return (
    <DashboardLayout user={user}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/chapters"
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Badge variant="default" size="sm">
                  Chapter {currentChapter.number}
                </Badge>
                <Badge variant="default" size="sm">
                  Part {currentChapter.part}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{currentChapter.title}</h1>
            </div>
          </div>
          
          {progress.completionPercentage === 100 && (
            <div className="flex items-center space-x-2 text-success-600">
              <CheckCircle className="w-6 h-6" />
              <span className="font-medium">Chapter Complete</span>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Chapter Progress</h2>
            <Badge variant="success" size="lg">
              {Math.round(progress.completionPercentage)}% Complete
            </Badge>
          </div>
          <ProgressBar 
            progress={progress.completionPercentage} 
            size="lg" 
            showPercentage={false}
            className="mb-4"
          />
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {progress.completedExercises} of {progress.totalExercises} exercises completed
            </span>
            <span>
              {prompts.length} prompts available
            </span>
          </div>
        </div>

        {/* Exercises Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <Target className="w-6 h-6 text-primary-600 mr-2" />
              Exercises
            </h2>
            <Badge variant="default" size="sm">
              {exercises.length} exercises
            </Badge>
          </div>

          {exercises.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {exercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  isCompleted={exerciseResponses.has(exercise.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600">No exercises available for this chapter yet.</p>
            </div>
          )}
        </div>

        {/* Prompts Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <MessageSquare className="w-6 h-6 text-success-600 mr-2" />
              Chapter Prompts
            </h2>
            <Badge variant="default" size="sm">
              {prompts.length} prompts
            </Badge>
          </div>

          {prompts.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {prompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  promptType="book"
                  showRatings={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600">No prompts available for this chapter yet.</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-8 border-t border-gray-200">
          <div>
            {previousChapter && (
              <Link
                to={`/chapters/${previousChapter.number}`}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <div>
                  <div className="text-sm">Previous Chapter</div>
                  <div className="font-medium">{previousChapter.title}</div>
                </div>
              </Link>
            )}
          </div>

          <Link
            to="/chapters"
            className="btn-secondary"
          >
            All Chapters
          </Link>

          <div>
            {nextChapter && (
              <Link
                to={`/chapters/${nextChapter.number}`}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <div className="text-right">
                  <div className="text-sm">Next Chapter</div>
                  <div className="font-medium">{nextChapter.title}</div>
                </div>
                <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}