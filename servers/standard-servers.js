const setters = require('../db/setters')
const standardGenerators = require('../generators/generate-standard-pages.js')
const adminGenerators = require('../generators/generate-admin-pages')
const accountGenerators = require('../generators/generate-user-pages')

async function handle404Page(reply, user) {
	return reply
		.code(404)
		.type('text/html; charset=utf-8')
		.send(await standardGenerators.error404(user))
}

async function handleStandardPage(reply, user, content) {
	if (content) {
		return reply
			.code(200)
			.type('text/html; charset=utf-8')
			.send(content)
	} else {
		return handle404Page(reply, user)
	}
}

async function standardServers(app) {
	app.get('/', async (request, reply) => {
		handleStandardPage(reply, request.user, await standardGenerators.home(request.user))
	})

	app.get('/account', async (request, reply) => {
		handleStandardPage(reply, request.user, await accountGenerators.account(request.user))
	})

	app.post('/account', async (request, reply) => {
		const userRecord = request.body
		let errorMessage

		// Password validation
		if (userRecord.password1 !== '' || userRecord.password2 !== '') {
			if (userRecord.password1 !== userRecord.password2) {
				errorMessage = 'Passwords do not match'
			}
		}

		// DB update
		if (!errorMessage) {
			const result = await setters.userUpdate(userRecord)
			if (!result) errorMessage = 'Failed to update'
		}

		// If DB update succeeded, sync Redis session
		if (!errorMessage) {
			const sessionId = request.cookies.session
			if (sessionId) {
				const key = `session:${sessionId}`

				// Update the in-memory session object
				if (userRecord.name) request.user.name = userRecord.name
				if (userRecord.avatar) request.user.avatar = userRecord.avatar
				if (userRecord.role) request.user.role = userRecord.role

				await app.redis.set(
					key,
					JSON.stringify(request.user),
					'EX',
					7776000
				)
			}
		}

		// Render page
		if (errorMessage) {
			handleStandardPage(
				reply,
				request.user,
				await accountGenerators.account(request.user, errorMessage)
			)
		} else {
			handleStandardPage(
				reply,
				request.user,
				await standardGenerators.home(request.user)
			)
		}
	})

	app.get('/users', async (request, reply) => {
		if (request.user.role === 'super') {
			const q = request.query.q || null
			if (q) {
				const editUserPage = await adminGenerators.user(request.user, q)
				if (editUserPage) {
					handleStandardPage(reply, request.user, editUserPage)
				} else {
					handle404Page(reply, request.user)
				}
			} else {
				handleStandardPage(reply, request.user, await adminGenerators.users(request.user))
			}
		} else {
			handle404Page(reply, request.user)
		}
	})

	app.get('/.well-known/*', async (request, reply) => {
		reply.code(204).send()
	})
}

module.exports = standardServers
