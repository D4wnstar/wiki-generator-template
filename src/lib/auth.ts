/**
 * Username must be:
 * 1. Alphanumeric with dots, dashes and underscores
 * 2. Between 3 and 20 characters long
 * 3. Can't have more than one dot in a row (e.g. no 'the..legend')
 * 4. Can't start or end in a dot, dash or underscore
 */
export const usernameRules = /^(?=[a-zA-Z0-9._-]{3,20}$)(?!.*[.]{2})[^_.-].*[^_.-]$/

/**
 * RFC2822 standard email validation. From the .NET helpfiles.
 */
export const emailRules =
	/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/

/**
 * Password must be at least six characters long, with at least one
 * upper- or lowercase letter. Password rules are intentionally very lenient.
 */
export const passwordRules = /^(?=.*[a-zA-Z]).{6,100}$/
