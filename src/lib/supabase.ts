import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

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
    }
  }
}