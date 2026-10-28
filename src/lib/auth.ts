import { supabase } from './supabase'

// Only same-site paths, so a crafted ?next= cannot send users elsewhere.
export function safeNext(next: string | null | undefined) {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/'
}

// Supabase falls back to its dashboard "Site URL" unless an explicit redirect is
// given, which sent preview/local sign-ins to the production site.
function callbackUrl(next?: string) {
  const url = new URL('/auth/callback', window.location.origin)
  if (next && next !== '/') url.searchParams.set('next', next)
  return url.href
}

export async function signUp({ email, password, fullName, next }: { email: string; password: string; fullName: string; next?: string }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: callbackUrl(next),
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

export async function signInWithGoogle(next?: string) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
      redirectTo: callbackUrl(next)
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
