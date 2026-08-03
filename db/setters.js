const { dbNorm } = require('../modules/globals')
const sqliteTables = require('./sqlite-definitions')
const { hashPassword } = require('../modules/globals')

class Setters {
	async addUser(data) {
		const user = {
			email: data.email,
			password: await hashPassword(data.password),
			name: data.name,
			avatar: 0,
			role: data.role
		}
		const newId = await dbNorm.insert(sqliteTables.users, user)
		if (newId) {
			return true
		} else {
			return false
		}
	}

	async updateUser(data) {
		let sql = 'UPDATE users SET '
		const fields = ['name', 'role']
		if (data.password && data.password !== '') fields.push('password')
		const user = { name: data.name, role: data.role }
		if (data.password && data.password !== '') user.password = await hashPassword(data.password1)
		user.id = data.id
		sql += fields.map(data => `${data} = @${data}`).join(', ')
		sql += ' WHERE id = @id'
		// console.log({ sql, user })
		return await dbNorm.execute(sql, user)
	}
}

const setters = new Setters()

module.exports = setters
