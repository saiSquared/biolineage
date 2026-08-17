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
		field: 'placeType',
		slug: 'place-type',
		label: 'Type',
		tip: 'The kind of place this is (Farm, Cemetery, Church, Municipality, etc.). The type determines which geographical fields apply.',
		width: '100%'
	},
	{
		field: 'name',
		slug: 'name',
		label: 'Name',
		tip: 'The official or commonly used name for this place.',
		width: '100%'
	},
	{
		field: 'description',
		slug: 'description',
		label: 'Description',
		tip: 'Contextual or historical details that help identify or describe this place.',
		width: '100%'
	},

	// 🌍 Geography fields (meaning-focused, not UI-focused)
	{
		field: 'sovereignEntity',
		slug: 'sovereign-entity',
		label: 'Country',
		tip: 'Current or historical country this place belongs to. This is the top‑level geographical unit.',
		width: '100%'
	},
	{
		field: 'subdivision',
		slug: 'subdivision',
		label: 'Subdivision',
		tip: 'State, province, or region within the country.',
		width: '100%'
	},
	{
		field: 'administrativeDivision',
		slug: 'administrative-division',
		label: 'County/District',
		tip: 'County, district, or equivalent mid‑level geographical unit.',
		width: '100%'
	},
	{
		field: 'municipality',
		slug: 'municipality',
		label: 'Municipality',
		tip: 'City, town, township, or local governing unit.'
	},

	// 📍 Coordinates & address
	{
		field: 'latitude',
		slug: 'latitude',
		label: 'Latitude',
		tip: 'Latitude in decimal degrees. Positive for north, negative for south.'
	},
	{
		field: 'longitude',
		slug: 'longitude',
		label: 'Longitude',
		tip: 'Longitude in decimal degrees. Positive for east, negative for west.'
	},
	{
		field: 'address',
		slug: 'address',
		label: 'Address',
		tip: 'Street or mailing address, if available. Useful for precise geolocation.'
	},

	// 🔗 External reference
	{
		field: 'googlePlaceId',
		slug: 'google-place-id',
		label: 'Google Place ID',
		tip: 'Identifier from Google Places. Paste the HTML embed code from the Google Maps share interface to link this place with Google’s location services.'
	},

	// 📝 Misc
	{
		field: 'notes',
		slug: 'notes',
		label: 'Notes',
		tip: 'Extra information or annotations relevant to this place.'
	}
]

/** @type {BiolineageTree[]} */
const trees = []
/** @type {BiolineageEntityNameParts[]} */
const entityNameParts = []
/** @type {BiolineageEntityType[]} */
const entityTypes = []

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
	const entityNamePartsData = await biolineageDb.query('select id, code, slug, label, surface, required, placeholder, format, description, width from entity_name_parts order by sort')
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
}

startup()

module.exports = {
	env, dbNorm, biolineageDb, entityNameParts, entityTypes, formatWordNumber, hashPassword, loadTrees, trees
}
