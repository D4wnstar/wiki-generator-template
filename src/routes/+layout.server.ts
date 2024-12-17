import { notes, wikiSettings } from '$lib/schema'
import { error } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'
import { and, eq, isNull, or } from 'drizzle-orm'
import { createNotesTree } from '$lib/notes'
import type { AutocompleteOption } from '@skeletonlabs/skeleton'
import { wikiTitle } from '$lib/stores'
import { getAllowedUsersFilter } from '$lib/utils'

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
	const pages = rows.sort((a, b) => a.path.localeCompare(b.path))
	const notesTreeView = createNotesTree(pages)
	const noteTitles: AutocompleteOption<string>[] = pages.map((page) => {
		return {
			label: page.alt_title ?? page.title,
			value: page.alt_title?.toLocaleLowerCase() ?? page.title.toLocaleLowerCase(),
			meta: { slug: page.slug }
		}
	})

	// Select the setting and pass them on to the store/layout
	const settings = await db.select().from(wikiSettings).get()
	if (!settings) {
		error(500, 'Failed to fetch wiki settings')
	}

	wikiTitle.set(settings.title)

	return { noteTitles, notesTreeView, settings, user }
}) satisfies LayoutServerLoad
