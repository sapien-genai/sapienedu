import React from 'react'
import { Star, Trophy, Zap, Target, Users, Crown } from 'lucide-react'
import { USER_REWARDS } from '@/types/ratings'
import type { UserLevel } from '@/types/ratings'
import Badge from '@/components/ui/Badge'

interface UserRewardsDisplayProps {
  userPoints: number
  userBadges: string[]
  recentRewards?: Array<{
    action_type: string
    points_earned: number
    badge_earned?: string
    created_at: string
  }>
  className?: string
}

export default function UserRewardsDisplay({
  userPoints,
  userBadges,
  recentRewards = [],
  className = ''
}: UserRewardsDisplayProps) {
  const getCurrentLevel = (points: number): { level: keyof typeof USER_REWARDS.levels; data: UserLevel } => {
    for (const [level, data] of Object.entries(USER_REWARDS.levels)) {
      const [min, max] = data.range
      if (points >= min && points <= max) {
        return { level: level as keyof typeof USER_REWARDS.levels, data }
      }
    }
    return { level: 'expert', data: USER_REWARDS.levels.expert }
  }

  const getNextLevel = (currentLevel: keyof typeof USER_REWARDS.levels) => {
    const levels = Object.keys(USER_REWARDS.levels) as Array<keyof typeof USER_REWARDS.levels>
    const currentIndex = levels.indexOf(currentLevel)
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null
  }

  const getProgressToNextLevel = (points: number, currentLevel: keyof typeof USER_REWARDS.levels) => {
    const nextLevel = getNextLevel(currentLevel)
    if (!nextLevel) return 100 // Already at max level
    
    const currentLevelMax = USER_REWARDS.levels[currentLevel].range[1]
    const nextLevelMin = USER_REWARDS.levels[nextLevel].range[0]
    const progress = ((points - currentLevelMax) / (nextLevelMin - currentLevelMax)) * 100
    return Math.max(0, Math.min(100, progress))
  }

  const { level: currentLevel, data: levelData } = getCurrentLevel(userPoints)
  const nextLevel = getNextLevel(currentLevel)
  const progressToNext = getProgressToNextLevel(userPoints, currentLevel)
  const pointsToNext = nextLevel ? USER_REWARDS.levels[nextLevel].range[0] - userPoints : 0

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'beginner': return <Zap className="w-4 h-4" />
      case 'intermediate': return <Target className="w-4 h-4" />
      case 'advanced': return <Star className="w-4 h-4" />
      case 'expert': return <Crown className="w-4 h-4" />
      default: return <Trophy className="w-4 h-4" />
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'from-green-400 to-green-600'
      case 'intermediate': return 'from-blue-400 to-blue-600'
      case 'advanced': return 'from-purple-400 to-purple-600'
      case 'expert': return 'from-yellow-400 to-yellow-600'
      default: return 'from-gray-400 to-gray-600'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Level & Progress */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getLevelColor(currentLevel)} flex items-center justify-center text-white`}>
              {getLevelIcon(currentLevel)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{levelData.badge}</h3>
              <p className="text-sm text-gray-600">{userPoints} points</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{userBadges.length}</div>
            <div className="text-sm text-gray-600">Badges</div>
          </div>
        </div>

        {/* Progress to Next Level */}
        {nextLevel && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress to {USER_REWARDS.levels[nextLevel].badge}</span>
              <span className="font-medium">{pointsToNext} points to go</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full bg-gradient-to-r ${getLevelColor(nextLevel)} transition-all duration-500`}
                style={{ width: `${progressToNext}%` }}
              />
            </div>
          </div>
        )}

        {/* Current Level Perks */}
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Your Perks:</h4>
          <div className="space-y-1">
            {levelData.perks.map((perk, index) => (
              <div key={index} className="flex items-center text-sm text-gray-600">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                {perk}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Rewards */}
      {recentRewards.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
            Recent Rewards
          </h3>
          <div className="space-y-3">
            {recentRewards.slice(0, 5).map((reward, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {USER_REWARDS.actions[reward.action_type as keyof typeof USER_REWARDS.actions]?.badge || 'Reward'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(reward.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-green-600">
                    +{reward.points_earned} pts
                  </div>
                  {reward.badge_earned && (
                    <Badge variant="success" size="sm">
                      {reward.badge_earned}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-600" />
          Earn More Points
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(USER_REWARDS.actions).map(([action, data]) => (
            <div key={action} className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">{data.badge}</div>
                  <div className="text-xs text-gray-500">
                    {action === 'first_rating' && 'Rate your first prompt'}
                    {action === 'helpful_feedback' && 'Leave helpful feedback'}
                    {action === 'prompt_improvement' && 'Suggest prompt improvements'}
                    {action === 'success_story' && 'Share a success story'}
                    {action === 'community_contribution' && 'Help other users'}
                  </div>
                </div>
                <div className="text-sm font-semibold text-green-600">
                  +{data.points}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}