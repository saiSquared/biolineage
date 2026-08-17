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
				treeId: data.treeId,
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
				const eventData = {
					id: uuidv4(),
					treeId: data.treeId,
					entityId: id,
					eventType: 'birth',
					epoch: data.birthYear >= 0 ? 'AD' : 'BC',
					year: massageNumber(data.birthYear),
					month: massageNumber(data.birthMonth),
					day: massageNumber(data.birthDay),
					createdBy: user.userId,
					modifiedBy: user.userId
				}
				await biolineageDb.insert('events', eventData)
			}
			if (data.deathYear) {
				const eventData = {
					id: uuidv4(),
					treeId: data.treeId,
					entityId: id,
					eventType: 'death',
					epoch: data.birthYear >= 0 ? 'AD' : 'BC',
					year: massageNumber(data.deathYear),
					month: massageNumber(data.deathMonth),
					day: massageNumber(data.deathDay),
					createdBy: user.userId,
					modifiedBy: user.userId
				}
				await biolineageDb.insert('events', eventData)
			}
			biolineageDb.commit()
			return { ok: true, id }
		} catch (error) {
			biolineageDb.rollback()
			console.log('Failed to add etity', error)
			return { ok: false }
		}
	}

	async entityEdit(user, editor, data) {
		try {
			switch (editor) {
				case 'sex': {
					await biolineageDb.update('entities', { sex: data.sex, modifiedBy: user.userId, modifiedDate: new Date() }, { id: data.entityId })
					return { ok: true, id: data.entityId }
				}
			}
		} catch (error) {
			console.log('Failed to edit entity', editor, data, error)
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
