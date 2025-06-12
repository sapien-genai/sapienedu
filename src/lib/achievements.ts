export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  condition: (userData: any) => boolean
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_exercise',
    title: 'First Steps',
    description: 'Complete your first exercise',
    icon: '🎯',
    condition: (userData) => userData.completedExercises > 0
  },
  {
    id: 'seven_day_streak',
    title: '7-Day Streak',
    description: 'Use AI tools for 7 consecutive days',
    icon: '🔥',
    condition: (userData) => userData.currentStreak >= 7
  },
  {
    id: 'chapter_champion',
    title: 'Chapter Champion',
    description: 'Complete all exercises in a chapter',
    icon: '👑',
    condition: (userData) => userData.completedChapters > 0
  },
  {
    id: 'halfway_hero',
    title: 'Halfway Hero',
    description: 'Complete 50% of all exercises',
    icon: '⭐',
    condition: (userData) => userData.completionPercentage >= 50
  },
  {
    id: 'prompt_master',
    title: 'Prompt Master',
    description: 'Save 10 prompts to your library',
    icon: '📝',
    condition: (userData) => userData.savedPrompts >= 10
  },
  {
    id: 'time_saver',
    title: 'Time Saver',
    description: 'Save 10+ hours through AI automation',
    icon: '⏰',
    condition: (userData) => userData.timeSaved >= 10
  },
  {
    id: 'integration_master',
    title: 'AI Integration Master',
    description: 'Complete 100% of all exercises',
    icon: '🏆',
    condition: (userData) => userData.completionPercentage >= 100
  }
]

export function checkAchievements(userData: any, currentAchievements: string[]): string[] {
  const newAchievements: string[] = []
  
  ACHIEVEMENTS.forEach(achievement => {
    if (!currentAchievements.includes(achievement.id) && achievement.condition(userData)) {
      newAchievements.push(achievement.id)
    }
  })
  
  return newAchievements
}

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id)
}