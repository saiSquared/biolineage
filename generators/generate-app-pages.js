const getters = require('../db/getters')
const { generatePage } = require('./generate-page')
// const { smartify } = require('../modules/clubside-utils')

class AppGenerators {
	async addPerson(user) {
		/** @type {Page} */
		const data = {
			avatar: user.avatar ? `/img/avatars/${user.email.split('@')[0]}.png` : '/img/avatars/blank.png',
			title: 'New Person',
			description: 'Add a new person to the database',
			breadcrumbs: [
				{ link: '/', text: 'Home' },
				{ text: 'New Person' }
			],
			full: [],
			menus: [
				{ file: 'account-menu.html' },
				{ file: 'theme-menu.html' }
			],
			scripts: []
		}
		data.full.push({ type: 'header', content: 'New Person', level: 1, class: 'no-margin' })
		return generatePage(data, 'standard.html', true)
	}

	async browse(user) {
		/** @type {Page} */
		const data = {
			avatar: user.avatar ? `/img/avatars/${user.email.split('@')[0]}.png` : '/img/avatars/blank.png',
			title: 'Browse People',
			description: 'Browse all People',
			breadcrumbs: [
				{ link: '/', text: 'Home' },
				{ text: 'Browse People' }
			],
			full: [],
			menus: [
				{ file: 'account-menu.html' },
				{ file: 'theme-menu.html' }
			],
			scripts: [
				{ type: 'link', content: '/js/browse.js' }
			]
		}
		data.full.push({ type: 'header', content: 'Browse People', level: 1, class: 'no-margin' })
		data.full.push({
			type: 'filter-bar',
			method: 'POST',
			action: '/browse',
			fields: [
				{ name: 'filter-text', label: 'Filter', placeholder: 'Filter by name', type: 'text', autocomplete: true, nospellcheck: true },
				{ name: 'filter-year', label: 'Birth Year', fixed: true, placeholder: 'Year', type: 'text', inputmode: 'numeric' }
			]
		})
		return generatePage(data, 'standard.html', true)
	}

	async person(user, id) {
		const name = await getters.getPersonName(id)
		/** @type {Page} */
		const data = {
			avatar: user.avatar ? `/img/avatars/${user.email.split('@')[0]}.png` : '/img/avatars/blank.png',
			title: `${name} - Browse People`,
			description: 'Browse all People',
			breadcrumbs: [
				{ link: '/', text: 'Home' },
				{ link: '/browse', text: 'Browse People' },
				{ text: name }
			],
			full: [],
			menus: [
				{ file: 'account-menu.html' },
				{ file: 'theme-menu.html' }
			],
			scripts: []
		}
		const editorPackage = {
			lookupId: id,
			userId: user.userId,
			role: user.role
		}
		data.scripts.push(
			{
				type: 'inline',
				content: [
						`const editorPackage = JSON.parse(\`${JSON.stringify(editorPackage)}\`)`
				]
			}
		)
		data.scripts.push({ type: 'link', content: '/js/person.js' })
		return generatePage(data, 'standard.html', true)
	}

	async personTree(user, id) {
		const name = await getters.getPersonName(id)
		const uuid = await getters.getPersonUUID(id)
		/** @type {Page} */
		const data = {
			avatar: user.avatar ? `/img/avatars/${user.email.split('@')[0]}.png` : '/img/avatars/blank.png',
			title: `Personal Tree - ${name} - Browse People`,
			description: 'Browse all People',
			breadcrumbs: [
				{ link: '/', text: 'Home' },
				{ link: '/browse', text: 'Browse People' },
				{ link: `/browse/${id}`, text: name },
				{ text: 'Personal Tree' }
			],
			full: [],
			menus: [
				{ file: 'account-menu.html' },
				{ file: 'theme-menu.html' }
			],
			stylesheets: ['https://unpkg.com/family-chart@0.8.0-beta.2/dist/styles/family-chart.css'],
			scripts: [
				{ type: 'link', content: 'https://unpkg.com/d3@7' },
				{ type: 'link', content: 'https://unpkg.com/family-chart@0.8.0-beta.2' }
			]
		}
		const editorPackage = {
			lookupId: id,
			lookupUUID: uuid,
			userId: user.userId,
			role: user.role
		}
		data.scripts.push(
			{
				type: 'inline',
				content: [
						`const editorPackage = JSON.parse(\`${JSON.stringify(editorPackage)}\`)`
				]
			}
		)
		data.scripts.push({ type: 'link', content: '/js/person-tree.js', module: true })
		return generatePage(data, 'standard.html', true)
	}

	async timeline(user, which) {
		let title = 'Birth Timeline'
		if (which === 'death') title = 'Death Timeline'
		/** @type {Page} */
		const data = {
			avatar: user.avatar ? `/img/avatars/${user.email.split('@')[0]}.png` : '/img/avatars/blank.png',
			title,
			description: 'Norm App Timeline Views',
			breadcrumbs: [
				{ link: '/', text: 'Home' },
				{ text: title }
			],
			full: [],
			menus: [
				{ file: 'account-menu.html' },
				{ file: 'theme-menu.html' }
			],
			stylesheets: [
				'https://cdn.knightlab.com/libs/timeline3/latest/css/timeline.css'
			],
			scripts: [
				{ type: 'link', content: 'https://cdn.knightlab.com/libs/timeline3/latest/js/timeline.js' },
				{ type: 'link', content: '/js/timeline.js' }
			]
		}
		data.full.push({ type: 'header', content: `<img src="/img/timeline.svg"> ${title}`, level: 1 })
		data.full.push({ type: 'raw', content: '<div class="timeline-holder"><div id="timeline-embed"></div></div>' })
		return generatePage(data, 'standard.html', true)
	}
}

const appGenerators = new AppGenerators()

module.exports = appGenerators
