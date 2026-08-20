const fs = require('node:fs')
const path = require('node:path')
const argon2 = require('argon2')
const dotenv = require('dotenv')
const sqliteDb = require('../db/sqlite')
const pgDb = require('../db/pg')

// Load .env once, globally
dotenv.config({
	path: path.resolve(__dirname, '..', '.env'),
	quiet: true
})

const env = Object.freeze({ ...process.env })
const dbNorm = new sqliteDb('/home/biolineage.app/db/norm.db')
/** @type {import('../db/pg').PGEngine} */
const biolineageDb = pgDb({
	host: env.PG_HOST,
	port: Number(env.PG_PORT),
	user: env.PG_USER,
	password: env.PG_PASSWORD,
	database: env.PG_DATABASE
}, false)

const placeFields = [
	{
		label: 'Type',
		name: 'placeType',
		id: 'place-type',
		type: 'text',
		placeholder: 'ex. City',
		tip: 'The kind of place this is (Farm, Cemetery, Church, Municipality, etc.). The type determines which geographical fields apply.',
		width: '25ch'
	},
	{
		label: 'Name',
		name: 'name',
		id: 'name',
		type: 'text',
		placeholder: 'ex. Mt. Sinai Hospital',
		tip: 'The official or commonly used name for this place.',
		width: '25ch'
	},
	{
		label: 'Description',
		name: 'description',
		id: 'description',
		type: 'textarea',
		placeholder: 'Details about this place...',
		tip: 'Contextual or historical details that help identify or describe this place.',
		width: '100%'
	},

	// 🌍 Geography fields (meaning-focused, not UI-focused)
	{
		label: 'Country',
		name: 'sovereignEntity',
		id: 'sovereign-entity',
		type: 'combo',
		placeholder: 'ex. United States',
		api: '/api/geography/sovereign-entities',
		tip: 'Current or historical country this place belongs to. This is the top‑level geographical unit.',
		width: '20ch'
	},
	{
		label: 'Subdivision',
		name: 'subdivision',
		id: 'subdivision',
		type: 'combo',
		placeholder: 'ex. Maryland',
		api: '/api/geography/subdivisions',
		tip: 'State, province, or region within the country.',
		width: '30ch'
	},
	{
		label: 'County/District',
		name: 'administrativeDivision',
		id: 'administrative-division',
		type: 'combo',
		placeholder: 'ex. Montgomery',
		api: '/api/geography/administrative-divisions',
		tip: 'County, district, or equivalent mid‑level geographical unit.',
		width: '40ch'
	},
	{
		label: 'Municipality',
		name: 'municipality',
		id: 'municipality',
		type: 'combo',
		placeholder: 'ex. Rockville',
		api: '/api/geography/municipalities',
		tip: 'City, town, township, or local governing unit.',
		width: '50ch'
	},

	// 📍 Coordinates & address
	{
		label: 'Latitude',
		name: 'latitude',
		id: 'latitude',
		type: 'text',
		placeholder: 'ex. 34.1436602',
		tip: 'Latitude in decimal degrees. Positive for north, negative for south.',
		width: '12ch'
	},
	{
		label: 'Longitude',
		name: 'longitude',
		id: 'longitude',
		type: 'text',
		placeholder: 'ex. -81.5304051',
		tip: 'Longitude in decimal degrees. Positive for east, negative for west.',
		width: '12ch'
	},
	{
		label: 'Address',
		name: 'address',
		id: 'address',
		type: 'textarea',
		placeholder: 'ex. 80 State Rd S-36-126, Prosperity, SC 29127',
		tip: 'Street or mailing address, if available. Useful for precise geolocation.',
		width: '100%'
	},

	// 🔗 External reference
	{
		label: 'Google Place ID',
		name: 'googlePlaceId',
		id: 'google-place-id',
		type: 'text',
		placeholder: 'ex. <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3311.028172006805!2d-80.3637026!3d33.9146745!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88ff6f2bfcc63ad1%3A0x2bdfdf255eb61352!2sSumter%20Cemetery!5e0!3m2!1sen!2sus!4v1787181892900!5m2!1sen!2sus" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>',
		tip: 'Identifier from Google Places. Paste the HTML embed code from the Google Maps share interface to link this place with Google’s location services.',
		width: '100%'
	},

	// 📝 Misc
	{
		label: 'Notes',
		name: 'notes',
		id: 'notes',
		type: 'textarea',
		placeholder: 'Extra information...',
		tip: 'Extra information or annotations relevant to this place.',
		width: '100%'
	}
]

/** @type {BiolineageTree[]} */
const trees = []
/** @type {BiolineageEntityNameParts[]} */
const entityNameParts = []
/** @type {BiolineageEntityType[]} */
const entityTypes = []

function getTimeZoneOffset(timeZone, date = new Date()) {
	// Create a formatter for the target timezone
	const tzFormatter = new Intl.DateTimeFormat('en-US', {
		timeZone,
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
		hour12: false
	})

	// Create a formatter for UTC
	const utcFormatter = new Intl.DateTimeFormat('en-US', {
		timeZone: 'UTC',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
		hour12: false
	})

	// Format the same date in both timezones
	const tzParts = tzFormatter.formatToParts(date)
	const utcParts = utcFormatter.formatToParts(date)

	// Helper to convert parts to total seconds
	const toSeconds = (parts) => {
		const getPart = (type) => parseInt(parts.find(p => p.type === type).value, 10)
		const h = getPart('hour')
		const m = getPart('minute')
		const s = getPart('second')
		return h * 3600 + m * 60 + s
	}

	const tzSeconds = toSeconds(tzParts)
	const utcSeconds = toSeconds(utcParts)

	// Calculate difference in minutes
	let diff = (tzSeconds - utcSeconds) / 60

	// Handle day wrap-around (e.g., if UTC is 23:00 and TZ is 01:00 next day)
	if (diff > 720) diff -= 1440
	if (diff < -720) diff += 1440

	// Format as ±HH:MM
	const sign = diff >= 0 ? '+' : '-'
	const absDiff = Math.abs(diff)
	const hours = String(Math.floor(absDiff / 60)).padStart(2, '0')
	const minutes = String(absDiff % 60).padStart(2, '0')

	return `${sign}${hours}:${minutes}`
}

const zones = Intl.supportedValuesOf('timeZone')
const timezones = zones.map(data => {
	return { tz: data, offset: getTimeZoneOffset(data) }
})
timezones.push({ tz: 'Etc/UTC', offset: '+00:00' })
timezones.push({ tz: 'Etc/GMT', offset: '+00:00' })
timezones.push({ tz: 'Etc/GMT+0', offset: '+00:00' })
timezones.push({ tz: 'Etc/GMT-0', offset: '+00:00' })
timezones.push({ tz: 'Etc/GMT0', offset: '+00:00' })
timezones.sort((a, b) => {
	const toMinutes = (offset) => {
		const sign = offset.startsWith('-') ? -1 : 1
		const [h, m] = offset.substring(1).split(':').map(Number)
		return sign * (h * 60 + m)
	}
	return toMinutes(a.offset) - toMinutes(b.offset)
})

function formatWordNumber(number) {
	const words = [
		'No', 'One', 'Two', 'Three', 'Four',
		'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'
	]

	return words[number] ?? new Intl.NumberFormat('en-us').format(number)
}

async function hashPassword(text) {
	return await argon2.hash(text, {
		type: argon2.argon2id,
		memoryCost: 65536, // 64 MB
		timeCost: 3,
		parallelism: 4
	})
}

async function loadTrees() {
	trees.length = 0
	const treeData = await biolineageDb.query('select t.*, et.key, et.label from trees t join entity_types et on et.id = t.entity_type_id')
	for (const tree of treeData) {
		trees.push(tree)
	}
}

async function startup() {
	const entityTypesData = await biolineageDb.query('select id, key, label, description from entity_types')
	for (const row of entityTypesData) {
		entityTypes.push(row)
	}
	fs.writeFileSync(path.resolve(__dirname, '..', 'site', 'data', 'entity-types.json'), JSON.stringify(entityTypesData, null, '\t'))
	const entityNamePartsData = await biolineageDb.query('select id, code, id, label, surface, required, placeholder, format, description, width from entity_name_parts order by sort')
	for (const row of entityNamePartsData) {
		entityNameParts.push(row)
	}
	fs.writeFileSync(path.resolve(__dirname, '..', 'site', 'data', 'entity-name-parts.json'), JSON.stringify(entityNamePartsData, null, '\t'))
	const relationshipTypes = await biolineageDb.query('select id, type, direction, name, description, left_output, right_output from relationship_types order by type, main desc, name')
	fs.writeFileSync(path.resolve(__dirname, '..', 'site', 'data', 'relationship-types.json'), JSON.stringify(relationshipTypes, null, '\t'))
	const factTypes = await biolineageDb.query('select entity_type_id, code, name, description from fact_types order by entity_type_id, code')
	fs.writeFileSync(path.resolve(__dirname, '..', 'site', 'data', 'fact-types.json'), JSON.stringify(factTypes, null, '\t'))
	const placeTypes = await biolineageDb.query('select id, name, description from place_types order by name')
	fs.writeFileSync(path.resolve(__dirname, '..', 'site', 'data', 'place-types.json'), JSON.stringify(placeTypes, null, '\t'))
	fs.writeFileSync(path.resolve(__dirname, '..', 'site', 'data', 'places-fields.json'), JSON.stringify(placeFields, null, '\t'))
	fs.writeFileSync(path.resolve(__dirname, '..', 'site', 'data', 'timezones.json'), JSON.stringify(timezones, null, '\t'))
}

startup()

module.exports = {
	env, dbNorm, biolineageDb, entityNameParts, entityTypes, formatWordNumber, hashPassword, loadTrees, trees
}
