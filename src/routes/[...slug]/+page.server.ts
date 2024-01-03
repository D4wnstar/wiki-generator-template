import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'
import { error } from '@sveltejs/kit';
import type { PageServerLoad, EntryGenerator } from './$types';
import type { Database } from '$lib/database.types';
import { createClient } from '@supabase/supabase-js';

export const load = (async ({ locals: { supabase }, params: { slug }}) => {
    const { data: note, error: dbError } = await supabase
        .from('notes')
        .select(`
            *,
            backreferences (*),
            details (*),
            sidebar_images (*)
        `)
        .eq('slug', slug)
        .limit(1)
        .maybeSingle()

    if (dbError) {
        console.error(dbError.message)
        error(404, `Error fetching note for slug ${slug}. Supabase error message: ${dbError.message}`)
    } else if (!note) {
        error(404, `Could not find note for slug ${slug}`)
    } else {
        note.backreferences = note.backreferences.sort((a, b) => a.display_name.localeCompare(b.display_name))
        return note
    }
}) satisfies PageServerLoad;

export const entries: EntryGenerator = async () => {
    const supabase = createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY)

    const { data, error } = await supabase
        .from('notes')
        .select("slug")

    if (error) {
        throw error
    } else if (!data) {
        throw new Error("Could not access data when generating prerendering entries")
    }

    return data.map((row) => {
        return { slug: row.slug }
    })
}