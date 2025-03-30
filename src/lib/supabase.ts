import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Maximum number of retries for failed requests
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Helper function to handle retries
async function withRetry<T>(operation: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (retries > 0 && error instanceof Error && error.message.includes('Failed to fetch')) {
      await delay(RETRY_DELAY)
      return withRetry(operation, retries - 1)
    }
    throw error
  }
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'helios-bcdr-auth',
    storage: localStorage,
    flowType: 'pkce',
    debug: process.env.NODE_ENV === 'development',
// Add cookie options to ensure proper session handling
    cookieOptions: {
      name: 'helios-bcdr-session',
      lifetime: 7 * 24 * 60 * 60, // 7 days
      domain: window.location.hostname,
      path: '/',
      sameSite: 'lax'
    }
  },
  global: {
    headers: {
      'x-client-info': 'helios-bcdr'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

export function fetchRiskAssessments() {
  return withRetry(() =>
    supabase
      .from('risk_assessments')
      .select('*')
      .order('created_at', { ascending: false })
  ).then(({ data }) => data)
   .catch((error) => {
     console.error("Error fetching risk assessments:", error)
     return null
   })
}

export function fetchRiskFindings(assessmentId: string) {
  return withRetry(() =>
    supabase
      .from('risk_findings')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('inherent_risk_score', { ascending: false })
  ).then(({ data }) => data)
   .catch((error) => {
     console.error("Error fetching risk findings:", error)
     return null
   })
}

export function fetchRiskTrends(organizationId: string) {
  return withRetry(() =>
    supabase
      .from('risk_trends')
      .select('*')
      .eq('organization_id', organizationId)
      .order('metric_date', { ascending: true })
  ).then(({ data }) => data)
   .catch((error) => {
     console.error("Error fetching risk trends:", error)
     return null
   })
}

export function fetchRiskRecommendations(riskId: string) {
  return withRetry(() =>
    supabase
      .from('risk_recommendations')
      .select('*')
      .eq('risk_id', riskId)
  ).then(({ data }) => data)
   .catch((error) => {
     console.error("Error fetching risk recommendations:", error)
     return null
   })
}

// Function to create a new user profile
export const createUserProfile = async (userId: string, email: string) => {
  try {
    // First check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    // If user already exists, return early
    if (existingUser) {
      return existingUser
    }

    // Create new organization for the user
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert([{
        name: `${email.split('@')[0]}'s Organization`,
        industry: 'Other'
      }])
      .select()
      .single()

    if (orgError) throw orgError

    // Create user profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([{
        id: userId,
        email: email,
        role: 'admin', // Default to admin role for first user
        organization_id: org.id,
        full_name: email.split('@')[0] || 'New User'
      }])
      .select()
      .single()

    if (userError) throw userError

    return user
  } catch (error) {
    console.error('Error creating user profile:', error)
    throw error
  }
}

// Function to fetch user details from either `users` or `platform_admins`
export const getUserFromSupabase = async (userId: string) => {
  try {
    // First check `platform_admins` table
    const { data: admin, error: adminError } = await withRetry(() => 
      supabase
        .from('platform_admins')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
    )

    if (adminError && adminError.code !== 'PGRST116') {
      throw adminError
    }

    if (admin) {
      return {
        user: admin,
        role: 'super_admin',
        organization: null
      }
    }

    // If not a platform admin, check `users` table
    const { data: user, error: userError } = await withRetry(() =>
      supabase
        .from('users')
        .select(`
          *,
          organizations (
            id,
            name,
            industry
          )
        `)
        .eq('id', userId)
        .maybeSingle()
    )

    if (userError && userError.code !== 'PGRST116') {
      throw userError
    }

    if (!user) {
      throw new Error('User not found')
    }

    return {
      user: {
        ...user,
        department_roles: []
      },
      role: user.role,
      organization: user.organizations
    }
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}

// Helper function to check auth state
export const checkAuth = async () => {
  try {
    const { data: { session }, error } = await withRetry(() => 
      supabase.auth.getSession()
    )
    
    if (error) throw error
    return session
  } catch (error) {
    console.error('Error checking auth:', error)
    return null
  }
}

// Wrapper for Supabase operations that require auth
export const withAuth = async <T>(operation: () => Promise<T>): Promise<T> => {
  const session = await checkAuth()
  if (!session) {
    throw new Error('Authentication required')
  }
  try {
    return await withRetry(operation)
  } catch (error) {
    if (error instanceof Error) {
      // Handle PGRST116 errors gracefully
      if (error.message.includes('PGRST116')) {
        console.warn('No data found:', error)
        return null as T
      }
      // Handle network errors
      if (error.message.includes('Failed to fetch')) {
        console.error('Network error:', error)
        window.toast?.error('Network error. Please check your connection.')
        throw new Error('Network error. Please check your connection.')
      }
    }
    throw error
  }
}

export type Tables = Database['public']['Tables']
export type Organizations = Tables['organizations']['Row']
export type Users = Tables['users']['Row']
export type PlatformAdmins = Tables['platform_admins']['Row']
export type BCDRAssessments = Tables['bcdr_assessments']['Row']
export type AssessmentResponses = Tables['assessment_responses']['Row']
export type BusinessProcesses = Tables['business_processes']['Row']