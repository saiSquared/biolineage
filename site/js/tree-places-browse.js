'use strict'

const filterPackage = {
	tree: null,
	type: null,
	page: 1
}

const filterStats = document.querySelector('.filter-stats')
const filterResults = document.querySelector('.filter-results')
const filterNav = document.querySelector('.filter-nav')
const filterType = document.getElementById('filter-type')
const cols = [
	{ width: '44%', align: 'left', header: 'Name', headerAlign: 'left', field: 'name' },
	{ width: '15%', align: 'left', header: 'Type', headerAlign: 'left', field: 'placeType' },
	{ width: '25%', align: 'right', header: 'Dates', headerAlign: 'right', field: 'facts' }
]

const debouncedFilterUpdate = debounce(() => {
	filterPackage.page = 1
	filterPackage.type = filterType.value === '' ? null : filterType.value
	updatePlaces()
}, 250)

const formatDecimalNumber = number => {
	return new Intl.NumberFormat(navigator.language, {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2
	}).format(number)
}

function buildPagination(page, totalPages) {
	filterNav.innerHTML = ''

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

	filterNav.appendChild(ul)
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
			updatePlaces()
		})
		a.innerHTML = text || page
		li.appendChild(a)
	}
	return li
}

function debounce(fn, delay = 200) {
	let timer = null
	return (...args) => {
		clearTimeout(timer)
		timer = setTimeout(() => fn(...args), delay)
	}
}

function drawCell(item, col) {
	const td = document.createElement('td')
	td.style.width = col.width
	td.style.textAlign = col.align
	switch (col.field) {
		case 'dates': {
			let text = ''
			if (!item.birthYear && !item.deathYear) {
				text += '<em>Unknown</em>'
			} else {
				if (item.birthYear) {
					text += item.birthYear
				} else {
					text += '<em>Unknown</em>'
				}
				text += '-'
				if (item.deathYear) {
					text += item.deathYear
				} else {
					text += 'Living'
				}
			}
			td.innerHTML = text
			break
		}
		case 'sex': {
			td.className = 'flex large-image'
			const img = document.createElement('img')
			if (dataPackage.treeType === '409a8c4f-1167-4039-b298-f46ce7bcf7fd') {
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
	filterResults.innerHTML = ''
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
			window.location.href = `/trees/${dataPackage.treeSlug}/places/${item.id}`
		})
		tbody.appendChild(tr)
	}
	table.appendChild(tbody)
	div.appendChild(table)
	filterResults.appendChild(div)
}

async function updatePlaces() {
	const response = await fetch('/api/tree/places/browse', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(filterPackage)
	}).then(r => r.json())
	console.log(response)
	filterStats.innerHTML = ''
	const p = document.createElement('p')
	switch (response.total) {
		case 0:
			p.innerHTML = 'No places found.'
			break
		case 1:
			p.innerHTML = '1 place found.'
			break
		default:
			p.innerHTML = `${formatDecimalNumber(response.total)} places found.`
	}
	filterStats.appendChild(p)
	drawTable(response.items)
	buildPagination(filterPackage.page, response.pages)
}

filterType.addEventListener('change', debouncedFilterUpdate)

document.addEventListener('DOMContentLoaded', () => {
	console.log('DOM loaded: Tree Entities')
	console.log(dataPackage)
	filterPackage.tree = dataPackage.treeId
	updatePlaces()
})
