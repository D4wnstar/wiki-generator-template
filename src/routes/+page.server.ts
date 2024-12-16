import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import {
	details,
	noteContents,
	notes,
	sidebarImages,
	type DetailsRow,
	type NoteRow,
	type NoteContentsRow,
	type SidebarImageRow
} from '$lib/schema'
import { eq } from 'drizzle-orm'

export const load = (async ({ locals: { db } }) => {
	const rows = await db
		.select()
		.from(notes)
		.leftJoin(noteContents, eq(notes.id, noteContents.note_id))
		.leftJoin(details, eq(notes.id, details.note_id))
		.leftJoin(sidebarImages, eq(notes.id, sidebarImages.note_id))
		.where(eq(notes.frontpage, true))

	if (rows.length === 0) {
		error(404, 'Could not find frontpage')
	}

	// if (dbError) {
	// 	console.error(dbError.message)
	// 	error(500, `Error fetching frontpage. Supabase error message: ${dbError.message}`)
	// } else if (!note) {
	// 	// The authorization is taken care of by the RLS policy on the database so we can't
	// 	// differentiate between 404 Not Found and 403 Forbidden as unauthorized pages are just
	// 	// not returned at all, so they are effectively not found
	// 	error(404, `Could not find frontpage or you are not authorized to see it.`)
	// }

	// Reduce rows to a more manageable data structure
	const frontpage = rows.reduce<{
		note: NoteRow
		contents: NoteContentsRow[]
		details: DetailsRow[]
		sidebarImages: SidebarImageRow[]
	}>(
		(acc, row) => {
			const note = row.notes
			const contents = row.note_contents
			const details = row.details
			const sidebarImages = row.sidebar_images

			if (note) acc.note = note

			if (contents) {
				acc.contents.push(contents)
			}

			if (details) {
				acc.details.push(details)
			}

			if (sidebarImages) {
				acc.sidebarImages.push(sidebarImages)
			}

			return acc
		},
		{
			note: rows[0].notes,
			contents: [],
			details: [],
			sidebarImages: []
		}
	)

	// Sort details by the given order
	frontpage.details.sort((detail1, detail2) => (detail1.order > detail2.order ? 1 : -1))

	// and also sidebar images
	frontpage.sidebarImages.sort((img1, img2) => (img1.order > img2.order ? 1 : -1))

	// Also check which references (aka anchor tags) link to authorized pages
	// The referenced notes' slugs are returned and used to disable links in the browser
	// const { data: refNotes, error: refError } = await supabase
	// 	.from('notes')
	// 	.select(`slug`)
	// 	.in('slug', note.references ?? [])

	// if (refError) {
	// 	console.error(refError.message)
	// 	error(
	// 		500,
	// 		`Error fetching the referenced notes for frontpage. Supabase error message: ${refError.message}`
	// 	)
	// }

	// const session = await getSession()
	// const pageContent = mergeContent(note.note_contents, session?.user?.user_metadata?.username)
	const pageContent = frontpage.contents.reduce((acc, c) => acc + c.text, '')

	return { ...frontpage, pageContent }
}) satisfies PageServerLoad

/*
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
*/
