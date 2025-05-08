import { images } from '$lib/schema'
import { eq } from 'drizzle-orm'
import type { RequestHandler } from './$types'
import { json } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ url, locals: { db } }) => {
	const imagePath = url.searchParams.get('image_path')
	if (!imagePath) {
		return json({ message: 'Missing image path' }, { status: 400 })
	}

	const image = await db
		.select({
			svgText: images.svg_text
		})
		.from(images)
		.where(eq(images.path, decodeURIComponent(imagePath)))
		.get()
	if (!image) {
		return json({ message: 'No image found' }, { status: 404 })
	} else {
		// Check if it's a raster or an SVG
		if (image.svgText) {
			return new Response(image.svgText, {
				headers: {
					'Content-Type': 'image/svg+xml',
					'Cache-Control': 'public, max-age=86400'
				}
			})
		} else {
			return new Response(`/api/v1/image-blob?image_path=${encodeURIComponent(imagePath)}`, {
				headers: {
					'Content-Type': 'text/plain'
				}
			})
		}
		// } else {
		// 	return json({ message: 'Image neither has a blob nor SVG text' }, { status: 500 })
		// }
	}
}
