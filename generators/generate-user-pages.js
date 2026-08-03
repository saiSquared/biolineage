const getters = require('../db/getters')
const { generatePage } = require('./generate-page')

class UserGenerators {
	async account(user, message) {
		const userRecord = await getters.getUser(user.email)
		const data = {
			avatar: user.avatar === 1 ? `/img/avatars/${user.email.split('@')[0]}.png` : '/img/avatars/blank.png',
			title: 'Account',
			description: 'Edit Norm App user.',
			menus: [
				{ file: 'account-menu.html' },
				{ file: 'theme-menu.html' }
			],
			breadcrumbs: [
				{ link: '/', text: 'Home' },
				{ text: 'Account' }
			],
			full: [],
			stylesheets: [],
			scripts: []
		}
		data.full.push({ type: 'header', content: 'Account', level: 1 })
		if (message) {
			data.full.push({ type: 'raw', content: `<div class="auth-error">${message}</div>\n` })
		}
		data.full.push({
			type: 'form',
			method: 'POST',
			action: '/account',
			class: 'form-edit',
			fields: [
				{ name: 'name', label: 'Name', placeholder: 'User name', type: 'text', required: true, autocomplete: true, value: userRecord.name },
				{ name: 'email', label: 'Email address', placeholder: 'email', type: 'email', required: true, readonly: true, value: userRecord.email },
				{ name: 'password1', label: 'New Password', placeholder: 'password', type: 'password', autocomplete: true },
				{ name: 'password2', label: 'Repeat New Password', placeholder: 'password', type: 'password', autocomplete: true }
			],
			buttons: [
				{ class: 'auth-button', type: 'submit', text: 'Save' }
			]
		})
		return generatePage(data, 'standard.html', true)
	}
}

const userGenerators = new UserGenerators()

module.exports = userGenerators
