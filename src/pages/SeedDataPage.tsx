import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Database, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { seedBookContent } from '@/scripts/seedBookContent'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { getUser } from '@/lib/auth'
import { useEffect } from 'react'

export default function SeedDataPage() {
  const [user, setUser] = useState<any>(null)
  const [seeding, setSeeding] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const currentUser = await getUser()
      if (!currentUser) {
        navigate('/auth/login')
        return
      }
      setUser(currentUser)
    } catch (error) {
      navigate('/auth/login')
    }
  }

  const runSeed = async () => {
    setSeeding(true)
    setError(null)
    setLogs([])
    setCompleted(false)

    try {
      // Override console.log to capture logs
      const originalLog = console.log
      const originalError = console.error

      console.log = (...args) => {
        setLogs(prev => [...prev, args.join(' ')])
        originalLog(...args)
      }

      console.error = (...args) => {
        setLogs(prev => [...prev, `ERROR: ${args.join(' ')}`])
        originalError(...args)
      }

      await seedBookContent()
      
      // Restore original console methods
      console.log = originalLog
      console.error = originalError

      setCompleted(true)
      setLogs(prev => [...prev, '✅ Seeding completed successfully!'])
    } catch (err: any) {
      setError(err.message)
      setLogs(prev => [...prev, `❌ Error: ${err.message}`])
    } finally {
      setSeeding(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Database Seeding</h1>
          <p className="text-gray-600 mt-2">
            Populate the database with book content (chapters, prompts, and exercises)
          </p>
        </div>

        <div className="card">
          <div className="flex items-center mb-6">
            <Database className="w-8 h-8 text-primary-600 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Seed Book Content</h2>
              <p className="text-gray-600">
                This will populate the database with all chapters, prompts, and exercises from the book.
              </p>
            </div>
          </div>

          {!completed && !seeding && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Before you start</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      This will add book content to your database. It's safe to run multiple times as it uses upsert operations.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={runSeed}
                disabled={seeding}
                className="btn-primary flex items-center"
              >
                <Database className="w-4 h-4 mr-2" />
                Start Seeding
              </button>
            </div>
          )}

          {seeding && (
            <div className="space-y-4">
              <div className="flex items-center text-primary-600">
                <Loader className="w-5 h-5 animate-spin mr-2" />
                <span className="font-medium">Seeding in progress...</span>
              </div>
            </div>
          )}

          {completed && (
            <div className="space-y-4">
              <div className="flex items-center text-success-600">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="font-medium">Seeding completed successfully!</span>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => navigate('/prompts')}
                  className="btn-primary"
                >
                  View Prompt Library
                </button>
                <button
                  onClick={() => navigate('/chapters')}
                  className="btn-secondary"
                >
                  View Chapters
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Seeding Failed</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Logs */}
          {logs.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Seeding Logs</h3>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What this does</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Creates 12 chapters with titles and part numbers</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Adds book prompts with categories, tags, and pro tips</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Populates exercises with different types and field configurations</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Uses upsert operations so it's safe to run multiple times</span>
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  )
}