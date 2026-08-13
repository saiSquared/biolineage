const getters = require('../db/getters')
const setters = require('../db/setters')

async function apiServers(app) {
	/*
	app.get('/api/calendar-event-view', async (request, reply) => {
		const id = request.query.id
		const type = request.query.calendar
		const results = await wdmGetters.calendarEventView(id, type)
		reply.send({ results })
	})

	app.post('/api/calendar/update', async (request, reply) => {
		const { calendar, id, field, value } = request.body
		reply.send(await wdmSetters.updateEvent(calendar, id, field, value, request.user.userId))
	})
	*/
	app.post('/api/browse', async (request, reply) => {
		const params = {
			filter: request.body.filter || null,
			year: request.body.year || null,
			page: request.body.page || 1
		}
		reply.send(await getters.getPeople(params))
	})

	app.get('/api/person/:id', async (request, reply) => {
		reply.send(await getters.getPerson(Number(request.params.id)))
	})

	app.get('/api/person/:id/personal-tree', async (request, reply) => {
		reply.send(await getters.getPersonTree(Number(request.params.id)))
	})

	app.get('/api/person/:id/pg-personal-tree', async (request, reply) => {
		reply.send(await getters.getPgPersonTree(request.params.id))
	})

	app.get('/api/person/:id/family-chart', async (request, reply) => {
		reply.send(await getters.getPersonFamilyChart(Number(request.params.id)))
	})

	app.get('/api/person/:id/pg-family-chart', async (request, reply) => {
		reply.send(await getters.getPgPersonFamilyChart(request.params.id))
	})

	app.get('/api/timeline/birth', async (request, reply) => {
		reply.send(await getters.getTimelineBirth())
	})

	app.get('/api/admin/users', async (request, reply) => {
		reply.send(await getters.users())
	})

	app.post('/api/admin/users/validate-email', async (request, reply) => {
		const userRecord = request.body
		const existing = await getters.user(userRecord.email)
		// console.log({ userRecord, existing })
		if (!existing) {
			reply.send({ ok: true })
		} else {
			reply.send({ ok: false })
		}
	})

	app.post('/api/admin/users/update', async (request, reply) => {
		const userRecord = request.body
		const update = await setters.userUpdate(userRecord)
		// console.log({ update })
		if (update.changes === 1) {
			if (request.user.userId === userRecord.id) {
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
			reply.send({ ok: true })
		} else {
			reply.send({ ok: false })
		}
	})

	app.post('/api/admin/users/add', async (request, reply) => {
		const userRecord = request.body
		const insert = await setters.userAdd(userRecord)
		// console.log({ insert })
		if (insert) {
			reply.send({ ok: true })
		} else {
			reply.send({ ok: false })
		}
	})

	app.get('/api/entity/graph/:id', async (request, reply) => {
		reply.send(await getters.entityGraph(request.params.id))
	})

	app.post('/api/entity/add', async (request, reply) => {
		reply.send(await setters.entityAdd(request.user, request.body))
	})

	app.post('/api/tree/add', async (request, reply) => {
		reply.send(await setters.treeAdd(request.user, request.body))
	})

	app.post('/api/tree/get', async (request, reply) => {
		reply.send(await getters.tree(request.body))
	})

	app.post('/api/tree/browse', async (request, reply) => {
		reply.send(await getters.treeEntities(request.body))
	})
}

module.exports = apiServers
