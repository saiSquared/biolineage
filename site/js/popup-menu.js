class PopupMenu {
	static openMenu = null

	constructor(anchorEl, menuEl, { onSelect = null, closeOnScroll = true, manual = false } = {}) {
		this.anchor = anchorEl
		this.menu = menuEl
		this.onSelect = onSelect
		this.closeOnScroll = closeOnScroll
		this.manual = manual

		// Bind handlers
		this._onDocumentClick = this._onDocumentClick.bind(this)
		this._onKeyDown = this._onKeyDown.bind(this)
		this._onScroll = this._onScroll.bind(this)
		this._onAnchorClick = this._onAnchorClick.bind(this)
		this._onMenuClick = this._onMenuClick.bind(this)

		this._focusable = []
		this._currentIndex = 0
		this._typeBuffer = ''
		this._typeBufferTimeout = null

		this.menu.classList.remove('is-open', 'is-opening')

		if (!manual) {
			this.anchor.addEventListener('click', this._onAnchorClick)
		}

		this.menu.addEventListener('click', this._onMenuClick)
	}

	_onAnchorClick(e) {
		e.stopPropagation()
		console.log({ e, menu: this.menu })
		if (!this.menu.classList.contains('is-open')) {
			this.open()
		} else {
			this.close()
		}
	}

	_onMenuClick(e) {
		e.stopPropagation()
		const button = e.target.closest('button')
		if (!button || !this.menu.contains(button)) return

		if (this.onSelect) this.onSelect(button, this.anchor)
		this.close()
	}

	open() {
		if (PopupMenu.openMenu && PopupMenu.openMenu !== this) {
			PopupMenu.openMenu.close()
		}
		PopupMenu.openMenu = this

		const rect = this.anchor.getBoundingClientRect()

		// 1. Measure menu height in a neutral space (fixed at 0,0)
		const prevPosition = this.menu.style.position
		const prevTop = this.menu.style.top
		const prevLeft = this.menu.style.left
		const prevVisibility = this.menu.style.visibility
		// const prevDisplay = this.menu.style.display

		this.menu.style.position = 'fixed'
		this.menu.style.top = '0px'
		this.menu.style.left = '0px'
		this.menu.style.visibility = 'hidden'
		this.menu.style.display = 'block'

		const menuHeight = this.menu.offsetHeight

		this.menu.style.position = prevPosition
		this.menu.style.top = prevTop
		this.menu.style.left = prevLeft
		this.menu.style.visibility = prevVisibility
		// this.menu.style.display = prevDisplay

		this.menu.classList.add('is-opening')

		// 2. Decide flip direction and position
		const spaceBelow = window.innerHeight - rect.bottom
		const spaceAbove = rect.top

		if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
			// flip up
			this.menu.style.top = `${rect.top - menuHeight - 16}px`
			this.menu.classList.add('flip-up')
		} else {
			// default down
			this.menu.style.top = `${rect.bottom + 4}px`
			this.menu.classList.remove('flip-up')
		}

		this.menu.style.right = `${document.body.clientWidth - rect.right}px`

		// 3. Max height based on direction
		if (this.menu.classList.contains('flip-up')) {
			this.menu.style.maxHeight = `${rect.top - 8}px`
		} else {
			this.menu.style.maxHeight = `${window.innerHeight - rect.bottom - 8}px`
		}

		// 4. Animate in
		requestAnimationFrame(() => {
			this.menu.classList.add('is-open')
		})

		this.anchor.setAttribute('aria-expanded', 'true')

		// 5. Keyboard setup
		this._focusable = Array.from(this.menu.querySelectorAll('button'))
		this._currentIndex = 0
		if (this._focusable.length > 0) {
			this._focusable[0].focus()
		}

		// 6. Listeners
		document.addEventListener('click', this._onDocumentClick)
		document.addEventListener('keydown', this._onKeyDown)

		if (this.closeOnScroll) {
			window.addEventListener('scroll', this._onScroll, { passive: true })
		}
	}

	static open(anchorEl, menuEl, options = {}) {
		const pm = new PopupMenu(anchorEl, menuEl, options)
		pm.open()
		return pm
	}

	close() {
		if (PopupMenu.openMenu === this) {
			PopupMenu.openMenu = null
		}

		this.menu.classList.remove('is-open')
		this.menu.classList.remove('is-opening')
		this.anchor.setAttribute('aria-expanded', 'false')

		// No inline display manipulation

		document.removeEventListener('click', this._onDocumentClick)
		document.removeEventListener('keydown', this._onKeyDown)

		if (this.closeOnScroll) {
			window.removeEventListener('scroll', this._onScroll)
		}
	}

	destroy() {
		if (PopupMenu.openMenu === this) {
			PopupMenu.openMenu = null
		}

		document.removeEventListener('click', this._onDocumentClick)
		document.removeEventListener('keydown', this._onKeyDown)

		if (this.closeOnScroll) {
			window.removeEventListener('scroll', this._onScroll)
		}

		if (!this.manual && this.anchor) {
			this.anchor.removeEventListener('click', this._onAnchorClick)
		}

		if (this.menu) {
			this.menu.removeEventListener('click', this._onMenuClick)
			this.menu.classList.remove('is-open', 'is-opening', 'flip-up')
		}

		this.anchor = null
		this.menu = null
		this.onSelect = null
		this._focusable = []
	}

	_onDocumentClick(e) {
		if (!this.menu.contains(e.target) && e.target !== this.anchor) {
			this.close()
		}
	}

	_onKeyDown(e) {
		if (!this.menu.classList.contains('is-open')) return

		// Escape closes
		if (e.key === 'Escape') {
			this.close()
			return
		}

		if (!this._focusable.length) return

		// Arrow navigation
		if (e.key === 'ArrowDown') {
			e.preventDefault()
			this._currentIndex = (this._currentIndex + 1) % this._focusable.length
			this._focusable[this._currentIndex].focus()
		}

		if (e.key === 'ArrowUp') {
			e.preventDefault()
			this._currentIndex =
				(this._currentIndex - 1 + this._focusable.length) % this._focusable.length
			this._focusable[this._currentIndex].focus()
		}

		// Type-ahead search
		if (e.key.length === 1 && /\S/.test(e.key)) {
			this._typeBuffer += e.key.toLowerCase()

			clearTimeout(this._typeBufferTimeout)
			this._typeBufferTimeout = setTimeout(() => {
				this._typeBuffer = ''
			}, 300)

			const matchIndex = this._focusable.findIndex(btn =>
				btn.textContent.trim().toLowerCase().startsWith(this._typeBuffer)
			)

			if (matchIndex !== -1) {
				this._currentIndex = matchIndex
				this._focusable[this._currentIndex].focus()
			}
		}

		// Focus trapping
		if (e.key === 'Tab') {
			e.preventDefault()
			if (e.shiftKey) {
				this._currentIndex =
					(this._currentIndex - 1 + this._focusable.length) % this._focusable.length
			} else {
				this._currentIndex = (this._currentIndex + 1) % this._focusable.length
			}
			this._focusable[this._currentIndex].focus()
		}
	}

	_onScroll() {
		this.close()
	}
}

function applyTheme(button, theme) {
	const body = document.body

	body.classList.remove('theme-light', 'theme-dark')

	if (theme === 'light') body.classList.add('theme-light')
	if (theme === 'dark') body.classList.add('theme-dark')

	localStorage.setItem('theme', theme)

	button.innerHTML = `<svg><use href="#theme-${theme}"></use></svg>Theme`
}

new PopupMenu(
	document.getElementById('theme'),
	document.getElementById('theme-menu'),
	{
		onSelect: (button, anchor) => {
			applyTheme(anchor, button.dataset.theme)
		}
	}
)

new PopupMenu(
	document.getElementById('account'),
	document.getElementById('account-menu'),
	{
		onSelect: (button, anchor) => {
			window.location.href = button.dataset.href
		}
	}
)

new PopupMenu(
	document.getElementById('account-mobile'),
	document.getElementById('account-menu'),
	{
		onSelect: (button, anchor) => {
			window.location.href = button.dataset.href
		}
	}
)

document.addEventListener('DOMContentLoaded', () => {
	const saved = localStorage.getItem('theme') || 'default'
	const btn = document.getElementById('theme')
	if (!btn) return

	// Match the menu's own applyTheme() output
	btn.innerHTML = `<svg><use href="#theme-${saved}"></use></svg>Theme`
})
