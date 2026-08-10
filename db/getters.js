const { removeIndent } = require('../modules/clubside-utils')
const { dbNorm, biolineageDb } = require('../modules/globals')
const { slugify } = require('../modules/clubside-utils')

const formatLifespan = (data) => {
	if (data.DateOfBirth && data.DateOfDeath) {
		return `${formatShortDate(data.DateOfBirth)}-${formatShortDate(data.DateOfDeath)}`
	} else if (data.DateOfBirth) {
		return `${formatShortDate(data.DateOfBirth)}-`
	} else if (data.DateOfDeath) {
		return `-${formatShortDate(data.DateOfDeath)}`
	}
}

const formatNameReverse = (data) => {
	let name = data.FamilyName || '<em>Unknown</em>'
	if (data.GivenName || data.MiddleName) {
		name += ','
		if (data.GivenName) name += ` ${data.GivenName}`
		if (data.MiddleName) name += ` ${data.MiddleName}`
	}
	if (data.SuffixName) name += `, ${data.SuffixName}`
	if (data.NickName) name += ` (${data.NickName})`
	return name
}

const formatShortDate = (dateString) => {
	const dateParts = dateString.split('-')
	const birth = new Date(dateParts[0], dateParts[1], dateParts[2])
	return new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	}).format(birth)
}

/**
 * Convert row fields from snake_case to camelCase
 * @param {PGRowObject} obj - object with key/value pairs
 * @returns {PGRowObject}
 */
const pgToJs = (obj) => {
	const ret = {}
	for (const [key, value] of Object.entries(obj)) {
		ret[snakeCaseToCamelCase(key)] = value
	}
	return ret
}

/**
 * Convert snake_case to camelCase
 * @param {String} str - string to convert
 * @returns {String}
 */
const snakeCaseToCamelCase = (str) => {
	return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
}

async function getAncestors(tree, level, id) {
	const sql = `
			SELECT
				person.keeNew, person.FamilyName, person.GivenName, person.MiddleName, person.SuffixName, person.NickName, person.DateOfBirth, person.DateOfDeath, person.GenderIsMale
			FROM
				(select ParentPtr from parent where ChildPtr = @id) as parens
				join person on person.keeNew = parens.ParentPtr
			ORDER BY
				person.DateOfBirth;`
	const members = await dbNorm.query(removeIndent(sql), { id })
	for (const member of members) {
		const branch = tree.find(lookup => lookup.level === level)
		if (branch) {
			const existingMember = branch.members.find(lookup => lookup.keeNew === member.keeNew)
			if (!existingMember) branch.members.push(member)
		} else {
			tree.push({ level, members: [member] })
		}
		await getAncestors(tree, level - 1, member.keeNew)
	}
}

async function getDescendants(tree, level, id) {
	const sql = `
			SELECT
				child.keeNew, child.FamilyName, child.GivenName, child.MiddleName, child.SuffixName, child.NickName,
				child.DateOfBirth, child.DateOfDeath, child.GenderIsMale
			FROM
				(SELECT A.ChildPtrA FROM (SELECT ChildPtr AS ChildPtrA FROM parent WHERE ParentPtr = @id) A) childLyst
				INNER JOIN person AS child ON childLyst.ChildPtrA = child.keeNew
			ORDER BY
				child.DateOfBirth;`
	const members = await dbNorm.query(removeIndent(sql), { id })
	for (const member of members) {
		const branch = tree.find(lookup => lookup.level === level)
		if (branch) {
			const existingMember = branch.members.find(lookup => lookup.keeNew === member.keeNew)
			if (!existingMember) branch.members.push(member)
		} else {
			tree.push({ level, members: [member] })
		}
		await getDescendants(tree, level + 1, member.keeNew)
	}
}

async function fcAddAncestors(tree, id) {
	const sql = `
			SELECT
				person.keeNew, person.FamilyName, person.GivenName, person.MiddleName, person.SuffixName, person.NickName, person.DateOfBirth, person.DateOfDeath, person.GenderIsMale
			FROM
				(select ParentPtr from parent where ChildPtr = @id) as parens
				join person on person.keeNew = parens.ParentPtr
			ORDER BY
				person.DateOfBirth;`
	const members = await dbNorm.query(removeIndent(sql), { id })
	for (const member of members) {
		if (member.GenderIsMale) {
			const rel = {
				id: String(member.keeNew),
				data: {
					fn: member.GivenName || '',
					ln: member.FamilyName || '',
					desc: formatLifespan(member),
					label: formatNameReverse(member),
					avatar: '',
					gender: member.GenderIsMale.toLowerCase() === 'true' ? 'M' : 'F'
				},
				rels: { spouses: [], children: [] },
				main: false
			}
			const existing = tree.find(lookup => lookup.id === rel.id)
			if (!existing) tree.push(rel)
			await fcAddAncestors(tree, member.keeNew)
		}
	}
}

async function fcAddDescendants(tree, id) {
	const sql = `
			SELECT
				child.keeNew, child.FamilyName, child.GivenName, child.MiddleName, child.SuffixName, child.NickName,
				child.DateOfBirth, child.DateOfDeath, child.GenderIsMale
			FROM
				(SELECT A.ChildPtrA FROM (SELECT ChildPtr AS ChildPtrA FROM parent WHERE ParentPtr = @id) A) childLyst
				INNER JOIN person AS child ON childLyst.ChildPtrA = child.keeNew
			ORDER BY
				child.DateOfBirth;`
	const members = await dbNorm.query(removeIndent(sql), { id })
	for (const member of members) {
		if (member.GenderIsMale) {
			const rel = {
				id: String(member.keeNew),
				data: {
					fn: member.GivenName || '',
					ln: member.FamilyName || '',
					desc: formatLifespan(member),
					label: formatNameReverse(member),
					avatar: '',
					gender: member.GenderIsMale.toLowerCase() === 'true' ? 'M' : 'F'
				},
				rels: { spouses: [], children: [] },
				main: false
			}
			const existing = tree.find(lookup => lookup.id === rel.id)
			if (!existing) tree.push(rel)
			await fcAddDescendants(tree, member.keeNew)
		}
	}
}

async function fcAddMissing(tree) {
	// console.log('Adding missing...')
	let missing = false
	for (const person of tree) {
		if (person.rels.mother) {
			const existing = tree.find(lookup => lookup.id === person.rels.mother)
			if (!existing) {
				// console.log('Adding missing mother', Number(person.rels.mother), person)
				missing = true
				await fcAddPerson(tree, Number(person.rels.mother), false)
			}
		}
		if (person.rels.father) {
			const existing = tree.find(lookup => lookup.id === person.rels.father)
			if (!existing) {
				// console.log('Adding missing father', Number(person.rels.father), person)
				missing = true
				await fcAddPerson(tree, Number(person.rels.father), false)
			}
		}
		if (person.rels.children.length > 0) {
			for (const child of person.rels.children) {
				const existing = tree.find(lookup => lookup.id === child)
				if (!existing) {
					// console.log('Adding missing child', Number(child), person)
					missing = true
					await fcAddPerson(tree, Number(child), false)
				}
			}
		}
	}
	// console.log('Done', missing)
	return missing
}

async function fcAddPerson(tree, id, main) {
	const existing = tree.find(lookup => lookup.id === String(id))
	// console.log('fcAddPerson', id, existing)
	if (existing) return
	const sql = `
		SELECT
			person.keeNew, person.FamilyName, person.GivenName, person.MiddleName, person.SuffixName, person.NickName, person.DateOfBirth, person.DateOfDeath, person.GenderIsMale
		FROM
			person
		WHERE
			person.keeNew = @id;`
	const person = await dbNorm.get(removeIndent(sql), { id })
	const data = {
		id: String(person.keeNew),
		data: {
			fn: person.GivenName || '',
			ln: person.FamilyName || '',
			desc: formatLifespan(person),
			label: formatNameReverse(person),
			avatar: '',
			gender: person.GenderIsMale.toLowerCase() === 'true' ? 'M' : 'F'
		},
		rels: { spouses: [], children: [] },
		main
	}
	tree.push(data)
}

async function fcAddRelatives(tree) {
	let sql, members
	for (const person of tree) {
		if (person.rels.mother || person.rels.father || person.rels.children.length > 0) continue
		sql = `
			SELECT
				person.keeNew, person.FamilyName, person.GivenName, person.MiddleName, person.SuffixName, person.NickName, person.DateOfBirth, person.DateOfDeath, person.GenderIsMale
			FROM
				(select ParentPtr from parent where ChildPtr = @id) as parens
				join person on person.keeNew = parens.ParentPtr
			ORDER BY
				person.DateOfBirth;`
		members = await dbNorm.query(removeIndent(sql), { id: Number(person.id) })
		for (const member of members) {
			if (member.GenderIsMale) {
				if (member.GenderIsMale.toLowerCase() === 'true') {
					person.rels.father = String(member.keeNew)
				} else {
					person.rels.mother = String(member.keeNew)
				}
			}
		}
		sql = `
			SELECT
				child.keeNew, child.FamilyName, child.GivenName, child.MiddleName, child.SuffixName, child.NickName,
				child.DateOfBirth, child.DateOfDeath, child.GenderIsMale
			FROM
				(SELECT A.ChildPtrA FROM (SELECT ChildPtr AS ChildPtrA FROM parent WHERE ParentPtr = @id) A) childLyst
				INNER JOIN person AS child ON childLyst.ChildPtrA = child.keeNew
			ORDER BY
				child.DateOfBirth;`
		members = await dbNorm.query(removeIndent(sql), { id: Number(person.id) })
		for (const member of members) {
			if (member.GenderIsMale) {
				person.rels.children.push(String(member.keeNew))
			}
		}
	}
}

function fcCleanUp(tree) {
	for (const person of tree) {
		// console.log(person)
		for (const child of person.rels.children) {
			const info = tree.find(lookup => lookup.id === child)
			if (person.data.gender === 'M') {
				if (info.rels.mother) {
					const existing = person.rels.spouses.find(lookup => lookup === info.rels.mother)
					if (!existing) person.rels.spouses.push(info.rels.mother)
				}
			} else {
				if (info.rels.father) {
					const existing = person.rels.spouses.find(lookup => lookup === info.rels.father)
					if (!existing) person.rels.spouses.push(info.rels.father)
				}
			}
		}
	}
}

class Getters {
	async checkUser(email) {
		const user = await dbNorm.get('SELECT id FROM users WHERE email = @email', { email })
		if (user) {
			return true
		} else {
			return false
		}
	}

	async getPeople(params) {
		let sql = 'SELECT person.keeNew, person.GenderIsMale, person.FamilyName, person.GivenName, person.MiddleName, person.SuffixName, person.NickName, person.DateOfBirth, person.DateOfDeath, person.BirthCountry, person.BirthState FROM person WHERE (person.FamilyName IS NOT NULL OR person.GivenName IS NOT NULL)'
		if (params.year) sql += ' AND person.dobYr = @year'
		let people = await dbNorm.query(sql, params)
		people = people.map(data => {
			const name = formatNameReverse(data)
			let description = ''
			if (data.BirthCountry) description += `<img src="/img/flags/${data.BirthCountry}.svg">`
			if (data.BirthState) description += data.BirthState
			let dates = ''
			if (data.DateOfBirth && data.DateOfDeath) {
				dates = `${formatShortDate(data.DateOfBirth)}-${formatShortDate(data.DateOfDeath)}`
			} else if (data.DateOfBirth) {
				dates = `${formatShortDate(data.DateOfBirth)}-`
			} else if (data.DateOfDeath) {
				dates = `-${formatShortDate(data.DateOfDeath)}`
			}
			return { id: data.keeNew, name, description, dates, gender: data.GenderIsMale ? data.GenderIsMale.toLowerCase() === 'true' ? 'male' : 'female' : null }
		})
		if (params.filter) people = people.filter(data => data.name.toLowerCase().includes(params.filter.toLowerCase()))
		people = people.sort((a, b) => a.name.localeCompare(b.name))
		const total = people.length
		const pages = Math.ceil(people.length / 40)
		const start = (params.page - 1) * 40
		return { total, pages, items: people.slice(start, start + 40) }
	}

	async getPerson(id) {
		const person = await dbNorm.get('SELECT * FROM person WHERE keeNew = @id', { id })
		let sql
		sql = `
			SELECT
				person.FamilyName, person.GivenName, person.MiddleName, person.SuffixName, person.NickName, person.DateOfBirth, person.DateOfDeath, person.keeNew, parens.ParentPtr, person.GenderIsMale
			FROM
				(select ParentPtr from parent where ChildPtr = @id) as parens
				join person on person.keeNew = parens.ParentPtr
			ORDER BY
				person.DateOfBirth;`
		person.parents = await dbNorm.query(removeIndent(sql), { id })
		person.siblingsFull = []
		person.siblingsHalf = []
		if (person.parents.length > 0) {
			const parentList = person.parents.map(data => data.keeNew)
			sql = `
				SELECT
					person.FamilyName, person.GivenName, person.MiddleName, person.SuffixName, person.NickName, person.DateOfBirth, person.DateOfDeath, person.GenderIsMale,
					minP, maxP, numLstedPars, ChildPtrToMatch, ParentPtrUnListed
				FROM
					(
						SELECT
							SibsLstedPars.ChildPtr, minP, maxP, numLstedPars, SibsUnLstedPars.ChildPtr ChildPtrToMatch, SibsUnLstedPars.ParentPtr AS ParentPtrUnListed
						FROM
							(
								SELECT
									ChildPtr, min(ParentPtr) as minP, max(ParentPtr) as maxP, count(childPtr) as numLstedPars
								FROM
									parent
								WHERE
									ParentPtr IN (${parentList.join(', ')})
									AND ChildPtr <> @id
								GROUP BY
									ChildPtr
							) SibsLstedPars
							JOIN parent SibsUnLstedPars ON SibsLstedPars.ChildPtr = SibsUnLstedPars.ChildPtr
						WHERE
							SibsUnLstedPars.ParentPtr <> minP
							OR SibsUnLstedPars.ChildPtr IN (SELECT ChildPtr FROM parent GROUP BY ChildPtr HAVING COUNT(ParentPtr) = 1)
					) asi
					JOIN person ON person.keeNew = asi.ChildPtr
				ORDER BY
					person.DateOfBirth`
			const siblingsList = await dbNorm.query(removeIndent(sql), { id })
			for (const sibling of siblingsList) {
				if (sibling.numLstedPars === 2) {
					person.siblingsFull.push(sibling)
				} else {
					person.siblingsHalf.push(sibling)
				}
			}
		}
		person.children = []
		sql = `
			SELECT
				person_1.keeNew as ChildKee,
				person_1.FamilyName AS ChildFamilyName,
				person_1.GivenName AS ChildGivenName,
				person_1.MiddleName as ChildMiddleName,
				person_1.SuffixName as ChildSuffixName,
				person_1.NickName as ChildNickName,
				person_1.DateOfBirth as ChildDateOfBirth,
				person_1.DateOfDeath as ChildDateOfDeath,
				person_1.GenderIsMale as ChildGenderIsMale,
				person_2.keeNew as ParentKee,
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
		const children = await dbNorm.query(removeIndent(sql), { id })
		if (children.length > 0) {
			for (const child of children) {
				const existingParent = person.children.find(lookup => lookup.id === child.ParentKee)
				if (existingParent) {
					existingParent.children.push({
						id: child.ChildKee,
						FamilyName: child.ChildFamilyName,
						GivenName: child.ChildGivenName,
						MiddleName: child.ChildMiddleName,
						SuffixName: child.ChildSuffixName,
						NickName: child.ChildNickName,
						DateOfBirth: child.ChildDateOfBirth,
						DateOfDeath: child.ChildDateOfDeath,
						GenderIsMale: child.ChildGenderIsMale
					})
				} else {
					person.children.push({
						id: child.ParentKee,
						FamilyName: child.ParentFamilyName,
						GivenName: child.ParentGivenName,
						MiddleName: child.ParentMiddleName,
						SuffixName: child.ParentSuffixName,
						NickName: child.ParentNickName,
						DateOfBirth: child.ParentDateOfBirth,
						DateOfDeath: child.ParentDateOfDeath,
						GenderIsMale: child.ParentGenderIsMale,
						children: [{
							id: child.ChildKee,
							FamilyName: child.ChildFamilyName,
							GivenName: child.ChildGivenName,
							MiddleName: child.ChildMiddleName,
							SuffixName: child.ChildSuffixName,
							NickName: child.ChildNickName,
							DateOfBirth: child.ChildDateOfBirth,
							DateOfDeath: child.ChildDateOfDeath,
							GenderIsMale: child.ChildGenderIsMale
						}]
					})
				}
			}
		}
		return person
	}

	async getPersonFamilyChart(id) {
		const tree = []
		await fcAddPerson(tree, id, true)
		await fcAddAncestors(tree, id)
		await fcAddDescendants(tree, id)
		let missing = false
		do {
			await fcAddRelatives(tree)
			missing = await fcAddMissing(tree)
		} while (missing)
		fcCleanUp(tree)
		return tree
	}

	async getPgPersonFamilyChart(entityId) {
		// 1. Get full connected component (all 633 people)
		const connected = await biolineageDb.query(`
        WITH RECURSIVE connected AS (

			-- NON‑RECURSIVE TERM
			SELECT id
			FROM entities
			WHERE id = $1

			UNION ALL

			-- RECURSIVE TERM: walk to parents
			SELECT r.entity_id
			FROM relationships r
			JOIN connected c ON r.related_entity_id = c.id
			WHERE r.relationship_type = 'parent'
			AND r.direction = 'forward'

			UNION ALL

			-- RECURSIVE TERM: walk to children
			SELECT r.related_entity_id
			FROM relationships r
			JOIN connected c ON r.entity_id = c.id
			WHERE r.relationship_type = 'parent'
			AND r.direction = 'forward'
		)
		SELECT DISTINCT id
		FROM connected;`, [entityId])

		const ids = connected.rows.map(r => r.id)

		// 2. Load entity details
		const rows = await biolineageDb.query(`
        SELECT
            ent.id,
            ent.display_name,
            ent.sex,
            birth.year AS birth_year,
            death.year AS death_year
        FROM entities ent
        LEFT JOIN events birth
            ON birth.entity_id = ent.id
           AND birth.event_type = 'birth'
        LEFT JOIN events death
            ON death.entity_id = ent.id
           AND death.event_type = 'death'
        WHERE ent.id = ANY($1);
    `, [ids])

		// 3. Build initial tree nodes
		const tree = rows.rows.map(row => ({
			id: String(row.id),
			data: {
				fn: '',
				ln: '',
				desc: `${row.birthYear || '~'} - ${row.deathYear || '~'}`,
				label: row.display_name,
				avatar: '',
				gender: row.sex
			},
			rels: { spouses: [], children: [], mother: null, father: null },
			main: row.id === entityId
		}))

		// 4. Fill in parent/child relationships
		for (const person of tree) {
			const rels = await biolineageDb.query(`
            SELECT relationship_type, entity_id, related_entity_id
            FROM relationships
            WHERE relationship_type = 'parent'
              AND direction = 'forward'
              AND (entity_id = $1 OR related_entity_id = $1);
        `, [person.id])

			for (const r of rels.rows) {
				if (r.related_entity_id === person.id) {
					const parent = tree.find(t => t.id === String(r.entity_id))
					if (parent) {
						if (parent.data.gender === 'M') person.rels.father = parent.id
						else person.rels.mother = parent.id
					}
				} else if (r.entity_id === person.id) {
					person.rels.children.push(String(r.related_entity_id))
				}
			}
		}

		// 5. Infer spouses
		for (const person of tree) {
			for (const childId of person.rels.children) {
				const child = tree.find(t => t.id === childId)
				if (!child) continue

				if (person.data.gender === 'M') {
					if (child.rels.mother && !person.rels.spouses.includes(child.rels.mother)) {
						person.rels.spouses.push(child.rels.mother)
					}
				} else {
					if (child.rels.father && !person.rels.spouses.includes(child.rels.father)) {
						person.rels.spouses.push(child.rels.father)
					}
				}
			}
		}

		return tree
	}

	async getPersonName(id) {
		const person = await dbNorm.get('SELECT FamilyName, GivenName, MiddleName, SuffixName, NickName FROM person WHERE keeNew = @id', { id })
		return formatNameReverse(person)
	}

	async getPersonUUID(id) {
		const person = await dbNorm.get('SELECT uuid FROM person WHERE keeNew = @id', { id })
		return person.uuid
	}

	async getPersonTree(id) {
		const tree = []
		const sql = `
			SELECT
				person.keeNew, person.FamilyName, person.GivenName, person.MiddleName, person.SuffixName, person.NickName, person.DateOfBirth, person.DateOfDeath, person.GenderIsMale
			FROM
				person
			WHERE
				person.keeNew = @id;`
		tree.push({ level: 0, members: [await dbNorm.get(removeIndent(sql), { id })] })
		await getAncestors(tree, -1, id)
		await getDescendants(tree, 1, id)
		for (const level of tree) {
			level.members.sort((a, b) => {
				if (!a.DateOfBirth) return -1
				return new Date(a.DateOfBirth) < new Date(b.DateOfBirth)
			})
		}
		tree.sort((a, b) => a.level - b.level)
		return tree
	}

	async getPgPersonTree(id) {
		return await biolineageDb.query('select * from get_entity_tree($1)', [id])
	}

	async getTimelineBirth() {
		const sql = `
			SELECT
				person.FamilyName, person.GivenName, person.MiddleName, person.SuffixName, person.NickName, person.DateOfBirth, countries.name BirthCountry,
				person.BirthState, person.BirthCity, person.BirthHospital
			FROM
				person
				LEFT JOIN countries ON countries.id = person.BirthCountry
			WHERE
				person.DateOfBirth IS NOT NULL
			ORDER BY
				person.DateOfBirth`
		return await dbNorm.query(removeIndent(sql))
	}

	async superTrees(id) {
		return await biolineageDb.query('select name, slug, (select count(*) from entities where tree_id = trees.id) c from trees where owner_id <> $1 order by name;', [id])
	}

	async tree(data) {
		const slug = slugify(data.name)
		return await biolineageDb.get('select * from trees where slug = $1;', [slug])
	}

	async treeEntities(data) {
		const results = await biolineageDb.get('select * from get_tree_entities($1, $2, $3, $4, $5);', [data.tree, data.filter, data.startYear, data.endYear, data.page])
		const resultData = results.getTreeEntities
		return { total: resultData.total, pages: resultData.pages, items: resultData.items.map(data => pgToJs(data)) }
	}

	async user(email) {
		return await biolineageDb.get('SELECT * FROM users WHERE email = $1', [email])
	}

	async users() {
		return await biolineageDb.query('SELECT * FROM users')
	}

	async userTrees(id) {
		return await biolineageDb.query('select name, slug, (select count(*) from entities where tree_id = trees.id) c from trees where owner_id = $1 order by name;', [id])
	}
}
const getters = new Getters()

module.exports = getters
