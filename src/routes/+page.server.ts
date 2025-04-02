import type { PageServerLoad } from './$types'
import { handlePageSlug } from '$lib/notes'

export const load = (async ({ locals: { db, user } }) => {
	const { page } = await handlePageSlug(db, user)

	return { ...page }
}) satisfies PageServerLoad
