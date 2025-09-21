import { wikiSettings } from '$lib/schema'
import { error } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'
import type { NoteMeta } from '$lib/notes'

export const load = (async ({ locals: { db, user }, fetch }) => {
	const settings = await db.select().from(wikiSettings).get()
	if (!settings) {
		error(500, 'Failed to fetch wiki settings')
	}

	// Get page metadata for the navbar
	const res = await fetch('/api/v1/public-pages')
	let pages: NoteMeta[] = []
	if (res.ok) {
		pages = (await res.json()) as NoteMeta[]
	}

	return { settings, user, pages }
}) satisfies LayoutServerLoad
