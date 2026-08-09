'use strict'

const filterPackage = {
	tree: null,
	filter: null,
	startYear: null,
	endYear: null,
	page: 1
}

const filterStats = document.querySelector('.filter-stats')
const filterResults = document.querySelector('.filter-results')
const filterNav = document.querySelector('.filter-nav')
const filterText = document.getElementById('filter-text')
const filterStartYear = document.getElementById('filter-start-year')
const filterEndYear = document.getElementById('filter-end-year')
const cols = [
	{ width: '1%', align: 'left', header: '&nbsp;', headerAlign: 'left', field: 'sex' },
	{ width: '44%', align: 'left', header: 'Name', headerAlign: 'left', field: 'displayName' },
	{ width: '15%', align: 'center', header: 'Parents', headerAlign: 'center', field: 'parentCount' },
	{ width: '15%', align: 'center', header: 'Children', headerAlign: 'center', field: 'childCount' },
	{ width: '25%', align: 'right', header: 'Dates', headerAlign: 'right', field: 'dates' }
]

const debouncedFilterUpdate = debounce(() => {
	filterPackage.page = 1
	filterPackage.filter = filterText.value
	updateEntities()
}, 250)

const debouncedBirthYearAndUpdate = debounce(() => {
	if (filterStartYear.value.length === 4 || filterEndYear.value.length === 4) {
		updateEntities()
	}
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
		a.href = `/sos/items?page=${page}`
		a.addEventListener('click', (event) => {
			event.preventDefault()
			filterPackage.page = page
			updateEntities()
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
					case 'M':
						img.src = '/img/man.svg'
						break
					case 'F':
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
			window.location.href = `/person/${item.id}`
		})
		tbody.appendChild(tr)
	}
	table.appendChild(tbody)
	div.appendChild(table)
	filterResults.appendChild(div)
}

async function updateEntities() {
	const response = await fetch('/api/tree/browse', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(filterPackage)
	}).then(r => r.json())
	console.log(response)
	filterStats.innerHTML = ''
	const p = document.createElement('p')
	switch (response.total) {
		case 0:
			p.innerHTML = 'No people found.'
			break
		case 1:
			p.innerHTML = '1 person found.'
			break
		default:
			p.innerHTML = `${formatDecimalNumber(response.total)} people found.`
	}
	filterStats.appendChild(p)
	drawTable(response.items)
	buildPagination(filterPackage.page, response.pages)
}

filterText.addEventListener('input', debouncedFilterUpdate)

filterStartYear.addEventListener('input', () => {
	// 1. sanitize: allow only < > digits
	let v = filterStartYear.value.replace(/[^<>0-9]/g, '')

	// 2. ensure only ONE operator max
	const ops = v.match(/[<>]/g)
	if (ops && ops.length > 1) {
		// keep only the first operator
		let first = true
		v = v.replace(/[<>]/g, () => {
			if (first) { first = false; return ops[0] }
			return ''
		})
	}

	// 3. write sanitized value back
	filterStartYear.value = v

	// 4. update filterPackage
	filterPackage.page = 1
	filterPackage.startYear = Number(v)

	// 5. trigger debounced API call
	debouncedBirthYearAndUpdate()
})

filterEndYear.addEventListener('input', () => {
	// 1. sanitize: allow only < > digits
	let v = filterEndYear.value.replace(/[^<>0-9]/g, '')

	// 2. ensure only ONE operator max
	const ops = v.match(/[<>]/g)
	if (ops && ops.length > 1) {
		// keep only the first operator
		let first = true
		v = v.replace(/[<>]/g, () => {
			if (first) { first = false; return ops[0] }
			return ''
		})
	}

	// 3. write sanitized value back
	filterEndYear.value = v

	// 4. update filterPackage
	filterPackage.page = 1
	filterPackage.endYear = Number(v)

	// 5. trigger debounced API call
	debouncedBirthYearAndUpdate()
})

document.addEventListener('DOMContentLoaded', () => {
	console.log('DOM loaded: Tree Browse')
	console.log(dataPackage)
	filterPackage.tree = dataPackage.treeId
	updateEntities()
})
