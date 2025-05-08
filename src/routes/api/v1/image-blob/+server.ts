import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { eq } from 'drizzle-orm'
import { images } from '$lib/schema'

export const GET: RequestHandler = async ({ url, locals: { db } }) => {
	const imagePath = url.searchParams.get('image_path')
	if (!imagePath) {
		return json({ message: 'Missing image path' }, { status: 400 })
	}

	const image = await db
		.select({
			blob: images.blob
		})
		.from(images)
		.where(eq(images.path, decodeURIComponent(imagePath)))
		.get()

	if (!image) {
		return json({ message: 'No image found' }, { status: 404 })
	}

	const buf = image.blob as Buffer
	return new Response(buf, {
		headers: {
			'content-type': 'image/webp',
			'cache-control': 'public, max-age=864000'
		}
	})
}
