import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, request }) => {
    const data = await request.formData()
		const email = data.get('email')
		const username = data.get('username')

		if (!email || !username) {
			return json({email: email, username: username, missing: true, success: false })
		}

		const { error } = await locals.supabase.auth.updateUser({
			email: email.toString(),
			data: {
				username: username.toString()
			}
		})

		if (!error) return json({ email: email,  username: username, missing: false, success: false })

		return json({ email, username, missing: false, success: true })
};