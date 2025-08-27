import { blob, int, sqliteTable, text, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core'

export const notes = sqliteTable('notes', {
	path: text().primaryKey(),
	route: text().notNull().unique(),
	title: text().notNull(),
	alt_title: text(),
	/**
	 * Semicolon separated list
	 */
	search_terms: text().notNull(),
	frontpage: int({ mode: 'boolean' }).notNull().default(false),
	allowed_users: text(),
	hash: text().notNull(),
	last_updated: int().notNull(),
	can_prerender: int({ mode: 'boolean' }).notNull(),
	html_content: text().notNull()
})

export const images = sqliteTable('images', {
	path: text().primaryKey(),
	blob: blob(),
	svg_text: text(),
	alt: text(),
	hash: text().notNull(),
	last_updated: int().notNull(),
	compressed: int({ mode: 'boolean' }).notNull()
})

export const details = sqliteTable('details', {
	note_path: text()
		.references((): AnySQLiteColumn => notes.path)
		.primaryKey(),
	order: int().notNull(),
	key: text().primaryKey(),
	value: text()
})

export const sidebarImages = sqliteTable('sidebar_images', {
	note_path: text()
		.references((): AnySQLiteColumn => notes.path)
		.primaryKey(),
	order: int().notNull(),
	image_name: text().notNull().primaryKey(),
	image_path: text()
		.notNull()
		.references((): AnySQLiteColumn => images.path),
	caption: text()
})

export const wikiSettings = sqliteTable('wiki_settings', {
	id: int().primaryKey(),
	title: text().notNull(),
	allow_logins: int({ mode: 'boolean' }).notNull()
})

export const users = sqliteTable('users', {
	id: int().primaryKey(),
	username: text().notNull().unique(),
	password: text().notNull()
})

/* TYPES */
export type NoteRow = typeof notes.$inferInsert
export type ImageRow = typeof images.$inferInsert
export type DetailsRow = typeof details.$inferSelect
export type SidebarImageRow = typeof sidebarImages.$inferSelect
export type WikiSettingsRow = typeof wikiSettings.$inferSelect
