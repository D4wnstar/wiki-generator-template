import { wikiSettings } from '$lib/schema'
import { error } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'
import { API } from '$lib/api'

export const load = (async ({ locals: { db, user }, fetch }) => {
	const settings = await db.select().from(wikiSettings).get()
	if (!settings) {
		error(500, 'Failed to fetch wiki settings')
	}

	// Get page metadata for the navbar
	const pages = await API.publicPages(fetch)

	return { settings, user, pages }
}) satisfies LayoutServerLoad
