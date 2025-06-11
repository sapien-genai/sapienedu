import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Calendar, Download, Save } from 'lucide-react'
import { getUser, signOut } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/layout/DashboardLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Badge from '@/components/ui/Badge'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })
  const [stats, setStats] = useState({
    totalExercises: 0,
    completedExercises: 0,
    savedPrompts: 0,
    joinDate: ''
  })
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
      setFormData({
        name: currentUser.user_metadata?.name || '',
        email: currentUser.email || ''
      })
      
      await loadUserStats(currentUser.id)
      setStats(prev => ({
        ...prev,
        joinDate: new Date(currentUser.created_at).toLocaleDateString()
      }))
    } catch (error) {
      console.error('Error loading profile:', error)
      navigate('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const loadUserStats = async (userId: string) => {
    try {
      // Get exercise stats
      const { data: exercises } = await supabase
        .from('exercises')
        .select('completed')
        .eq('user_id', userId)

      // Get prompt stats
      const { data: prompts } = await supabase
        .from('prompts')
        .select('id')
        .eq('user_id', userId)

      setStats(prev => ({
        ...prev,
        totalExercises: exercises?.length || 0,
        completedExercises: exercises?.filter(e => e.completed).length || 0,
        savedPrompts: prompts?.length || 0
      }))
    } catch (error) {
      console.error('Error loading user stats:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name: formData.name }
      })

      if (error) throw error

      // Update local user state
      setUser(prev => ({
        ...prev,
        user_metadata: { ...prev.user_metadata, name: formData.name }
      }))
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const exportData = async () => {
    try {
      // Get all user data
      const [exercisesRes, promptsRes] = await Promise.all([
        supabase.from('exercises').select('*').eq('user_id', user.id),
        supabase.from('prompts').select('*').eq('user_id', user.id)
      ])

      const userData = {
        profile: {
          name: user.user_metadata?.name,
          email: user.email,
          joinDate: user.created_at
        },
        exercises: exercisesRes.data || [],
        prompts: promptsRes.data || [],
        exportDate: new Date().toISOString()
      }

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ai-integration-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting data:', error)
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
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account settings and view your progress
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="input-field pl-10"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="input-field pl-10 bg-gray-50 text-gray-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary flex items-center"
                  >
                    {saving ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                  </button>
                </div>
              </div>
            </div>

            {/* Data Export */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Export</h2>
              <p className="text-gray-600 mb-4">
                Download all your data including exercises, prompts, and progress.
              </p>
              <button
                onClick={exportData}
                className="btn-secondary flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export My Data
              </button>
            </div>

            {/* Account Actions */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Actions</h2>
              <div className="space-y-4">
                <button
                  onClick={handleSignOut}
                  className="btn-secondary"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Exercises Completed</span>
                  <Badge variant="success" size="sm">
                    {stats.completedExercises}/{stats.totalExercises}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Saved Prompts</span>
                  <Badge variant="default" size="sm">
                    {stats.savedPrompts}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="text-sm text-gray-900">{stats.joinDate}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Info</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Joined {stats.joinDate}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Mail className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Email verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}