import { sql } from 'drizzle-orm'
import { notes } from './schema'

/**
 * Create a Drizzle SQL object to filter by the `allowed_users` columns
 * for the given username and table. It will check if the *full* username is among the allowed
 * ones. It avoids partial matches that a normal `LIKE` would cause (such as "Jon"
 * matching "Jonathan" despite being different users) and is also case-insensitive.
 * @param username The username to filter by
 * @param table The table to filter. Either 'notes' or 'noteContents'
 * @returns A Drizzle SQL object to be used in a `where` query
 */
export function getAllowedUsersFilter(username: string, table: 'notes' | 'noteContents') {
	// Fetch only pages which list the FULL username in the semicolon separated list
	// or if the only allowed user is the current user
	username = username.toLowerCase()
	// const noteTable = table === 'notes' ? notes : noteContents
	const noteTable = notes
	// Query does not appear to work without using sql.raw on the username. Not sure why but needs to be fixed
	return sql`'; ' || LOWER(${noteTable.allowed_users}) || ';' LIKE '%; ${sql.raw(username)};%' OR LOWER(${noteTable.allowed_users}) = '${sql.raw(username)}'`
}
