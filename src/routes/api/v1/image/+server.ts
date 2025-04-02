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
		const buf = image.blob as Buffer
		return new Response(buf, {
			headers: {
				'Content-Type': 'image/webp',
				'Cache-Control': 'public, max-age=31536000'
			}
		})
	}
}
