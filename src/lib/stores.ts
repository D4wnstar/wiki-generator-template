import { writable } from 'svelte/store'

export const popupNote = writable({ title: undefined, content: undefined })
export const wikiTitle = writable('')
