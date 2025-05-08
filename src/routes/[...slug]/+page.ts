import type { LoadedImage } from '$lib/types'
import type { PageLoad } from './$types'

export const load = (async ({ data, fetch }) => {
	const images: Map<number, LoadedImage> = new Map()
	const sidebarImages: LoadedImage[] = []

	for (const chunk of data.contents) {
		if (chunk.image_path) {
			const res = await fetch(`/api/v1/image?image_path=${encodeURIComponent(chunk.image_path)}`)
			if (res.headers.get('content-type') === 'image/svg+xml') {
				images.set(chunk.chunk_id, { type: 'svg', svg: await res.text(), caption: chunk.text })
			} else {
				images.set(chunk.chunk_id, {
					type: 'raster',
					url: await res.text(),
					caption: chunk.text
				})
			}
		}
	}

	for (const img of data.sidebarImages) {
		const res = await fetch(`/api/v1/image?image_path=${encodeURIComponent(img.image_path)}`)
		if (res.headers.get('content-type') === 'image/svg+xml') {
			sidebarImages.push({ type: 'svg', svg: await res.text(), caption: img.caption })
		} else {
			sidebarImages.push({ type: 'raster', url: await res.text(), caption: img.caption })
		}
	}

	return { ...data, images, sidebarImages }
}) satisfies PageLoad
