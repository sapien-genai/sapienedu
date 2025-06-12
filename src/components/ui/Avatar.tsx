import React, { useState, useEffect } from 'react'
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
  const [isLoading, setIsLoading] = useState(true)

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24' // Fixed the typo here
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
    
    // Try DiceBear API with simpler parameters first
    const params = new URLSearchParams({
      seed: seed,
      backgroundColor: 'b6e3f4,c0aede,d1d4f9',
      // Remove problematic parameters that might cause issues
      format: 'svg'
    })
    
    return `https://api.dicebear.com/7.x/glass/svg?${params.toString()}`
  }

  const avatarUrl = getAvatarUrl()

  // Reset states when user changes
  useEffect(() => {
    setImageError(false)
    setImageLoaded(false)
    setIsLoading(true)
  }, [user?.id, user?.email])

  const handleImageLoad = () => {
    console.log('Avatar loaded successfully for:', user?.email || user?.id)
    setImageLoaded(true)
    setImageError(false)
    setIsLoading(false)
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Avatar failed to load for:', user?.email || user?.id, 'URL:', avatarUrl)
    console.error('Error details:', e)
    setImageError(true)
    setImageLoaded(false)
    setIsLoading(false)
  }

  const shouldShowFallback = !avatarUrl || imageError || (!imageLoaded && !isLoading)

  // Debug logging
  useEffect(() => {
    if (avatarUrl) {
      console.log('Generated avatar URL:', avatarUrl)
    }
  }, [avatarUrl])

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-100 flex items-center justify-center relative ${className}`}>
      {avatarUrl && !imageError && (
        <>
          <img
            src={avatarUrl}
            alt={user?.user_metadata?.name || user?.email || 'User avatar'}
            className={`w-full h-full object-cover transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            crossOrigin="anonymous"
          />
          
          {/* Loading state */}
          {isLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-full" />
          )}
        </>
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