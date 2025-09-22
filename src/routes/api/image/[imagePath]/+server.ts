import { images } from '$lib/schema'
import { eq } from 'drizzle-orm'
import type { RequestHandler } from './$types'
import { json } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ params: { imagePath }, locals: { db } }) => {
	const image = await db
		.select({
			svgText: images.svg_text,
			blob: images.blob
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
					'content-type': 'image/svg+xml',
					'cache-control': 'public, max-age=86400'
				}
			})
		} else if (image.blob) {
			return new Response(new Uint8Array(image.blob as Buffer), {
				headers: {
					'content-type': 'image/webp',
					'cache-control': 'public, max-age=864000'
				}
			})
		} else {
			return json({ message: 'Image neither has a blob nor SVG text' }, { status: 500 })
		}
	}
}
