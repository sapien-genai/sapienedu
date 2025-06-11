import { useState, useEffect } from 'react'
import { differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns'

interface CountdownTimerProps {
  startDate: string
}

export default function CountdownTimer({ startDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const start = new Date(startDate)
      const endDate = new Date(start.getTime() + 90 * 24 * 60 * 60 * 1000) // 90 days
      const now = new Date()

      if (now >= endDate) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 })
        return
      }

      const days = differenceInDays(endDate, now)
      const hours = differenceInHours(endDate, now) % 24
      const minutes = differenceInMinutes(endDate, now) % 60

      setTimeLeft({ days, hours, minutes })
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [startDate])

  return (
    <div className="bg-gradient-to-r from-primary-500 to-success-500 p-6 rounded-xl text-white">
      <h3 className="text-lg font-semibold mb-4">90-Day Challenge</h3>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold">{timeLeft.days}</div>
          <div className="text-sm opacity-90">Days</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{timeLeft.hours}</div>
          <div className="text-sm opacity-90">Hours</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{timeLeft.minutes}</div>
          <div className="text-sm opacity-90">Minutes</div>
        </div>
      </div>
      <div className="mt-4 text-sm opacity-90">
        Time remaining to complete your AI integration journey
      </div>
    </div>
  )
}