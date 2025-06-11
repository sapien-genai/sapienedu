interface ProgressBarProps {
  progress: number
  className?: string
  showPercentage?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function ProgressBar({ 
  progress, 
  className = '', 
  showPercentage = false, 
  size = 'md' 
}: ProgressBarProps) {
  const heightClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }

  return (
    <div className={`${className}`}>
      <div className={`progress-bar ${heightClasses[size]}`}>
        <div 
          className="progress-fill animate-progress" 
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      {showPercentage && (
        <div className="text-right text-sm text-gray-600 mt-1">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  )
}