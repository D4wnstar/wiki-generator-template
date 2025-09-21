import type { NoteMeta } from './notes'

/**
 * API wrappers for type safety and code reuse. All functions allow passing a
 * custom implementation of fetch as a last argument so that SvelteKit can
 * use its own in load functions.
 */
export abstract class API {
	/**
	 * Get a list of public pages from the database.
	 */
	static async publicPages(fetchImpl: typeof fetch = fetch) {
		const res = await fetchImpl('/api/public-pages')
		if (res.ok) {
			return (await res.json()) as NoteMeta[]
		} else {
			return []
		}
	}

	/**
	 * Get a list of secret pages from the database.
	 */
	static async secretPages(fetchImpl: typeof fetch = fetch) {
		const res = await fetchImpl('/api/auth/secret-pages')
		if (res.ok) {
			return (await res.json()) as NoteMeta[]
		} else {
			return []
		}
	}

	/**
	 * Determine if the given username is available.
	 */
	static async usernameAvailable(username: string, fetchImpl: typeof fetch = fetch) {
		const res = await fetchImpl(`/api/auth/user?username=${username}`)
		return (await res.json()) as boolean
	}

	/**
	 * Update the current logged in user's username with the given one.
	 */
	static async updateUsername(username: string, fetchImpl: typeof fetch = fetch) {
		return await fetchImpl('/api/auth/update-username', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ username })
		})
	}

	/**
	 * Update the current logged in user's password with the given one.
	 */
	static async updatePassword(password: string, confirm: string, fetchImpl: typeof fetch = fetch) {
		return await fetchImpl('/api/auth/update-password', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ newPass: password, newPassConfirm: confirm })
		})
	}
}
