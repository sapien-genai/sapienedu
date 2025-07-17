import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.')
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY')
}

// Validate URL format
if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
  console.error('VITE_SUPABASE_URL must be a valid HTTPS URL starting with https://')
}

// Create a fallback client to prevent crashes during development
const createSupabaseClient = () => {
  try {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration')
    }
    
    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error)
    // Return a mock client that prevents crashes
    return {
      auth: {
        signUp: () => Promise.reject(new Error('Supabase not configured')),
        signInWithPassword: () => Promise.reject(new Error('Supabase not configured')),
        signOut: () => Promise.reject(new Error('Supabase not configured')),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => Promise.reject(new Error('Supabase not configured')),
        insert: () => Promise.reject(new Error('Supabase not configured')),
        update: () => Promise.reject(new Error('Supabase not configured')),
        delete: () => Promise.reject(new Error('Supabase not configured')),
      }),
    } as any
  }
}

export const supabase = createSupabaseClient()

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          created_at: string
          start_date: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          created_at?: string
          start_date?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          created_at?: string
          start_date?: string
        }
      }
      exercises: {
        Row: {
          id: string
          user_id: string
          chapter_number: number
          exercise_number: number
          exercise_type: string
          data: any
          completed: boolean
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          chapter_number: number
          exercise_number: number
          exercise_type: string
          data?: any
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          chapter_number?: number
          exercise_number?: number
          exercise_type?: string
          data?: any
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      prompts: {
        Row: {
          id: string
          user_id: string
          title: string
          prompt_text: string
          category: string
          success_rating: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          prompt_text: string
          category: string
          success_rating: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          prompt_text?: string
          category?: string
          success_rating?: number
          notes?: string | null
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          user_id: string
          achievement_type: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_type: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_type?: string
          earned_at?: string
        }
      }
      daily_habits: {
        Row: {
          id: string
          user_id: string
          date: string
          used_ai: boolean
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          used_ai: boolean
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          used_ai?: boolean
        }
      }
      user_goals: {
        Row: {
          id: string
          user_id: string
          goals: any
          vision: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goals?: any
          vision?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goals?: any
          vision?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      goal_milestones: {
        Row: {
          id: string
          user_id: string
          goal_id: string
          title: string
          target_date: string | null
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_id: string
          title: string
          target_date?: string | null
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_id?: string
          title?: string
          target_date?: string | null
          completed?: boolean
          created_at?: string
        }
      }
    }
  }
}