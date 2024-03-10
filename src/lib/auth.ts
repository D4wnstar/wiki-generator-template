import { afterNavigate } from '$app/navigation'
import { onMount } from 'svelte'
import type { ContentChunk } from './shorthand.types'
import type { Database } from './database.types'
import { AuthError, type SupabaseClient } from '@supabase/supabase-js'
import { PUBLIC_PASSWORD_REDIRECT_URL } from '$env/static/public'

/**
 * Username must be:
 * 1. Alphanumeric with dots and underscores
 * 2. At least three characters long
 * 3. Can't have more than one dot in a row (e.g. no 'the..legend')
 * 4. Can't start or end in a dot or underscore
 */
export const usernameRules = /^(?=[a-zA-Z0-9._]{3,}$)(?!.*[.]{2})[^_.].*[^_.]$/

/**
 * RFC2822 standard email validation. From the .NET helpfiles.
 */
export const emailRules =
	/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/

/**
 * Password must be at least six characters long, with at least one
 * upper- or lowercase letter. Password rules are intentionally very lenient.
 */
export const passwordRules = /^(?=.*[a-zA-Z]).{6,}$/

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

	return error ? error : data.user
}

export async function logIn(supabase: SupabaseClient, email: string, password: string) {
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password
	})

	return error ? error : data.user
}

export async function updateUserInfo(supabase: SupabaseClient, email: string, username: string) {
	const { data, error } = await supabase.auth.updateUser({
		email: email,
		data: {
			username: username
		}
	})

	return error ? error : data.user
}

export async function updateUserPassword(
	supabase: SupabaseClient,
	newPass: string,
	newPassConfirm: string
) {
	if (newPass !== newPassConfirm) return new AuthError("The passwords don't coincide.")

	const { data, error } = await supabase.auth.updateUser({
		password: newPass
	})

	return error ? error : data.user
}

export async function sendPasswordResetEmail(supabase: SupabaseClient, email: string) {
	let url = PUBLIC_PASSWORD_REDIRECT_URL
	// Make sure to include `https://` when not localhost.
	url = url.includes('http') ? url : `https://${url}`
	// Make sure to include a trailing `/`.
	url = url.charAt(url.length - 1) === '/' ? url : `${url}/`
	
	console.log(url)
	const { error } = await supabase.auth.resetPasswordForEmail(
		email,
		{ redirectTo: url },
	)

	return error ? error : undefined
}

/**
 * Hides and disables all internal links pointing to pages the currently logged-in user doesn't
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
		anchors = document.getElementById(id)?.querySelectorAll('a[href^="/"]')
		anchors?.forEach((a) => removeLinks(a))
	})

	afterNavigate(() => {
		anchors = document.getElementById(id)?.querySelectorAll('a[href^="/"]')
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
			chunk.allowed_users?.length === 0 ||
			(username && chunk.allowed_users?.includes(username))
		) {
			content += chunk.text
		}
	})

	return content
}
