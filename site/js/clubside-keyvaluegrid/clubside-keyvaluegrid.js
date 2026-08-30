'use strict'

/**
 * @typedef {Object} ClubsideKeyValueGridOptions
 * @property {string} [addRowImage] - URL of image for the add row button
 * @property {string} [deleteRowImage] - URL of image for the delete row button
 * @property {Object.<string, *>} [value] - value of KeyValueGrid
 */

/**
 * Create a new instance of Clubside KeyValueGrid
 * @param {HTMLElement} root
 * @param {ClubsideKeyValueGridOptions} options
 */
export default function clubsideKeyValueGrid(root, options) {
	if (!(root instanceof HTMLElement)) {
		throw new Error('ComboBox root must be an HTMLElement')
	}

	if (root.children.length > 0) {
		throw new Error('ComboBox root must not contain child elements')
	}

	if (!options || typeof options !== 'object') {
		throw new Error('ComboBox options must be provided')
	}

	const { addRowImage, deleteRowImage, value } = options

	// Convert input object → internal model array
	const model = Object.entries(value || {}).map(([key, value]) => ({
		key,
		value
	}))

	// Always start with one empty row if no data
	if (model.length === 0) {
		model.push({ key: '', value: '' })
	}

	root.classList.add('cskvg')

	const addRowSvg =
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
			<path clip-rule="evenodd" d="m256 0c-141.2 0-256 114.8-256 256s114.8 256 256 256 256-114.8 256-256-114.8-256-256-256z" fill="#4bae4f" fill-rule="evenodd"/>
			<path d="m116 279.6v-47.3c0-4.8 3.9-8.8 8.8-8.8h98.9v-98.8c0-4.8 3.9-8.8 8.8-8.8h47.3c4.8 0 8.7 3.9 8.7 8.8v98.9h98.8c4.8 0 8.8 3.9 8.8 8.8v47.3c0 4.8-3.9 8.7-8.8 8.7h-98.9v98.8c0 4.8-3.9 8.8-8.7 8.8h-47.3c-4.8 0-8.8-3.9-8.8-8.8v-98.9h-98.8c-4.9.1-8.8-3.9-8.8-8.7z" fill="#fff"/>
		</svg>`

	const deleteRowSvg =
		`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512">
			<ellipse style="fill:#E21B1B;" cx="256" cy="256" rx="256" ry="255.832"/>
			<rect x="113.12" y="228" style="fill:#FFFFFF;" width="285.672" height="56"/>
		</svg>`

	function render() {
		root.innerHTML = '' // Clear root

		for (const header of ['Property', 'Value', '']) {
			const div = document.createElement('div')
			div.className = 'cskvg-header'
			div.innerHTML = header
			root.appendChild(div)
		}

		model.forEach((row, idx) => {
			const keyDiv = document.createElement('div')
			const keyInput = document.createElement('input')
			keyInput.type = 'text'
			keyInput.value = row.key || ''
			keyInput.addEventListener('input', () => {
				model[idx].key = keyInput.value.trim()
				root.dispatchEvent(new Event('change', { bubbles: true }))
			})
			// ENTER in keyDiv → move caret to valueDiv
			keyInput.addEventListener('keydown', (event) => {
				if (event.key === 'Enter') {
					event.preventDefault()
					if (keyInput.value.trim() !== '') {
						const el = event.target.parentElement
						const sib = el.nextElementSibling
						sib.firstElementChild.focus()
					}
				}
			})
			keyInput.addEventListener('blur', (event) => {
				event.target.setCustomValidity('')
			})
			keyDiv.appendChild(keyInput)
			root.appendChild(keyDiv)

			const valueDiv = document.createElement('div')
			const valueInput = document.createElement('input')
			valueInput.type = 'text'
			valueInput.value = row.value || ''
			valueInput.addEventListener('input', () => {
				model[idx].value = valueInput.value.trim()
				root.dispatchEvent(new Event('change', { bubbles: true }))
			})
			// ENTER in valueDiv → add new row
			valueDiv.addEventListener('keydown', (event) => {
				if (event.key === 'Enter') {
					event.preventDefault()
					if (valueInput.value.trim() !== '') {
						model.push({ key: '', value: '' })
						render()
						requestAnimationFrame(() => {
							const inputs = root.querySelectorAll('input')
							inputs[inputs.length - 2].focus()
						})
					}
				}
			})
			valueDiv.appendChild(valueInput)
			root.appendChild(valueDiv)

			const actionDiv = document.createElement('div')
			const actionButton = document.createElement('button')
			actionButton.type = 'button'
			if (idx === 0) {
				actionButton.innerHTML = addRowImage ? `<img src="${addRowImage}">` : addRowSvg
				actionButton.addEventListener('click', () => {
					model.push({ key: '', value: '' })
					render()
					requestAnimationFrame(() => {
						const inputs = root.querySelectorAll('input')
						inputs[inputs.length - 2].focus()
					})
				})
			} else {
				actionButton.innerHTML = deleteRowImage ? `<img src="${deleteRowImage}">` : deleteRowSvg
				actionButton.addEventListener('click', () => {
					model.splice(idx, 1)
					render()
					// Focus last row's value cell
					requestAnimationFrame(() => {
						const inputs = root.querySelectorAll('input')
						inputs[inputs.length - 1].focus()
					})
				})
			}
			actionDiv.appendChild(actionButton)
			root.appendChild(actionDiv)
		})
	}

	function returnValue() {
		// If only one row and either key or value is empty → null
		if (model.length === 1) {
			const row = model[0]
			if (!row.key.trim() || !row.value.trim()) {
				return null
			}
		}

		// Build object from non-empty keys
		const obj = {}
		for (const row of model) {
			const key = row.key.trim()
			if (key !== '') {
				obj[key] = row.value
			}
		}

		// If object ended up empty → null
		return Object.keys(obj).length > 0 ? obj : null
	}

	render()

	// Public value API
	Object.defineProperty(root, 'value', {
		get() { return returnValue() },
		set(v) {
			model.length = 0
			for (const key of Object.keys(v)) {
				model.push({ key, value: v[key] })
			}
			render()
		}
	})

	return root
}
