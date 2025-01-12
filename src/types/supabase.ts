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
      analytics_requests: {
        Row: {
          id: string
          url: string
          status: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          url: string
          status?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          url?: string
          status?: Json
          created_at?: string
          updated_at?: string
        }
      }
      tweets: {
        Row: {
          id: string
          url: string
          data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          url: string
          data?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          url?: string
          data?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      execute_sql: {
        Args: { sql: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}