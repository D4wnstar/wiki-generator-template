import { blob, int, sqliteTable, text, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core'

export const notes = sqliteTable('notes', {
	id: int().primaryKey({ autoIncrement: true }),
	title: text().notNull(),
	alt_title: text(),
	path: text().notNull().unique(),
	slug: text().notNull().unique(),
	frontpage: int({ mode: 'boolean' }).notNull().default(false),
	allowed_users: text()
})

export const images = sqliteTable('images', {
	id: int().primaryKey({ autoIncrement: true }),
	blob: blob().notNull(),
	alt: text()
})

export const noteContents = sqliteTable('note_contents', {
	note_id: int()
		.references((): AnySQLiteColumn => notes.id)
		.primaryKey(),
	chunk_id: int().primaryKey(),
	text: text().notNull(),
	allowed_users: text(),
	image_id: int().references((): AnySQLiteColumn => images.id),
	note_transclusion_id: int().references((): AnySQLiteColumn => notes.id)
})

export const details = sqliteTable('details', {
	note_id: int()
		.references((): AnySQLiteColumn => notes.id)
		.primaryKey(),
	order: int().notNull(),
	detail_name: text().notNull().primaryKey(),
	detail_content: text().notNull()
})

export const sidebarImages = sqliteTable('sidebar_images', {
	note_id: int()
		.references((): AnySQLiteColumn => notes.id)
		.primaryKey(),
	order: int().notNull(),
	image_name: text().notNull().primaryKey(),
	image_id: int()
		.notNull()
		.references((): AnySQLiteColumn => images.id),
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
