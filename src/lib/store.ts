import { create } from 'zustand'
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'
import type { Organizations, Users } from './supabase'

interface DepartmentRole {
  department_id: string
  role: 'department_admin' | 'assessor' | 'viewer'
}

interface Profile extends Omit<Users, 'department_users'> {
  department_roles: DepartmentRole[]
}

interface AuthState {
  user: User | null
  profile: Profile | null
  organization: Organizations | null
  loading: boolean
  error: string | null
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setOrganization: (org: Organizations | null) => void
  setError: (error: string | null) => void
  signOut: () => Promise<void>
  initAuth: () => Promise<void>
  refreshSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  organization: null,
  loading: true,
  error: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setOrganization: (organization) => set({ organization }),
  setError: (error) => set({ error }),
  signOut: async () => {
    try {
      // Clear state first to prevent any race conditions
      set({ user: null, profile: null, organization: null })
      
      // Check if there's an active session before attempting to sign out
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // Attempt to sign out from Supabase
        const { error } = await supabase.auth.signOut()
        if (error) throw error
      }

      // Clear any stored session data
      localStorage.removeItem('helios-bcdr-auth')
      
      // Redirect to auth page
      window.location.href = '/auth'
    } catch (error) {
      console.error('Error signing out:', error)
      // Even if there's an error, we want to clear the state and redirect
      window.location.href = '/auth'
    }
  },
  initAuth: async () => {
    try {
      set({ loading: true, error: null })
      
      // Get initial session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        throw sessionError
      }

      if (!session?.user) {
        set({ loading: false })
        return
      }

      // Set user
      set({ user: session.user })

      // Check for platform admin status first
      const { data: admin, error: adminError } = await supabase
        .from('platform_admins')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle()

      if (adminError && adminError.code !== 'PGRST116') {
        throw adminError
      }

      if (admin) {
        set({ 
          profile: {
            id: admin.id,
            role: 'super_admin',
            full_name: admin.full_name,
            organization_id: null,
            department_roles: []
          },
          organization: null
        })
        set({ loading: false })
        return
      }

      // Get regular user profile
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (userError && userError.code !== 'PGRST116') {
        throw userError
      }

      if (user) {
        // Set profile without department roles for admin users
        set({ 
          profile: {
            ...user,
            department_roles: []
          }
        })

        // Get organization if user has one
        if (user.organization_id) {
          const { data: org, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', user.organization_id)
            .single()

          if (orgError) throw orgError
          if (org) set({ organization: org })
        }
      } else {
        // Create new user profile
        const metadata = session.user.user_metadata || {}
        const role = metadata.role || 'user'
        const organization_id = metadata.organization_id
        const full_name = metadata.full_name || session.user.email?.split('@')[0] || 'User'

        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([{ 
            id: session.user.id, 
            email: session.user.email, 
            role, 
            organization_id, 
            full_name 
          }])
          .select()
          .single()

        if (createError) throw createError

        set({ 
          profile: {
            ...newUser,
            department_roles: []
          }
        })

        if (organization_id) {
          const { data: org, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', organization_id)
            .single()

          if (orgError) throw orgError
          if (org) set({ organization: org })
        }
      }

      set({ loading: false })
    } catch (error) {
      console.error('Error initializing auth:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to initialize authentication',
        loading: false,
        user: null,
        profile: null,
        organization: null
      })
    }
  },
  refreshSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession()
      if (error) throw error
      
      if (session?.user) {
        set({ user: session.user })
      } else {
        // If no session, redirect to auth
        window.location.href = '/auth'
      }
    } catch (error) {
      console.error('Error refreshing session:', error)
      // Clear state and redirect to auth
      set({ user: null, profile: null, organization: null })
      window.location.href = '/auth'
    }
  }
}))