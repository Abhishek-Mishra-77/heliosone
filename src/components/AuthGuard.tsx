import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../lib/store'
import { supabase } from '../lib/supabase'
import { Shield } from 'lucide-react'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, setUser, setProfile, setOrganization, refreshSession } = useAuthStore()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function initializeAuth() {
      try {
        setIsLoading(true)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          throw sessionError
        }

        // If there's no session, do NOT redirect yet
        if (!session?.user) {
          if (isMounted) {
            setIsLoading(false)
          }
          return
        }

        if (isMounted) {
          setUser(session.user)

          // Check platform admins
          const { data: admin, error: adminError } = await supabase
            .from('platform_admins')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle()

          if (adminError && adminError.code !== 'PGRST116') {
            throw adminError
          }

          if (admin) {
            setProfile({
              id: admin.id,
              role: 'super_admin',
              full_name: admin.full_name,
              organization_id: null,
              department_roles: []
            })
            setOrganization(null)
            setIsLoading(false)

            // Redirect platform admins to dashboard
            if (location.pathname === '/') {
              window.location.href = '/admin'
            }
            return
          }

          // Fetch regular user profile
          const { data: existingUser, error: userError } = await supabase
            .from('users')
            .select(`
              id,
              email,
              role,
              full_name,
              organization_id
            `)
            .eq('id', session.user.id)
            .single()

          if (userError && userError.code !== 'PGRST116') {
            throw userError
          }

          if (existingUser) {
            setProfile({
              ...existingUser,
              department_roles: []
            })

            // Fetch organization if user has one
            if (existingUser.organization_id) {
              const { data: org, error: orgError } = await supabase
                .from('organizations')
                .select('*')
                .eq('id', existingUser.organization_id)
                .single()

              if (orgError) throw orgError
              if (org) setOrganization(org)
            }

            setIsLoading(false)
            return
          }

          // New user logic
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

          setProfile({
            ...newUser,
            department_roles: []
          })

          if (organization_id) {
            const { data: org, error: orgError } = await supabase
              .from('organizations')
              .select('*')
              .eq('id', organization_id)
              .single()

            if (orgError) throw orgError
            if (org) setOrganization(org)
          }

          setIsLoading(false)
        }
      } catch (error) {
        console.error('Auth error:', error)
        if (isMounted) {
          if (error.message?.includes('refresh_token_not_found')) {
            await refreshSession()
          } else {
            setError(error instanceof Error ? error.message : 'Authentication failed')
            setUser(null)
            setProfile(null)
            setOrganization(null)
          }
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="h-12 w-12 text-indigo-600 animate-pulse mx-auto" />
          <p className="mt-2 text-gray-600">Loading authentication...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  return <>{children}</>
}