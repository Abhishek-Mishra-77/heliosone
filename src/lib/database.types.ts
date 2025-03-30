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
          organization_id: string | null
          role: 'super_admin' | 'admin' | 'bcdr_manager' | 'user'
          full_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          organization_id?: string | null
          role: 'super_admin' | 'admin' | 'bcdr_manager' | 'user'
          full_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          role?: 'super_admin' | 'admin' | 'bcdr_manager' | 'user'
          full_name?: string
          created_at?: string
          updated_at?: string
        }
      }
      department_users: {
        Row: {
          id: string
          department_id: string
          user_id: string
          role: 'department_head' | 'assessor' | 'viewer'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          department_id: string
          user_id: string
          role: 'department_head' | 'assessor' | 'viewer'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          department_id?: string
          user_id?: string
          role?: 'department_head' | 'assessor' | 'viewer'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}