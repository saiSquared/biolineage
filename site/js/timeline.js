'use strict'

async function loadTimeline() {
	const births = await fetch('/api/timeline/birth').then(r => r.json())
	// console.log(births)
	const timelineData = {
		events: []
	}
	for (const birth of births) {
		const dateParts = birth.DateOfBirth.split('-')
		const nameParts = []
		if (birth.GivenName) nameParts.push(birth.GivenName)
		if (birth.MiddleName) nameParts.push(birth.MiddleName)
		if (birth.FamilyName) nameParts.push(birth.FamilyName)
		const name = `${nameParts.join(' ')}${birth.SuffixName ? `, ${birth.SuffixName}` : ''}${birth.NickName ? ` (${birth.NickName})` : ''}`
		const birthDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2])
		const birthDateFormatted = new Intl.DateTimeFormat('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		}).format(birthDate)
		let text = `Born ${birthDateFormatted}`
		if (birth.BirthHospital) text += ` at ${birth.BirthHospital}`
		const birthParts = []
		if (birth.BirthCity) birthParts.push(birth.BirthCity)
		if (birth.BirthState) birthParts.push(birth.BirthState)
		if (birth.BirthCountry) birthParts.push(birth.BirthCountry)
		if (birthParts.length > 0) text += ` in ${birthParts.join(', ')}`
		const data = {
			start_date: {
				year: dateParts[0],
				month: dateParts[1],
				day: dateParts[2]
			},
			text: {
				headline: name,
				text
			}
		}
		timelineData.events.push(data)
	}
	// console.log(timelineData)
	// const timelineData = await fetch('/women_in_computing.json').then(r => r.json())
	const options = {
		initial_zoom: 6,
		height: '100%',
		timenav_height_percentage: 50
	}
	window.timeline = new TL.Timeline('timeline-embed', timelineData, options)
}

document.addEventListener('DOMContentLoaded', () => {
	console.log('DOM loaded: Timeline')
	loadTimeline()
})
