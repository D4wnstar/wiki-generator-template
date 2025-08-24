import { slug } from 'github-slugger'

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
	path: string
	children: Tree
	expanded: boolean
}

export type File = {
	type: 'file'
	title: string
	search_terms: string[]
	path: string
	slug: string
	alt_title?: string | null | undefined
}

export type Tree = (File | Folder)[]

export function getNotesTree(
	pages: {
		path: string
		slug: string
		title: string
		search_terms: string
		alt_title?: string | null
	}[]
) {
	const files: File[] = pages.map((p) => {
		return { ...p, type: 'file', search_terms: p.search_terms.split(';') }
	})
	const root: Folder = {
		type: 'folder',
		title: 'Root',
		path: '',
		children: [],
		expanded: true
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
					// File paths don't have a lead / for the root so by convention we avoid them here too
					const path = currentFolder.path ? currentFolder.path + '/' + part : part
					childFolder = {
						type: 'folder',
						title: part,
						path,
						children: [],
						expanded: false
					}
					currentFolder.children.push(childFolder)
				}

				currentFolder = childFolder
			}
		}
	}

	return root
}

export function sortFolderRecursively(folder: Folder) {
	folder.children.sort(sortFiles)
	for (const child of folder.children) {
		if (child.type === 'folder') sortFolderRecursively(child)
	}
}

function sortFiles(a: File | Folder, b: File | Folder) {
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
