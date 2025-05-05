import { images } from '$lib/schema'
import { eq } from 'drizzle-orm'
import type { RequestHandler } from './$types'
import { json } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ url, locals: { db } }) => {
	const imagePath = url.searchParams.get('image_path')
	if (!imagePath) {
		return json({ message: 'Missing image path' }, { status: 400 })
	}

	const image = await db.select().from(images).where(eq(images.path, imagePath)).get()
	if (!image) {
		return json({ message: 'No image found' }, { status: 404 })
	} else {
		// Check if it's a raster or an SVG
		if (image.svg_text) {
			return new Response(image.svg_text, {
				headers: {
					'Content-Type': 'image/svg+xml',
					'Cache-Control': 'public, max-age=31536000'
				}
			})
		} else if (image.blob) {
			const buf = image.blob as Buffer
			return new Response(buf, {
				headers: {
					'Content-Type': 'image/webp',
					'Cache-Control': 'public, max-age=31536000'
				}
			})
		} else {
			return json({ message: 'Image neither has a blob nor SVG text' }, { status: 500 })
		}
	}
}
