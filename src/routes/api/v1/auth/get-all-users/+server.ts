import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { ADMIN_API_KEY } from '$env/static/private'
import { users } from '$lib/schema'

export const GET: RequestHandler = async ({ request, locals: { db } }) => {
	const apiKey = request.headers.get('Authorization')
	if (!apiKey) {
		return json({ message: 'Missing API key' }, { status: 400 })
	}

	if (apiKey.replace(/^Bearer /, '') !== ADMIN_API_KEY) {
		return json({ message: 'Invalid API key' }, { status: 401 })
	}

	const rows = await db.select().from(users).all()

	return json({ message: 'Successfully fetched list of users', users: rows })
}
