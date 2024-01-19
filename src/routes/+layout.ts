import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import { createBrowserClient, isBrowser, parse } from '@supabase/ssr'
import { error } from '@sveltejs/kit'
import type { Database } from '$lib/database.types.js'
import { createNotesTree } from '$lib/notes.js'
import { wikiTitle } from '$lib/stores.js'
import type { AutocompleteOption } from '@skeletonlabs/skeleton'

export const load = async ({ fetch, data, depends }) => {
	depends('supabase:auth')

	const supabase = createBrowserClient<Database>(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{
			global: { fetch },
			cookies: {
				get(key) {
					if (!isBrowser()) {
						return JSON.stringify(data.session)
					}
					
					const cookie = parse(document.cookie)
					return cookie[key]
				}
			},
		}
	)

	const {
		data: { session }
	} = await supabase.auth.getSession()

    // eslint-disable-next-line prefer-const
    let { data: notes, error: dbError } = await supabase
        .from('notes')
        .select(`
			title,
            path,
			slug
        `)
		.eq('frontpage', false)

    if (dbError) {
        console.error(dbError.message)
        error(404, `Error fetching notes during layout loading. Supabase error message: ${dbError.message}`)
    } else if (!notes || notes.length === 0) {
        error(404, `Could not find notes during layout loading.`)
	}

	notes = notes.sort((a, b) => a.path.localeCompare(b.path))
	const paths = notes.map((note) => note.path)
	const notesTreeView = createNotesTree(paths)

	const noteTitles: AutocompleteOption<string>[] = notes.map((note) => {
		return {
			label: note.title,
			value: note.title.toLocaleLowerCase(),
			meta: { slug: note.slug }
		}
	})

	const { data: wikiSettings, error: titleError } = await supabase
		.from('wiki_settings')
		.select('*')
		.limit(1)
		.maybeSingle()
    
    if (titleError) {
        console.error(titleError.message)
        error(500, `Error fetching wiki title. Supabase error message: ${titleError.message}`)
    } else if (!wikiSettings) {
        error(500, `Could not find wiki title.`)
    }

	wikiTitle.set(wikiSettings.settings?.title)

	const settings = wikiSettings.settings
	return { supabase, session, paths, noteTitles, notesTreeView, settings }
}

export const prerender = true