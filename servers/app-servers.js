const { generate404Page } = require('../generators/generate-standard-pages.js')
const appGenerators = require('../generators/generate-app-pages.js')

async function handle404Page(reply, user) {
	return reply
		.code(404)
		.type('text/html; charset=utf-8')
		.send(await generate404Page(user))
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

async function appServers(app) {
	app.get('/browse', async (request, reply) => {
		handleStandardPage(reply, request.user, await appGenerators.browse(request.user))
	})

	app.get('/person/add', async (request, reply) => {
		handleStandardPage(reply, request.user, await appGenerators.addPerson(request.user))
	})

	app.get('/person/:id', async (request, reply) => {
		handleStandardPage(reply, request.user, await appGenerators.person(request.user, Number(request.params.id)))
	})

	app.get('/person/:id/personal-tree', async (request, reply) => {
		handleStandardPage(reply, request.user, await appGenerators.personTree(request.user, Number(request.params.id)))
	})

	app.get('/timeline/birth', async (request, reply) => {
		handleStandardPage(reply, request.user, await appGenerators.timeline(request.user, 'birth'))
	})
}

module.exports = appServers
