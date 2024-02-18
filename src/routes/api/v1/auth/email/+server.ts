import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ( { locals, url }) => {
    const email = url.searchParams.get("email")
    if (!email) return json(false)

    const { data: select, error: selectError } = await locals.supabaseService
        .from("profiles")
        .select("email")
        .eq("email", email)
        .limit(1)
        .maybeSingle()

    if (selectError) console.error(`Error when fetching user emails: ${selectError.message}`)
    const isEmailAvailable = (select || selectError) ? false : true
    return json(isEmailAvailable);
};