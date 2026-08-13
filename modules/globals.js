const path = require('node:path')
const argon2 = require('argon2')
const dotenv = require('dotenv')
const sqliteDb = require('../db/sqlite')
const pgDb = require('../db/pg')

// Load .env once, globally
dotenv.config({
	path: path.resolve(__dirname, '..', '.env'),
	quiet: true
})

const env = Object.freeze({ ...process.env })
const dbNorm = new sqliteDb('/home/biolineage.app/db/norm.db')
const biolineageDb = pgDb({
	host: env.PG_HOST,
	port: Number(env.PG_PORT),
	user: env.PG_USER,
	password: env.PG_PASSWORD,
	database: env.PG_DATABASE
}, true)

const trees = []

function formatWordNumber(number) {
	const words = [
		'No', 'One', 'Two', 'Three', 'Four',
		'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'
	]

	return words[number] ?? new Intl.NumberFormat('en-us').format(number)
}

async function hashPassword(text) {
	return await argon2.hash(text, {
		type: argon2.argon2id,
		memoryCost: 65536, // 64 MB
		timeCost: 3,
		parallelism: 4
	})
}

async function loadTrees() {
	trees.length = 0
	const treeData = await biolineageDb.query('select t.*, et.key from trees t join entity_types et on et.id = t.entity_type_id')
	for (const tree of treeData) {
		trees.push(tree)
	}
}

module.exports = {
	env, dbNorm, biolineageDb, formatWordNumber, hashPassword, loadTrees, trees
}
