const { generatePage } = require('./generate-page')
const { smartify } = require('../modules/clubside-utils')
const { formatWordNumber } = require('../modules/globals')
const getters = require('../db/getters')

class StandardGenerators {
	async error404(user) {
		const data = {
			avatar: user.avatar ? `/img/avatars/${user.email.split('@')[0]}.png` : '/img/avatars/blank.png',
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
			avatar: user.avatar ? `/img/avatars/${user.email.split('@')[0]}.png` : '/img/avatars/blank.png',
			title: 'Home',
			breadcrumbs: [
				{ text: 'Home' }
			],
			full: [],
			menus: [
				{ file: 'account-menu.html' },
				{ file: 'theme-menu.html' }
			],
			scripts: [
				{ type: 'link', content: '/js/home.js' }
			]
		}
		data.full.push({ type: 'header', content: 'Trees', level: 1 })
		data.full.push({ type: 'header', content: 'My Trees', level: 2 })
		const ownTreesButtons = []
		const ownTrees = await getters.userTrees(user.userId)
		for (const ownTree of ownTrees) {
			ownTreesButtons.push({ link: `/trees/${ownTree.slug}`, icon: '/img/tree.svg', text: [ownTree.name, `(${formatWordNumber(ownTree.c)} member${ownTree.c === 1 ? '' : 's'})`] })
		}
		ownTreesButtons.push({ link: '/add-tree', icon: '/img/plus.svg', text: ['Add New Tree', '&nbsp;'] })
		data.full.push({ type: 'flex-link-list', buttonClass: 'big-button', content: ownTreesButtons })
		if (user.role === 'super') {
			data.full.push({ type: 'header', content: 'Other Trees', level: 2 })
			const otherTreesButtons = []
			const otherTrees = await getters.superTrees(user.userId)
			for (const otherTree of otherTrees) {
				otherTreesButtons.push({ link: `/trees/${otherTree.slug}`, icon: '/img/tree.svg', text: [otherTree.name, `(${formatWordNumber(otherTree.c)} member${otherTree.c === 1 ? '' : 's'})`] })
			}
			data.full.push({ type: 'flex-link-list', buttonClass: 'big-button', content: otherTreesButtons })
			data.full.push({ type: 'header', content: 'Administration', level: 2 })
			const menuList = [
				{ link: '/users', name: 'Manage Users', description: 'Add, delete and edit user accounts', image: '/img/users.svg' }
			]
			data.full.push({ type: 'menu-list', content: menuList })
		}
		return generatePage(data, 'standard.html', true)
	}
}

const standardGenerators = new StandardGenerators()

module.exports = standardGenerators
