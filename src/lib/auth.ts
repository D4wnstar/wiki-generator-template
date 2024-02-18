import { afterNavigate } from '$app/navigation'
import { onMount } from 'svelte'
import type { ContentChunk } from './shorthand.types'
import type { Database } from './database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function signUp(
	supabase: SupabaseClient<Database>,
	email: string,
	password: string,
	username: string
) {
	const { data, error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			data: {
				username
			}
		}
	})

	if (!error) {
		return data.user
	} else {
		return error
	}
}

export async function logIn(supabase: SupabaseClient, email: string, password: string) {
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password
	})

	if (!error) {
		return data.user
	} else {
		return error
	}
}

/**
 * Hides and disables all links pointing to pages the currently logged-in user doesn't
 * have permission to see. This happens only inside of the element with the given id.
 * This happens onMount and afterNavigate so it will cause flickering.
 * @param id The id of the HTML element to apply this function to
 * @param refSlugs The slugs of the pages that are authorized. Links to pages with any other slugs will be hidden
 */
export async function hideUnauthorizedLinks(id: string, refSlugs: string[]) {
	let anchors: NodeListOf<HTMLAnchorElement> | undefined
	const removeLinks = (a: HTMLAnchorElement) => {
		if (!refSlugs.includes(a.pathname.slice(1))) {
			a.addEventListener('click', (e) => e.preventDefault())
			a.classList.add('pointer-events-none')
			a.classList.remove('anchor')
		}
	}

	onMount(() => {
		anchors = document.getElementById(id)?.querySelectorAll('a')
		anchors?.forEach((a) => removeLinks(a))
	})

	afterNavigate(() => {
		anchors = document.getElementById(id)?.querySelectorAll('a')
		anchors?.forEach((a) => removeLinks(a))
	})
}

/**
 * Merges the HTML chunks of the page to make up the content to render based on user permission.
 * @param chunks The chunks of HTML that make up the page
 * @param username The currently logged-in user
 * @returns The HTML of the page as a string
 */
export function mergeContent(chunks: ContentChunk[], username: string | undefined) {
	let content = ''
	chunks.forEach((chunk) => {
		if (
			(chunk.allowed_users?.length === 0) ||
			(username && chunk.allowed_users?.includes(username))
		) {
			content += chunk.text
		}
	})

	return content
}
