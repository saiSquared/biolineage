const crypto = require('node:crypto')
const argon2 = require('argon2')
const getters = require('../db/getters')
const authGenerators = require('../generators/generate-auth-pages')

async function authServers(app) {
	app.get('/login', async (request, reply) => {
		reply
			.code(200)
			.type('text/html; charset=utf-8')
			.send(await authGenerators.login())
	})

	app.post('/login', async (request, reply) => {
		const email = request.body.email?.trim().toLowerCase()
		const password = request.body.password?.trim()

		const user = await getters.getUser(email)

		// User not found
		if (!user) {
			return reply
				.code(200)
				.type('text/html; charset=utf-8')
				.send(await authGenerators.login('No account exists with that email address.'))
		}

		// Password check
		const valid = await argon2.verify(user.password, password)
		if (!valid) {
			return reply
				.code(200)
				.type('text/html; charset=utf-8')
				.send(await authGenerators.login('Incorrect password.'))
		}

		// Create session
		const sessionId = crypto.randomBytes(32).toString('hex')
		await app.redis.set(
			`session:${sessionId}`,
			JSON.stringify({
				userId: user.id,
				email: user.email,
				name: user.name,
				avatar: user.avatar,
				role: user.role
			}),
			'EX',
			7776000 // 90 days
		)

		// Set cookie
		reply.setCookie('session', sessionId, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: true,
			maxAge: 7776000 // optional, but matches Redis TTL
		})

		// Redirect to home
		reply.redirect('/')
	})

	app.get('/logout', async (request, reply) => {
		const sessionId = request.cookies.session

		if (sessionId) {
			// Remove the session from Redis
			await app.redis.del(`session:${sessionId}`)

			// Clear the cookie
			reply.clearCookie('session', {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				secure: true
			})
		}

		// Redirect to home (or /login if you prefer)
		reply.redirect('/login')
	})
}

module.exports = authServers
