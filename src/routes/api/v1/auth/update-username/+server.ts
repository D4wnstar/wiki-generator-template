import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { users } from '$lib/schema'
import { eq } from 'drizzle-orm'

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ message: 'User not logged in' }, { status: 401 })
	}

	const { newUsername } = await request.json()
	if (!newUsername) {
		return json({ message: 'Missing new username' })
	}

	try {
		await locals.db
			.update(users)
			.set({
				username: newUsername
			})
			.where(eq(users.username, locals.user.username))
		return json({ message: 'Username updated successfully' })
	} catch (error) {
		//@ts-expect-error Errors usually have a message
		return json({ message: `Error updating username: ${error.message}` })
	}
}
