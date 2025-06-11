import React, { useState } from 'react'
import { X, Star, Share2, Clock, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

interface SuccessStoryModalProps {
  isOpen: boolean
  onClose: () => void
  promptId: string
  promptType: 'book' | 'user' | 'library'
  promptTitle: string
  onSubmit: (story: {
    title: string
    description: string
    output_content?: string
    time_saved?: number
    is_anonymous: boolean
    is_public: boolean
  }) => Promise<void>
}

export default function SuccessStoryModal({
  isOpen,
  onClose,
  promptId,
  promptType,
  promptTitle,
  onSubmit
}: SuccessStoryModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    output_content: '',
    time_saved: '',
    is_anonymous: true,
    is_public: true,
    share_output: false
  })
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in the required fields')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        title: formData.title,
        description: formData.description,
        output_content: formData.share_output ? formData.output_content : undefined,
        time_saved: formData.time_saved ? parseInt(formData.time_saved) : undefined,
        is_anonymous: formData.is_anonymous,
        is_public: formData.is_public
      })
      
      toast.success('Success story shared! You earned 30 points 🎉')
      onClose()
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        output_content: '',
        time_saved: '',
        is_anonymous: true,
        is_public: true,
        share_output: false
      })
    } catch (error) {
      console.error('Error submitting success story:', error)
      toast.error('Failed to share success story')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Share Your Success Story</h2>
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
          {/* Incentive Banner */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center text-green-800 mb-2">
              <Star className="w-5 h-5 mr-2 text-yellow-500 fill-current" />
              <span className="font-medium">Earn 30 points + Success Story badge!</span>
            </div>
            <p className="text-sm text-green-700">
              Help others learn from your experience and build your community reputation.
            </p>
          </div>

          {/* Story Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Story Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Cut my report writing time by 75%!"
              className="input-field"
            />
          </div>

          {/* Story Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What happened? How did this prompt help you? *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your experience, what you achieved, and how the prompt made a difference..."
              rows={4}
              className="input-field"
            />
          </div>

          {/* Time Saved */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time saved (minutes)
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={formData.time_saved}
                onChange={(e) => setFormData(prev => ({ ...prev, time_saved: e.target.value }))}
                placeholder="How many minutes did this save you?"
                className="input-field pl-10"
                min="0"
              />
            </div>
          </div>

          {/* Share Output */}
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="share-output"
                checked={formData.share_output}
                onChange={(e) => setFormData(prev => ({ ...prev, share_output: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="share-output" className="ml-2 text-sm text-gray-700">
                <div className="flex items-center">
                  <Share2 className="w-4 h-4 mr-1" />
                  Share your output (optional)
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Help others see what's possible with this prompt
                </div>
              </label>
            </div>

            {formData.share_output && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your output (will be anonymized)
                </label>
                <textarea
                  value={formData.output_content}
                  onChange={(e) => setFormData(prev => ({ ...prev, output_content: e.target.value }))}
                  placeholder="Paste the output you got from using this prompt..."
                  rows={3}
                  className="input-field"
                />
              </div>
            )}
          </div>

          {/* Privacy Settings */}
          <div className="space-y-3 bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900">Privacy Settings</h3>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="anonymous"
                checked={formData.is_anonymous}
                onChange={(e) => setFormData(prev => ({ ...prev, is_anonymous: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
                <div className="flex items-center">
                  <EyeOff className="w-4 h-4 mr-1" />
                  Share anonymously
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Your name won't be shown with this story
                </div>
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="public"
                checked={formData.is_public}
                onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="public" className="ml-2 text-sm text-gray-700">
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  Make public
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Other users can see and learn from your story
                </div>
              </label>
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
            disabled={!formData.title.trim() || !formData.description.trim() || submitting}
            className="btn-primary flex items-center"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sharing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Share Story
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}