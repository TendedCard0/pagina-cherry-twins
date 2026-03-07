import { cookies } from 'next/headers'
import { sql } from '@/lib/db'
import bcrypt from 'bcryptjs'
import type { User } from '@/lib/types'

const SESSION_COOKIE_NAME = 'session_token'
const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

function generateSessionToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createUser(
  email: string,
  password: string,
  fullName?: string
): Promise<{ user: User | null; error: string | null }> {
  try {
    // Check if user exists
    const existing = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase()}
    `
    
    if (existing.length > 0) {
      return { user: null, error: 'Email already registered' }
    }

    const passwordHash = await hashPassword(password)
    
    const result = await sql`
      INSERT INTO users (email, password_hash, full_name, role)
      VALUES (${email.toLowerCase()}, ${passwordHash}, ${fullName || null}, 'CUSTOMER')
      RETURNING *
    `

    return { user: result[0] as User, error: null }
  } catch (error) {
    console.error('Error creating user:', error)
    return { user: null, error: 'Failed to create account' }
  }
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<{ user: User | null; error: string | null }> {
  try {
    const result = await sql`
      SELECT * FROM users 
      WHERE email = ${email.toLowerCase()} AND is_active = true
    `

    if (result.length === 0) {
      return { user: null, error: 'Invalid email or password' }
    }

    const user = result[0] as User
    const isValid = await verifyPassword(password, user.password_hash)

    if (!isValid) {
      return { user: null, error: 'Invalid email or password' }
    }

    return { user, error: null }
  } catch (error) {
    console.error('Error authenticating user:', error)
    return { user: null, error: 'Authentication failed' }
  }
}

export async function createSession(userId: number): Promise<string> {
  const token = generateSessionToken()
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000)

  // Store session in database (we'll create a sessions table)
  // For now, we'll encode user ID in token (simplified)
  const sessionData = Buffer.from(JSON.stringify({ 
    userId, 
    token,
    expiresAt: expiresAt.toISOString()
  })).toString('base64')

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })

  return token
}

export async function getSession(): Promise<{ userId: number; user: User } | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

    if (!sessionCookie) return null

    const sessionData = JSON.parse(
      Buffer.from(sessionCookie.value, 'base64').toString('utf-8')
    )

    const expiresAt = new Date(sessionData.expiresAt)
    if (expiresAt < new Date()) {
      await destroySession()
      return null
    }

    const result = await sql`
      SELECT * FROM users WHERE id = ${sessionData.userId} AND is_active = true
    `

    if (result.length === 0) {
      await destroySession()
      return null
    }

    return { userId: sessionData.userId, user: result[0] as User }
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession()
  return session?.user || null
}
