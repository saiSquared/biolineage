const fs = require('node:fs')
const path = require('node:path')

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const pad = (value) => String(value).padStart(2, '0')

function apacheTimestamp() {
	const now = new Date()

	const date = pad(now.getDate())
	const month = months[now.getMonth()]
	const year = now.getFullYear()
	const hours = pad(now.getHours())
	const minutes = pad(now.getMinutes())
	const seconds = pad(now.getSeconds())

	const tzOffset = -now.getTimezoneOffset()
	const sign = tzOffset >= 0 ? '+' : '-'
	const tzHours = pad(Math.floor(Math.abs(tzOffset) / 60))
	const tzMinutes = pad(Math.abs(tzOffset) % 60)

	return `[${date}/${month}/${year}:${hours}:${minutes}:${seconds} ${sign}${tzHours}${tzMinutes}]`
}

function createApacheLogger({ logDir = './logs', maxLines = 250_000 } = {}) {
	if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true })

	let currentDate = new Date().toISOString().slice(0, 10)
	let lineCount = 0

	let stream = fs.createWriteStream(
		path.join(logDir, `${currentDate}-access.log`),
		{ flags: 'a' }
	)

	let fileIndex = 0

	function rotateIfNeeded() {
		const nowDate = new Date().toISOString().slice(0, 10)

		const dateChanged = nowDate !== currentDate
		const tooManyLines = lineCount >= maxLines

		if (!dateChanged && !tooManyLines) return

		stream.end()

		if (dateChanged) {
			currentDate = nowDate
			fileIndex = 0
		} else {
			fileIndex++
		}

		lineCount = 0

		const fileName = fileIndex === 0
			? `${currentDate}-access.log`
			: `${currentDate}-access-${fileIndex}.log`

		stream = fs.createWriteStream(path.join(logDir, fileName), { flags: 'a' })
	}

	process.on('beforeExit', () => stream.end())
	process.on('SIGTERM', () => stream.end())
	process.on('SIGINT', () => stream.end())

	return {
		write(line) {
			rotateIfNeeded()
			stream.write(line + '\n')
			lineCount++
		}
	}
}

function registerApacheLogger(app, options) {
	const logger = createApacheLogger(options)

	app.addHook('onResponse', (request, reply, done) => {
		const ip = request.ip || '-'

		const user = request.user || {}
		const userid = user.email || '-'
		const username = user.name
			? user.name.includes(' ')
				? `"${user.name}"`
				: user.name
			: '-'

		const ts = apacheTimestamp()
		const method = request.method
		const url = request.url
		const httpVersion = `HTTP/${request.raw.httpVersion}`
		const status = reply.statusCode
		const size = reply.getHeader('content-length') || '0'

		const referer = request.headers.referer
			? `"${request.headers.referer}"`
			: '"-"'

		const userAgent = request.headers['user-agent']
			? `"${request.headers['user-agent']}"`
			: '"-"'

		const line = `${ip} ${userid} ${username} ${ts} "${method} ${url} ${httpVersion}" ${status} ${size} ${referer} ${userAgent}`

		logger.write(line)
		done()
	})
}

module.exports = registerApacheLogger
