import type { Handle } from '@sveltejs/kit'
import { drizzle } from 'drizzle-orm/libsql'

export const handle: Handle = async ({ event, resolve }) => {
	const glob = import.meta.glob('/static/data.db', { query: 'url', import: 'default', eager: true })
	const path = Object.values(glob)[0] as string
	event.locals.db = drizzle(`file:${path.substring(1)}`)

	return resolve(event)
}
