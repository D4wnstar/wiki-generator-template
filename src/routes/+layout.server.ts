import { notes, wikiSettings } from '$lib/schema'
import { error } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'
import { eq } from 'drizzle-orm'
import { createNotesTree } from '$lib/notes'
import type { AutocompleteOption } from '@skeletonlabs/skeleton'
import { wikiTitle } from '$lib/stores'

export const load = (async ({ locals: { db } }) => {
	const rows = await db.select().from(notes).where(eq(notes.frontpage, false))

	if (rows.length === 0) {
		error(404, 'Could not find notes during root layout loading')
	}

	const pages = rows.sort((a, b) => a.path.localeCompare(b.path))
	const notesTreeView = createNotesTree(pages)
	const noteTitles: AutocompleteOption<string>[] = pages.map((page) => {
		return {
			label: page.alt_title ?? page.title,
			value: page.alt_title?.toLocaleLowerCase() ?? page.title.toLocaleLowerCase(),
			meta: { slug: page.slug }
		}
	})

	const settings = await db.select().from(wikiSettings).get()
	if (!settings) {
		error(500, 'Failed to fetch wiki settings')
	}

	wikiTitle.set(settings.title)

	return { noteTitles, notesTreeView, settings }
}) satisfies LayoutServerLoad
