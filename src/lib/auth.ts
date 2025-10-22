import { supabase } from './supabase'

export async function signUp({ email, password, fullName }: { email: string; password: string; fullName: string }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })
  return { data, error }
}

export async function signIn({ email, password }: { email: string; password: string }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Session error:', error.message)
      // If it's a refresh token error, clear the session
      if (error.message.includes('refresh_token_not_found') || 
          error.message.includes('Invalid Refresh Token')) {
        await supabase.auth.signOut()
        return { session: null, error }
      }
    }
    
    return { session, error }
  } catch (err) {
    console.error('Unexpected auth error:', err)
    return { session: null, error: err }
  }
}

export async function requireAuth() {
  const { session, error } = await getCurrentSession()
  
  if (!session) {
    if (typeof window !== 'undefined') {
      window.location.href = '/auth'
    }
    return null
  }
  
  return session
}
