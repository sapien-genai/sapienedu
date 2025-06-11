import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
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
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .order('number')

      if (error) throw error
      setChapters(data || [])
    } catch (err: any) {
      setError(err.message)
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

      if (error) throw error

      let filteredData = data || []

      // Filter by tags if specified
      if (filters?.tags && filters.tags.length > 0) {
        filteredData = filteredData.filter(prompt =>
          filters.tags!.some(tag => prompt.tags.includes(tag))
        )
      }

      setPrompts(filteredData)
    } catch (err: any) {
      setError(err.message)
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
      let query = supabase
        .from('book_exercises')
        .select('*')
        .order('chapter', { ascending: true })
        .order('sort_order', { ascending: true })

      if (chapter) {
        query = query.eq('chapter', chapter)
      }

      const { data, error } = await query

      if (error) throw error
      setExercises(data || [])
    } catch (err: any) {
      setError(err.message)
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