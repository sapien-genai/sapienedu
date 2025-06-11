import React, { useState } from 'react'
import { Copy, Star, BookOpen, MessageSquare, BarChart3, Check } from 'lucide-react'
import { usePromptRatings, usePromptFeedback } from '@/hooks/useRatings'
import RatingModal from '@/components/ratings/RatingModal'
import RatingDisplay from '@/components/ratings/RatingDisplay'
import FeedbackList from '@/components/ratings/FeedbackList'
import Badge from '@/components/ui/Badge'
import { toast } from 'sonner'
import type { BookPrompt } from '@/data/bookContent'
import type { RatingDimension, PromptFeedback } from '@/types/ratings'

interface PromptCardProps {
  prompt: BookPrompt | {
    id: string
    title: string
    prompt_text: string
    category: string
    success_rating: number
    notes: string | null
    created_at: string
  }
  promptType: 'book' | 'user'
  onSave?: (id: string) => void
  onEdit?: (prompt: any) => void
  onDelete?: (id: string) => void
  isSaved?: boolean
  showRatings?: boolean
  showFeedback?: boolean
}

export default function PromptCard({
  prompt,
  promptType,
  onSave,
  onEdit,
  onDelete,
  isSaved = false,
  showRatings = true,
  showFeedback = false
}: PromptCardProps) {
  const [copied, setCopied] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [showFeedbackSection, setShowFeedbackSection] = useState(showFeedback)

  const { stats, userRating, submitRating } = usePromptRatings(prompt.id, promptType)
  const { feedback, submitFeedback, markHelpful } = usePromptFeedback(prompt.id, promptType)

  const isBookPrompt = promptType === 'book'
  const promptText = isBookPrompt ? (prompt as BookPrompt).prompt : (prompt as any).prompt_text

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promptText)
      setCopied(true)
      toast.success('Prompt copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy prompt')
    }
  }

  const handleRatingSubmit = async (rating: RatingDimension, feedbackData?: Partial<PromptFeedback>) => {
    try {
      await submitRating(rating)
      
      if (feedbackData && feedbackData.content?.trim()) {
        await submitFeedback(feedbackData)
      }
      
      toast.success(userRating ? 'Rating updated!' : 'Rating submitted!')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <div className="card group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
            isBookPrompt 
              ? 'bg-primary-100 text-primary-600' 
              : 'bg-success-100 text-success-600'
          }`}>
            {isBookPrompt ? <BookOpen className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{prompt.title}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="default" size="sm">{prompt.category}</Badge>
              {isBookPrompt && (
                <span className="text-xs text-gray-500">
                  Chapter {(prompt as BookPrompt).chapter}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleCopy}
            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
            title="Copy prompt"
          >
            {copied ? (
              <Check className="w-4 h-4 text-success-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          
          {showRatings && (
            <button
              onClick={() => setShowRatingModal(true)}
              className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg"
              title={userRating ? 'Update rating' : 'Rate this prompt'}
            >
              <Star className={`w-4 h-4 ${userRating ? 'text-yellow-600 fill-current' : ''}`} />
            </button>
          )}
          
          {onSave && (
            <button
              onClick={() => onSave(prompt.id)}
              disabled={isSaved}
              className={`p-2 rounded-lg ${
                isSaved
                  ? 'text-success-600 bg-success-50'
                  : 'text-gray-400 hover:text-success-600 hover:bg-success-50'
              }`}
              title={isSaved ? 'Already saved' : 'Save to library'}
            >
              {isSaved ? (
                <Check className="w-4 h-4" />
              ) : (
                <Star className="w-4 h-4" />
              )}
            </button>
          )}
          
          {feedback.length > 0 && (
            <button
              onClick={() => setShowFeedbackSection(!showFeedbackSection)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
              title="View feedback"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Rating Display */}
      {showRatings && stats && (
        <div className="mb-4">
          <RatingDisplay stats={stats} />
        </div>
      )}

      {/* Prompt Content */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-4">
          {promptText}
        </p>
      </div>

      {/* Tags (for book prompts) */}
      {isBookPrompt && (prompt as BookPrompt).tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {(prompt as BookPrompt).tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Pro Tip (for book prompts) */}
      {isBookPrompt && (prompt as BookPrompt).pro_tip && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-3">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>💡 Pro Tip:</strong> {(prompt as BookPrompt).pro_tip}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* User Prompt Rating (for user prompts) */}
      {!isBookPrompt && (prompt as any).success_rating && (
        <div className="flex items-center mb-3">
          <div className="flex items-center mr-2">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < (prompt as any).success_rating 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {(prompt as any).success_rating}/5
          </span>
        </div>
      )}

      {/* Notes (for user prompts) */}
      {!isBookPrompt && (prompt as any).notes && (
        <div className="text-sm text-gray-600 mb-3">
          <strong>Notes:</strong> {(prompt as any).notes}
        </div>
      )}

      {/* Feedback Section */}
      {showFeedbackSection && feedback.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Community Feedback</h4>
          <FeedbackList 
            feedback={feedback} 
            onHelpful={markHelpful}
          />
        </div>
      )}

      {/* Footer */}
      <div className="text-xs text-gray-500 mt-4">
        {isBookPrompt ? (
          `From the book`
        ) : (
          `Created ${new Date((prompt as any).created_at).toLocaleDateString()}`
        )}
      </div>

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        promptId={prompt.id}
        promptType={promptType}
        promptTitle={prompt.title}
        onSubmit={handleRatingSubmit}
        existingRating={userRating?.dimensions}
      />
    </div>
  )
}