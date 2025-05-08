export type LoggedUser = {
	id: number
	username: string
	iat: number
	exp: number
}

export type LoadedImage =
	| { type: 'svg'; svg: string; url?: never; caption: string | null }
	| { type: 'raster'; svg?: never; url: string; caption: string | null }
