import React, { useState } from 'react'
import { Copy, Star, Clock, Zap, BookOpen, Check, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import type { PromptTemplate } from '@/data/promptLibrary'
import Badge from '@/components/ui/Badge'

interface PromptLibraryCardProps {
  prompt: PromptTemplate
  onSave?: (id: string) => void
  onUse?: (id: string) => void
  isSaved?: boolean
  showRatings?: boolean
}

export default function PromptLibraryCard({
  prompt,
  onSave,
  onUse,
  isSaved = false,
  showRatings = true
}: PromptLibraryCardProps) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.prompt_template)
      setCopied(true)
      toast.success('Prompt copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy prompt')
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'Intermediate':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'Advanced':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'Productivity': <Zap className="w-4 h-4" />,
      'Communication': <MessageSquare className="w-4 h-4" />,
      'Content Creation': <BookOpen className="w-4 h-4" />,
      'Learning': <BookOpen className="w-4 h-4" />,
      'Decision Making': <Target className="w-4 h-4" />,
      'Personal Development': <User className="w-4 h-4" />,
      'Business': <TrendingUp className="w-4 h-4" />,
      'Health': <Heart className="w-4 h-4" />,
      'Creativity': <Lightbulb className="w-4 h-4" />,
      'Research': <Search className="w-4 h-4" />
    }
    return iconMap[category] || <BookOpen className="w-4 h-4" />
  }

  const shouldTruncate = prompt.prompt_template.length > 200

  return (
    <div className="card group hover:shadow-lg transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
            {getCategoryIcon(prompt.category)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
              {prompt.title}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="default" size="sm">{prompt.category}</Badge>
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(prompt.difficulty)}`}>
                {prompt.difficulty}
              </span>
              {prompt.is_featured && (
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleCopy}
            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
            title="Copy prompt"
          >
            {copied ? (
              <Check className="w-4 h-4 text-success-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>

          {onSave && (
            <button
              onClick={() => onSave(prompt.id)}
              disabled={isSaved}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                isSaved
                  ? 'text-success-600 bg-success-50'
                  : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
              }`}
              title={isSaved ? 'Already saved' : 'Save to library'}
            >
              <Star className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          )}

          {onUse && (
            <button
              onClick={() => onUse(prompt.id)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              title="Use this prompt"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Prompt Content */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-700 whitespace-pre-wrap">
          {shouldTruncate && !expanded 
            ? `${prompt.prompt_template.substring(0, 200)}...`
            : prompt.prompt_template
          }
        </p>
        {shouldTruncate && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-primary-600 hover:text-primary-500 text-sm font-medium mt-2"
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>

      {/* Usage Context */}
      <div className="space-y-3 mb-4">
        <div className="flex items-start">
          <Clock className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-sm font-medium text-gray-700">When to use:</div>
            <div className="text-sm text-gray-600">{prompt.when_to_use}</div>
          </div>
        </div>
        
        <div className="flex items-start">
          <Zap className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-sm font-medium text-gray-700">Why it works:</div>
            <div className="text-sm text-gray-600">{prompt.why_it_works}</div>
          </div>
        </div>
      </div>

      {/* Tags */}
      {prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {prompt.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Usage Stats */}
      {showRatings && (
        <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <span>Rating: {prompt.rating}/5</span>
            <span>Used: {prompt.times_used} times</span>
          </div>
          <span className="text-xs">
            By {prompt.author}
          </span>
        </div>
      )}
    </div>
  )
}