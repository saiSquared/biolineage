const { generatePage } = require('./generate-page.js')
const { smartify } = require('../modules/clubside-utils.js')

class StandardGenerators {
	async error404(user) {
		const data = {
			avatar: user.avatar === 1 ? `/img/avatars/${user.email.split('@')[0]}.png` : '/img/avatars/blank.png',
			breadcrumbs: [
				{ text: 'Home' }
			],
			full: [],
			menus: [
				{ file: 'account-menu.html' },
				{ file: 'theme-menu.html' }
			]
		}
		let html = '<div class="two-up">\n'
		html += '\t<div class="two-up-image"><img src="/img/404.webp"></div>\n'
		html += '\t<div class="two-up-content">\n'
		html += '\t\t<h1>Really?!?</h1>\n'
		html += `\t\t<p>${smartify('It\'s just a 404 Error!')}</p>\n`
		html += `\t\t<p>${smartify('What you\'re looking for may have been "filed away" in a closet somewhere.')}</p>\n`
		html += '\t</div>\n'
		html += '</div>\n'
		data.full.push({ type: 'raw', content: html })
		return generatePage(data, 'standard.html', true)
	}

	async home(user) {
		/** @type {Page} */
		const data = {
			avatar: user.avatar === 1 ? `/img/avatars/${user.email.split('@')[0]}.png` : '/img/avatars/blank.png',
			breadcrumbs: [
				{ text: 'Home' }
			],
			home: [],
			menus: [
				{ file: 'account-menu.html' },
				{ file: 'theme-menu.html' }
			],
			scripts: [
				{ type: 'link', content: '/js/home.js' }
			]
		}
		const homeButtons = [
			{ text: 'Browse People', icon: 'browse.svg', link: '/browse' }
		]
		if (user.role === 'admin') homeButtons.push({ text: 'Users', icon: 'users.png', link: '/users' })
		data.home.push({ type: 'button-list', class: 'button-list button-list-centered', content: homeButtons })
		data.home.push({ type: 'header', content: 'Tools', level: 2 })
		const menuList = [
			{ link: '/person/add', name: 'Add Person', description: 'Add a new person to the database', image: '/img/couple.svg' },
			{ link: '/timeline/birth', name: 'Birth Timeline', description: 'View people by birth date on a timeline', image: '/img/timeline.svg' }
		]
		data.home.push({ type: 'menu-list', content: menuList })
		return generatePage(data, 'home.html', true)
	}
}

const standardGenerators = new StandardGenerators()

module.exports = standardGenerators
