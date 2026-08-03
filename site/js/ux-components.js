// ux-components.js

// Global namespace for all UX components
window.UX = {}

/* -------------------------------------------------------
   TOASTS
------------------------------------------------------- */

class ToastManager {
	constructor() {
		this.container = document.createElement('div')
		this.container.id = 'toast-container'
		document.body.appendChild(this.container)
	}

	show(message, type = 'info', duration = 4000) {
		const toast = document.createElement('div')
		toast.className = `toast toast-${type}`
		toast.textContent = message

		this.container.appendChild(toast)

		requestAnimationFrame(() => {
			toast.classList.add('is-visible')
		})

		setTimeout(() => {
			toast.classList.remove('is-visible')
			toast.addEventListener(
				'transitionend',
				() => toast.remove(),
				{ once: true }
			)
		}, duration)
	}
}

window.UX.Toast = new ToastManager()

/* -------------------------------------------------------
   MODAL
------------------------------------------------------- */

class Modal {
	constructor() {
		this.overlay = document.createElement('div')
		this.overlay.id = 'modal-overlay'
		this.overlay.className = 'modal-overlay hidden'

		this.modal = document.createElement('div')
		this.modal.id = 'modal'
		this.modal.className = 'modal'
		this.modal.setAttribute('role', 'dialog')
		this.modal.setAttribute('aria-modal', 'true')

		this.titleEl = document.createElement('h2')
		this.messageEl = document.createElement('p')
		this.actionsEl = document.createElement('div')
		this.actionsEl.className = 'modal-actions'

		this.modal.appendChild(this.titleEl)
		this.modal.appendChild(this.messageEl)
		this.modal.appendChild(this.actionsEl)
		this.overlay.appendChild(this.modal)
		document.body.appendChild(this.overlay)

		this.lastFocused = null

		this.overlay.addEventListener('click', e => {
			if (e.target === this.overlay) this.close()
		})

		document.addEventListener('keydown', e => {
			if (e.key === 'Escape' && this.overlay.classList.contains('is-visible')) {
				this.close()
			}
		})
	}

	show({ title = '', message = '', actions = [] }) {
		this.lastFocused = document.activeElement

		this.titleEl.textContent = title
		this.messageEl.textContent = message
		this.actionsEl.innerHTML = ''

		actions.forEach(action => {
			const btn = document.createElement('button')
			btn.className = 'modal-button'
			btn.textContent = action.label
			btn.addEventListener('click', () => {
				if (action.onClick) action.onClick()
				this.close()
			})
			this.actionsEl.appendChild(btn)
		})

		this.overlay.classList.remove('hidden')

		requestAnimationFrame(() => {
			this.overlay.classList.add('is-visible')
			this.modal.classList.add('is-visible')
			const firstButton = this.actionsEl.querySelector('button')
			if (firstButton) firstButton.focus()
		})
	}

	close() {
		this.overlay.classList.remove('is-visible')
		this.modal.classList.remove('is-visible')

		this.overlay.addEventListener(
			'transitionend',
			() => {
				this.overlay.classList.add('hidden')
				if (this.lastFocused) this.lastFocused.focus()
			},
			{ once: true }
		)
	}
}

window.UX.Modal = new Modal()
