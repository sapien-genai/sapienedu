import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Search, ChevronDown } from 'lucide-react'
import { signOut } from '@/lib/auth'
import Avatar from '@/components/ui/Avatar'

interface HeaderProps {
  user?: {
    id?: string
    name?: string
    email?: string
    user_metadata?: {
      name?: string
    }
  }
}

export default function Header({ user }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const displayName = user?.user_metadata?.name || user?.name || user?.email || 'User'

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search exercises, resources..."
                className="input-field pl-10 py-2 text-sm"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
              <Bell className="h-5 w-5" />
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <Avatar user={user} size="md" />
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium text-gray-900 truncate max-w-32">
                    {displayName}
                  </div>
                  <div className="text-xs text-gray-500 truncate max-w-32">
                    {user?.email}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <Avatar user={user} size="lg" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {displayName}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {user?.email}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowDropdown(false)
                      navigate('/profile')
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Profile Settings
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}