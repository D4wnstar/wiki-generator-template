import { slug } from 'github-slugger'
import {
	details,
	noteContents,
	notes,
	sidebarImages,
	type DetailsRow,
	type NoteContentsRow,
	type NoteRow,
	type SidebarImageRow
} from '$lib/schema'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { eq, and, or, isNull } from 'drizzle-orm'
import type { LoggedUser } from './types'
import { getAllowedUsersFilter } from './utils'
import { error } from '@sveltejs/kit'

/**
 * Common handling function for both the front page and slug-navigated pages.
 * Meant to be used in the page.server.ts load function.
 * @param db A Drizzle LibSQLDatabase instance
 * @param user The currently logged-in user, if any
 * @param slug The slug of the page to handle. Leave undefined for the front page
 * @returns The page data and its content
 */
export async function handlePageSlug(
	db: LibSQLDatabase,
	user: LoggedUser | null,
	slug: string | undefined = undefined
) {
	// const isUserAllowed = user ? getAllowedUsersFilter(user.username, 'notes') : undefined
	const isUserAllowedChunks = user
		? getAllowedUsersFilter(user.username, 'noteContents')
		: undefined

	// Current page must match the URL slug or be the frontpage, depending on how the function is called
	const pageCondition = slug ? eq(notes.slug, slug) : eq(notes.frontpage, true)

	const rows = await db
		.select()
		.from(notes)
		.leftJoin(noteContents, eq(notes.path, noteContents.note_path))
		.leftJoin(details, eq(notes.path, details.note_path))
		.leftJoin(sidebarImages, eq(notes.path, sidebarImages.note_path))
		.where(
			and(
				pageCondition,
				// The user must either need no permission or be allowed in the page
				// or(isNull(notes.allowed_users), isUserAllowed),
				// and in each individual chunk
				or(isNull(noteContents.allowed_users), isUserAllowedChunks)
			)
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
		contents: Map<number, NoteContentsRow>
		details: Map<number, DetailsRow>
		sidebarImages: Map<number, SidebarImageRow>
	}>(
		(acc, row) => {
			if (row.note_contents) {
				acc.contents.set(row.note_contents.chunk_id, row.note_contents)
			}

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
			contents: new Map<number, NoteContentsRow>(),
			details: new Map<number, DetailsRow>(),
			sidebarImages: new Map<number, SidebarImageRow>()
		}
	)

	const page = {
		note: pageMap.note,
		contents: [...pageMap.contents.values()],
		details: [...pageMap.details.values()],
		sidebarImages: [...pageMap.sidebarImages.values()]
	}

	// Sort details by the given order
	page.details.sort((detail1, detail2) => (detail1.order > detail2.order ? 1 : -1))

	// and also sidebar images
	page.sidebarImages.sort((img1, img2) => (img1.order > img2.order ? 1 : -1))

	// const beforeLinkSelect = Date.now()
	// Initialize the data needed to remove links that the current user shouldn't see
	// const pathToAllowedUsers = (
	// 	await db
	// 		.select({
	// 			path: notes.slug,
	// 			allowedUsers: notes.allowed_users
	// 		})
	// 		.from(notes)
	// ).reduce((acc, row) => {
	// 	const allowedUsers = row.allowedUsers?.split(';')
	// 	if (allowedUsers) {
	// 		acc.set(row.path, allowedUsers)
	// 	}

	// 	return acc
	// }, new Map<string, string[]>())
	// const pathToAllowedUsers = new Map<string, string[]>()
	// const afterLinkSelect = Date.now()
	// console.log(`And ${afterLinkSelect - beforeLinkSelect} ms fetching link-related data`)
	// console.log(`In total, that's ${afterLinkSelect - beforeLinkSelect + afterDb - beforeDb} ms`)

	// Initialize the rehype processor to modify the anchor tags
	// const processor = unified()
	// 	.use(rehypeParse, { fragment: true })
	// 	.use(rehypeAuthorizeLinks, user?.username, pathToAllowedUsers)
	// 	.use(rehypeStringify)

	// const stripLinks = async (text: string) => (await processor.process(text)).toString()

	// // Run the processor on the main page, the details and the sidebar captions
	// page.contents = await Promise.all(
	// 	page.contents.map(async (c) => {
	// 		c.text = await stripLinks(c.text)
	// 		return c
	// 	})
	// )
	// page.details = await Promise.all(
	// 	page.details.map(async (d) => {
	// 		d.detail_content = await stripLinks(d.detail_content)
	// 		return d
	// 	})
	// )
	// page.sidebarImages = await Promise.all(
	// 	page.sidebarImages.map(async (si) => {
	// 		if (si.caption) si.caption = await stripLinks(si.caption)
	// 		return si
	// 	})
	// )

	return page
}

export async function fetchNoteTransclusion(notePath: string): Promise<NoteContentsRow[]> {
	const res = await fetch(`/api/v1/note-contents?note_path=${notePath}`)
	const json = await res.json()
	if (!res.ok) {
		console.error(json.message)
		return []
	}

	return json.contents
}

export function slugPath(path: string): string {
	const elems = path.split('/').filter((elem) => elem !== '')
	const slugged = []
	for (const elem of elems) {
		slugged.push(slug(elem))
	}

	return slugged.join('/')
}

export type Folder = {
	type: 'folder'
	title: string
	children: (File | Folder)[]
}

export type File = {
	type: 'file'
	title: string
	search_terms: string[]
	path: string
	slug: string
	alt_title?: string | null | undefined
}

export function getNotesTree(
	pages: {
		path: string
		slug: string
		title: string
		search_terms: string
		alt_title: string | null
	}[]
) {
	const files: File[] = pages.map((p) => {
		return { ...p, type: 'file', search_terms: p.search_terms.split(';') }
	})
	const root: Folder = {
		type: 'folder',
		title: 'Root',
		children: []
	}

	// Go through each file
	for (const file of files) {
		const parts = file.path.split('/')
		let currentFolder = root

		// Go through each part of the path
		for (const [index, part] of parts.entries()) {
			if (index === parts.length - 1) {
				// The last part of the path is the parent folder, so add the
				// the current file to it
				currentFolder.children.push(file)
			} else {
				// If it's not the last part, check if the folder exists
				let childFolder = currentFolder.children.find((child) => {
					return child.type === 'folder' && child.title === part
				}) as Folder | undefined

				// If it doesn't, create it and add it to the tree
				if (!childFolder) {
					childFolder = {
						type: 'folder',
						title: part,
						children: []
					}
					currentFolder.children.push(childFolder)
				}

				currentFolder = childFolder
			}
		}
	}

	return root
}

export function sortFiles(a: File | Folder, b: File | Folder) {
	if (a.type === 'folder' && b.type === 'file') {
		return -1
	} else if (a.type === 'file' && b.type === 'folder') {
		return 1
	} else {
		return a.title.localeCompare(b.title)
	}
}

export function getPathCombinations(path: string): string[] {
	const pathParts = path.split('/').filter((part) => part !== '')
	let currentPath = ''
	const combinations: string[] = []

	for (const part of pathParts) {
		currentPath = currentPath ? `${currentPath}/${part}` : part
		combinations.push(currentPath)
	}

	return combinations
}

export function deletePathAndDescendants(set: Set<string>, path: string) {
	const paths = Array.from(set)
	const pathsToDelete = paths.filter((p) => p.startsWith(path))
	pathsToDelete.forEach((p) => set.delete(p))
}
