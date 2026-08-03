const { Pool } = require('pg')

/**
 * @typedef {Object} PGParamsCheck
 * @property {Boolean} ok - whether the number of params equalled the number of replacement occurences
 * @property {String} sql - SQL with parameters substituted for debugging purposes
 * @property {String} [error] - error message
 */

/**
 * A plain object where keys are column names and values are field values.
 * @typedef {Object.<string, *>} PGRowObject - key/value pair
 */

/**
 * @typedef {Object} PGOperationResults
 * @property {Number} [changes] - number of rows inserted, updated, or deleted
 * @property {*} [newId] - primary key of inserted row (if applicable)
 */

/**
 * @typedef {Object} PGConfig
 * @property {String} host - server address
 * @property {Number} port - server port
 * @property {String} user - database user
 * @property {String} password - database user password
 * @property {String} database - database to open
 */

/**
 * @typedef {Object} PGEngine
 * @property {Function} createTable
 * @property {Function} createForeignKeys
 * @property {Function} createTriggers
 * @property {Function} createFunctions
 * @property {Function} createViews
 * @property {Function} insert
 * @property {Function} update
 * @property {Function} delete
 * @property {Function} query
 * @property {Function} get
 * @property {Function} run
 * @property {Function} begin
 * @property {Function} commit
 * @property {Function} rollback
 * @property {Function} close
 */

/**
 * PostgreSQL database adapter
 * @param {PGConfig} config - PostgreSQL configuration object
 * @param {Boolean} debug  - whether to output SQL to console
 * @returns {PGEngine}
 */
function pgDb(config, debug) {
	let pool = null
	let tx = null // active transaction client

	try {
		pool = new Pool(config)
	} catch (error) {
		throw new Error(`Unable to connect\nERR: ${error.message}`)
	}

	return {

		/**
		 * Convert camelCase to snake_case
		 * @param {String} str - string to convert
		 * @returns {String}
		 */
		_camelCaseToSnakeCase(str) {
			return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
		},

		/**
         * Validate parameter count and build debug SQL
		 * @returns {PGParamsCheck}
         */
		_checkParams(sql, params) {
			const expected = (sql.match(/\$\d+/g) || []).length
			if (expected !== params.length) {
				return {
					ok: false,
					sql,
					error: `Params count is ${params.length}, but ${expected} placeholders found`
				}
			}

			// Build debug SQL by replacing $1, $2, ... with formatted values
			let debugSql = sql
			params.forEach((v, i) => {
				const placeholder = `$${i + 1}`
				debugSql = debugSql.replace(placeholder, this._formatValue(v))
			})

			return { ok: true, sql: debugSql }
		},

		/**
         * Format values for debugging SQL
		 * @returns {String|Number}
         */
		_formatValue(value) {
			if (value === null) return 'NULL'
			switch (typeof value) {
				case 'string':
					return `'${String(value).replace(/'/g, "''")}'`
				case 'number':
					return value
				case 'boolean':
					return value ? 'TRUE' : 'FALSE'
				case 'object':
					return `'${JSON.stringify(value).replace(/'/g, "''")}' /*json*/`
				default:
					return '**ERROR**'
			}
		},

		/**
		 * Convert row fields from camelCase to snake_case
		 * @param {PGRowObject} obj - object with key/value pairs
		 * @returns {PGRowObject}
		 */
		_jsToPg(obj) {
			const ret = {}
			for (const [key, value] of Object.entries(obj)) {
				ret[this._camelCaseToSnakeCase(key)] = value
			}
			return ret
		},

		/**
		 * Convert row fields from snake_case to camelCase
		 * @param {PGRowObject} obj - object with key/value pairs
		 * @returns {PGRowObject}
		 */
		_pgToJs(obj) {
			const ret = {}
			for (const [key, value] of Object.entries(obj)) {
				ret[this._snakeCaseToCamelCase(key)] = value
			}
			return ret
		},

		/**
		 * Convert snake_case to camelCase
		 * @param {String} str - string to convert
		 * @returns {String}
		 */
		_snakeCaseToCamelCase(str) {
			return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
		},

		/**
         * Close the database
         */
		async close() {
			if (tx) {
				try {
					await tx.query('ROLLBACK')
				} catch (err) {
					console.error('Postgres: rollback failed during close():', err)
				} finally {
					try {
						tx.release()
					} catch (releaseErr) {
						console.error('Postgres: release failed during close():', releaseErr)
					}
					tx = null
				}
			}

			if (pool) {
				await pool.end()
			}
		},

		/**
         * Start a Transaction
         */
		async begin() {
			if (tx) throw new Error('Transaction already active')
			try {
				tx = await pool.connect()
				await tx.query('BEGIN')
			} catch (error) {
				throw new Error(`Unable to BEGIN transaction\nERR: ${error.message}`)
			}
		},

		/**
         * Commit a transaction
         */
		async commit() {
			if (!tx) throw new Error('No active transaction')
			try {
				await tx.query('COMMIT')
			} catch (error) {
				throw new Error(`Unable to COMMIT transaction\nERR: ${error.message}`)
			} finally {
				try {
					tx.release()
				} catch (releaseErr) {
					console.error('Postgres: failed to release transaction connection:', releaseErr)
				}
				tx = null
			}
		},

		/**
         * Rollback a Transaction
         */
		async rollback() {
			if (!tx) throw new Error('No active transaction')
			try {
				await tx.query('ROLLBACK')
			} catch (error) {
				throw new Error(`Unable to ROLLBACK transaction\nERR: ${error.message}`)
			} finally {
				try {
					tx.release()
				} catch (releaseErr) {
					console.error('Postgres: failed to release transaction connection:', releaseErr)
				}
				tx = null
			}
		},

		/**
		 * Create table in database dropping existing version if it exists
		 * @param {import('./pg-definitions').PGTable} table - database table definition
		 */
		async createTable(table) {
			const c = tx || await pool.connect()
			let debugSql

			try {
				debugSql = `DROP TABLE IF EXISTS "${table.name}" CASCADE;`
				await c.query(`DROP TABLE IF EXISTS "${table.name}" CASCADE;`)

				debugSql = `CREATE TABLE "${table.name}" (\n`
				const columnDefs = []
				const fkConstraints = []
				const uniqueConstraints = []
				const checkConstraints = []

				// -----------------------------
				// Columns
				// -----------------------------
				for (const field of table.fields) {
					let col = `"${field.name}" ${field.type}`

					if (field.primary) {
						col += ' PRIMARY KEY'
					} else {
						if (field.nulls === false) col += ' NOT NULL'

						if (field.unique) {
							if (typeof field.unique === 'string') {
								col += ` CONSTRAINT ${field.unique} UNIQUE`
							} else {
								col += ' UNIQUE'
							}
						}
					}

					if (field.default !== undefined) {
						col += ` DEFAULT ${field.default}`
					}

					columnDefs.push(col)
				}

				// -----------------------------
				// Foreign Keys (new array form)
				// -----------------------------
				if (table.foreignKeys) {
					for (const fk of table.foreignKeys) {
						const fields = fk.fields.map(f => `"${f}"`).join(', ')
						const refFields = fk.refFields.map(f => `"${f}"`).join(', ')

						const constraintName =
							fk.name || `${table.name}_${fk.fields.join('_')}_fk`

						let fkSql =
                    `CONSTRAINT "${constraintName}" FOREIGN KEY (${fields}) ` +
                    `REFERENCES "${fk.refTable}" (${refFields})`

						if (fk.onDelete) fkSql += ` ON DELETE ${fk.onDelete}`
						if (fk.onUpdate) fkSql += ` ON UPDATE ${fk.onUpdate}`

						fkConstraints.push(fkSql)
					}
				}

				// -----------------------------
				// Unique Constraints
				// -----------------------------
				if (table.unique) {
					for (const uq of table.unique) {
						const constraintName =
							uq.name || `${table.name}_${uq.fields.join('_')}_unique`
						const fieldList = uq.fields.map(f => `"${f}"`).join(', ')
						uniqueConstraints.push(`CONSTRAINT "${constraintName}" UNIQUE (${fieldList})`)
					}
				}

				// -----------------------------
				// Check Constraints
				// -----------------------------
				if (table.checks) {
					let i = 1
					for (const chk of table.checks) {
						const checkName =
							chk.name || `${table.name}_${i}_check`
						checkConstraints.push(`CONSTRAINT "${checkName}" CHECK (${chk.expression})`)
						i++
					}
				}

				// -----------------------------
				// Final assembly
				// -----------------------------
				debugSql += columnDefs.join(',\n')

				// -----------------------------
				// Primary Key
				// -----------------------------
				if (table.primary) {
					debugSql += `,\nPRIMARY KEY (${table.primary.join(', ')})`
				}

				const extras = [
					...fkConstraints,
					...uniqueConstraints,
					...checkConstraints
				]

				if (extras.length > 0) {
					debugSql += ',\n' + extras.join(',\n')
				}

				debugSql += '\n);\n'
				if (debug) console.log(debugSql)

				await c.query(debugSql)

				// -----------------------------
				// Indexes
				// -----------------------------
				if (table.indexes) {
					for (const index of table.indexes) {
						const rawFields = index.fields || index.expressions

						const indexName =
							index.name || `${table.name}_${rawFields.map(e => typeof e === 'string' ? e : e.field).join('_')}_idx`

						let fieldList

						if (index.expressions) {
							// expressions are raw SQL, do NOT quote them
							fieldList = index.expressions.join(', ')
						} else {
							// fields may be strings OR objects
							fieldList = index.fields
								.map(f => {
									if (typeof f === 'string') {
										// simple FK or JSONB GIN index
										return `"${f}"`
									} else {
										// object form: { field, opclass? }
										return f.opclass
											? `"${f.field}" ${f.opclass}`
											: `"${f.field}"`
									}
								})
								.join(', ')
						}

						const method = index.method ? `USING ${index.method}` : ''

						await c.query(`CREATE INDEX "${indexName}" ON "${table.name}" ${method} (${fieldList})`)
					}
				}

				if (!tx) c.release()
			} catch (error) {
				if (!tx) c.release()
				throw new Error(`Unable to create table:\n${debugSql}\nERR: ${error.message}`)
			}
		},

		/**
		 * Create foreign key(s)
		 * @param {import('./pg-definitions').PGForeignKey[]} fks - array of foreign key objects
		 */
		async createForeignKeys(fks) {
			const c = tx || await pool.connect()
			let sql

			try {
				for (const fk of fks) {
					const fields = fk.fields.map(f => `"${f}"`).join(', ')
					const refFields = fk.refFields.map(f => `"${f}"`).join(', ')
					const name = fk.name || `${fk.table}_${fk.fields.join('_')}_fk`

					sql =
						`ALTER TABLE "${fk.table}" ` +
						`ADD CONSTRAINT "${name}" FOREIGN KEY (${fields}) ` +
						`REFERENCES "${fk.refTable}" (${refFields})`

					if (fk.onDelete) sql += ` ON DELETE ${fk.onDelete}`
					if (fk.onUpdate) sql += ` ON UPDATE ${fk.onUpdate}`

					if (debug) console.log(sql)

					await c.query(sql)
				}
				if (!tx) c.release()
			} catch (error) {
				if (!tx) c.release()
				throw new Error(`Unable to create foreign key:\n${sql}\nERR: ${error.message}`)
			}
		},

		/**
		 * Create trigger(s)
		 * @param {import('./pg-definitions').PGTrigger[]} triggers - array of trigger objects
		 */
		async createTriggers(triggers) {
			const c = tx || await pool.connect()
			let sql

			try {
				for (const trigger of triggers) {
					// Create function if provided
					if (trigger.function) {
						if (debug) console.log(trigger.function)
						await c.query(trigger.function)
					}

					// Build trigger SQL
					sql =
						`CREATE TRIGGER ${trigger.name}\n` +
						`${trigger.timing} ${trigger.events.join(' OR ')} ON ${trigger.table}\n` +
						`FOR EACH ${trigger.forEach}\n` +
						`EXECUTE FUNCTION ${trigger.functionName}`

					if (trigger.when) {
						sql += `\nWHEN (${trigger.when})`
					}

					if (debug) console.log(sql)
					await c.query(sql)
				}

				if (!tx) c.release()
			} catch (error) {
				if (!tx) c.release()
				throw new Error(`Unable to create trigger:\n${sql}\nERR: ${error.message}`)
			}
		},

		/**
		 * Create function(s)
		 * @param {import('./pg-definitions').PGFunction[]} functions - array of trigger objects
		 */
		async createFunctions(functions) {
			const c = tx || await pool.connect()
			let sql

			try {
				for (const func of functions) {
					sql = func.code
					if (debug) console.log(sql)
					await c.query(sql)
				}

				if (!tx) c.release()
			} catch (error) {
				if (!tx) c.release()
				throw new Error(`Unable to create function:\n${sql}\nERR: ${error.message}`)
			}
		},

		/**
		 * Create function(s)
		 * @param {import('./pg-definitions').PGView[]} functions - array of trigger objects
		 */
		async createViews(views) {
			const c = tx || await pool.connect()
			let sql

			try {
				for (const view of views) {
					sql = view.code
					if (debug) console.log(sql)
					await c.query(sql)
				}

				if (!tx) c.release()
			} catch (error) {
				if (!tx) c.release()
				throw new Error(`Unable to create view:\n${sql}\nERR: ${error.message}`)
			}
		},

		/**
		 * Insert a row of values into a table
		 * @param {String} table - name of the database table
		 * @param {PGRowObject} row - object of fields and values
		 * @param {String} [col] - column name to get new ID from
		 * @returns {PGOperationResults} Result of the INSERT
		 */
		async insert(table, row, col) {
			const c = tx || await pool.connect()
			const pgRow = this._jsToPg(row)

			const keys = Object.keys(pgRow)
			const cols = keys.map(k => k).join(', ')
			const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ')
			const values = Object.values(pgRow)

			const debugSql =
                `INSERT INTO ${table} (${cols}) VALUES (` +
                values.map(v => this._formatValue(v)).join(', ') +
                `)${col ? ` RETURNING ${col}` : ''}`

			if (debug) console.log(debugSql)

			try {
				const result = await c.query(
                    `INSERT INTO ${table} (${cols}) VALUES (${placeholders})` +
					(col ? ` RETURNING ${col}` : ''),
                    values
				)

				if (!tx) c.release()

				return {
					changes: result.rowCount,
					newId: col ? result.rows?.[0]?.[col] ?? null : null
				}
			} catch (error) {
				if (!tx) c.release()
				throw new Error(`Unable to insert:\n${debugSql}\nERR: ${error.message}`)
			}
		},

		/**
		 * Update a row of values in a table
		 * @param {String} table - name of the database table
		 * @param {PGRowObject} row - array of fields and values to set in an UPDATE
		 * @param {PGRowObject} where - array of fields and values to match for the UPDATE
		 * @returns {Number} number of rows updated
		 */
		async update(table, row, where) {
			if (Object.keys(where).length === 0) { throw new Error('UPDATE without WHERE is not allowed') }

			const c = tx || await pool.connect()
			const pgRow = this._jsToPg(row)
			const pgWhere = this._jsToPg(where)

			const rowKeys = Object.keys(pgRow)
			const whereKeys = Object.keys(pgWhere)

			const set = rowKeys.map((k, i) => `${k} = $${i + 1}`).join(', ')
			const whereClause = whereKeys
				.map((k, i) => `${k} = $${rowKeys.length + i + 1}`)
				.join(' AND ')

			const values = [...Object.values(pgRow), ...Object.values(pgWhere)]

			const debugSet = Object.entries(pgRow)
				.map(([k, v]) => `${k} = ${this._formatValue(v)}`)
				.join(', ')

			const debugWhere = Object.entries(pgWhere)
				.map(([k, v]) => `${k} = ${this._formatValue(v)}`)
				.join(' AND ')

			const debugSql = `UPDATE ${table} SET ${debugSet} WHERE ${debugWhere}`

			if (debug) console.log(debugSql)

			try {
				const result = await c.query(
                    `UPDATE ${table} SET ${set} WHERE ${whereClause}`,
                    values
				)

				if (!tx) c.release()

				return result.rowCount
			} catch (error) {
				if (!tx) c.release()
				throw new Error(`Unable to update:\n${debugSql}\nERR: ${error.message}`)
			}
		},

		/**
		 * Delete rows in a table
		 * @param {String} table - name of the database table
		 * @param {PGRowObject} where - array of fields and values to match for the DELETE
		 * @returns {Number} number of rows deleted
		 */
		async delete(table, where) {
			if (Object.keys(where).length === 0) { throw new Error('DELETE without WHERE is not allowed') }

			const c = tx || await pool.connect()
			const pgWhere = this._jsToPg(where)

			const whereKeys = Object.keys(pgWhere)
			const whereClause = whereKeys
				.map((k, i) => `${k} = $${i + 1}`)
				.join(' AND ')

			const values = Object.values(pgWhere)

			const debugWhere = Object.entries(pgWhere)
				.map(([k, v]) => `${k} = ${this._formatValue(v)}`)
				.join(' AND ')

			const debugSql = `DELETE FROM ${table} WHERE ${debugWhere}`

			if (debug) console.log(debugSql)

			try {
				const result = await c.query(
                    `DELETE FROM ${table} WHERE ${whereClause}`,
                    values
				)

				if (!tx) c.release()

				return result.rowCount
			} catch (error) {
				if (!tx) c.release()
				throw new Error(`Unable to delete:\n${debugSql}\nERR: ${error.message}`)
			}
		},

		/**
		 * Return all rows that match the results of the SQL
		 * @param {String} sql - SQL statement to execute
		 * @param {PGRowObject} [params] - optional object of fields and values to use in the the SQL
		 * @returns {Object[]} Result rows of the query
		 */
		async query(sql, params) {
			if (params !== undefined) {
				const check = this._checkParams(sql, params)
				if (!check.ok) throw new Error(`${check.error}\n${check.sql}`)

				const c = tx || await pool.connect()

				if (debug) console.log(check.sql)

				try {
					const result = await c.query(sql, params)
					if (!tx) c.release()
					return result.rows.map(data => this._pgToJs(data))
				} catch (error) {
					if (!tx) c.release()
					throw new Error(`Unable to query:\n${check.sql}\nERR: ${error.message}`)
				}
			}

			const c = tx || await pool.connect()

			if (debug) console.log(sql)

			try {
				const result = await c.query(sql)
				if (!tx) c.release()
				return result.rows.map(data => this._pgToJs(data))
			} catch (error) {
				if (!tx) c.release()
				throw new Error(`Unable to query:\n${sql}\nERR: ${error.message}`)
			}
		},

		/**
		 * Return a single row that matches the results of the SQL
		 * @param {String} sql - SQL statement to execute
		 * @param {Array} [params] - optional object of fields and values to use in the the SQL
		 * @returns {Object} Result row of the query
		 */
		async get(sql, params) {
			if (params !== undefined) {
				const check = this._checkParams(sql, params)
				if (!check.ok) throw new Error(`${check.error}\n${check.sql}`)

				const c = tx || await pool.connect()

				if (debug) console.log(check.sql)

				try {
					const result = await c.query(sql, params)
					if (!tx) c.release()
					if (result.rows.length === 0) {
						return null
					}
					return this._pgToJs(result.rows[0])
				} catch (error) {
					if (!tx) c.release()
					throw new Error(`Unable to get:\n${check.sql}\nERR: ${error.message}`)
				}
			}

			const c = tx || await pool.connect()

			if (debug) console.log(sql)

			try {
				const result = await c.query(sql)
				if (!tx) c.release()
				if (result.rows.length === 0) {
					return null
				}
				return this._pgToJs(result.rows[0])
			} catch (error) {
				if (!tx) c.release()
				throw new Error(`Unable to get:\n${sql}\nERR: ${error.message}`)
			}
		},

		/**
		 * Return the results of arbitraty SQL that isn't a SELECT statement
		 * @param {String} sql - SQL statement to execute
		 * @param {PGRowObject} [params] - optional object of fields and values to use in the the SQL
		 * @returns {Number} numb er of rows affected
		 */
		async run(sql, params) {
			const isSelect = /^\s*select/i.test(sql)
			if (isSelect) throw new Error('Only use run for non-SELECT statements')

			if (params !== undefined) {
				const check = this._checkParams(sql, params)
				if (!check.ok) throw new Error(`${check.error}\n${check.sql}`)

				const c = tx || await pool.connect()

				if (debug) console.log(check.sql)

				try {
					const result = await c.query(sql, params)
					if (!tx) c.release()
					return result.rowCount
				} catch (error) {
					if (!tx) c.release()
					throw new Error(`Unable to run:\n${check.sql}\nERR: ${error.message}`)
				}
			}

			const c = tx || await pool.connect()

			if (debug) console.log(sql)

			try {
				const result = await c.query(sql)
				if (!tx) c.release()
				return result.rowCount
			} catch (error) {
				if (!tx) c.release()
				throw new Error(`Unable to run:\n${sql}\nERR: ${error.message}`)
			}
		}
	}
}

module.exports = pgDb
