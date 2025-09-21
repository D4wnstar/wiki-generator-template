import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { users } from '$lib/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { passwordRules } from '$lib/auth'

/**
 * Update the currently logged-in user's password.
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	const currentUser = locals.user
	if (!currentUser) {
		return json({ message: 'No user logged in' }, { status: 401 })
	}

	const { newPass, newPassConfirm } = await request.json()
	if (!newPass || !newPassConfirm) {
		return json({ message: 'Missing new password or confirmation' }, { status: 400 })
	}

	const user = await locals.db
		.select()
		.from(users)
		.where(eq(users.username, currentUser.username))
		.get()
	if (!user) {
		return json({ message: 'No user found with this username' }, { status: 400 })
	}

	const isNewPassValid = passwordRules.test(newPass)
	if (!isNewPassValid) {
		return json({ message: 'New password is not valid' }, { status: 400 })
	}

	if (newPass !== newPassConfirm) {
		return json({ message: 'Passwords do not match' }, { status: 400 })
	}

	const hashedPassword = await bcrypt.hash(newPassConfirm, 10)
	try {
		await locals.db
			.update(users)
			.set({
				password: hashedPassword
			})
			.where(eq(users.username, currentUser.username))
		return json({ message: 'Successfully update password' })
	} catch (error) {
		return json({ message: `Error updating password: ${error}` }, { status: 500 })
	}
}
