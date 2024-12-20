import { images } from '$lib/schema'
import { eq } from 'drizzle-orm'
import type { RequestHandler } from './$types'
import { json } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ url, locals: { db } }) => {
	const imageIdStr = url.searchParams.get('image_id')
	if (!imageIdStr) {
		return json({ message: 'Missing image id' }, { status: 400 })
	}

	let imageId
	try {
		imageId = parseInt(imageIdStr)
	} catch (error) {
		return json({ message: 'Could not parse image id' }, { status: 400 })
	}

	const image = await db.select().from(images).where(eq(images.id, imageId)).get()
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
