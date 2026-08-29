'use strict'

import { smartify } from './clubside-utils.js'
import { placeFields, placeGroups, placeValidators } from '/js/forms/place.js'
import modalForm from '/js/modal-form.js'

const filterPackage = {
	place: null,
	filter: null,
	page: 1
}

const main = document.querySelector('main')
const cols = [
	{ width: '1%', align: 'left', header: '&nbsp;', headerAlign: 'left', field: 'sex' },
	{ width: '44%', align: 'left', header: 'Name', headerAlign: 'left', field: 'displayName' },
	{ width: '15%', align: 'left', header: 'Fact', headerAlign: 'left', field: 'code' },
	{ width: '25%', align: 'right', header: 'Date', headerAlign: 'right', field: 'date' }
]

let place, tableResults, tableNav, map

const formatDecimalNumber = number => {
	return new Intl.NumberFormat(navigator.language, {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2
	}).format(number)
}

const formatGenealogyDate = (data) => {
	if (data.dateText) return data.dateText
	if (!data.month && !data.day) return data.year

	let d

	if (data.month && data.day) {
		d = new Date(data.year, data.month - 1, data.day)
	} else {
		d = new Date(data.year, data.month - 1, 1)
	}
	const formattedDay = d.getDate()
	const formattedMonth = d.toLocaleString('default', { month: 'long' })
	const formattedYear = d.getFullYear()

	return `${formattedDay} ${formattedMonth} ${formattedYear}`
}

const renderImage = (prefix, file) => {
	const img = document.createElement('img')
	img.src = `/img/${prefix}/${file}`
	return img
}

const renderKeyValueBlock = (label, obj) => {
	const p = document.createElement('p')
	const keys = []
	for (const key of Object.keys(obj)) {
		const val = obj[key]
		if (!val) continue
		let str = `<span style="font-weight: 500;">${key}</span>: `
		switch (key) {
			case 'zips': {
				str += JSON.parse(val).join(', ')
				break
			}
			case 'population':
			case 'density':
				str += formatDecimalNumber(val)
				break
			default:
				str += val
		}
		keys.push(str)
	}
	p.innerHTML = `<strong>${label}</strong>: ${keys.join(', ')}`
	return p
}

const renderLatLng = (lat, lng, zoom) => {
	const p = document.createElement('p')
	p.innerHTML = `<strong>Latitude</strong>: ${lat}, <strong>Longitude</strong>: ${lng} <a href="https://www.google.com/maps/@?api=1&map_action=map&center=${lat},${lng}&zoom=${zoom}" target="_blank"><strong>Open Map</strong></a>`
	return p
}

function buildPagination(page, totalPages) {
	tableNav.innerHTML = ''

	let li

	const ul = document.createElement('ul')
	ul.className = 'cdn-nav'

	if (page > 1) ul.appendChild(buildPaginationItem(page - 1, '<'))

	// Always show first 3 pages
	for (let i = 1; i <= Math.min(3, totalPages); i++) {
		ul.appendChild(buildPaginationItem(i))
	}

	// Left ellipsis
	if (page > 5) {
		li = document.createElement('li')
		li.innerHTML = '…'
		ul.appendChild(li)
	}

	// Middle window (current -1, current, current +1)
	for (let i = page - 1; i <= page + 1; i++) {
		if (i > 3 && i < totalPages - 2) ul.appendChild(buildPaginationItem(i))
	}

	// Right ellipsis
	if (page < totalPages - 4) {
		li = document.createElement('li')
		li.innerHTML = '…'
		ul.appendChild(li)
	}

	// Last 3 pages
	for (let i = Math.max(totalPages - 2, 4); i <= totalPages; i++) {
		if (i > 0) ul.appendChild(buildPaginationItem(i))
	}

	if (page < totalPages) ul.appendChild(buildPaginationItem(page + 1, '>'))

	tableNav.appendChild(ul)
}

function buildPaginationItem(page, text) {
	const li = document.createElement('li')
	if (page === filterPackage.page) {
		li.style.fontWeight = '700'
		li.innerHTML = page
	} else {
		const a = document.createElement('a')
		a.href = `/trees/${dataPackage.treeSlug}?page=${page}`
		a.addEventListener('click', (event) => {
			event.preventDefault()
			filterPackage.page = page
			updateTable()
		})
		a.innerHTML = text || page
		li.appendChild(a)
	}
	return li
}

function drawCell(item, col) {
	const td = document.createElement('td')
	td.style.width = col.width
	td.style.textAlign = col.align
	switch (col.field) {
		case 'date': {
			td.innerHTML = formatGenealogyDate(item)
			break
		}
		case 'sex': {
			td.className = 'flex large-image'
			const img = document.createElement('img')
			if (dataPackage.treeType === 'equine') {
				img.src = '/img/horse.svg'
			} else {
				switch (item.sex) {
					case 'Male':
						img.src = '/img/man.svg'
						break
					case 'Female':
						img.src = '/img/woman.svg'
						break
					default:
						img.src = '/img/person.svg'
				}
			}
			td.appendChild(img)
			break
		}
		default:
			td.innerHTML = item[col.field]
	}
	return td
}

function drawTable(items) {
	tableResults.innerHTML = ''
	const div = document.createElement('div')
	div.className = 'table-holder'
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
		th.style.width = col.width
		th.style.textAlign = col.headerAlign
		th.innerHTML = col.header
		theadTr.appendChild(th)
	}
	thead.appendChild(theadTr)
	table.appendChild(thead)
	const tbody = document.createElement('tbody')
	for (const item of items) {
		const tr = document.createElement('tr')
		for (const col of cols) {
			tr.appendChild(drawCell(item, col))
		}
		tr.addEventListener('click', () => {
			window.location.href = `/trees/${dataPackage.treeSlug}/entities/${item.entityId}`
		})
		tbody.appendChild(tr)
	}
	table.appendChild(tbody)
	div.appendChild(table)
	tableResults.appendChild(div)
}

async function editPlace(event) {
	event.preventDefault()
	const combos = ['placeType', 'sovereignEntity', 'subdivision', 'administrativeDivision', 'municipality']
	for (const field of placeFields) {
		if (combos.includes(field.name)) {
			if (field.name === 'placeType') {
				if (place.placeTypeId) {
					field.value = { id: place.placeTypeId, text: place.placeType }
				} else {
					field.value = { id: null, text: place.placeType }
				}
				field.showOnEmpty = true
			} else {
				if (place[`${field.name}Id`]) {
					field.value = { id: place[`${field.name}Id`], text: place[`${field.name}Name`] }
				} else {
					field.value = { id: null, text: place[field.name] }
				}
			}
		} else {
			if (field.name === 'googlePlaceId') {
				if (place.googlePlaceId) field.value = `<iframe src="https://www.google.com/maps/embed?pb=${place.googlePlaceId}"></iframe>`
			} else {
				if (place[field.name]) field.value = place[field.name]
			}
		}
	}
	const fields = [
		{
			label: 'Place Type',
			name: 'place',
			id: 'place',
			type: 'text',
			labelHidden: true,
			value: 'new'
		},
		{
			label: 'Place ID',
			name: 'placeId',
			id: 'place-id',
			type: 'text',
			labelHidden: true,
			value: dataPackage.placeId
		},
		...placeFields
	]
	const modal = modalForm({ mode: 'edit', endpoint: '/api/place/edit', header: 'Edit Place' }, fields, placeGroups, placeValidators)
	const id = await modal.show()
	console.log({ id })
	if (id) {
		console.log(`New id = ${id}`)
		setup()
	}
}

async function updateTable() {
	const response = await fetch('/api/place/entities', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(filterPackage)
	}).then(r => r.json())
	console.log(response)
	drawTable(response.items)
	buildPagination(filterPackage.page, response.pages)
}

async function setup() {
	let section, h2, h3, div, p
	place = await fetch(`/api/place/${dataPackage.placeId}`).then(r => r.json())
	let lat, lng, zoom
	if (place.latitude) {
		lat = place.latitude
		lng = place.longitude
		zoom = 14
	} else if (place.municipalityLatitude) {
		lat = place.municipalityLatitude
		lng = place.municipalityLongitude
		zoom = 10
	} else if (place.administrativeDivisionLatitude) {
		lat = place.administrativeDivisionLatitude
		lng = place.administrativeDivisionLongitude
		zoom = 8
	} else if (place.subdivisionLatitude) {
		lat = place.subdivisionLatitude
		lng = place.subdivisionLongitude
		zoom = 6
	} else if (place.sovereignEntityLatitude) {
		lat = place.sovereignEntityLatitude
		lng = place.sovereignEntityLongitide
		zoom = 4
	} else {
		lat = null
		lng = null
	}
	console.log(place, lat, lng, zoom)

	main.innerHTML = ''
	h2 = document.createElement('h2')
	h2.className = 'no-margin-bottom'
	h2.innerHTML = `<img src="/img/tree.svg"> ${dataPackage.treeName}`
	main.appendChild(h2)
	const h1 = document.createElement('h1')
	h1.className = 'no-margin'
	h1.innerHTML = smartify(place.placeName)
	main.appendChild(h1)
	h3 = document.createElement('h3')
	h3.className = 'no-margin-top italics'
	h3.innerHTML = place.placeType
	main.appendChild(h3)

	section = document.createElement('section')
	section.className = 'profile-card'
	p = document.createElement('p')
	p.innerHTML = `<strong>Name</strong>: ${smartify(place.placeName)}`
	section.appendChild(p)
	p = document.createElement('p')
	p.innerHTML = `<strong>Type</strong>: ${smartify(place.placeType)}`
	section.appendChild(p)
	if (place.description) {
		p = document.createElement('p')
		p.innerHTML = `<strong>Description</strong>: ${smartify(place.description)}`
		section.appendChild(p)
	}
	if (place.address) {
		p = document.createElement('p')
		p.innerHTML = `<strong>Address</strong>: <address>${smartify(place.address)}</address>`
		section.appendChild(p)
	}
	if (place.sovereignEntity || place.sovereignEntityName) {
		p = document.createElement('p')
		p.innerHTML = `<strong>Country</strong>: ${smartify(place.sovereignEntity || place.sovereignEntityName)}`
		section.appendChild(p)
	}
	if (place.subdivision || place.subdivisionName) {
		p = document.createElement('p')
		p.innerHTML = `<strong>Subdivision</strong>: ${smartify(place.subdivision || place.subdivisionName)}`
		section.appendChild(p)
	}
	if (place.administrativeDivision || place.administrativeDivisionName) {
		p = document.createElement('p')
		p.innerHTML = `<strong>County/District</strong>: ${smartify(place.administrativeDivision || place.administrativeDivisionName)}`
		section.appendChild(p)
	}
	if (place.municipality || place.municipalityName) {
		p = document.createElement('p')
		p.innerHTML = `<strong>Municipality</strong>: ${smartify(place.municipality || place.municipalityName)}`
		section.appendChild(p)
	}
	if (place.latitude) {
		p = document.createElement('p')
		p.innerHTML = `<strong>Latitude</strong>: ${place.latitude}, <strong>Longitude</strong>: ${place.longitude} <a href="https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}" target="_blank"><strong>Open Map</strong></a>`
		section.appendChild(p)
	}
	if (UserActivation.role !== 'reader') {
		div = document.createElement('div')
		div.className = 'flex-wrap flex-wrap-end'
		const button = document.createElement('button')
		button.className = 'button'
		button.type = 'button'
		const img = document.createElement('img')
		img.src = '/img/pencil.svg'
		button.appendChild(img)
		const span = document.createElement('span')
		span.innerHTML = 'Edit Place'
		button.appendChild(span)
		button.addEventListener('click', editPlace)
		div.appendChild(button)
		section.appendChild(div)
	}
	main.appendChild(section)

	if (lat) {
		h2 = document.createElement('h2')
		h2.innerHTML = `Map${place.googlePlaceId ? 's' : ''}`
		main.appendChild(h2)
		section = document.createElement('section')
		section.classList.add('profile-maps')
		if (place.googlePlaceId) section.classList.add('profile-maps-two-up')
		div = document.createElement('div')
		div.id = 'map'
		section.appendChild(div)
		if (place.googlePlaceId) {
			const iframe = document.createElement('iframe')
			iframe.src = `https://www.google.com/maps/embed?pb=${place.googlePlaceId}`
			iframe.setAttribute('allowfullscreen', '')
			iframe.setAttribute('loading', 'lazy')
			iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin')
			section.appendChild(iframe)
		}
		main.appendChild(section)
		map = L.map('map', {
			center: new L.LatLng(lat, lng),
			zoom
		})
		L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		}).addTo(map)
	}

	if (place.sovereignEntityName) {
		h2 = document.createElement('h2')
		h2.innerHTML = 'Sovereign Entity'
		main.appendChild(h2)
		section = document.createElement('section')
		section.className = 'profile-card'
		const placeDetails = document.createElement('div')
		placeDetails.className = 'place-details'
		div = document.createElement('div')
		if (place.sovereignEntityHasFlag) div.appendChild(renderImage('flags', place.sovereignEntityFlagFile))
		placeDetails.appendChild(div)
		div = document.createElement('div')
		h3 = document.createElement('h3')
		h3.innerHTML = place.sovereignEntityLongName || place.sovereignEntityName
		div.appendChild(h3)
		p = document.createElement('p')
		p.innerHTML = `<strong>Name</strong>: ${place.sovereignEntityName}`
		div.appendChild(p)
		if (place.sovereignEntityLongName) {
			p = document.createElement('p')
			p.innerHTML = `<strong>Long Name</strong>: ${place.sovereignEntityLongName}`
			div.appendChild(p)
		}
		p = document.createElement('p')
		p.innerHTML = `<strong>Type</strong>: ${place.sovereignEntityType}`
		div.appendChild(p)
		if (place.sovereignEntityIso31661) div.appendChild(renderKeyValueBlock('ISO 3166-1', place.sovereignEntityIso31661))
		if (place.sovereignEntityLatitude) div.appendChild(renderLatLng(place.sovereignEntityLatitude, place.sovereignEntityLongitide, 5))
		placeDetails.appendChild(div)
		div = document.createElement('div')
		if (place.sovereignEntityHasArmorial) div.appendChild(renderImage('armorials', place.sovereignEntityArmorialFile))
		placeDetails.appendChild(div)
		section.appendChild(placeDetails)
		main.appendChild(section)
	}

	if (place.subdivisionName) {
		h2 = document.createElement('h2')
		h2.innerHTML = 'Subdivision'
		main.appendChild(h2)
		section = document.createElement('section')
		section.className = 'profile-card'
		const placeDetails = document.createElement('div')
		placeDetails.className = 'place-details'
		div = document.createElement('div')
		if (place.subdivisionHasFlag) div.appendChild(renderImage('flags', place.subdivisionFlagFile))
		placeDetails.appendChild(div)
		div = document.createElement('div')
		h3 = document.createElement('h3')
		h3.innerHTML = place.subdivisionLongName || place.subdivisionName
		div.appendChild(h3)
		p = document.createElement('p')
		p.innerHTML = `<strong>Type</strong>: ${place.subdivisionType}`
		div.appendChild(p)
		if (place.subdivisionIso31662) div.appendChild(renderKeyValueBlock('ISO 3166-2', place.subdivisionIso31662))
		if (place.subdivisionLatitude) div.appendChild(renderLatLng(place.subdivisionLatitude, place.subdivisionLongitude, 9))
		placeDetails.appendChild(div)
		div = document.createElement('div')
		if (place.subdivisionHasArmorial) div.appendChild(renderImage('armorials', place.subdivisionArmorialFile))
		placeDetails.appendChild(div)
		section.appendChild(placeDetails)
		main.appendChild(section)
	}

	if (place.administrativeDivisionName) {
		h2 = document.createElement('h2')
		h2.innerHTML = 'Administrative Division'
		main.appendChild(h2)
		section = document.createElement('section')
		section.className = 'profile-card'
		const placeDetails = document.createElement('div')
		placeDetails.className = 'place-details'
		div = document.createElement('div')
		if (place.administrativeDivisionHasFlag) div.appendChild(renderImage('flags', place.administrativeDivisionFlagFile))
		placeDetails.appendChild(div)
		div = document.createElement('div')
		h3 = document.createElement('h3')
		h3.innerHTML = place.administrativeDivisionLongName || place.administrativeDivisionName
		div.appendChild(h3)
		p = document.createElement('p')
		p.innerHTML = `<strong>Type</strong>: ${place.administrativeDivisionType}`
		div.appendChild(p)
		if (place.administrativeDivisionIso31662) div.appendChild(renderKeyValueBlock('ISO 3166-2', place.administrativeDivisionIso31662))
		if (place.administrativeDivisionMeta) div.appendChild(renderKeyValueBlock('Meta', place.administrativeDivisionMeta))
		if (place.administrativeDivisionLatitude) div.appendChild(renderLatLng(place.administrativeDivisionLatitude, place.administrativeDivisionLongitude, 13))
		placeDetails.appendChild(div)
		div = document.createElement('div')
		if (place.administrativeDivisionHasArmorial) div.appendChild(renderImage('armorials', place.administrativeDivisionArmorialFile))
		placeDetails.appendChild(div)
		section.appendChild(placeDetails)
		main.appendChild(section)
	}

	if (place.municipalityName) {
		h2 = document.createElement('h2')
		h2.innerHTML = 'Municipality'
		main.appendChild(h2)
		section = document.createElement('section')
		section.className = 'profile-card'
		const placeDetails = document.createElement('div')
		placeDetails.className = 'place-details'
		div = document.createElement('div')
		if (place.municipalityHasFlag) div.appendChild(renderImage('flags', place.municipalityFlagFile))
		placeDetails.appendChild(div)
		div = document.createElement('div')
		h3 = document.createElement('h3')
		h3.innerHTML = place.municipalityLongName || place.municipalityName
		div.appendChild(h3)
		p = document.createElement('p')
		p.innerHTML = `<strong>Type</strong>: ${place.municipalityType}`
		div.appendChild(p)
		if (place.municipalityMeta) div.appendChild(renderKeyValueBlock('Meta', place.municipalityMeta))
		if (place.municipalityLatitude) div.appendChild(renderLatLng(place.municipalityLatitude, place.municipalityLongitude, 16))
		placeDetails.appendChild(div)
		div = document.createElement('div')
		if (place.municipalityHasArmorial) div.appendChild(renderImage('armorials', place.municipalityArmorialFile))
		placeDetails.appendChild(div)
		section.appendChild(placeDetails)
		main.appendChild(section)
	}

	h2 = document.createElement('h2')
	h2.innerHTML = dataPackage.treePluralLabel
	main.appendChild(h2)
	tableResults = document.createElement('div')
	tableResults.className = 'filter-results'
	main.appendChild(tableResults)
	tableNav = document.createElement('div')
	tableNav.className = 'filter-nav'
	main.appendChild(tableNav)
	await updateTable()
}

document.addEventListener('DOMContentLoaded', () => {
	console.log('DOM loaded: Tree Place')
	console.log(dataPackage)
	filterPackage.place = dataPackage.placeId
	setup()
})
