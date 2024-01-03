import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit'
import { error } from '@sveltejs/kit'
import type { Database } from '$lib/database.types.js'
import { createNotesTree } from '$lib/notes.js'
import { wikiTitle } from '$lib/stores.js'

export const load = async ({ fetch, data, depends }) => {
	depends('supabase:auth')

	const supabase = createSupabaseLoadClient<Database>({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		event: { fetch },
		serverSession: data.session
	})

	const {
		data: { session }
	} = await supabase.auth.getSession()

    const { data: notes, error: dbError } = await supabase
        .from('notes')
        .select(`
            path
        `)
		.eq('frontpage', false)

    if (dbError) {
        console.error(dbError.message)
        error(404, `Error fetching notes during layout loading. Supabase error message: ${dbError.message}`)
    } else if (!notes || notes.length === 0) {
        error(404, `Could not find notes during layout loading.`)
	}

	const paths = notes.map((note) => note.path).sort((a, b) => a.localeCompare(b))
	const notesTreeView = createNotesTree(paths)

    
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

	wikiTitle.set(wikiSettings.settings.title)

	const settings = wikiSettings.settings
	return { supabase, session, paths, notesTreeView, settings }
}

export const prerender = true