'use strict'

import Autocomplete from '/js/autocomplete/autocomplete.esm.min.js'
import propertyGrid from './property-grid.js'

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
 * @typedef {Object} ModalFormRadioOption
 * @property {String} value - value for the radio option
 * @property {String} text - text for the radiooption
 * @property {ModalFormField[]} fields - array of fields to use for this radio option
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
 * @property {text|textarea|select|radio|combo|autocomplete|toggle|properties} type - type of field
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
 * @property {String} [api] - API endpoint for autocomplete and combo
 * @property {ModalFormSelectOption[]} [options] - options for select fields
 * @property {ModalFormRadioOption[]} [radioOptions] - options for radio fields
 * @property {ModalFormHandler[]} [handlers] - event handlers for the field
 * @property {ModalFormDataAttribute[]} [data] - odataset attributes
 * @property {any} [value] - value for the field
 */

/**
 * @typedef {Object} ModalFormOptions
 * @property {add|edit} mode - mode the form is working in
 * @property {String} endpoint - API endpoint for the form to POST to
 * @property {String} [deleteEndpoint] - API endpoint for deletion
 * @property {String} header - header for the modal
 */

/**
 * Create a new entity modal for creating, picking and/or editing an enity
 * @param {ModalFormOptions} options - modal form options
 * @param {ModalFormField[]} fields - array of fields to use in the form
 * @param {ModalFormGroup[]} [groups] - optional groups to organize the fields
 * @param {Object} [validators] - functions to validate fields
 */
export default function modalForm(options, fields, groups, validators) {
	const mode = options.mode
	const allFields = []
	const autocompletes = []
	const tomSelects = []
	const tomSelectElements = []
	const propertyGrids = []
	const propertyGridElements = []
	const dataPackage = {}
	const sourcePackage = {}
	console.log(fields)
	for (const field of fields) {
		allFields.push(field)
		if (!field.ignore) {
			dataPackage[field.name] = field.value ? String(field.value) : null
			sourcePackage[field.name] = field.value ? String(field.value) : null
			if (field.type === 'radio') {
				for (const opt of field.radioOptions) {
					for (const radioField of opt.fields) {
						allFields.push(radioField)
						if (!radioField.ignore) {
							dataPackage[radioField.name] = radioField.value ? String(radioField.value) : null
							sourcePackage[radioField.name] = radioField.value ? String(radioField.value) : null
						}
					}
				}
			}
		}
	}
	// console.log({ dataPackage, sourcePackage })

	let modalOverlay, modalDialog, modalDelete, modalClose, modalCancel, modalSave, modalBody
	let modalResolve
	let isDirty = false
	let autofocus = null

	function checkDirty() {
		// console.log({ mode })
		const dirtyReasons = []
		if (mode === 'add') {
			isDirty = true
		} else {
			isDirty = false

			for (const field of allFields) {
				// console.log(field)
				if (!field.ignore) {
					if (getValue(field.id) !== sourcePackage[field.name]) {
						dirtyReasons.push({ field: field.id, old: sourcePackage[field.name], new: getValue(field.id) })
						isDirty = true
					}
				}
			}
		}

		console.log({ isDirty, dirtyReasons })
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
	function createLabel(host, labelInput) {
		const label = document.createElement('label')
		if (labelInput.labelClass) label.className = labelInput.labelClass
		if (labelInput.width) label.style.width = labelInput.width
		if (labelInput.label) {
			const span = document.createElement('span')
			span.innerHTML = labelInput.label
			label.appendChild(span)
		}
		if (labelInput.labelHidden) label.style.display = 'none'

		let ele, child
		let noLabel = false

		switch (labelInput.type) {
			case 'text': {
				ele = document.createElement('input')
				ele.id = labelInput.id
				if (labelInput.fieldClass) ele.className = labelInput.fieldClass
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
				child = ele
				break
			}

			case 'textarea': {
				ele = document.createElement('textarea')
				ele.id = labelInput.id
				if (labelInput.fieldClass) ele.className = labelInput.fieldClass
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
				child = ele
				break
			}

			case 'select': {
				ele = document.createElement('select')
				ele.id = labelInput.id
				if (labelInput.fieldClass) ele.className = labelInput.fieldClass
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
				child = ele
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
				child = ele
				break
			}

			case 'radio': {
				noLabel = true
				const radioGroup = document.createElement('section')
				radioGroup.className = 'modal-radio-group'
				let div
				for (const opt of labelInput.radioOptions) {
					div = document.createElement('div')
					div.className = 'modal-radio-group-radio'
					const radio = document.createElement('input')
					radio.id = `${labelInput.id}-${opt.value}`
					radio.name = labelInput.id
					radio.type = 'radio'
					radio.value = opt.value
					if (labelInput.value && labelInput.value === opt.value) radio.setAttribute('checked', '')
					radio.addEventListener('change', event => {
						event.target.setCustomValidity('')
						checkDirty()
					})
					div.appendChild(radio)
					radioGroup.appendChild(div)
					div = document.createElement('div')
					const radioLabel = document.createElement('label')
					radioLabel.setAttribute('for', `${labelInput.id}-${opt.value}`)
					radioLabel.innerHTML = opt.text
					div.appendChild(radioLabel)
					radioGroup.appendChild(div)
					if (opt.fields.length > 0) {
						div = document.createElement('div')
						radioGroup.appendChild(div)
						div = document.createElement('div')
						div.className = 'modal-group'
						for (const field of opt.fields) {
							createLabel(div, field)
						}
						radioGroup.appendChild(div)
					}
				}
				host.appendChild(radioGroup)
				break
			}

			case 'autocomplete': {
				const div = document.createElement('div')
				div.className = 'autocomplete-input auto-search-wrapper max-height loupe'
				ele = document.createElement('input')
				ele.id = labelInput.id
				ele.type = 'text'
				ele.dataset.field = labelInput.name
				ele.dataset.value = labelInput.value || ''
				ele.setAttribute('autocomplete', 'off')
				ele.setAttribute('placeholder', labelInput.placeholder)
				if (labelInput.required) ele.setAttribute('required', '')
				if (labelInput.autofocus) {
					ele.setAttribute('autofocus', '')
					autofocus = ele
				}
				if (labelInput.value) ele.setAttribute('value', labelInput.value)
				ele.addEventListener('input', event => {
					event.target.setCustomValidity('')
					checkDirty()
				})
				div.appendChild(ele)
				child = div
				autocompletes.push({ id: labelInput.id, api: labelInput.api })
				break
			}

			case 'combo': {
				ele = document.createElement('select')
				ele.id = labelInput.id
				if (labelInput.fieldClass) ele.className = labelInput.fieldClass
				ele.setAttribute('placeholder', labelInput.placeholder)
				if (labelInput.required) ele.setAttribute('required', '')
				if (labelInput.autofocus) {
					ele.setAttribute('autofocus', '')
					autofocus = ele
				}
				if (labelInput.value) ele.setAttribute('value', labelInput.value)
				ele.addEventListener('input', event => {
					event.target.setCustomValidity('')
					checkDirty()
				})
				child = ele
				tomSelects.push({ id: labelInput.id, api: labelInput.api, tip: labelInput.tip })
				break
			}

			case 'properties': {
				ele = document.createElement('div')
				ele.id = labelInput.id
				if (labelInput.value) ele.setAttribute('value', labelInput.value)
				child = ele
				propertyGrids.push({ id: labelInput.id, value: labelInput.value })
			}
		}

		if (!noLabel) {
			if (labelInput.tip && labelInput.type !== 'combo') {
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

			label.appendChild(child)

			// before append
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

			host.appendChild(label)
		}
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
		// console.log(field)
		const fieldDetails = allFields.find(lookup => lookup.id === field)
		// console.log(fieldDetails)
		let value
		switch (fieldDetails.type) {
			case 'autocomplete': {
				const ele = document.getElementById(field)
				if (ele.dataset.value === '') {
					value = null
				} else {
					value = ele.dataset.value
				}
				break
			}
			case 'combo': {
				const ts = tomSelectElements.find(lookup => lookup.id === field)
				value = ts.ts.getValue()
				break
			}
			case 'radio': {
				const ele = document.querySelector(`input[name="${field}"]:checked`)
				value = ele.value
				break
			}
			case 'properties': {
				const ele = propertyGridElements.find(lookup => lookup.id === field)
				value = ele.pGrid.value
				break
			}
			default: {
				const ele = document.getElementById(field)
				switch (ele.nodeName) {
					case 'SELECT':
					case 'TEXTAREA':
						value = ele.value
						break
					case 'INPUT':
						switch (ele.type) {
							case 'checkbox':
								value = ele.checked
								break
							case 'radio':
								value = ele.checked
								break
							default:
								value = ele.value
						}
				}
			}
		}
		return value === '' ? null : value
	}

	function handleModalClose() {
		modalOverlay.classList.remove('is-visible')
		modalDialog.classList.remove('is-visible')

		modalOverlay.addEventListener(
			'transitionend',
			() => {
				modalOverlay.classList.add('hidden')
				if (modalDelete) modalDelete.removeEventListener('click', handleModalDelete)
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

	function handleModalDelete() {
		handleModalSave(null, true)
	}

	function handleOverlayClick(event) {
		if (event.target === modalOverlay) handleModalClose()
	}

	function handleOverlayKeydown(event) {
		if (event.key === 'Escape' && modalOverlay.classList.contains('is-visible')) {
			handleModalClose()
		}
	}

	async function handleModalSave(event, del) {
		if (event) event.preventDefault()

		for (const key in validators) {
			await validators[key](getValue)
		}

		const valid = modalBody.reportValidity()
		// console.log({ valid })
		if (!valid) return

		for (const field of allFields) {
			if (!field.ignore) {
				dataPackage[field.name] = getValue(field.id)
			}
		}

		const endpoint = del ? options.deleteEndpoint : options.endpoint

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
			modalDialogHeading.innerHTML = options.header
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
						createLabel(groupContainer, field)
					}
					modalBody.appendChild(groupContainer)
				}
			} else {
				for (const field of fields) {
					createLabel(modalBody, field)
				}
			}

			modalBody.addEventListener('submit', handleModalSave)
			modalDialog.appendChild(modalBody)

			const modalDialogActions = document.createElement('div')
			const floatingRoot = document.createElement('div')
			floatingRoot.id = 'floating-root'
			modalDialogActions.appendChild(floatingRoot)
			modalDialogActions.className = 'modal-actions'
			if (options.deleteEndpoint) {
				modalDelete = document.createElement('button')
				modalDelete.type = 'button'
				modalDelete.className = 'action-button action-button-delete'
				span = document.createElement('span')
				span.innerHTML = 'Delete'
				modalDelete.appendChild(span)
				modalDelete.addEventListener('click', handleModalDelete)
				modalDialogActions.appendChild(modalDelete)
			}
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

			for (const autocomplete of autocompletes) {
				new Autocomplete(autocomplete.id, {
					clearButtonOnInitial: true,
					cache: true,
					onSearch: async ({ currentValue }) => {
						return await fetch(`${autocomplete.api}?q=${encodeURI(currentValue)}`).then(r => r.json())
					},
					onResults: ({ matches }) => {
						return matches.map(data => `<li>${data.name}</li>`).join('')
					},
					onSubmit: ({ element, object }) => {
						// console.log({ element, object })
						element.dataset.value = object.id
					},
					onReset: (element) => {
						element.dataset.value = ''
					}
				})
			}

			for (const tomSelect of tomSelects) {
				const ts = new TomSelect(`#${tomSelect.id}`, {
					valueField: 'id',
					labelField: 'name',
					searchField: 'name',
					allowHtml: true,
					persist: false,
					create: true,
					createOnBlur: true,
					maxItems: 1,
					load: function (query, callback) {
						fetch(`${tomSelect.api}?q=${encodeURI(query)}`)
							.then(r => r.json())
							.then(json => {
								callback(json)
							})
							.catch(() => callback())
					}
				})
				tomSelectElements.push({ id: tomSelect.id, ts })
				// console.log(ts.control_input)
				if (tomSelect.tip) {
					ts.control_input.addEventListener('focus', () => {
						showFieldTooltip(ts.control_input, tomSelect.tip)
					})
					ts.control_input.addEventListener('blur', () => {
						hideFieldTooltip(ts.control_input)
					})
				}
			}

			for (const pg of propertyGrids) {
				const pGrid = new propertyGrid(document.getElementById(pg.id), pg.value)
				document.getElementById(pg.id).addEventListener('propertygridchange', checkDirty)
				propertyGridElements.push({ id: pg.id, pGrid })
			}

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
				placement: 'top-end',
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
