// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types

import type { LibSQLDatabase } from 'drizzle-orm/libsql'

declare global {
	namespace App {
		interface Locals {
			db: LibSQLDatabase
		}
		interface PageData {
			session: Session | null
		}
		// interface Error {}
		// interface Platform {}
	}
}
