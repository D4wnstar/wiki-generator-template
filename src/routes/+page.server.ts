import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals: { supabase } }) => {
    const { data: note, error: dbError } = await supabase
        .from('notes')
        .select(`
            *,
            backreferences (*),
            details (*),
            sidebar_images (*)
        `)
        .eq('frontpage', true)
        .limit(1)
        .maybeSingle()

    if (dbError) {
        console.error(dbError.message)
        error(404, `Error fetching frontpage. Supabase error message: ${dbError.message}`)
    } else if (!note) {
        error(404, `Could not find frontpage.`)
    } else {
        return note
    }
}) satisfies PageServerLoad;