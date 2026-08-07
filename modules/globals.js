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

function formatWordNumber(number) {
	switch (number) {
		case 0:
			return 'No'
		case 1:
			return 'One'
		case 2:
			return 'Two'
		case 3:
			return 'Three'
		case 4:
			return 'Four'
		case 5:
			return 'Five'
		case 6:
			return 'Six'
		case 7:
			return 'Seven'
		case 8:
			return 'Eight'
		case 9:
			return 'Nine'
		case 10:
			return 'Ten'
		default:
			return new Intl.NumberFormat('en-us').format(number)
	}
}

async function hashPassword(text) {
	return await argon2.hash(text, {
		type: argon2.argon2id,
		memoryCost: 65536, // 64 MB
		timeCost: 3,
		parallelism: 4
	})
}

module.exports = {
	env, dbNorm, biolineageDb, hashPassword, formatWordNumber
}
