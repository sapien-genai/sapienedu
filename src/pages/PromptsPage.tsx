import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, Plus, Star, Edit, Trash2, Search, Copy, Check, BookOpen, Filter } from 'lucide-react'
import { getUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useBookPrompts, useChapters } from '@/hooks/useBookContent'
import DashboardLayout from '@/components/layout/DashboardLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Badge from '@/components/ui/Badge'
import { toast } from 'sonner'

interface Prompt {
  id: string
  title: string
  prompt_text: string
  category: string
  success_rating: number
  notes: string | null
  created_at: string
}

interface BookPrompt {
  id: string
  chapter: number
  category: string
  title: string
  prompt: string
  tags: string[]
  pro_tip?: string
  is_from_book: boolean
  sort_order: number
}

export default function PromptsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userPrompts, setUserPrompts] = useState<Prompt[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterSource, setFilterSource] = useState('all') // 'all', 'book', 'user'
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null)
  const navigate = useNavigate()

  const { chapters } = useChapters()
  const { prompts: bookPrompts, loading: bookPromptsLoading } = useBookPrompts({
    search: searchTerm,
    category: filterCategory !== 'all' ? filterCategory : undefined
  })

  const categories = ['Writing', 'Analysis', 'Creative', 'Technical', 'Communication', 'Getting Started', 'Goal Setting', 'Prompt Engineering', 'Habit Formation', 'Content Creation', 'Data Analysis', 'Automation', 'Tool Selection', 'Workflow Integration', 'ROI Tracking', 'Advanced Techniques', 'Team Collaboration', 'Future Planning', 'Other']

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
      await loadUserPrompts(currentUser.id)
    } catch (error) {
      console.error('Error loading prompts:', error)
      navigate('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const loadUserPrompts = async (userId: string) => {
    try {
      const { data: prompts } = await supabase
        .from('prompts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      setUserPrompts(prompts || [])
    } catch (error) {
      console.error('Error loading user prompts:', error)
    }
  }

  const copyToClipboard = async (text: string, promptId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedPromptId(promptId)
      toast.success('Prompt copied to clipboard!')
      setTimeout(() => setCopiedPromptId(null), 2000)
    } catch (error) {
      toast.error('Failed to copy prompt')
    }
  }

  const saveBookPromptToLibrary = async (bookPrompt: BookPrompt) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('prompts')
        .insert({
          user_id: user.id,
          title: bookPrompt.title,
          prompt_text: bookPrompt.prompt,
          category: bookPrompt.category,
          success_rating: 5, // Default high rating for book prompts
          notes: bookPrompt.pro_tip || null
        })

      if (error) throw error

      toast.success('Prompt saved to your library!')
      await loadUserPrompts(user.id)
    } catch (error) {
      console.error('Error saving prompt:', error)
      toast.error('Failed to save prompt')
    }
  }

  const getChapterTitle = (chapterNumber: number) => {
    const chapter = chapters.chapters.find(c => c.number === chapterNumber)
    return chapter ? chapter.title : `Chapter ${chapterNumber}`
  }

  const filteredUserPrompts = userPrompts.filter(prompt => {
    const matchesSearch = !searchTerm || 
      prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.prompt_text.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = filterCategory === 'all' || prompt.category === filterCategory
    
    return matchesSearch && matchesCategory
  })

  const filteredBookPrompts = bookPrompts.filter(prompt => {
    const matchesCategory = filterCategory === 'all' || prompt.category === filterCategory
    return matchesCategory
  })

  const displayPrompts = filterSource === 'user' ? [] : filteredBookPrompts
  const displayUserPrompts = filterSource === 'book' ? [] : filteredUserPrompts

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  if (loading || bookPromptsLoading) {
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
              Discover book prompts and manage your personal collection
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
            <div className="text-2xl font-bold text-primary-600 mb-1">{bookPrompts.length}</div>
            <div className="text-sm text-gray-600">Book Prompts</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-success-600 mb-1">{userPrompts.length}</div>
            <div className="text-sm text-gray-600">Your Prompts</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {new Set([...bookPrompts.map(p => p.category), ...userPrompts.map(p => p.category)]).size}
            </div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {bookPrompts.reduce((acc, p) => acc + p.tags.length, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Tags</div>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col lg:flex-row gap-4">
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
            <div className="lg:w-48">
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
            <div className="lg:w-48">
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="input-field"
              >
                <option value="all">All Sources</option>
                <option value="book">Book Prompts</option>
                <option value="user">My Prompts</option>
              </select>
            </div>
          </div>
        </div>

        {/* Book Prompts Section */}
        {filterSource !== 'user' && (
          <div className="space-y-6">
            <div className="flex items-center">
              <BookOpen className="w-5 h-5 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Book Prompts</h2>
              <Badge variant="default" size="sm" className="ml-2">
                {displayPrompts.length} prompts
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {displayPrompts.map((prompt) => (
                <div key={prompt.id} className="card group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mr-3">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{prompt.title}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="default" size="sm">{prompt.category}</Badge>
                          <span className="text-xs text-gray-500">
                            {getChapterTitle(prompt.chapter)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => copyToClipboard(prompt.prompt, prompt.id)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                        title="Copy prompt"
                      >
                        {copiedPromptId === prompt.id ? (
                          <Check className="w-4 h-4 text-success-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => saveBookPromptToLibrary(prompt)}
                        className="p-2 text-gray-400 hover:text-success-600 hover:bg-success-50 rounded-lg"
                        title="Save to library"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-700 line-clamp-4">
                      {prompt.prompt}
                    </p>
                  </div>

                  {prompt.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {prompt.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {prompt.pro_tip && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-3">
                      <div className="flex">
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            <strong>Pro Tip:</strong> {prompt.pro_tip}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Prompts Section */}
        {filterSource !== 'book' && userPrompts.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center">
              <MessageSquare className="w-5 h-5 text-success-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Your Prompts</h2>
              <Badge variant="success" size="sm" className="ml-2">
                {displayUserPrompts.length} prompts
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {displayUserPrompts.map((prompt) => (
                <div key={prompt.id} className="card group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-success-100 text-success-600 rounded-lg flex items-center justify-center mr-3">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{prompt.title}</h3>
                        <Badge variant="success" size="sm">{prompt.category}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => copyToClipboard(prompt.prompt_text, prompt.id)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                      >
                        {copiedPromptId === prompt.id ? (
                          <Check className="w-4 h-4 text-success-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
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
          </div>
        )}

        {/* Empty State */}
        {displayPrompts.length === 0 && displayUserPrompts.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No prompts found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterCategory !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Start by exploring book prompts or adding your own.'}
            </p>
            {userPrompts.length === 0 && filterSource !== 'book' && (
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