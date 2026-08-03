const { generatePage } = require('./generate-page.js')

class AdminGenerators {
	async users(user) {
		const data = {
			avatar: user.avatar === 1 ? `/img/avatars/${user.email.split('@')[0]}.png` : '/img/avatars/blank.png',
			title: 'Users',
			description: 'Manage Norm App users.',
			menus: [
				{ file: 'account-menu.html' },
				{ file: 'theme-menu.html' }
			],
			breadcrumbs: [
				{ link: '/', text: 'Home' },
				{ text: 'Users' }
			],
			full: [],
			stylesheets: [],
			scripts: [{ type: 'link', content: '/js/users.js' }]
		}
		data.full.push({ type: 'header', content: 'Users', level: 1 })
		data.full.push({ type: 'raw', content: '<div class="table-holder"></div>' })
		return generatePage(data, 'standard.html', true)
	}
}

const adminGenerators = new AdminGenerators()

module.exports = adminGenerators
