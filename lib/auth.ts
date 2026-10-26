import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { getDb } from './db'

export const ADMIN_COOKIE_NAME = 'lune_admin_session'
const SESSION_DURATION_HOURS = 24

export interface AdminUser {
  id: number
  username: string
  email: string
  role: string
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

export function checkRateLimit(ip: string): boolean {
  const db = getDb()
  // Count failed attempts in the last 15 minutes
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()
  const result = db.prepare(`
    SELECT COUNT(*) as failedCount 
    FROM login_attempts 
    WHERE ip = ? AND success = 0 AND attempted_at > ?
  `).get(ip, fifteenMinutesAgo) as { failedCount: number }

  return result.failedCount < 5
}

export function recordLoginAttempt(ip: string, success: boolean) {
  const db = getDb()
  db.prepare(`
    INSERT INTO login_attempts (ip, success) VALUES (?, ?)
  `).run(ip, success ? 1 : 0)
}

export function createAdminSession(userId: number): string {
  const db = getDb()
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000).toISOString()

  db.prepare(`
    INSERT INTO admin_sessions (token, user_id, expires_at)
    VALUES (?, ?, ?)
  `).run(token, userId, expiresAt)

  return token
}

export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value

  if (!sessionToken) {
    return null
  }

  const db = getDb()
  const now = new Date().toISOString()

  const session = db.prepare(`
    SELECT s.token, u.id, u.username, u.email, u.role
    FROM admin_sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ? AND s.expires_at > ? AND u.role = 'admin'
    LIMIT 1
  `).get(sessionToken, now) as (AdminUser & { token: string }) | undefined

  if (!session) {
    return null
  }

  return {
    id: session.id,
    username: session.username,
    email: session.email,
    role: session.role,
  }
}

export async function revokeAdminSession() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value

  if (sessionToken) {
    const db = getDb()
    db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(sessionToken)
    cookieStore.delete(ADMIN_COOKIE_NAME)
  }
}
