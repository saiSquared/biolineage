'use strict'

const formatLocation = (data, which) => {
	let html = ''
	if (editorPackage.person[`${which}Country`]) html += `<img src="/img/flags/${editorPackage.person[`${which}Country`]}.svg">`
	const parts = []
	if (editorPackage.person[`${which}City`]) parts.push(editorPackage.person[`${which}City`])
	if (editorPackage.person[`${which}State`]) parts.push(editorPackage.person[`${which}State`])
	if (parts.length > 0) html += parts.join(', ')
	if (html === '') {
		return null
	} else {
		return html
	}
}

const formatLongDate = (dateStr) => {
	if (!dateStr) return ''
	const dateParts = dateStr.split('-')
	const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2])
	return new Intl.DateTimeFormat('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	}).format(date)
}

const formatName = (data) => {
	let name
	const nameParts = []
	if (data.GivenName) nameParts.push(data.GivenName)
	if (data.MiddleName) nameParts.push(data.MiddleName)
	if (data.FamilyName) nameParts.push(data.FamilyName)
	if (nameParts.length > 0) {
		name = nameParts.join(' ')
	} else {
		name = '<em>Unknown</em>'
	}
	if (data.SuffixName) name += `, ${data.SuffixName}`
	return name
}

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
	a.href = `/person/${data.keeNew || data.id}`
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

const formatShortDate = (dateString) => {
	const dateParts = dateString.split('-')
	const date = new Date(dateParts[0], dateParts[1], dateParts[2])
	return new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	}).format(date)
}

function drawPerson() {
	let ele
	const main = document.querySelector('main')
	const info = document.createElement('div')
	info.className = 'person-info'
	const pic = document.createElement('img')
	if (editorPackage.person.GenderIsMale) {
		if (editorPackage.person.GenderIsMale.toLowerCase() === 'true') {
			pic.src = '/img/man.svg'
		} else {
			pic.src = '/img/woman.svg'
		}
	}
	info.appendChild(pic)
	const heading = document.createElement('h1')
	heading.innerHTML = formatName(editorPackage.person)
	info.appendChild(heading)
	if (editorPackage.person.NickName) {
		const subHeading = document.createElement('h3')
		subHeading.innerHTML = editorPackage.person.NickName
		info.appendChild(subHeading)
	}
	const innerInfo = document.createElement('div')
	const innerBirth = document.createElement('div')
	ele = document.createElement('h4')
	ele.innerHTML = 'Born'
	innerBirth.appendChild(ele)
	ele = document.createElement('div')
	ele.innerHTML = formatLongDate(editorPackage.person.DateOfBirth)
	innerBirth.appendChild(ele)
	const birthInfo = formatLocation(editorPackage.person, 'Birth')
	if (birthInfo) {
		ele = document.createElement('div')
		ele.innerHTML = birthInfo
		innerBirth.appendChild(ele)
	}
	if (editorPackage.person.BirthHospital) {
		ele = document.createElement('div')
		ele.innerHTML = editorPackage.person.BirthHospital
		innerBirth.appendChild(ele)
	}
	innerInfo.appendChild(innerBirth)
	const innerDeath = document.createElement('div')
	if (editorPackage.person.DateOfDeath) {
		ele = document.createElement('h4')
		ele.innerHTML = 'Died'
		innerDeath.appendChild(ele)
		ele = document.createElement('div')
		ele.innerHTML = formatLongDate(editorPackage.person.DateOfDeath)
		innerDeath.appendChild(ele)
		const deathInfo = formatLocation(editorPackage.person, 'Burial')
		if (deathInfo) {
			ele = document.createElement('div')
			ele.innerHTML = deathInfo
			innerDeath.appendChild(ele)
		}
		if (editorPackage.person.BurialCemetary) {
			ele = document.createElement('div')
			ele.innerHTML = editorPackage.person.BurialCemetary
			innerDeath.appendChild(ele)
		}
	}
	innerInfo.appendChild(innerDeath)
	info.appendChild(innerInfo)
	if (editorPackage.person.Notes) {
		ele = document.createElement('h4')
		ele.innerHTML = 'Notes'
		info.appendChild(ele)
		ele = document.createElement('p')
		ele.innerHTML = editorPackage.person.Notes
		info.appendChild(ele)
	}
	if (editorPackage.role !== 'user') {
		const editButton = document.createElement('button')
		editButton.className = 'button'
		editButton.type = 'button'
		const img = document.createElement('img')
		img.src = '/img/pencil.svg'
		editButton.appendChild(img)
		const span = document.createElement('span')
		span.innerHTML = 'Edit'
		editButton.appendChild(span)
		info.appendChild(editButton)
	}
	main.appendChild(info)
	const relationships = document.createElement('div')
	relationships.className = 'person-relationships'
	if (editorPackage.person.parents.length > 0) {
		const parents = document.createElement('div')
		ele = document.createElement('h2')
		ele.innerHTML = 'Parents'
		parents.appendChild(ele)
		for (const person of editorPackage.person.parents) {
			parents.appendChild(formatPersonLink(person))
		}
		relationships.appendChild(parents)
	}
	if (editorPackage.person.siblingsFull.length > 0 || editorPackage.person.siblingsHalf.length > 0) {
		const siblings = document.createElement('div')
		ele = document.createElement('h2')
		ele.innerHTML = 'Siblings'
		siblings.appendChild(ele)
		for (const person of editorPackage.person.siblingsFull) {
			siblings.appendChild(formatPersonLink(person))
		}
		if (editorPackage.person.siblingsHalf.length > 0) {
			ele = document.createElement('h4')
			ele.innerHTML = 'Half-Siblings'
			for (const person of editorPackage.person.siblingsHalf) {
				siblings.appendChild(formatPersonLink(person))
			}
		}
		relationships.appendChild(siblings)
	}
	if (editorPackage.person.children.length > 0) {
		const children = document.createElement('div')
		ele = document.createElement('h2')
		ele.innerHTML = 'Children'
		children.appendChild(ele)
		for (const person of editorPackage.person.children) {
			ele = document.createElement('h4')
			ele.innerHTML = 'with'
			children.appendChild(ele)
			children.appendChild(formatPersonLink(person, 'gap'))
			for (const child of person.children) {
				children.appendChild(formatPersonLink(child))
			}
		}
		relationships.appendChild(children)
	}
	main.appendChild(relationships)
	const holder = document.createElement('div')
	holder.className = 'flex-holder'
	const personTree = document.createElement('a')
	personTree.className = 'big-button'
	personTree.href = `/person/${editorPackage.lookupId}/personal-tree`
	ele = document.createElement('img')
	ele.src = '/img/personal-tree.svg'
	personTree.appendChild(ele)
	ele = document.createElement('span')
	ele.innerHTML = 'Personal Tree'
	personTree.appendChild(ele)
	holder.appendChild(personTree)
	main.appendChild(holder)
}

async function getPerson() {
	const result = await fetch(`/api/person/${editorPackage.lookupId}`).then(r => r.json())
	console.log(result)
	editorPackage.person = result
	drawPerson()
}

document.addEventListener('DOMContentLoaded', () => {
	console.log('DOM loaded: Person')
	console.log(editorPackage)
	getPerson()
})
