import { eq, and, or, isNull } from 'drizzle-orm'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { JSDOM } from 'jsdom'
import {
	notes,
	details,
	sidebarImages,
	type NoteRow,
	type DetailsRow,
	type SidebarImageRow
} from './schema'
import type { LoggedUser } from './types'
import { getAllowedUsersFilter } from './utils'
import { error } from '@sveltejs/kit'

/**
 * Common handling function for both the front page and slug-navigated pages.
 * Meant to be used in the page.server.ts load function.
 * @param db A Drizzle LibSQLDatabase instance
 * @param user The currently logged-in user, if any
 * @param route The route of the page to handle. Leave undefined for the front page
 * @returns The page data and its content
 */
export async function handlePageSlug(
	db: LibSQLDatabase,
	user: LoggedUser | null,
	route: string | undefined = undefined
) {
	// Find page based on route or the frontpage flag
	const pageCondition = route ? eq(notes.route, route) : eq(notes.frontpage, true)
	const isUserAllowed = user ? getAllowedUsersFilter(user.username, 'notes') : undefined

	const rows = await db
		.select()
		.from(notes)
		.leftJoin(details, eq(notes.path, details.note_path))
		.leftJoin(sidebarImages, eq(notes.path, sidebarImages.note_path))
		.where(
			// The user must either need no permission or be allowed in the page
			and(pageCondition, or(isNull(notes.allowed_users), isUserAllowed))
		)
	if (rows.length === 0) {
		error(404, 'Could not find this page. Are you sure you have the right link?')
	}

	const allowedUsers = rows[0].notes.allowed_users?.toLocaleLowerCase().split('; ')
	if (allowedUsers) {
		if (!user?.username) {
			error(401, 'You are not allowed to see this page. Please log in.')
		}
		if (!allowedUsers.includes(user.username)) {
			error(403, 'You are not allowed to see this page.')
		}
	}

	// Uniqueness of each element is guaranteed with hashmaps
	const pageMap = rows.reduce<{
		note: NoteRow
		details: Map<number, DetailsRow>
		sidebarImages: Map<number, SidebarImageRow>
	}>(
		(acc, row) => {
			if (row.details) {
				acc.details.set(row.details.order, row.details)
			}

			if (row.sidebar_images) {
				acc.sidebarImages.set(row.sidebar_images.order, row.sidebar_images)
			}

			return acc
		},
		{
			note: rows[0].notes,
			details: new Map<number, DetailsRow>(),
			sidebarImages: new Map<number, SidebarImageRow>()
		}
	)

	const page = {
		note: pageMap.note,
		details: [...pageMap.details.values()],
		sidebarImages: [...pageMap.sidebarImages.values()]
	}

	// Sort details and sidebar images by the given order
	page.details.sort((d1, d2) => d1.order - d2.order)
	page.sidebarImages.sort((img1, img2) => img1.order - img2.order)

	page.note.html_content = hideSecretBlocks(page.note.html_content, user?.username)

	return page
}

/**
 * Hide secret blocks from HTML content based on user permissions
 * @param html The HTML content to process
 * @param username The current user's username, if any
 * @returns The HTML content with unauthorized secret blocks removed
 */
export function hideSecretBlocks(html: string, username: string | undefined): string {
	// Create a DOM document from the HTML
	const dom = new JSDOM(html)
	const document = dom.window.document

	// Find all sections with data-allowed-users attribute
	const secretBlocks = document.querySelectorAll('section[data-allowed-users]')

	// Process each secret element
	secretBlocks.forEach((element) => {
		// Get the allowed users from the attribute
		const allowedUsers = element.getAttribute('data-allowed-users')

		// If no users are specified, leave the element as is
		if (!allowedUsers) return

		// Split the allowed users by semicolon
		const allowedUsersList = allowedUsers
			.split(';')
			.map((user) => user.trim())
			.filter((user) => user.length > 0)

		// If no users are specified, or if the user is authorized, keep the block
		if (allowedUsersList.length === 0 || (username && allowedUsersList.includes(username))) {
			return
		}

		// If the user is not authorized, remove the element
		element.remove()
	})

	// Return the modified HTML
	return document.body.innerHTML
}
