'use strict'

import modalForm from '/js/modal-form.js'

const addTree = document.getElementById('add-tree')
const fields = [
	{
		group: 'tree',
		label: 'Tree Name',
		name: 'name',
		id: 'tree-name',
		type: 'text',
		placeholder: 'Name',
		required: true,
		autofocus: true,
		width: '100%',
		tip: 'A unique name for your tree, will be checked against existing trees before creation.'
	},
	{
		group: 'tree',
		label: 'Entity Type',
		name: 'entityTypeId',
		id: 'tree-type',
		type: 'select',
		options: [],
		tip: 'The type of entities you want to track in this tree.'
	}
]

let entityTypes

async function createTree(event) {
	event.preventDefault()
	const modal = modalForm({ mode: 'add', endpoint: '/api/tree/add', header: 'Create Tree' }, fields)
	const id = await modal.show()
	if (id) {
		console.log(`New id = ${id}`)
		location.href = `/trees/${id}`
	}
}

async function startup() {
	entityTypes = await fetch('/data/entity-types.json').then(r => r.json())
	console.log(entityTypes)
	for (const entityType of entityTypes) {
		fields[1].options.push({ value: entityType.id, text: entityType.label })
	}
}

addTree.addEventListener('click', createTree)

document.addEventListener('DOMContentLoaded', () => {
	console.log('DOM loaded: Home')
	startup()
})
