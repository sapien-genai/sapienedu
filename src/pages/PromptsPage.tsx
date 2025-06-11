import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, Plus, Search, Filter, X, BookOpen, BarChart3 } from 'lucide-react'
import { getUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useBookPrompts, useChapters } from '@/hooks/useBookContent'
import DashboardLayout from '@/components/layout/DashboardLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Badge from '@/components/ui/Badge'
import PromptCard from '@/components/prompts/PromptCard'
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

export default function PromptsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userPrompts, setUserPrompts] = useState<Prompt[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterSource, setFilterSource] = useState('all') // 'all', 'book', 'user'
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const [savedPrompts, setSavedPrompts] = useState<Set<string>>(new Set())
  const [showRatings, setShowRatings] = useState(true)
  const navigate = useNavigate()

  const { chapters } = useChapters()
  const { prompts: bookPrompts, loading: bookPromptsLoading, error: bookPromptsError } = useBookPrompts({
    search: searchTerm,
    category: filterCategory !== 'all' ? filterCategory : undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined
  })

  // Get unique categories and tags from book prompts
  const allCategories = Array.from(new Set(bookPrompts.map(p => p.category))).sort()
  const allTags = Array.from(new Set(bookPrompts.flatMap(p => p.tags))).sort()

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
      
      // Track which book prompts have been saved
      const savedBookPromptTitles = new Set(prompts?.map(p => p.title) || [])
      setSavedPrompts(savedBookPromptTitles)
    } catch (error) {
      console.error('Error loading user prompts:', error)
    }
  }

  const saveBookPromptToLibrary = async (bookPrompt: any) => {
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
      setSavedPrompts(prev => new Set([...prev, bookPrompt.title]))
      await loadUserPrompts(user.id)
    } catch (error) {
      console.error('Error saving prompt:', error)
      toast.error('Failed to save prompt')
    }
  }

  const deleteUserPrompt = async (promptId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', promptId)
        .eq('user_id', user.id)

      if (error) throw error

      toast.success('Prompt deleted successfully!')
      await loadUserPrompts(user.id)
    } catch (error) {
      console.error('Error deleting prompt:', error)
      toast.error('Failed to delete prompt')
    }
  }

  const getChapterTitle = (chapterNumber: number) => {
    const chapter = chapters.find(c => c.number === chapterNumber)
    return chapter ? chapter.title : `Chapter ${chapterNumber}`
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilterCategory('all')
    setFilterSource('all')
    setSelectedTags([])
  }

  const filteredUserPrompts = userPrompts.filter(prompt => {
    const matchesSearch = !searchTerm || 
      prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.prompt_text.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = filterCategory === 'all' || prompt.category === filterCategory
    
    return matchesSearch && matchesCategory
  })

  const displayPrompts = filterSource === 'user' ? [] : bookPrompts
  const displayUserPrompts = filterSource === 'book' ? [] : filteredUserPrompts

  if (loading || bookPromptsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (bookPromptsError) {
    return (
      <DashboardLayout user={user}>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">Error loading book prompts: {bookPromptsError}</div>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Retry
          </button>
        </div>
      </DashboardLayout>
    )
  }

  const totalPrompts = bookPrompts.length + userPrompts.length
  const hasActiveFilters = searchTerm || filterCategory !== 'all' || filterSource !== 'all' || selectedTags.length > 0

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
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button
              onClick={() => setShowRatings(!showRatings)}
              className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                showRatings 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {showRatings ? 'Hide Ratings' : 'Show Ratings'}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Prompt
            </button>
          </div>
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
            <div className="text-2xl font-bold text-yellow-600 mb-1">{allCategories.length}</div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">{allTags.length}</div>
            <div className="text-sm text-gray-600">Available Tags</div>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="space-y-4">
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
                  {allCategories.map(category => (
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

            {/* Tag Filters */}
            {allTags.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Filter by tags:</div>
                <div className="flex flex-wrap gap-2">
                  {allTags.slice(0, 12).map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 ${
                        selectedTags.includes(tag)
                          ? 'bg-primary-100 text-primary-700 border border-primary-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {displayPrompts.length + displayUserPrompts.length} of {totalPrompts} prompts
                  </span>
                </div>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-500 flex items-center"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Book Prompts Section */}
        {filterSource !== 'user' && displayPrompts.length > 0 && (
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
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  promptType="book"
                  onSave={saveBookPromptToLibrary}
                  isSaved={savedPrompts.has(prompt.title)}
                  showRatings={showRatings}
                />
              ))}
            </div>
          </div>
        )}

        {/* User Prompts Section */}
        {filterSource !== 'book' && displayUserPrompts.length > 0 && (
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
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  promptType="user"
                  onEdit={setEditingPrompt}
                  onDelete={deleteUserPrompt}
                  showRatings={showRatings}
                />
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
              {hasActiveFilters
                ? 'Try adjusting your search or filter criteria.'
                : 'Start by exploring book prompts or adding your own.'}
            </p>
            {hasActiveFilters ? (
              <button onClick={clearFilters} className="btn-secondary">
                Clear Filters
              </button>
            ) : (
              <button onClick={() => setShowAddModal(true)} className="btn-primary">
                Add Your First Prompt
              </button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}