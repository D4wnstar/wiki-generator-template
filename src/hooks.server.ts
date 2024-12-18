import type { Handle } from '@sveltejs/kit'
import { drizzle } from 'drizzle-orm/libsql'
import cookie from 'cookie'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '$env/static/private'

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.db = drizzle(`file:static/data.db`)

	// Check if a user is logged in by seeing if there is a JWT in the tokens
	const cookies = cookie.parse(event.request.headers.get('cookie') ?? '')
	const token = cookies.authToken

	if (token) {
		try {
			const user = jwt.verify(token, JWT_SECRET)
			//@ts-expect-error jwt can't know what the contents of the token are
			event.locals.user = user
		} catch (error) {
			return resolve(event)
		}
	} else {
		event.locals.user = null
	}

	return resolve(event)
}
