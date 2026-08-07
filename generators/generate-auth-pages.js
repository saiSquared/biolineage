const { generatePage } = require('./generate-page.js')

class AuthGenerators {
	async login(message) {
		const data = {
			title: 'Sign In',
			description: 'Sign in to Biolineage.',
			auth: [],
			scripts: [{
				type: 'inline',
				content: ['document.getElementById(\'email\').focus()']
			}]
		}
		data.auth.push({ type: 'header', content: 'Sign In', level: 1 })
		if (message) {
			data.auth.push({ type: 'raw', content: `<div class="auth-error">${message}</div>\n` })
		}
		data.auth.push({
			type: 'form',
			method: 'POST',
			action: '/login',
			fields: [
				{ name: 'email', label: 'Email address', placeholder: 'email', type: 'email', required: true, autocomplete: true },
				{ name: 'password', label: 'Password', placeholder: 'password', type: 'password', required: true, autocomplete: true }
			],
			buttons: [
				{ class: 'auth-button', type: 'submit', text: 'Sign in' }
			]
		})
		return generatePage(data, 'auth.html', true)
	}
}

const authGenerators = new AuthGenerators()

module.exports = authGenerators
