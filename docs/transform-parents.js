const sqliteDb = require('../db/sqlite')
const sqliteTables = require('../db/sqlite-definitions')
const { removeIndent } = require('../modules/clubside-utils')

const normSQLite = new sqliteDb('../db/norm.db')

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

async function run() {
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

run()
