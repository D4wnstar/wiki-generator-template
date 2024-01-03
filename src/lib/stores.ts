import { localStorageStore } from '@skeletonlabs/skeleton';
import { writable, type Writable } from 'svelte/store';

export const currentTheme: Writable<string> = localStorageStore('current-theme', 'starry')
export const popupNote = writable({ title: undefined, content: undefined })
export const wikiTitle = writable("")