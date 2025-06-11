import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getUser } from '@/lib/auth'
import type { QuickRating, SuccessStory } from '@/types/ratings'

export function useQuickRating() {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitQuickRating = async (
    promptId: string,
    promptType: 'book' | 'user' | 'library',
    rating: number,
    feedback?: string,
    shareStory?: boolean
  ) => {
    setSubmitting(true)
    setError(null)

    try {
      const user = await getUser()
      if (!user) throw new Error('Must be authenticated to rate')

      // Submit quick rating
      const { error: ratingError } = await supabase
        .from('quick_ratings')
        .upsert({
          user_id: user.id,
          prompt_id: promptId,
          prompt_type: promptType,
          rating
        }, {
          onConflict: 'user_id,prompt_id,prompt_type'
        })

      if (ratingError) throw ratingError

      // Submit detailed feedback if provided
      if (feedback && feedback.trim()) {
        const feedbackType = rating <= 2 ? 'ISSUE' : rating === 5 ? 'SUCCESS_STORY' : 'SUGGESTION'
        
        const { error: feedbackError } = await supabase
          .from('prompt_feedback')
          .insert({
            user_id: user.id,
            prompt_id: promptId,
            prompt_type: promptType,
            feedback_type: feedbackType,
            title: rating === 5 ? 'Great experience!' : rating <= 2 ? 'Had some issues' : 'Feedback',
            content: feedback,
            is_public: true
          })

        if (feedbackError) throw feedbackError
      }

      // Award points for rating
      await awardPoints(user.id, 'first_rating', promptId)

      // If sharing success story and rating is 5, create success story entry
      if (shareStory && rating === 5 && feedback) {
        await createSuccessStory(user.id, promptId, promptType, feedback)
      }

    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setSubmitting(false)
    }
  }

  const submitSuccessStory = async (
    promptId: string,
    promptType: 'book' | 'user' | 'library',
    story: {
      title: string
      description: string
      output_content?: string
      time_saved?: number
      is_anonymous: boolean
      is_public: boolean
    }
  ) => {
    setSubmitting(true)
    setError(null)

    try {
      const user = await getUser()
      if (!user) throw new Error('Must be authenticated to share story')

      const { error } = await supabase
        .from('success_stories')
        .insert({
          user_id: user.id,
          prompt_id: promptId,
          prompt_type: promptType,
          title: story.title,
          description: story.description,
          output_shared: !!story.output_content,
          output_content: story.output_content,
          time_saved: story.time_saved,
          is_anonymous: story.is_anonymous,
          is_public: story.is_public,
          helpful_count: 0
        })

      if (error) throw error

      // Award points for sharing success story
      await awardPoints(user.id, 'success_story', promptId)

    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setSubmitting(false)
    }
  }

  return {
    submitQuickRating,
    submitSuccessStory,
    submitting,
    error
  }
}

async function createSuccessStory(
  userId: string,
  promptId: string,
  promptType: 'book' | 'user' | 'library',
  description: string
) {
  const { error } = await supabase
    .from('success_stories')
    .insert({
      user_id: userId,
      prompt_id: promptId,
      prompt_type: promptType,
      title: 'Quick Success Story',
      description,
      output_shared: false,
      is_anonymous: true,
      is_public: true,
      helpful_count: 0
    })

  if (error) throw error
}

async function awardPoints(
  userId: string,
  actionType: string,
  promptId?: string
) {
  const pointsMap: { [key: string]: number } = {
    first_rating: 10,
    helpful_feedback: 25,
    prompt_improvement: 50,
    success_story: 30,
    community_contribution: 40
  }

  const points = pointsMap[actionType] || 10

  const { error } = await supabase
    .from('user_rewards')
    .insert({
      user_id: userId,
      action_type: actionType,
      points_earned: points,
      prompt_id: promptId
    })

  if (error) {
    console.error('Error awarding points:', error)
    // Don't throw here as it's not critical to the main flow
  }
}