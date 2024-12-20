import { handlePageSlug } from '$lib/notes'
import type { PageServerLoad } from './$types'

export const load = (async ({ locals: { db, user }, params: { slug } }) => {
	const { page } = await handlePageSlug(db, user, slug)
	return { ...page }
}) satisfies PageServerLoad
