import React from 'react'
import { Star, Users, TrendingUp } from 'lucide-react'
import type { RatingStats } from '@/types/ratings'

interface RatingDisplayProps {
  stats: RatingStats
  showDetailed?: boolean
  className?: string
}

export default function RatingDisplay({ stats, showDetailed = false, className = '' }: RatingDisplayProps) {
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
      <div className="flex items-center space-x-2 mb-2">
        {renderStars(Math.round(stats.average_overall), 'md')}
        <span className="font-medium text-gray-900">
          {stats.average_overall.toFixed(1)}
        </span>
        <span className="text-sm text-gray-500">
          ({stats.total_ratings} {stats.total_ratings === 1 ? 'rating' : 'ratings'})
        </span>
      </div>

      {showDetailed && (
        <div className="space-y-3">
          {/* Dimension Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Effectiveness</span>
              <div className="flex items-center space-x-1">
                {renderStars(Math.round(stats.average_effectiveness), 'sm')}
                <span className="text-gray-900 font-medium">
                  {stats.average_effectiveness.toFixed(1)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Clarity</span>
              <div className="flex items-center space-x-1">
                {renderStars(Math.round(stats.average_clarity), 'sm')}
                <span className="text-gray-900 font-medium">
                  {stats.average_clarity.toFixed(1)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Time Value</span>
              <div className="flex items-center space-x-1">
                {renderStars(Math.round(stats.average_time_value), 'sm')}
                <span className="text-gray-900 font-medium">
                  {stats.average_time_value.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Rating Distribution</h4>
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center space-x-2 text-sm">
                <span className="w-4 text-gray-600">{rating}</span>
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                {renderDistributionBar(stats.distribution[rating as keyof typeof stats.distribution], stats.total_ratings)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}