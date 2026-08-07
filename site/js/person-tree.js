'use strict'

const formatNameReverse = (data) => {
	let name = data.FamilyName || '<em>Unknown</em>'
	if (data.GivenName || data.MiddleName) {
		name += ','
		if (data.GivenName) name += ` ${data.GivenName}`
		if (data.MiddleName) name += ` ${data.MiddleName}`
	}
	if (data.SuffixName) name += `, ${data.SuffixName}`
	if (data.NickName) name += ` (${data.NickName})`
	return name
}

const formatPersonLink = (data, classes) => {
	const a = document.createElement('a')
	if (classes) a.className = classes
	a.href = `/person/${data.keeNew}`
	if (data.GenderIsMale) {
		const img = document.createElement('img')
		if (data.GenderIsMale.toLowerCase() === 'true') {
			img.src = '/img/man.svg'
		} else {
			img.src = '/img/woman.svg'
		}
		a.appendChild(img)
	}
	const span = document.createElement('span')
	let text = formatNameReverse(data)
	if (data.DateOfBirth && data.DateOfDeath) {
		text += ` ${formatShortDate(data.DateOfBirth)}-${formatShortDate(data.DateOfDeath)}`
	} else if (data.DateOfBirth) {
		text += ` ${formatShortDate(data.DateOfBirth)}-`
	} else if (data.DateOfDeath) {
		text += ` -${formatShortDate(data.DateOfDeath)}`
	}
	span.innerHTML = text
	a.appendChild(span)
	return a
}

const formatPgPersonLink = (data, classes) => {
	const a = document.createElement('a')
	if (classes) a.className = classes
	a.href = `/person/${data.entityId}`
	if (data.sex) {
		const img = document.createElement('img')
		if (data.sex === 'M') {
			img.src = '/img/man.svg'
		} else {
			img.src = '/img/woman.svg'
		}
		a.appendChild(img)
	}
	const span = document.createElement('span')
	span.innerHTML = `${data.displayName} ${data.birthYear || '~ '}-${data.deathYear || ' ~'}`
	a.appendChild(span)
	return a
}

const formatShortDate = (dateString) => {
	const dateParts = dateString.split('-')
	const date = new Date(dateParts[0], dateParts[1], dateParts[2])
	return new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	}).format(date)
}

const getHeader = (level) => {
	const header = document.createElement('h4')
	if (level < -4) {
		if (level === -5) {
			header.innerHTML = '3rd Great-Grandparents'
		} else {
			header.innerHTML = `${Math.abs(level) - 2}th Great-Grandparents`
		}
	} else if (level > 4) {
		if (level === 5) {
			header.innerHTML = '3rd Great-Grandchildren'
		} else {
			header.innerHTML = `${Math.abs(level) - 2}th Great-Grandchildren`
		}
	} else {
		switch (level) {
			case -4:
				header.innerHTML = 'Great-Great-Grandparents'
				break
			case -3:
				header.innerHTML = 'Great-Grandparents'
				break
			case -2:
				header.innerHTML = 'Grandparents'
				break
			case -1:
				header.innerHTML = 'Parents'
				break
			case 1:
				header.innerHTML = 'Children'
				break
			case 2:
				header.innerHTML = 'Grandchildren'
				break
			case 3:
				header.innerHTML = 'Great-Grandchildren'
				break
			case 4:
				header.innerHTML = 'Great-Great-Grandchildren'
				break
		}
	}
	return header
}

function drawFamilyChart(data) {
	for (const person of data) {
		if (person.rels.mother) {
			const existing = data.find(lookup => lookup.id === person.rels.mother)
			if (!existing) console.error('Missing mother', person.id, person.rels.mother)
		}
		if (person.rels.father) {
			const existing = data.find(lookup => lookup.id === person.rels.father)
			if (!existing) console.error('Missing father', person.id, person.rels.father)
		}
		if (person.rels.children.length > 0) {
			for (const child of person.rels.children) {
				const existing = data.find(lookup => lookup.id === child)
				if (!existing) console.error('Missing child', person.id, child)
			}
		}
	}
	const f3Chart = f3.createChart('#family-chart', data)
		.setTransitionTime(1000)
		.setCardXSpacing(250)
		.setCardYSpacing(150)
	f3Chart.setCardHtml()
		.setCardDisplay([d => d.data.label || '', d => d.data.desc || ''])
	f3Chart.updateTree({ initial: true })
}

function drawPersonTree(data) {
	const main = document.querySelector('main')
	const chart = document.createElement('div')
	chart.id = 'family-chart'
	chart.className = 'f3'
	main.appendChild(chart)
	const relationships = document.createElement('div')
	relationships.className = 'person-relationships'
	for (const level of data) {
		const div = document.createElement('div')
		if (level.level !== 0) {
			div.appendChild(getHeader(level.level))
		} else {
			div.className = 'invert'
		}
		for (const member of level.members) {
			div.appendChild(formatPersonLink(member))
		}
		relationships.appendChild(div)
	}
	main.appendChild(relationships)
}

function drawPgPersonTree(data) {
	const main = document.querySelector('main')
	const relationships = document.createElement('div')
	relationships.className = 'person-relationships'
	for (const level of data) {
		const div = document.createElement('div')
		if (level.level !== 0) {
			div.appendChild(getHeader(level.level))
		} else {
			div.className = 'invert'
		}
		for (const member of level.members) {
			div.appendChild(formatPgPersonLink(member))
		}
		relationships.appendChild(div)
	}
	main.appendChild(relationships)
}

async function getPersonTree() {
	const result = await fetch(`/api/person/${editorPackage.lookupId}/personal-tree`).then(r => r.json())
	console.log(result)
	drawPersonTree(result)
	const data = await fetch(`/api/person/${editorPackage.lookupId}/family-chart`).then(r => r.json())
	console.log(data)
	drawFamilyChart(data)
	const pgResult = await fetch(`/api/person/${editorPackage.lookupUUID}/pg-personal-tree`).then(r => r.json())
	console.log(groupByLevel(pgResult))
	drawPgPersonTree(groupByLevel(pgResult))
	const pgData = await fetch(`/api/person/${editorPackage.lookupUUID}/pg-family-chart`).then(r => r.json())
	console.log(pgData)
}

function groupByLevel(rows) {
	// If rows are already grouped (have .members), use them directly
	const groups = rows[0] && Array.isArray(rows[0].members)
		? rows
		: (() => {
				const map = new Map()
				for (const row of rows) {
					if (!map.has(row.level)) {
						map.set(row.level, { level: row.level, members: [] })
					}
					map.get(row.level).members.push(row)
				}
				return Array.from(map.values())
			})()

	// Sort members inside each group: null birthYear FIRST
	for (const group of groups) {
		group.members.sort((a, b) => {
			const ay = a.birthYear
			const by = b.birthYear

			if (ay == null && by == null) return 0
			if (ay == null) return -1
			if (by == null) return 1

			return ay - by
		})
	}

	// Sort groups by level
	return groups.sort((a, b) => a.level - b.level)
}

document.addEventListener('DOMContentLoaded', () => {
	console.log('DOM loaded: Person Tree')
	console.log(editorPackage)
	getPersonTree()
})
