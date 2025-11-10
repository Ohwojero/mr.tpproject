'use server'

import { database as db } from '@/lib/db'
import { compare } from 'bcrypt'

export async function authenticateUser(email: string, password: string) {
  try {
    console.log('Attempting authentication for email:', email)

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]) as any

    if (!user) {
      console.log('User not found for email:', email)
      return null
    }

    const isValid = await compare(password, user.password)
    if (!isValid) {
      console.log('Invalid password for email:', email)
      return null
    }

    const { password: _, ...safeUser } = user
    console.log('Authentication successful for user:', safeUser.email)
    return safeUser
  } catch (error) {
    console.error('Auth error:', error)
    // In production, you might want to log to an external service
    // For now, return null to indicate failure without exposing details
    return null
  }
}
