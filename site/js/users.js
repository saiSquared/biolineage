'use strict'

const main = document.querySelector('main')
const tableHolder = document.querySelector('.table-holder')
const cols = [
	{ width: '40%', align: 'left', header: 'Name', headerAlign: 'left', field: 'name' },
	{ width: '40%', align: 'left', header: 'Email', headerAlign: 'left', field: 'email' },
	{ width: '20%', align: 'left', header: 'Role', headerAlign: 'left', field: 'role' }
]
const editorPackage = {
	id: null,
	email: null,
	name: null,
	password: null,
	role: null
}

let users, userMode
let modalOverlay, modalDialog, modalClose, modalCancel, modalSave, modalBody
let isDirty = false

const getValue = (field) => {
	const value = document.getElementById(field).value
	return value === '' ? null : value
}

function addUser(event) {
	event.preventDefault()
	console.log('Add user')
	editorPackage.id = null
	editorPackage.email = null
	editorPackage.name = null
	editorPackage.password = null
	editorPackage.role = null
	userMode = 'add'
	console.log(editorPackage)
	showModal()
}

function editUser(id) {
	event.preventDefault()
	console.log(`Edit user ${id}`)
	const user = users.find(lookup => lookup.id === id)
	editorPackage.id = id
	editorPackage.email = user.email
	editorPackage.name = user.name
	editorPackage.password = null
	editorPackage.role = user.role
	userMode = 'edit'
	console.log(editorPackage)
	showModal()
}

function drawCell(item, col) {
	const td = document.createElement('td')
	td.style.width = col.width
	td.style.textAlign = col.align
	td.innerHTML = item[col.field]
	return td
}

function drawTable() {
	tableHolder.innerHTML = ''
	const table = document.createElement('table')
	const colGroup = document.createElement('colgroup')
	for (const col of cols) {
		const column = document.createElement('col')
		column.style.width = col.width
		colGroup.appendChild(column)
	}
	table.appendChild(colGroup)
	const thead = document.createElement('thead')
	const theadTr = document.createElement('tr')
	for (const col of cols) {
		const th = document.createElement('th')
		th.style.width = col.with
		th.style.textAlign = col.headerAlign
		th.innerHTML = col.header
		theadTr.appendChild(th)
	}
	thead.appendChild(theadTr)
	table.appendChild(thead)
	const tbody = document.createElement('tbody')
	for (const item of users) {
		const tr = document.createElement('tr')
		for (const col of cols) {
			tr.appendChild(drawCell(item, col))
		}
		tr.addEventListener('click', () => {
			editUser(item.id)
		})
		tbody.appendChild(tr)
	}
	table.appendChild(tbody)
	tableHolder.appendChild(table)
}

async function getUsers() {
	users = await fetch('/api/admin/users').then(r => r.json())
	console.log(users)
	drawTable()
}

function checkDirty() {
	const dirtyReasons = []
	if (userMode === 'add') {
		isDirty = true
	} else {
		isDirty = false

		const fields = []

		fields.push({ id: 'user-name', field: 'name' })
		fields.push({ id: 'user-role', field: 'role' })

		for (const field of fields) {
			if (getValue(field.id) !== editorPackage[field.field]) {
				dirtyReasons.push({ field: field.id, old: editorPackage[field.field], new: getValue(field.id) })
				isDirty = true
			}
		}

		if (getValue('user-password1') !== null && getValue('user-password2') !== null) {
			isDirty = true
		}
	}

	console.log({ isDirty, dirtyReasons })
	if (isDirty) {
		modalSave.removeAttribute('disabled')
	} else {
		modalSave.setAttribute('disabled', '')
	}

	// console.log({ yearSame, legacySame, sameLength, rowsSame, isDirty, profileModalSave })
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

function handleModalClose() {
	modalOverlay.classList.remove('is-visible')
	modalDialog.classList.remove('is-visible')

	modalOverlay.addEventListener(
		'transitionend',
		() => {
			modalOverlay.classList.add('hidden')
			if (modalCancel) modalCancel.removeEventListener('click', handleModalClose)
			if (modalSave) modalSave.removeEventListener('click', handleModalSave)
			modalClose.removeEventListener('click', handleModalClose)
			modalOverlay.removeEventListener('click', handleOverlayClick)
			document.removeEventListener('keydown', handleOverlayKeydown)
			modalDialog.remove()
			modalOverlay.remove()
			modalDialog = null
			modalOverlay = null
			document.body.classList.remove('modal-open')
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
	if (getValue('user-password1') !== getValue('user-password2')) {
		document.getElementById('user-password2').setCustomValidity('Passwords must match')
	} else {
		document.getElementById('user-password2').setCustomValidity('')
	}
	const valid = modalBody.reportValidity()
	console.log({ valid })
	if (!valid) return

	const updatePackage = structuredClone(editorPackage)
	const fields = []
	let endpoint

	fields.push({ id: 'user-name', field: 'name' })
	fields.push({ id: 'user-email', field: 'email' })
	fields.push({ id: 'user-password1', field: 'password' })
	fields.push({ id: 'user-role', field: 'role' })

	for (const field of fields) {
		updatePackage[field.field] = getValue(field.id)
	}

	console.log({ editorPackage, updatePackage })

	if (userMode === 'add') {
		const response = await fetch('/api/admin/users/validate-email', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(updatePackage)
		}).then(r => r.json())

		const input = document.getElementById('user-email')
		input.setCustomValidity('') // clear previous errors

		if (!response.ok) {
			input.setCustomValidity('Email address already taken')
			input.reportValidity()
			return
		}
		endpoint = '/api/admin/users/add'
	} else {
		endpoint = '/api/admin/users/update'
	}
	const response = await fetch(endpoint, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(updatePackage)
	}).then(r => r.json())
	console.log(response)
	if (response.ok) {
		handleModalClose()
		await getUsers()
	}
}

function createLabel(labelClass, labelText, labelInput) {
	const label = document.createElement('label')
	if (labelClass) label.className = labelClass
	const span = document.createElement('span')
	span.innerHTML = labelText
	label.appendChild(span)
	if (labelInput.type === 'select') {
		const select = document.createElement('select')
		select.id = labelInput.inputId
		if (labelInput.disabled) select.setAttribute('disabled', '')
		for (const opt of labelInput.options) {
			const option = document.createElement('option')
			option.value = opt.value
			option.innerHTML = opt.text
			if (labelInput.value && labelInput.value === opt.value) option.setAttribute('selected', '')
			select.appendChild(option)
		}
		select.addEventListener('change', event => {
			event.target.setCustomValidity('')
			checkDirty()
		})
		label.appendChild(select)
	} else {
		const input = document.createElement('input')
		input.id = labelInput.inputId
		input.type = labelInput.type
		input.setAttribute('placeholder', labelInput.placeholder)
		if (labelInput.pattern) input.setAttribute('pattern', labelInput.pattern)
		if (labelInput.required) input.setAttribute('required', '')
		if (labelInput.disabled) input.setAttribute('disabled', '')
		if (labelInput.autofocus) input.setAttribute('autofocus', '')
		if (labelInput.value) input.setAttribute('value', labelInput.value)
		input.addEventListener('input', event => {
			event.target.setCustomValidity('')
			checkDirty()
		})
		label.appendChild(input)
	}
	return label
}

function showModal() {
	let span

	createModalOverlay()

	modalDialog = document.createElement('div')
	modalDialog.id = 'modal'
	modalDialog.className = 'modal modal-editor'
	const modalDialogHeader = document.createElement('div')
	modalDialogHeader.className = 'modal-header'
	const modalDialogHeading = document.createElement('h2')
	modalDialogHeading.innerHTML = userMode === 'edit' ? 'Edit User' : 'New User'
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

	modalBody.appendChild(createLabel('modal-label', 'Name', {
		inputId: 'user-name',
		type: 'text',
		placeholder: 'Display name',
		value: editorPackage.name,
		required: true,
		autofocus: true
	}))
	modalBody.appendChild(createLabel('modal-label', 'Email', {
		inputId: 'user-email',
		type: 'text',
		placeholder: 'you@domain.com',
		disabled: userMode === 'edit',
		value: editorPackage.email,
		required: userMode === 'add'
	}))
	modalBody.appendChild(createLabel('modal-label', userMode === 'edit' ? 'New Password' : 'Password', {
		inputId: 'user-password1',
		type: 'password',
		placeholder: userMode === 'edit' ? 'New Password' : 'Password',
		value: '',
		required: userMode === 'add'
	}))
	modalBody.appendChild(createLabel('modal-label', userMode === 'edit' ? 'Repeat New Password' : 'Repeat Password', {
		inputId: 'user-password2',
		type: 'password',
		placeholder: userMode === 'edit' ? 'Repeat New Password' : 'Password',
		value: '',
		required: userMode === 'add'
	}))
	modalBody.appendChild(createLabel('modal-label', 'Role', {
		inputId: 'user-role',
		type: 'select',
		value: editorPackage.role,
		options: [
			{ value: 'user', text: 'User' },
			{ value: 'editor', text: 'Editor' },
			{ value: 'admin', text: 'Admin' }
		],
		required: userMode === 'add'
	}))

	modalDialog.appendChild(modalBody)

	const modalDialogActions = document.createElement('div')
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
}

function setupInterface() {
	const ul = document.createElement('ul')
	ul.className = 'button-list'
	const li = document.createElement('li')
	const a = document.createElement('a')
	a.href = '/users/add'
	const img = document.createElement('img')
	img.src = '/img/user-add.svg'
	a.appendChild(img)
	const span = document.createElement('span')
	span.innerHTML = 'Add User'
	a.appendChild(span)
	a.addEventListener('click', addUser)
	li.appendChild(a)
	ul.appendChild(li)
	main.appendChild(ul)
}

document.addEventListener('DOMContentLoaded', () => {
	console.log('DOM loaded: Person')
	getUsers()
	setupInterface()
})
