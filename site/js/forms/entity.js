'use strict'

import getNameForm from '/js/forms/name.js'

const entityFields = []

const entityGroups = [
	{ header: 'Name', slug: 'name' },
	{ header: 'Sex', slug: 'sex' },
	{ header: 'Birth', slug: 'birth' },
	{ header: 'Death', slug: 'death' }
]

const entityValidators = {
	checkBirthDayAndMonth(getValue) {
		if (getValue('birth-day') && !getValue('birth-month')) {
			document.getElementById('birth-month').setCustomValidity('Month required if day is set')
		}
	},
	checkBirthMonthAndYear(getValue) {
		if (getValue('birth-month') && !getValue('birth-year')) {
			document.getElementById('birth-year').setCustomValidity('Year required if month is set')
		}
	},
	checkDeathDayAndMonth(getValue) {
		if (getValue('death-day') && !getValue('death-month')) {
			document.getElementById('death-month').setCustomValidity('Month required if day is set')
		}
	},
	checkDeathMonthAndYear(getValue) {
		if (getValue('death-month') && !getValue('death-year')) {
			document.getElementById('death-year').setCustomValidity('Year required if month is set')
		}
	}
}

export default async function getAddEntityForm() {
	entityFields.push({
		group: 'name',
		label: 'Tree ID',
		name: 'treeId',
		id: 'tree-id',
		type: 'text',
		labelHidden: true,
		value: dataPackage.treeId
	})
	const { nameFields } = await getNameForm()
	for (const nameField of nameFields) {
		entityFields.push(nameField)
	}
	entityFields.push({
		group: 'sex',
		label: 'Sex',
		name: 'sex',
		id: 'sex',
		type: 'select',
		options: [
			{ value: '', text: 'Choose' },
			{ value: 'Male', text: 'Male' },
			{ value: 'Female', text: 'Female' },
			{ value: 'Intersex', text: 'Intersex' },
			{ value: 'Unknown', text: 'Unknown' }
		],
		tip: 'Biological sex as recorded in historical documents. Leave blank if unknown or not stated in available sources.'
	})
	entityFields.push({
		group: 'birth',
		label: 'Year',
		name: 'birthYear',
		id: 'birth-year',
		type: 'text',
		placeholder: 'yyyy',
		pattern: '^-?[0-9]+$',
		tip: 'Year of birth. Partial dates are allowed; enter the year even if the month or day is unknown.'
	})
	entityFields.push({
		group: 'birth',
		label: 'Month',
		name: 'birthMonth',
		id: 'birth-month',
		type: 'text',
		placeholder: 'mm',
		pattern: '^\\d{1,2}$',
		tip: 'Month of birth (1–12). Leave blank if the exact month is not known.'
	})
	entityFields.push({
		group: 'birth',
		label: 'Day',
		name: 'birthDay',
		id: 'birth-day',
		type: 'text',
		placeholder: 'dd',
		pattern: '^\\d{1,2}$',
		tip: 'Day of birth (1–31). Leave blank if the exact day is not known.'
	})
	entityFields.push({
		group: 'death',
		label: 'Year',
		name: 'deathYear',
		id: 'death-year',
		type: 'text',
		placeholder: 'yyyy',
		pattern: '^-?[0-9]+$',
		tip: 'Year of death. Partial dates are allowed; enter the year even if the month or day is unknown.'
	})
	entityFields.push({
		group: 'death',
		label: 'Month',
		name: 'deathMonth',
		id: 'death-month',
		type: 'text',
		placeholder: 'mm',
		pattern: '^\\d{1,2}$',
		tip: 'Month of death (1–12). Leave blank if the exact month is not known.'
	})
	entityFields.push({
		group: 'death',
		label: 'Day',
		name: 'deathDay',
		id: 'death-day',
		type: 'text',
		placeholder: 'dd',
		pattern: '^\\d{1,2}$',
		tip: 'Day of death (1–31). Leave blank if the exact day is not known.'
	})

	return { entityFields, entityGroups, entityValidators }
}
