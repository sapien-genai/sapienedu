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
    xl: 'w-24 h-24'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  // Generate avatar URL using DiceBear glass style
  const getAvatarUrl = () => {
    if (!user?.id && !user?.email) return null
    
    // Use user ID if available, otherwise fall back to email
    const seed = user.id || user.email || 'default'
    
    // DiceBear glass style with single background color
    const backgroundColor = 'b6e3f4'
    
    return `https://api.dicebear.com/7.x/glass/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${backgroundColor}`
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
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-primary-100 to-success-100 flex items-center justify-center relative ${className}`}>
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
            <div className="absolute inset-0 bg-gradient-to-br from-primary-200 to-success-200 animate-pulse rounded-full" />
          )}
        </>
      )}
      
      {/* Fallback icon with gradient background */}
      {shouldShowFallback && (
        <div className="w-full h-full bg-gradient-to-br from-primary-500 to-success-500 text-white flex items-center justify-center">
          <User className={iconSizes[size]} />
        </div>
      )}
    </div>
  )
}