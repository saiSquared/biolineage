'use strict'

// import Autocomplete from '/js/autocomplete/autocomplete.esm.min.js'

const floatingUI = window.FloatingUIDOM

/**
 * @typedef {Object} ModalFormGroup
 * @property {String} value - value for the option
 * @property {String} text - text for the option
 */

/**
 * @typedef {Object} ModalFormSelectOption
 * @property {String} value - value for the option
 * @property {String} text - text for the option
 */

/**
 * @typedef {Object} ModalFormHandler
 * @property {String} event - event to bind
 * @property {function(): void} handler - function to execute when event is triggered
 */

/**
 * @typedef {Object} ModalFormDataAttribute
 * @property {String} attribute - slug for attribute i.e. data-{attribute}
 * @property {String} value - value for the attribute
 */

/**
 * @typedef {Object} ModalFormField
 * @property {String} group - group the field belongs to
 * @property {String} label - text for the field's label
 * @property {String} [labelClass] - CSS class(es) fr the label
 * @property {Boolean} [labelHidden] - whether the field is hidden
 * @property {String} name - database name of the field
 * @property {String} id - for id for the field
 * @property {text|textarea|select|combo|autocomplete|toggle} type - type of field
 * @property {String} [fieldClass] - CSS class(es) fr the field
 * @property {String} [placeholder] - placeholder text for text fields
 * @property {Boolean} [hidden] - whether the field is hidden
 * @property {Boolean} [ignore] - whether to exclude the field from the data
 * @property {Boolean} [autofocus] - whether the field should automatically be focused
 * @property {Boolean} [required] - whether the field is required
 * @property {Boolean} [disabled] - whether the field is disabled
 * @property {String} [pattern] - pattern attribute for text inputs
 * @property {String} [width] - width for the field
 * @property {String} [tip] - FloatingUI tooltip
 * @property {ModalFormSelectOption[]} [options] - options for select fields
 * @property {ModalFormHandler[]} [handlers] - event handlers for the field
 * @property {ModalFormDataAttribute[]} [data] - odataset attributes
 * @property {any} [value] - value for the field
 */

/**
 * Create a new entity modal for creating, picking and/or editing an enity
 * @param {add|edit} mode - mode the form is working in
 * @param {String} endpoint - API endpoint for the form to POST to
 * @param {String} header - header for the modal
 * @param {ModalFormField[]} fields - array of fields to use in the form
 * @param {ModalFormGroup[]} [groups] - optional groups to organize the fields
 * @param {Object} [validators] - functions to validate fields
 */
export default function modalForm(mode, endpoint, header, fields, groups, validators) {
	const dataPackage = {}
	const sourcePackage = {}
	for (const field of fields) {
		if (!field.ignore) dataPackage[field.name] = field.value || null
		if (!field.ignore) sourcePackage[field.name] = field.value || null
	}

	let modalOverlay, modalDialog, modalClose, modalCancel, modalSave, modalBody
	let modalResolve
	let isDirty = false
	let autofocus = null

	function checkDirty() {
		const dirtyReasons = []
		if (mode === 'add') {
			isDirty = true
		} else {
			isDirty = false

			for (const field of fields) {
				if (!field.ignore) {
					if (getValue(field.id) !== sourcePackage[field.name]) {
						dirtyReasons.push({ field: field.id, old: sourcePackage[field.name], new: getValue(field.id) })
						isDirty = true
					}
				}
			}
		}

		// console.log({ isDirty, dirtyReasons })
		if (isDirty) {
			modalSave.removeAttribute('disabled')
		} else {
			modalSave.setAttribute('disabled', '')
		}
	}

	/**
	 * Create a label and associated form field
	 * @param {ModalFormField} labelInput - field definition
	 * @param {String} [labelClass] - CSS class for the label
	 * @returns {HTMLElement}
	 */
	function createLabel(labelInput, labelClass) {
		const label = document.createElement('label')
		if (labelClass) label.className = labelClass
		if (labelInput.width) label.style.width = labelInput.width
		const span = document.createElement('span')
		span.innerHTML = labelInput.label
		label.appendChild(span)
		if (labelInput.labelHidden) label.style.display = 'none'

		let ele

		switch (labelInput.type) {
			case 'text': {
				ele = document.createElement('input')
				ele.id = labelInput.id
				ele.type = labelInput.type
				ele.setAttribute('placeholder', labelInput.placeholder)
				if (labelInput.hidden) ele.setAttribute('hidden', '')
				if (labelInput.required) ele.setAttribute('required', '')
				if (labelInput.disabled) ele.setAttribute('disabled', '')
				if (labelInput.autofocus) {
					ele.setAttribute('autofocus', '')
					autofocus = ele
				}
				if (labelInput.pattern) ele.setAttribute('pattern', labelInput.pattern)
				if (labelInput.value) ele.setAttribute('value', labelInput.value)
				ele.addEventListener('input', event => {
					event.target.setCustomValidity('')
					checkDirty()
				})
				break
			}
			case 'textarea': {
				ele = document.createElement('textarea')
				ele.id = labelInput.id
				ele.setAttribute('placeholder', labelInput.placeholder)
				if (labelInput.required) ele.setAttribute('required', '')
				if (labelInput.disabled) ele.setAttribute('disabled', '')
				if (labelInput.autofocus) {
					ele.setAttribute('autofocus', '')
					autofocus = ele
				}
				if (labelInput.value) ele.setAttribute('value', labelInput.value)
				ele.addEventListener('input', event => {
					event.target.setCustomValidity('')
					checkDirty()
				})
				break
			}
			case 'select': {
				ele = document.createElement('select')
				ele.id = labelInput.id
				if (labelInput.disabled) ele.setAttribute('disabled', '')
				if (labelInput.autofocus) {
					ele.setAttribute('autofocus', '')
					autofocus = ele
				}
				for (const opt of labelInput.options) {
					const option = document.createElement('option')
					option.value = opt.value
					option.innerHTML = opt.text
					if (labelInput.value && labelInput.value === opt.value) option.setAttribute('selected', '')
					ele.appendChild(option)
				}
				ele.addEventListener('change', event => {
					event.target.setCustomValidity('')
					checkDirty()
				})
				break
			}
			case 'toggle': {
				label.classList.add('toggle')
				label.innerHTML = ''
				ele = document.createElement('input')
				ele.id = labelInput.id
				ele.className = 'toggle-checkbox'
				ele.type = 'checkbox'
				if (labelInput.autofocus) {
					ele.setAttribute('autofocus', '')
					autofocus = ele
				}
				if (labelInput.value) ele.setAttribute('checked', '')
				break
			}
		}

		if (labelInput.tip) {
			ele.addEventListener('focus', () => {
				showFieldTooltip(ele, labelInput.tip)
			})
			ele.addEventListener('blur', () => {
				hideFieldTooltip(ele)
			})
		}

		if (labelInput.labelData) {
			for (const item of labelInput.labelData) {
				label.dataset[item.attribute] = item.value
			}
		}

		if (labelInput.fieldData) {
			for (const item of labelInput.fieldData) {
				ele.dataset[item.attribute] = item.value
			}
		}

		if (labelInput.handlers) {
			for (const handler of labelInput.handlers) {
				ele.addEventListener(handler.event, () => { handler.handler() })
			}
		}

		label.appendChild(ele)

		switch (labelInput.type) {
			case 'toggle': {
				const toggleSwitch = document.createElement('div')
				toggleSwitch.className = 'toggle-switch'
				label.appendChild(toggleSwitch)
				const toggleLabel = document.createElement('span')
				toggleLabel.className = 'toggle-label'
				toggleLabel.innerHTML = labelInput.label
				label.appendChild(toggleLabel)
				break
			}
		}

		return label
	}

	function createModalOverlay() {
		modalOverlay = document.createElement('div')
		modalOverlay.id = 'modal-overlay'
		modalOverlay.className = 'modal-overlay hidden'

		document.body.appendChild(modalOverlay)

		modalOverlay.addEventListener('click', handleOverlayClick)

		document.addEventListener('keydown', handleOverlayKeydown)

		document.body.classList.add('modal-open')
	}

	function getValue(field) {
		const value = document.getElementById(field).type === 'checkbox' ? document.getElementById(field).checked : document.getElementById(field).value
		return value === '' ? null : value
	}

	function handleModalClose() {
		modalOverlay.classList.remove('is-visible')
		modalDialog.classList.remove('is-visible')

		modalOverlay.addEventListener(
			'transitionend',
			() => {
				modalOverlay.classList.add('hidden')
				if (modalCancel) modalCancel.removeEventListener('click', handleModalClose)
				if (modalSave) modalSave.removeEventListener('click', handleModalSave)
				modalBody.removeEventListener('submit', handleModalSave)
				modalClose.removeEventListener('click', handleModalClose)
				modalOverlay.removeEventListener('click', handleOverlayClick)
				document.removeEventListener('keydown', handleOverlayKeydown)
				modalDialog.remove()
				modalOverlay.remove()
				modalDialog = null
				modalOverlay = null
				document.body.classList.remove('modal-open')
				modalResolve(null)
			},
			{ once: true }
		)
	}

	function handleOverlayClick(event) {
		if (event.target === modalOverlay) handleModalClose()
	}

	function handleOverlayKeydown(event) {
		if (event.key === 'Escape' && modalOverlay.classList.contains('is-visible')) {
			handleModalClose()
		}
	}

	async function handleModalSave(event) {
		event.preventDefault()

		for (const key in validators) {
			await validators[key](getValue)
		}

		const valid = modalBody.reportValidity()
		console.log({ valid })
		if (!valid) return

		for (const field of fields) {
			if (!field.ignore) {
				dataPackage[field.name] = getValue(field.id)
			}
		}

		console.log({ endpoint, dataPackage, sourcePackage })

		const response = await fetch(endpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(dataPackage)
		}).then(r => r.json())

		console.log(response)

		if (response.ok) {
			handleModalClose()
			modalResolve(response.id)
		}
	}

	function hideFieldTooltip(fieldElement) {
		const tip = fieldElement._tooltipElement
		const cleanup = fieldElement._tooltipCleanup

		if (cleanup) cleanup()
		if (tip) tip.remove()

		fieldElement._tooltipElement = null
		fieldElement._tooltipCleanup = null
	}

	async function show() {
		return new Promise((resolve, reject) => {
			modalResolve = resolve

			let span

			createModalOverlay()

			modalDialog = document.createElement('div')
			modalDialog.id = 'modal'
			modalDialog.className = 'modal modal-entity'
			const modalDialogHeader = document.createElement('div')
			modalDialogHeader.className = 'modal-header'
			const modalDialogHeading = document.createElement('h2')
			modalDialogHeading.innerHTML = header
			modalDialogHeader.appendChild(modalDialogHeading)
			modalClose = document.createElement('button')
			modalClose.type = 'button'
			modalClose.id = 'modal-close'
			modalClose.innerHTML = '<svg><use href="#icon-close"></use></svg>'
			modalClose.addEventListener('click', handleModalClose)
			modalDialogHeader.appendChild(modalClose)
			modalDialog.appendChild(modalDialogHeader)

			modalBody = document.createElement('form')
			modalBody.className = 'modal-body modal-body-flex'
			modalBody.noValidate = true

			if (groups) {
				for (const group of groups) {
					if (group.header) {
						const groupHeading = document.createElement('h3')
						groupHeading.innerHTML = group.header
						modalBody.appendChild(groupHeading)
					}
					const groupContainer = document.createElement('div')
					groupContainer.className = 'modal-group'
					const groupFields = fields.filter(data => data.group === group.slug)
					for (const field of groupFields) {
						groupContainer.appendChild(createLabel(field))
					}
					modalBody.appendChild(groupContainer)
				}
			} else {
				for (const field of fields) {
					modalBody.appendChild(createLabel(field))
				}
			}

			modalBody.addEventListener('submit', handleModalSave)
			modalDialog.appendChild(modalBody)

			const modalDialogActions = document.createElement('div')
			const floatingRoot = document.createElement('div')
			floatingRoot.id = 'floating-root'
			modalDialogActions.appendChild(floatingRoot)
			modalDialogActions.className = 'modal-actions'
			modalCancel = document.createElement('button')
			modalCancel.type = 'button'
			modalCancel.className = 'action-button'
			span = document.createElement('span')
			span.innerHTML = 'Cancel'
			modalCancel.appendChild(span)
			modalCancel.addEventListener('click', handleModalClose)
			modalDialogActions.appendChild(modalCancel)
			modalSave = document.createElement('button')
			modalSave.type = 'button'
			modalSave.className = 'action-button button-accent'
			span = document.createElement('span')
			span.innerHTML = 'Save'
			modalSave.appendChild(span)
			modalSave.addEventListener('click', handleModalSave)
			modalDialogActions.appendChild(modalSave)
			modalDialog.appendChild(modalDialogActions)
			modalOverlay.appendChild(modalDialog)

			checkDirty()

			modalOverlay.classList.remove('hidden')

			requestAnimationFrame(() => {
				modalOverlay.classList.add('is-visible')
				modalDialog.classList.add('is-visible')
				if (autofocus) autofocus.focus()
			})
		})
	}

	function showFieldTooltip(fieldElement, message) {
		// Create tooltip
		const tip = document.createElement('div')
		tip.className = 'field-tooltip'
		tip.innerHTML = message

		// Append to floating root inside the modal
		document.querySelector('#floating-root').appendChild(tip)

		// Start auto-update loop
		const cleanup = floatingUI.autoUpdate(fieldElement, tip, () => {
			floatingUI.computePosition(fieldElement, tip, {
				strategy: 'fixed',
				placement: 'bottom',
				middleware: [
					floatingUI.offset(8),
					floatingUI.flip(),
					floatingUI.shift()
				]
			}).then(({ x, y }) => {
				tip.style.left = `${x}px`
				tip.style.top = `${y}px`
			})
		})

		// Store references so blur can remove it
		fieldElement._tooltipElement = tip
		fieldElement._tooltipCleanup = cleanup
	}

	return { show }
}
