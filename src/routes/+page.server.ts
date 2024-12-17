import type { PageServerLoad } from './$types'
import { handlePageSlug } from '$lib/notes'

export const load = (async ({ locals: { db, user } }) => {
	const { page, pageContent } = await handlePageSlug(db, user)

	return { ...page, pageContent }
}) satisfies PageServerLoad
