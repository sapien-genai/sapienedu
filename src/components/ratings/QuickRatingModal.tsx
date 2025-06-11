import React, { useState } from 'react'
import { X, Star, Clock, CheckCircle, MessageSquare, Share2 } from 'lucide-react'
import { toast } from 'sonner'

interface QuickRatingModalProps {
  isOpen: boolean
  onClose: () => void
  promptId: string
  promptType: 'book' | 'user' | 'library'
  promptTitle: string
  onSubmit: (rating: number, feedback?: string, shareStory?: boolean) => Promise<void>
}

export default function QuickRatingModal({
  isOpen,
  onClose,
  promptId,
  promptType,
  promptTitle,
  onSubmit
}: QuickRatingModalProps) {
  const [rating, setRating] = useState(0)
  const [showDetailedFeedback, setShowDetailedFeedback] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [shareStory, setShareStory] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleRatingSelect = (selectedRating: number) => {
    setRating(selectedRating)
    // Show detailed feedback for extreme ratings (1-2 or 5 stars)
    if (selectedRating <= 2 || selectedRating === 5) {
      setShowDetailedFeedback(true)
    } else {
      setShowDetailedFeedback(false)
    }
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(rating, feedback || undefined, shareStory)
      toast.success('Thank you for your feedback!')
      onClose()
      
      // Reset form
      setRating(0)
      setFeedback('')
      setShareStory(false)
      setShowDetailedFeedback(false)
    } catch (error) {
      console.error('Error submitting rating:', error)
      toast.error('Failed to submit rating')
    } finally {
      setSubmitting(false)
    }
  }

  const getFeedbackQuestion = () => {
    if (rating === 5) {
      return "What made this prompt especially helpful?"
    } else if (rating <= 2) {
      return "What could make this prompt better?"
    }
    return ""
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Rate This Prompt</h2>
              <p className="text-gray-600 mt-1 text-sm">{promptTitle}</p>
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
          {/* Quick Rating */}
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              How helpful was this prompt?
            </h3>
            <div className="flex justify-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRatingSelect(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300 hover:text-yellow-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600">
                {rating === 1 && "Not helpful"}
                {rating === 2 && "Somewhat helpful"}
                {rating === 3 && "Moderately helpful"}
                {rating === 4 && "Very helpful"}
                {rating === 5 && "Extremely helpful"}
              </p>
            )}
          </div>

          {/* Detailed Feedback for extreme ratings */}
          {showDetailedFeedback && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getFeedbackQuestion()}
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your experience..."
                  rows={3}
                  className="input-field"
                />
              </div>

              {/* Success Story Sharing for 5-star ratings */}
              {rating === 5 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="share-story"
                      checked={shareStory}
                      onChange={(e) => setShareStory(e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor="share-story" className="ml-2 text-sm text-green-800">
                      <div className="flex items-center">
                        <Share2 className="w-4 h-4 mr-1" />
                        Share your success story (anonymously)
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        Earn badges and help others learn from your experience
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Benefits Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center text-blue-800 text-sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span>Your feedback helps improve prompts for everyone</span>
            </div>
            <div className="flex items-center text-blue-600 text-xs mt-1">
              <Star className="w-3 h-3 mr-1" />
              <span>Earn 10 points for rating • Build your community reputation</span>
            </div>
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
            disabled={rating === 0 || submitting}
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
                Submit Rating
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}