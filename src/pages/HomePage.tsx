import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Target, Users, TrendingUp, Zap } from 'lucide-react'
import { getUser } from '@/lib/auth'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const currentUser = await getUser()
      if (currentUser) {
        navigate('/dashboard')
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const features = [
    {
      icon: Target,
      title: 'Track Your Progress',
      description: 'Monitor your AI integration journey with detailed progress tracking and achievement badges.'
    },
    {
      icon: Zap,
      title: 'Interactive Exercises',
      description: 'Complete hands-on exercises designed to build practical AI skills in real-world scenarios.'
    },
    {
      icon: Users,
      title: 'Prompt Library',
      description: 'Build and manage your personal collection of effective AI prompts for various use cases.'
    },
    {
      icon: TrendingUp,
      title: '90-Day Challenge',
      description: 'Transform your workflow in 90 days with structured learning and practical application.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-3 bg-white px-6 py-3 rounded-full shadow-lg">
                <img 
                  src="/sapienicon.png" 
                  alt="Sapien" 
                  className="w-10 h-10 rounded-lg"
                />
                <span className="text-xl font-bold text-gray-900">Sapien</span>
              </div>
            </div>
            
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Master AI Integration in
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-success-600"> 90 Days</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Transform your workflow with our comprehensive platform. Complete interactive exercises, 
              track your progress, and build a personal AI toolkit that saves you hours every week.
            </p>

            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <Link to="/auth/register" className="btn-primary text-lg px-8 py-3 block sm:inline-block">
                Start Your Journey
              </Link>
              <Link to="/auth/login" className="btn-secondary text-lg px-8 py-3 block sm:inline-block">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600">
              Our platform provides all the tools and guidance you need for successful AI integration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-success-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-primary-600 to-success-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals who have already revolutionized their productivity with AI.
          </p>
          <Link to="/auth/register" className="bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            Get Started Today
          </Link>
        </div>
      </div>
    </div>
  )
}