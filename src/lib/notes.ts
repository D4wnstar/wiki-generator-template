import type { TreeViewNode } from '@skeletonlabs/skeleton'
import slugify from 'slugify'
import type { Note } from './shorthand.types'

export function slugifyPath(path: string): string {
	const elems = path.split('/').filter((elem) => elem !== '')
	const slugged = []
	for (const elem of elems) {
		slugged.push(slugify(elem, { lower: true, remove: /[^\w\d\s]/g }))
	}

	return slugged.join('/')
}

export function getPathCombinations(path: string): string[] {
	const pathParts = path.split('/').filter((part) => part !== '')
	let currentPath = ''
	const combinations = []

	for (const part of pathParts) {
		currentPath = currentPath ? `${currentPath}/${part}` : part
		combinations.push(currentPath)
	}

	return combinations
}

export function createNotesTree(notes: Note[]): TreeViewNode[] {
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
			const slugPath = slugifyPath(currPath)
			let content: string

			// If the current path is among the note paths, that means it's a note and should have a link to it
			if (paths.includes(currPath.slice(1))) {
				// Also check if the note in question has an alt name before making the link
				const linkText = note.alt_title ?? piece
				content = `<a href="/${slugPath}"><button class="h-full w-full text-left py-1">${linkText}</button></a>`
			} else {
				// otherwise it should just be a text box containing the intermediate path
				content = `<p class="py-1">${piece}</p>`
			}

			const newNode: TreeViewNode = {
				id: slugPath,
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
