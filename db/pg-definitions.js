/**
 * PostgreSQL field definition object
 * @typedef PGField
 * @property {String} name - name of the field
 * @property {String} type - type of field
 * @property {Boolean} [primary] - whether part of the primary key
 * @property {Boolean} [nulls] - whether NULLs are allowed
 * @property {Boolean} [unique] - whether field has a UNIQUE constraint
 * @property {String} [default] - default value for field
 */

/**
 * PostgreSQL foreign key object
 * @typedef PGForeignKey
 * @property {String} [name] - name for the FOREIGN KEY
 * @property {String} [table] - source table to for foreign key
 * @property {String[]} fields - array of fields in the table to establish foreign keys with
 * @property {String} refTable - table to establish the foreign key(s) with
 * @property {String[]} refFields - fields in the foreign key table to connect with
 * @property {String} [onDelete] - action for foreign key deletions to execute
 * @property {String} [onUpdate] - action for foreign key updates to execute
 */

/**
 * PostgreSQL trigger definition
 * @typedef {Object} PGTrigger
 * @property {string} name -Name of the trigger to create.
 * @property {string} [function] - Optional SQL string that defines the trigger function, if provided, it will be executed before creating the trigger.
 * @property {'BEFORE'|'AFTER'|'INSTEAD OF'} timing - When the trigger fires relative to the triggering event.
 * @property {string[]} events - List of events that fire the trigger. Valid PostgreSQL events: 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE'.
 * @property {string} table - Name of the table the trigger is attached to.
 * @property {'ROW'|'STATEMENT'} forEach - Whether the trigger fires for each row or once per statement.
 * @property {string} [when] - Optional WHEN condition expression (without the WHEN keyword).
 * @property {string} functionName - Name of the trigger function to execute, including parentheses.
 */

/**
 * PostgreSQL unique key object
 * @typedef PGUniqueKey
 * @property {String} [name] - name for the UNIQUE key
 * @property {String[]} fields - array of fields for the UNIQUE key
 */

/**
 * PostgreSQL index object
 * @typedef PGIndex
 * @property {String} [name] - name for the INDEX
 * @property {String} [method] - index method (btree, gin, gist)
 * @property {Array<{ field: String, opclass?: String }>} [fields]
 *   List of field entries. Each entry may specify an operator class.
 * @property {String[]} [expressions]
 *   Raw SQL expressions for the INDEX (no quoting, no opclass).
 */

/**
 * PostgreSQL check constraint
 * @typedef PGCheck
 * @property {String} [name] - name for the CHECK constraint
 * @property {String} expression - constraint expression
 */

/**
 * PostgreSQL function
 * @typedef PGFunction
 * @property {String} code - fully qualified SQL statement to create the function
 */

/**
 * PostgreSQL view
 * @typedef PGView
 * @property {String} code - fully qualified SQL statement to create the view
 */

/**
 * PostgreSQL table definition object
 * @typedef PGTable
 * @property {String} name - name of the table
 * @property {PGField[]} fields - fields for the table
 * @property {String[]} [primary] - primary key
 * @property {PGForeignKey[]} [foreignKeys] - foreign keys
 * @property {PGUniqueKey[]} [unique] - unique keys
 * @property {PGCheck[]} [checks] - check constraints
 * @property {PGIndex[]} [indexes] - indexes
 */

const pgTables = {
	/** @type {PGTable} */
	users: {
		name: 'users',
		fields: [
			{ name: 'id', type: 'UUID', primary: true },
			{ name: 'email', type: 'TEXT', nulls: false, unique: true },
			{ name: 'password', type: 'TEXT', nulls: false },
			{ name: 'name', type: 'TEXT', nulls: false },
			{ name: 'avatar', type: 'BOOLEAN', nulls: false, default: 'FALSE' },
			{ name: 'role', type: 'TEXT', nulls: false },
			{ name: 'created_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' },
			{ name: 'modified_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' },
			{ name: 'deleted', type: 'BOOLEAN' },
			{ name: 'deleted_by', type: 'UUID' },
			{ name: 'deleted_date', type: 'TIMESTAMPTZ' }
		],
		foreignKeys: [
			{ fields: ['deleted_by'], refTable: 'users', refFields: ['id'] }
		]
	},

	/** @type {PGTable} */
	sovereignEntities: {
		name: 'sovereign_entities',
		fields: [
			{ name: 'id', type: 'UUID', primary: true },
			{ name: 'name', type: 'TEXT', nulls: false },
			{ name: 'long_name', type: 'TEXT', nulls: false },
			{ name: 'type', type: 'TEXT', nulls: false },
			{ name: 'iso31661', type: 'JSONB' },
			{ name: 'has_flag', type: 'BOOLEAN', nulls: false, default: 'FALSE' },
			{ name: 'flag_file', type: 'TEXT' },
			{ name: 'has_armorial', type: 'BOOLEAN', nulls: false, default: 'FALSE' },
			{ name: 'armorial_type', type: 'TEXT' },
			{ name: 'armorial_file', type: 'TEXT' },
			{ name: 'tlds', type: 'JSONB' }
		],
		indexes: [
			{ method: 'gin', fields: ['iso31661'] },
			{ method: 'gin', fields: ['tlds'] }
		]
	},

	/** @type {PGTable} */
	subdivisions: {
		name: 'subdivisions',
		fields: [
			{ name: 'id', type: 'UUID', primary: true },
			{ name: 'sovereign_entity_id', type: 'UUID', nulls: false },
			{ name: 'name', type: 'TEXT', nulls: false },
			{ name: 'type', type: 'TEXT', nulls: false },
			{ name: 'iso31662', type: 'JSONB' },
			{ name: 'has_flag', type: 'BOOLEAN', nulls: false, default: 'FALSE' },
			{ name: 'flag_file', type: 'TEXT' },
			{ name: 'has_armorial', type: 'BOOLEAN', nulls: false, default: 'FALSE' },
			{ name: 'armorial_type', type: 'TEXT' },
			{ name: 'armorial_file', type: 'TEXT' }
		],
		foreignKeys: [
			{ fields: ['sovereign_entity_id'], refTable: 'sovereign_entities', refFields: ['id'] }
		],
		indexes: [
			{ fields: ['sovereign_entity_id'] },
			{ method: 'gin', fields: ['iso31662'] }
		]
	},

	/** @type {PGTable} */
	administrativeDivisions: {
		name: 'administrative_divisions',
		fields: [
			{ name: 'id', type: 'UUID', primary: true },
			{ name: 'sovereign_entity_id', type: 'UUID', nulls: false },
			{ name: 'subdivision_id', type: 'UUID' }, // corrected spelling
			{ name: 'name', type: 'TEXT', nulls: false },
			{ name: 'long_name', type: 'TEXT', nulls: false },
			{ name: 'type', type: 'TEXT', nulls: false },
			{ name: 'fips', type: 'INTEGER' },
			{ name: 'latitude', type: 'DOUBLE PRECISION' },
			{ name: 'longitude', type: 'DOUBLE PRECISION' },
			{ name: 'iso31662', type: 'JSONB' },
			{ name: 'meta', type: 'JSONB' },
			{ name: 'has_flag', type: 'BOOLEAN', nulls: false, default: 'FALSE' },
			{ name: 'flag_file', type: 'TEXT' },
			{ name: 'has_armorial', type: 'BOOLEAN', nulls: false, default: 'FALSE' },
			{ name: 'armorial_type', type: 'TEXT' },
			{ name: 'armorial_file', type: 'TEXT' }
		],
		foreignKeys: [
			{ fields: ['sovereign_entity_id'], refTable: 'sovereign_entities', refFields: ['id'] },
			{ fields: ['subdivision_id'], refTable: 'subdivisions', refFields: ['id'] }
		],
		indexes: [
			{ fields: ['sovereign_entity_id'] },
			{ fields: ['subdivision_id'] },
			{ method: 'gin', fields: ['iso31662'] },
			{ method: 'gin', fields: ['meta'] }
		],
		checks: [
			{ expression: 'latitude BETWEEN -90 AND 90' },
			{ expression: 'longitude BETWEEN -180 AND 180' }
		]
	},

	/** @type {PGTable} */
	municipalities: {
		name: 'municipalities',
		fields: [
			{ name: 'id', type: 'UUID', primary: true },
			{ name: 'sovereign_entity_id', type: 'UUID', nulls: false },
			{ name: 'subdivision_id', type: 'UUID' }, // corrected spelling
			{ name: 'administrative_division_id', type: 'UUID' },
			{ name: 'name', type: 'TEXT', nulls: false },
			{ name: 'long_name', type: 'TEXT' },
			{ name: 'type', type: 'TEXT', nulls: false },
			{ name: 'latitude', type: 'DOUBLE PRECISION' },
			{ name: 'longitude', type: 'DOUBLE PRECISION' },
			{ name: 'meta', type: 'JSONB' },
			{ name: 'has_flag', type: 'BOOLEAN', nulls: false, default: 'FALSE' },
			{ name: 'flag_file', type: 'TEXT' },
			{ name: 'has_armorial', type: 'BOOLEAN', nulls: false, default: 'FALSE' },
			{ name: 'armorial_type', type: 'TEXT' },
			{ name: 'armorial_file', type: 'TEXT' }
		],
		foreignKeys: [
			{ fields: ['sovereign_entity_id'], refTable: 'sovereign_entities', refFields: ['id'] },
			{ fields: ['subdivision_id'], refTable: 'subdivisions', refFields: ['id'] },
			{ fields: ['administrative_division_id'], refTable: 'administrative_divisions', refFields: ['id'] }
		],
		indexes: [
			{ fields: ['sovereign_entity_id'] },
			{ fields: ['subdivision_id'] },
			{ fields: ['administrative_division_id'] },
			{ method: 'gin', fields: ['meta'] }
		],
		checks: [
			{ expression: 'latitude BETWEEN -90 AND 90' },
			{ expression: 'longitude BETWEEN -180 AND 180' }
		]
	},

	/** @type {PGTable} */
	entityTypes: {
		name: 'entity_types',
		fields: [
			{ name: 'id', type: 'UUID', primary: true },
			{ name: 'key', type: 'TEXT', nulls: false, unique: true },
			{ name: 'label', type: 'TEXT', nulls: false },
			{ name: 'description', type: 'TEXT' },
			{ name: 'created_by', type: 'UUID', nulls: false },
			{ name: 'created_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' },
			{ name: 'modified_by', type: 'UUID', nulls: false },
			{ name: 'modified_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' }
		],
		foreignKeys: [
			{ fields: ['created_by'], refTable: 'users', refFields: ['id'] },
			{ fields: ['modified_by'], refTable: 'users', refFields: ['id'] }
		],
		indexes: [
			{ fields: ['created_by'] },
			{ fields: ['modified_by'] }
		]
	},

	/** @type {PGTable} */
	trees: {
		name: 'trees',
		fields: [
			{ name: 'id', type: 'UUID', primary: true },
			{ name: 'owner_id', type: 'UUID', nulls: false },
			{ name: 'entity_type_id', type: 'UUID', nulls: false },
			{ name: 'name', type: 'TEXT', nulls: false },
			{ name: 'slug', type: 'TEXT', nulls: false, unique: true },
			{ name: 'description', type: 'TEXT' },
			{ name: 'archived', type: 'BOOLEAN', nulls: false, default: 'FALSE' },
			{ name: 'created_by', type: 'UUID', nulls: false },
			{ name: 'created_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' },
			{ name: 'modified_by', type: 'UUID', nulls: false },
			{ name: 'modified_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' }
		],
		foreignKeys: [
			{ fields: ['owner_id'], refTable: 'users', refFields: ['id'] },
			{ fields: ['entity_type_id'], refTable: 'entity_types', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['created_by'], refTable: 'users', refFields: ['id'] },
			{ fields: ['modified_by'], refTable: 'users', refFields: ['id'] }
		],
		indexes: [
			{ fields: ['owner_id'] },
			{ fields: ['entity_type_id'] },
			{ fields: ['created_by'] },
			{ fields: ['modified_by'] }
		]
	},

	/** @type {PGTable} */
	treeCollaborators: {
		name: 'tree_collaborators',
		fields: [
			{ name: 'id', type: 'UUID', primary: true },
			{ name: 'tree_id', type: 'UUID', nulls: false },
			{ name: 'user_id', type: 'UUID', nulls: false },
			{ name: 'role', type: 'TEXT', nulls: false },
			{ name: 'created_by', type: 'UUID', nulls: false },
			{ name: 'created_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' },
			{ name: 'modified_by', type: 'UUID', nulls: false },
			{ name: 'modified_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' },
			{ name: 'deleted', type: 'BOOLEAN' },
			{ name: 'deleted_by', type: 'UUID' },
			{ name: 'deleted_date', type: 'TIMESTAMPTZ' }
		],
		foreignKeys: [
			{ fields: ['tree_id'], refTable: 'trees', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['user_id'], refTable: 'users', refFields: ['id'] },
			{ fields: ['created_by'], refTable: 'users', refFields: ['id'] },
			{ fields: ['modified_by'], refTable: 'users', refFields: ['id'] },
			{ fields: ['deleted_by'], refTable: 'users', refFields: ['id'] }
		],
		unique: [{ fields: ['tree_id', 'user_id'] }],
		indexes: [
			{ fields: ['tree_id'] },
			{ fields: ['user_id'] },
			{ fields: ['role'] },
			{ fields: ['created_by'] },
			{ fields: ['modified_by'] },
			{ fields: ['deleted_by'] }
		]
	},

	/** @type {PGTable} */
	entityNames: {
		name: 'entity_names',
		fields: [
			{ name: 'id', type: 'UUID', primary: true },
			{ name: 'tree_id', type: 'UUID', nulls: false },
			{ name: 'entity_id', type: 'UUID', nulls: false },
			{ name: 'name_type', type: 'TEXT', nulls: false },
			{ name: 'prefix_name', type: 'TEXT' },
			{ name: 'given_name', type: 'TEXT' },
			{ name: 'middle_name', type: 'TEXT' },
			{ name: 'prefix_family_name', type: 'TEXT' },
			{ name: 'family_name', type: 'TEXT' },
			{ name: 'suffix_name', type: 'TEXT' },
			{ name: 'nick_name', type: 'TEXT' },
			{ name: 'display_name', type: 'TEXT', nulls: false },
			{ name: 'description', type: 'TEXT' },
			{ name: 'created_by', type: 'UUID', nulls: false },
			{ name: 'created_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' },
			{ name: 'modified_by', type: 'UUID', nulls: false },
			{ name: 'modified_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' }
		],
		foreignKeys: [
			{ fields: ['tree_id'], refTable: 'trees', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['created_by'], refTable: 'users', refFields: ['id'] },
			{ fields: ['modified_by'], refTable: 'users', refFields: ['id'] }
		],
		indexes: [
			{ fields: ['tree_id'] },
			{ fields: ['entity_id'] },
			{ fields: ['name_type'] },
			{ fields: ['family_name'] },
			{ fields: ['display_name'] },
			{ fields: ['created_by'] },
			{ fields: ['modified_by'] }
		],
		unique: [
			{ fields: ['tree_id', 'entity_id', 'name_type'] }
		]
	},

	/** @type {PGTable} */
	entities: {
		name: 'entities',
		fields: [
			{ name: 'id', type: 'UUID', primary: true },
			{ name: 'tree_id', type: 'UUID', nulls: false },
			{ name: 'canonical_name_id', type: 'UUID', nulls: false },
			{ name: 'display_name', type: 'TEXT', nulls: false },
			{ name: 'family_name', type: 'TEXT' },
			{ name: 'search_name', type: 'TEXT', nulls: false },
			{ name: 'sex', type: 'TEXT' },
			{ name: 'birth_year', type: 'INTEGER' },
			{ name: 'death_year', type: 'INTEGER' },
			{ name: 'parent_count', type: 'INTEGER', nulls: false, default: '0' },
			{ name: 'child_count', type: 'INTEGER', nulls: false, default: '0' },
			{ name: 'spouse_count', type: 'INTEGER', nulls: false, default: '0' },
			{ name: 'notes', type: 'TEXT' },
			{ name: 'created_by', type: 'UUID', nulls: false },
			{ name: 'created_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' },
			{ name: 'modified_by', type: 'UUID', nulls: false },
			{ name: 'modified_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' }
		],
		foreignKeys: [
			{ fields: ['tree_id'], refTable: 'trees', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['canonical_name_id'], refTable: 'entity_names', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['created_by'], refTable: 'users', refFields: ['id'] },
			{ fields: ['modified_by'], refTable: 'users', refFields: ['id'] }
		],
		indexes: [
			{ fields: ['tree_id'] },
			{ fields: ['canonical_name_id'] },
			{ fields: ['display_name'] },
			{ fields: ['family_name'] },
			{
				name: 'entities_display_name_fts_idx',
				method: 'gin',
				expressions: [
					'to_tsvector(\'english\', display_name)'
				]
			},
			{
				name: 'entities_search_name_fts_idx',
				method: 'gin',
				expressions: [
					'to_tsvector(\'english\', search_name)'
				]
			},
			{ fields: ['sex'] },
			{ fields: ['birth_year'] },
			{ fields: ['death_year'] },
			{ fields: ['parent_count'] },
			{ fields: ['child_count'] },
			{ fields: ['spouse_count'] },
			{ fields: ['modified_by'] }
		],
		checks: [
			{ expression: 'sex IN (\'M\',\'F\') OR sex IS NULL' }
		]
	},

	/** @type {PGTable} */
	entityIdentifiers: {
		name: 'entity_identifiers',
		fields: [
			{ name: 'id', type: 'UUID', primary: true },
			{ name: 'tree_id', type: 'UUID', nulls: false },
			{ name: 'entity_id', type: 'UUID', nulls: false },
			{ name: 'system', type: 'TEXT', nulls: false },
			{ name: 'value', type: 'TEXT', nulls: false },
			{ name: 'created_by', type: 'UUID', nulls: false },
			{ name: 'created_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' },
			{ name: 'modified_by', type: 'UUID', nulls: false },
			{ name: 'modified_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' }
		],
		foreignKeys: [
			{ fields: ['tree_id'], refTable: 'trees', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['entity_id'], refTable: 'entities', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['created_by'], refTable: 'users', refFields: ['id'] },
			{ fields: ['modified_by'], refTable: 'users', refFields: ['id'] }
		],
		indexes: [
			{ fields: ['tree_id'] },
			{ fields: ['entity_id'] },
			{ fields: ['created_by'] },
			{ fields: ['modified_by'] }
		],
		unique: [
			{ fields: ['tree_id', 'entity_id', 'value'] }
		]
	},

	/** @type {PGTable} */
	factTypes: {
		name: 'fact_types',
		fields: [
			{ name: 'id', type: 'UUID', primary: true },
			{ name: 'tree_id', type: 'UUID' },
			{ name: 'entity_type_id', type: 'UUID', nulls: false },
			{ name: 'name', type: 'TEXT', nulls: false },
			{ name: 'description', type: 'TEXT' },
			{ name: 'is_custom', type: 'BOOLEAN', nulls: false, default: 'FALSE' },
			{ name: 'created_by', type: 'UUID', nulls: false },
			{ name: 'created_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' },
			{ name: 'modified_by', type: 'UUID', nulls: false },
			{ name: 'modified_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' }
		],
		foreignKeys: [
			{ fields: ['tree_id'], refTable: 'trees', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['entity_type_id'], refTable: 'entity_types', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['created_by'], refTable: 'users', refFields: ['id'] },
			{ fields: ['modified_by'], refTable: 'users', refFields: ['id'] }
		],
		indexes: [
			{ fields: ['tree_id'] },
			{ fields: ['entity_type_id'] },
			{ fields: ['created_by'] },
			{ fields: ['modified_by'] }
		],
		unique: [
			{ fields: ['tree_id', 'name', 'entity_type_id'] }
		]
	},

	// TODO explore cascading events like marriage -> spouse dies -> set fact "Marital Status" = "Widowed" and other derived facts for beta
	/** @type {PGTable} */
	facts: {
		name: 'facts',
		fields: [
			{ name: 'id', type: 'UUID', primary: true },
			{ name: 'tree_id', type: 'UUID', nulls: false },
			{ name: 'entity_type_id', type: 'UUID', nulls: false },
			{ name: 'fact_type_id', type: 'UUID', nulls: false },
			{ name: 'entity_id', type: 'UUID', nulls: false },
			{ name: 'value', type: 'TEXT', nulls: false },
			{ name: 'data', type: 'JSONB' },
			{ name: 'notes', type: 'TEXT' },
			{ name: 'is_custom', type: 'BOOLEAN', nulls: false, default: 'FALSE' },
			{ name: 'created_by', type: 'UUID', nulls: false },
			{ name: 'created_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' },
			{ name: 'modified_by', type: 'UUID', nulls: false },
			{ name: 'modified_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' }
		],
		foreignKeys: [
			{ fields: ['tree_id'], refTable: 'trees', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['entity_type_id'], refTable: 'entity_types', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['fact_type_id'], refTable: 'fact_types', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['entity_id'], refTable: 'entities', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['created_by'], refTable: 'users', refFields: ['id'] },
			{ fields: ['modified_by'], refTable: 'users', refFields: ['id'] }
		],
		indexes: [
			{ fields: ['tree_id'] },
			{ fields: ['entity_type_id'] },
			{ fields: ['fact_type_id'] },
			{ fields: ['entity_id'] },
			{ fields: ['created_by'] },
			{ fields: ['modified_by'] }
		],
		unique: [
			{ fields: ['tree_id', 'fact_type_id', 'entity_id'] }
		]
	},

	/** @type {PGTable} */
	places: {
		name: 'places',
		fields: [
			{ name: 'id', type: 'UUID', primary: true },
			{ name: 'place_type', type: 'TEXT', nulls: false },
			{ name: 'enclosed_by', type: 'UUID' },
			{ name: 'name', type: 'TEXT', nulls: false },
			{ name: 'sovereign_entity', type: 'TEXT' },
			{ name: 'sovereign_entity_id', type: 'UUID' },
			{ name: 'subdivision', type: 'TEXT' },
			{ name: 'subdivision_id', type: 'UUID' },
			{ name: 'administrative_division', type: 'TEXT' },
			{ name: 'administrative_division_id', type: 'UUID' },
			{ name: 'municipality', type: 'TEXT' },
			{ name: 'municipality_id', type: 'UUID' },
			{ name: 'latitude', type: 'DOUBLE PRECISION' },
			{ name: 'longitude', type: 'DOUBLE PRECISION' },
			{ name: 'description', type: 'TEXT' },
			{ name: 'address', type: 'TEXT' },
			{ name: 'google_place_id', type: 'TEXT' },
			{ name: 'notes', type: 'TEXT' },
			{ name: 'created_by', type: 'UUID', nulls: false },
			{ name: 'created_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' },
			{ name: 'modified_by', type: 'UUID', nulls: false },
			{ name: 'modified_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' }
		],
		foreignKeys: [
			{ fields: ['enclosed_by'], refTable: 'places', refFields: ['id'] },
			{ fields: ['sovereign_entity_id'], refTable: 'sovereign_entities', refFields: ['id'] },
			{ fields: ['subdivision_id'], refTable: 'subdivisions', refFields: ['id'] },
			{ fields: ['administrative_division_id'], refTable: 'administrative_divisions', refFields: ['id'] },
			{ fields: ['municipality_id'], refTable: 'municipalities', refFields: ['id'] },
			{ fields: ['created_by'], refTable: 'users', refFields: ['id'] },
			{ fields: ['modified_by'], refTable: 'users', refFields: ['id'] }
		],
		unique: [
			{ fields: ['place_type', 'name'] },
			{ fields: ['name', 'sovereign_entity_id', 'subdivision_id', 'administrative_division_id', 'municipality_id'] }
		],
		indexes: [
			{ fields: ['enclosed_by'] },
			{ fields: ['sovereign_entity_id'] },
			{ fields: ['subdivision_id'] },
			{ fields: ['administrative_division_id'] },
			{ fields: ['municipality_id'] },
			{ fields: ['created_by'] },
			{ fields: ['modified_by'] },
			{
				method: 'gin',
				fields: [
					{ field: 'name', opclass: 'gin_trgm_ops' }
				]
			}
		],
		checks: [
			{ expression: 'place_type ~ \'^[a-z][a-z_]*$\'' }
		]
	},

	/** @type {PGTable} */
	events: {
		name: 'events',
		fields: [
			{ name: 'id', type: 'UUID', primary: true },
			{ name: 'tree_id', type: 'UUID', nulls: false },
			{ name: 'entity_id', type: 'UUID', nulls: false },
			{ name: 'event_type', type: 'TEXT', nulls: false },
			{ name: 'event_sub_type', type: 'TEXT' },
			{ name: 'epoch', type: 'TEXT' },
			{ name: 'year', type: 'INTEGER' },
			{ name: 'month', type: 'INTEGER' },
			{ name: 'day', type: 'INTEGER' },
			{ name: 'hour', type: 'INTEGER' },
			{ name: 'minute', type: 'INTEGER' },
			{ name: 'second', type: 'INTEGER' },
			{ name: 'place_id', type: 'UUID' },
			{ name: 'description', type: 'TEXT' },
			{ name: 'notes', type: 'TEXT' },
			{ name: 'created_by', type: 'UUID', nulls: false },
			{ name: 'created_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' },
			{ name: 'modified_by', type: 'UUID', nulls: false },
			{ name: 'modified_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' }
		],
		foreignKeys: [
			{ fields: ['tree_id'], refTable: 'trees', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['entity_id'], refTable: 'entities', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['place_id'], refTable: 'places', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['created_by'], refTable: 'users', refFields: ['id'] },
			{ fields: ['modified_by'], refTable: 'users', refFields: ['id'] }
		],
		indexes: [
			{ fields: ['tree_id'] },
			{ fields: ['entity_id'] },
			{ fields: ['place_id'] },
			{ fields: ['created_by'] },
			{ fields: ['modified_by'] },
			{
				name: 'events_description_fts_idx',
				method: 'gin',
				expressions: [
					'to_tsvector(\'english\', description)'
				]
			}
		],
		unique: [
			{ fields: ['tree_id', 'entity_id', 'event_type', 'year', 'month', 'day', 'place_id'] }
		],
		checks: [
			{ expression: 'event_type ~ \'^[a-z][a-z_]*$\'' },
			{ expression: 'epoch IN (\'BC\',\'AD\')' },
			{ expression: 'month BETWEEN 1 AND 12' },
			{ expression: 'day BETWEEN 1 AND 31' },
			{ expression: 'hour BETWEEN 0 AND 23' },
			{ expression: 'minute BETWEEN 0 AND 59' },
			{ expression: 'second BETWEEN 0 AND 59' }
		]
	},

	/** @type {PGTable} */
	roleTypes: {
		name: 'role_types',
		fields: [
			{ name: 'id', type: 'UUID', primary: true },
			{ name: 'name', type: 'TEXT', nulls: false, unique: true },
			{ name: 'description', type: 'TEXT' },
			{ name: 'created_by', type: 'UUID', nulls: false },
			{ name: 'created_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' },
			{ name: 'modified_by', type: 'UUID', nulls: false },
			{ name: 'modified_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' }
		],
		foreignKeys: [
			{ fields: ['created_by'], refTable: 'users', refFields: ['id'] },
			{ fields: ['modified_by'], refTable: 'users', refFields: ['id'] }
		],
		indexes: [
			{ fields: ['name'] },
			{ fields: ['created_by'] },
			{ fields: ['modified_by'] }
		]
	},

	/** @type {PGTable} */
	eventRoles: {
		name: 'event_roles',
		fields: [
			{ name: 'id', type: 'UUID', primary: true },
			{ name: 'tree_id', type: 'UUID', nulls: false },
			{ name: 'event_id', type: 'UUID', nulls: false },
			{ name: 'entity_id', type: 'UUID', nulls: false },
			{ name: 'role', type: 'TEXT', nulls: false },
			{ name: 'role_type_id', type: 'UUID' },
			{ name: 'notes', type: 'TEXT' },
			{ name: 'created_by', type: 'UUID', nulls: false },
			{ name: 'created_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' },
			{ name: 'modified_by', type: 'UUID', nulls: false },
			{ name: 'modified_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' }
		],
		foreignKeys: [
			{ fields: ['tree_id'], refTable: 'trees', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['event_id'], refTable: 'events', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['entity_id'], refTable: 'entities', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['created_by'], refTable: 'users', refFields: ['id'] },
			{ fields: ['modified_by'], refTable: 'users', refFields: ['id'] }
		],
		indexes: [
			{ fields: ['tree_id'] },
			{ fields: ['event_id'] },
			{ fields: ['entity_id'] },
			{ fields: ['role'] },
			{ fields: ['role_type_id'] },
			{ fields: ['created_by'] },
			{ fields: ['modified_by'] }
		],
		unique: [
			{ fields: ['tree_id', 'event_id', 'entity_id', 'role', 'role_type_id'] }
		]
	},

	/** @type {PGTable} */
	repositories: {
		name: 'repositories',
		fields: [
			{ name: 'id', type: 'UUID', primary: true },
			{ name: 'tree_id', type: 'UUID', nulls: false },
			{ name: 'name', type: 'TEXT', nulls: false },
			{ name: 'type', type: 'TEXT', nulls: false },
			{ name: 'url', type: 'TEXT' },
			{ name: 'description', type: 'TEXT' },
			{ name: 'notes', type: 'TEXT' },
			{ name: 'created_by', type: 'UUID', nulls: false },
			{ name: 'created_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' },
			{ name: 'modified_by', type: 'UUID', nulls: false },
			{ name: 'modified_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' }
		],
		foreignKeys: [
			{ fields: ['tree_id'], refTable: 'trees', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['created_by'], refTable: 'users', refFields: ['id'] },
			{ fields: ['modified_by'], refTable: 'users', refFields: ['id'] }
		],
		indexes: [
			{ fields: ['tree_id'] },
			{ fields: ['created_by'] },
			{ fields: ['modified_by'] }
		],
		unique: [
			{ fields: ['tree_id', 'name'] }
		]
	},

	/** @type {PGTable} */
	sources: {
		name: 'sources',
		fields: [
			{ name: 'id', type: 'UUID', primary: true },
			{ name: 'tree_id', type: 'UUID', nulls: false },
			{ name: 'repository_id', type: 'UUID', nulls: false },
			{ name: 'title', type: 'TEXT', nulls: false },
			{ name: 'author', type: 'TEXT' },
			{ name: 'publication_info', type: 'TEXT' },
			{ name: 'abbreviation', type: 'TEXT' },
			{ name: 'type', type: 'TEXT' },
			{ name: 'url', type: 'TEXT' },
			{ name: 'data', type: 'JSONB' },
			{ name: 'notes', type: 'TEXT' },
			{ name: 'created_by', type: 'UUID', nulls: false },
			{ name: 'created_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' },
			{ name: 'modified_by', type: 'UUID', nulls: false },
			{ name: 'modified_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' }
		],
		foreignKeys: [
			{ fields: ['tree_id'], refTable: 'trees', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['repository_id'], refTable: 'repositories', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['created_by'], refTable: 'users', refFields: ['id'] },
			{ fields: ['modified_by'], refTable: 'users', refFields: ['id'] }
		],
		indexes: [
			{ fields: ['tree_id'] },
			{ fields: ['repository_id'] },
			{ fields: ['created_by'] },
			{ fields: ['modified_by'] },
			{
				method: 'gin',
				fields: [
					{ field: 'title', opclass: 'gin_trgm_ops' }
				]
			},
			{ method: 'gin', fields: ['data'] }
		],
		unique: [
			{ fields: ['tree_id', 'repository_id', 'title'] }
		],
		checks: [
			{ expression: 'type ~ \'^[a-z][a-z_]*$\'' }
		]
	},

	/** @type {PGTable} */
	citations: {
		name: 'citations',
		fields: [
			{ name: 'id', type: 'UUID', primary: true },
			{ name: 'tree_id', type: 'UUID', nulls: false },
			{ name: 'repository_id', type: 'UUID', nulls: false },
			{ name: 'source_id', type: 'UUID', nulls: false },
			{ name: 'page', type: 'TEXT', nulls: false },
			{ name: 'detail', type: 'TEXT' },
			{ name: 'epoch', type: 'TEXT' },
			{ name: 'year', type: 'INTEGER' },
			{ name: 'month', type: 'INTEGER' },
			{ name: 'day', type: 'INTEGER' },
			{ name: 'confidence', type: 'INTEGER' },
			{ name: 'notes', type: 'TEXT' },
			{ name: 'created_by', type: 'UUID', nulls: false },
			{ name: 'created_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' },
			{ name: 'modified_by', type: 'UUID', nulls: false },
			{ name: 'modified_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' }
		],
		foreignKeys: [
			{ fields: ['tree_id'], refTable: 'trees', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['repository_id'], refTable: 'repositories', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['source_id'], refTable: 'sources', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['created_by'], refTable: 'users', refFields: ['id'] },
			{ fields: ['modified_by'], refTable: 'users', refFields: ['id'] }
		],
		indexes: [
			{ fields: ['tree_id'] },
			{ fields: ['repository_id'] },
			{ fields: ['source_id'] },
			{ fields: ['created_by'] },
			{ fields: ['modified_by'] }
		],
		checks: [
			{ expression: 'epoch IN (\'BC\',\'AD\')' },
			{ expression: 'month BETWEEN 1 AND 12' },
			{ expression: 'day BETWEEN 1 AND 31' }
		]
	},

	/** @type {PGTable} */
	citationsMap: {
		name: 'citations_map',
		fields: [
			{ name: 'id', type: 'UUID', primary: true },
			{ name: 'tree_id', type: 'UUID', nulls: false },
			{ name: 'citation_id', type: 'UUID', nulls: false },
			{ name: 'target_table', type: 'TEXT', nulls: false },
			{ name: 'target_id', type: 'UUID', nulls: false },
			{ name: 'notes', type: 'TEXT' },
			{ name: 'created_by', type: 'UUID', nulls: false },
			{ name: 'created_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' },
			{ name: 'modified_by', type: 'UUID', nulls: false },
			{ name: 'modified_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' }
		],
		foreignKeys: [
			{ fields: ['tree_id'], refTable: 'trees', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['citation_id'], refTable: 'citations', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['created_by'], refTable: 'users', refFields: ['id'] },
			{ fields: ['modified_by'], refTable: 'users', refFields: ['id'] }
		],
		indexes: [
			{ fields: ['tree_id'] },
			{ fields: ['citation_id'] },
			{ fields: ['target_table'] },
			{ fields: ['target_id'] },
			{ fields: ['created_by'] },
			{ fields: ['modified_by'] }
		]
	},

	/** @type {PGTable} */
	tags: {
		name: 'tags',
		fields: [
			{ name: 'id', type: 'UUID', primary: true },
			{ name: 'tree_id', type: 'UUID', nulls: false },
			{ name: 'name', type: 'TEXT', nulls: false, unique: true },
			{ name: 'slug', type: 'TEXT', nulls: false, unique: true },
			{ name: 'description', type: 'TEXT' },
			{ name: 'color', type: 'TEXT' },
			{ name: 'created_by', type: 'UUID', nulls: false },
			{ name: 'created_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' },
			{ name: 'modified_by', type: 'UUID', nulls: false },
			{ name: 'modified_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' }
		],
		foreignKeys: [
			{ fields: ['tree_id'], refTable: 'trees', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['created_by'], refTable: 'users', refFields: ['id'] },
			{ fields: ['modified_by'], refTable: 'users', refFields: ['id'] }
		],
		indexes: [
			{ fields: ['tree_id'] },
			{ fields: ['created_by'] },
			{ fields: ['modified_by'] },
			{
				method: 'gin',
				fields: [
					{ field: 'name', opclass: 'gin_trgm_ops' }
				]
			}
		]
	},

	/** @type {PGTable} */
	tagsMap: {
		name: 'tags_map',
		fields: [
			{ name: 'id', type: 'UUID', primary: true },
			{ name: 'tree_id', type: 'UUID', nulls: false },
			{ name: 'tag_id', type: 'UUID', nulls: false },
			{ name: 'target_table', type: 'TEXT', nulls: false },
			{ name: 'target_id', type: 'UUID', nulls: false },
			{ name: 'created_by', type: 'UUID', nulls: false },
			{ name: 'created_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' },
			{ name: 'modified_by', type: 'UUID', nulls: false },
			{ name: 'modified_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' }
		],
		foreignKeys: [
			{ fields: ['tree_id'], refTable: 'trees', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['tag_id'], refTable: 'tags', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['created_by'], refTable: 'users', refFields: ['id'] },
			{ fields: ['modified_by'], refTable: 'users', refFields: ['id'] }
		],
		indexes: [
			{ fields: ['tree_id'] },
			{ fields: ['tag_id'] },
			{ fields: ['target_table'] },
			{ fields: ['target_id'] },
			{ fields: ['created_by'] },
			{ fields: ['modified_by'] }
		],
		unique: [
			{ fields: ['tree_id', 'tag_id', 'target_table', 'target_id'] }
		]
	},

	/** @type {PGTable} */
	media: {
		name: 'media',
		fields: [
			{ name: 'id', type: 'UUID', primary: true },
			{ name: 'tree_id', type: 'UUID', nulls: false },
			{ name: 'filename', type: 'TEXT', nulls: false },
			{ name: 'year', type: 'INTEGER', nulls: false },
			{ name: 'month', type: 'INTEGER', nulls: false },
			{ name: 'meta', type: 'JSONB' },
			{ name: 'notes', type: 'TEXT' },
			{ name: 'created_by', type: 'UUID', nulls: false },
			{ name: 'created_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' },
			{ name: 'modified_by', type: 'UUID', nulls: false },
			{ name: 'modified_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' }
		],
		foreignKeys: [
			{ fields: ['tree_id'], refTable: 'trees', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['created_by'], refTable: 'users', refFields: ['id'] },
			{ fields: ['modified_by'], refTable: 'users', refFields: ['id'] }
		],
		indexes: [
			{ fields: ['tree_id'] },
			{ fields: ['created_by'] },
			{ fields: ['modified_by'] },
			{ method: 'gin', fields: ['meta'] }
		],
		unique: [
			{ fields: ['tree_id', 'filename', 'year', 'month'] }
		],
		checks: [
			{ expression: 'month BETWEEN 1 AND 12' }
		]
	},

	/** @type {PGTable} */
	mediaMap: {
		name: 'media_map',
		fields: [
			{ name: 'id', type: 'UUID', primary: true },
			{ name: 'tree_id', type: 'UUID', nulls: false },
			{ name: 'media_id', type: 'UUID', nulls: false },
			{ name: 'target_table', type: 'TEXT', nulls: false },
			{ name: 'target_id', type: 'UUID', nulls: false },
			{ name: 'created_by', type: 'UUID', nulls: false },
			{ name: 'created_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' },
			{ name: 'modified_by', type: 'UUID', nulls: false },
			{ name: 'modified_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' }
		],
		foreignKeys: [
			{ fields: ['tree_id'], refTable: 'trees', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['media_id'], refTable: 'media', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['created_by'], refTable: 'users', refFields: ['id'] },
			{ fields: ['modified_by'], refTable: 'users', refFields: ['id'] }
		],
		indexes: [
			{ fields: ['tree_id'] },
			{ fields: ['media_id'] },
			{ fields: ['created_by'] },
			{ fields: ['modified_by'] }
		],
		unique: [
			{ fields: ['tree_id', 'media_id', 'target_table', 'target_id'] }
		]
	},

	/** @type {PGTable} */
	relationshipTypes: {
		name: 'relationship_types',
		fields: [
			{ name: 'id', type: 'UUID', primary: true },
			{ name: 'type', type: 'TEXT', nulls: false }, // canonical type
			{ name: 'direction', type: 'TEXT', nulls: false }, // 'forward' or 'parallel'
			{ name: 'main', type: 'BOOLEAN', nulls: false, default: 'FALSE' },
			{ name: 'name', type: 'TEXT', nulls: false }, // human-readable variant
			{ name: 'left_output', type: 'JSONB', nulls: false }, // { male, female, unknown }
			{ name: 'right_output', type: 'JSONB', nulls: false }, // { male, female, unknown }
			{ name: 'created_by', type: 'UUID', nulls: false },
			{ name: 'created_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' },
			{ name: 'modified_by', type: 'UUID', nulls: false },
			{ name: 'modified_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' }
		],
		foreignKeys: [
			{ fields: ['created_by'], refTable: 'users', refFields: ['id'] },
			{ fields: ['modified_by'], refTable: 'users', refFields: ['id'] }
		],
		checks: [
			{ expression: 'type ~ \'^[a-z][a-z_]*$\'' },
			{ expression: 'direction IN (\'forward\', \'parallel\')' }
		],
		unique: [
			{ fields: ['type', 'name'] }
		],
		indexes: [
			{ fields: ['type'] },
			{ fields: ['created_by'] },
			{ fields: ['modified_by'] }
		]
	},

	/** @type {PGTable} */
	relationships: {
		name: 'relationships',
		fields: [
			{ name: 'id', type: 'UUID', primary: true },
			{ name: 'tree_id', type: 'UUID', nulls: false },
			{ name: 'entity_id', type: 'UUID', nulls: false },
			{ name: 'related_entity_id', type: 'UUID', nulls: false },
			{ name: 'relationship_type_id', type: 'UUID', nulls: false }, // FIXED
			{ name: 'created_by', type: 'UUID', nulls: false },
			{ name: 'created_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' },
			{ name: 'modified_by', type: 'UUID', nulls: false },
			{ name: 'modified_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' }
		],
		foreignKeys: [
			{ fields: ['tree_id'], refTable: 'trees', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['entity_id'], refTable: 'entities', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['related_entity_id'], refTable: 'entities', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['relationship_type_id'], refTable: 'relationship_types', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['created_by'], refTable: 'users', refFields: ['id'] },
			{ fields: ['modified_by'], refTable: 'users', refFields: ['id'] }
		],
		checks: [
			{ expression: 'entity_id <> related_entity_id' }
		],
		unique: [
			{ fields: ['tree_id', 'entity_id', 'related_entity_id', 'relationship_type_id'] } // FIXED
		],
		indexes: [
			{ fields: ['tree_id'] },
			{ fields: ['entity_id'] },
			{ fields: ['related_entity_id'] },
			{ fields: ['relationship_type_id'] }, // ADDED
			{ fields: ['created_by'] },
			{ fields: ['modified_by'] }
		]
	}

}

const pgFunctions = [
	{
		code:
			`CREATE OR REPLACE FUNCTION get_entity_tree(p_entity_id UUID)
			RETURNS TABLE (
				level        INTEGER,
				entity_id    UUID,
				display_name TEXT,
				birth_year   INTEGER,
				death_year   INTEGER,
				sex          TEXT
			)
			LANGUAGE sql
			AS $$
			WITH RECURSIVE ancestors AS (
				-- parents of root (level -1)
				SELECT
					r.entity_id AS id,      -- parent
					-1 AS level
				FROM relationships r
				JOIN relationship_types rt
					ON rt.id = r.relationship_type_id
				WHERE rt.type = 'parent'
				AND rt.direction = 'forward'
				AND r.related_entity_id = p_entity_id   -- child = root

				UNION ALL

				-- walk upward
				SELECT
					r.entity_id AS id,      -- parent
					a.level - 1
				FROM relationships r
				JOIN relationship_types rt
					ON rt.id = r.relationship_type_id
				JOIN ancestors a
					ON r.related_entity_id = a.id         -- child = current ancestor
				WHERE rt.type = 'parent'
				AND rt.direction = 'forward'
			),

			descendants AS (
				-- children of root (level +1)
				SELECT
					r.related_entity_id AS id,  -- child
					1 AS level
				FROM relationships r
				JOIN relationship_types rt
					ON rt.id = r.relationship_type_id
				WHERE rt.type = 'parent'
				AND rt.direction = 'forward'
				AND r.entity_id = p_entity_id           -- parent = root

				UNION ALL

				-- walk downward
				SELECT
					r.related_entity_id AS id,  -- child
					d.level + 1
				FROM relationships r
				JOIN relationship_types rt
					ON rt.id = r.relationship_type_id
				JOIN descendants d
					ON r.entity_id = d.id                 -- parent = current descendant
				WHERE rt.type = 'parent'
				AND rt.direction = 'forward'
			),

			root AS (
				SELECT p_entity_id AS id, 0 AS level
			),

			combined AS (
				SELECT * FROM root
				UNION ALL SELECT * FROM ancestors
				UNION ALL SELECT * FROM descendants
			)

			SELECT DISTINCT ON (combined.level, ent.id)
				combined.level,
				ent.id AS entity_id,
				ent.display_name,
				birth.year AS birth_year,
				death.year AS death_year,
				ent.sex
			FROM combined
			JOIN entities ent ON ent.id = combined.id
			LEFT JOIN events birth
				ON birth.entity_id = ent.id
			AND birth.event_type = 'birth'
			LEFT JOIN events death
				ON death.entity_id = ent.id
			AND death.event_type = 'death'
			ORDER BY combined.level, ent.id;
			$$;`
	},
	{
		code:
			`CREATE OR REPLACE FUNCTION update_single_entity_counts(ent_id UUID)
			RETURNS VOID AS $$
			BEGIN
				--------------------------------------------------------------------
				-- Recalculate parent_count (how many parents this entity has)
				--------------------------------------------------------------------
				UPDATE entities e SET parent_count = (
					SELECT COUNT(*)
					FROM relationships r
					JOIN relationship_types rt ON rt.id = r.relationship_type_id
					WHERE r.related_entity_id = e.id
					AND rt.type = 'parent'
					AND rt.direction = 'forward'
				)
				WHERE e.id = ent_id;

				--------------------------------------------------------------------
				-- Recalculate child_count (how many children this entity has)
				--------------------------------------------------------------------
				UPDATE entities e SET child_count = (
					SELECT COUNT(*)
					FROM relationships r
					JOIN relationship_types rt ON rt.id = r.relationship_type_id
					WHERE r.entity_id = e.id
					AND rt.type = 'parent'
					AND rt.direction = 'forward'
				)
				WHERE e.id = ent_id;

				--------------------------------------------------------------------
				-- Recalculate spouse_count
				--------------------------------------------------------------------
				UPDATE entities e SET spouse_count = (
					SELECT COUNT(*)
					FROM relationships r
					JOIN relationship_types rt ON rt.id = r.relationship_type_id
					WHERE (r.entity_id = e.id OR r.related_entity_id = e.id)
					AND rt.type = 'partner'
					AND rt.direction = 'parallel'
				)
				WHERE e.id = ent_id;
			END;
			$$ LANGUAGE plpgsql;`
	}
]

const pgTriggers = [
	{
		name: 'relationships_tree_consistency_trigger',
		function:
			`CREATE OR REPLACE FUNCTION relationships_tree_consistency()
			RETURNS trigger AS $$
			BEGIN
				PERFORM 1
				FROM entities e
				WHERE e.id = NEW.entity_id
				AND e.tree_id = NEW.tree_id;

				IF NOT FOUND THEN
					RAISE EXCEPTION
						'entity_id % does not belong to tree_id %',
						NEW.entity_id, NEW.tree_id;
				END IF;

				PERFORM 1
				FROM entities e
				WHERE e.id = NEW.related_entity_id
				AND e.tree_id = NEW.tree_id;

				IF NOT FOUND THEN
					RAISE EXCEPTION
						'related_entity_id % does not belong to tree_id %',
						NEW.related_entity_id, NEW.tree_id;
				END IF;

				RETURN NEW;
			END;
			$$ LANGUAGE plpgsql;`,
		timing: 'BEFORE',
		events: ['INSERT', 'UPDATE'],
		table: 'relationships',
		forEach: 'ROW',
		functionName: 'relationships_tree_consistency()'
	},

	{
		name: 'update_birth_year_trigger',
		function:
			`CREATE OR REPLACE FUNCTION update_birth_year()
			RETURNS TRIGGER AS $$
			BEGIN
				-- INSERT or UPDATE
				IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
					IF NEW.event_type = 'birth' THEN
						UPDATE entities
						SET birth_year = NEW.year
						WHERE id = NEW.entity_id;
					END IF;

					-- If event_type changed away from birth, clear the field
					IF TG_OP = 'UPDATE' AND OLD.event_type = 'birth' AND NEW.event_type <> 'birth' THEN
						UPDATE entities
						SET birth_year = NULL
						WHERE id = OLD.entity_id;
					END IF;

					RETURN NEW;
				END IF;

				-- DELETE
				IF TG_OP = 'DELETE' THEN
					IF OLD.event_type = 'birth' THEN
						UPDATE entities
						SET birth_year = NULL
						WHERE id = OLD.entity_id;
					END IF;

					RETURN OLD;
				END IF;

				RETURN NULL;
			END;
			$$ LANGUAGE plpgsql;`,
		timing: 'AFTER',
		events: ['INSERT', 'UPDATE', 'DELETE'],
		table: 'events',
		forEach: 'ROW',
		functionName: 'update_birth_year()'
	},

	{
		name: 'update_death_year_trigger',
		function:
			`CREATE OR REPLACE FUNCTION update_death_year()
			RETURNS TRIGGER AS $$
			BEGIN
				-- INSERT or UPDATE
				IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
					IF NEW.event_type = 'death' THEN
						UPDATE entities
						SET death_year = NEW.year
						WHERE id = NEW.entity_id;
					END IF;

					-- If event_type changed away from death, clear the field
					IF TG_OP = 'UPDATE' AND OLD.event_type = 'death' AND NEW.event_type <> 'death' THEN
						UPDATE entities
						SET death_year = NULL
						WHERE id = OLD.entity_id;
					END IF;

					RETURN NEW;
				END IF;

				-- DELETE
				IF TG_OP = 'DELETE' THEN
					IF OLD.event_type = 'death' THEN
						UPDATE entities
						SET death_year = NULL
						WHERE id = OLD.entity_id;
					END IF;

					RETURN OLD;
				END IF;

				RETURN NULL;
			END;
			$$ LANGUAGE plpgsql;`,
		timing: 'AFTER',
		events: ['INSERT', 'UPDATE', 'DELETE'],
		table: 'events',
		forEach: 'ROW',
		functionName: 'update_death_year()'
	},

	{
		name: 'update_relationship_counts_trigger',
		function:
			`CREATE OR REPLACE FUNCTION update_relationship_counts()
			RETURNS TRIGGER AS $$
			BEGIN
				--------------------------------------------------------------------
				-- Determine the affected entities
				--------------------------------------------------------------------
				-- For INSERT/UPDATE: NEW contains entity_id and related_entity_id
				-- For DELETE: OLD contains entity_id and related_entity_id

				-- Parent (entity_id)
				PERFORM update_single_entity_counts(
					CASE WHEN TG_OP = 'DELETE' THEN OLD.entity_id ELSE NEW.entity_id END
				);

				-- Child (related_entity_id)
				PERFORM update_single_entity_counts(
					CASE WHEN TG_OP = 'DELETE' THEN OLD.related_entity_id ELSE NEW.related_entity_id END
				);

				RETURN COALESCE(NEW, OLD);
			END;
			$$ LANGUAGE plpgsql;`,
		timing: 'AFTER',
		events: ['INSERT', 'UPDATE', 'DELETE'],
		table: 'relationships',
		forEach: 'ROW',
		functionName: 'update_relationship_counts()'
	}
]

const pgViews = [
	{
		code:
			`create or replace view geography_flat as

			-- Level 1: sovereign only
			select
				se.id   as se_id,
				se.name as se_name,
				null::uuid as sd_id,
				null::text as sd_name,
				null::uuid as ad_id,
				null::text as ad_name,
				null::uuid as mu_id,
				null::text as mu_name,
				concat_ws(', ', se.name) as full_name
			from sovereign_entities se

			union all

			-- Level 2: sovereign + subdivision
			select
				se.id   as se_id,
				se.name as se_name,
				s.id    as sd_id,
				s.name  as sd_name,
				null::uuid as ad_id,
				null::text as ad_name,
				null::uuid as mu_id,
				null::text as mu_name,
				concat_ws(', ', se.name, s.name) as full_name
			from sovereign_entities se
			join subdivisions s
				on s.sovereign_entity_id = se.id

			union all

			-- Level 3: sovereign + subdivision + admin division
			select
				se.id   as se_id,
				se.name as se_name,
				s.id    as sd_id,
				s.name  as sd_name,
				ad.id   as ad_id,
				ad.name as ad_name,
				null::uuid as mu_id,
				null::text as mu_name,
				concat_ws(', ', se.name, s.name, ad.name) as full_name
			from sovereign_entities se
			join subdivisions s
				on s.sovereign_entity_id = se.id
			join administrative_divisions ad
				on ad.subdivision_id = s.id

			union all

			-- Level 4: full path down to municipality
			select
				se.id   as se_id,
				se.name as se_name,
				s.id    as sd_id,
				s.name  as sd_name,
				ad.id   as ad_id,
				ad.name as ad_name,
				m.id    as mu_id,
				m.name  as mu_name,
				concat_ws(', ', se.name, s.name, ad.name, m.name) as full_name
			from sovereign_entities se
			join subdivisions s
				on s.sovereign_entity_id = se.id
			join administrative_divisions ad
				on ad.subdivision_id = s.id
			join municipalities m
				on m.administrative_division_id = ad.id

			order by
				se_name, sd_name, ad_name, mu_name;`
	}
]

module.exports = { pgTables, pgFunctions, pgTriggers, pgViews }
