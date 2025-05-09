export type LoggedUser = {
	id: number
	username: string
	iat: number
	exp: number
}

export type LoadedImage = { url: string; caption: string | null }
