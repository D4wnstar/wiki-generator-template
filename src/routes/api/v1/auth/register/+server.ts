import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import bcrypt from 'bcryptjs'
import { users } from '$lib/schema'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '$env/static/private'

export const POST: RequestHandler = async ({ request, locals, cookies }) => {
	const { username, password } = await request.json()

	if (!username || !password) {
		return json({ message: 'Missing username or password' }, { status: 400 })
	}

	const hashedPassword = await bcrypt.hash(password, 10)

	try {
		const user = await locals.db
			.insert(users)
			.values({
				username: username.toLowerCase(),
				password: hashedPassword
			})
			.returning()
			.get()

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

		return json({ message: 'Successfully registered user' })
	} catch (error) {
		return json({ message: 'Error registering user' }, { status: 500 })
	}
}
