import React from 'react'
import { User } from 'lucide-react'

interface AvatarProps {
  user?: {
    id?: string
    email?: string
    user_metadata?: {
      name?: string
    }
  }
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showFallback?: boolean
}

export default function Avatar({ 
  user, 
  size = 'md', 
  className = '',
  showFallback = true 
}: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  // Generate avatar URL using DiceBear Glass style
  const getAvatarUrl = () => {
    if (!user?.id && !user?.email) return null
    
    // Use user ID if available, otherwise fall back to email
    const seed = user.id || user.email || 'default'
    
    // DiceBear Glass style with customizations for a professional look
    return `https://api.dicebear.com/7.x/glass/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&glassesProbability=30&hairProbability=90&accessoriesProbability=20`
  }

  const avatarUrl = getAvatarUrl()

  if (!avatarUrl && !showFallback) {
    return null
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-100 flex items-center justify-center ${className}`}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={user?.user_metadata?.name || user?.email || 'User avatar'}
          className="w-full h-full object-cover"
          onError={(e) => {
            // If the image fails to load, show fallback
            if (showFallback) {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const fallback = target.nextElementSibling as HTMLElement
              if (fallback) {
                fallback.style.display = 'flex'
              }
            }
          }}
        />
      ) : null}
      
      {/* Fallback icon */}
      <div 
        className={`w-full h-full bg-primary-100 text-primary-600 flex items-center justify-center ${avatarUrl ? 'hidden' : 'flex'}`}
        style={{ display: avatarUrl ? 'none' : 'flex' }}
      >
        <User className={iconSizes[size]} />
      </div>
    </div>
  )
}