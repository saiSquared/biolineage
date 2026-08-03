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
	trees: {
		name: 'trees',
		fields: [
			{ name: 'id', type: 'UUID', primary: true },
			{ name: 'owner_id', type: 'UUID', nulls: false },
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
			{ fields: ['created_by'], refTable: 'users', refFields: ['id'] },
			{ fields: ['modified_by'], refTable: 'users', refFields: ['id'] }
		],
		indexes: [
			{ fields: ['owner_id'] },
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
			{ name: 'preferred_name', type: 'TEXT' },
			{ name: 'description', type: 'TEXT' },
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
			{ fields: ['tree_id', 'entity_id', 'name_type'] }
		]
	},

	/** @type {PGTable} */
	entities: {
		name: 'entities',
		fields: [
			{ name: 'id', type: 'UUID', primary: true },
			{ name: 'tree_id', type: 'UUID', nulls: false },
			{ name: 'entity_type_id', type: 'UUID', nulls: false },
			{ name: 'canonical_name_id', type: 'UUID' },
			{ name: 'display_name', type: 'TEXT', nulls: false },
			{ name: 'sex', type: 'TEXT' },
			{ name: 'notes', type: 'TEXT' },
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
			{ fields: ['canonical_name_id'] },
			{ fields: ['created_by'] },
			{ fields: ['modified_by'] },
			{
				name: 'entities_display_name_fts_idx',
				method: 'gin',
				expressions: [
					'to_tsvector(\'english\', display_name)'
				]
			}
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
	eventCitations: {
		name: 'event_citations',
		fields: [
			{ name: 'id', type: 'UUID', primary: true },
			{ name: 'tree_id', type: 'UUID', nulls: false },
			{ name: 'event_id', type: 'UUID', nulls: false },
			{ name: 'citation_id', type: 'UUID', nulls: false },
			{ name: 'notes', type: 'TEXT' },
			{ name: 'created_by', type: 'UUID', nulls: false },
			{ name: 'created_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' },
			{ name: 'modified_by', type: 'UUID', nulls: false },
			{ name: 'modified_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' }
		],
		foreignKeys: [
			{ fields: ['tree_id'], refTable: 'trees', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['event_id'], refTable: 'events', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['citation_id'], refTable: 'citations', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['created_by'], refTable: 'users', refFields: ['id'] },
			{ fields: ['modified_by'], refTable: 'users', refFields: ['id'] }
		],
		indexes: [
			{ fields: ['tree_id'] },
			{ fields: ['event_id'] },
			{ fields: ['citation_id'] },
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
	relationships: {
		name: 'relationships',
		fields: [
			{ name: 'id', type: 'UUID', primary: true },
			{ name: 'tree_id', type: 'UUID', nulls: false },
			{ name: 'entity_id', type: 'UUID', nulls: false },
			{ name: 'related_entity_id', type: 'UUID', nulls: false },
			{ name: 'relationship_type', type: 'TEXT', nulls: false },
			{ name: 'direction', type: 'TEXT', nulls: false },
			{ name: 'event_id', type: 'UUID' },
			{ name: 'place_id', type: 'UUID' },
			{ name: 'created_by', type: 'UUID', nulls: false },
			{ name: 'created_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' },
			{ name: 'modified_by', type: 'UUID', nulls: false },
			{ name: 'modified_date', type: 'TIMESTAMPTZ', nulls: false, default: 'NOW()' }
		],
		foreignKeys: [
			{ fields: ['tree_id'], refTable: 'trees', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['entity_id'], refTable: 'entities', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['related_entity_id'], refTable: 'entities', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['event_id'], refTable: 'events', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['place_id'], refTable: 'places', refFields: ['id'], onDelete: 'CASCADE' },
			{ fields: ['created_by'], refTable: 'users', refFields: ['id'] },
			{ fields: ['modified_by'], refTable: 'users', refFields: ['id'] }
		],
		checks: [
			{ expression: 'relationship_type ~ \'^[a-z][a-z_]*$\'' },
			{ expression: 'direction IN (\'forward\', \'symmetric\', \'reverse\')' },
			{ expression: 'entity_id <> related_entity_id' },
			{ expression: '(direction <> \'symmetric\' OR entity_id < related_entity_id)' }
		],
		unique: [
			{ fields: ['tree_id', 'entity_id', 'related_entity_id', 'relationship_type'] }
		],
		indexes: [
			{ fields: ['tree_id'] },
			{ fields: ['entity_id'] },
			{ fields: ['related_entity_id'] },
			{ fields: ['event_id'] },
			{ fields: ['place_id'] },
			{ fields: ['created_by'] },
			{ fields: ['modified_by'] }
		]
	}

}

const pgForeignKeys = [
	{ table: 'entity_names', fields: ['entity_id'], refTable: 'entities', refFields: ['id'], onDelete: 'CASCADE' },
	{ table: 'entities', fields: ['canonical_name_id'], refTable: 'entity_names', refFields: ['id'], onDelete: 'CASCADE' }
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
	}
]

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
					r.entity_id AS id,          -- parent
					-1 AS level
				FROM relationships r
				WHERE r.relationship_type = 'parent'
				AND r.direction = 'forward'
				AND r.related_entity_id = p_entity_id      -- child = root

				UNION ALL

				-- walk upward
				SELECT
					r.entity_id AS id,          -- parent
					a.level - 1
				FROM relationships r
				JOIN ancestors a
				ON r.related_entity_id = a.id             -- child = current ancestor
				WHERE r.relationship_type = 'parent'
				AND r.direction = 'forward'
			),

			descendants AS (
				-- children of root (level +1)
				SELECT
					r.related_entity_id AS id,  -- child
					1 AS level
				FROM relationships r
				WHERE r.relationship_type = 'parent'
				AND r.direction = 'forward'
				AND r.entity_id = p_entity_id             -- parent = root

				UNION ALL

				-- walk downward
				SELECT
					r.related_entity_id AS id,  -- child
					d.level + 1
				FROM relationships r
				JOIN descendants d
				ON r.entity_id = d.id                         -- parent = current descendant
				WHERE r.relationship_type = 'parent'
				AND r.direction = 'forward'
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
	}
]

module.exports = { pgTables, pgForeignKeys, pgTriggers, pgFunctions }
