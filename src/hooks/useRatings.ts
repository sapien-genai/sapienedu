import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getUser } from '@/lib/auth'
import type { PromptRating, PromptFeedback, RatingStats, RatingDimension } from '@/types/ratings'
import { RATING_DIMENSIONS } from '@/types/ratings'

export function usePromptRatings(promptId: string, promptType: 'book' | 'user') {
  const [ratings, setRatings] = useState<PromptRating[]>([])
  const [userRating, setUserRating] = useState<PromptRating | null>(null)
  const [stats, setStats] = useState<RatingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRatings()
  }, [promptId, promptType])

  const loadRatings = async () => {
    try {
      setLoading(true)
      
      // Load all ratings for this prompt
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('prompt_ratings')
        .select('*')
        .eq('prompt_id', promptId)
        .eq('prompt_type', promptType)

      if (ratingsError) throw ratingsError

      setRatings(ratingsData || [])

      // Load user's rating if authenticated
      const user = await getUser()
      if (user) {
        const userRatingData = ratingsData?.find(r => r.user_id === user.id)
        setUserRating(userRatingData || null)
      }

      // Calculate stats
      if (ratingsData && ratingsData.length > 0) {
        const stats = calculateRatingStats(ratingsData)
        setStats(stats)
      } else {
        setStats(null)
      }

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const submitRating = async (dimensions: RatingDimension) => {
    try {
      const user = await getUser()
      if (!user) throw new Error('Must be authenticated to rate')

      // Calculate overall score
      const overall_score = 
        dimensions.effectiveness * RATING_DIMENSIONS.effectiveness.weight +
        dimensions.clarity * RATING_DIMENSIONS.clarity.weight +
        dimensions.timeValue * RATING_DIMENSIONS.timeValue.weight

      const ratingData = {
        user_id: user.id,
        prompt_id: promptId,
        prompt_type: promptType,
        dimensions,
        overall_score: Math.round(overall_score * 100) / 100
      }

      if (userRating) {
        // Update existing rating
        const { error } = await supabase
          .from('prompt_ratings')
          .update(ratingData)
          .eq('id', userRating.id)

        if (error) throw error
      } else {
        // Create new rating
        const { error } = await supabase
          .from('prompt_ratings')
          .insert(ratingData)

        if (error) throw error
      }

      await loadRatings()
    } catch (err: any) {
      throw new Error(`Failed to submit rating: ${err.message}`)
    }
  }

  return {
    ratings,
    userRating,
    stats,
    loading,
    error,
    submitRating,
    refetch: loadRatings
  }
}

export function usePromptFeedback(promptId: string, promptType: 'book' | 'user') {
  const [feedback, setFeedback] = useState<PromptFeedback[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadFeedback()
  }, [promptId, promptType])

  const loadFeedback = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('prompt_feedback')
        .select('*')
        .eq('prompt_id', promptId)
        .eq('prompt_type', promptType)
        .eq('is_public', true)
        .order('helpful_count', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      setFeedback(data || [])

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const submitFeedback = async (feedbackData: Partial<PromptFeedback>) => {
    try {
      const user = await getUser()
      if (!user) throw new Error('Must be authenticated to submit feedback')

      const { error } = await supabase
        .from('prompt_feedback')
        .insert({
          ...feedbackData,
          user_id: user.id,
          prompt_id: promptId,
          prompt_type: promptType,
          helpful_count: 0
        })

      if (error) throw error
      await loadFeedback()
    } catch (err: any) {
      throw new Error(`Failed to submit feedback: ${err.message}`)
    }
  }

  const markHelpful = async (feedbackId: string) => {
    try {
      const { error } = await supabase.rpc('increment_feedback_helpful', {
        feedback_id: feedbackId
      })

      if (error) throw error
      await loadFeedback()
    } catch (err: any) {
      console.error('Failed to mark feedback as helpful:', err.message)
    }
  }

  return {
    feedback,
    loading,
    error,
    submitFeedback,
    markHelpful,
    refetch: loadFeedback
  }
}

function calculateRatingStats(ratings: PromptRating[]): RatingStats {
  const total = ratings.length
  
  if (total === 0) {
    return {
      total_ratings: 0,
      average_overall: 0,
      average_effectiveness: 0,
      average_clarity: 0,
      average_time_value: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    }
  }

  const sums = ratings.reduce(
    (acc, rating) => ({
      overall: acc.overall + rating.overall_score,
      effectiveness: acc.effectiveness + rating.dimensions.effectiveness,
      clarity: acc.clarity + rating.dimensions.clarity,
      timeValue: acc.timeValue + rating.dimensions.timeValue
    }),
    { overall: 0, effectiveness: 0, clarity: 0, timeValue: 0 }
  )

  const distribution = ratings.reduce(
    (acc, rating) => {
      const rounded = Math.round(rating.overall_score)
      acc[rounded as keyof typeof acc] = (acc[rounded as keyof typeof acc] || 0) + 1
      return acc
    },
    { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  )

  return {
    total_ratings: total,
    average_overall: sums.overall / total,
    average_effectiveness: sums.effectiveness / total,
    average_clarity: sums.clarity / total,
    average_time_value: sums.timeValue / total,
    distribution
  }
}