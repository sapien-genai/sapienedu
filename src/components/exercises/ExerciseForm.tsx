import React, { useState, useEffect } from 'react'
import { Save, CheckCircle } from 'lucide-react'
import { AI_READINESS_CATEGORIES, AIReadinessScoring } from '@/data/aiReadinessAssessment'
import AIReadinessResults from './AIReadinessResults'
import TimeTrackingExercise from './TimeTrackingExercise'
import CompetitorAnalysisExercise from './CompetitorAnalysisExercise'
import WeeklyAIHabitTracker from './WeeklyAIHabitTracker'
import ROICalculator from './ROICalculator'
import type { BookExercise } from '@/data/bookContent'

interface ExerciseFormProps {
  exercise: BookExercise
  initialData?: any
  onSubmit: (data: any) => Promise<void>
  submitting: boolean
  isUpdate?: boolean
}

export default function ExerciseForm({
  exercise,
  initialData,
  onSubmit,
  submitting,
  isUpdate = false
}: ExerciseFormProps) {
  const [formData, setFormData] = useState<any>({})
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [showResults, setShowResults] = useState(false)

  const isAIReadinessAssessment = exercise.id === 'ch1-ex1' || exercise.type === 'assessment'
  const isTimeTracking = exercise.type === 'timeTracking' || exercise.type === 'tracking'
  const isCompetitorAnalysis = exercise.type === 'competitorAnalysis' || exercise.id.includes('competitor')
  const isHabitTracker = exercise.type === 'habits' || exercise.id.includes('habit')
  const isROICalculator = exercise.type === 'roiCalculator' || exercise.id.includes('roi')

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
      // Show results if this is an AI readiness assessment and we have data
      if (isAIReadinessAssessment && Object.keys(initialData).length > 0) {
        setShowResults(true)
      }
    } else {
      // Initialize form with default values
      const defaultData: any = {}
      if (exercise.fields && typeof exercise.fields === 'object') {
        Object.entries(exercise.fields).forEach(([key, fieldConfig]: [string, any]) => {
          if (Array.isArray(fieldConfig)) {
            // Handle array of field configurations
            fieldConfig.forEach((field, index) => {
              const fieldKey = `${key}_${index}`
              defaultData[fieldKey] = getDefaultValue(field)
            })
          } else if (fieldConfig.questions) {
            // Handle questions array (for assessments)
            fieldConfig.questions.forEach((question: any, index: number) => {
              defaultData[question.id] = getDefaultValue(question)
            })
          } else {
            defaultData[key] = getDefaultValue(fieldConfig)
          }
        })
      }
      setFormData(defaultData)
    }
  }, [exercise, initialData, isAIReadinessAssessment])

  const getDefaultValue = (field: any) => {
    switch (field.type) {
      case 'number':
        return field.min || 0
      case 'scale':
      case 'rating':
        return 0
      case 'checkbox':
        return false
      case 'select':
        return field.options?.[0] || ''
      default:
        return ''
    }
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }))
    }
  }

  const handleTimeTrackingChange = (data: any) => {
    setFormData(data)
  }

  const handleCompetitorAnalysisChange = (data: any) => {
    setFormData(data)
  }

  const handleHabitTrackerChange = (data: any) => {
    setFormData(data)
  }

  const handleROICalculatorChange = (data: any) => {
    setFormData(data)
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (exercise.fields && typeof exercise.fields === 'object') {
      Object.entries(exercise.fields).forEach(([key, fieldConfig]: [string, any]) => {
        if (Array.isArray(fieldConfig)) {
          fieldConfig.forEach((field, index) => {
            const fieldKey = `${key}_${index}`
            if (field.required && (!formData[fieldKey] || formData[fieldKey] === '')) {
              newErrors[fieldKey] = 'This field is required'
            }
          })
        } else if (fieldConfig.questions) {
          fieldConfig.questions.forEach((question: any) => {
            if (question.required && (!formData[question.id] || formData[question.id] === '')) {
              newErrors[question.id] = 'This field is required'
            }
          })
        } else {
          if (fieldConfig.required && (!formData[key] || formData[key] === '')) {
            newErrors[key] = 'This field is required'
          }
        }
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isTimeTracking && !isCompetitorAnalysis && !isHabitTracker && !isROICalculator && !validateForm()) {
      return
    }

    await onSubmit(formData)
    
    // Show results for AI readiness assessment
    if (isAIReadinessAssessment) {
      setShowResults(true)
    }
  }

  const renderAIReadinessAssessment = () => {
    const currentCategoryIndex = Math.floor(Object.keys(formData).length / 4)
    const currentCategory = AI_READINESS_CATEGORIES[currentCategoryIndex] || AI_READINESS_CATEGORIES[0]
    const progress = (Object.keys(formData).filter(key => formData[key] > 0).length / 16) * 100

    return (
      <div className="space-y-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Assessment Progress</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary-500 to-success-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Categories */}
        {AI_READINESS_CATEGORIES.map((category, categoryIndex) => (
          <div key={category.id} className="space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
              <span className="text-3xl">{category.icon}</span>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-600">
                  Rate each statement from 0 (never/strongly disagree) to 3 (always/strongly agree)
                </p>
              </div>
            </div>

            {category.questions.map((question, questionIndex) => {
              const value = formData[question.id] || 0
              const error = errors[question.id]

              return (
                <div key={question.id} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-500">
                          Question {categoryIndex * 4 + questionIndex + 1} of 16
                        </span>
                        {question.weight !== 1 && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            High Impact
                          </span>
                        )}
                      </div>
                      <p className="text-lg text-gray-900 font-medium">{question.text}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Never / Strongly Disagree</span>
                    <div className="flex space-x-3">
                      {[0, 1, 2, 3].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => handleFieldChange(question.id, rating)}
                          className={`w-12 h-12 rounded-full border-2 text-sm font-semibold transition-all duration-200 ${
                            value === rating
                              ? 'border-primary-500 bg-primary-500 text-white shadow-lg scale-110'
                              : 'border-gray-300 text-gray-700 hover:border-primary-300 hover:scale-105'
                          }`}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">Always / Strongly Agree</span>
                  </div>

                  {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  const renderField = (field: any, fieldId: string, label?: string) => {
    const value = formData[fieldId] || getDefaultValue(field)
    const error = errors[fieldId]

    switch (field.type) {
      case 'text':
        return (
          <div key={fieldId} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {label || field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleFieldChange(fieldId, e.target.value)}
              placeholder={field.placeholder}
              className={`input-field ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )

      case 'textarea':
        return (
          <div key={fieldId} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {label || field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleFieldChange(fieldId, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              className={`input-field ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )

      case 'number':
        return (
          <div key={fieldId} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {label || field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => handleFieldChange(fieldId, parseInt(e.target.value) || 0)}
              min={field.min}
              max={field.max}
              className={`input-field ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )

      case 'scale':
      case 'rating':
        const scaleMax = field.scale || field.max || 5
        return (
          <div key={fieldId} className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              {label || field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">0</span>
              <div className="flex space-x-2">
                {Array.from({ length: scaleMax + 1 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleFieldChange(fieldId, i)}
                    className={`w-10 h-10 rounded-full border-2 text-sm font-medium transition-colors ${
                      value === i
                        ? 'border-primary-500 bg-primary-500 text-white'
                        : 'border-gray-300 text-gray-700 hover:border-primary-300'
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
              <span className="text-sm text-gray-500">{scaleMax}</span>
            </div>
            {field.description && (
              <p className="text-sm text-gray-600">{field.description}</p>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )

      case 'select':
        return (
          <div key={fieldId} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {label || field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleFieldChange(fieldId, e.target.value)}
              className={`input-field ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
            >
              <option value="">Select an option</option>
              {field.options?.map((option: string, index: number) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )

      case 'checkbox':
        return (
          <div key={fieldId} className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id={fieldId}
                checked={value}
                onChange={(e) => handleFieldChange(fieldId, e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor={fieldId} className="ml-2 text-sm text-gray-700">
                {label || field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )

      default:
        return null
    }
  }

  const renderFormFields = () => {
    if (!exercise.fields || typeof exercise.fields !== 'object') {
      return <div className="text-gray-500">No form fields configured for this exercise.</div>
    }

    // Special handling for AI Readiness Assessment
    if (isAIReadinessAssessment) {
      return renderAIReadinessAssessment()
    }

    // Special handling for Time Tracking
    if (isTimeTracking) {
      return (
        <TimeTrackingExercise
          initialData={formData}
          onDataChange={handleTimeTrackingChange}
        />
      )
    }

    // Special handling for Competitor Analysis
    if (isCompetitorAnalysis) {
      return (
        <CompetitorAnalysisExercise
          initialData={formData}
          onDataChange={handleCompetitorAnalysisChange}
        />
      )
    }

    // Special handling for Habit Tracker
    if (isHabitTracker) {
      return (
        <WeeklyAIHabitTracker
          initialData={formData}
          onDataChange={handleHabitTrackerChange}
        />
      )
    }

    // Special handling for ROI Calculator
    if (isROICalculator) {
      return (
        <ROICalculator
          initialData={formData}
          onDataChange={handleROICalculatorChange}
        />
      )
    }

    const fields: React.ReactNode[] = []

    Object.entries(exercise.fields).forEach(([key, fieldConfig]: [string, any]) => {
      if (Array.isArray(fieldConfig)) {
        // Handle array of field configurations
        fieldConfig.forEach((field, index) => {
          const fieldKey = `${key}_${index}`
          fields.push(renderField(field, fieldKey))
        })
      } else if (fieldConfig.questions) {
        // Handle questions array (for assessments)
        fields.push(
          <div key={key} className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Assessment Questions
            </h3>
            {fieldConfig.questions.map((question: any, index: number) => (
              <div key={question.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-sm font-medium text-gray-500">
                    Question {index + 1} of {fieldConfig.questions.length}
                  </span>
                </div>
                {renderField(question, question.id, question.label)}
              </div>
            ))}
          </div>
        )
      } else {
        // Handle single field configuration
        fields.push(renderField(fieldConfig, key))
      }
    })

    return fields
  }

  // Show results if this is an AI readiness assessment and we have results
  if (isAIReadinessAssessment && showResults && Object.keys(formData).length > 0) {
    return (
      <AIReadinessResults 
        responses={formData}
        onRetake={() => setShowResults(false)}
      />
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {renderFormFields()}

      {!isTimeTracking && !isCompetitorAnalysis && !isHabitTracker && !isROICalculator && (
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex items-center"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isUpdate ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              <>
                {isUpdate ? <Save className="w-4 h-4 mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                {isUpdate ? 'Update Response' : 'Complete Exercise'}
              </>
            )}
          </button>
        </div>
      )}
    </form>
  )
}