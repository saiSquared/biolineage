/// <reference path="../dhtmlx-diagram/diagram.d.ts" />
'use strict'

// TODO revisit pre-alpha naming documentation as noted in Obsidian > Biolineage > Names

import { smartify } from '/js/clubside-utils.js'
import modalForm from '/js/modal-form.js'

/**
 * @typedef {Object} BiolineageTimelineFact
 * @property {String} [factId] - fact id for non-derived facts
 * @property {String} code - fact code or fact description for derived facts
 * @property {String} epoch - fact date epoch
 * @property {Number} year - fact date year
 * @property {Number|null} month - fact date month
 * @property {Number|null} day - fact date month
 * @property {Number|null} hour - fact date month
 * @property {Number|null} minute - fact date month
 * @property {Number|null} second - fact date month
 * @property {String|null} placeId - UUID of the fact's place
 * @property {String|null} placeType - type of place
 * @property {String|null} placeName - name of place
 * @property {String|null} placeLatitude - latitude of place
 * @property {String|null} placeLongitude - longitude of place1
 * @property {String|null} sovereignEntity - UUID of sovereign_entity
 * @property {String|null} sovereignEntityName - name of sovereign entity
 * @property {String|null} subdivision - UUID of subdivision
 * @property {String|null} subdivisionName - name of subdivision
 * @property {String|null} administrativeDivision - UUID of administrative_division
 * @property {String|null} administrativeDivisionName - name of administrative division
 * @property {String|null} administrativeDivisionLatitude - latitude of administrative_division
 * @property {String|null} administrativeDivisionLongitude - longitude of administrative_division
 * @property {String|null} municipality - UUID of municipality
 * @property {String|null} municipalityName - name of municipality
 * @property {String|null} municipalityLatitude - latitude of municipality
 * @property {String|null} municipalityLongitude - longitude of municipality
 * @property {String} [entityId] - UUID of related entity
 * @property {String} [entityName] - name of related entity
 */

const main = document.querySelector('main')
const factMarkers = new Map()

let entity, map, entityNameParts
/** @type {BiolineageTimelineFact[]} */
let facts

/**
 * Create a button for the user to add additional data to an entity
 * @param {String} id - button id
 * @param {String} icon - image for button
 * @param {String} text - text for button
 * @param {String|null} classes - optional class(es) for buttom
 * @param {String} dataType - data type button will add
 * @returns {HTMLElement}
 */
const cardButton = (id, icon, text, classes, dataType) => {
	const div = document.createElement('div')
	if (classes) div.className = classes
	const button = document.createElement('button')
	button.id = id
	button.className = 'button'
	button.type = 'button'
	button.dataset.type = dataType
	button.dataset.action = 'add'
	const img = document.createElement('img')
	img.src = icon
	button.appendChild(img)
	const span = document.createElement('span')
	span.innerHTML = text
	button.appendChild(span)
	button.addEventListener('click', handleEntityEditor)
	div.appendChild(button)
	return div
}

/**
 * Create a link to another entity
 * @param {Object} data - source data
 * @param {String|Object} def - formatting rules
 * @param {String|null} classes - iptional class(es) for link
 * @returns {HTMLElement}
 */
const cardEntity = (data, def, classes) => {
	const a = document.createElement('a')
	if (classes) a.className = classes
	a.href = `/trees/${dataPackage.treeSlug}/entities/${data.id}`
	const img = document.createElement('img')
	img.src = getIcon(data.sex)
	a.appendChild(img)
	const div = document.createElement('div')
	div.appendChild(cardName(smartify(data.fullName)))
	div.appendChild(cardLifespan(data))
	div.appendChild(cardRelationship(typeof def === 'object' ? def : data[def], data.sex))
	a.appendChild(div)
	return a
}

/**
 * Display an entity's lifespan
 * @param {Object} data - source data
 * @returns {HTMLElement}
 */
const cardLifespan = (data) => {
	const div = document.createElement('div')
	if (!data.birthYear && !data.deathYear) {
		div.innerHTML = '<em>Unknown</em>'
		return div
	}
	let lifespan = ''
	if (data.birthYear) {
		lifespan += data.birthYear
	} else {
		lifespan += '<em>Unknown</em>'
	}
	lifespan += '-'
	if (data.deathYear) {
		lifespan += data.deathYear
	} else {
		lifespan += '<em>Living</em>'
	}
	div.innerHTML = lifespan
	return div
}

/**
 * Create a header for a card
 * @param {String} name - name to show
 * @returns {HTMLElement}
 */
const cardName = (name) => {
	const h4 = document.createElement('h4')
	h4.innerHTML = name
	return h4
}

/**
 * Format an entity's sex
 * @param {Object} def - rules for formatting sex
 * @param {*} sex - entity's sex
 * @returns {HTMLElement}
 */
const cardRelationship = (def, sex) => {
	const div = document.createElement('div')
	switch (sex) {
		case 'Male':
			div.innerHTML = def.male
			break
		case 'Female':
			div.innerHTML = def.female
			break
		default:
			div.innerHTML = def.other
	}
	return div
}

const chartGender = (data) => {
	switch (data.sex) {
		case 'Male':
			return 'M'
		case 'Female':
			return 'F'
		default:
			return ''
	}
}

const chartLifespan = (data) => {
	if (!data.birthYear && !data.deathYear) {
		return 'Unknown'
	}
	let lifespan = ''
	if (data.birthYear) {
		lifespan += data.birthYear
	} else {
		lifespan += ' ? '
	}
	lifespan += '-'
	if (data.deathYear) {
		lifespan += data.deathYear
	} else {
		lifespan += 'Living'
	}
	return lifespan
}
/**
 * Add a fact to the timeline
 * @param {Object} fact - data about the fact
 * @param {Object} birth - data about an entity's birth
 * @returns {HTMLElement}
 */
const drawFact = (fact, birth) => {
	const section = document.createElement('section')
	const div = document.createElement('div')
	const a = document.createElement('a')
	const lat = fact.latitude || fact.municipalityLatitude || fact.administrativeDivisionLatitude
	const lng = fact.longitude || fact.municipalityLongitude || fact.administrativeDivisionLongitude
	if (lat && lng) {
		const placeId = fact.placeId

		if (!factMarkers.has(placeId)) {
			factMarkers.set(placeId, {
				name: timelineLocation(fact),
				lat,
				lng
			})
		}

		a.dataset.marker = placeId
	}
	a.href = `/trees/${dataPackage.treeSlug}/entities/${dataPackage.entityId}/facts/${fact.factId}`
	a.dataset.fact = fact.factId
	const factName = document.createElement('div')
	factName.innerHTML = `<span style="font-weight: 500;">${fact.code}</span> (Age ${yearDiff(fact, birth)})`
	factName.style.marginBottom = '0.25rem'
	a.appendChild(factName)
	if (fact.entityName) {
		const factEntity = document.createElement('div')
		factEntity.innerHTML = `<strong>${fact.entityName}</strong>`
		a.appendChild(factEntity)
	}
	const factDate = document.createElement('div')
	factDate.innerHTML = formatGenealogyDate(fact.year, fact.month, fact.day)
	a.appendChild(factDate)
	showLocation(a, fact)
	a.addEventListener('click', handleTimelineFact)
	div.appendChild(a)
	section.appendChild(div)
	return section
}

/**
 * Format a standard fact date
 * @param {Number} year - date year
 * @param {Number|null} month - date month
 * @param {Number|null} day - date day
 * @returns {String}
 */
const formatGenealogyDate = (year, month, day) => {
	if (!month && !day) return year

	let d

	if (month && day) {
		d = new Date(year, month - 1, day)
	} else {
		d = new Date(year, month - 1, 1)
	}
	const formattedDay = d.getDate()
	const formattedMonth = d.toLocaleString('default', { month: 'long' })
	const formattedYear = d.getFullYear()

	return `${formattedDay} ${formattedMonth} ${formattedYear}`
}

/**
 * Return the appropriate icon based on entity type and sex
 * @param {String} sex - sex of the entity
 * @returns {String}
 */
const getIcon = (sex) => {
	switch (dataPackage.treeType) {
		case 'human':
			switch (sex) {
				case 'Male':
					return '/img/man.svg'
				case 'Female':
					return '/img/woman.svg'
				default:
					return '/img/person.svg'
			}
		case 'equine':
			return '/img/horse.svg'
	}
}

/**
 * Convert a fact date into a JavaScript Date
 * @param {Object} data - entity data
 * @returns {Date}
 */
const massageDate = (data) => {
	let year = data.year

	if (data.epoch === 'BC') {
		year = -(year - 1) // convert to astronomical year
	}

	return new Date(
		year,
		data.month ? data.month - 1 : 0,
		data.day || 1
	)
}

/**
 * Adds hierarchical place information (municipality → admin division → subdivision → sovereign entity) in genealogical order.
 * @param {HTMLElement} ele - the element to append the location details to
 * @param {Object} data - entity data
 */
const showLocation = (ele, data) => {
	const fields = ['sovereignEntity', 'sovereignEntityName', 'subdivision', 'subdivisionName', 'administrativeDivision', 'administrativeDivisionName', 'municipality', 'municipalityName']
	let hasLocation = false
	for (const field of fields) {
		if (data[field]) {
			hasLocation = true
			break
		}
	}
	if (hasLocation) {
		const parts = []
		if (data.address) parts.push(data.address)
		if (data.municipality || data.municipalityName) parts.push(data.municipality || data.municipalityName)
		if (data.administrativeDivision || data.administrativeDivisionName) parts.push(data.administrativeDivision || data.administrativeDivisionName)
		if (data.subdivision || data.subdivisionName) parts.push(data.subdivision || data.subdivisionName)
		if (data.sovereignEntity || data.sovereignEntityName) parts.push(data.sovereignEntity || data.sovereignEntityName)
		const div = document.createElement('div')
		div.innerHTML = parts.join(', ')
		ele.appendChild(div)
	}
}

const timelineLocation = (data) => {
	const fields = ['sovereignEntity', 'sovereignEntityName', 'subdivision', 'subdivisionName', 'administrativeDivision', 'administrativeDivisionName', 'municipality', 'municipalityName']
	let hasLocation = false
	for (const field of fields) {
		if (data[field]) {
			hasLocation = true
			break
		}
	}
	if (hasLocation) {
		const parts = []
		if (data.address) parts.push(data.address)
		if (data.municipality || data.municipalityName) parts.push(data.municipality || data.municipalityName)
		if (data.administrativeDivision || data.administrativeDivisionName) parts.push(data.administrativeDivision || data.administrativeDivisionName)
		if (data.subdivision || data.subdivisionName) parts.push(data.subdivision || data.subdivisionName)
		if (data.sovereignEntity || data.sovereignEntityName) parts.push(data.sovereignEntity || data.sovereignEntityName)
		return parts.join(', ')
	} else {
		return null
	}
}

/**
 * Calculate the difference between two dates in years
 * @param {Object} startData - fact start date
 * @param {Object} endData - fact end date
 * @returns {Number}
 */
const yearDiff = (startData, endData) => {
	const startDate = massageDate(startData)
	const endDate = massageDate(endData)
	let years = endDate.getFullYear() - startDate.getFullYear()
	const monthDiff = endDate.getMonth() - startDate.getMonth()
	const dayDiff = endDate.getDate() - startDate.getDate()
	if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
		years--
	}
	return Math.abs(years)
}

/**
 * Draw the entity
 */
function drawEntity() {
	let h2, h3, cardItem, section, header, div, button, img
	const icon = getIcon(entity.sex)
	const birth = entity.facts.find(lookup => lookup.code === 'Birth')
	const death = entity.facts.find(lookup => lookup.code === 'Death')

	const existingProfile = document.querySelector('.entity-profile')
	if (existingProfile) existingProfile.remove()

	const profile = document.createElement('div')
	profile.className = 'entity-profile'

	// header
	const profileHeader = document.createElement('section')
	profileHeader.className = 'entity-profile-header'
	const profileHeaderImage = document.createElement('div')
	img = document.createElement('img')
	img.src = icon
	profileHeaderImage.appendChild(img)
	profileHeader.appendChild(profileHeaderImage)
	const profileHeaderTitle = document.createElement('div')
	const h1 = document.createElement('h1')
	h1.innerHTML = smartify(entity.fullName)
	profileHeaderTitle.appendChild(h1)
	const lifespan = document.createElement('div')
	if (!birth && !death) {
		lifespan.innerHTML = '<em>Unknown</em>'
	} else if (birth && death) {
		lifespan.innerHTML = `${formatGenealogyDate(birth.year, birth.month, birth.day)} - ${formatGenealogyDate(death.year, death.month, death.day)}`
	} else if (!birth) {
		lifespan.innerHTML = `<em>Unknown</em> - ${formatGenealogyDate(death.year, death.month, death.day)}`
	} else {
		lifespan.innerHTML = `${formatGenealogyDate(birth.year, birth.month, birth.day)} - Living`
	}
	profileHeaderTitle.appendChild(lifespan)
	profileHeader.appendChild(profileHeaderTitle)
	profile.appendChild(profileHeader)

	// vitals
	const vitals = document.createElement('section')
	vitals.className = 'entity-profile-card'
	h2 = document.createElement('h2')
	h2.innerHTML = 'Vitals'
	vitals.appendChild(h2)
	cardItem = document.createElement('article')
	cardItem.className = 'entity-profile-card-item'
	section = document.createElement('section')
	header = document.createElement('header')
	header.innerHTML = '<strong>Sex</strong> (No Sources)'
	section.appendChild(header)
	div = document.createElement('div')
	div.innerHTML = entity.sex
	section.appendChild(div)
	cardItem.appendChild(section)
	button = document.createElement('button')
	button.id = 'vitals-sex'
	button.dataset.type = 'sex'
	button.dataset.action = 'edit'
	img = document.createElement('img')
	img.src = '/img/pencil.svg'
	button.appendChild(img)
	button.addEventListener('click', handleEntityEditor)
	cardItem.appendChild(button)
	vitals.appendChild(cardItem)
	cardItem = document.createElement('article')
	cardItem.className = 'entity-profile-card-item'
	section = document.createElement('section')
	header = document.createElement('header')
	if (birth) {
		header.innerHTML = '<strong>Birth</strong> (No Sources)'
		section.appendChild(header)
		div = document.createElement('div')
		div.innerHTML = formatGenealogyDate(birth.year, birth.month, birth.day)
		section.appendChild(div)
		showLocation(section, birth)
	} else {
		header.innerHTML = '<strong>Birth</strong>'
		section.appendChild(header)
		div = document.createElement('div')
		div.innerHTML = '<em>Unknown</em>'
		section.appendChild(div)
	}
	cardItem.appendChild(section)
	button = document.createElement('button')
	button.id = 'vitals-birth'
	button.dataset.type = 'fact'
	button.dataset.action = birth ? 'edit' : 'add'
	button.dataset.id = birth ? birth.factId : ''
	img = document.createElement('img')
	img.src = '/img/pencil.svg'
	button.appendChild(img)
	button.addEventListener('click', handleEntityEditor)
	cardItem.appendChild(button)
	vitals.appendChild(cardItem)
	cardItem = document.createElement('article')
	cardItem.className = 'entity-profile-card-item'
	section = document.createElement('section')
	header = document.createElement('header')
	if (death) {
		header.innerHTML = '<strong>Death</strong> (No Sources)'
		section.appendChild(header)
		div = document.createElement('div')
		div.innerHTML = formatGenealogyDate(death.year, death.month, death.day)
		section.appendChild(div)
		showLocation(section, death)
	} else {
		header.innerHTML = '<strong>Death</strong>'
		section.appendChild(header)
		div = document.createElement('div')
		div.innerHTML = '<em>Living</em>'
		section.appendChild(div)
	}
	cardItem.appendChild(section)
	button = document.createElement('button')
	button.id = 'vitals-birth'
	button.dataset.type = 'fact'
	button.dataset.action = death ? 'edit' : 'add'
	button.dataset.id = death ? death.factId : ''
	img = document.createElement('img')
	img.src = '/img/pencil.svg'
	button.appendChild(img)
	button.addEventListener('click', handleEntityEditor)
	cardItem.appendChild(button)
	vitals.appendChild(cardItem)
	profile.appendChild(vitals)

	// names
	const names = document.createElement('section')
	names.className = 'entity-profile-card'
	h2 = document.createElement('h2')
	h2.innerHTML = 'Names'
	names.appendChild(h2)
	for (const entityName of entity.names) {
		cardItem = document.createElement('article')
		cardItem.className = 'entity-profile-card-item'
		section = document.createElement('section')
		header = document.createElement('header')
		header.innerHTML = `<strong>${entityName.nameType}</strong> (No Sources)${entityName.id === entity.canonicalNameId ? ' <span style="font-weight: 500">[Canonical]</span>' : ''}`
		section.appendChild(header)
		div = document.createElement('div')
		div.className = 'entity-proifile-name-parts'
		for (const part of entityNameParts) {
			if (entityName.nameParts[part.code]) {
				const span = document.createElement('span')
				span.innerHTML = `<strong>${part.label}</strong>: ${entityName.nameParts[part.code]}`
				div.appendChild(span)
			}
		}
		section.appendChild(div)
		cardItem.appendChild(section)
		button = document.createElement('button')
		button.dataset.type = 'name'
		button.dataset.action = 'edit'
		button.dataset.id = entityName.id
		img = document.createElement('img')
		img.src = '/img/pencil.svg'
		button.appendChild(img)
		button.addEventListener('click', handleEntityEditor)
		cardItem.appendChild(button)
		names.appendChild(cardItem)
	}
	names.appendChild(cardButton('add-entity-name', '/img/plus.svg', 'Add Name', null, 'name'))
	profile.appendChild(names)

	// facts
	const entityFacts = document.createElement('section')
	entityFacts.className = 'entity-profile-card'
	h2 = document.createElement('h2')
	h2.innerHTML = 'Facts'
	entityFacts.appendChild(h2)
	const filteredFacts = entity.facts.filter(data => !['Birth', 'Death'].includes(data.code))
	for (const fact of filteredFacts) {
		console.log(fact)
		cardItem = document.createElement('article')
		cardItem.className = 'entity-profile-card-item'
		section = document.createElement('section')
		header = document.createElement('header')
		header.innerHTML = `<strong>${fact.code}</strong> (No Sources)`
		section.appendChild(header)
		div = document.createElement('div')
		div.innerHTML = formatGenealogyDate(fact.year, fact.month, fact.day)
		section.appendChild(div)
		showLocation(section, fact)
		cardItem.appendChild(section)
		button = document.createElement('button')
		button.dataset.type = 'fact'
		button.dataset.action = 'edit'
		button.dataset.id = fact.factId
		img = document.createElement('img')
		img.src = '/img/pencil.svg'
		button.appendChild(img)
		button.addEventListener('click', handleEntityEditor)
		cardItem.appendChild(button)
		entityFacts.appendChild(cardItem)
	}
	entityFacts.appendChild(cardButton('add-entity-fact', '/img/plus.svg', 'Add Fact', null, 'fact'))
	profile.appendChild(entityFacts)

	// family members
	const familyMembers = document.createElement('section')
	familyMembers.className = 'entity-profile-card'
	h2 = document.createElement('h2')
	h2.innerHTML = 'Family Members'
	familyMembers.appendChild(h2)
	if (entity.parents.length > 0) {
		h3 = document.createElement('h3')
		h3.innerHTML = 'Parents'
		familyMembers.appendChild(h3)
		cardItem = document.createElement('article')
		cardItem.className = 'entity-profile-inner-card'
		section = document.createElement('section')
		for (const parent of entity.parents) {
			section.appendChild(cardEntity(parent, 'leftOutput'))
		}
		cardItem.appendChild(section)
		familyMembers.appendChild(cardItem)
	}
	if (entity.siblings.length > 0) {
		const fullSiblings = entity.siblings.find(lookup => lookup.full === true)
		if (fullSiblings) {
			h3 = document.createElement('h3')
			h3.innerHTML = 'Siblings'
			familyMembers.appendChild(h3)
			cardItem = document.createElement('article')
			cardItem.className = 'entity-profile-inner-card'
			section = document.createElement('section')
			for (const child of fullSiblings.children) {
				section.appendChild(cardEntity(child, { male: 'Brother', female: 'Sister', other: 'Sibling' }))
			}
			cardItem.appendChild(section)
			familyMembers.appendChild(cardItem)
		}
		const halfSiblings = entity.siblings.filter(lookup => lookup.full === false)
		if (halfSiblings.length > 0) {
			h3 = document.createElement('h3')
			h3.innerHTML = 'Half Siblings'
			familyMembers.appendChild(h3)
			for (const parentGroup of halfSiblings) {
				cardItem = document.createElement('article')
				cardItem.className = 'entity-profile-inner-card'
				section = document.createElement('section')
				for (const parent of parentGroup.parentDetails) {
					section.appendChild(cardEntity(parent, 'leftOutput'))
				}
				cardItem.appendChild(section)
				section = document.createElement('section')
				section.className = 'children'
				for (const child of parentGroup.children) {
					section.appendChild(cardEntity(child, { male: 'Half-Brother', female: 'Half-Sister', other: 'Half-Sibling' }))
				}
				cardItem.appendChild(section)
				familyMembers.appendChild(cardItem)
			}
		}
	}
	h3 = document.createElement('h3')
	h3.innerHTML = 'Partners'
	familyMembers.appendChild(h3)
	const partnerChildren = entity.children.filter(data => data.parents.length > 1)
	for (const parentGroup of partnerChildren) {
		cardItem = document.createElement('article')
		cardItem.className = 'entity-profile-inner-card'
		// TODO return left/right output on root entity and each child parent
		section = document.createElement('section')
		for (const parent of parentGroup.parents) {
			section.appendChild(cardEntity(parent, { male: 'Father', female: 'Mother', other: 'Parent' }))
		}
		cardItem.appendChild(section)
		section = document.createElement('section')
		section.className = 'children'
		for (const child of parentGroup.children) {
			section.appendChild(cardEntity(child, 'rightOutput'))
		}
		cardItem.appendChild(section)
		familyMembers.appendChild(cardItem)
		familyMembers.appendChild(cardButton('add-entity-child', '/img/plus.svg', 'Add Child', 'add-child', 'child'))
	}
	familyMembers.appendChild(cardButton('add-entity-partner', '/img/plus.svg', 'Add Partner', null, 'partner'))
	profile.appendChild(familyMembers)
	h3 = document.createElement('h3')
	h3.innerHTML = 'Children'
	familyMembers.appendChild(h3)
	const entityChildren = entity.children.filter(data => data.parents.length === 1)
	for (const parentGroup of entityChildren) {
		cardItem = document.createElement('article')
		cardItem.className = 'entity-profile-inner-card'
		section = document.createElement('section')
		for (const child of parentGroup.children) {
			section.appendChild(cardEntity(child, 'rightOutput'))
		}
		cardItem.appendChild(section)
		familyMembers.appendChild(cardItem)
	}
	familyMembers.appendChild(cardButton('add-entity-child', '/img/plus.svg', 'Add Child', null, 'child'))
	profile.appendChild(familyMembers)

	// other relationships
	const otherRelationships = document.createElement('section')
	otherRelationships.className = 'entity-profile-card'
	h2 = document.createElement('h2')
	h2.innerHTML = 'Other Relationships'
	otherRelationships.appendChild(h2)
	otherRelationships.appendChild(cardButton('add-other-relationship', '/img/plus.svg', 'Add Relationship'))
	profile.appendChild(otherRelationships)

	// timeline
	const timeline = document.createElement('section')
	timeline.className = 'entity-profile-timeline'
	cardItem = document.createElement('article')
	cardItem.className = 'entity-profile-card'
	div = document.createElement('div')
	h2 = document.createElement('h2')
	h2.innerHTML = 'Timeline'
	div.appendChild(h2)
	cardItem.appendChild(div)
	div = document.createElement('div')
	div.className = 'facts'
	const factsHolder = document.createElement('div')
	factsHolder.className = 'facts-holder'
	const factsInner = document.createElement('div')
	let currentYear, currentSection
	for (const fact of facts) {
		if (fact.year !== currentYear) {
			if (currentSection) factsInner.appendChild(currentSection)
			currentYear = fact.year
			currentSection = document.createElement('section')
			currentSection.className = 'facts-year'
			h3 = document.createElement('h3')
			h3.innerHTML = fact.year
			currentSection.appendChild(h3)
		}
		currentSection.appendChild(drawFact(fact, birth))
	}
	if (currentSection) factsInner.appendChild(currentSection)
	factsHolder.appendChild(factsInner)
	div.appendChild(factsHolder)
	cardItem.appendChild(div)
	timeline.appendChild(cardItem)
	div = document.createElement('div')
	div.id = 'map'
	timeline.appendChild(div)
	profile.appendChild(timeline)

	// other relationships
	const familyTree = document.createElement('section')
	familyTree.className = 'entity-profile-card'
	h2 = document.createElement('h2')
	h2.innerHTML = 'Tree'
	familyTree.appendChild(h2)
	div = document.createElement('div')
	div.id = 'family-chart'
	div.className = 'f3'
	familyTree.appendChild(div)
	profile.appendChild(familyTree)

	main.appendChild(profile)

	map = L.map('map', {
		center: new L.LatLng(40, -100),
		zoom: 4
	})
	L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	}).addTo(map)

	for (const [placeId, info] of factMarkers.entries()) {
		const marker = L.marker([info.lat, info.lng]).addTo(map)

		marker.bindPopup(`<strong>${info.name}</strong>`)

		// Replace stored data with the actual marker instance
		factMarkers.set(placeId, marker)
	}

	const nodes = []
	const addNode = (data, context) => {
		const existing = nodes.find(lookup => lookup.id === data.id)
		if (existing) {
			console.log({ message: 'Trying to add duplicate', context, data, nodes })
		} else {
			nodes.push(data)
		}
	}
	let father, mother, otherParent
	// console.log('Adding root')
	const root = {
		id: entity.id,
		data: {
			desc: chartLifespan(entity),
			label: entity.displayName,
			avatar: '',
			gender: chartGender(entity)
		},
		rels: {
			parents: [],
			spouses: [],
			children: []
		},
		main: false
	}
	addNode(root, 'Root')
	// console.log('Adding parents')
	for (const parent of entity.parents) {
		const parentData = {
			id: parent.id,
			data: {
				desc: chartLifespan(parent),
				label: parent.displayName,
				avatar: '',
				gender: chartGender(parent)
			},
			rels: {
				parents: [],
				spouses: [],
				children: [entity.id]
			},
			main: false
		}
		addNode(parentData, 'Parent')
		root.rels.parents.push(parent.id)
		if (parent.sex === 'Male') {
			father = structuredClone(parentData)
		} else {
			mother = structuredClone(parentData)
		}
	}
	// console.log('Updating parents')
	if (mother && father) {
		let node
		node = nodes.find(lookup => lookup.id === father.id)
		// console.log({ message: 'Adding spouse to father', node, mother })
		node.rels.spouses.push(mother.id)
		node.main = true
		// console.log('Father is main', node)
		node = nodes.find(lookup => lookup.id === mother.id)
		// console.log({ mesage: 'Adding spouse to mother', node, father })
		node.rels.spouses.push(father.id)
	} else if (mother) {
		const node = nodes.find(lookup => lookup.id === mother.id)
		node.main = true
		// console.log('Mother is main', node)
	} else if (father) {
		const node = nodes.find(lookup => lookup.id === father.id)
		node.main = true
		// console.log('Father is main', node)
	} else {
		root.main = true
		// console.log('Root is main', root)
	}
	if (entity.siblings.length > 0) {
		const fullSiblings = entity.siblings.find(lookup => lookup.full === true)
		if (fullSiblings) {
			// console.log('Adding Full Siblings')
			for (const child of fullSiblings.children) {
				const sibling = {
					id: child.id,
					data: {
						desc: chartLifespan(child),
						label: child.displayName,
						avatar: '',
						gender: chartGender(child)
					},
					rels: {
						parents: [],
						spouses: [],
						children: []
					},
					main: false
				}
				if (father) sibling.rels.parents.push(father.id)
				if (mother) sibling.rels.parents.push(mother.id)
				addNode(sibling, 'Sibling')
				if (mother) {
					const node = nodes.find(lookup => lookup.id === mother.id)
					node.rels.children.push(sibling.id)
				}
				if (father) {
					const node = nodes.find(lookup => lookup.id === father.id)
					node.rels.children.push(sibling.id)
				}
			}
		}
		const halfSiblings = entity.siblings.filter(lookup => lookup.full === false)
		if (halfSiblings.length > 0) {
			// console.log('Adding Half-Siblings')
			for (const parentGroup of halfSiblings) {
				const parents = []
				for (const parent of parentGroup.parentDetails) {
					parents.push(parent.id)
					const existingParent = nodes.find(lookup => lookup.id === parent.id)
					if (!existingParent) {
						const parentData = {
							id: parent.id,
							data: {
								desc: chartLifespan(parent),
								label: parent.displayName,
								avatar: '',
								gender: chartGender(parent)
							},
							rels: {
								parents: [],
								spouses: [],
								children: []
							},
							main: false
						}
						addNode(parentData, 'Half-Sibling Parent')
					}
				}
				// console.log({ message: 'Setting spouses for half-sibling parents', parents })
				const halfParent0 = nodes.find(lookup => lookup.id === parents[0])
				const halfParent1 = nodes.find(lookup => lookup.id === parents[1])
				halfParent0.rels.spouses.push(halfParent1.id)
				halfParent1.rels.spouses.push(halfParent0.id)
				for (const child of parentGroup.children) {
					const childData = {
						id: child.id,
						data: {
							desc: chartLifespan(child),
							label: child.displayName,
							avatar: '',
							gender: chartGender(child)
						},
						rels: {
							parents,
							spouses: [],
							children: []
						},
						main: false
					}
					addNode(childData, 'Half-Sibling')
					halfParent0.rels.children.push(child.id)
					halfParent1.rels.children.push(child.id)
				}
			}
		}
	}
	// console.log('Adding children')
	for (const parentGroup of entity.children) {
		otherParent = null
		for (const parent of parentGroup.parents) {
			if (parent.id !== entity.id) {
				otherParent = {
					id: parent.id,
					data: {
						desc: chartLifespan(parent),
						label: parent.displayName,
						avatar: '',
						gender: chartGender(parent)
					},
					rels: {
						parents: [],
						spouses: [entity.id],
						children: []
					},
					main: false
				}
				addNode(otherParent, 'Parent of ParentGroup')
				// console.log({ message: 'Adding spouse to root based on child', root, otherParent })
				root.rels.spouses.push(otherParent.id)
			}
		}
		for (const child of parentGroup.children) {
			const childData = {
				id: child.id,
				data: {
					desc: chartLifespan(child),
					label: child.displayName,
					avatar: '',
					gender: chartGender(child)
				},
				rels: {
					parents: [entity.id],
					spouses: [],
					children: []
				},
				main: false
			}
			root.rels.children.push(child.id)
			if (otherParent) {
				childData.rels.parents.push(otherParent.id)
				otherParent.rels.children.push(child.id)
			}
			addNode(childData, 'Child of ParentGroup')
		}
	}
	console.log({ nodes, mother, father })
	const f3Chart = f3.createChart('#family-chart', nodes)
		.setTransitionTime(1000)
		.setCardXSpacing(250)
		.setCardYSpacing(150)
	f3Chart.setCardHtml()
		.setCardDisplay([d => d.data.label || '', d => d.data.desc || ''])
	f3Chart.updateTree({ initial: true })
}

/**
 * Get the page's entity and related data
 */
async function getEntity() {
	entity = await fetch(`/api/entity/graph/${dataPackage.entityId}`).then(r => r.json())
	facts = structuredClone(entity.facts)
	if (facts.length > 0 && entity.facts.find(lookup => lookup.code === 'Birth')) {
		/** @type {BiolineageTimelineFact} */
		const birth = entity.facts.find(lookup => lookup.code === 'Birth')
		const birthDate = massageDate(birth)
		/** @type {BiolineageTimelineFact} */
		const death = entity.facts.find(lookup => lookup.code === 'Death')
		const deathDate = death ? massageDate(death) : null
		if (entity.parents.length > 0) {
			for (const parent of entity.parents) {
				for (const fact of parent.facts) {
					const factDate = massageDate(fact)
					if (factDate >= birthDate && (deathDate === null || factDate < deathDate)) {
						/** @type {BiolineageTimelineFact} */
						const parentFact = structuredClone(fact)
						parentFact.code = parentFact.code === 'Birth' ? 'Birth of Parent' : 'Death of Parent'
						parentFact.entityName = parent.fullName
						parentFact.entityId = parent.id
						facts.push(parentFact)
					}
				}
			}
		}
		if (entity.children.length > 0) {
			for (const parentGroup of entity.children) {
				for (const child of parentGroup.children) {
					for (const fact of child.facts) {
						const factDate = massageDate(fact)
						if (factDate >= birthDate && (deathDate === null || factDate < deathDate)) {
							/** @type {BiolineageTimelineFact} */
							const childFact = structuredClone(fact)
							childFact.code = childFact.code === 'Birth' ? 'Birth of Child' : 'Death of Child'
							childFact.entityName = child.fullName
							childFact.entityId = child.id
							facts.push(childFact)
						}
					}
				}
			}
		}
		if (entity.siblings.length > 0) {
			for (const parentGroup of entity.siblings) {
				let relText = 'Sibling'
				if (!parentGroup.full) relText = 'Half-Sibling'
				for (const child of parentGroup.children) {
					for (const fact of child.facts) {
						const factDate = massageDate(fact)
						if (factDate >= birthDate && (deathDate === null || factDate < deathDate)) {
							/** @type {BiolineageTimelineFact} */
							const childFact = structuredClone(fact)
							childFact.code = childFact.code === 'Birth' ? `Birth of ${relText}` : `Death of ${relText}`
							childFact.entityName = child.fullName
							childFact.entityId = child.id
							facts.push(childFact)
						}
					}
				}
			}
		}
		facts.sort((a, b) => massageDate(a) - massageDate(b))
	}
	console.log({ entityNameParts, entity, facts })
	drawEntity()
}

/**
 * Handle adding and editinmg data related to the entity
 * @param {Event} event - event listener's Event object
 */
async function handleEntityEditor(event) {
	event.preventDefault()
	/** @type {HTMLElement} */
	let ele = event.target
	while (ele.tagName !== 'BUTTON') {
		ele = ele.parentElement
	}
	const editType = ele.dataset.type
	const editAction = ele.dataset.action
	const editId = ele.dataset.id
	console.log(editType, editAction, editId)
	const fields = []
	let modal
	switch (editType) {
		case 'sex': {
			fields.push({
				group: 'name',
				label: 'Entity ID',
				name: 'entityId',
				id: 'entity-id',
				type: 'text',
				hidden: true,
				value: dataPackage.entityId
			})
			fields.push({
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
				tip: 'Biological sex as recorded in historical documents. Leave blank if unknown or not stated in available sources.',
				value: entity.sex
			})
			modal = modalForm({ mode: 'add', endpoint: '/api/entity/edit/sex', header: 'Edit Sex' }, fields)
			break
		}
		case 'name': {
			let existingName = null
			if (editAction === 'edit') {
				existingName = entity.names.find(lookup => lookup.id === editId)
			}
			const groups = [
				{ header: null, slug: 'name' }
			]
			fields.push({
				group: 'name',
				label: 'Entity ID',
				name: 'entityId',
				id: 'entity-id',
				type: 'text',
				labelHidden: true,
				value: dataPackage.entityId
			})
			fields.push({
				group: 'name',
				label: 'Name ID',
				name: 'nameId',
				id: 'name-id',
				type: 'text',
				labelHidden: true,
				value: editId || null
			})
			fields.push({
				group: 'name',
				label: 'Name Type',
				name: 'nameType',
				id: 'name-type',
				type: 'text',
				placeholder: 'Type',
				required: true,
				autofocus: true,
				width: '100%',
				tip: 'Identifies which version of this person’s name this record represents (birth, married, adopted, professional, religious, imported, etc.). Each person may have multiple names, but only one of each type.',
				value: existingName ? existingName.nameType : null
			})
			for (const entityNamePart of entityNameParts) {
				fields.push({
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
					tip: entityNamePart.description,
					value: existingName ? existingName.nameParts[entityNamePart.code] ? existingName.nameParts[entityNamePart.code] : null : null
				})
			}
			fields.push({
				group: 'name',
				label: 'Description',
				name: 'description',
				id: 'description',
				type: 'textarea',
				placeholder: 'Additional information',
				width: '100%',
				tip: 'Optional notes or context about this name record, such as spelling variations, transcription notes, or cultural naming details.',
				value: existingName ? existingName.description : null
			})
			fields.push({
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
			if (editAction === 'add' || (editAction === 'edit' && editId !== entity.canonicalNameId)) {
				fields.push({
					group: 'name',
					label: 'Make Canonical',
					name: 'canonical',
					id: 'canonical',
					type: 'toggle',
					width: '100%',
					value: false,
					tip: 'Make this the name canonical as in active for this entity.'
				})
			}
			modal = modalForm({ mode: editAction, endpoint: `/api/entity/${editAction}/name`, header: `${editAction === 'add' ? 'Add' : 'Edit'} Name` }, fields, groups)
			break
		}
	}
	const id = await modal.show()
	console.log({ id })
	if (id) {
		console.log(`New id = ${id}`)
		getEntity()
	}
}

/**
 * Handle displaying additional data related to a timeline event
 * @param {Event} event  - event listener's Event object
 */
function handleTimelineFact(event) {
	event.preventDefault()

	let ele = event.target
	while (ele.tagName !== 'A') {
		ele = ele.parentElement
	}

	const placeId = ele.dataset.marker
	if (!placeId) return

	const marker = factMarkers.get(placeId)
	if (!marker) return

	const latlng = marker.getLatLng()
	map.flyTo(latlng, 12, { duration: 0.75 })
	marker.openPopup()
}

async function setup() {
	entityNameParts = await fetch('/data/entity-name-parts.json').then(r => r.json())
}

document.addEventListener('DOMContentLoaded', () => {
	console.log('DOM loaded: Tree Entity')
	console.log(dataPackage)
	setup()
	getEntity()
})
