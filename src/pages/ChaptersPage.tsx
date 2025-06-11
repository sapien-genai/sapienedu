import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { BookOpen, CheckCircle, Circle, ChevronRight } from 'lucide-react'
import { getUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { getAllChapters, getExercisesByChapter } from '@/lib/exercises'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ProgressBar from '@/components/ui/ProgressBar'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface ChapterProgress {
  chapter: number
  completed: number
  total: number
  percentage: number
}

export default function ChaptersPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [chapterProgress, setChapterProgress] = useState<ChapterProgress[]>([])
  const navigate = useNavigate()

  const chapters = [
    { number: 1, title: 'AI Readiness Assessment', description: 'Evaluate your current AI knowledge and set goals for your journey.' },
    { number: 2, title: 'Prompt Engineering Fundamentals', description: 'Master the art of communicating effectively with AI systems.' },
    { number: 3, title: 'Daily AI Habits', description: 'Build consistent routines that integrate AI into your workflow.' },
    { number: 4, title: 'Content Creation with AI', description: 'Transform your writing and creative processes with AI assistance.' },
    { number: 5, title: 'Data Analysis & Insights', description: 'Leverage AI for powerful data analysis and decision making.' },
    { number: 6, title: 'Automation Strategies', description: 'Identify and implement automation opportunities in your work.' },
    { number: 7, title: 'AI Tool Selection', description: 'Choose the right AI tools for your specific needs and budget.' },
    { number: 8, title: 'Workflow Integration', description: 'Seamlessly integrate AI tools into your existing processes.' },
    { number: 9, title: 'Measuring ROI', description: 'Track and measure the impact of AI on your productivity.' },
    { number: 10, title: 'Advanced Techniques', description: 'Explore advanced AI applications and cutting-edge strategies.' },
    { number: 11, title: 'Team Collaboration', description: 'Scale AI adoption across your team and organization.' },
    { number: 12, title: 'Future-Proofing', description: 'Prepare for the evolving landscape of AI technology.' }
  ]

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
      await loadChapterProgress(currentUser.id)
    } catch (error) {
      console.error('Error loading chapters:', error)
      navigate('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const loadChapterProgress = async (userId: string) => {
    try {
      const { data: exercises } = await supabase
        .from('exercises')
        .select('chapter_number, completed')
        .eq('user_id', userId)

      const progressMap = new Map<number, { completed: number; total: number }>()

      // Initialize all chapters
      getAllChapters().forEach(chapterNum => {
        const chapterExercises = getExercisesByChapter(chapterNum)
        progressMap.set(chapterNum, { 
          completed: 0, 
          total: chapterExercises.length 
        })
      })

      // Count completed exercises per chapter
      exercises?.forEach(exercise => {
        const current = progressMap.get(exercise.chapter_number)
        if (current && exercise.completed) {
          current.completed += 1
        }
      })

      const progress: ChapterProgress[] = Array.from(progressMap.entries()).map(([chapter, data]) => ({
        chapter,
        completed: data.completed,
        total: data.total,
        percentage: data.total > 0 ? (data.completed / data.total) * 100 : 0
      }))

      setChapterProgress(progress.sort((a, b) => a.chapter - b.chapter))
    } catch (error) {
      console.error('Error loading chapter progress:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const getProgressForChapter = (chapterNumber: number) => {
    return chapterProgress.find(p => p.chapter === chapterNumber) || { completed: 0, total: 3, percentage: 0 }
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chapters</h1>
            <p className="text-gray-600 mt-2">
              Complete all 12 chapters to master AI integration in 90 days
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Overall Progress</div>
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(chapterProgress.reduce((sum, ch) => sum + ch.percentage, 0) / chapters.length)}%
            </div>
          </div>
        </div>

        {/* Chapters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chapters.map((chapter) => {
            const progress = getProgressForChapter(chapter.number)
            const isCompleted = progress.percentage === 100
            
            return (
              <Link
                key={chapter.number}
                to={`/chapters/${chapter.number}`}
                className="card hover:shadow-lg transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                      isCompleted 
                        ? 'bg-success-100 text-success-600' 
                        : progress.completed > 0 
                          ? 'bg-primary-100 text-primary-600' 
                          : 'bg-gray-100 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <BookOpen className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Chapter {chapter.number}</div>
                      {isCompleted && (
                        <Badge variant="success" size="sm">Completed</Badge>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-200">
                  {chapter.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {chapter.description}
                </p>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">
                      {progress.completed}/{progress.total} exercises
                    </span>
                  </div>
                  <ProgressBar progress={progress.percentage} size="sm" />
                </div>
              </Link>
            )
          })}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card text-center">
            <div className="text-3xl font-bold text-success-600 mb-2">
              {chapterProgress.filter(ch => ch.percentage === 100).length}
            </div>
            <div className="text-gray-600">Chapters Completed</div>
          </div>
          
          <div className="card text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {chapterProgress.filter(ch => ch.completed > 0 && ch.percentage < 100).length}
            </div>
            <div className="text-gray-600">Chapters In Progress</div>
          </div>
          
          <div className="card text-center">
            <div className="text-3xl font-bold text-gray-600 mb-2">
              {chapterProgress.reduce((sum, ch) => sum + ch.completed, 0)}
            </div>
            <div className="text-gray-600">Total Exercises Completed</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}