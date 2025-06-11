import React from 'react'
import { CheckCircle, Clock, Target, ChevronRight, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from '@/components/ui/Badge'
import type { BookExercise } from '@/data/bookContent'

interface ExerciseCardProps {
  exercise: BookExercise
  isCompleted?: boolean
  completedAt?: string
  className?: string
}

export default function ExerciseCard({
  exercise,
  isCompleted = false,
  completedAt,
  className = ''
}: ExerciseCardProps) {
  const getExerciseTypeLabel = (type: string) => {
    const typeLabels: { [key: string]: string } = {
      assessment: 'Assessment',
      timeTracking: 'Time Tracking',
      promptBuilder: 'Prompt Building',
      goals: 'Goal Setting',
      reflection: 'Reflection',
      habits: 'Habit Tracking',
      text_input: 'Text Input',
      planning: 'Planning',
      tracking: 'Progress Tracking'
    }
    return typeLabels[type] || type.replace(/([A-Z])/g, ' $1').toLowerCase()
  }

  const getExerciseTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      assessment: 'bg-blue-50 text-blue-700 border-blue-200',
      timeTracking: 'bg-green-50 text-green-700 border-green-200',
      promptBuilder: 'bg-purple-50 text-purple-700 border-purple-200',
      goals: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      reflection: 'bg-pink-50 text-pink-700 border-pink-200',
      habits: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      text_input: 'bg-gray-50 text-gray-700 border-gray-200',
      planning: 'bg-orange-50 text-orange-700 border-orange-200',
      tracking: 'bg-teal-50 text-teal-700 border-teal-200'
    }
    return colors[type] || 'bg-gray-50 text-gray-700 border-gray-200'
  }

  const getFieldCount = () => {
    if (!exercise.fields || typeof exercise.fields !== 'object') return 0
    
    let count = 0
    Object.values(exercise.fields).forEach((fieldConfig: any) => {
      if (Array.isArray(fieldConfig)) {
        count += fieldConfig.length
      } else if (fieldConfig.questions) {
        count += fieldConfig.questions.length
      } else {
        count += 1
      }
    })
    return count
  }

  const fieldCount = getFieldCount()

  return (
    <Link
      to={`/exercises/${exercise.id}`}
      className={`card hover:shadow-lg transition-all duration-200 group ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
            isCompleted 
              ? 'bg-success-100 text-success-600' 
              : 'bg-gray-100 text-gray-400'
          }`}>
            {isCompleted ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <Target className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">
              Chapter {exercise.chapter} • Exercise {exercise.exercise_number}
            </div>
            <div className="flex items-center space-x-2">
              <Badge 
                variant={isCompleted ? 'success' : 'default'} 
                size="sm"
              >
                {isCompleted ? 'Completed' : 'Not Started'}
              </Badge>
            </div>
          </div>
        </div>
        
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-200">
        {exercise.title}
      </h3>
      
      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {exercise.description}
      </p>

      {/* Exercise Details */}
      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getExerciseTypeColor(exercise.type)}`}>
          {getExerciseTypeLabel(exercise.type)}
        </span>
        
        <div className="flex items-center text-xs text-gray-500">
          <Target className="w-3 h-3 mr-1" />
          <span>{fieldCount} {fieldCount === 1 ? 'field' : 'fields'}</span>
        </div>
      </div>

      {/* Completion Info */}
      {isCompleted && completedAt && (
        <div className="flex items-center text-xs text-success-600 bg-success-50 rounded-lg p-2">
          <Calendar className="w-3 h-3 mr-1" />
          <span>Completed on {new Date(completedAt).toLocaleDateString()}</span>
        </div>
      )}

      {/* Progress Indicator */}
      {!isCompleted && (
        <div className="flex items-center text-xs text-gray-500">
          <Clock className="w-3 h-3 mr-1" />
          <span>Ready to start</span>
        </div>
      )}
    </Link>
  )
}