import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { CHAPTERS, BOOK_PROMPTS, BOOK_EXERCISES } from '@/data/bookContent'
import type { Chapter, BookPrompt, BookExercise } from '@/data/bookContent'

export function useChapters() {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadChapters()
  }, [])

  const loadChapters = async () => {
    try {
      // Try to fetch from Supabase first
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .order('number')

      if (error) {
        // If Supabase fails, use local data
        console.warn('Supabase fetch failed, using local data:', error.message)
        setChapters(CHAPTERS)
      } else {
        setChapters(data || CHAPTERS)
      }
    } catch (err: any) {
      // If network error, use local data
      console.warn('Network error, using local data:', err.message)
      setChapters(CHAPTERS)
      setError(null) // Don't show error to user, just use local data
    } finally {
      setLoading(false)
    }
  }

  return { chapters, loading, error, refetch: loadChapters }
}

export function useBookPrompts(filters?: {
  chapter?: number
  category?: string
  tags?: string[]
  search?: string
}) {
  const [prompts, setPrompts] = useState<BookPrompt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPrompts()
  }, [filters])

  const loadPrompts = async () => {
    try {
      // Try to fetch from Supabase first
      let query = supabase
        .from('book_prompts')
        .select('*')
        .order('chapter', { ascending: true })
        .order('sort_order', { ascending: true })

      if (filters?.chapter) {
        query = query.eq('chapter', filters.chapter)
      }

      if (filters?.category) {
        query = query.eq('category', filters.category)
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,prompt.ilike.%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) {
        // If Supabase fails, use local data with filters
        console.warn('Supabase fetch failed, using local data:', error.message)
        let filteredData = [...BOOK_PROMPTS]
        
        if (filters?.chapter) {
          filteredData = filteredData.filter(prompt => prompt.chapter === filters.chapter)
        }
        
        if (filters?.category) {
          filteredData = filteredData.filter(prompt => prompt.category === filters.category)
        }
        
        if (filters?.search) {
          const searchLower = filters.search.toLowerCase()
          filteredData = filteredData.filter(prompt =>
            prompt.title.toLowerCase().includes(searchLower) ||
            prompt.prompt.toLowerCase().includes(searchLower)
          )
        }
        
        if (filters?.tags && filters.tags.length > 0) {
          filteredData = filteredData.filter(prompt =>
            filters.tags!.some(tag => prompt.tags.includes(tag))
          )
        }
        
        setPrompts(filteredData)
      } else {
        let filteredData = data || []

        // Filter by tags if specified (since Supabase query doesn't handle this)
        if (filters?.tags && filters.tags.length > 0) {
          filteredData = filteredData.filter(prompt =>
            filters.tags!.some(tag => prompt.tags.includes(tag))
          )
        }

        setPrompts(filteredData)
      }
    } catch (err: any) {
      // If network error, use local data with filters
      console.warn('Network error, using local data:', err.message)
      let filteredData = [...BOOK_PROMPTS]
      
      if (filters?.chapter) {
        filteredData = filteredData.filter(prompt => prompt.chapter === filters.chapter)
      }
      
      if (filters?.category) {
        filteredData = filteredData.filter(prompt => prompt.category === filters.category)
      }
      
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase()
        filteredData = filteredData.filter(prompt =>
          prompt.title.toLowerCase().includes(searchLower) ||
          prompt.prompt.toLowerCase().includes(searchLower)
        )
      }
      
      if (filters?.tags && filters.tags.length > 0) {
        filteredData = filteredData.filter(prompt =>
          filters.tags!.some(tag => prompt.tags.includes(tag))
        )
      }
      
      setPrompts(filteredData)
      setError(null) // Don't show error to user, just use local data
    } finally {
      setLoading(false)
    }
  }

  return { prompts, loading, error, refetch: loadPrompts }
}

export function useBookExercises(chapter?: number) {
  const [exercises, setExercises] = useState<BookExercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadExercises()
  }, [chapter])

  const loadExercises = async () => {
    try {
      // Try to fetch from Supabase first
      let query = supabase
        .from('book_exercises')
        .select('*')
        .order('chapter', { ascending: true })
        .order('sort_order', { ascending: true })

      if (chapter) {
        query = query.eq('chapter', chapter)
      }

      const { data, error } = await query

      if (error) {
        // If Supabase fails, use local data
        console.warn('Supabase fetch failed, using local data:', error.message)
        let filteredData = [...BOOK_EXERCISES]
        
        if (chapter) {
          filteredData = filteredData.filter(exercise => exercise.chapter === chapter)
        }
        
        setExercises(filteredData)
      } else {
        setExercises(data || BOOK_EXERCISES)
      }
    } catch (err: any) {
      // If network error, use local data
      console.warn('Network error, using local data:', err.message)
      let filteredData = [...BOOK_EXERCISES]
      
      if (chapter) {
        filteredData = filteredData.filter(exercise => exercise.chapter === chapter)
      }
      
      setExercises(filteredData)
      setError(null) // Don't show error to user, just use local data
    } finally {
      setLoading(false)
    }
  }

  return { exercises, loading, error, refetch: loadExercises }
}

export function useBookContent() {
  const chapters = useChapters()
  const prompts = useBookPrompts()
  const exercises = useBookExercises()

  return {
    chapters,
    prompts,
    exercises,
    loading: chapters.loading || prompts.loading || exercises.loading,
    error: chapters.error || prompts.error || exercises.error
  }
}