import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { users } from '$lib/schema'
import { eq } from 'drizzle-orm'

/**
 * Determine if a username is already taken
 */
export const GET: RequestHandler = async ({ locals, url }) => {
	const username = url.searchParams.get('username')
	if (!username) {
		return json({ message: 'Missing or invalid URL paramter' }, { status: 500 })
	}

	const maybe_user = await locals.db
		.select()
		.from(users)
		// Usernames should be case insensitive
		.where(eq(users.username, username.toLowerCase()))
		.get()

	const isUsernameAvailable = maybe_user ? false : true
	return json(isUsernameAvailable, {
		headers: {
			'cache-control': 'public, max-age=300'
		}
	})
}
