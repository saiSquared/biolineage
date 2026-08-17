'use strict'

// import Autocomplete from '/js/autocomplete/autocomplete.esm.min.js'

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
 * @param {String} treeId - tree UUID
 * @param {String} entityTypeId - entity type UUID
 * @param {Object} [entityData] - existing entity data for editing
 * @param {Boolean} [showPicker] - whether the user should have the option to choose an existing entity
 */
export default function entityModal(treeId, entityTypeId, entityData, showPicker) {
	/** @type {EntityField[]} */
	const fields = [
		{
			group: 'name',
			label: 'Name Type',
			name: 'nameType',
			id: 'name-type',
			type: 'text',
			placeholder: 'Type',
			required: true,
			width: '100%',
			tip: 'Identifies which version of this person’s name this record represents (birth, married, adopted, professional, religious, imported, etc.). Each person may have multiple names, but only one of each type.'
		},
		{
			group: 'name',
			label: 'Display Name',
			name: 'displayName',
			id: 'display-name',
			type: 'text',
			placeholder: 'Display name',
			required: true,
			width: '100%',
			tip: 'The main name shown in trees, lists, search results, and relationship panels. This should be the name most commonly associated with the person.'
		},
		{
			group: 'name',
			label: 'Prefix',
			name: 'prefixName',
			id: 'prefix-name',
			type: 'text',
			placeholder: 'ex. Dr.',
			width: '14ch',
			tip: 'Honorific or name prefix, such as <em>Dr.</em>, <em>Rev.</em>, <em>Hon.</em>, or cultural prefixes used before given names.'
		},
		{
			group: 'name',
			label: 'Given Name',
			name: 'givenName',
			id: 'given-name',
			type: 'text',
			placeholder: 'ex. Henry',
			width: '20ch',
			tip: 'The person’s given name or first name as recorded in historical documents.'
		},
		{
			group: 'name',
			label: 'Middle Name',
			name: 'middleName',
			id: 'middle-name',
			type: 'text',
			placeholder: 'ex. David',
			width: '20ch',
			tip: 'Any middle name or additional given name. Many cultures use multiple given names; include all of them here.'
		},
		{
			group: 'name',
			label: 'Prefix',
			name: 'prefixFamilyName',
			id: 'prefix-family-name',
			type: 'text',
			placeholder: 'ex. van',
			width: '14ch',
			tip: 'A family‑name prefix such as <em>van</em>, <em>de</em>, <em>der</em>, <em>ten</em>, <em>von</em>, or other cultural surname particles.'
		},
		{
			group: 'name',
			label: 'Family Name',
			name: 'familyName',
			id: 'family-name',
			type: 'text',
			placeholder: 'ex. Thoreau',
			width: '20ch',
			tip: 'The family name, surname, or last name. Include all parts of the surname except prefixes and suffixes.'
		},
		{
			group: 'name',
			label: 'Suffix',
			name: 'suffixName',
			id: 'suffix-name',
			type: 'text',
			placeholder: 'ex. III',
			width: '14ch',
			tip: 'A name suffix such as <em>Jr.</em>, <em>Sr.</em>, <em>III</em>, or similar. Do not include commas; formatting is handled automatically.'
		},
		{
			group: 'name',
			label: 'Nickname',
			name: 'nickName',
			id: 'nick-name',
			type: 'text',
			placeholder: 'ex. Scooter',
			width: '20ch',
			tip: 'A commonly used informal name, alias, or nickname found in records or family usage.'
		},
		{
			group: 'name',
			label: 'Description',
			name: 'description',
			id: 'description',
			type: 'textarea',
			placeholder: 'Additional information',
			width: '100%',
			tip: 'Optional notes or context about this name record, such as spelling variations, transcription notes, or cultural naming details.'
		},
		{
			group: 'sex',
			label: 'Sex',
			name: 'sex',
			id: 'sex',
			type: 'select',
			options: [
				{ value: '', text: 'Choose' },
				{ value: 'M', text: 'Male' },
				{ value: 'F', text: 'Female' }
			],
			tip: 'Biological sex as recorded in historical documents. Leave blank if unknown or not stated in available sources.'
		},
		{
			group: 'birth',
			label: 'Year',
			name: 'birthYear',
			id: 'birth-year',
			type: 'text',
			placeholder: 'yyyy',
			pattern: '^-?[0-9]+$',
			tip: 'Year of birth. Partial dates are allowed; enter the year even if the month or day is unknown.'
		},
		{
			group: 'birth',
			label: 'Month',
			name: 'birthMonth',
			id: 'birth-month',
			type: 'text',
			placeholder: 'mm',
			pattern: '^\\d{1,2}$',
			tip: 'Month of birth (1–12). Leave blank if the exact month is not known.'
		},
		{
			group: 'birth',
			label: 'Day',
			name: 'birthDay',
			id: 'birth-day',
			type: 'text',
			placeholder: 'dd',
			pattern: '^\\d{1,2}$',
			tip: 'Day of birth (1–31). Leave blank if the exact day is not known.'
		},
		{
			group: 'death',
			label: 'Year',
			name: 'deathYear',
			id: 'death-year',
			type: 'text',
			placeholder: 'yyyy',
			pattern: '^-?[0-9]+$',
			tip: 'Year of death. Partial dates are allowed; enter the year even if the month or day is unknown.'
		},
		{
			group: 'death',
			label: 'Month',
			name: 'deathMonth',
			id: 'death-month',
			type: 'text',
			placeholder: 'mm',
			pattern: '^\\d{1,2}$',
			tip: 'Month of death (1–12). Leave blank if the exact month is not known.'
		},
		{
			group: 'death',
			label: 'Day',
			name: 'deathDay',
			id: 'death-day',
			type: 'text',
			placeholder: 'dd',
			pattern: '^\\d{1,2}$',
			tip: 'Day of death (1–31). Leave blank if the exact day is not known.'
		}
	]
	const dataPackage = {
		treeId,
		entityTypeId,
		entityId: null
	}
	const sourcePackage = entityData
	for (const field of fields) {
		if (entityData) field.value = entityData[field]
		dataPackage[field] = entityData ? entityData[field] : null
	}
	const mode = entityData ? 'edit' : 'add'

	let modalOverlay, modalDialog, modalClose, modalCancel, modalSave, modalBody
	let modalResolve
	let isDirty = false
	let header = null
	switch (entityTypeId) {
		case '409a8c4f-1167-4039-b298-f46ce7bcf7fd':
			header = mode === 'add' ? 'Add Horse' : 'Edit Horse'
			break
		default:
			header = mode === 'add' ? 'Add Person' : 'Edit Person'
	}

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

		if (getValue('birth-day') && !getValue('birth-month')) {
			document.getElementById('birth-month').setCustomValidity('Month required if day is set')
		}
		if (getValue('birth-month') && !getValue('birth-year')) {
			document.getElementById('birth-year').setCustomValidity('Year required if month is set')
		}
		if (getValue('death-day') && !getValue('death-month')) {
			document.getElementById('death-month').setCustomValidity('Month required if day is set')
		}
		if (getValue('death-month') && !getValue('death-year')) {
			document.getElementById('death-year').setCustomValidity('Year required if month is set')
		}

		const valid = modalBody.reportValidity()
		console.log({ valid })
		if (!valid) return

		for (const field of fields) {
			dataPackage[field.name] = getValue(field.id)
		}
		let endpoint
		if (mode === 'add') {
			endpoint = '/api/entity/add'
		} else {
			endpoint = '/api/entity/update'
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
				modalResolve(response.id)
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

			const groups = [
				{ header: 'Name', slug: 'name' },
				{ header: 'Sex', slug: 'sex' },
				{ header: 'Birth', slug: 'birth' },
				{ header: 'Death', slug: 'death' }
			]
			for (const group of groups) {
				const groupHeading = document.createElement('h3')
				groupHeading.innerHTML = group.header
				modalBody.appendChild(groupHeading)
				const groupContainer = document.createElement('div')
				groupContainer.className = 'modal-group'
				const groupFields = fields.filter(data => data.group === group.slug)
				for (const field of groupFields) {
					groupContainer.appendChild(createLabel(field))
				}
				modalBody.appendChild(groupContainer)
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
