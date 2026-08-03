const fs = require('node:fs')
const path = require('node:path')
const { v4: uuidv4 } = require('uuid')
const argon2 = require('argon2')
const sqliteDb = require('../db/sqlite')
const pgDb = require('../db/pg')
const { pgTables, pgForeignKeys, pgTriggers, pgFunctions, pgViews } = require('../db/pg-definitions')
const dotenv = require('dotenv')

dotenv.config({
	path: path.resolve(__dirname, '..', '.env'),
	quiet: true
})

const normPg = pgDb({
	host: process.env.PG_HOST,
	port: Number(process.env.PG_PORT),
	user: process.env.PG_USER,
	password: process.env.PG_PASSWORD,
	database: process.env.PG_DATABASE
}, true)
const normSQLite = new sqliteDb('../db/norm.db')

const placeFixes = [
	{
		ogName: 'Marion County',
		ogCountry: null,
		ogRegion: null,
		ogCity: null,
		uuid: 'b8123bc6-fb68-475d-96b6-a8634ef87524'
	},
	{
		ogName: 'Marengo Coounty',
		ogCountry: 'us',
		ogRegion: 'AL',
		ogCity: null,
		uuid: '02be28fd-6498-478a-b3e2-ebf37029fa75'
	},
	{
		ogName: 'Shands Hospital',
		ogCountry: 'us',
		ogRegion: 'FL',
		ogCity: 'Gainsville',
		uuid: 'bf35f0e7-f801-452b-930e-e2d7fd47d1c0'
	},
	{
		ogName: 'Sumter Cemetary',
		ogCountry: 'us',
		ogRegion: 'SC',
		ogCity: 'Sumter',
		uuid: 'a0a35d5b-6fbe-4160-aaba-843a4dc8f1a5'
	},
	{
		ogName: 'Old Johnsonville Cemetary',
		ogCountry: 'us',
		ogRegion: 'SC',
		ogCity: 'Johnsonville',
		uuid: '65a31b18-d052-475b-873a-34fd1393457a'
	},
	{
		ogName: 'Old Johnsonville Cemetary',
		ogCountry: 'us',
		ogRegion: 'SC',
		ogCity: 'Jonhsonville',
		uuid: '65a31b18-d052-475b-873a-34fd1393457a'
	},
	{
		ogName: null,
		ogCountry: 'de',
		ogRegion: 'BW',
		ogCity: 'Leinfelden Stutgart',
		uuid: '201c8ccb-8124-4e4c-bda4-60757ef86d40'
	},
	{
		ogName: null,
		ogCountry: 'us',
		ogRegion: null,
		ogCity: 's',
		uuid: '5a870dc8-aff3-49d3-8ef7-47099457264e'
	},
	{
		ogName: null,
		ogCountry: 'us',
		ogRegion: 'MD',
		ogCity: 'Silver Sprinig',
		uuid: '712e4e62-29e3-4090-bf3e-314a3695a1b0'
	},
	{
		ogName: null,
		ogCountry: 'us',
		ogRegion: 'MD',
		ogCity: 'Silver spring',
		uuid: '712e4e62-29e3-4090-bf3e-314a3695a1b0'
	},
	{
		ogName: null,
		ogCountry: 'us',
		ogRegion: 'NY',
		ogCity: 'NYC',
		uuid: 'e7e00cba-707f-435c-87b1-9593f5f04392'
	},
	{
		ogName: null,
		ogCountry: 'us',
		ogRegion: 'NY',
		ogCity: 'New York',
		uuid: 'e7e00cba-707f-435c-87b1-9593f5f04392'
	},
	{
		ogName: null,
		ogCountry: 'us',
		ogRegion: 'SC',
		ogCity: 'Lynches Rover',
		uuid: '5d3a8488-37c5-469a-95b7-85b7362a4f15'
	},
	{
		ogName: null,
		ogCountry: 'us',
		ogRegion: 'SC',
		ogCity: 'Sumte',
		uuid: '669063ea-d9c5-4faa-9b0b-6267b9bc62bb'
	},
	{
		ogName: '?',
		ogCountry: 'us',
		ogRegion: 'SC',
		ogCity: 'Sumter',
		uuid: '669063ea-d9c5-4faa-9b0b-6267b9bc62bb'
	},
	{
		ogName: 'Evergreen Cemetary',
		ogCountry: 'us',
		ogRegion: 'SC',
		ogCity: 'Sumter',
		uuid: '4de025c7-059b-446b-996c-7b8cae18f9df'
	},
	{
		ogName: 'tbd',
		ogCountry: 'us',
		ogRegion: null,
		ogCity: null,
		uuid: '5a870dc8-aff3-49d3-8ef7-47099457264e'
	},
	{
		ogName: 'Home',
		ogCountry: 'us',
		ogRegion: 'SC',
		ogCity: 'Sumter',
		uuid: '669063ea-d9c5-4faa-9b0b-6267b9bc62bb'
	},
	{
		ogName: 'Manning Cemetery age 57.5 hours',
		ogCountry: 'us',
		ogRegion: 'SC',
		ogCity: 'Manning',
		uuid: '3afff307-6683-4d7b-8fd3-4cbebb8b5aee'
	},
	{
		ogName: 'Manning Cemetrery',
		ogCountry: 'us',
		ogRegion: 'SC',
		ogCity: 'Manning',
		uuid: '3afff307-6683-4d7b-8fd3-4cbebb8b5aee'
	},
	{
		ogName: 'some say born 1732',
		ogCountry: 'gb',
		ogRegion: null,
		ogCity: null,
		uuid: 'd3c13577-3379-47e7-b9f1-7c55d4542f21'
	},
	{
		ogName: 'Robeson County, NC',
		ogCountry: 'us',
		ogRegion: 'NC',
		ogCity: null,
		uuid: 'a8132416-8bd8-4feb-b7c1-4914101e30c7'
	},
	{
		ogName: 'a',
		ogCountry: 'us',
		ogRegion: 'CA',
		ogCity: null,
		uuid: '5b98ae04-9502-40d7-ad6a-a8eb00bc8b9f'
	},
	{
		ogName: 'died young',
		ogCountry: 'us',
		ogRegion: 'SC',
		ogCity: 'Timmonsville',
		uuid: '45768b17-ee48-4a9e-a7e8-4c9d0e4745cb'
	},
	{
		ogName: 'some say died 9/30/1819',
		ogCountry: 'us',
		ogRegion: 'SC',
		ogCity: 'Lynches River',
		uuid: '5d3a8488-37c5-469a-95b7-85b7362a4f15'
	},
	{
		ogName: 'Tappan',
		ogCountry: null,
		ogRegion: 'NY',
		ogCity: null,
		uuid: '5daaa0a7-aeb3-4e0f-97d0-4ef8150b54fb'
	}
]

const fixPlace = (data) => {
	const match = placeFixes.find(rule =>
		rule.ogName === data.ogName &&
		rule.ogCountry === data.ogCountry &&
		rule.ogRegion === data.ogRegion &&
		rule.ogCity === data.ogCity
	)

	return match ? match.uuid : data.uuid
}

async function hashPassword(text) {
	return await argon2.hash(text, {
		type: argon2.argon2id,
		memoryCost: 65536, // 64 MB
		timeCost: 3,
		parallelism: 4
	})
}

async function initPg() {
	for (const table of Object.keys(pgTables)) {
		await normPg.createTable(pgTables[table])
	}
	await normPg.createForeignKeys(pgForeignKeys)
	await normPg.createTriggers(pgTriggers)
	await normPg.createFunctions(pgFunctions)
	await normPg.createViews(pgViews)
	const clubside = uuidv4()
	await normPg.insert('users', {
		id: clubside,
		email: 'clubsidedev@hotmail.com',
		password: await hashPassword('FuckSh!tC*nt69'),
		name: 'Chris Rowley',
		avatar: true,
		role: 'super'
	})
	const norm = uuidv4()
	await normPg.insert('users', {
		id: norm,
		email: 'norman.eaddy@gmail.com',
		password: await hashPassword('temp-password-2026'),
		name: 'Norm Eaddy',
		role: 'super'
	})
	const charles = uuidv4()
	await normPg.insert('users', {
		id: charles,
		email: 'visionarypragmatist@gmail.com',
		password: await hashPassword('temp-password-2026'),
		name: 'Charles Carroll',
		role: 'super'
	})
	const sovereignEntities = []
	const countries = JSON.parse(fs.readFileSync('countries-final.json'))
	for (const country of countries) {
		country.type = 'COUNTRY'
		country.iso31661 = JSON.stringify(country.iso31661)
		country.tlds = JSON.stringify(country.tlds)
		await normPg.insert('sovereign_entities', country)
		sovereignEntities.push(country)
	}
	const subdivisions = []
	const subdivisionsData = JSON.parse(fs.readFileSync('subdivisions-final.json'))
	for (const subdivision of subdivisionsData) {
		subdivision.sovereignEntityId = subdivision.countryId
		subdivision.type = subdivision.iso31662.category
		subdivision.iso31662 = JSON.stringify(subdivision.iso31662)
		delete subdivision.countryId
		await normPg.insert('subdivisions', subdivision)
		subdivisions.push(subdivision)
	}
	const administrativeDivisions = []
	const administrativeDivisionsData = JSON.parse(fs.readFileSync('administrative_divisions.json'))
	for (const administrativeDivision of administrativeDivisionsData) {
		const subdivision = subdivisions.find(lookup => lookup.name === administrativeDivision.state_name)
		const data = {
			id: uuidv4(),
			sovereignEntityId: subdivision.sovereignEntityId,
			subdivisionId: subdivision.id,
			name: administrativeDivision.county,
			longName: administrativeDivision.county_full,
			type: 'COUNTY',
			fips: Number(administrativeDivision.county_fips),
			latitude: Number(administrativeDivision.lat),
			longitude: Number(administrativeDivision.lng),
			meta: JSON.stringify({ population: administrativeDivision.population })
		}
		await normPg.insert('administrative_divisions', data)
		administrativeDivisions.push(data)
	}
	const municipalitiesData = JSON.parse(fs.readFileSync('municipalities.json'))
	for (const municipality of municipalitiesData) {
		if (municipality.state_id !== 'PR') {
			const administrativeDivision = administrativeDivisions.find(lookup => lookup.fips === Number(municipality.county_fips))
			if (!administrativeDivision) console.log(municipality)
			const meta = {
				population: Number(municipality.population),
				density: Number(municipality.density),
				source: municipality.source,
				military: municipality.military === 'TRUE',
				incorporated: municipality.incorporated === 'TRUE',
				timezone: municipality.timezone,
				ranking: Number(municipality.ranking),
				zips: JSON.stringify(municipality.zips.split(' '))
			}
			const data = {
				id: uuidv4(),
				sovereignEntityId: administrativeDivision.sovereignEntityId,
				subdivisionId: administrativeDivision.subdivisionId,
				administrativeDivisionId: administrativeDivision.id,
				name: municipality.city,
				type: 'CITY',
				latitude: Number(municipality.lat),
				longitude: Number(municipality.lng),
				meta: JSON.stringify(meta)
			}
			await normPg.insert('municipalities', data)
		}
	}
	const normTree = uuidv4()
	await normPg.insert('trees', {
		id: normTree,
		ownerId: norm,
		name: 'Norm Tree',
		slug: 'norm',
		createdBy: norm,
		modifiedBy: norm
	})
	const charlesTree = uuidv4()
	await normPg.insert('trees', {
		id: charlesTree,
		ownerId: charles,
		name: 'Charles Tree',
		slug: 'charles',
		createdBy: norm,
		modifiedBy: norm
	})
	const horseTree = uuidv4()
	await normPg.insert('trees', {
		id: horseTree,
		ownerId: norm,
		name: 'Horse Tree',
		slug: 'horses',
		createdBy: norm,
		modifiedBy: norm
	})
	const human = uuidv4()
	await normPg.insert('entity_types', {
		id: human,
		key: 'human',
		label: 'Human',
		createdBy: clubside,
		modifiedBy: clubside
	})
	const equine = uuidv4()
	await normPg.insert('entity_types', {
		id: equine,
		key: 'equine',
		label: 'Equine',
		createdBy: clubside,
		modifiedBy: clubside
	})
	const used = []
	const people = await normSQLite.query('SELECT * FROM person')
	const horses = await normSQLite.query('SELECT * FROM person WHERE FamilyName LIKE \'%hors%\';')
	for (const horse of horses) {
		const id = uuidv4()
		const nameParts = []
		if (horse.FamilyName) nameParts.push(horse.FamilyName)
		if (horse.GivenName) nameParts.push(horse.GivenName)
		await normPg.insert('entities', {
			id,
			treeId: horseTree,
			entityTypeId: equine,
			displayName: nameParts.length > 0 ? nameParts.join(' ') : 'Unknown',
			sex: horse.GenderIsMale ? horse.GenderIsMale.toLowerCase() === 'true' ? 'M' : 'F' : null,
			createdBy: norm,
			modifiedBy: norm
		})
		await normSQLite.execute('UPDATE person SET uuid = @uuid WHERE keeNew = @id', { uuid: id, id: horse.keeNew })
		const nameId = uuidv4()
		await normPg.insert('entity_names', {
			id: nameId,
			treeId: horseTree,
			entityId: id,
			nameType: 'Ingestion',
			givenName: horse.GivenName,
			middleName: horse.MiddleName,
			familyName: horse.FamilyName,
			suffixName: horse.SuffixName,
			nickName: horse.NickName,
			createdBy: norm,
			modifiedBy: norm
		})
		await normPg.update('entities', { canonicalNameId: nameId }, { id })
		used.push(horse.keeNew)
	}
	const charlesData = await normSQLite.query('SELECT * FROM charles')
	for (const row of charlesData) {
		const person = people.find(data => data.keeNew === row.keeNew)
		const id = uuidv4()
		const nameParts = []
		if (person.GivenName) nameParts.push(person.GivenName)
		if (person.FamilyName) nameParts.push(person.FamilyName)
		if (person.SuffixName) nameParts.push(person.SuffixName)
		await normPg.insert('entities', {
			id,
			treeId: charlesTree,
			entityTypeId: human,
			displayName: nameParts.length > 0 ? nameParts.join(' ') : 'Unknown',
			sex: person.GenderIsMale ? person.GenderIsMale.toLowerCase() === 'true' ? 'M' : 'F' : null,
			createdBy: charles,
			modifiedBy: charles
		})
		await normSQLite.execute('UPDATE person SET uuid = @uuid WHERE keeNew = @id', { uuid: id, id: row.keeNew })
		const nameId = uuidv4()
		await normPg.insert('entity_names', {
			id: nameId,
			treeId: charlesTree,
			entityId: id,
			nameType: 'Ingestion',
			givenName: person.GivenName,
			middleName: person.MiddleName,
			familyName: person.FamilyName,
			suffixName: person.SuffixName,
			nickName: person.NickName,
			createdBy: charles,
			modifiedBy: charles
		})
		await normPg.update('entities', { canonicalNameId: nameId }, { id })
		used.push(person.keeNew)
	}
	const normData = people.filter(data => !(data.GivenName === null && data.FamilyName === null))
	for (const row of normData) {
		if (!used.includes(row.keeNew)) {
			const id = uuidv4()
			const nameParts = []
			if (row.GivenName) nameParts.push(row.GivenName)
			if (row.FamilyName) nameParts.push(row.FamilyName)
			if (row.SuffixName) nameParts.push(row.SuffixName)
			await normPg.insert('entities', {
				id,
				treeId: normTree,
				entityTypeId: human,
				displayName: nameParts.length > 0 ? nameParts.join(' ') : 'Unknown',
				sex: row.GenderIsMale ? row.GenderIsMale.toLowerCase() === 'true' ? 'M' : 'F' : null,
				createdBy: norm,
				modifiedBy: norm
			})
			await normSQLite.execute('UPDATE person SET uuid = @uuid WHERE keeNew = @id', { uuid: id, id: row.keeNew })
			const nameId = uuidv4()
			await normPg.insert('entity_names', {
				id: nameId,
				treeId: normTree,
				entityId: id,
				nameType: 'Ingestion',
				givenName: row.GivenName,
				middleName: row.MiddleName,
				familyName: row.FamilyName,
				suffixName: row.SuffixName,
				nickName: row.NickName,
				createdBy: norm,
				modifiedBy: norm
			})
			await normPg.update('entities', { canonicalNameId: nameId }, { id })
		}
	}
	const places = []
	const sqlitePlaces = await normSQLite.query('SELECT * FROM places')
	for (const place of sqlitePlaces) {
		const data = {
			id: fixPlace(place),
			placeType: place.type,
			name: place.name
		}
		if (place.countryId) {
			data.sovereignEntityId = place.countryId
		} else {
			data.sovereignEntity = place.country
		}
		if (place.regionId) {
			data.subdivisionId = place.regionId
		} else {
			data.subdivision = place.region
		}
		data.municipality = place.city
		data.createdBy = clubside
		data.modifiedBy = clubside
		await normPg.insert('places', data)
		data.ogName = place.ogName
		data.ogCountry = place.ogCountry
		data.ogRegion = place.ogRegion
		data.ogCity = place.ogCity
		places.push(data)
	}
	const personData = await normSQLite.query('SELECT * FROM person')
	const entities = await normPg.query('SELECT * FROM entities')
	for (const entity of entities) {
		const person = personData.find(lookup => lookup.uuid === entity.id)
		if (!person) console.log(entity)
		if (person.DateOfBirth) {
			// if (person.BirthHospital || person.BirthCountry || person.BirthState || person.BirthCity) console.log(entity, person)
			const dateParts = person.DateOfBirth.split('-')
			let placeId = null
			const place = places.find(lookup => lookup.ogName === person.BirthHospital && lookup.ogCountry === person.BirthCountry && lookup.ogRegion === person.BirthState && lookup.ogCity === person.BirthCity)
			if (place) placeId = place.id
			const data = {
				id: uuidv4(),
				treeId: entity.treeId,
				entityId: entity.id,
				eventType: 'birth',
				epoch: 'AD',
				year: dateParts[0],
				month: dateParts[1],
				day: dateParts[2],
				placeId,
				createdBy: entity.createdBy,
				modifiedBy: entity.modifiedBy
			}
			await normPg.insert('events', data)
		}
		if (person.DateOfDeath) {
			const dateParts = person.DateOfDeath.split('-')
			const data = {
				id: uuidv4(),
				treeId: entity.treeId,
				entityId: entity.id,
				eventType: 'death',
				epoch: 'AD',
				year: dateParts[0],
				month: dateParts[1],
				day: dateParts[2],
				createdBy: entity.createdBy,
				modifiedBy: entity.modifiedBy
			}
			await normPg.insert('events', data)
		}
	}
	await transformRelationshipsAndGender()
}

async function run() {
	await initPg()
	await normPg.close()
}

async function transformRelationshipsAndGender() {
	// 1. Load legacy data from SQLite
	const personData = await normSQLite.query('SELECT * FROM person')
	const parentData = await normSQLite.query('SELECT * FROM parent')

	// 2. Build in-memory maps
	const parentsOf = new Map() // childKee -> [parentKee, ...]
	const childrenOf = new Map() // parentKee -> [childKee, ...]
	const people = new Map() // keeNew -> personRow

	for (const person of personData) {
		people.set(person.keeNew, person)
	}

	for (const row of parentData) {
		const parentKee = row.ParentPtr
		const childKee = row.ChildPtr

		if (!parentsOf.has(childKee)) parentsOf.set(childKee, [])
		parentsOf.get(childKee).push(parentKee)

		if (!childrenOf.has(parentKee)) childrenOf.set(parentKee, [])
		childrenOf.get(parentKee).push(childKee)
	}

	// 3. Cache created_by and tree_id from PostgreSQL
	const createdByCache = new Map()
	const treeIdCache = new Map()

	const getEntityMeta = async (entityId) => {
		if (createdByCache.has(entityId) && treeIdCache.has(entityId)) {
			return {
				createdBy: createdByCache.get(entityId),
				treeId: treeIdCache.get(entityId)
			}
		}

		const row = await normPg.get(
			'SELECT created_by, tree_id FROM entities WHERE id = $1',
			[entityId]
		)

		const createdBy = row?.createdBy ?? null
		const treeId = row?.treeId ?? null

		createdByCache.set(entityId, createdBy)
		treeIdCache.set(entityId, treeId)

		return { createdBy, treeId }
	}

	// 4. Begin transaction
	await normPg.begin()
	try {
		// 5. Insert relationships
		for (const [childKee, parentList] of parentsOf.entries()) {
			const child = people.get(childKee)
			if (!child || !child.uuid) continue

			const childEntityId = child.uuid
			const childMeta = await getEntityMeta(childEntityId)
			const childTreeId = childMeta.treeId

			for (const parentKee of parentList) {
				const parent = people.get(parentKee)
				if (!parent || !parent.uuid) continue

				const parentEntityId = parent.uuid
				const parentMeta = await getEntityMeta(parentEntityId)

				const createdBy = parentMeta.createdBy ?? childMeta.createdBy ?? null

				const relationshipRow = {
					id: uuidv4(),
					treeId: childTreeId,
					entityId: parentEntityId,
					relatedEntityId: childEntityId,
					relationshipType: 'parent',
					direction: 'forward',
					createdBy,
					modifiedBy: createdBy
				}

				const exists = await normPg.get(
					`SELECT 1 FROM relationships
					WHERE tree_id = $1
						AND entity_id = $2
						AND related_entity_id = $3
						AND relationship_type = $4`,
					[
						relationshipRow.treeId,
						relationshipRow.entityId,
						relationshipRow.relatedEntityId,
						relationshipRow.relationshipType
					]
				)

				if (!exists) {
					// console.log(parentMeta, relationshipRow)

					await normPg.insert('relationships', relationshipRow)
				}
			}
		}

		// 6. Infer gender from parent couplings (in-memory)
		for (const parentList of parentsOf.values()) {
			if (parentList.length < 2) continue

			const [p1, p2] = parentList
			const person1 = people.get(p1)
			const person2 = people.get(p2)
			if (!person1 || !person2) continue

			const g1 = person1.GenderIsMale
			const g2 = person2.GenderIsMale

			if (g1 != null && g2 == null) {
				person2.GenderIsMale = !g1
			} else if (g2 != null && g1 == null) {
				person1.GenderIsMale = !g2
			}
		}

		// 7. Write gender updates back to PostgreSQL
		for (const person of people.values()) {
			if (person.GenderIsMale !== null && person.uuid) {
				// Normalize SQLite values: 'true'/'false' → boolean
				const raw = person.GenderIsMale
				const bool =
					typeof raw === 'string'
						? raw.toLowerCase() === 'true'
						: !!raw

				// Convert boolean → 'M' or 'F'
				const sex = bool ? 'M' : 'F'

				await normPg.update(
					'entities',
					{ sex },
					{ id: person.uuid }
				)
			}
		}

		// 8. Commit transaction
		await normPg.commit()
	} catch (err) {
		await normPg.rollback()
		throw err
	}
}

run()
