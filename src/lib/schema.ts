import { int, sqliteTable, text, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core'

export const notes = sqliteTable('notes', {
	id: int().primaryKey({ autoIncrement: true }),
	title: text().notNull(),
	alt_title: text(),
	path: text().notNull().unique(),
	slug: text().notNull().unique(),
	frontpage: int({ mode: 'boolean' }).notNull().default(false),
	allowed_users: text()
})

/*
CREATE TABLE IF NOT EXISTS notes (
	id integer primary key,
	title text not null,
	alt_title text,
	path text unique not null,
	slug text unique not null,
	frontpage boolean default false,
	allowed_users text
);
*/

export const noteContents = sqliteTable('note_contents', {
	note_id: int()
		.references((): AnySQLiteColumn => notes.id)
		.primaryKey(),
	chunk_id: int().primaryKey(),
	text: text().notNull(),
	allowed_users: text()
})

/*
CREATE TABLE IF NOT EXISTS note_contents (
	note_id integer not null references notes (id),
	chunk_id integer not null,
	"text" text not null,
	allowed_users text,
	primary key (note_id, chunk_id)
);
*/

export const details = sqliteTable('details', {
	note_id: int()
		.references((): AnySQLiteColumn => notes.id)
		.primaryKey(),
	order: int().notNull(),
	detail_name: text().notNull().primaryKey(),
	detail_content: text().notNull()
})

/*
CREATE TABLE IF NOT EXISTS details (
	note_id integer not null references notes (id) on delete cascade,
	"order" integer not null,
	detail_name text not null,
	detail_content text,
	primary key (note_id, detail_name)
);
*/

export const sidebarImages = sqliteTable('sidebar_images', {
	note_id: int()
		.references((): AnySQLiteColumn => notes.id)
		.primaryKey(),
	order: int().notNull(),
	image_name: text().notNull().primaryKey(),
	base64: text().notNull(),
	caption: text()
})

/*
CREATE TABLE IF NOT EXISTS sidebar_images (
	note_id integer not null references notes (id) on delete cascade,
	"order" integer not null,
	image_name text not null,
	base64 text not null,
	caption text,
	primary key (note_id, image_name)
);
*/

export const wikiSettings = sqliteTable('wiki_settings', {
	id: int().primaryKey(),
	title: text().notNull(),
	allow_logins: int({ mode: 'boolean' }).notNull()
})

/*
CREATE TABLE IF NOT EXISTS wiki_settings (
    id integer primary key,
    title text not null,
    allow_logins boolean not null
);
*/

export const users = sqliteTable('users', {
	id: int().primaryKey(),
	username: text().notNull().unique(),
	password: text().notNull()
})

/*
CREATE TABLE IF NOT EXISTS users (
	id integer primary key,
	username text not null unique,
	password text not null
);
*/

/* TYPES */
export type NoteRow = typeof notes.$inferInsert
export type NoteContentsRow = typeof noteContents.$inferSelect
export type DetailsRow = typeof details.$inferSelect
export type SidebarImageRow = typeof sidebarImages.$inferSelect
export type WikiSettingsRow = typeof wikiSettings.$inferSelect
