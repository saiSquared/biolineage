const { v4: uuidv4 } = require('uuid')
const { biolineageDb, entityNameParts, hashPassword, loadTrees } = require('../modules/globals')
const { slugify } = require('../modules/clubside-utils')

/**
 * @typedef {Object} BiolineageEntityNameData
 * @property {String} fullName - all name parts but Display joined
 * @property {String} displayName - canonical required input field display_name
 * @property {String|null} familyName - GEDCOM-X Family name part
 * @property {String} searchName - all name parts combined and de-duplicated for search
 * @property {Object} nameParts - all GEDCOM-X name parts plus extensions
 */

/**
 * @typedef {Object} BiolineageValidationError
 * @property {String} id - HTML Element id to set customValidity
 * @property {String} text - text to show for customValidity
 */

/**
 * @typedef {Object} BiolineageSetterResponse
 * @property {Boolean} ok - whether the setter was succesful
 * @property {String} [id] - id of new record or other client-side success information
 * @property {BiolineageValidationError} [validationError] - server-side validation error information for client to show
 */

/**
 * Build the necessary fields for entity_names and entities from form data
 * @param {Object} data - source data
 * @returns {BiolineageEntityNameData}
 */
const buildName = (data) => {
	const namePartCodes = [
		'PrefixTitle', 'Primary', 'Moniker', 'Secondary', 'Middle',
		'Religious', 'Geographic', 'Family', 'Maiden', 'Patronymic',
		'Matronymic', 'Occupational', 'Characteristic', 'Postnom',
		'Particle', 'RootName'
	]

	const searchNamePartCodes = [
		'Display', 'PrefixTitle', 'Primary', 'Moniker', 'Secondary', 'Middle', 'Familiar',
		'Religious', 'Geographic', 'Family', 'Maiden', 'Patronymic',
		'Matronymic', 'Occupational', 'Characteristic', 'Postnom',
		'Particle', 'RootName', 'SuffixTitle'
	]

	/** @type {BiolineageEntityNameParts} */
	const nameParts = {}

	for (const part of entityNameParts) {
		if (data[part.code]) nameParts[part.code] = data[part.code]
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
	if (fullName === '') fullName = nameParts.Display

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
		displayName: nameParts.Display,
		familyName: nameParts.Family || null,
		searchName,
		nameParts
	}
}

const isUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)

const massageNumber = (num) => {
	if (!num) return null
	if (typeof num === 'number') {
		if (num >= 0) {
			return num
		} else {
			return Math.abs(num)
		}
	}
	if (isNaN(Number(num))) return null
	return Number(num)
}

class Setters {
	async entityAdd(user, data) {
		console.log(data)
		const name = buildName(data)
		console.log(name)
		biolineageDb.begin()
		try {
			const id = uuidv4()
			const nameId = uuidv4()
			const nameData = {
				id: nameId,
				entityId: id,
				nameType: data.nameType,
				nameParts: name.nameParts,
				description: data.description,
				createdBy: user.userId,
				modifiedBy: user.userId
			}
			await biolineageDb.insert('entity_names', nameData)
			const entityData = {
				id,
				treeId: data.treeId,
				canonicalNameId: nameId,
				fullName: name.fullName,
				displayName: name.displayName,
				familyName: name.familyName,
				searchName: name.searchName,
				sex: data.sex,
				createdBy: user.userId,
				modifiedBy: user.userId
			}
			await biolineageDb.insert('entities', entityData)
			if (data.birthYear) {
				const factData = {
					id: uuidv4(),
					code: 'Birth',
					entityId: id,
					epoch: data.birthYear >= 0 ? 'AD' : 'BC',
					year: massageNumber(data.birthYear),
					month: massageNumber(data.birthMonth),
					day: massageNumber(data.birthDay),
					createdBy: user.userId,
					modifiedBy: user.userId
				}
				await biolineageDb.insert('facts', factData)
			}
			if (data.deathYear) {
				const factData = {
					id: uuidv4(),
					code: 'Death',
					entityId: id,
					epoch: data.birthYear >= 0 ? 'AD' : 'BC',
					year: massageNumber(data.deathYear),
					month: massageNumber(data.deathMonth),
					day: massageNumber(data.deathDay),
					createdBy: user.userId,
					modifiedBy: user.userId
				}
				await biolineageDb.insert('facts', factData)
			}
			biolineageDb.commit()
			return { ok: true, id }
		} catch (error) {
			biolineageDb.rollback()
			console.log('Failed to add entity', error)
			return { ok: false }
		}
	}

	/**
	 * Edit aor add entity fact
	 * @param {BiolineageSession} user - session user information
	 * @param {add|edit} mode - edit mode
	 * @param {BiolineageEntityFact} data - POSTed field data
	 * @returns {BiolineageSetterResponse}
	 */
	async entityFact(user, mode, fact) {
		// normalize to database format
		const numbers = ['year', 'month', 'day', 'hour', 'minute', 'second']
		const geographyFields = ['sovereignEntity', 'subdivision', 'administrativeDivision', 'municipality']

		for (const number of numbers) {
			if (isNaN(Number(fact[number]))) {
				return { ok: false, validationError: { id: number, text: 'Not a valid number' } }
			}
			fact[number] = Number(fact[number])
		}

		for (const geographyField of geographyFields) {
			if (fact[geographyField] === null) {
				fact[`${geographyField}Id`] = null
			} else {
				if (isUuid(fact[geographyField])) {
					fact[`${geographyField}Id`] = fact[geographyField]
					fact[geographyField] = null
				} else {
					fact[`${geographyField}Id`] = null
				}
			}
		}

		// validate geography
		if (fact.place === 'new') {
			if (fact.municipalityId) {
				if (fact.administrativeDivision || fact.subdivision || fact.sovereignEntity) {
					let id
					if (fact.administrativeDivision) id = 'administrative-division'
					else if (fact.subdivision) id = 'subdivision'
					else id = 'sovereign-entity'

					return { ok: false, validationError: { id, text: 'Mix of chosen and custom geography information' } }
				}

				if (fact.administrativeDivisionId && fact.subdivisionId && fact.sovereignEntityId) {
					const results = biolineageDb.get(
                    `select se.name
                     from municipalities m
                     join administrative_divisions ad on ad.id = m.administrative_division_id
                     join subdivisions s on s.id = m.subdivision_id
                     join sovereign_entities se on se.id = m.sovereign_entity_id
                     where m.id = $1`,
                    [fact.municipalityId]
					)
					if (results.length === 0) {
						return { ok: false, validationError: { id: 'municipality', text: 'The four geography fields must link' } }
					}
				} else if (fact.administrativeDivisionId && fact.subdivisionId) {
					const results = biolineageDb.get(
                    `select s.name
                     from municipalities m
                     join administrative_divisions ad on ad.id = m.administrative_division_id
                     join subdivisions s on s.id = m.subdivision_id
                     where m.id = $1`,
                    [fact.municipalityId]
					)
					if (results.length === 0) {
						return { ok: false, validationError: { id: 'municipality', text: 'The three geography fields must link' } }
					}
				} else if (fact.administrativeDivisionId) {
					const results = biolineageDb.get(
                    `select ad.name
                     from municipalities m
                     join administrative_divisions ad on ad.id = m.administrative_division_id
                     where m.id = $1`,
                    [fact.municipalityId]
					)
					if (results.length === 0) {
						return { ok: false, validationError: { id: 'municipality', text: 'Both geography fields must link' } }
					}
				}
			} else if (fact.administrativeDivisionId) {
				if (fact.subdivision || fact.sovereignEntity) {
					const id = fact.subdivision ? 'subdivision' : 'sovereign-entity'
					return { ok: false, validationError: { id, text: 'Mix of chosen and custom geography information' } }
				}

				if (fact.subdivisionId && fact.sovereignEntityId) {
					const results = biolineageDb.get(
                    `select se.name
                     from administrative_divisions ad
                     join subdivisions s on s.id = ad.subdivision_id
                     join sovereign_entities se on se.id = ad.sovereign_entity_id
                     where ad.id = $1`,
                    [fact.administrativeDivisionId]
					)
					if (results.length === 0) {
						return { ok: false, validationError: { id: 'administrative-division', text: 'The three geography fields must link' } }
					}
				} else if (fact.subdivisionId) {
					const results = biolineageDb.get(
                    `select s.name
                     from administrative_divisions ad
                     join subdivisions s on s.id = ad.subdivision_id
                     where ad.id = $1`,
                    [fact.administrativeDivisionId]
					)
					if (results.length === 0) {
						return { ok: false, validationError: { id: 'administrative-division', text: 'Both geography fields must link' } }
					}
				}
			} else if (fact.subdivisionId) {
				if (fact.sovereignEntity) {
					return { ok: false, validationError: { id: 'sovereign-entity', text: 'Mix of chosen and custom geography information' } }
				}

				if (fact.sovereignEntityId) {
					const results = biolineageDb.get(
                    `select se.name
                     from subdivisions s
                     join sovereign_entities se on se.id = s.sovereign_entity_id
                     where s.id = $1`,
                    [fact.subdivisionId]
					)
					if (results.length === 0) {
						return { ok: false, validationError: { id: 'subdivision', text: 'Both geography fields must link' } }
					}
				}
			}
		}

		console.log(fact)

		await biolineageDb.begin()
		try {
			let placeId = fact.placeId
			if (fact.place === 'new') {
				placeId = uuidv4()
				if (isUuid(fact.placeType)) {
					const placeTypeLookup = await biolineageDb.get('select name from place_types where id = $1', [fact.placeType])
					fact.placeTypeId = fact.placeType
					fact.placeType = placeTypeLookup.name
				} else {
					fact.placeTypeId = null
				}
				if (fact.municipalityId && !fact.administrativeDivisionId && !fact.subdivisionId && !fact.sovereignEntityId) {
					const rollup = await biolineageDb.get('select sovereign_entity_id, subdivision_id, administrative_division_id from municipalities where id = $1', [fact.municipalityId])
					fact.administrativeDivisionId = rollup.administrativeDivisionId
					fact.subdivisionId = rollup.subdivisionId
					fact.sovereignEntityId = rollup.sovereignEntityId
				} else if (fact.administrativeDivisionId && !fact.subdivisionId && !fact.sovereignEntityId) {
					const rollup = await biolineageDb.get('select sovereign_entity_id, subdivision_id from administrative_divisions where id = $1', [fact.administrativeDivisionId])
					fact.subdivisionId = rollup.subdivisionId
					fact.sovereignEntityId = rollup.sovereignEntityId
				} else if (fact.subdivisionId && !fact.sovereignEntityId) {
					const rollup = await biolineageDb.get('select sovereign_entity_id from subdivisions where id = $1', [fact.subdivisionId])
					fact.sovereignEntityId = rollup.sovereignEntityId
				}
				let googlePlaceId = fact.googlePlaceId
				if (googlePlaceId) {
					const pb = googlePlaceId.indexOf('?pb=')
					googlePlaceId = googlePlaceId.substring(pb + 4, googlePlaceId.indexOf('"', pb))
				}
				const newPlace = {
					id: placeId,
					treeId: fact.treeId,
					placeType: fact.placeType,
					placeTypeId: fact.placeTypeId,
					name: fact.placeName,
					description: fact.placeDescription,
					sovereignEntity: fact.sovereignEntity,
					sovereignEntityId: fact.sovereignEntityId,
					subdivision: fact.subdivision,
					subdivisionId: fact.subdivisionId,
					administrativeDivision: fact.administrativeDivision,
					administrativeDivisionId: fact.administrativeDivisionId,
					municipality: fact.municipality,
					municipalityId: fact.municipalityId,
					latitude: fact.latitude,
					longitude: fact.longitude,
					address: fact.address,
					googlePlaceId,
					notes: fact.placeNotes,
					createdBy: user.userId,
					modifiedBy: user.userId
				}
				console.log({ newPlace })
				await biolineageDb.insert('places',	newPlace)
			} else if (fact.place === 'no') {
				placeId = null
			}
			if (mode === 'edit') {
				await biolineageDb.update('facts',
					{
						data: fact.data,
						epoch: fact.year >= 0 ? 'AD' : 'BC',
						year: fact.year,
						month: fact.month,
						day: fact.day,
						hour: fact.hour,
						minute: fact.minute,
						second: fact.second,
						timezone: fact.timezone,
						dateText: fact.dateText,
						placeId,
						modifiedBy: user.userId,
						modifiedDate: new Date()
					},
					{
						id: fact.factId,
						code: fact.code,
						entityId: fact.entityId
					}
				)
			}
			await biolineageDb.commit()
			return { ok: true, id: fact.entityId }
		} catch (error) {
			await biolineageDb.rollback()
			console.log('Failed processing fact', mode, fact, error)
			return { ok: false }
		}
	}

	/**
	 * Edit aor add entity fact
	 * @param {BiolineageSession} user - session user information
	 * @param {add|edit} mode - edit mode
	 * @param {BiolineageEntityName} data - POSTed field data
	 * @returns {BiolineageSetterResponse}
	 */
	async entityName(user, mode, data) {
		console.log(data)
		const name = buildName(data)
		console.log(name)
		if (mode === 'edit') {
			await biolineageDb.begin()
			try {
				await biolineageDb.update('entity_names', { nameType: data.nameType, nameParts: name.nameParts, description: data.description }, { id: data.nameId })
				const entityData = { fullName: name.fullName, displayName: name.displayName, familyName: name.familyName, searchName: name.searchName }
				if (data.canonical) entityData.canonicalNameId = data.nameId
				await biolineageDb.update('entities', entityData, { id: data.entityId })
				await biolineageDb.commit()
				return { ok: true, id: data.entityId }
			} catch (error) {
				await biolineageDb.rollback()
				console.log('Failed to updxate name', data, error)
				return { ok: false }
			}
		} else {
			try {
				const nameData = {
					id: uuidv4(),
					entityId: data.entityId,
					nameType: data.nameType,
					nameParts: name.nameParts,
					description: data.description,
					createdBy: user.userId,
					modifiedBy: user.userId
				}
				await biolineageDb.insert('entity_names', nameData)
				if (data.canonical) {
					const entityData = { canonicalNameId: nameData.id, fullName: name.fullName, displayName: name.displayName, familyName: name.familyName, searchName: name.searchName }
					await biolineageDb.update('entities', entityData, { id: data.entityId })
				}
				await biolineageDb.commit()
				return { ok: true, id: data.entityId }
			} catch (error) {
				await biolineageDb.rollback()
				console.log('Failed to add name', data, error)
				return { ok: false }
			}
		}
	}

	/**
	 * Edit aor add entity fact
	 * @param {BiolineageSession} user - session user information
	 * @param {BiolineageEntitySex} data - POSTed field data
	 * @returns {BiolineageSetterResponse}
	 */
	async entitySex(user, data) {
		try {
			await biolineageDb.update('entities', { sex: data.sex, modifiedBy: user.userId, modifiedDate: new Date() }, { id: data.entityId })
			return { ok: true, id: data.entityId }
		} catch (error) {
			console.log('Failed to edit sex', data, error)
			return { ok: false }
		}
	}

	async treeAdd(user, data) {
		try {
			const id = uuidv4()
			await biolineageDb.insert('trees', { id, name: data.name, slug: slugify(data.name), entityTypeId: data.entityTypeId, ownerId: user.userId, createdBy: user.userId, modifiedBy: user.userId })
			await loadTrees()
			return { ok: true, id: slugify(data.name) }
		} catch (error) {
			console.log('Failed to add tree', error)
			return { ok: false }
		}
	}

	async userAdd(data) {
		try {
			const id = uuidv4()
			const user = {
				id,
				email: data.email,
				password: await hashPassword(data.password),
				name: data.name,
				avatar: 0,
				role: data.role
			}
			await biolineageDb.insert('users', user)
			return { ok: true, id }
		} catch (error) {
			console.log('Failed to add user', error)
			return { ok: false }
		}
	}

	async userUpdate(data) {
		try {
			const fields = {
				name: data.name,
				role: data.role
			}
			if (data.password && data.password !== '') fields.password = hashPassword(data.password)
			await biolineageDb.update('users', fields, { id: data.id })
		} catch (error) {
			console.log('Failed to update user', error)
			return { ok: false }
		}
	}
}

const setters = new Setters()

module.exports = setters
