const standardGenerators = require('../generators/generate-standard-pages.js')
const appGenerators = require('../generators/generate-app-pages.js')

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

	app.get('/trees', async (request, reply) => {
		return handleStandardPage(reply, request.user, await appGenerators.trees(request.user))
	})

	app.get('/trees/:slug', async (request, reply) => {
		const treeBrowser = await appGenerators.treeBrowse(request.user, request.params.slug)
		if (treeBrowser) {
			return handleStandardPage(reply, request.user, treeBrowser)
		} else {
			return handle404Page(reply, request.user)
		}
	})

	app.get('/trees/:slug/entities', async (request, reply) => {
		const treeBrowser = await appGenerators.treeEntities(request.user, request.params.slug)
		if (treeBrowser) {
			return handleStandardPage(reply, request.user, treeBrowser)
		} else {
			return handle404Page(reply, request.user)
		}
	})

	app.get('/trees/:slug/entities/:id', async (request, reply) => {
		const entityPage = await appGenerators.treeEntity(request.user, request.params.slug, request.params.id)
		if (entityPage) {
			return handleStandardPage(reply, request.user, entityPage)
		} else {
			return handle404Page(reply, request.user)
		}
	})

	app.get('/trees/:slug/places/browse', async (request, reply) => {
		const placesPage = await appGenerators.treePlaces(request.user, request.params.slug)
		if (placesPage) {
			return handleStandardPage(reply, request.user, placesPage)
		} else {
			return handle404Page(reply, request.user)
		}
	})

	app.get('/trees/:slug/places/:id', async (request, reply) => {
		const placesPage = await appGenerators.treePlace(request.user, request.params.slug, request.params.id)
		if (placesPage) {
			return handleStandardPage(reply, request.user, placesPage)
		} else {
			return handle404Page(reply, request.user)
		}
	})
}

module.exports = appServers
