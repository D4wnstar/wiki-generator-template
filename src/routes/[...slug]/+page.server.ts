import { TURSO_AUTH_TOKEN, TURSO_URL } from '$env/static/private'
import { handlePageSlug } from '$lib/notes'
import { drizzle } from 'drizzle-orm/libsql'
import type { EntryGenerator, PageServerLoad } from './$types'
import { notes } from '$lib/schema'
import { eq } from 'drizzle-orm'

export const load = (async ({ locals: { db, user }, params: { slug } }) => {
	return await handlePageSlug(db, user, slug)
}) satisfies PageServerLoad

export const prerender = 'auto'
export const entries: EntryGenerator = async () => {
	const db = drizzle({
		connection: {
			url: TURSO_URL,
			authToken: TURSO_AUTH_TOKEN
		}
	})

	const prerenderableSlugs = await db
		.select({
			slug: notes.slug
		})
		.from(notes)
		.where(eq(notes.can_prerender, true))

	return prerenderableSlugs
}
