import type { TreeViewNode } from '@skeletonlabs/skeleton'
import slugify from 'slugify'

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

export function createNotesTree(notePaths: string[]): TreeViewNode[] {
	const tree: TreeViewNode[] = []
	
	for (const note of notePaths) {
		const pathPieces = note.split('/').filter((elem) => elem !== '')
		let currPath = ''
		let currentlyIn: TreeViewNode | null = null

		for (const piece of pathPieces) {
			currPath += '/' + piece
			const slugPath = slugifyPath(currPath)
			let content: string
			if (notePaths.includes(currPath.slice(1))) {
				content = `<a href="/${slugPath}"><button class="h-full w-full text-left py-1">${piece}</button></a>`
			} else {
				content = `<p class="py-1">${piece}</p>`
			}

			const newNode: TreeViewNode = {
				id: slugPath,
				content: content,
			}

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

				tree.push(newNode)
				currentlyIn = newNode
			} else {
				if (currentlyIn.children === undefined) {
					currentlyIn.children = [newNode]
					currentlyIn = newNode
				} else {
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
