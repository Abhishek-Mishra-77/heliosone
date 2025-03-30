import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../lib/store'

export function AuthPage() {
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()

  useEffect(() => {
    // If user is already logged in, redirect to appropriate page
    if (user) {
      const from = location.state?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    }
  }, [user, navigate, location])

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Get the redirect path or default to dashboard
        const from = location.state?.from?.pathname || '/dashboard'
        navigate(from, { replace: true })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [navigate, location])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Welcome to Helios</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to access your organization's BCDR platform
            </p>
          </div>
          
          {error && (
            <div className="mb-4 p-4 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#4f46e5',
                    brandAccent: '#4338ca',
                  },
                },
              },
              className: {
                container: 'auth-container',
                button: 'auth-button',
                input: 'auth-input',
                message: 'text-sm text-red-600 mt-1',
                loader: 'border-indigo-600',
              },
            }}
            providers={[]}
            view="sign_in"
            showLinks={false}
            redirectTo={window.location.origin}
            onError={(error) => {
              console.error('Auth error:', error)
              setError(error.message)
            }}
          />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Need access? Contact your Helios administrator
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}