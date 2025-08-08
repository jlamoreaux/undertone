export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          chapters_read: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          chapters_read?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          chapters_read?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      books: {
        Row: {
          id: number
          title: string
          num_chapters: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          num_chapters: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          num_chapters?: number
          created_at?: string
          updated_at?: string
        }
      }
      sync_status: {
        Row: {
          id: number
          last_synced: string
          user_id: string
        }
        Insert: {
          id?: number
          last_synced?: string
          user_id: string
        }
        Update: {
          id?: number
          last_synced?: string
          user_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
