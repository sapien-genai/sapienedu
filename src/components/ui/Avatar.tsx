import React, { useState } from 'react'
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
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 w-24'
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
    
    // DiceBear Glass style with better parameters for consistent loading
    const params = new URLSearchParams({
      seed: seed,
      backgroundColor: 'b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      glassesProbability: '30',
      hairProbability: '90',
      accessoriesProbability: '20',
      // Add format and size for better reliability
      format: 'svg',
      size: '200'
    })
    
    return `https://api.dicebear.com/7.x/glass/svg?${params.toString()}`
  }

  const avatarUrl = getAvatarUrl()

  const handleImageLoad = () => {
    setImageLoaded(true)
    setImageError(false)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoaded(false)
  }

  const shouldShowFallback = !avatarUrl || imageError || (!imageLoaded && showFallback)

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-100 flex items-center justify-center ${className}`}>
      {avatarUrl && !imageError && (
        <img
          src={avatarUrl}
          alt={user?.user_metadata?.name || user?.email || 'User avatar'}
          className={`w-full h-full object-cover ${imageLoaded ? 'block' : 'hidden'}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
      
      {/* Fallback icon */}
      {shouldShowFallback && (
        <div className="w-full h-full bg-primary-100 text-primary-600 flex items-center justify-center">
          <User className={iconSizes[size]} />
        </div>
      )}
    </div>
  )
}