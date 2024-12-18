import type { TreeViewNode } from '@skeletonlabs/skeleton'
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
import rehypeParse from 'rehype-parse'
import rehypeStringify from 'rehype-stringify'
import { unified } from 'unified'
import rehypeAuthorizeLinks from './rehype/rehype-authorize-links'
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
	const isUserAllowed = user ? getAllowedUsersFilter(user.username, 'notes') : undefined
	const isUserAllowedChunks = user
		? getAllowedUsersFilter(user.username, 'noteContents')
		: undefined

	// Current page must match the URL slug or be the frontpage, depending on how the function is called
	const pageCondition = slug ? eq(notes.slug, slug) : eq(notes.frontpage, true)

	const rows = await db
		.select()
		.from(notes)
		.leftJoin(noteContents, eq(notes.id, noteContents.note_id))
		.leftJoin(details, eq(notes.id, details.note_id))
		.leftJoin(sidebarImages, eq(notes.id, sidebarImages.note_id))
		.where(
			and(
				pageCondition,
				// The user must either need no permission or be allowed in the page
				or(isNull(notes.allowed_users), isUserAllowed),
				// and in each individual chunk
				or(isNull(noteContents.allowed_users), isUserAllowedChunks)
			)
		)

	if (rows.length === 0) {
		error(404, 'Could not find page or you are not authorized to see it.')
	}

	// Reduce rows to a more manageable data structure
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
			contents: new Map<number, NoteContentsRow>(), // Adjust the type as needed
			details: new Map<number, DetailsRow>(), // Adjust the type as needed
			sidebarImages: new Map<number, SidebarImageRow>() // Adjust the type as needed
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

	let pageContent = page.contents.reduce((acc, c) => acc + c.text, '')

	// Initialize the data needed to remove links that the current user shouldn't see
	const pathToAllowedUsers = (
		await db
			.select({
				path: notes.slug,
				allowedUsers: notes.allowed_users
			})
			.from(notes)
	).reduce((acc, row) => {
		const allowedUsers = row.allowedUsers?.split(';')
		if (allowedUsers) {
			acc.set(row.path, allowedUsers)
		}

		return acc
	}, new Map<string, string[]>())

	// Initialize the rehype processor to modify the anchor tags
	const processor = unified()
		.use(rehypeParse, { fragment: true })
		.use(rehypeAuthorizeLinks, user?.username, pathToAllowedUsers)
		.use(rehypeStringify)

	const stripLinks = async (text: string) => (await processor.process(text)).toString()

	// Run the processor on the main page, the details and the sidebar captions
	pageContent = await stripLinks(pageContent)
	page.details = await Promise.all(
		page.details.map(async (d) => {
			d.detail_content = await stripLinks(d.detail_content)
			return d
		})
	)
	page.sidebarImages = await Promise.all(
		page.sidebarImages.map(async (si) => {
			if (si.caption) si.caption = await stripLinks(si.caption)
			return si
		})
	)

	return { page, pageContent }
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
	path: string
	slug: string
}

export function getNotesTree(pages: NoteRow[]) {
	const files: File[] = pages.map((p) => {
		return { ...p, type: 'file' }
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

export function createNotesTree(notes: NoteRow[]): TreeViewNode[] {
	const tree: TreeViewNode[] = []
	const paths = notes.map((note) => note.path)

	// Iterate through all of the notes
	for (const note of notes) {
		// Break down the path element-by-element
		const pathPieces = note.path.split('/').filter((elem) => elem !== '')
		let currPath = ''
		let currentlyIn: TreeViewNode | null = null

		// Iterate through each piece of the path to make the HTML element for each node in the tree,
		// not just the base name
		for (const piece of pathPieces) {
			currPath += '/' + piece
			const sluggedPath = slugPath(currPath)
			let content: string

			// If the current path is among the note paths, that means it's a note and should have a link to it
			if (paths.includes(currPath.slice(1))) {
				// Also check if the note in question has an alt name before making the link
				const linkText = note.alt_title ?? piece
				content = `<a href="/${sluggedPath}"><button class="h-full w-full text-left py-1">${linkText}</button></a>`
			} else {
				// otherwise it should just be a text box containing the intermediate path
				content = `<p class="py-1">${piece}</p>`
			}

			const newNode: TreeViewNode = {
				id: sluggedPath,
				content: content
			}

			// As the tree is a nested structure, we need to keep track of what node we are in
			// to properly add children nodes
			let skip = false
			if (!currentlyIn) {
				for (const node of tree) {
					if (node.content === content) {
						currentlyIn = node
						skip = true
						break
					}
				}
				if (skip) {
					continue
				}

				// If we are at the top level, just append the newly created node to the tree
				tree.push(newNode)
				currentlyIn = newNode
			} else {
				// If we are in a node, append the new one to its children,
				// creating the array if it doesn't exist
				if (currentlyIn.children === undefined) {
					currentlyIn.children = [newNode]
					currentlyIn = newNode
				} else {
					// Check for duplicates before appending
					for (const node of currentlyIn.children) {
						if (node.content === content) {
							currentlyIn = node
							skip = true
							break
						}
					}
					if (skip) {
						continue
					}

					currentlyIn.children!.push(newNode)
					currentlyIn = newNode
				}
			}
		}
	}

	// console.log(tree)

	return tree
}
