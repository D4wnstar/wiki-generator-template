import type { PageServerLoad } from './$types'
import { handlePageSlug } from '$lib/notes'

export const load = (async ({ locals: { db, user } }) => {
	return await handlePageSlug(db, user)
}) satisfies PageServerLoad

// Frontpage cannot have content requiring authentication
export const prerender = true
