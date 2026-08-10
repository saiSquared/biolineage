const { v4: uuidv4 } = require('uuid')
const { biolineageDb, hashPassword, loadTrees } = require('../modules/globals')
const { slugify } = require('../modules/clubside-utils')

const buildSearchName = (data) => {
	let partsString = ''
	if (data.prefixName) partsString += data.prefixName + ' '
	if (data.givenName) partsString += data.givenName + ' '
	if (data.middleName) partsString += data.middleName + ' '
	if (data.prefixFamilyname) partsString += data.prefixFamilyname + ' '
	if (data.familyName) partsString += data.familyName + ' '
	if (data.suffixName) partsString += data.suffixName + ' '
	if (data.nickName) partsString += data.nickName + ' '
	if (data.displayName) partsString += data.displayName + ' '
	const cleaned = partsString.trim().toLowerCase().replace(/[^\w\s]/g, '')
	const parts = cleaned.split(/\s+/)
	return [...new Set(parts)].join(' ')
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
		biolineageDb.begin()
		try {
			const id = uuidv4()
			const nameId = uuidv4()
			const nameData = {
				id: nameId,
				treeId: data.treeId,
				entityId: id,
				nameType: data.nameType,
				prefixName: data.prefixName,
				givenName: data.givenName,
				middleName: data.middleName,
				prefixFamilyName: data.prefixFamilyName,
				familyName: data.familyName,
				suffixName: data.suffixName,
				nickName: data.nickName,
				displayName: data.displayName,
				description: data.description,
				createdBy: user.userId,
				modifiedBy: user.userId
			}
			await biolineageDb.insert('entity_names', nameData)
			const entityData = {
				id,
				treeId: data.treeId,
				canonicalNameId: nameId,
				displayName: data.displayName,
				familyName: data.familyName,
				searchName: buildSearchName(data),
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

	async treeAdd(user, data) {
		try {
			const id = uuidv4()
			await biolineageDb.insert('trees', { id, name: data.name, slug: slugify(data.name), entityTypeId: data.entityTypeId, ownerId: user.userId, createdBy: user.userId, modifiedBy: user.userId })
			await loadTrees()
			return { ok: true, id }
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
