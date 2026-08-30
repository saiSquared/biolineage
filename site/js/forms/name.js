'use strict'

const nameFields = []

const nameGroups = []

const nameValidators = {}

export default async function getNameForm() {
	console.log('Getting entity name parts...')
	const entityNameParts = await fetch('/data/entity-name-parts.json').then(r => r.json())
	nameFields.push({
		group: 'name',
		label: 'Name Type',
		name: 'nameType',
		id: 'name-type',
		type: 'text',
		placeholder: 'Type',
		required: true,
		autofocus: true,
		width: '100%',
		tip: 'Identifies which version of this person’s name this record represents (birth, married, adopted, professional, religious, imported, etc.). Each person may have multiple names, but only one of each type.'
	})
	for (const entityNamePart of entityNameParts) {
		nameFields.push({
			group: 'name',
			label: entityNamePart.label,
			labelHidden: !entityNamePart.surface,
			name: entityNamePart.code,
			id: entityNamePart.slug,
			type: 'text',
			placeholder: entityNamePart.placeholder,
			required: entityNamePart.required,
			labelData: !entityNamePart.surface ? [{ attribute: 'extended', value: 'true' }] : null,
			width: entityNamePart.width,
			tip: entityNamePart.description
		})
	}
	nameFields.push({
		group: 'name',
		label: 'Description',
		name: 'description',
		id: 'description',
		type: 'textarea',
		placeholder: 'Additional information',
		width: '100%',
		tip: 'Optional notes or context about this name record, such as spelling variations, transcription notes, or cultural naming details.'
	})
	nameFields.push({
		group: 'name',
		label: 'Show Extended Fields',
		name: 'extended',
		id: 'extended',
		type: 'toggle',
		width: '100%',
		ignore: true,
		value: false,
		tip: 'Switch between primary and all name fields.',
		handlers: [
			{
				event: 'change',
				handler() {
					const show = document.getElementById('extended').checked
					const extended = document.querySelectorAll('[data-extended="true"')
					for (const ele of extended) {
						ele.style.display = show ? 'flex' : 'none'
					}
				}
			}
		]
	})
	return { nameFields, nameGroups, nameValidators }
}
