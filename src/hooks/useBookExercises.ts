import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { BOOK_EXERCISES } from '@/data/bookContent'
import type { BookExercise } from '@/data/bookContent'

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
        // Process the data to ensure fields is properly handled
        const processedData = data?.map(exercise => {
          // Ensure fields is an object, not a string
          let fields = exercise.fields
          
          // If fields is a string, try to parse it
          if (typeof fields === 'string') {
            try {
              fields = JSON.parse(fields)
            } catch (e) {
              console.error(`Error parsing fields for exercise ${exercise.id}:`, e)
              fields = {} // Fallback to empty object
            }
          }
          
          return {
            ...exercise,
            fields
          }
        }) || BOOK_EXERCISES
        
        setExercises(processedData)
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