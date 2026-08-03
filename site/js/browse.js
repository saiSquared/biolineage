'use strict'

const filterPackage = {
	filter: null,
	onhand: null,
	type: null,
	page: 1
}

const filterStats = document.querySelector('.filter-stats')
const filterResults = document.querySelector('.filter-results')
const filterNav = document.querySelector('.filter-nav')
const filterText = document.getElementById('filter-text')
const filterYear = document.getElementById('filter-year')
const cols = [
	{ width: '1%', align: 'left', header: '&nbsp;', headerAlign: 'left', field: 'gender' },
	{ width: '44%', align: 'left', header: 'Name', headerAlign: 'left', field: 'name' },
	{ width: '25%', align: 'left', header: 'Born', headerAlign: 'left', field: 'description' },
	{ width: '30%', align: 'right', header: 'Dates', headerAlign: 'right', field: 'dates' }
]

const debouncedFilterUpdate = debounce(() => {
	filterPackage.page = 1
	filterPackage.filter = filterText.value
	updateItems()
}, 250)

const debouncedOnhandUpdate = debounce(() => {
	updateItems()
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
			updateItems()
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
		case 'gender': {
			td.className = 'flex large-image'
			let gender = ''
			if (item.gender === 'male') {
				gender = '<img src="/img/man.svg">'
			} else if (item.gender === 'female') {
				gender = '<img src="/img/woman.svg">'
			}
			td.innerHTML = gender
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

async function updateItems() {
	const response = await fetch('/api/browse', {
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

filterYear.addEventListener('input', () => {
	// 1. sanitize: allow only < > digits
	let v = filterYear.value.replace(/[^<>0-9]/g, '')

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
	filterYear.value = v

	// 4. update filterPackage
	filterPackage.page = 1
	filterPackage.year = v

	// 5. trigger debounced API call
	debouncedOnhandUpdate()
})

document.addEventListener('DOMContentLoaded', () => {
	console.log('DOM loaded: Browse People')
	const queryString = window.location.search
	const params = new URLSearchParams(queryString)
	const q = params.get('q')
	if (q) {
		filterText.setAttribute('value', q)
		filterPackage.filter = q
	}
	updateItems()
})
