'use strict'

// TODO revisit pre-alpha naming documentation as noted in Obsidian > Biolineage > Names

import { smartify } from '/js/clubside-utils.js'

const main = document.querySelector('main')

let entity, map

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

const formatName = (data) => {
	const parts = []
	const fields = ['prefixName', 'givenName', 'nickName', 'middleName', 'prefixFamilyName', 'familyName']
	for (const field of fields) {
		if (data[field]) {
			if (field === 'nickName') {
				parts.push(`"${data.nickName}"`)
			} else {
				parts.push(data[field])
			}
		}
	}
	let name = parts.join(' ')
	if (data.suffixName) name += formatSuffix(data.suffixName)
	return smartify(name)
}

const formatSuffix = (raw) => {
	if (!raw) return ''

	const original = raw.trim()
	const suffix = original.toLowerCase()

	// --- Roman numeral detection ---
	const romanRegex = /^(m{0,4}(cm|cd|d?c{0,3})(xc|xl|l?x{0,3})(ix|iv|v?i{0,3}))$/i
	if (romanRegex.test(suffix)) {
		return ' ' + original // no comma
	}

	// --- Linguistic ordinal / epithet ---
	if (
		/^the\s+\w+/.test(suffix) || // "the Elder", "the First"
        /^(son|dau|daughter)\s+of\s+.+$/.test(suffix) || // "son of Johannes"
        /^\w+\s+the\s+\w+$/.test(suffix) // "William the Silent"
	) {
		return ' ' + original // no comma
	}

	// --- Professional / academic suffixes ---
	const professional = new Set([
		'md', 'm.d.', 'ph.d.', 'ed.d.', 'esq.', 'capt.', 'rev.', 'dr.', 'prof.'
	])
	if (professional.has(suffix)) {
		return ', ' + original // comma
	}

	// --- Generational appositives ---
	const generational = new Set([
		'jr.', 'sr.', 'jr.?', 'sr.?', 'jr. or ii'
	])
	if (generational.has(suffix)) {
		return ', ' + original // comma
	}

	// --- Everything else: treat as part of name (no comma) ---
	// Examples: "2B", "Tony", "Test horse"
	return ' ' + original
}

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

function drawEntity() {
	let icon, h2, h3, cardItem, section, header, div, button, img
	switch (dataPackage.treeType) {
		case 'human':
			switch (entity.sex) {
				case 'Male':
					icon = '/img/man.svg'
					break
				case 'Female':
					icon = '/img/woman.svg'
					break
				default:
					icon = '/img/person.svg'
			}
			break
		case 'equine':
			icon = '/img/horse.svg'
	}
	const birth = entity.facts.find(lookup => lookup.code === 'Birth')
	const death = entity.facts.find(lookup => lookup.code === 'Death')

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
	h1.innerHTML = entity.fullName
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
	img = document.createElement('img')
	img.src = '/img/pencil.svg'
	button.appendChild(img)
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
	img = document.createElement('img')
	img.src = '/img/pencil.svg'
	button.appendChild(img)
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
		div.innerHTML = '<em>Unknown</em>'
		section.appendChild(div)
	}
	cardItem.appendChild(section)
	button = document.createElement('button')
	button.id = 'vitals-birth'
	img = document.createElement('img')
	img.src = '/img/pencil.svg'
	button.appendChild(img)
	cardItem.appendChild(button)
	vitals.appendChild(cardItem)
	profile.appendChild(vitals)

	// timeline
	const timeline = document.createElement('section')
	timeline.className = 'entity-profile-timeline'
	cardItem = document.createElement('article')
	cardItem.className = 'entity-profile-card'
	h2 = document.createElement('h2')
	h2.innerHTML = 'Timeline'
	cardItem.appendChild(h2)
	div = document.createElement('div')
	cardItem.appendChild(div)
	timeline.appendChild(cardItem)
	div = document.createElement('div')
	div.id = 'map'
	timeline.appendChild(div)
	profile.appendChild(timeline)

	// family members
	const familyMembers = document.createElement('section')
	familyMembers.className = 'entity-profile-card'
	h2 = document.createElement('h2')
	h2.innerHTML = 'Family Members'
	familyMembers.appendChild(h2)
	h3 = document.createElement('h3')
	h3.innerHTML = 'Parents'
	familyMembers.appendChild(h3)
	profile.appendChild(familyMembers)

	// other relationships
	const otherRelationships = document.createElement('section')
	otherRelationships.className = 'entity-profile-card'
	h2 = document.createElement('h2')
	h2.innerHTML = 'Other Relationships'
	otherRelationships.appendChild(h2)
	profile.appendChild(otherRelationships)

	main.appendChild(profile)

	map = L.map('map', {
		center: new L.LatLng(40, -100),
		zoom: 4
	})
	L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	}).addTo(map)
}

async function getEntity() {
	entity = await fetch(`/api/entity/graph/${dataPackage.entityId}`).then(r => r.json())
	console.log(entity)
	drawEntity()
}

document.addEventListener('DOMContentLoaded', () => {
	console.log('DOM loaded: Tree Entity')
	console.log(dataPackage)
	getEntity()
})
