import type { PopupSettings } from '@skeletonlabs/skeleton'
import { storePopup } from '@skeletonlabs/skeleton'
import type { SupabaseClient } from '@supabase/supabase-js'
import { popupNote } from '$lib/stores'
import { onMount, onDestroy } from 'svelte'
import { afterNavigate } from '$app/navigation'
import { get } from 'svelte/store'

// Most of everything in here has being copied and pasted from
// https://github.com/skeletonlabs/skeleton/blob/master/packages/skeleton/src/lib/utilities/Popup/popup.ts
// with some modifications to implement data fetching from Supabase to display in the popups
// Unfortunately popups require Svelte use directives to work, which is normally great if you're making
// the anchor tags manually, but they cannot be added to dynamically rendered HTML content from
// an @html tag, which means I have to manually add an event handler on all <a> tags by taking the
// popup action and breaking it down into onMount, onDestroy and MouseEvent handling parts.
// This doesn't currently implement the update() function

// TODO: Consider sending a single request onMount that gets the data for all the popups and keeps them in memory
// This prevents making a new call everytime someone hovers over a link for too long
// It's also much faster as it's cached

let toggle: EventListener
let open: EventListener
let close: CallableFunction
let closeInstantly: CallableFunction
let onWindowClick: EventListener
let onWindowKeyDown: EventListener
let timeoutIdDB: NodeJS.Timeout
let timeoutIdPopup: NodeJS.Timeout

async function fetchContent(e: MouseEvent, supabase: SupabaseClient) {
	const elem = e.target as HTMLAnchorElement
	const slug = elem.pathname.slice(1)
	if (!slug) return false

	const { data: out } = await supabase
		.from('notes')
		.select('title, lead')
		.eq('slug', slug)
		.limit(1)
		.maybeSingle()

	if (!out?.title) return false

	popupNote.set({
		title: out?.title,
		content: out?.lead
	})

	return true
}

export function initializePopup(triggerNode: HTMLElement, args: PopupSettings) {
	// Floating UI Modules
	const {
		computePosition,
		// autoUpdate, // Evil beast that breaks everything and I don't know why. Probably because of improper cleanup
		offset,
		shift,
		flip,
		arrow,
		size,
		autoPlacement,
		hide,
		inline
	} = get(storePopup)
	// Local State
	const popupState = {
		open: false,
		autoUpdateCleanup: () => {}
	}
	const focusableAllowedList =
		':is(a[href], button, input, textarea, select, details, [tabindex]):not([tabindex="-1"])'
	let focusablePopupElements: HTMLElement[]
	const documentationLink = 'https://www.skeleton.dev/utilities/popups'
	// Elements
	let elemPopup: HTMLElement
	let elemArrow: HTMLElement

	function setDomElements(): void {
		elemPopup =
			document.querySelector(`[data-popup="${args.target}"]`) ?? document.createElement('div')
		elemArrow = elemPopup.querySelector(`.arrow`) ?? document.createElement('div')
	}
	setDomElements() // init

	// Render Floating UI Popup
	function render(): void {
		// Error handling for required Floating UI modules
		if (!elemPopup)
			throw new Error(`The data-popup="${args.target}" element was not found. ${documentationLink}`)
		if (!computePosition)
			throw new Error(
				`Floating UI 'computePosition' not found for data-popup="${args.target}". ${documentationLink}`
			)
		if (!offset)
			throw new Error(
				`Floating UI 'offset' not found for data-popup="${args.target}". ${documentationLink}`
			)
		if (!shift)
			throw new Error(
				`Floating UI 'shift' not found for data-popup="${args.target}". ${documentationLink}`
			)
		if (!flip)
			throw new Error(
				`Floating UI 'flip' not found for data-popup="${args.target}". ${documentationLink}`
			)
		if (!arrow)
			throw new Error(
				`Floating UI 'arrow' not found for data-popup="${args.target}". ${documentationLink}`
			)

		// Bundle optional middleware
		const optionalMiddleware = []
		// https://floating-ui.com/docs/size
		if (size) optionalMiddleware.push(size(args.middleware?.size))
		// https://floating-ui.com/docs/autoPlacement
		if (autoPlacement) optionalMiddleware.push(autoPlacement(args.middleware?.autoPlacement))
		// https://floating-ui.com/docs/hide
		if (hide) optionalMiddleware.push(hide(args.middleware?.hide))
		// https://floating-ui.com/docs/inline
		if (inline) optionalMiddleware.push(inline(args.middleware?.inline))

		// Floating UI Compute Position
		// https://floating-ui.com/docs/computePosition
		computePosition(triggerNode, elemPopup, {
			placement: args.placement ?? 'bottom',
			// Middleware - NOTE: the order matters:
			// https://floating-ui.com/docs/middleware#ordering
			middleware: [
				// https://floating-ui.com/docs/offset
				offset(args.middleware?.offset ?? 8),
				// https://floating-ui.com/docs/shift
				shift(args.middleware?.shift ?? { padding: 8 }),
				// https://floating-ui.com/docs/flip
				flip(args.middleware?.flip),
				// https://floating-ui.com/docs/arrow
				arrow(args.middleware?.arrow ?? { element: elemArrow || null }),
				// Implement optional middleware
				...optionalMiddleware
			]
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		}).then(({ x, y, placement, middlewareData }: any) => {
			Object.assign(elemPopup.style, {
				left: `${x}px`,
				top: `${y}px`
			})
			// Handle Arrow Placement:
			// https://floating-ui.com/docs/arrow
			if (elemArrow) {
				const { x: arrowX, y: arrowY } = middlewareData.arrow
				// @ts-expect-error implicit any
				const staticSide = {
					top: 'bottom',
					right: 'left',
					bottom: 'top',
					left: 'right'
				}[placement.split('-')[0]]
				Object.assign(elemArrow.style, {
					left: arrowX != null ? `${arrowX}px` : '',
					top: arrowY != null ? `${arrowY}px` : '',
					right: '',
					bottom: '',
					[staticSide]: '-4px'
				})
			}
		})
	}

	// State Handlers
	open = (e: Event): void => {
		timeoutIdDB = setTimeout(async () => {
			const isPopupValid = await fetchContent(e as MouseEvent, supabase)

			if (!elemPopup || !isPopupValid) return
			// Set open state to on
			popupState.open = true
			// Return the current state
			if (args.state) args.state({ state: popupState.open })
			// Update render settings
			render()
			// Update the DOM
			elemPopup.style.display = 'block'
			elemPopup.style.opacity = '1'
			elemPopup.style.pointerEvents = 'auto'
			// enable popup interactions
			elemPopup.removeAttribute('inert')
			// Trigger Floating UI autoUpdate (open only)
			// https://floating-ui.com/docs/autoUpdate
			// popupState.autoUpdateCleanup = autoUpdate(triggerNode, elemPopup, render)
			// Focus the first focusable element within the popup
			focusablePopupElements = Array.from(elemPopup?.querySelectorAll(focusableAllowedList))
		}, 400)
	}

	close = (callback?: () => void): void => {
		clearTimeout(timeoutIdDB)
		clearTimeout(timeoutIdPopup)

		if (!elemPopup) return
		// Set transition duration
		const cssTransitionDuration =
			parseFloat(window.getComputedStyle(elemPopup).transitionDuration.replace('s', '')) * 1000
		setTimeout(() => {
			// Set open state to off
			popupState.open = false
			// Return the current state
			if (args.state) args.state({ state: popupState.open })
			// Update the DOM
			elemPopup.style.opacity = '0'
			// disable popup interactions
			elemPopup.setAttribute('inert', '')
			// Cleanup Floating UI autoUpdate (close only)
			// if (popupState.autoUpdateCleanup) popupState.autoUpdateCleanup()
			// Trigger callback
			if (callback) callback()
		}, cssTransitionDuration)
	}

	closeInstantly = (): void => {
		clearTimeout(timeoutIdDB)
		clearTimeout(timeoutIdPopup)

		if (!elemPopup) return

		popupState.open = false
		if (args.state) args.state({ state: popupState.open })
		elemPopup.style.display = 'none'
		elemPopup.setAttribute('inert', '')
		// if (popupState.autoUpdateCleanup) popupState.autoUpdateCleanup()
	}

	// Event Handlers
	toggle = (e: Event): void => {
		popupState.open === false ? open(e) : close()
	}

	onWindowClick = (event: Event): void => {
		// Return if the popup is not yet open
		if (popupState.open === false) return
		// Return if click is the trigger element
		if (triggerNode.contains(event.target as Node)) return
		// If click it outside the popup
		if (elemPopup && elemPopup.contains(event.target as Node) === false) {
			close()
			return
		}
		// Handle Close Query State
		const closeQueryString: string =
			args.closeQuery === undefined ? 'a[href], button' : args.closeQuery
		// Return if no closeQuery is provided
		if (closeQueryString === '') return
		const closableMenuElements = elemPopup?.querySelectorAll(closeQueryString)
		closableMenuElements?.forEach((elem) => {
			if (elem.contains(event.target as Node)) close()
		})
	}

	// Keyboard Interactions for A11y
	onWindowKeyDown = (e: Event): void => {
		const event = e as KeyboardEvent
		if (popupState.open === false) return
		// Handle keys
		const key: string = event.key
		// On Esc key
		if (key === 'Escape') {
			event.preventDefault()
			triggerNode.focus()
			close()
			return
		}
		// Update focusable elements (important for Autocomplete)
		focusablePopupElements = Array.from(elemPopup?.querySelectorAll(focusableAllowedList))
		// On Tab or ArrowDown key
		const triggerMenuFocused: boolean = popupState.open && document.activeElement === triggerNode
		if (
			triggerMenuFocused &&
			(key === 'ArrowDown' || key === 'Tab') &&
			focusableAllowedList.length > 0 &&
			focusablePopupElements.length > 0
		) {
			event.preventDefault()
			focusablePopupElements[0].focus()
		}
	}

	// Event Listeners
	switch (args.event) {
		case 'click':
			triggerNode.addEventListener('click', toggle, true)
			window.addEventListener('click', onWindowClick, true)
			break
		case 'hover':
			triggerNode.addEventListener('mouseover', open, true)
			triggerNode.addEventListener('mouseleave', () => close(), true)
			triggerNode.addEventListener('click', () => closeInstantly(), true)
			window.addEventListener('click', onWindowClick, true)
			break
		case 'focus-blur':
			triggerNode.addEventListener('focus', toggle, true)
			triggerNode.addEventListener('blur', () => close(), true)
			break
		case 'focus-click':
			triggerNode.addEventListener('focus', open, true)
			window.addEventListener('click', onWindowClick, true)
			break
		default:
			throw new Error(`Event value of '${args.event}' is not supported. ${documentationLink}`)
	}
	window.addEventListener('keydown', onWindowKeyDown, true)

	// Render popup on initialization
	render()
}

export function destroyPopup(triggerNode: HTMLElement) {
	if (closeInstantly) closeInstantly()
	// Trigger Events
	triggerNode.removeEventListener('click', () => closeInstantly(), true)
	triggerNode.removeEventListener('mouseover', open, true)
	triggerNode.removeEventListener('mouseleave', () => close(), true)
	triggerNode.removeEventListener('focus', toggle, true)
	triggerNode.removeEventListener('focus', open, true)
	triggerNode.removeEventListener('blur', () => close(), true)
	// Window Events
	window.removeEventListener('click', onWindowClick, true)
	window.removeEventListener('keydown', onWindowKeyDown, true)
}

export function setupPopups(id: string, settings: PopupSettings): void {
	let anchors: NodeListOf<HTMLAnchorElement> | undefined

	onMount(() => {
		anchors?.forEach((anchor) => {
			initializePopup(anchor, settings)
		})
	})

	afterNavigate(() => {
		anchors = document.getElementById(id)?.querySelectorAll('a.popup')
		anchors?.forEach((anchor) => {
			destroyPopup(anchor)
		})

		anchors?.forEach((anchor) => {
			initializePopup(anchor, settings)
		})
	})

	onDestroy(() => {
		anchors?.forEach((anchor) => {
			destroyPopup(anchor)
		})
	})
}
