import { redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import type { NoteContentsRow, NoteRow } from '$lib/schema'

export const load = (async ({ locals: { user }, fetch }) => {
	if (!user) {
		redirect(303, '/login')
	}

	const res = await fetch('/api/v1/auth/fetch-secrets')
	const data = (await res.json()) as {
		pages: NoteRow[]
		chunks: { note_contents: NoteContentsRow | null; notes: NoteRow }[]
	}
	return { user, secretPages: data.pages, secretChunks: data.chunks }
}) satisfies PageServerLoad

export const actions = {
	logout: async ({ cookies, locals }) => {
		cookies.delete('authToken', {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax'
		})
		locals.user = null

		return { message: 'Logged out successfully', success: true }
	}
} satisfies Actions

export const prerender = false
