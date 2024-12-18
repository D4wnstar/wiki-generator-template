import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { users } from '$lib/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '$env/static/private'

/**
 * Log a user in, if it exists, returning the JWT.
 */
export const POST: RequestHandler = async ({ cookies, request, locals }) => {
	const { username, password } = await request.json()

	if (!username || !password) {
		return json({ message: 'Missing username or password' }, { status: 400 })
	}

	const user = await locals.db.select().from(users).where(eq(users.username, username)).get()
	if (!user) {
		return json({ message: 'No user found with this username' }, { status: 400 })
	}

	const isPasswordCorrect = await bcrypt.compare(password, user.password)
	if (!isPasswordCorrect) {
		return json({ message: 'Wrong password' }, { status: 401 })
	}

	const loggedUser = { id: user.id, username: user.username }
	const token = jwt.sign(loggedUser, JWT_SECRET, {
		expiresIn: '2 days'
	})

	cookies.set('authToken', token, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'strict'
	})

	return json({ message: 'Login successful', token })
}
