import { useState, useEffect, useMemo } from 'react'
import { 
  PROMPT_LIBRARY, 
  getPromptsByCategory, 
  getFeaturedPrompts, 
  getPromptsByDifficulty,
  searchPrompts,
  getUniqueCategories,
  getUniqueTags,
  getPromptById,
  type PromptTemplate 
} from '@/data/promptLibrary'

interface UsePromptLibraryFilters {
  category?: string
  difficulty?: PromptTemplate['difficulty']
  tags?: string[]
  searchTerm?: string
  featured?: boolean
}

export function usePromptLibrary(filters: UsePromptLibraryFilters = {}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filteredPrompts = useMemo(() => {
    let prompts = [...PROMPT_LIBRARY]

    // Apply search filter first
    if (filters.searchTerm) {
      prompts = searchPrompts(filters.searchTerm)
    }

    // Apply category filter
    if (filters.category && filters.category !== 'all') {
      prompts = prompts.filter(prompt => prompt.category === filters.category)
    }

    // Apply difficulty filter
    if (filters.difficulty && filters.difficulty !== 'all') {
      prompts = prompts.filter(prompt => prompt.difficulty === filters.difficulty)
    }

    // Apply featured filter
    if (filters.featured) {
      prompts = prompts.filter(prompt => prompt.is_featured)
    }

    // Apply tags filter
    if (filters.tags && filters.tags.length > 0) {
      prompts = prompts.filter(prompt =>
        filters.tags!.some(tag => prompt.tags.includes(tag))
      )
    }

    return prompts
  }, [filters])

  return {
    prompts: filteredPrompts,
    loading,
    error,
    totalCount: PROMPT_LIBRARY.length,
    filteredCount: filteredPrompts.length
  }
}

export function usePromptCategories() {
  return {
    categories: getUniqueCategories(),
    loading: false,
    error: null
  }
}

export function usePromptTags() {
  return {
    tags: getUniqueTags(),
    loading: false,
    error: null
  }
}

export function usePrompt(id: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const prompt = useMemo(() => getPromptById(id), [id])

  return {
    prompt,
    loading,
    error
  }
}

export function useFeaturedPrompts() {
  return {
    prompts: getFeaturedPrompts(),
    loading: false,
    error: null
  }
}

// Hook for saving prompts to user's personal library
export function useSavePrompt() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const savePrompt = async (promptId: string) => {
    setSaving(true)
    setError(null)

    try {
      const prompt = getPromptById(promptId)
      if (!prompt) {
        throw new Error('Prompt not found')
      }

      // Here you would typically save to your database
      // For now, we'll just simulate the save
      await new Promise(resolve => setTimeout(resolve, 500))

      // You could save to localStorage as a fallback
      const savedPrompts = JSON.parse(localStorage.getItem('savedPrompts') || '[]')
      if (!savedPrompts.includes(promptId)) {
        savedPrompts.push(promptId)
        localStorage.setItem('savedPrompts', JSON.stringify(savedPrompts))
      }

    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setSaving(false)
    }
  }

  return {
    savePrompt,
    saving,
    error
  }
}