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

const buildName = (data) => {
	const namePartCodes = [
		'PrefixTitle', 'Primary', 'Moniker', 'Secondary', 'Middle', 'Familiar',
		'Religious', 'Geographic', 'Family', 'Maiden', 'Patronymic',
		'Matronymic', 'Occupational', 'Characteristic', 'Postnom',
		'Particle', 'RootName'
	]

	const displayNamePartCodes = ['PrefixTitle', 'Primary', 'Family', 'Particle']

	const searchNamePartCodes = [
		'PrefixTitle', 'Primary', 'Moniker', 'Secondary', 'Middle', 'Familiar',
		'Religious', 'Geographic', 'Family', 'Maiden', 'Patronymic',
		'Matronymic', 'Occupational', 'Characteristic', 'Postnom',
		'Particle', 'RootName', 'SuffixTitle'
	]

	const ignores = ['Test  horse', 'Test article 13', 'Test horse']
	const familiars = ['Jimmie', 'Tony']
	const prefixTitles = ['Capt.']
	const suffixTitles = ['MD', 'Ph.D.', 'Ed.D.', 'Jr.', 'Jr. or II', 'Jr.?', 'Sr.', 'Sr.?']
	const particles = ['II', 'III', '2B']
	const patronymics = ['Son of Abraham', 'son of Johannes']
	const matronymics = ['dau of Johannes']

	const nameParts = {}

	// Primary fields
	if (data.GivenName) nameParts.Primary = data.GivenName
	if (data.MiddleName) nameParts.Middle = data.MiddleName
	if (data.FamilyName) nameParts.Family = data.FamilyName
	if (data.NickName) {
		if (data.NickName !== 'This is edited data.') {
			if (data.NickName === 'blau gen 2' || data.NickName === 'blay gen 2') {
				nameParts.RootName = 'Blau'
			} else {
				nameParts.Moniker = data.NickName.replaceAll('"', '')
			}
		}
	}

	// SuffixName classification
	const sfx = data.SuffixName

	if (sfx && !ignores.includes(sfx)) {
		if (familiars.includes(sfx)) nameParts.Familiar = sfx
		else if (prefixTitles.includes(sfx)) nameParts.PrefixTitle = sfx
		else if (suffixTitles.includes(sfx)) nameParts.SuffixTitle = sfx
		else if (particles.includes(sfx)) nameParts.Particle = sfx
		else if (patronymics.includes(sfx)) nameParts.Patronymic = sfx
		else if (matronymics.includes(sfx)) nameParts.Matronymic = sfx
	}

	// Build fullName
	const parts = []
	for (const code of namePartCodes) {
		if (nameParts[code]) {
			if (code === 'Moniker') {
				parts.push(`"${nameParts[code]}"`)
			} else if (code === 'RootName') {
				parts.push(`[root: ${nameParts[code]}]`)
			} else {
				parts.push(nameParts[code])
			}
		}
	}

	let fullName = parts.join(' ')
	if (nameParts.SuffixTitle) fullName += `, ${nameParts.SuffixTitle}`

	// Build displayName
	const displayParts = []
	for (const code of displayNamePartCodes) {
		if (nameParts[code]) displayParts.push(nameParts[code])
	}

	let displayName = displayParts.join(' ')
	if (nameParts.SuffixTitle) displayName += `, ${nameParts.SuffixTitle}`
	nameParts.Display = displayName

	// Build searchName
	const searchParts = []
	for (const code of searchNamePartCodes) {
		if (nameParts[code]) searchParts.push(nameParts[code])
	}

	let searchName = searchParts.join(' ')
	const cleaned = searchName.trim().toLowerCase().replace(/[^\w\s]/g, '')
	const cleanedParts = cleaned.split(/\s+/)
	searchName = [...new Set(cleanedParts)].join(' ')

	return {
		fullName,
		displayName,
		familyName: nameParts.Family || null,
		searchName,
		nameParts
	}
}

function mapName(data) {
	const parts = []
	if (data.GivenName) parts.push(data.GivenName)
	if (data.MiddleName) parts.push(data.MiddleName)
	if (data.FamilyName) parts.push(data.FamilyName)
	let name = parts.join(' ')
	if (data.SuffixName) name = `${name}, ${data.SuffixName}`
	if (data.NickName) name = `${name} (${data.NickName})`
	return name
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
			const leftParentName = mapName(person)
			for (const child of children) {
				if (!child.ChildUUID) continue
				const childName = mapName({
					GivenName: child.ChildGivenName,
					MiddleName: child.ChildMiddleName,
					FamilyName: child.ChildFamilyName,
					SuffixName: child.ChildSuffixName,
					NickName: child.ChildNickName
				})
				const rightParentName = mapName({
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
					parentSex1: person.GenderIsMale ? person.GenderIsMale.toLowerCase() === 'true' ? 'Male' : 'Female' : null,
					parentId2: child.ParentKee,
					parentUuid2: child.ParentUUID,
					parentName2: rightParentName,
					parentSex2: child.ParentGenderIsMale ? child.ParentGenderIsMale.toLowerCase() === 'true' ? 'Male' : 'Female' : null,
					childId: child.ChildKee,
					childUuid: child.ChildUUID,
					childName,
					childSex: child.ChildGenderIsMale ? child.ChildGenderIsMale.toLowerCase() === 'true' ? 'Male' : 'Female' : null
				}
				if (data.parentSex1 && !data.parentSex2) {
					console.log(`Left parent has sex ${data.parentSex1}`)
					if (data.parentSex1 === 'Male') {
						data.parentSex2 = 'Female'
					} else {
						data.parentSex2 = 'Male'
					}
				}
				if (!data.parentSex1 && data.parentSex2) {
					console.log(`Right parent has sex ${data.parentSex1}`)
					if (data.parentSex2 === 'Male') {
						data.parentSex1 = 'Female'
					} else {
						data.parentSex1 = 'Male'
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
	const clubside = '3c6b9263-0452-4163-a4d3-237d114cb591'
	await biolineageDb.insert('users', {
		id: clubside,
		email: 'clubsidedev@hotmail.com',
		password: await hashPassword('FuckSh!tC*nt69'),
		name: 'Chris Rowley',
		avatar: true,
		role: 'super'
	})
	const norm = 'fedb5da9-af86-484d-be57-552a13869de2'
	await biolineageDb.insert('users', {
		id: norm,
		email: 'norman.eaddy@gmail.com',
		password: await hashPassword('temp-password-2026'),
		name: 'Norm Eaddy',
		role: 'super'
	})
	const charles = 'fbca8b6b-83dc-4b5f-b8b1-a820077476b4'
	await biolineageDb.insert('users', {
		id: charles,
		email: 'visionarypragmatist@gmail.com',
		password: await hashPassword('temp-password-2026'),
		name: 'Charles Carroll',
		role: 'super'
	})

	// Create Geography-related tables
	await biolineageDb.begin()
	try {
		const sovereignEntities = await normSQLite.query('select * from sovereign_entities')
		for (const sovereignEnity of sovereignEntities) {
			await biolineageDb.insert('sovereign_entities', sovereignEnity)
		}
		await biolineageDb.commit()
	} catch (error) {
		await biolineageDb.rollback()
		console.log('FAILED TO INSERT sovereign_entities')
		process.exit()
	}
	await biolineageDb.begin()
	try {
		const subdivisions = await normSQLite.query('select * from subdivisions')
		for (const subdivision of subdivisions) {
			await biolineageDb.insert('subdivisions', subdivision)
		}
		await biolineageDb.commit()
	} catch (error) {
		await biolineageDb.rollback()
		console.log('FAILED TO INSERT subdivisions')
		process.exit()
	}
	await biolineageDb.begin()
	try {
		const administrativeDivisions = await normSQLite.query('select * from administrative_divisions')
		for (const administrativeDivision of administrativeDivisions) {
			await biolineageDb.insert('administrative_divisions', administrativeDivision)
		}
		await biolineageDb.commit()
	} catch (error) {
		await biolineageDb.rollback()
		console.log('FAILED TO INSERT administrative_divisions')
		process.exit()
	}
	await biolineageDb.begin()
	try {
		const municipalities = await normSQLite.query('select * from municipalities')
		for (const municipality of municipalities) {
			await biolineageDb.insert('municipalities', municipality)
		}
		await biolineageDb.commit()
	} catch (error) {
		await biolineageDb.rollback()
		console.log('FAILED TO INSERT municipalities')
		process.exit()
	}

	// create initial entity_name_parts
	await biolineageDb.insert('entity_name_parts', {
		id: uuidv4(),
		code: 'Display',
		slug: 'display',
		label: 'Display',
		surface: true,
		required: true,
		placeholder: 'ex. Mike Jones',
		description: 'The main name shown in trees, lists, search results, and relationship panels. This should be the name most commonly associated with the entity.',
		width: '100%',
		sort: 1,
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('entity_name_parts', {
		id: uuidv4(),
		code: 'PrefixTitle',
		slug: 'prefix-title',
		label: 'Title (Prefix)',
		surface: true,
		placeholder: 'ex. Dr.',
		description: 'Honorifics, ranks, or positions that appear <em>before</em> the name (e.g., Dr., Rev., Colonel, Count, Haji).',
		width: '14ch',
		sort: 2,
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('entity_name_parts', {
		id: uuidv4(),
		code: 'Primary',
		slug: 'primary',
		label: 'Given',
		surface: true,
		placeholder: 'ex. Michael',
		description: 'The primary given name used to identify the entity.',
		width: '20ch',
		sort: 3,
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('entity_name_parts', {
		id: uuidv4(),
		code: 'Moniker',
		slug: 'moniker',
		label: 'Nickname',
		surface: true,
		placeholder: 'ex. Buddy',
		format: '"{v}"',
		description: 'An informal or familiar name used socially or colloquially.',
		width: '20ch',
		sort: 4,
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('entity_name_parts', {
		id: uuidv4(),
		code: 'Secondary',
		slug: 'secondary',
		label: 'Additional Given',
		placeholder: 'ex. Otto',
		description: 'A secondary given name that is not the primary name.',
		width: '20ch',
		sort: 5,
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('entity_name_parts', {
		id: uuidv4(),
		code: 'Middle',
		slug: 'middle',
		label: 'Middle',
		surface: true,
		placeholder: 'ex. Montgomery',
		description: 'A name placed between given and family names in cultures that use middle names.',
		width: '20ch',
		sort: 6,
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('entity_name_parts', {
		id: uuidv4(),
		code: 'Familiar',
		slug: 'familiar',
		label: 'Familiar',
		placeholder: 'ex. Mike',
		description: 'A familiar or shortened form of a given name (e.g., Mike for Michael).',
		width: '20ch',
		sort: 7,
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('entity_name_parts', {
		id: uuidv4(),
		code: 'Religious',
		slug: 'religious',
		label: 'Religious',
		placeholder: 'ex. Luther',
		description: 'A name given or adopted for religious purposes.',
		width: '20ch',
		sort: 8,
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('entity_name_parts', {
		id: uuidv4(),
		code: 'Geographic',
		slug: 'geographic',
		label: 'Geographic',
		surface: true,
		placeholder: 'ex. van der',
		description: 'A name part derived from geography or place association (e.g., van, von, de, del, di, la).',
		width: '14ch',
		sort: 9,
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('entity_name_parts', {
		id: uuidv4(),
		code: 'Family',
		slug: 'family',
		label: 'Family',
		surface: true,
		placeholder: 'ex. Jones',
		description: 'A surname or clan name identifying family or lineage.',
		width: '20ch',
		sort: 10,
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('entity_name_parts', {
		id: uuidv4(),
		code: 'Maiden',
		slug: 'maiden',
		label: 'Maiden',
		placeholder: 'ex. Smith',
		format: '(formerly {v})',
		description: 'An entity\'s original family name prior to adopting a new surname (commonly at marriage).',
		width: '20ch',
		sort: 11,
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('entity_name_parts', {
		id: uuidv4(),
		code: 'Patronymic',
		slug: 'patronymic',
		label: 'Patronymic',
		placeholder: 'ex. Abrahams',
		description: 'A name derived from a father or paternal ancestor (e.g., Abrahams meaning "son of Abraham").',
		width: '20ch',
		sort: 12,
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('entity_name_parts', {
		id: uuidv4(),
		code: 'Matronymic',
		slug: 'matronymic',
		label: 'Matronymic',
		placeholder: 'ex. Mariadottir',
		description: 'A name derived from a mother or maternal ancestor.',
		width: '20ch',
		sort: 13,
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('entity_name_parts', {
		id: uuidv4(),
		code: 'Occupational',
		slug: 'occupational',
		label: 'Occupational',
		placeholder: 'ex. Smith',
		description: 'A name derived from an occupation (e.g., Smith, Miller, Cooper).',
		width: '14ch',
		sort: 14,
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('entity_name_parts', {
		id: uuidv4(),
		code: 'Characteristic',
		slug: 'characteristic',
		label: 'Characteristic',
		placeholder: 'ex. the Elder',
		description: 'A name derived from a trait or descriptor (e.g., the Elder, the Silent).',
		width: '20ch',
		sort: 15,
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('entity_name_parts', {
		id: uuidv4(),
		code: 'Postnom',
		slug: 'postnom',
		label: 'Postnom',
		placeholder: 'ex. Kabila',
		description: 'A legally mandated name part used in Congo Free State / Belgian Congo / Congo / Democratic Republic of Congo.',
		width: '14ch',
		sort: 16,
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('entity_name_parts', {
		id: uuidv4(),
		code: 'Particle',
		slug: 'particle',
		label: 'Particle',
		surface: true,
		placeholder: 'ex. III',
		description: 'A post-name or relational qualifier such as ordinals (III), generational markers (Jr., Sr.), descriptive epithets (the Elder, the Younger), or descendancy markers (ben, ibn, bat) when they follow the main name.',
		width: '14ch',
		sort: 17,
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('entity_name_parts', {
		id: uuidv4(),
		code: 'RootName',
		slug: 'root-name',
		label: 'Root',
		placeholder: 'ex. Wilk',
		description: 'The root of a name part, distinct from prefixes or suffixes (e.g., Wilk is the root of Wilkówna).',
		width: '14ch',
		sort: 18,
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('entity_name_parts', {
		id: uuidv4(),
		code: 'SuffixTitle',
		slug: 'suffix-title',
		label: 'Title (Suffix)',
		surface: true,
		placeholder: 'ex. PhD',
		format: ', {v}',
		description: 'Titles, degrees, or credentials that appear <em>after</em> the name (e.g., PhD, MD, Esq.).',
		width: '14ch',
		sort: 19,
		createdBy: clubside,
		modifiedBy: clubside
	})

	// Create initial entity types
	const human = uuidv4()
	await biolineageDb.insert('entity_types', {
		id: human,
		key: 'human',
		label: 'Person',
		createdBy: clubside,
		modifiedBy: clubside
	})
	const equine = uuidv4()
	await biolineageDb.insert('entity_types', {
		id: equine,
		key: 'equine',
		label: 'Horse',
		createdBy: clubside,
		modifiedBy: clubside
	})

	// Create initial fact types
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Adoption',
		name: 'Adoption',
		description: "A fact of a person's adoption. In the context of a parent-child relationship, it describes a fact of the adoption of a child by a parent.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'AdoptiveParent',
		name: 'Adoptive Parent',
		description: 'A fact about an adoptive relationship between a parent an a child.',
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'AdultChristening',
		name: 'Adult Christening',
		description: "A fact of a person's christening as an adult.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Amnesty',
		name: 'Amnesty',
		description: "A fact of a person's amnesty.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'AncestralHall',
		name: 'Ancestral Hall',
		description: "A fact of a person's ancestral hall. An ancestral hall refers to a location where the early ancestors of the person originated. It may also refer to the name of an early ancestor. Family clans are often distinguished one from another by the ancestral hall. Clans that cannot prove direct relationships to other clans with the same surname can assume a direct relationship if they share the same ancestral hall.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'AncestralPoem',
		name: 'Ancestral Poem',
		description: "A fact of a person's ancestral poem. An ancestral poem (or generation poem) is composed of the \"generation characters\" that are to be used when choosing names for the members of different generations of an extended family. Ancestral poems are prominent in Asian countries, particularly China.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Annulment',
		name: 'Annulment',
		description: 'The fact of an annulment of a marriage.',
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Apprenticeship',
		name: 'Apprenticeship',
		description: "A fact of a person's apprenticeship.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Arrest',
		name: 'Arrest',
		description: "A fact of a person's arrest.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Baptism',
		name: 'Baptism',
		description: "A fact of a person's baptism.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'BarMitzvah',
		name: 'Bar Mitzvah',
		description: "A fact of a person's bar mitzvah.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'BatMitzvah',
		name: 'Bat Mitzvah',
		description: "A fact of a person's bat mitzvah.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'BiologicalParent',
		name: 'Biological Parent',
		description: 'A fact the biological relationship between a parent and a child.',
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Birth',
		name: 'Birth',
		description: "A fact of a person's birth.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'BirthNotice',
		name: 'BirthNotice',
		description: "A fact of a person's birth notice, such as posted in a newspaper or other publishing medium.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Blessing',
		name: 'Blessing',
		description: 'A fact of an official blessing received by a person, such as at the hands of a clergy member or at another religious rite.',
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Branch',
		name: 'Branch',
		description: "A fact of a person's branch within an extended clan.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Burial',
		name: 'Burial',
		description: "A fact of the burial of person's body after death.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Caste',
		name: 'Caste',
		description: "A fact of a person's caste.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Census',
		name: 'Census',
		description: "A fact of a person's participation in a census.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'ChildOrder',
		name: 'ChildOrder',
		description: 'A fact about the child order between a parent and a child.',
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Christening',
		name: 'Christening',
		description: "A fact of a person's christening *at birth*. Note: use `AdultChristening` for the christening as an adult.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Circumcision',
		name: 'Circumcision',
		description: "A fact of a person's circumcision.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'CivilUnion',
		name: 'CivilUnion',
		description: 'The fact of a civil union.',
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Clan',
		name: 'Clan',
		description: "A fact of a person's clan.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'CommonLawMarriage',
		name: 'Common Law Marriage',
		description: 'The fact of a marriage by common law.',
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Confirmation',
		name: 'Confirmation',
		description: "A fact of a person's confirmation (or other rite of initiation) in a church or religion.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Court',
		name: 'Court',
		description: 'A fact of the appearance of a person in a court proceeding.',
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Cremation',
		name: 'Cremation',
		description: "A fact of the cremation of person's body after death.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Death',
		name: 'Death',
		description: 'A fact of the death of a person.',
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Divorce',
		name: 'Divorce',
		description: 'The fact of a divorce of a couple.',
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'DivorceFiling',
		name: 'Divorce Filing',
		description: 'The fact of a filing for divorce.',
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'DomesticPartnership',
		name: 'Domestic Partnership',
		description: 'The fact of a domestic partnership.',
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Education',
		name: 'Education',
		description: 'A fact of an education of a person.',
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'EducationEnrollment',
		name: 'Education Enrollment',
		description: "A fact of a person's enrollment in an educational program or institution.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Emigration',
		name: 'Emigration',
		description: 'A fact of the emigration of a person.',
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Engagement',
		name: 'Engagement',
		description: 'The fact of an engagement to be married.',
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'EnteringHeir',
		name: 'EnteringHeir',
		description: 'A fact about an entering heir relationship between a parent and a child. An entering heir is received from another parent as an "exiting heir" for designation of inheritance.',
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Ethnicity',
		name: 'Ethnicity',
		description: "A fact of a person's ethnicity or race.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Excommunication',
		name: 'Excommunication',
		description: "A fact of a person's excommunication from a church.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'ExitingHeir',
		name: 'Exiting Heir',
		description: 'A fact about an exiting heir relationship between a parent and a child. An exiting heir is given as an "entering heir" to another parent for designation of inheritance.',
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'FirstCommunion',
		name: 'First Communion',
		description: "A fact of a person's first communion in a church.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'FosterParent',
		name: 'Foster Parent',
		description: 'A fact about a foster relationship between a foster parent and a child.',
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Funeral',
		name: 'Funeral',
		description: "A fact of a person's funeral.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'GenderChange',
		name: 'Gender Change',
		description: "A fact of a person's gender change.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'GenerationNumber',
		name: 'Generation Number',
		description: "A fact of a person's generation number, indicating the number of generations the person is removed from a known \"first\" ancestor.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Graduation',
		name: 'Graduation',
		description: "A fact of a person's graduation from a scholastic institution.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'GuardianParent',
		name: 'Guardian Parent',
		description: 'A fact about a legal guardianship between a parent and a child.',
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Immigration',
		name: 'Immigration',
		description: "A fact of a person's immigration.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Imprisonment',
		name: 'Imprisonment',
		description: "A fact of a person's imprisonment.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Inquest',
		name: 'Inquest',
		description: 'A legal inquest. Inquests usually only occur when there’s something suspicious about the death. Inquests might in some instances lead to a murder investigation. Most people that die have a death certificate wherein a doctor indicates the cause of death and often indicates when the decedent was last seen by that physician; these require no inquest.',
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'LandTransaction',
		name: 'Land Transaction',
		description: 'A fact of a land transaction enacted by a person.',
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Language',
		name: 'Language',
		description: 'A fact of a language spoken by a person.',
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Living',
		name: 'Living',
		description: "A fact of a record of a person's living for a specific period. This is designed to include \"flourish\", defined to mean the time period in an adult's life where he was most productive, perhaps as a writer or member of the state assembly. It does not reflect the person's birth and death dates.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'MaritalStatus',
		name: 'Marital Status',
		description: "A fact of a person's marital status.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Marriage',
		name: 'Marriage',
		description: 'The fact of a marriage.',
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'MarriageBanns',
		name: 'Marriage Banns',
		description: 'The fact of a marriage banns.',
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'MarriageContract',
		name: 'Marriage Contract',
		description: 'The fact of a marriage contract.',
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'MarriageLicense',
		name: 'Marriage License',
		description: 'The fact of a marriage license.',
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'MarriageNotice',
		name: 'Marriage Notice',
		description: 'The fact of a marriage notice.',
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Medical',
		name: 'Medical',
		description: "A fact of a person's medical record, such as for an illness or hospital stay.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'MilitaryAward',
		name: 'Military Award',
		description: "A fact of a person's military award.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'MilitaryDischarge',
		name: 'Military Discharge',
		description: "A fact of a person's military discharge.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'MilitaryDraftRegistration',
		name: 'Military Draft Registration',
		description: "A fact of a person's registration for a military draft.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'MilitaryInduction',
		name: 'Military Induction',
		description: "A fact of a person's military induction.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'MilitaryService',
		name: 'MilitaryService',
		description: "A fact of a person's militray service.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Mission',
		name: 'Mission',
		description: "A fact of a person's church mission.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'MoveFrom',
		name: 'Move From',
		description: "A fact of a person's move (i.e. change of residence) from a location.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'MoveTo',
		name: 'Move To',
		description: "A fact of a person's move (i.e. change of residence) to a new location.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'MultipleBirth',
		name: 'Multiple Birth',
		description: 'A fact that a person was born as part of a multiple birth (e.g. twin, triplet, etc.)',
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'NationalId',
		name: 'National ID',
		description: "A fact of a person's national id (e.g. social security number).",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Nationality',
		name: 'Nationality',
		description: "A fact of a person's nationality.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Naturalization',
		name: 'Naturalization',
		description: "A fact of a person's naturalization (i.e. acquisition of citizenship and nationality).",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'NumberOfChildren',
		name: 'Number of Children',
		description: 'A fact of the number of children of a person or relationship.',
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'NumberOfMarriages',
		name: 'Number of Marriages',
		description: "A fact of a person's number of marriages.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Obituary',
		name: 'Obituary',
		description: "A fact of a person's obituary.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Occupation',
		name: 'Occupation',
		description: "A fact of a person's occupation or employment.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'OfficialPosition',
		name: 'Official Position',
		description: "A fact of a person's official (government) position.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Ordination',
		name: 'Ordination',
		description: "A fact of a person's ordination to a stewardship in a church.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Pardon',
		name: 'Pardon',
		description: "A fact of a person's legal pardon.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'PhysicalDescription',
		name: 'Physical Description',
		description: "A fact of a person's physical description.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Probate',
		name: 'Probate',
		description: "A fact of a receipt of probate of a person's property.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Property',
		name: 'Property',
		description: "A fact of a person's property or possessions.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Religion',
		name: 'Religion',
		description: "A fact of a person's religion.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Residence',
		name: 'Residence',
		description: "A fact of a person's residence.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Retirement',
		name: 'Retirement',
		description: "A fact of a person's retirement.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Separation',
		name: 'Separation',
		description: "A fact of a couple's separation.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'SociologicalParent',
		name: 'Sociological Parent',
		description: 'A fact about a sociological relationship between a parent and a child, but not definable in typical legal or biological term',
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'StepParent',
		name: 'Step Parent',
		description: 'A fact about the step relationship between a parent and a child.',
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Stillbirth',
		name: 'Stillbirth',
		description: "A fact of a person's stillbirth.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'TaxAssessment',
		name: 'Tax Assessment',
		description: "A fact of a person's tax assessment.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Visit',
		name: 'Visit',
		description: "A fact of a person's visit to a place different from the person's residence.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Will',
		name: 'Will',
		description: "A fact of a person's will.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: human,
		code: 'Yahrzeit',
		name: 'Yahrzeit',
		description: "A fact of a person's _yahrzeit_ date. A person's yahzeit is the anniversary of their death as measured by the Hebrew calendar.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: equine,
		code: 'Birth',
		name: 'Birth',
		description: "A fact of a equine's birth.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: equine,
		code: 'Burial',
		name: 'Burial',
		description: "A fact of the burial of equine's body after death.",
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('fact_types', {
		entityTypeId: equine,
		code: 'Death',
		name: 'Death',
		description: 'A fact of the death of an equine.',
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
		description: 'A recognized parent–child relationship representing the individuals who raised the child, regardless of biological origin.',
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
		description: 'A legal parent–child relationship established through adoption rather than biology.',
		leftOutput: JSON.stringify({ male: 'Adoptive Father', female: 'Adoptive Mother', other: 'Adoptive Parent' }),
		rightOutput: JSON.stringify({ male: 'Adopted Son', female: 'Adopted Daughter', other: 'Adopted Child' }),
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('relationship_types', {
		id: uuidv4(),
		type: 'parent',
		direction: 'forward',
		name: 'Biological Parent',
		description: 'A genetic parent–child relationship indicating biological lineage without implying active parenting or guardianship.',
		leftOutput: JSON.stringify({ male: 'Biological Father', female: 'Biological Mother', other: 'Biological Parent' }),
		rightOutput: JSON.stringify({ male: 'Adopted Son', female: 'Adopted Daughter', other: 'Adopted Child' }),
		createdBy: clubside,
		modifiedBy: clubside
	})
	await biolineageDb.insert('relationship_types', {
		id: uuidv4(),
		type: 'parent',
		direction: 'forward',
		name: 'Foster Parent',
		description: 'A temporary caregiving relationship where an adult provides state-authorized care for a child.',
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
		description: 'A relationship formed when a parent marries someone who is not the child’s biological parent.',
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
		description: 'A legally appointed caretaker responsible for the welfare of a ward.',
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
		description: 'A marital relationship recognized by law, ceremony, or tradition.',
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
		description: 'A former marital relationship dissolved through divorce or annulment.',
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
		description: 'A committed relationship without formal marriage requirements.',
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
		description: 'A household-sharing partnership recognized socially or legally.',
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
		description: 'A legally recognized partnership granting rights similar to marriage.',
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
		description: 'A marital relationship recognized through cohabitation and social acknowledgment rather than ceremony.',
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
		description: 'A ceremonial relationship where an adult sponsors a child’s religious or moral upbringing.',
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
		description: 'A relationship between a head of household and an occupant living under the same roof.',
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
		description: 'A vocational relationship where a master trains an apprentice.',
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
		description: 'A work relationship between employer and employee.',
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
		description: 'A historical relationship where a slaveholder exerts ownership and control over an enslaved person.',
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
		description: 'A non-specific familial relationship between two related individuals.',
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
		description: 'A proximity-based relationship between individuals living near one another.',
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
		description: 'A guidance relationship where a mentor provides instruction or support to a mentee.',
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
		description: 'A caregiving relationship where a caretaker supports a dependent.',
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
		description: 'A property relationship where a landlord leases space to a tenant.',
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
		description: 'A feudal relationship where a liege grants protection or land to a vassal.',
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
		description: 'A hierarchical relationship where a lord holds authority over a subject.',
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
		description: 'A service-based relationship where a master directs the labor of a servant.',
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
		description: 'A medieval relationship where a knight trains or oversees a squire.',
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
		description: 'An educational relationship where a tutor instructs a student.',
		leftOutput: JSON.stringify({ male: 'Tutor', female: 'Tutor', other: 'Tutor' }),
		rightOutput: JSON.stringify({ male: 'Student', female: 'Student', other: 'Student' }),
		createdBy: clubside,
		modifiedBy: clubside
	})

	const placeTypes = [
		{ name: 'Country', description: 'A national-level sovereign entity.' },
		{ name: 'State', description: 'A primary subdivision within a country.' },
		{ name: 'Province', description: 'A major regional subdivision within a country.' },
		{ name: 'Region', description: 'A broad geographical or administrative area.' },
		{ name: 'District', description: 'A mid-level administrative area within a region or state.' },
		{ name: 'County', description: 'A common mid-level administrative division.' },
		{ name: 'Municipality', description: 'A city, town, township, or local governing unit.' },
		{ name: 'Township', description: 'A local administrative or survey-based division.' },
		{ name: 'Commune', description: 'A local administrative unit common in parts of Europe and Africa.' },
		{ name: 'Canton', description: 'A regional administrative unit, especially in Switzerland.' },
		{ name: 'Prefecture', description: 'An administrative jurisdiction used in several countries.' },
		{ name: 'Ward', description: 'A subdivision of a city or municipality.' },
		{ name: 'Precinct', description: 'A voting, police, or administrative subdivision.' },

		// Settlements
		{ name: 'City', description: 'A large, incorporated urban settlement.' },
		{ name: 'Town', description: 'A mid-sized urban settlement.' },
		{ name: 'Village', description: 'A small settlement, typically rural.' },
		{ name: 'Hamlet', description: 'A very small settlement, often without its own government.' },
		{ name: 'Neighborhood', description: 'A defined area within a city or town.' },

		// Religious / Burial
		{ name: 'Church', description: 'A religious building or congregation location.' },
		{ name: 'Parish', description: 'A religious or civil administrative area.' },
		{ name: 'Churchyard', description: 'A burial or gathering area adjacent to a church.' },
		{ name: 'Cemetery', description: 'A designated burial ground.' },
		{ name: 'Burial Ground', description: 'A historical or informal burial site.' },
		{ name: 'Monastery', description: 'A religious community or complex.' },

		// Land / Property
		{ name: 'Farm', description: 'An agricultural property or homestead.' },
		{ name: 'Estate', description: 'A large property, manor, or plantation.' },
		{ name: 'Residence', description: 'A home, dwelling, or living place.' },

		// Infrastructure / Public
		{ name: 'Hospital', description: 'A medical facility providing care.' },
		{ name: 'School', description: 'An educational institution.' },
		{ name: 'School District', description: 'An administrative area for public schools.' },
		{ name: 'Workplace', description: 'A location where people are employed.' },
		{ name: 'Industrial Site', description: 'A factory, mill, foundry, or similar facility.' },
		{ name: 'Rail Station', description: 'A train station or railway stop.' },
		{ name: 'Port', description: 'A harbor or maritime facility.' },
		{ name: 'Military Base', description: 'A fort, camp, or military installation.' },

		// Historical / Special
		{ name: 'Historic Site', description: 'A location of historical significance.' }
	]
	for (const placeType of placeTypes) {
		await biolineageDb.insert('place_types', {
			id: uuidv4(),
			name: placeType.name,
			description: placeType.description,
			createdBy: clubside,
			modifiedBy: clubside
		})
	}

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
		const names = buildName(horse)
		const nameId = uuidv4()
		await biolineageDb.insert('entity_names', {
			id: nameId,
			treeId: horseTree,
			entityId: id,
			nameType: 'Ingestion',
			nameParts: JSON.stringify(names.nameParts),
			createdBy: norm,
			modifiedBy: norm
		})
		await biolineageDb.insert('entities', {
			id,
			treeId: horseTree,
			canonicalNameId: nameId,
			fullName: names.fullName,
			displayName: names.displayName,
			familyName: names.familyName,
			searchName: names.searchName,
			sex: horse.GenderIsMale ? horse.GenderIsMale.toLowerCase() === 'true' ? 'Male' : 'Female' : null,
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
		const names = buildName(person)
		const nameId = uuidv4()
		await biolineageDb.insert('entity_names', {
			id: nameId,
			treeId: charlesTree,
			entityId: id,
			nameType: 'Ingestion',
			nameParts: JSON.stringify(names.nameParts),
			createdBy: charles,
			modifiedBy: charles
		})
		await biolineageDb.insert('entities', {
			id,
			treeId: charlesTree,
			canonicalNameId: nameId,
			fullName: names.fullName,
			displayName: names.displayName,
			familyName: names.familyName,
			searchName: names.searchName,
			sex: person.GenderIsMale ? person.GenderIsMale.toLowerCase() === 'true' ? 'Male' : 'Female' : null,
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
			const names = buildName(row)
			const nameId = uuidv4()
			await biolineageDb.insert('entity_names', {
				id: nameId,
				treeId: normTree,
				entityId: id,
				nameType: 'Ingestion',
				nameParts: JSON.stringify(names.nameParts),
				createdBy: norm,
				modifiedBy: norm
			})
			await biolineageDb.insert('entities', {
				id,
				treeId: normTree,
				canonicalNameId: nameId,
				fullName: names.fullName,
				displayName: names.displayName,
				familyName: names.familyName,
				searchName: names.searchName,
				sex: row.GenderIsMale ? row.GenderIsMale.toLowerCase() === 'true' ? 'Male' : 'Female' : null,
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
		if (place.sovereignEntityId) {
			data.sovereignEntityId = place.sovereignEntityId
		} else {
			data.sovereignEntity = place.sovereignEntity
		}
		if (place.subdivisionId) {
			data.subdivisionId = place.subdivisionId
		} else {
			data.subdivision = place.subdivision
		}
		if (place.administrativeDivisionId) {
			data.administrativeDivisionId = place.administrativeDivisionId
		} else {
			data.administrativeDivision = place.administrativeDivision
		}
		if (place.municipalityId) {
			data.municipalityId = place.municipalityId
		} else {
			data.municipality = place.municipality
		}
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
	const entities = await biolineageDb.query('SELECT entities.*, trees.entity_type_id FROM entities join trees on trees.id = entities.tree_id')
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
				code: 'Birth',
				entityId: entity.id,
				role: 'Ingestion',
				epoch: 'AD',
				year: dateParts[0],
				month: dateParts[1],
				day: dateParts[2],
				placeId,
				createdBy: entity.createdBy,
				modifiedBy: entity.modifiedBy
			}
			await biolineageDb.insert('facts', data)
		}
		if (person.DateOfDeath) {
			const dateParts = person.DateOfDeath.split('-')
			const data = {
				id: uuidv4(),
				treeId: entity.treeId,
				code: 'Death',
				entityId: entity.id,
				role: 'Ingestion',
				epoch: 'AD',
				year: dateParts[0],
				month: dateParts[1],
				day: dateParts[2],
				createdBy: entity.createdBy,
				modifiedBy: entity.modifiedBy
			}
			await biolineageDb.insert('facts', data)
			if (person.BurialCemetary || person.BurialCountry || person.BurialState || person.BurialCity) {
				const d = new Date(dateParts[0], dateParts[1] - 1, dateParts[2])
				d.setDate(d.getDate() + 7)
				let placeId = null
				const place = places.find(lookup => lookup.ogName === person.BurialCemetary && lookup.ogCountry === person.BurialCountry && lookup.ogRegion === person.BurialState && lookup.ogCity === person.BurialCity)
				if (place) placeId = place.id
				const data = {
					id: uuidv4(),
					treeId: entity.treeId,
					code: 'Burial',
					entityId: entity.id,
					role: 'Ingestion',
					epoch: 'AD',
					year: d.getFullYear(),
					month: d.getMonth() + 1,
					day: d.getDate(),
					placeId,
					createdBy: entity.createdBy,
					modifiedBy: entity.modifiedBy
				}
				await biolineageDb.insert('facts', data)
			}
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
	console.log('Resetting...')
	await resetPg()
	console.log('Initializing...')
	await initPg()
	console.log('Closing up...')
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
		console.log('Committing transformRelationshipsAndGender...')
		await biolineageDb.commit()
	} catch (error) {
		await biolineageDb.rollback()
		throw error
	}
}

run()
