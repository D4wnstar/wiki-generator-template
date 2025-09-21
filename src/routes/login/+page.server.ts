import { users } from '$lib/schema'
import { fail, redirect, type Actions } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '$env/static/private'
import type { LoggedUser } from '$lib/types'
import type { PageServerLoad } from './$types'

export const load = (async ({ locals: { user } }) => {
	if (user) redirect(303, '/account')
	return {}
}) satisfies PageServerLoad

export const actions = {
	login: async ({ cookies, request, locals }) => {
		const data = await request.formData()
		const username = data.get('username')
		const password = data.get('password')
		const errorData = {
			type: 'login',
			username,
			color: 'error',
			success: false
		}

		if (!username || !password) {
			return fail(400, { ...errorData, message: 'Missing username or password.' })
		}

		const lowercaseUser = username.toString().toLowerCase()
		let user
		try {
			user = await locals.db.select().from(users).where(eq(users.username, lowercaseUser)).get()
		} catch (error) {
			console.error(error)
			return fail(500, { ...errorData, message: 'Internal server error.' })
		}

		if (!user) {
			return fail(400, { ...errorData, message: 'No user found with this username.' })
		}

		const isPasswordCorrect = await bcrypt.compare(password.toString(), user.password)
		if (!isPasswordCorrect) {
			return fail(400, { ...errorData, message: 'Wrong password.' })
		}

		const loggedUser = { id: user.id, username: user.username }
		const token = jwt.sign(loggedUser, JWT_SECRET, {
			expiresIn: '1 day'
		})
		locals.user = jwt.verify(token, JWT_SECRET) as LoggedUser

		cookies.set('authToken', token, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax'
		})

		return { type: 'login', message: 'Successfully logged in!', color: 'success', success: true }
	},

	signup: async ({ cookies, request, locals }) => {
		const data = await request.formData()
		const username = data.get('username')
		const password = data.get('password')
		const errorData = {
			type: 'signup',
			username,
			color: 'error',
			success: false
		}

		if (!username || !password) {
			return fail(400, { ...errorData, message: 'Missing username or password.' })
		}

		const hashedPassword = await bcrypt.hash(password.toString(), 10)

		try {
			const user = await locals.db
				.insert(users)
				.values({
					username: username.toString().toLowerCase(),
					password: hashedPassword
				})
				.returning()
				.get()

			const loggedUser = { id: user.id, username: user.username }
			const token = jwt.sign(loggedUser, JWT_SECRET, {
				expiresIn: '1 day'
			})
			locals.user = jwt.verify(token, JWT_SECRET) as LoggedUser

			cookies.set('authToken', token, {
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: 'strict'
			})

			return {
				type: 'signup',
				message: 'Successfully registered!',
				color: 'success',
				success: true
			}
		} catch (error) {
			console.error(error)
			return fail(500, { ...errorData, message: 'Internal server error.' })
		}
	}
} satisfies Actions

export const prerender = false
