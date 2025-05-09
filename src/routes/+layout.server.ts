import { wikiSettings } from '$lib/schema'
import { error } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

export const load = (async ({ locals: { db, user } }) => {
	// Select the setting and pass them on to the store/layout
	const settings = await db.select().from(wikiSettings).get()
	if (!settings) {
		error(500, 'Failed to fetch wiki settings')
	}

	return { settings, user }
}) satisfies LayoutServerLoad
