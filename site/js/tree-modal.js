'use strict'

const floatingUI = window.FloatingUIDOM

/**
 * @typedef {Object} SelectOption
 * @property {String} value - value for the option
 * @property {String} text - text for the option
 */

/**
 * @typedef {Object} EntityField
 * @property {String} group - group the field belongs to
 * @property {String} label - text for the field's label
 * @property {String} name - database name of the field
 * @property {String} id - for id for the field
 * @property {text|textarea|select} type - type of field
 * @property {String} [class] - CSS class(es) fr the field
 * @property {String} [placeholder] - placeholder text for text fields
 * @property {Boolean} [required] - whether the field is required
 * @property {Boolean} [disabled] - whether the field is disabled
 * @property {String} [pattern] - pattern attribute for text inputs
 * @property {String} [width] - width for the field
 * @property {Number} [grow] - flex grow property for the field
 * @property {String} [tip] - FloatingUI tooltip
 * @property {SelectOption[]} [options] - options for select fields
 */

/**
 * Create a new entity modal for creating, picking and/or editing an enity
 * @param {Object} [treeData] - existing tree data for editing
 */
export default function treeModal(treeData) {
	/** @type {EntityField[]} */
	const fields = [
		{
			group: 'tree',
			label: 'Tree Name',
			name: 'name',
			id: 'tree-name',
			type: 'text',
			placeholder: 'Name',
			required: true,
			width: '100%',
			tip: 'A unique name for your tree, will be checked against existing trees before creation.'
		},
		{
			group: 'tree',
			label: 'Entity Type',
			name: 'entityTypeId',
			id: 'tree-type',
			type: 'select',
			options: [
				{ value: 'd4780b1f-3764-491d-9942-dc814c3750b4', text: 'Human' },
				{ value: '409a8c4f-1167-4039-b298-f46ce7bcf7fd', text: 'Equine' }
			],
			tip: 'The type of entities you want to track in this tree.'
		}
	]
	const dataPackage = {
		treeId: null
	}
	const sourcePackage = treeData
	for (const field of fields) {
		if (treeData) field.value = treeData[field]
		dataPackage[field] = treeData ? treeData[field] : null
	}
	const mode = treeData ? 'edit' : 'add'
	const header = treeData ? 'Edit Tree' : 'Add Tree'

	let modalOverlay, modalDialog, modalClose, modalCancel, modalSave, modalBody
	let modalResolve
	let isDirty = false

	function checkDirty() {
		const dirtyReasons = []
		if (mode === 'add') {
			isDirty = true
		} else {
			isDirty = false

			for (const field of fields) {
				if (getValue(field.id) !== sourcePackage[field.name]) {
					dirtyReasons.push({ field: field.id, old: sourcePackage[field.name], new: getValue(field.id) })
					isDirty = true
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
	 * @param {EntityField} labelInput - field definition
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
		let ele
		switch (labelInput.type) {
			case 'text': {
				ele = document.createElement('input')
				ele.id = labelInput.id
				ele.type = labelInput.type
				ele.setAttribute('placeholder', labelInput.placeholder)
				if (labelInput.required) ele.setAttribute('required', '')
				if (labelInput.disabled) ele.setAttribute('disabled', '')
				if (labelInput.pattern) ele.setAttribute('pattern', labelInput.pattern)
				if (labelInput.grow) ele.style.flexGrow = labelInput.grow
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
				if (labelInput.grow) ele.style.flexGrow = labelInput.grow
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
		label.appendChild(ele)
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
		const value = document.getElementById(field).value
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
		if (getValue('tree-name')) {
			const result = await fetch('/api/tree/get', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: getValue('tree-name') })
			}).then(r => r.json())
			console.log(result)
			if (result) {
				document.getElementById('tree-name').setCustomValidity('Tree name already taken')
			} else {
				document.getElementById('tree-name').setCustomValidity('')
			}
		} else {
			document.getElementById('tree-name').setCustomValidity('')
		}
		const valid = modalBody.reportValidity()
		console.log({ valid })
		if (!valid) return

		for (const field of fields) {
			dataPackage[field.name] = getValue(field.id)
		}
		let endpoint
		if (mode === 'add') {
			endpoint = '/api/tree/add'
		} else {
			endpoint = '/api/tree/update'
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
			if (mode === 'add') {
				location.href = `/trees/${response.id}`
			} else {
				location.reload()
			}
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
			modalDialog.className = 'modal modal-editor'
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

			for (const field of fields) {
				modalBody.appendChild(createLabel(field))
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
				document.querySelector('form > :first-child').focus()
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
				placement: 'top',
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
