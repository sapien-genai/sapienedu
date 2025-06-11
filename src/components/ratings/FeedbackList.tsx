import React, { useState } from 'react'
import { ThumbsUp, MessageSquare, Calendar, User, ChevronDown, ChevronUp } from 'lucide-react'
import { FEEDBACK_TYPES } from '@/types/ratings'
import type { PromptFeedback } from '@/types/ratings'
import Badge from '@/components/ui/Badge'

interface FeedbackListProps {
  feedback: PromptFeedback[]
  onHelpful?: (feedbackId: string) => void
  className?: string
}

export default function FeedbackList({ feedback, onHelpful, className = '' }: FeedbackListProps) {
  const [expandedFeedback, setExpandedFeedback] = useState<Set<string>>(new Set())
  const [filterType, setFilterType] = useState<string>('all')

  const toggleExpanded = (feedbackId: string) => {
    setExpandedFeedback(prev => {
      const newSet = new Set(prev)
      if (newSet.has(feedbackId)) {
        newSet.delete(feedbackId)
      } else {
        newSet.add(feedbackId)
      }
      return newSet
    })
  }

  const filteredFeedback = feedback.filter(item => 
    filterType === 'all' || item.feedback_type === filterType
  )

  const feedbackCounts = feedback.reduce((acc, item) => {
    acc[item.feedback_type] = (acc[item.feedback_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  if (feedback.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        <p>No feedback yet. Be the first to share your experience!</p>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            filterType === 'all'
              ? 'bg-primary-100 text-primary-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All ({feedback.length})
        </button>
        {Object.entries(FEEDBACK_TYPES).map(([key, type]) => {
          const count = feedbackCounts[key] || 0
          if (count === 0) return null
          
          return (
            <button
              key={key}
              onClick={() => setFilterType(key)}
              className={`px-3 py-1 text-sm rounded-full transition-colors flex items-center space-x-1 ${
                filterType === key
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{type.icon}</span>
              <span>{type.label} ({count})</span>
            </button>
          )
        })}
      </div>

      {/* Feedback Items */}
      <div className="space-y-4">
        {filteredFeedback.map((item) => {
          const isExpanded = expandedFeedback.has(item.id)
          const feedbackType = FEEDBACK_TYPES[item.feedback_type as keyof typeof FEEDBACK_TYPES]
          const shouldTruncate = item.content.length > 200

          return (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={feedbackType.color as any} 
                        size="sm"
                      >
                        {feedbackType.icon} {feedbackType.label}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {item.title && (
                      <h4 className="font-medium text-gray-900 mt-1">{item.title}</h4>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-gray-700">
                {shouldTruncate && !isExpanded ? (
                  <>
                    <p>{item.content.substring(0, 200)}...</p>
                    <button
                      onClick={() => toggleExpanded(item.id)}
                      className="text-primary-600 hover:text-primary-500 text-sm font-medium mt-2 flex items-center"
                    >
                      <ChevronDown className="w-4 h-4 mr-1" />
                      Read more
                    </button>
                  </>
                ) : (
                  <>
                    <p className="whitespace-pre-wrap">{item.content}</p>
                    {shouldTruncate && (
                      <button
                        onClick={() => toggleExpanded(item.id)}
                        className="text-primary-600 hover:text-primary-500 text-sm font-medium mt-2 flex items-center"
                      >
                        <ChevronUp className="w-4 h-4 mr-1" />
                        Show less
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={() => onHelpful?.(item.id)}
                  className="flex items-center space-x-1 text-gray-500 hover:text-primary-600 transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm">
                    Helpful {item.helpful_count > 0 && `(${item.helpful_count})`}
                  </span>
                </button>
                
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredFeedback.length === 0 && filterType !== 'all' && (
        <div className="text-center py-8 text-gray-500">
          <p>No {FEEDBACK_TYPES[filterType as keyof typeof FEEDBACK_TYPES]?.label.toLowerCase()} feedback yet.</p>
        </div>
      )}
    </div>
  )
}