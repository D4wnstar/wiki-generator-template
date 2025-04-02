import { notes, wikiSettings } from '$lib/schema'
import { error } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'
import { and, eq, isNull, or } from 'drizzle-orm'
import { getAllowedUsersFilter } from '$lib/utils'
import { getNotesTree, sortFiles } from '$lib/notes'

export const load = (async ({ locals: { db, user } }) => {
	// Select allowed pages
	const isUserAllowed = user ? getAllowedUsersFilter(user.username, 'notes') : undefined
	const rows = await db
		.select()
		.from(notes)
		.where(and(eq(notes.frontpage, false), or(isNull(notes.allowed_users), isUserAllowed)))

	if (rows.length === 0) {
		error(404, 'Could not find notes during root layout loading')
	}

	// Sort them and add them to the navigation tree and in the search bar
	const pages = rows
		.sort((a, b) => a.path.localeCompare(b.path))
		.map((p) => {
			const depth = p.slug.split('/').length
			return { ...p, depth }
		})
	const topLevelContent = getNotesTree(rows).children.sort(sortFiles)

	// Select the setting and pass them on to the store/layout
	const settings = await db.select().from(wikiSettings).get()
	if (!settings) {
		error(500, 'Failed to fetch wiki settings')
	}

	return { /* noteTitles, */ pages, settings, user, topLevelContent }
}) satisfies LayoutServerLoad

// export const prerender = 'auto'
