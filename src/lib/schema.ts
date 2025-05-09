import { blob, int, sqliteTable, text, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core'

export const notes = sqliteTable('notes', {
	path: text().primaryKey(),
	title: text().notNull(),
	alt_title: text(),
	/**
	 * Semicolon separated list
	 */
	search_terms: text().notNull(),
	slug: text().notNull().unique(),
	frontpage: int({ mode: 'boolean' }).notNull().default(false),
	allowed_users: text(),
	hash: text().notNull(),
	last_updated: int().notNull()
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

export const noteContents = sqliteTable('note_contents', {
	note_path: text()
		.references((): AnySQLiteColumn => notes.path)
		.primaryKey(),
	chunk_id: int().primaryKey(),
	text: text().notNull(),
	allowed_users: text(),
	image_path: text().references((): AnySQLiteColumn => images.path),
	note_transclusion_path: text().references((): AnySQLiteColumn => notes.path)
})

export const details = sqliteTable('details', {
	note_path: text()
		.references((): AnySQLiteColumn => notes.path)
		.primaryKey(),
	order: int().notNull(),
	detail_name: text().notNull().primaryKey(),
	detail_content: text().notNull()
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
export type NoteContentsRow = typeof noteContents.$inferSelect
export type DetailsRow = typeof details.$inferSelect
export type SidebarImageRow = typeof sidebarImages.$inferSelect
export type WikiSettingsRow = typeof wikiSettings.$inferSelect
