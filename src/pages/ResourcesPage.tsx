import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExternalLink, Download, Star, Check, Bookmark } from 'lucide-react'
import { getUser } from '@/lib/auth'
import DashboardLayout from '@/components/layout/DashboardLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Badge from '@/components/ui/Badge'

interface AITool {
  id: string
  name: string
  description: string
  category: string
  price: string
  url: string
  rating: number
  tried: boolean
}

interface Template {
  id: string
  name: string
  description: string
  type: string
  downloadUrl: string
}

export default function ResourcesPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('tools')
  const navigate = useNavigate()

  const aiTools: AITool[] = [
    {
      id: '1',
      name: 'ChatGPT',
      description: 'Advanced conversational AI for writing, coding, and problem-solving',
      category: 'General AI',
      price: 'Free / $20/month',
      url: 'https://chat.openai.com',
      rating: 5,
      tried: false
    },
    {
      id: '2',
      name: 'Claude',
      description: 'AI assistant for analysis, writing, and complex reasoning tasks',
      category: 'General AI',
      price: 'Free / $20/month',
      url: 'https://claude.ai',
      rating: 5,
      tried: false
    },
    {
      id: '3',
      name: 'Midjourney',
      description: 'AI image generation for creative and professional visuals',
      category: 'Image Generation',
      price: '$10-60/month',
      url: 'https://midjourney.com',
      rating: 4,
      tried: false
    },
    {
      id: '4',
      name: 'Notion AI',
      description: 'AI-powered writing and productivity within Notion workspace',
      category: 'Productivity',
      price: '$10/month',
      url: 'https://notion.so/ai',
      rating: 4,
      tried: false
    },
    {
      id: '5',
      name: 'Grammarly',
      description: 'AI writing assistant for grammar, style, and tone',
      category: 'Writing',
      price: 'Free / $12/month',
      url: 'https://grammarly.com',
      rating: 4,
      tried: false
    },
    {
      id: '6',
      name: 'Zapier',
      description: 'Automation platform connecting apps and workflows',
      category: 'Automation',
      price: 'Free / $20+/month',
      url: 'https://zapier.com',
      rating: 4,
      tried: false
    }
  ]

  const templates: Template[] = [
    {
      id: '1',
      name: 'AI Readiness Assessment Template',
      description: 'Comprehensive template to evaluate your AI readiness',
      type: 'PDF',
      downloadUrl: '#'
    },
    {
      id: '2',
      name: 'Prompt Engineering Cheat Sheet',
      description: 'Quick reference guide for effective prompt writing',
      type: 'PDF',
      downloadUrl: '#'
    },
    {
      id: '3',
      name: 'AI Tool Comparison Matrix',
      description: 'Spreadsheet template to compare AI tools for your needs',
      type: 'Excel',
      downloadUrl: '#'
    },
    {
      id: '4',
      name: 'ROI Tracking Template',
      description: 'Track time saved and productivity gains from AI tools',
      type: 'Excel',
      downloadUrl: '#'
    }
  ]

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const checkAuthAndLoadData = async () => {
    try {
      const currentUser = await getUser()
      if (!currentUser) {
        navigate('/auth/login')
        return
      }

      setUser(currentUser)
    } catch (error) {
      console.error('Error loading resources:', error)
      navigate('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'General AI': 'bg-blue-50 text-blue-700',
      'Image Generation': 'bg-purple-50 text-purple-700',
      'Productivity': 'bg-green-50 text-green-700',
      'Writing': 'bg-yellow-50 text-yellow-700',
      'Automation': 'bg-red-50 text-red-700'
    }
    return colors[category] || 'bg-gray-50 text-gray-700'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resources</h1>
          <p className="text-gray-600 mt-2">
            Discover AI tools, templates, and resources to accelerate your integration journey
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('tools')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tools'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              AI Tools
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'templates'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Templates
            </button>
            <button
              onClick={() => setActiveTab('guides')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'guides'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Quick Guides
            </button>
          </nav>
        </div>

        {/* AI Tools Tab */}
        {activeTab === 'tools' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {aiTools.map((tool) => (
                <div key={tool.id} className="card group">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{tool.name}</h3>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(tool.category)}`}>
                          {tool.category}
                        </span>
                        <span className="text-sm font-medium text-gray-900">{tool.price}</span>
                      </div>
                      <div className="flex items-center mb-2">
                        <div className="flex items-center mr-2">
                          {renderStars(tool.rating)}
                        </div>
                        <span className="text-sm text-gray-600">{tool.rating}/5</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                        <Bookmark className="w-4 h-4" />
                      </button>
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">{tool.description}</p>

                  <div className="flex items-center justify-between">
                    <button
                      className={`flex items-center text-sm font-medium ${
                        tool.tried
                          ? 'text-success-600'
                          : 'text-gray-600 hover:text-primary-600'
                      }`}
                    >
                      <Check className={`w-4 h-4 mr-1 ${tool.tried ? 'text-success-600' : 'text-gray-400'}`} />
                      {tool.tried ? 'Tried' : 'Mark as Tried'}
                    </button>
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-sm"
                    >
                      Try Now
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="card">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{template.name}</h3>
                      <Badge variant="default" size="sm">{template.type}</Badge>
                    </div>
                    <Download className="w-5 h-5 text-gray-400" />
                  </div>

                  <p className="text-gray-600 text-sm mb-4">{template.description}</p>

                  <button className="btn-primary w-full">
                    Download Template
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Guides Tab */}
        {activeTab === 'guides' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Prompt Engineering Best Practices</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Be specific and clear in your instructions</li>
                  <li>• Provide context and examples when needed</li>
                  <li>• Use role-playing to get better responses</li>
                  <li>• Break complex tasks into smaller steps</li>
                  <li>• Iterate and refine your prompts</li>
                </ul>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Tool Selection Criteria</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Identify your specific use case</li>
                  <li>• Consider integration capabilities</li>
                  <li>• Evaluate pricing and scalability</li>
                  <li>• Check data privacy and security</li>
                  <li>• Test with free trials when available</li>
                </ul>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Measuring AI ROI</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Track time saved on specific tasks</li>
                  <li>• Monitor quality improvements</li>
                  <li>• Calculate cost savings vs. tool costs</li>
                  <li>• Measure productivity increases</li>
                  <li>• Document process improvements</li>
                </ul>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Common AI Integration Mistakes</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Trying to automate everything at once</li>
                  <li>• Not training team members properly</li>
                  <li>• Ignoring data quality issues</li>
                  <li>• Choosing tools without clear objectives</li>
                  <li>• Failing to measure and iterate</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}