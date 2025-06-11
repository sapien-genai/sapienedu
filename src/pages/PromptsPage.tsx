import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, Plus, Star, Edit, Trash2, Search } from 'lucide-react'
import { getUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/layout/DashboardLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Badge from '@/components/ui/Badge'

interface Prompt {
  id: string
  title: string
  prompt_text: string
  category: string
  success_rating: number
  notes: string | null
  created_at: string
}

export default function PromptsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const navigate = useNavigate()

  const categories = ['Writing', 'Analysis', 'Creative', 'Technical', 'Communication', 'Other']

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  useEffect(() => {
    filterPrompts()
  }, [prompts, searchTerm, filterCategory])

  const checkAuthAndLoadData = async () => {
    try {
      const currentUser = await getUser()
      if (!currentUser) {
        navigate('/auth/login')
        return
      }

      setUser(currentUser)
      await loadPrompts(currentUser.id)
    } catch (error) {
      console.error('Error loading prompts:', error)
      navigate('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const loadPrompts = async (userId: string) => {
    try {
      const { data: prompts } = await supabase
        .from('prompts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      setPrompts(prompts || [])
    } catch (error) {
      console.error('Error loading prompts:', error)
    }
  }

  const filterPrompts = () => {
    let filtered = prompts

    if (searchTerm) {
      filtered = filtered.filter(prompt =>
        prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.prompt_text.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(prompt => prompt.category === filterCategory)
    }

    setFilteredPrompts(filtered)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Prompt Library</h1>
            <p className="text-gray-600 mt-2">
              Build and manage your collection of effective AI prompts
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center mt-4 md:mt-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Prompt
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">{prompts.length}</div>
            <div className="text-sm text-gray-600">Total Prompts</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-primary-600 mb-1">
              {new Set(prompts.map(p => p.category)).size}
            </div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {prompts.length > 0 ? (prompts.reduce((sum, p) => sum + p.success_rating, 0) / prompts.length).toFixed(1) : '0'}
            </div>
            <div className="text-sm text-gray-600">Avg Rating</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-success-600 mb-1">
              {prompts.filter(p => p.success_rating >= 4).length}
            </div>
            <div className="text-sm text-gray-600">High Rated</div>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search prompts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="input-field"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Prompts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPrompts.map((prompt) => (
            <div key={prompt.id} className="card group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mr-3">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{prompt.title}</h3>
                    <Badge variant="default" size="sm">{prompt.category}</Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => setEditingPrompt(prompt)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <div className="flex items-center mr-2">
                    {renderStars(prompt.success_rating)}
                  </div>
                  <span className="text-sm text-gray-600">
                    {prompt.success_rating}/5
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 line-clamp-3">
                  {prompt.prompt_text}
                </p>
              </div>

              {prompt.notes && (
                <div className="text-sm text-gray-600">
                  <strong>Notes:</strong> {prompt.notes}
                </div>
              )}

              <div className="text-xs text-gray-500 mt-4">
                Created {new Date(prompt.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        {filteredPrompts.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {prompts.length === 0 ? 'No prompts yet' : 'No prompts found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {prompts.length === 0 
                ? 'Start building your prompt library by adding your first prompt.'
                : 'Try adjusting your search or filter criteria.'}
            </p>
            {prompts.length === 0 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
              >
                Add Your First Prompt
              </button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}