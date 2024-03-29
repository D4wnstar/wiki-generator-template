import { error, type Actions, fail } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { mergeContent } from '$lib/auth'

export const load = (async ({ locals: { supabase, getSession } }) => {
	const { data: note, error: dbError } = await supabase
		.from('notes')
		.select(
			`
            *,
            note_contents (*),
            backreferences (*),
            details (*),
            sidebar_images (*)
        `
		)
		.eq('frontpage', true)
		.limit(1)
		.maybeSingle()

	if (dbError) {
		console.error(dbError.message)
		error(500, `Error fetching frontpage. Supabase error message: ${dbError.message}`)
	} else if (!note) {
		// The authorization is taken care of by the RLS policy on the database so we can't
		// differentiate between 404 Not Found and 403 Forbidden as unauthorized pages are just
		// not returned at all, so they are effectively not found
		error(404, `Could not find frontpage or you are not authorized to see it.`)
	}

	// The backreferences need to be filtered out based on the authorization status of the user
	const backrefSlugs = note.backreferences.map((backref) => backref.slug)

	// Fetch the slug of the notes that are backreferenced
	const { data: backrefNotes, error: backrefError } = await supabase
		.from('notes')
		.select(`slug`)
		.in('slug', backrefSlugs)

	if (backrefError) {
		console.error(backrefError.message)
		error(
			500,
			`Error fetching the backreferenced notes for frontpage. Supabase error message: ${backrefError.message}`
		)
	}

	// Sort details by the given order
    note.details.sort((detail1, detail2) => detail1.order > detail2.order ? 1 : -1)

	// and also sidebar images
    note.sidebar_images.sort((img1, img2) => img1.order > img2.order ? 1 : -1)

	// Since only authorized notes will be returned, we can used the returned slugs to filter out
	// all the backreferences that don't get anything back
	note.backreferences = note.backreferences.filter((backref) =>
		backrefNotes.map((ref) => ref.slug).includes(backref.slug)
	)

	// Then we sort the backreferences for consistency
	note.backreferences = note.backreferences.sort((a, b) =>
		a.display_name.localeCompare(b.display_name)
	)

	// Also check which references (aka anchor tags) link to authorized pages
	// The referenced notes' slugs are returned and used to disable links in the browser
	const { data: refNotes, error: refError } = await supabase
		.from('notes')
		.select(`slug`)
		.in('slug', note.references ?? [])

	if (refError) {
		console.error(refError.message)
		error(
			500,
			`Error fetching the referenced notes for frontpage. Supabase error message: ${refError.message}`
		)
	}

	const session = await getSession()
	const pageContent = mergeContent(note.note_contents, session?.user?.user_metadata?.username)

	return { ...note, refNotes, pageContent }
}) satisfies PageServerLoad

export const actions = {
	updateInfo: async ({ locals, request }) => {
		const data = await request.formData()
		const email = data.get('email')
		const username = data.get('username')

		if (!email || !username) {
			return fail(400, { email, username, missing: true, success: false })
		}

		const { error } = await locals.supabase.auth.updateUser({
			email: email.toString(),
			data: {
				username: username.toString()
			}
		})

		if (!error) return fail(500, { email, username, missing: false, success: false })

		return { email, username, missing: false, success: true }
	},

	updatePass: async ({ locals, request }) => {
		const data = await request.formData()
		const oldPass = data.get('old-password')
		const newPass = data.get('new-password')
		const newPassConfirm = data.get('new-password-confirm')

		if (!oldPass || !newPass || !newPassConfirm) {
			return { success: false }
		} else if (newPass !== newPassConfirm) {
			return { success: false }
		}

		const { error } = await locals.supabase.auth.updateUser({
			password: newPass.toString()
		})

		return error ? { success: false } : { success: true }
	}
} satisfies Actions
