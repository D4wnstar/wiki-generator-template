import { handlePageSlug } from '$lib/notes'
import type { PageServerLoad } from './$types'

export const load = (async ({ locals: { db, user }, params: { slug } }) => {
	return await handlePageSlug(db, user, slug)
}) satisfies PageServerLoad

// An implementation of in-memory cache. Commented because stateful
// servers are bad practice, but it works
// interface CachedPage {
// 	page: {
// 		note: NoteRow
// 		contents: NoteContentsRow[]
// 		details: DetailsRow[]
// 		sidebarImages: SidebarImageRow[]
// 	}
// 	lastChecked: number
// 	userKey: string
// }
// const pageCache = new Map<string, CachedPage>()
// const userKey = user?.username || 'anonymous'
// // Check cache first
// const cached = pageCache.get(slug)
// if (cached && cached.userKey === userKey) {
// 	// If the page is cached, check if enough time has passed since last check
// 	const now = Math.floor(Date.now() / 1000)
// 	const timeSinceLastCheck = now - cached.lastChecked
// 	if (timeSinceLastCheck >= 600 /* 10 minutes */) {
// 		const res = await fetch(`/api/v1/note-timestamps?note_slug=${encodeURIComponent(slug)}`)
// 		if (res.ok) {
// 			const { timestamps } = await res.json()
// 			const lastUpdate = timestamps?.last_updated
// 			// If the last update is older than the page cache, it's fresh
// 			if (lastUpdate && lastUpdate <= cached.lastChecked) {
// 				console.log('Using cache')
// 				// Refresh the timestamp
// 				cached.lastChecked = now
// 				return cached.page
// 			}
// 		}
// 	} else {
// 		// console.log(`Page still assumed fresh. Will check in ${600 - timeSinceLastCheck} seconds`)
// 		return cached.page
// 	}
// }
// const page = await handlePageSlug(db, user, slug)
// Update cache with fresh data using current timestamp
// pageCache.set(slug, {
// 	page,
// 	lastChecked: Math.floor(Date.now() / 1000),
// 	userKey
// })
