import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ( { locals, url } ) => {
    const username = url.searchParams.get("username")
    if (!username) return json(false)

    const { data: select, error: selectError } = await locals.supabaseService
        .from("profiles")
        .select("username")
        .eq("username", username)
        .limit(1)
        .maybeSingle()

    if (selectError) console.error(`Error when fetching usernames: ${selectError.message}`)
    const isUsernameAvailable = (select || selectError) ? false : true
    return json(isUsernameAvailable)
}