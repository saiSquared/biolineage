'use strict'

const placeFields = []

const placeGroups = []

const placeValidators = {
	checkPlaceTypeAndPlace(getValue) {
		const place = getValue('place')

		if (place === 'existing' && !getValue('place-id')) document.getElementById('place-id').setCustomValidity('Existing place required')

		if (place === 'new') {
			const placeType = getValue('place-type')
			const placeName = getValue('place-name')
			console.log(placeType, placeName)
			if (placeType.text === '') document.getElementById('place-type').input.setCustomValidity('Place type required')
			if (placeName.text === '') document.getElementById('place-name').input.setCustomValidity('Place name required')

			// Latitude/Longitude pairing
			const lat = getValue('latitude')
			const lng = getValue('longitude')

			if (lat && !lng) document.getElementById('longitude').setCustomValidity('Longitude required if latitude is set')
			if (lng && !lat) document.getElementById('latitude').setCustomValidity('Latitude required if longitude is set')

			// Google Maps embed iframe validation
			const gpid = getValue('google-place-id')
			if (gpid) {
				const isValidEmbed =
					gpid.startsWith('<iframe') &&
						gpid.includes('src="https://www.google.com/maps/embed?pb=') &&
						gpid.includes('</iframe>')

				if (!isValidEmbed) document.getElementById('google-place-id').setCustomValidity('Google Maps embed iframe required')
			}
		}
	}
}

export default async function getPlaceForm() {
	const placesFields = await fetch('/data/places-fields.json').then(r => r.json())
	for (const placesField of placesFields) {
		placeFields.push(placesField)
	}
	return { placeFields, placeGroups, placeValidators }
}
