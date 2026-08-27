'use strict'

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

let place, tableResults, tableNav

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
		th.style.width = col.with
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
	console.log(place)

	section = document.createElement('section')
	section.className = 'entity-profile-card'
	h2 = document.createElement('h2')
	h2.innerHTML = 'Vitals'
	section.appendChild(h2)
	main.appendChild(section)

	if (place.sovereignEntityName) {
		h2 = document.createElement('h2')
		h2.innerHTML = 'Sovereign Entity'
		main.appendChild(h2)
		section = document.createElement('section')
		section.className = 'entity-profile-card'
		const placeDetails = document.createElement('div')
		placeDetails.className = 'place-details'
		div = document.createElement('div')
		if (place.sovereignEntityHasFlag) {
			const img = document.createElement('img')
			img.src = `/img/flags/${place.sovereignEntityFlagFile}`
			div.appendChild(img)
		}
		placeDetails.appendChild(div)
		div = document.createElement('div')
		h3 = document.createElement('h3')
		h3.innerHTML = place.sovereignEntityLongName || place.sovereignEntityName
		div.appendChild(h3)
		p = document.createElement('p')
		p.innerHTML = `<strong>Type</strong>: ${place.sovereignEntityType}`
		div.appendChild(p)
		placeDetails.appendChild(div)
		div = document.createElement('div')
		if (place.sovereignEntityHasArmorial) {
			const img = document.createElement('img')
			img.src = `/img/armorials/${place.sovereignEntityArmorialFile}`
			div.appendChild(img)
		}
		placeDetails.appendChild(div)
		section.appendChild(placeDetails)
		main.appendChild(section)
	}

	if (place.subdivisionName) {
		h2 = document.createElement('h2')
		h2.innerHTML = 'Subdivision'
		main.appendChild(h2)
		section = document.createElement('section')
		section.className = 'entity-profile-card'
		const placeDetails = document.createElement('div')
		placeDetails.className = 'place-details'
		div = document.createElement('div')
		if (place.subdivisionHasFlag) {
			const img = document.createElement('img')
			img.src = `/img/flags/${place.subdivisionFlagFile}`
			div.appendChild(img)
		}
		placeDetails.appendChild(div)
		div = document.createElement('div')
		h3 = document.createElement('h3')
		h3.innerHTML = place.subdivisionLongName || place.subdivisionName
		div.appendChild(h3)
		p = document.createElement('p')
		p.innerHTML = `<strong>Type</strong>: ${place.subdivisionType}`
		div.appendChild(p)
		placeDetails.appendChild(div)
		div = document.createElement('div')
		if (place.subdivisionHasArmorial) {
			const img = document.createElement('img')
			img.src = `/img/armorials/${place.subdivisionArmorialFile}`
			div.appendChild(img)
		}
		placeDetails.appendChild(div)
		section.appendChild(placeDetails)
		main.appendChild(section)
	}

	if (place.administrativeDivisionName) {
		h2 = document.createElement('h2')
		h2.innerHTML = 'Administrative Division'
		main.appendChild(h2)
		section = document.createElement('section')
		section.className = 'entity-profile-card'
		const placeDetails = document.createElement('div')
		placeDetails.className = 'place-details'
		div = document.createElement('div')
		if (place.administrativeDivisionHasFlag) {
			const img = document.createElement('img')
			img.src = `/img/flags/${place.administrativeDivisionFlagFile}`
			div.appendChild(img)
		}
		placeDetails.appendChild(div)
		div = document.createElement('div')
		h3 = document.createElement('h3')
		h3.innerHTML = place.administrativeDivisionLongName || place.administrativeDivisionName
		div.appendChild(h3)
		p = document.createElement('p')
		p.innerHTML = `<strong>Type</strong>: ${place.administrativeDivisionType}`
		div.appendChild(p)
		placeDetails.appendChild(div)
		div = document.createElement('div')
		if (place.administrativeDivisionHasArmorial) {
			const img = document.createElement('img')
			img.src = `/img/armorials/${place.administrativeDivisionArmorialFile}`
			div.appendChild(img)
		}
		placeDetails.appendChild(div)
		section.appendChild(placeDetails)
		main.appendChild(section)
	}

	if (place.municipalityName) {
		h2 = document.createElement('h2')
		h2.innerHTML = 'Municipality'
		main.appendChild(h2)
		section = document.createElement('section')
		section.className = 'entity-profile-card'
		const placeDetails = document.createElement('div')
		placeDetails.className = 'place-details'
		div = document.createElement('div')
		if (place.municipalityHasFlag) {
			const img = document.createElement('img')
			img.src = `/img/flags/${place.municipalityFlagFile}`
			div.appendChild(img)
		}
		placeDetails.appendChild(div)
		div = document.createElement('div')
		h3 = document.createElement('h3')
		h3.innerHTML = place.municipalityLongName || place.municipalityName
		div.appendChild(h3)
		p = document.createElement('p')
		p.innerHTML = `<strong>Type</strong>: ${place.municipalityType}`
		div.appendChild(p)
		placeDetails.appendChild(div)
		div = document.createElement('div')
		if (place.municipalityHasArmorial) {
			const img = document.createElement('img')
			img.src = `/img/armorials/${place.municipalityArmorialFile}`
			div.appendChild(img)
		}
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
