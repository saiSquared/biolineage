const fs = require('node:fs')
const path = require('node:path')
const { v4: uuidv4 } = require('uuid')
const argon2 = require('argon2')
const sqliteDb = require('../db/sqlite')
const sqliteTables = require('../db/sqlite-definitions')
const pgDb = require('../db/pg')
const { pgTables, pgFunctions, pgTriggers, pgViews } = require('../db/pg-definitions')
const { removeIndent } = require('../modules/clubside-utils')
const dotenv = require('dotenv')

dotenv.config({
	path: path.resolve(__dirname, '..', '.env'),
	quiet: true
})

const biolineageDb = pgDb({
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

function buildName(data) {
	const parts = []
	if (data.GivenName) parts.push(data.GivenName)
	if (data.MiddleName) parts.push(data.MiddleName)
	if (data.FamilyName) parts.push(data.FamilyName)
	let name = parts.join(' ')
	if (data.SuffixName) name = `${name}, ${data.SuffixName}`
	if (data.NickName) name = `${name} (${data.NickName})`
	return name
}

function buildSearchName(data) {
	let partsString = ''
	if (data.GivenName) partsString += data.GivenName + ' '
	if (data.MiddleName) partsString += data.MiddleName + ' '
	if (data.FamilyName) partsString += data.FamilyName + ' '
	if (data.SuffixName) partsString += data.SuffixName + ' '
	if (data.NickName) partsString += data.NickName
	const cleaned = partsString.trim().toLowerCase().replace(/[^\w\s]/g, '')
	const parts = cleaned.split(/\s+/)
	return [...new Set(parts)].join(' ')
}

async function buildSQLiteChildren() {
	await normSQLite.createTable(sqliteTables.children)
	const people = await normSQLite.query('SELECT * FROM person WHERE uuid IS NOT NULL')
	for (const person of people) {
		const sql = `
			SELECT
				person_1.keeNew as ChildKee,
				person_1.uuid as ChildUUID,
				person_1.FamilyName AS ChildFamilyName,
				person_1.GivenName AS ChildGivenName,
				person_1.MiddleName as ChildMiddleName,
				person_1.SuffixName as ChildSuffixName,
				person_1.NickName as ChildNickName,
				person_1.DateOfBirth as ChildDateOfBirth,
				person_1.DateOfDeath as ChildDateOfDeath,
				person_1.GenderIsMale as ChildGenderIsMale,
				person_2.keeNew as ParentKee,
				person_2.uuid AS ParentUUID,
				person_2.FamilyName AS ParentFamilyName,
				person_2.GivenName AS ParentGivenName,
				person_2.MiddleName as ParentMiddleName,
				person_2.SuffixName as ParentSuffixName,
				person_2.NickName as ParentNickName,
				person_2.DateOfBirth as ParentDateOfBirth,
				person_2.DateOfDeath as ParentDateOfDeath,
				person_2.GenderIsMale as ParentGenderIsMale
			FROM
				(
					SELECT
						A.ChildPtrA, B.ParentPtrW
					FROM
						(SELECT ChildPtr AS ChildPtrA FROM parent WHERE ParentPtr = @id) A
						LEFT JOIN (SELECT ChildPtr AS ChildPtrW, ParentPtr AS ParentPtrW FROM parent WHERE ParentPtr <> @id) B ON A.ChildPtrA = B.ChildPtrW
				) childLyst
				INNER JOIN person AS person_1 ON childLyst.ChildPtrA = person_1.keeNew
				LEFT JOIN person AS person_2 ON childLyst.ParentPtrW = person_2.keeNew
			ORDER BY
				ChildDateOfBirth`
		const children = await normSQLite.query(removeIndent(sql), { id: person.keeNew })
		if (children.length > 0) {
			const leftParentName = buildName(person)
			for (const child of children) {
				if (!child.ChildUUID) continue
				const childName = buildName({
					GivenName: child.ChildGivenName,
					MiddleName: child.ChildMiddleName,
					FamilyName: child.ChildFamilyName,
					SuffixName: child.ChildSuffixName,
					NickName: child.ChildNickName
				})
				const rightParentName = buildName({
					GivenName: child.ParentGivenName,
					MiddleName: child.ParentMiddleName,
					FamilyName: child.ParentFamilyName,
					SuffixName: child.ParentSuffixName,
					NickName: child.ParentNickName
				})
				const data = {
					parentId1: person.keeNew,
					parentUuid1: person.uuid,
					parentName1: leftParentName,
					parentSex1: person.GenderIsMale ? person.GenderIsMale.toLowerCase() === 'true' ? 'M' : 'F' : null,
					parentId2: child.ParentKee,
					parentUuid2: child.ParentUUID,
					parentName2: rightParentName,
					parentSex2: child.ParentGenderIsMale ? child.ParentGenderIsMale.toLowerCase() === 'true' ? 'M' : 'F' : null,
					childId: child.ChildKee,
					childUuid: child.ChildUUID,
					childName,
					childSex: child.ChildGenderIsMale ? child.ChildGenderIsMale.toLowerCase() === 'true' ? 'M' : 'F' : null
				}
				if (data.parentSex1 && !data.parentSex2) {
					console.log(`Left parent has sex ${data.parentSex1}`)
					if (data.parentSex1 === 'M') {
						data.parentSex2 = 'F'
					} else {
						data.parentSex2 = 'M'
					}
				}
				if (!data.parentSex1 && data.parentSex2) {
					console.log(`Right parent has sex ${data.parentSex1}`)
					if (data.parentSex2 === 'M') {
						data.parentSex1 = 'F'
					} else {
						data.parentSex1 = 'M'
					}
				}
				await normSQLite.insert(sqliteTables.children, data)
			}
		}
	}
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
	// Initialize objects
	for (const table of Object.keys(pgTables)) {
		await biolineageDb.createTable(pgTables[table])
	}
	await biolineageDb.createFunctions(pgFunctions)
	await biolineageDb.createTriggers(pgTriggers)
	await biolineageDb.createViews(pgViews)

	// Create initial users
	const clubside = uuidv4()
	await biolineageDb.insert('users', {
		id: clubside,
		email: 'clubsidedev@hotmail.com',
		password: await hashPassword('FuckSh!tC*nt69'),
		name: 'Chris Rowley',
		avatar: true,
		role: 'super'
	})
	const norm = uuidv4()
	await biolineageDb.insert('users', {
		id: norm,
		email: 'norman.eaddy@gmail.com',
		password: await hashPassword('temp-password-2026'),
		name: 'Norm Eaddy',
		role: 'super'
	})
	const charles = uuidv4()
	await biolineageDb.insert('users', {
		id: charles,
		email: 'visionarypragmatist@gmail.com',
		password: await hashPassword('temp-password-2026'),
		name: 'Charles Carroll',
		role: 'super'
	})

	// Create Geography-related tables
	const sovereignEntities = []
	const countries = JSON.parse(fs.readFileSync('countries-final.json'))
	for (const country of countries) {
		country.type = 'COUNTRY'
		country.iso31661 = JSON.stringify(country.iso31661)
		country.tlds = JSON.stringify(country.tlds)
		await biolineageDb.insert('sovereign_entities', country)
		sovereignEntities.push(country)
	}
	const subdivisions = []
	const subdivisionsData = JSON.parse(fs.readFileSync('subdivisions-final.json'))
	for (const subdivision of subdivisionsData) {
		subdivision.sovereignEntityId = subdivision.countryId
		subdivision.type = subdivision.iso31662.category
		subdivision.iso31662 = JSON.stringify(subdivision.iso31662)
		delete subdivision.countryId
		await biolineageDb.insert('subdivisions', subdivision)
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
		await biolineageDb.insert('administrative_divisions', data)
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
			await biolineageDb.insert('municipalities', data)
		}
	}

	// Create initial entity types
	const human = uuidv4()
	await biolineageDb.insert('entity_types', {
		id: human,
		key: 'human',
		label: 'Human',
		createdBy: clubside,
		modifiedBy: clubside
	})
	const equine = uuidv4()
	await biolineageDb.insert('entity_types', {
		id: equine,
		key: 'equine',
		label: 'Equine',
		createdBy: clubside,
		modifiedBy: clubside
	})

	// Create initial relationship types
	const parent = uuidv4()
	await biolineageDb.insert('relationship_types', {
		id: parent,
		type: 'parent',
		direction: 'forward',
		main: true,
		name: 'Parent',
		leftOutput: JSON.stringify({ male: 'Father', female: 'Mother', other: 'Parent' }),
		rightOutput: JSON.stringify({ male: 'Son', female: 'Daughter', other: 'Child' }),
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('relationship_types', {
		id: uuidv4(),
		type: 'parent',
		direction: 'forward',
		name: 'Adoptive Parent',
		leftOutput: JSON.stringify({ male: 'Adoptive Father', female: 'Adoptive Mother', other: 'Adoptive Parent' }),
		rightOutput: JSON.stringify({ male: 'Adopted Son', female: 'Adopted Daughter', other: 'Adopted Child' }),
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('relationship_types', {
		id: uuidv4(),
		type: 'parent',
		direction: 'forward',
		name: 'Foster Parent',
		leftOutput: JSON.stringify({ male: 'Foster Father', female: 'Foster Mother', other: 'Foster Parent' }),
		rightOutput: JSON.stringify({ male: 'Foster Son', female: 'Foster Daughter', other: 'Foster Child' }),
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('relationship_types', {
		id: uuidv4(),
		type: 'parent',
		direction: 'forward',
		name: 'Stepparent',
		leftOutput: JSON.stringify({ male: 'Stepfather', female: 'Stepmother', other: 'Stepparent' }),
		rightOutput: JSON.stringify({ male: 'Stepson', female: 'Stepdaughter', other: 'Stepchild' }),
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('relationship_types', {
		id: uuidv4(),
		type: 'parent',
		direction: 'forward',
		name: 'Guardian',
		leftOutput: JSON.stringify({ male: 'Guardian', female: 'Guardian', other: 'Guardian' }),
		rightOutput: JSON.stringify({ male: 'Ward', female: 'Ward', other: 'Ward' }),
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('relationship_types', {
		id: uuidv4(),
		type: 'partner',
		direction: 'parallel',
		main: true,
		name: 'Spouse',
		leftOutput: JSON.stringify({ male: 'Husband', female: 'Wife', other: 'Spouse' }),
		rightOutput: JSON.stringify({ male: 'Husband', female: 'Wife', other: 'Spouse' }),
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('relationship_types', {
		id: uuidv4(),
		type: 'partner',
		direction: 'parallel',
		name: 'Ex-spouse',
		leftOutput: JSON.stringify({ male: 'Ex-husband', female: 'Ex-wife', other: 'Ex-spouse' }),
		rightOutput: JSON.stringify({ male: 'Ex-husband', female: 'Ex-wife', other: 'Ex-spouse' }),
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('relationship_types', {
		id: uuidv4(),
		type: 'partner',
		direction: 'parallel',
		name: 'Partner',
		leftOutput: JSON.stringify({ male: 'Partner', female: 'Partner', other: 'Partner' }),
		rightOutput: JSON.stringify({ male: 'Partner', female: 'Partner', other: 'Partner' }),
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('relationship_types', {
		id: uuidv4(),
		type: 'partner',
		direction: 'parallel',
		name: 'Domestic Partner',
		leftOutput: JSON.stringify({ male: 'Domestic Partner', female: 'Domestic Partner', other: 'Domestic Partner' }),
		rightOutput: JSON.stringify({ male: 'Domestic Partner', female: 'Domestic Partner', other: 'Domestic Partner' }),
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('relationship_types', {
		id: uuidv4(),
		type: 'partner',
		direction: 'parallel',
		name: 'Civil Union Partner',
		leftOutput: JSON.stringify({ male: 'Civil Union Partner', female: 'Civil Union Partner', other: 'Civil Union Partner' }),
		rightOutput: JSON.stringify({ male: 'Civil Union Partner', female: 'Civil Union Partner', other: 'Civil Union Partner' }),
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('relationship_types', {
		id: uuidv4(),
		type: 'partner',
		direction: 'parallel',
		name: 'Common-law spouse',
		leftOutput: JSON.stringify({ male: 'Common-law husband', female: 'Common-law wife', other: 'Common-law spouse' }),
		rightOutput: JSON.stringify({ male: 'Common-law husband', female: 'Common-law wife', other: 'Common-law spouse' }),
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('relationship_types', {
		id: uuidv4(),
		type: 'other',
		direction: 'forward',
		name: 'Godparent',
		leftOutput: JSON.stringify({ male: 'Godfather', female: 'Godmother', other: 'Godparent' }),
		rightOutput: JSON.stringify({ male: 'Godson', female: 'Goddaughter', other: 'Godchild' }),
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('relationship_types', {
		id: uuidv4(),
		type: 'other',
		direction: 'forward',
		name: 'Household',
		leftOutput: JSON.stringify({ male: 'Head of Household', female: 'Head of Household', other: 'Head of Household' }),
		rightOutput: JSON.stringify({ male: 'Occupant', female: 'Occupant', other: 'Occupant' }),
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('relationship_types', {
		id: uuidv4(),
		type: 'other',
		direction: 'forward',
		name: 'Apprenticeship',
		leftOutput: JSON.stringify({ male: 'Master', female: 'Mistress', other: 'Master' }),
		rightOutput: JSON.stringify({ male: 'Apprentice', female: 'Apprentice', other: 'Apprentice' }),
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('relationship_types', {
		id: uuidv4(),
		type: 'other',
		direction: 'forward',
		name: 'Employment',
		leftOutput: JSON.stringify({ male: 'Employer', female: 'Employer', other: 'Employer' }),
		rightOutput: JSON.stringify({ male: 'Employee', female: 'Employee', other: 'Employee' }),
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('relationship_types', {
		id: uuidv4(),
		type: 'other',
		direction: 'forward',
		name: 'Enslavement',
		leftOutput: JSON.stringify({ male: 'Slaveholder', female: 'Slaveholder', other: 'Slaveholder' }),
		rightOutput: JSON.stringify({ male: 'Enslaved', female: 'Enslaved', other: 'Enslaved' }),
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('relationship_types', {
		id: uuidv4(),
		type: 'other',
		direction: 'parallel',
		name: 'Relative',
		leftOutput: JSON.stringify({ male: 'Relative', female: 'Relative', other: 'Relative' }),
		rightOutput: JSON.stringify({ male: 'Relative', female: 'Relative', other: 'Relative' }),
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('relationship_types', {
		id: uuidv4(),
		type: 'other',
		direction: 'parallel',
		name: 'Neighbor',
		leftOutput: JSON.stringify({ male: 'Neighbor', female: 'Neighbor', other: 'Neighbor' }),
		rightOutput: JSON.stringify({ male: 'Neighbor', female: 'Neighbor', other: 'Neighbor' }),
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('relationship_types', {
		id: uuidv4(),
		type: 'other',
		direction: 'forward',
		name: 'Mentor',
		leftOutput: JSON.stringify({ male: 'Mentor', female: 'Mentor', other: 'Mentor' }),
		rightOutput: JSON.stringify({ male: 'Mentee', female: 'Mentee', other: 'Mentee' }),
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('relationship_types', {
		id: uuidv4(),
		type: 'other',
		direction: 'forward',
		name: 'Caretaker',
		leftOutput: JSON.stringify({ male: 'Caretaker', female: 'Caretaker', other: 'Caretaker' }),
		rightOutput: JSON.stringify({ male: 'Dependent', female: 'Dependent', other: 'Dependent' }),
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('relationship_types', {
		id: uuidv4(),
		type: 'other',
		direction: 'forward',
		name: 'Landlord',
		leftOutput: JSON.stringify({ male: 'Landlord', female: 'Landlord', other: 'Landlord' }),
		rightOutput: JSON.stringify({ male: 'Tenant', female: 'Tenant', other: 'Tenant' }),
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('relationship_types', {
		id: uuidv4(),
		type: 'other',
		direction: 'forward',
		name: 'Liege',
		leftOutput: JSON.stringify({ male: 'Liege', female: 'Liege', other: 'Liege' }),
		rightOutput: JSON.stringify({ male: 'Vassal', female: 'Vassal', other: 'Vassal' }),
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('relationship_types', {
		id: uuidv4(),
		type: 'other',
		direction: 'forward',
		name: 'Lord',
		leftOutput: JSON.stringify({ male: 'Lord', female: 'Lord', other: 'Lord' }),
		rightOutput: JSON.stringify({ male: 'Subject', female: 'Subject', other: 'Subject' }),
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('relationship_types', {
		id: uuidv4(),
		type: 'other',
		direction: 'forward',
		name: 'Servitude',
		leftOutput: JSON.stringify({ male: 'Master', female: 'Mistress', other: 'Master' }),
		rightOutput: JSON.stringify({ male: 'Servant', female: 'Servant', other: 'Servant' }),
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('relationship_types', {
		id: uuidv4(),
		type: 'other',
		direction: 'forward',
		name: 'Knighthood',
		leftOutput: JSON.stringify({ male: 'Knight', female: 'Knight', other: 'Knight' }),
		rightOutput: JSON.stringify({ male: 'Squire', female: 'Squire', other: 'Squire' }),
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('relationship_types', {
		id: uuidv4(),
		type: 'other',
		direction: 'forward',
		name: 'Tutor',
		leftOutput: JSON.stringify({ male: 'Tutor', female: 'Tutor', other: 'Tutor' }),
		rightOutput: JSON.stringify({ male: 'Student', female: 'Student', other: 'Student' }),
		createdBy: clubside,
		modifiedBy: clubside
	})

	// Create initial trees
	const normTree = uuidv4()
	await biolineageDb.insert('trees', {
		id: normTree,
		ownerId: norm,
		entityTypeId: human,
		name: 'Norm',
		slug: 'norm',
		createdBy: norm,
		modifiedBy: norm
	})
	const charlesTree = uuidv4()
	await biolineageDb.insert('trees', {
		id: charlesTree,
		ownerId: charles,
		entityTypeId: human,
		name: 'Charles',
		slug: 'charles',
		createdBy: norm,
		modifiedBy: norm
	})
	const horseTree = uuidv4()
	await biolineageDb.insert('trees', {
		id: horseTree,
		ownerId: norm,
		entityTypeId: equine,
		name: 'Norm Horses',
		slug: 'norm-horses',
		createdBy: norm,
		modifiedBy: norm
	})

	const used = []
	const people = await normSQLite.query('SELECT * FROM person')
	const horses = await normSQLite.query('SELECT * FROM person WHERE FamilyName LIKE \'%hors%\';')
	for (const horse of horses) {
		const id = uuidv4()
		const nameParts = []
		if (horse.FamilyName) nameParts.push(horse.FamilyName)
		if (horse.GivenName) nameParts.push(horse.GivenName)
		const nameId = uuidv4()
		await biolineageDb.insert('entity_names', {
			id: nameId,
			treeId: horseTree,
			entityId: id,
			nameType: 'Ingestion',
			givenName: horse.GivenName,
			middleName: horse.MiddleName,
			familyName: horse.FamilyName,
			suffixName: horse.SuffixName,
			nickName: horse.NickName,
			displayName: nameParts.length > 0 ? nameParts.join(' ') : 'Unknown',
			createdBy: norm,
			modifiedBy: norm
		})
		await biolineageDb.insert('entities', {
			id,
			treeId: horseTree,
			canonicalNameId: nameId,
			displayName: nameParts.length > 0 ? nameParts.join(' ') : 'Unknown',
			familyName: horse.FamilyName,
			searchName: buildSearchName(horse),
			sex: horse.GenderIsMale ? horse.GenderIsMale.toLowerCase() === 'true' ? 'M' : 'F' : null,
			createdBy: norm,
			modifiedBy: norm
		})
		await normSQLite.execute('UPDATE person SET uuid = @uuid WHERE keeNew = @id', { uuid: id, id: horse.keeNew })
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
		const nameId = uuidv4()
		await biolineageDb.insert('entity_names', {
			id: nameId,
			treeId: charlesTree,
			entityId: id,
			nameType: 'Ingestion',
			givenName: person.GivenName,
			middleName: person.MiddleName,
			familyName: person.FamilyName,
			suffixName: person.SuffixName,
			nickName: person.NickName,
			displayName: nameParts.length > 0 ? nameParts.join(' ') : 'Unknown',
			createdBy: charles,
			modifiedBy: charles
		})
		await biolineageDb.insert('entities', {
			id,
			treeId: charlesTree,
			canonicalNameId: nameId,
			displayName: nameParts.length > 0 ? nameParts.join(' ') : 'Unknown',
			familyName: person.FamilyName,
			searchName: buildSearchName(person),
			sex: person.GenderIsMale ? person.GenderIsMale.toLowerCase() === 'true' ? 'M' : 'F' : null,
			createdBy: charles,
			modifiedBy: charles
		})
		await normSQLite.execute('UPDATE person SET uuid = @uuid WHERE keeNew = @id', { uuid: id, id: row.keeNew })
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
			const nameId = uuidv4()
			await biolineageDb.insert('entity_names', {
				id: nameId,
				treeId: normTree,
				entityId: id,
				nameType: 'Ingestion',
				givenName: row.GivenName,
				middleName: row.MiddleName,
				familyName: row.FamilyName,
				suffixName: row.SuffixName,
				nickName: row.NickName,
				displayName: nameParts.length > 0 ? nameParts.join(' ') : 'Unknown',
				createdBy: norm,
				modifiedBy: norm
			})
			await biolineageDb.insert('entities', {
				id,
				treeId: normTree,
				canonicalNameId: nameId,
				displayName: nameParts.length > 0 ? nameParts.join(' ') : 'Unknown',
				familyName: row.FamilyName,
				searchName: buildSearchName(row),
				sex: row.GenderIsMale ? row.GenderIsMale.toLowerCase() === 'true' ? 'M' : 'F' : null,
				createdBy: norm,
				modifiedBy: norm
			})
			await normSQLite.execute('UPDATE person SET uuid = @uuid WHERE keeNew = @id', { uuid: id, id: row.keeNew })
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
		await biolineageDb.insert('places', data)
		data.ogName = place.ogName
		data.ogCountry = place.ogCountry
		data.ogRegion = place.ogRegion
		data.ogCity = place.ogCity
		places.push(data)
	}
	const personData = await normSQLite.query('SELECT * FROM person')
	const entities = await biolineageDb.query('SELECT * FROM entities')
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
			await biolineageDb.insert('events', data)
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
			await biolineageDb.insert('events', data)
		}
	}
	await transformRelationshipsAndGender(parent)
}

async function resetPg() {
	console.log('Resetting biolineage database:')
	let sql

	// Views
	console.log('  Dropping views...')
	sql = `
    DO $$
    DECLARE r RECORD;
    BEGIN
        FOR r IN (
            SELECT schemaname, viewname
            FROM pg_views
            WHERE schemaname = 'public'
        )
        LOOP
            EXECUTE 'DROP VIEW IF EXISTS public.' || quote_ident(r.viewname) || ' CASCADE';
        END LOOP;
    END$$;`
	await biolineageDb.run(sql)

	// Materialized Views
	console.log('  Dropping materialized views...')
	sql = `
    DO $$
    DECLARE r RECORD;
    BEGIN
        FOR r IN (
            SELECT schemaname, matviewname
            FROM pg_matviews
            WHERE schemaname = 'public'
        )
        LOOP
            EXECUTE 'DROP MATERIALIZED VIEW IF EXISTS public.' || quote_ident(r.matviewname) || ' CASCADE';
        END LOOP;
    END$$;`
	await biolineageDb.run(sql)

	// Functions
	console.log('  Dropping functions...')
	sql = `
    DO $$
	DECLARE r RECORD;
	BEGIN
		FOR r IN (
			SELECT n.nspname AS schema,
				p.proname AS name,
				pg_get_function_identity_arguments(p.oid) AS args
			FROM pg_proc p
			JOIN pg_namespace n ON p.pronamespace = n.oid
			WHERE n.nspname = 'public'
			AND NOT EXISTS (
				SELECT 1
				FROM pg_depend d
				WHERE d.objid = p.oid
					AND d.deptype = 'e'   -- extension-owned
			)
		)
		LOOP
			EXECUTE 'DROP FUNCTION IF EXISTS public.' ||
					quote_ident(r.name) || '(' || r.args || ') CASCADE';
		END LOOP;
	END$$;`
	await biolineageDb.run(sql)

	// Triggers
	console.log('  Dropping triggers...')
	sql = `
    DO $$
    DECLARE r RECORD;
    BEGIN
        FOR r IN (
            SELECT event_object_table AS table_name,
                   trigger_name
            FROM information_schema.triggers
            WHERE trigger_schema = 'public'
        )
        LOOP
            EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.trigger_name) ||
                    ' ON public.' || quote_ident(r.table_name) || ' CASCADE';
        END LOOP;
    END$$;`
	await biolineageDb.run(sql)

	// Foreign Keys
	console.log('  Dropping foreign keys...')
	sql = `
    DO $$
	DECLARE r RECORD;
	BEGIN
		FOR r IN (
			SELECT conname,
				conrelid::regclass::text AS table_name
			FROM pg_constraint
			WHERE contype = 'f'
			AND connamespace = 'public'::regnamespace
		)
		LOOP
			EXECUTE 'ALTER TABLE public.' || quote_ident(r.table_name) ||
					' DROP CONSTRAINT ' || quote_ident(r.conname) || ';';
		END LOOP;
	END$$;`
	await biolineageDb.run(sql)

	// Tables
	console.log('  Dropping tables...')
	sql = `
    DO $$
    DECLARE r RECORD;
    BEGIN
        FOR r IN (
            SELECT tablename
            FROM pg_tables
            WHERE schemaname = 'public'
        )
        LOOP
            EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
    END$$;`
	await biolineageDb.run(sql)

	// Sequences
	console.log('  Dropping sequences...')
	sql = `
    DO $$
    DECLARE r RECORD;
    BEGIN
        FOR r IN (
            SELECT sequence_name
            FROM information_schema.sequences
            WHERE sequence_schema = 'public'
        )
        LOOP
            EXECUTE 'DROP SEQUENCE IF EXISTS public.' || quote_ident(r.sequence_name) || ' CASCADE';
        END LOOP;
    END$$;`
	await biolineageDb.run(sql)
}

async function run() {
	await resetPg()
	await initPg()
	await biolineageDb.close()
}

async function transformRelationshipsAndGender(parentId) {
	await buildSQLiteChildren()
	const children = await normSQLite.query('SELECT * FROM children')
	await biolineageDb.begin()
	try {
		for (const child of children) {
			const childEntity = await biolineageDb.get('select tree_id, created_by from entities where id = $1', [child.childUuid])
			const treeId = childEntity.treeId
			const createdBy = childEntity.createdBy

			let relationshipRow = {
				id: uuidv4(),
				treeId,
				entityId: child.parentUuid1,
				relatedEntityId: child.childUuid,
				relationshipTypeId: parentId,
				createdBy,
				modifiedBy: createdBy
			}

			const exists = await biolineageDb.get(
				`SELECT 1 FROM relationships
				WHERE tree_id = $1
					AND entity_id = $2
					AND related_entity_id = $3
					AND relationship_type_id = $4`,
				[
					relationshipRow.treeId,
					relationshipRow.entityId,
					relationshipRow.relatedEntityId,
					relationshipRow.relationshipTypeId
				]
			)

			if (!exists) {
				await biolineageDb.insert('relationships', relationshipRow)
				await biolineageDb.update('entities', { sex: child.parentSex1 }, { id: child.parentUuid1 })
			}

			if (child.parentUuid2) {
				relationshipRow = {
					id: uuidv4(),
					treeId,
					entityId: child.parentUuid2,
					relatedEntityId: child.childUuid,
					relationshipTypeId: parentId,
					createdBy,
					modifiedBy: createdBy
				}

				const exists = await biolineageDb.get(
					`SELECT 1 FROM relationships
					WHERE tree_id = $1
						AND entity_id = $2
						AND related_entity_id = $3
						AND relationship_type_id = $4`,
					[
						relationshipRow.treeId,
						relationshipRow.entityId,
						relationshipRow.relatedEntityId,
						relationshipRow.relationshipTypeId
					]
				)

				if (!exists) {
					await biolineageDb.insert('relationships', relationshipRow)
					await biolineageDb.update('entities', { sex: child.parentSex2 }, { id: child.parentUuid2 })
				}
			}
		}
		await biolineageDb.commit()
	} catch (error) {
		await biolineageDb.rollback()
		throw error
	}
}

run()
