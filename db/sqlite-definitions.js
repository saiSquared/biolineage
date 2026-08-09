const sqliteTables = {
	users: {
		name: 'users',
		fields: [
			{ name: 'id', type: 'INTEGER', nulls: false, skip: true },
			{ name: 'email', type: 'TEXT', nulls: false, unique: true },
			{ name: 'password', type: 'TEXT', nulls: false },
			{ name: 'name', type: 'TEXT' },
			{ name: 'avatar', type: 'INTEGER' },
			{ name: 'role', type: 'TEXT' }
		],
		key: '"id"  AUTOINCREMENT'
	},
	countries: {
		name: 'countries',
		fields: [
			{ name: 'id', type: 'TEXT', nulls: false },
			{ name: 'name', type: 'TEXT', nulls: false }
		],
		key: '"id"'
	},
	regions: {
		name: 'regions',
		fields: [
			{ name: 'country', type: 'TEXT', nulls: false },
			{ name: 'region', type: 'TEXT', nulls: false },
			{ name: 'name', type: 'TEXT', nulls: false }
		],
		key: '"country","region"'
	},
	parent: {
		name: 'parent',
		fields: [
			{ name: 'kee', type: 'INTEGER', nulls: false },
			{ name: 'ChildPtr', type: 'INTEGER' },
			{ name: 'ParentPtr', type: 'INTEGER' },
			{ name: 'OldKey', type: 'INTEGER' }
		],
		key: '"kee"  AUTOINCREMENT'
	},
	person: {
		name: 'person',
		fields: [
			{ name: 'keeNew', type: 'INTEGER', nulls: false },
			{ name: 'FamilyName', type: 'TEXT' },
			{ name: 'GivenName', type: 'TEXT' },
			{ name: 'MiddleName', type: 'TEXT' },
			{ name: 'SuffixName', type: 'TEXT' },
			{ name: 'NickName', type: 'TEXT' },
			{ name: 'GenderIsMale', type: 'TEXT' },
			{ name: 'DateOfBirth', type: 'TEXT' },
			{ name: 'dobYr', type: 'INTEGER' },
			{ name: 'dobMo', type: 'INTEGER' },
			{ name: 'dobDa', type: 'INTEGER' },
			{ name: 'BirthCountry', type: 'TEXT' },
			{ name: 'BirthState', type: 'TEXT' },
			{ name: 'BirthCity', type: 'TEXT' },
			{ name: 'BirthHospital', type: 'TEXT' },
			{ name: 'DateOfDeath', type: 'TEXT' },
			{ name: 'dodYr', type: 'INTEGER' },
			{ name: 'dodMo', type: 'INTEGER' },
			{ name: 'dodDa', type: 'INTEGER' },
			{ name: 'Disposition', type: 'TEXT' },
			{ name: 'BurialCountry', type: 'TEXT' },
			{ name: 'BurialState', type: 'TEXT' },
			{ name: 'BurialCity', type: 'TEXT' },
			{ name: 'BurialCemetary', type: 'TEXT' },
			{ name: 'BuriaLatitude', type: 'TEXT' },
			{ name: 'BurialLongitude', type: 'TEXT' },
			{ name: 'PersonKey', type: 'INTEGER' },
			{ name: 'Notes', type: 'TEXT' }
		],
		key: '"keeNew"  AUTOINCREMENT'
	},
	places: {
		name: 'places',
		fields: [
			{ name: 'id', type: 'INTEGER', nulls: false, skip: true },
			{ name: 'uuid', type: 'TEXT', nulls: false },
			{ name: 'type', type: 'TEXT' },
			{ name: 'name', type: 'TEXT' },
			{ name: 'country', type: 'TEXT' },
			{ name: 'countryId', type: 'TEXT' },
			{ name: 'region', type: 'TEXT' },
			{ name: 'regionId', type: 'TEXT' },
			{ name: 'city', type: 'TEXT' },
			{ name: 'cityId', type: 'TEXT' },
			{ name: 'ogName', type: 'TEXT' },
			{ name: 'ogCountry', type: 'TEXT' },
			{ name: 'ogRegion', type: 'TEXT' },
			{ name: 'ogCity', type: 'TEXT' }
		],
		key: '"id"  AUTOINCREMENT'
	},
	charles: {
		name: 'charles',
		fields: [
			{ name: 'keeNew', type: 'INTEGER', nulls: false },
			{ name: 'name', type: 'TEXT', nulls: false }
		],
		key: '"keeNew"'
	},
	children: {
		name: 'children',
		fields: [
			{ name: 'id', type: 'INTEGER', nulls: false, skip: true },
			{ name: 'parentId1', type: 'INTEGER', nulls: false },
			{ name: 'parentUuid1', type: 'TEXT', nulls: false },
			{ name: 'parentName1', type: 'TEXT', nulls: false },
			{ name: 'parentSex1', type: 'TEXT' },
			{ name: 'parentId2', type: 'INTEGER' },
			{ name: 'parentUuid2', type: 'TEXT' },
			{ name: 'parentName2', type: 'TEXT' },
			{ name: 'parentSex2', type: 'TEXT' },
			{ name: 'childId', type: 'INTEGER', nulls: false },
			{ name: 'childUuid', type: 'TEXT', nulls: false },
			{ name: 'childName', type: 'TEXT', nulls: false },
			{ name: 'childSex', type: 'TEXT' }
		],
		key: '"id"  AUTOINCREMENT'
	}
}

module.exports = sqliteTables
