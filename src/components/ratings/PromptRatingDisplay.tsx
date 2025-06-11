import React from 'react'
import { Star, Users, TrendingUp, Clock, Target, Zap } from 'lucide-react'
import type { RatingStats } from '@/types/ratings'
import Badge from '@/components/ui/Badge'

interface PromptRatingDisplayProps {
  stats: RatingStats
  showDetailed?: boolean
  className?: string
}

export default function PromptRatingDisplay({ 
  stats, 
  showDetailed = false, 
  className = '' 
}: PromptRatingDisplayProps) {
  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    }

    return (
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const renderDistributionBar = (count: number, total: number) => {
    const percentage = total > 0 ? (count / total) * 100 : 0
    return (
      <div className="flex items-center space-x-2">
        <div className="w-24 bg-gray-200 rounded-full h-2">
          <div
            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs text-gray-600 w-8">{count}</span>
      </div>
    )
  }

  if (stats.total_ratings === 0) {
    return (
      <div className={`text-gray-500 text-sm ${className}`}>
        No ratings yet
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Overall Rating */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {renderStars(Math.round(stats.average_overall), 'md')}
          <span className="font-semibold text-gray-900">
            {stats.average_overall.toFixed(1)}
          </span>
          <span className="text-sm text-gray-500">
            ({stats.total_ratings} {stats.total_ratings === 1 ? 'rating' : 'ratings'})
          </span>
        </div>
        
        {/* Success Rate */}
        <div className="flex items-center space-x-1 text-sm">
          <Target className="w-4 h-4 text-green-600" />
          <span className="text-green-600 font-medium">
            {Math.round(stats.success_rate * 100)}% success rate
          </span>
        </div>
      </div>

      {/* Badges */}
      {stats.badges.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {stats.badges.map((badge, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200"
            >
              {badge}
            </span>
          ))}
        </div>
      )}

      {showDetailed && (
        <div className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Zap className="w-4 h-4 text-blue-600 mr-1" />
                <span className="font-medium text-gray-900">
                  {stats.average_effectiveness.toFixed(1)}
                </span>
              </div>
              <div className="text-gray-600">Effectiveness</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Users className="w-4 h-4 text-green-600 mr-1" />
                <span className="font-medium text-gray-900">
                  {stats.average_clarity.toFixed(1)}
                </span>
              </div>
              <div className="text-gray-600">Clarity</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Clock className="w-4 h-4 text-purple-600 mr-1" />
                <span className="font-medium text-gray-900">
                  {stats.average_time_value.toFixed(1)}
                </span>
              </div>
              <div className="text-gray-600">Time Value</div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Rating Distribution</h4>
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center space-x-2 text-sm">
                <span className="w-4 text-gray-600">{rating}</span>
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                {renderDistributionBar(
                  stats.distribution[rating as keyof typeof stats.distribution], 
                  stats.total_ratings
                )}
              </div>
            ))}
          </div>

          {/* Trending Indicator */}
          {stats.trending_score > 0 && (
            <div className="flex items-center space-x-2 text-sm">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <span className="text-orange-600 font-medium">
                Trending Score: {stats.trending_score}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}