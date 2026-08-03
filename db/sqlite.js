const Database = require('better-sqlite3')

/**
 * @typedef {Object} SQLiteField
 * @property {String} name - name of the field
 * @property {String} type - SQLite field type (e.g. INTEGER, TEXT, REAL)
 * @property {Boolean} [nulls] - whether nulls are allowed (default: true)
 * @property {Boolean} [unique] - whether the field must be unique (default: false)
 * @property {Boolean} [skip] - whether to skip this field in inserts/updates
 */

/**
 * @typedef {Object} SQLiteIndex
 * @property {String[]} fields - field names included in the index
 */

/**
 * @typedef {Object} SQLiteForeignKeyReferences
 * @property {String} table - referenced table name
 * @property {String[]} fields - referenced column names
 * @property {String} [onDelete] - ON DELETE action (e.g. 'CASCADE', 'SET NULL', 'RESTRICT')
 */

/**
 * @typedef {Object} SQLiteForeignKey
 * @property {String[]} fields - local column names
 * @property {SQLiteForeignKeyReferences} references - reference definition
 */

/**
 * @typedef {Object} SQLiteTable
 * @property {String} name - table name
 * @property {SQLiteField[]} fields - table fields
 * @property {String} key - raw SQL fragment inserted into PRIMARY KEY(...), e.g. '"id"', '"id" AUTOINCREMENT', or '"a","b"'
 * @property {SQLiteForeignKey[]} [foreignKeys] - optional foreign keys
 * @property {SQLiteIndex[]} [indexes] - optional indexes
 */

class sqliteDb {
	constructor(dbPath, debug = false) {
		this.db = debug
			? new Database(dbPath, { verbose: console.log })
			: new Database(dbPath)
	}

	// ------------------------------
	// Helpers
	// ------------------------------

	buildFieldList(table) {
		return table.fields
			.filter(f => !f.skip)
			.map(f => f.name)
	}

	// ------------------------------
	// Schema
	// ------------------------------

	/**
	 * Create a new SQLite table dropping any existing one of the same name
	 * @param {SQLiteTable} table - table definition
	 */
	createTable(table) {
		this.db.exec(`DROP TABLE IF EXISTS ${table.name};`)

		let create = `CREATE TABLE "${table.name}" (\n`

		for (const field of table.fields) {
			create += `\t"${field.name}" ${field.type}`
			if (field.nulls === false) create += ' NOT NULL'
			if (field.unique) create += ' UNIQUE'
			create += ',\n'
		}

		create += `\tPRIMARY KEY(${table.key})`

		if (table.foreignKeys) {
			for (const fk of table.foreignKeys) {
				const cols = fk.fields.map(f => `"${f}"`).join(', ')
				const refCols = fk.references.fields.map(f => `"${f}"`).join(', ')
				create += `,\n\tFOREIGN KEY (${cols}) REFERENCES "${fk.references.table}" (${refCols})`
				if (fk.references.onDelete) {
					create += ` ON DELETE ${fk.references.onDelete}`
				}
			}
		}

		create += '\n);\n'

		this.db.exec(create)

		if (table.indexes) {
			for (const idx of table.indexes) {
				const idxName = `idx_${table.name}_${idx.fields.join('_')}`
				const cols = idx.fields.map(f => `"${f}"`).join(', ')
				this.db.exec(`CREATE INDEX "${idxName}" ON "${table.name}" (${cols});`)
			}
		}
	}

	// ------------------------------
	// New API (primary)
	// ------------------------------

	/**
	 * Get a single row from a SQLite table
	 * @param {String} sql - SQL query to execute
	 * @param {Object} [params] - optional named parameters
	 * @returns {Object|null} - row object or null if no match
	 */
	async get(sql, params) {
		try {
			return params
				? this.db.prepare(sql).get(params)
				: this.db.prepare(sql).get()
		} catch (error) {
			console.log({ error, sql, params })
			throw error
		}
	}

	/**
	 * Get one or more rows from a SQLite table
	 * @param {String} sql - SQL query to execute
	 * @param {Object} [params] - optional named parameters
	 * @returns {Object[]} - array of rows (empty array if no matches)
	 */
	async query(sql, params) {
		try {
			return params
				? this.db.prepare(sql).all(params)
				: this.db.prepare(sql).all()
		} catch (error) {
			console.log({ error, sql, params })
			throw error
		}
	}

	/**
	 * Execute an arbitrary SQL statement
	 * @param {String} sql - SQL statement to execute
	 * @param {Object} [params] - optional named parameters
	 * @returns {import('better-sqlite3').RunResult} - result containing `changes` and `lastInsertRowid`
	 */
	async execute(sql, params) {
		try {
			return params
				? this.db.prepare(sql).run(params)
				: this.db.prepare(sql).run()
		} catch (error) {
			console.log({ error, sql, params })
			throw error
		}
	}

	/**
	 * Insert a row into a table
	 * @param {SQLiteTable} table - table definition
	 * @param {Object} data - values to insert
	 * @returns {Number} - id of the new row
	 */
	async insert(table, data) {
		const fields = this.buildFieldList(table)
		const values = fields.map(f => `@${f}`)
		const sql = `INSERT INTO ${table.name} (${fields.join(', ')}) VALUES (${values.join(', ')});`

		try {
			const info = this.db.prepare(sql).run(data)
			return info.lastInsertRowid
		} catch (error) {
			console.log({ error, data, statement: sql })
			throw error
		}
	}

	/**
	 * Create a prepared insert statement for batch inserts
	 * @param {SQLiteTable} table - table definition
	 * @returns {import('better-sqlite3').Statement} - prepared statement
	 */
	prepareInsert(table) {
		const insertFields = this.buildFieldList(table)
		const insertValues = insertFields.map(f => `@${f}`)
		const sql = `INSERT INTO ${table.name} (${insertFields.join(', ')})
                 VALUES (${insertValues.join(', ')});`
		return this.db.prepare(sql)
	}

	// ------------------------------
	// Transactions
	// ------------------------------

	/**
	 * Begin a SQLite transaction
	 * @returns {true} - returns true unless an error is thrown
	 */
	async begin() {
		try {
			this.db.prepare('BEGIN').run()
			return true
		} catch (error) {
			console.log({ error, statement: 'BEGIN' })
			throw error
		}
	}

	/**
	 * Commit a SQLite transaction
	 * @returns {true} - returns true unless an error is thrown
	 */
	async commit() {
		try {
			this.db.prepare('COMMIT').run()
			return true
		} catch (error) {
			console.log({ error, statement: 'COMMIT' })
			throw error
		}
	}

	/**
	 * Roll back a SQLite transaction
	 * @returns {true} - returns true unless an error is thrown
	 */
	async rollback() {
		try {
			this.db.prepare('ROLLBACK').run()
			return true
		} catch (error) {
			console.log({ error, statement: 'ROLLBACK' })
			throw error
		}
	}
}

module.exports = sqliteDb
