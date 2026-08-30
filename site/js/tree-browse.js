'use strict'

import getAddEntityForm from './forms/entity.js'
import modalForm from '/js/modal-form.js'

const addEntity = document.getElementById('add-entity')

let entityFields, entityGroups, entityValidators

async function setup() {
	const entityForm = await getAddEntityForm()
	entityFields = entityForm.entityFields
	entityGroups = entityForm.entityGroups
	entityValidators = entityForm.entityValidators
}

addEntity.addEventListener('click', async (event) => {
	event.preventDefault()
	const modal = modalForm({ mode: 'add', endpoint: '/api/entity/add', header: `Add ${dataPackage.treeLabel}` }, entityFields, entityGroups, entityValidators)
	const id = await modal.show()
	if (id) {
		console.log(`New id = ${id}`)
		window.location.href = `/trees/${dataPackage.treeSlug}/entities/${id}`
	}
})

document.addEventListener('DOMContentLoaded', () => {
	console.log('DOM loaded: Tree Browse')
	console.log(dataPackage)
	setup()
})
