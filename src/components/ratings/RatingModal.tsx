import React, { useState } from 'react'
import { X, Star, Clock, CheckCircle, MessageSquare } from 'lucide-react'
import { RATING_DIMENSIONS, FEEDBACK_TYPES } from '@/types/ratings'
import type { RatingDimension, PromptFeedback } from '@/types/ratings'

interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  promptId: string
  promptType: 'book' | 'user'
  promptTitle: string
  onSubmit: (rating: RatingDimension, feedback?: Partial<PromptFeedback>) => Promise<void>
  existingRating?: RatingDimension
}

export default function RatingModal({
  isOpen,
  onClose,
  promptId,
  promptType,
  promptTitle,
  onSubmit,
  existingRating
}: RatingModalProps) {
  const [ratings, setRatings] = useState<RatingDimension>(
    existingRating || {
      effectiveness: 0,
      clarity: 0,
      timeValue: 0
    }
  )
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedback, setFeedback] = useState({
    feedback_type: 'SUCCESS_STORY' as keyof typeof FEEDBACK_TYPES,
    title: '',
    content: '',
    is_public: true
  })
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleRatingChange = (dimension: keyof RatingDimension, value: number) => {
    setRatings(prev => ({ ...prev, [dimension]: value }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const feedbackData = showFeedback && feedback.content.trim() 
        ? {
            ...feedback,
            prompt_id: promptId,
            prompt_type: promptType
          }
        : undefined

      await onSubmit(ratings, feedbackData)
      onClose()
    } catch (error) {
      console.error('Error submitting rating:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const isValid = ratings.effectiveness > 0 && ratings.clarity > 0 && ratings.timeValue > 0
  const overallScore = Math.round(
    (ratings.effectiveness * RATING_DIMENSIONS.effectiveness.weight +
     ratings.clarity * RATING_DIMENSIONS.clarity.weight +
     ratings.timeValue * RATING_DIMENSIONS.timeValue.weight) * 5
  ) / 5

  const renderStarRating = (dimension: keyof RatingDimension, value: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRatingChange(dimension, star)}
            className="focus:outline-none"
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                star <= value
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300 hover:text-yellow-200'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Rate This Prompt</h2>
              <p className="text-gray-600 mt-1">{promptTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Rating Dimensions */}
          <div className="space-y-6">
            {Object.entries(RATING_DIMENSIONS).map(([key, dimension]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{dimension.question}</h3>
                    <p className="text-sm text-gray-600">{dimension.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {renderStarRating(key as keyof RatingDimension, ratings[key as keyof RatingDimension])}
                    <span className="text-sm text-gray-500 w-8">
                      {ratings[key as keyof RatingDimension] || '-'}/5
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Overall Score */}
          {isValid && (
            <div className="bg-primary-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-primary-900">Overall Score</h3>
                  <p className="text-sm text-primary-700">Weighted average based on importance</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= overallScore
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-primary-900">
                    {overallScore.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Feedback Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Share Your Experience (Optional)</h3>
              <button
                onClick={() => setShowFeedback(!showFeedback)}
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                {showFeedback ? 'Hide' : 'Add Feedback'}
              </button>
            </div>

            {showFeedback && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(FEEDBACK_TYPES).map(([key, type]) => (
                      <button
                        key={key}
                        onClick={() => setFeedback(prev => ({ 
                          ...prev, 
                          feedback_type: key as keyof typeof FEEDBACK_TYPES 
                        }))}
                        className={`p-3 text-left rounded-lg border transition-colors ${
                          feedback.feedback_type === key
                            ? 'border-primary-300 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span>{type.icon}</span>
                          <span className="font-medium">{type.label}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{type.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={feedback.title}
                    onChange={(e) => setFeedback(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief summary of your experience"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Details
                  </label>
                  <textarea
                    value={feedback.content}
                    onChange={(e) => setFeedback(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Share your experience, modifications, or suggestions..."
                    rows={4}
                    className="input-field"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="public-feedback"
                    checked={feedback.is_public}
                    onChange={(e) => setFeedback(prev => ({ ...prev, is_public: e.target.checked }))}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="public-feedback" className="ml-2 text-sm text-gray-700">
                    Make this feedback public to help other users
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className="btn-primary flex items-center"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                {existingRating ? 'Update Rating' : 'Submit Rating'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}