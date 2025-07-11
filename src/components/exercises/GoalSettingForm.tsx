import React, { useState, useEffect } from 'react'
import { Save, Target, Calendar, TrendingUp, AlertTriangle, CheckCircle, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import Badge from '@/components/ui/Badge'

interface Goal {
  id: string
  title: string
  description: string
  category: string
  deadline: string
  priority: 'high' | 'medium' | 'low'
  metrics: string
}

interface Milestone {
  id: string
  goalId: string
  title: string
  targetDate: string
  completed: boolean
}

interface GoalSettingFormProps {
  initialData?: {
    goals: Goal[]
    milestones: Milestone[]
    vision?: string
  }
  onSave: (data: any) => Promise<void>
  isUpdate?: boolean
  className?: string
}

export default function GoalSettingForm({
  initialData,
  onSave,
  isUpdate = false,
  className = ''
}: GoalSettingFormProps) {
  const [goals, setGoals] = useState<Goal[]>(initialData?.goals || [])
  const [milestones, setMilestones] = useState<Milestone[]>(initialData?.milestones || [])
  const [vision, setVision] = useState(initialData?.vision || '')
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    title: '',
    description: '',
    category: 'productivity',
    deadline: '',
    priority: 'medium',
    metrics: ''
  })
  const [newMilestone, setNewMilestone] = useState<Partial<Milestone>>({
    title: '',
    targetDate: '',
    goalId: ''
  })
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showMilestoneForm, setShowMilestoneForm] = useState(false)

  const goalCategories = [
    { value: 'productivity', label: 'Productivity' },
    { value: 'learning', label: 'Learning & Development' },
    { value: 'automation', label: 'Automation' },
    { value: 'content', label: 'Content Creation' },
    { value: 'data', label: 'Data Analysis' },
    { value: 'communication', label: 'Communication' }
  ]

  const handleAddGoal = () => {
    if (!newGoal.title) {
      toast.error('Goal title is required')
      return
    }

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description || '',
      category: newGoal.category || 'productivity',
      deadline: newGoal.deadline || '',
      priority: newGoal.priority || 'medium',
      metrics: newGoal.metrics || ''
    }

    setGoals([...goals, goal])
    setNewGoal({
      title: '',
      description: '',
      category: 'productivity',
      deadline: '',
      priority: 'medium',
      metrics: ''
    })
    toast.success('Goal added successfully')
  }

  const handleEditGoal = (goal: Goal) => {
    setEditingGoalId(goal.id)
    setNewGoal(goal)
  }

  const handleUpdateGoal = () => {
    if (!newGoal.title) {
      toast.error('Goal title is required')
      return
    }

    setGoals(goals.map(g => g.id === editingGoalId ? { ...g, ...newGoal as Goal } : g))
    setNewGoal({
      title: '',
      description: '',
      category: 'productivity',
      deadline: '',
      priority: 'medium',
      metrics: ''
    })
    setEditingGoalId(null)
    toast.success('Goal updated successfully')
  }

  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id))
    setMilestones(milestones.filter(m => m.goalId !== id))
    toast.success('Goal deleted')
  }

  const handleAddMilestone = () => {
    if (!newMilestone.title || !newMilestone.goalId) {
      toast.error('Milestone title and goal are required')
      return
    }

    const milestone: Milestone = {
      id: Date.now().toString(),
      goalId: newMilestone.goalId,
      title: newMilestone.title,
      targetDate: newMilestone.targetDate || '',
      completed: false
    }

    setMilestones([...milestones, milestone])
    setNewMilestone({
      title: '',
      targetDate: '',
      goalId: newMilestone.goalId
    })
    toast.success('Milestone added successfully')
  }

  const handleToggleMilestone = (id: string) => {
    setMilestones(milestones.map(m => 
      m.id === id ? { ...m, completed: !m.completed } : m
    ))
  }

  const handleDeleteMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id))
  }

  const handleSubmit = async () => {
    if (goals.length === 0) {
      toast.error('Please add at least one goal')
      return
    }

    setSubmitting(true)
    try {
      await onSave({
        goals,
        milestones,
        vision
      })
      toast.success('Goals saved successfully!')
    } catch (error) {
      console.error('Error saving goals:', error)
      toast.error('Failed to save goals')
    } finally {
      setSubmitting(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'productivity': return <TrendingUp className="w-4 h-4" />
      case 'learning': return <Target className="w-4 h-4" />
      case 'automation': return <CheckCircle className="w-4 h-4" />
      case 'content': return <Target className="w-4 h-4" />
      case 'data': return <TrendingUp className="w-4 h-4" />
      case 'communication': return <Target className="w-4 h-4" />
      default: return <Target className="w-4 h-4" />
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Vision Statement */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your 90-Day AI Vision</h3>
        <p className="text-gray-600 mb-4">
          Start by describing your overall vision for AI integration over the next 90 days.
          What do you want to achieve? How will your workflow be transformed?
        </p>
        <textarea
          value={vision}
          onChange={(e) => setVision(e.target.value)}
          placeholder="In 90 days, I want to..."
          rows={4}
          className="input-field"
        />
      </div>

      {/* Goal Form */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {editingGoalId ? 'Edit Goal' : 'Add a New Goal'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Goal Title *
            </label>
            <input
              type="text"
              value={newGoal.title}
              onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              placeholder="e.g., Automate email responses"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={newGoal.description}
              onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              placeholder="Describe your goal in detail..."
              rows={3}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={newGoal.category}
                onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                className="input-field"
              >
                {goalCategories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Date
              </label>
              <input
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={newGoal.priority}
                onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as 'high' | 'medium' | 'low' })}
                className="input-field"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Success Metrics
            </label>
            <textarea
              value={newGoal.metrics}
              onChange={(e) => setNewGoal({ ...newGoal, metrics: e.target.value })}
              placeholder="How will you measure success? e.g., Reduce email response time by 50%"
              rows={2}
              className="input-field"
            />
          </div>

          <div className="flex justify-end">
            {editingGoalId ? (
              <div className="space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingGoalId(null)
                    setNewGoal({
                      title: '',
                      description: '',
                      category: 'productivity',
                      deadline: '',
                      priority: 'medium',
                      metrics: ''
                    })
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateGoal}
                  className="btn-primary flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Update Goal
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAddGoal}
                className="btn-primary flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Goal
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Goals List */}
      {goals.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your 90-Day AI Goals</h3>
          <div className="space-y-4">
            {goals.map(goal => (
              <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{goal.title}</h4>
                      <Badge 
                        variant="default" 
                        size="sm"
                        className={getPriorityColor(goal.priority)}
                      >
                        {goal.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span className="flex items-center">
                        {getCategoryIcon(goal.category)}
                        <span className="ml-1 capitalize">{goal.category}</span>
                      </span>
                      {goal.deadline && (
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(goal.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditGoal(goal)}
                      className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {goal.description && (
                  <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                )}

                {goal.metrics && (
                  <div className="bg-blue-50 p-3 rounded-lg mb-3">
                    <div className="flex items-center text-blue-800 text-sm">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      <span className="font-medium">Success Metrics:</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">{goal.metrics}</p>
                  </div>
                )}

                {/* Milestones for this goal */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium text-gray-700">Milestones</h5>
                    <button
                      onClick={() => {
                        setNewMilestone({ ...newMilestone, goalId: goal.id })
                        setShowMilestoneForm(true)
                      }}
                      className="text-xs text-primary-600 hover:text-primary-500 flex items-center"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Milestone
                    </button>
                  </div>

                  {milestones.filter(m => m.goalId === goal.id).length > 0 ? (
                    <div className="space-y-2">
                      {milestones
                        .filter(m => m.goalId === goal.id)
                        .map(milestone => (
                          <div key={milestone.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={milestone.completed}
                                onChange={() => handleToggleMilestone(milestone.id)}
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-2"
                              />
                              <span className={`text-sm ${milestone.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                {milestone.title}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {milestone.targetDate && (
                                <span className="text-xs text-gray-500">
                                  {new Date(milestone.targetDate).toLocaleDateString()}
                                </span>
                              )}
                              <button
                                onClick={() => handleDeleteMilestone(milestone.id)}
                                className="text-gray-400 hover:text-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic">No milestones yet</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Milestone Form Modal */}
      {showMilestoneForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Add Milestone</h3>
                <button
                  onClick={() => setShowMilestoneForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Milestone Title *
                </label>
                <input
                  type="text"
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                  placeholder="e.g., Research AI tools"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={newMilestone.targetDate}
                  onChange={(e) => setNewMilestone({ ...newMilestone, targetDate: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Related Goal
                </label>
                <select
                  value={newMilestone.goalId}
                  onChange={(e) => setNewMilestone({ ...newMilestone, goalId: e.target.value })}
                  className="input-field"
                  disabled={!!newMilestone.goalId}
                >
                  <option value="">Select a goal</option>
                  {goals.map(goal => (
                    <option key={goal.id} value={goal.id}>
                      {goal.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowMilestoneForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMilestone}
                className="btn-primary flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Milestone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          onClick={handleSubmit}
          disabled={submitting || goals.length === 0}
          className="btn-primary flex items-center"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {isUpdate ? 'Update Goals' : 'Save Goals'}
            </>
          )}
        </button>
      </div>
    </div>
  )
}