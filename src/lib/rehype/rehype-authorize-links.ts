import { visitParents } from 'unist-util-visit-parents'
import type { Element, Root, Text } from 'hast'

export default function rehypeAuthorizeLinks(
	username: string | undefined,
	pathToAllowedUsers: Map<string, string[]>
) {
	return function (tree: Root) {
		visitParents(tree, 'element', (node, ancestors) => {
			// Skip all non-anchor tags
			if (node.tagName !== 'a') return

			// Skip anchors that aren't made of exactly one element
			if (node.children.length !== 1) return

			// If the linked page has no restrictions or the current user is
			// allowed to access that page, leave the link as is.
			// If there is no current user, any non-empty allowed users counts
			// as unauthorized.
			const href = node.properties.href as string
			const allowedUsers = pathToAllowedUsers.get(href.substring(1))
			if (
				!allowedUsers ||
				allowedUsers.length === 0 ||
				(username && allowedUsers.includes(username))
			) {
				return
			}

			// Extract the text content from the anchor element
			// by recursively joining the text of all children nodes
			const textContent = extractTextFromNode(node)

			// If text exists, replace the anchor element with a text node
			if (textContent !== '') {
				const parent = ancestors[ancestors.length - 1]
				const index = parent.children.indexOf(node)
				if (index !== -1) {
					parent.children[index] = { type: 'text', value: textContent }
				}
			}
		})
	}
}

function extractTextFromNode(node: Element | Text): string {
	if (node.type === 'text') {
		return node.value
	} else if (node.type === 'element') {
		return node.children.reduce(
			(acc, child) => acc + extractTextFromNode(child as Element | Text),
			''
		)
	}
	return ''
}
