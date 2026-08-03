const fastify = require('fastify')
const fastifyRequestLogger = require('@mgcrea/fastify-request-logger')
const fastifyMultipart = require('@fastify/multipart')
const fastifyFormBody = require('@fastify/formbody')
const fastifyHelmet = require('@fastify/helmet')
const fastifyRedis = require('@fastify/redis')
const fastifyCookie = require('@fastify/cookie')
const registerApacheLogger = require('./modules/apache-log-writer')
const { env } = require('./modules/globals')

const standardServers = require('./servers/standard-servers.js')
const appServers = require('./servers/app-servers.js')
const apiServers = require('./servers/api-servers.js')
const authServers = require('./servers/auth-servers.js')

const app = fastify({
	logger: {
		level: 'info',
		transport: {
			target: '@mgcrea/pino-pretty-compact',
			options: { translateTime: 'SYS:mm/dd/yy HH:MM:ss', ignore: 'pid,hostname' }
		},
		disableRequestLogging: true
	},
	trustProxy: true,
	routerOptions: {
		ignoreTrailingSlash: true
	},
	bodyLimit: 10 * 1024 * 1024
})

app.register(fastifyCookie, {
	secret: env.COOKIE_SECRET
})

app.register(fastifyRedis, {
	host: env.REDIS_HOST,
	port: Number(env.REDIS_PORT || 6379),
	password: env.REDIS_PASSWORD
})

// ------------------------------
// Global auth hook
// ------------------------------
app.addHook('onRequest', async (request, reply) => {
	const url = request.url

	// Public routes
	if (url.startsWith('/login')) return
	if (url.startsWith('/logout')) return
	if (url.startsWith('/api/person')) return

	const sid = request.cookies.session
	if (!sid) return reply.redirect('/login')

	const key = `session:${sid}`
	const sessionData = await app.redis.get(key)

	if (!sessionData) {
		reply.clearCookie('session')
		return reply.redirect('/login')
	}

	request.user = JSON.parse(sessionData)

	// Rolling TTL
	await app.redis.expire(key, 7776000)
})

registerApacheLogger(app)

// ------------------------------
// Plugins
// ------------------------------
app.register(async function (app) {
	app.register(fastifyRequestLogger)
	app.register(fastifyHelmet, { contentSecurityPolicy: false })
	app.register(fastifyMultipart, {
		attachFieldsToBody: true,
		limits: {
			fieldSize: 10 * 1024 * 1024,
			fileSize: 1024 * 1024 * 200
		}
	})
	app.register(fastifyFormBody)

	await apiServers(app)
	await authServers(app)
	await standardServers(app)
	await appServers(app)
})

async function shutdown(signal) {
	console.log(`Received ${signal}, shutting down...`)
	try {
		await app.close()
	} catch (error) {
		console.log(`Error shutting down: ${error.message}`)
	} finally {
		process.exit(0)
	}
}

async function startup() {
	try {
		app.listen({ port: 3452 }, (err) => {
			if (err) throw err
		})
	} catch (error) {
		console.log(`Error starting listen: ${error.message}`)
		process.exit(1)
	}
}

startup()

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
