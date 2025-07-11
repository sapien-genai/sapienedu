import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Target, ArrowLeft, Save } from 'lucide-react'
import { getUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/layout/DashboardLayout'
import GoalSettingForm from '@/components/exercises/GoalSettingForm'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { toast } from 'sonner'

export default function GoalSettingPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [existingGoals, setExistingGoals] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
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
      await loadExistingGoals(currentUser.id)
    } catch (error) {
      console.error('Error loading goal setting page:', error)
      navigate('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const loadExistingGoals = async (userId: string) => {
    try {
      // Check if user has existing goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)

      if (goalsError) throw goalsError

      if (goalsData && goalsData.length > 0) {
        // Load milestones for these goals
        const { data: milestonesData, error: milestonesError } = await supabase
          .from('goal_milestones')
          .select('*')
          .eq('user_id', userId)
          .in('goal_id', goalsData.map(g => g.id))

        if (milestonesError) throw milestonesError

        setExistingGoals({
          goals: goalsData[0].goals || [],
          milestones: milestonesData || [],
          vision: goalsData[0].vision || ''
        })
      }
    } catch (error) {
      console.error('Error loading existing goals:', error)
      toast.error('Failed to load existing goals')
    }
  }

  const handleSaveGoals = async (data: any) => {
    if (!user) return

    setSubmitting(true)
    try {
      // Check if user already has goals
      const { data: existingData, error: checkError } = await supabase
        .from('user_goals')
        .select('id')
        .eq('user_id', user.id)

      if (checkError) throw checkError

      let goalId: string

      if (existingData && existingData.length > 0) {
        // Update existing goals
        const { error: updateError } = await supabase
          .from('user_goals')
          .update({
            goals: data.goals,
            vision: data.vision,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingData[0].id)

        if (updateError) throw updateError
        goalId = existingData[0].id
      } else {
        // Insert new goals
        const { data: insertData, error: insertError } = await supabase
          .from('user_goals')
          .insert({
            user_id: user.id,
            goals: data.goals,
            vision: data.vision
          })
          .select('id')

        if (insertError) throw insertError
        goalId = insertData[0].id
      }

      // Handle milestones - first delete existing ones
      const { error: deleteError } = await supabase
        .from('goal_milestones')
        .delete()
        .eq('user_id', user.id)

      if (deleteError) throw deleteError

      // Then insert new milestones
      if (data.milestones && data.milestones.length > 0) {
        const milestonesToInsert = data.milestones.map((m: any) => ({
          user_id: user.id,
          goal_id: m.goalId,
          title: m.title,
          target_date: m.targetDate,
          completed: m.completed
        }))

        const { error: milestoneError } = await supabase
          .from('goal_milestones')
          .insert(milestonesToInsert)

        if (milestoneError) throw milestoneError
      }

      toast.success('Goals saved successfully!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Error saving goals:', error)
      toast.error('Failed to save goals')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">90-Day AI Integration Goals</h1>
              <p className="text-gray-600 mt-1">
                Set specific, measurable goals for your AI integration journey
              </p>
            </div>
          </div>
        </div>

        {/* Goal Setting Form */}
        <div className="card">
          <div className="flex items-center mb-6">
            <Target className="w-6 h-6 text-primary-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Define Your AI Integration Goals</h2>
          </div>

          <GoalSettingForm
            initialData={existingGoals}
            onSave={handleSaveGoals}
            isUpdate={!!existingGoals}
          />
        </div>

        {/* Tips */}
        <div className="card bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Tips for Effective Goals</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center mr-2 flex-shrink-0">1</span>
              <span>Make goals <strong>specific and measurable</strong> (e.g., "Reduce email response time by 50% using AI")</span>
            </li>
            <li className="flex items-start">
              <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center mr-2 flex-shrink-0">2</span>
              <span>Set <strong>realistic timelines</strong> within the 90-day framework</span>
            </li>
            <li className="flex items-start">
              <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center mr-2 flex-shrink-0">3</span>
              <span>Break larger goals into <strong>smaller milestones</strong> for easier tracking</span>
            </li>
            <li className="flex items-start">
              <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center mr-2 flex-shrink-0">4</span>
              <span>Focus on <strong>high-impact areas</strong> where AI can make the biggest difference</span>
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  )
}