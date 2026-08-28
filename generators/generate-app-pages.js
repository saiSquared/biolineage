const getters = require('../db/getters')
const { generatePage } = require('./generate-page')
const { formatWordNumber, trees, placeTypes } = require('../modules/globals')
const { smartify } = require('../modules/clubside-utils')

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

	async treeBrowse(user, slug) {
		const tree = trees.find(lookup => lookup.slug === slug)
		if (!tree) return null
		if (!tree.ownerId === user.userId && !user.role === 'super') return null
		/** @type {Page} */
		const data = {
			avatar: user.avatar ? `/img/avatars/${user.email.split('@')[0]}.png` : '/img/avatars/blank.png',
			title: `${tree.name} - Trees`,
			description: `Start page for tree ${tree.name}`,
			breadcrumbs: [
				{ link: '/', text: 'Home' },
				{ link: '/trees', text: 'Trees' },
				{ text: tree.name }
			],
			full: [],
			menus: [
				{ file: 'account-menu.html' },
				{ file: 'theme-menu.html' }
			],
			stylesheets: [],
			scripts: [
				{ type: 'link', content: 'https://cdn.jsdelivr.net/npm/@floating-ui/core@1.7.5' },
				{ type: 'link', content: 'https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.7.6' }
			]
		}
		data.full.push({ type: 'home-logo-holder', logo: '/img/tree.svg', header: tree.name })
		data.full.push({ type: 'home-search-holder', action: `/trees/${tree.slug}/entities`, method: 'GET', param: 'q', placeholder: `Search ${tree.pluralLabel}` })
		data.full.push({ type: 'header', content: 'Actions', level: 2 })
		const buttons = [
			{ icon: tree.icon, text: `Browse ${tree.pluralLabel}`, link: `/trees/${tree.slug}/entities` },
			{ icon: tree.iconAdd, text: `Add ${tree.label}`, link: `/trees/${tree.slug}/entities/add`, id: 'add-entity' },
			{ icon: '/img/place.svg', text: 'Browse Places', link: `/trees/${tree.slug}/places/browse` },
			{ icon: '/img/places-explore.svg', text: 'Explore Places', link: `/trees/${tree.slug}/places` }
		]
		data.full.push({ type: 'big-buttons', content: buttons })
		const dataPackage = {
			treeId: tree.id,
			treeSlug: slug,
			treeType: tree.entityTypeId,
			treeLabel: tree.label,
			userId: user.userId,
			role: user.role
		}
		data.scripts.push(
			{
				type: 'inline',
				content: [
						`const dataPackage = JSON.parse(\`${JSON.stringify(dataPackage)}\`)`
				]
			}
		)
		data.scripts.push({ type: 'link', content: '/js/tree-browse.js', module: true })
		return generatePage(data, 'standard.html', true)
	}

	async treeEntities(user, slug) {
		const tree = trees.find(lookup => lookup.slug === slug)
		if (!tree) return null
		if (!tree.ownerId === user.userId && !user.role === 'super') return null
		/** @type {Page} */
		const data = {
			avatar: user.avatar ? `/img/avatars/${user.email.split('@')[0]}.png` : '/img/avatars/blank.png',
			title: `${tree.pluralLabel} - ${tree.name} - Trees`,
			description: `Browse ${tree.pluralLabel} in tree ${tree.name}`,
			breadcrumbs: [
				{ link: '/', text: 'Home' },
				{ link: '/trees', text: 'Trees' },
				{ link: `/trees/${tree.slug}`, text: tree.name },
				{ text: tree.pluralLabel }
			],
			full: [],
			menus: [
				{ file: 'account-menu.html' },
				{ file: 'theme-menu.html' }
			],
			stylesheets: [],
			scripts: [
				{ type: 'link', content: 'https://cdn.jsdelivr.net/npm/@floating-ui/core@1.7.5' },
				{ type: 'link', content: 'https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.7.6' }
			]
		}
		data.full.push({ type: 'header', content: `<img src="/img/tree.svg"> ${tree.name}`, level: 1 })
		data.full.push({
			type: 'filter-bar',
			method: 'POST',
			action: '/browse',
			fields: [
				{ name: 'filter-text', label: 'Filter', placeholder: 'Filter by name', type: 'text', autocomplete: true, nospellcheck: true },
				{ name: 'filter-start-year', label: 'Start Year', fixed: true, placeholder: 'yyyy', type: 'text', inputmode: 'numeric', maxlength: 4 },
				{ name: 'filter-end-year', label: 'End Year', fixed: true, placeholder: 'yyyy', type: 'text', inputmode: 'numeric', maxlength: 4 },
				{ name: 'add-entity', label: '&nbsp;', fixed: true, type: 'button', icon: '/img/plus.svg', text: `Add ${tree.label}` }
			]
		})
		const dataPackage = {
			treeId: tree.id,
			treeSlug: slug,
			treeType: tree.entityTypeId,
			treeLabel: tree.label,
			userId: user.userId,
			role: user.role
		}
		data.scripts.push(
			{
				type: 'inline',
				content: [
						`const dataPackage = JSON.parse(\`${JSON.stringify(dataPackage)}\`)`
				]
			}
		)
		data.scripts.push({ type: 'link', content: '/js/tree-entities.js', module: true })
		return generatePage(data, 'standard.html', true)
	}

	async treeEntity(user, slug, id) {
		const tree = trees.find(lookup => lookup.slug === slug)
		if (!tree) return null
		if (!tree.ownerId === user.userId && !user.role === 'super') return null
		const entity = await getters.entity(id)
		if (!entity) return null
		/** @type {Page} */
		const data = {
			avatar: user.avatar ? `/img/avatars/${user.email.split('@')[0]}.png` : '/img/avatars/blank.png',
			title: `${entity.displayName} - ${tree.pluralLabel} - ${tree.name} - Trees`,
			description: `Browse ${tree.pluralLabel} in tree ${tree.name}`,
			breadcrumbs: [
				{ link: '/', text: 'Home' },
				{ link: '/trees', text: 'Trees' },
				{ link: `/trees/${tree.slug}`, text: tree.name },
				{ link: `/trees/${tree.slug}/entities`, text: tree.pluralLabel },
				{ text: entity.displayName }
			],
			full: [],
			menus: [
				{ file: 'account-menu.html' },
				{ file: 'theme-menu.html' }
			],
			stylesheets: [
				'/js/autocomplete/autocomplete.min.css',
				'https://cdn.jsdelivr.net/npm/tom-select/dist/css/tom-select.css',
				'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
				'https://unpkg.com/family-chart@0.9.0/dist/styles/family-chart.css'
			],
			scripts: [
				{ type: 'link', content: 'https://cdn.jsdelivr.net/npm/tom-select/dist/js/tom-select.complete.min.js' },
				{ type: 'link', content: 'https://cdn.jsdelivr.net/npm/@floating-ui/core@1.7.5' },
				{ type: 'link', content: 'https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.7.6' },
				{ type: 'link', content: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js' },
				{ type: 'link', content: 'https://unpkg.com/d3@7' },
				{ type: 'link', content: 'https://unpkg.com/family-chart@0.9.0', module: true }
			]
		}
		data.full.push({ type: 'header', content: `<img src="/img/tree.svg"> ${tree.name}`, level: 2 })
		const dataPackage = {
			treeId: tree.id,
			treeSlug: slug,
			entityTypeId: tree.entityTypeId,
			treeType: tree.key,
			entityId: entity.id,
			userId: user.userId,
			role: user.role
		}
		data.scripts.push(
			{
				type: 'inline',
				content: [
						`const dataPackage = JSON.parse(\`${JSON.stringify(dataPackage)}\`)`
				]
			}
		)
		data.scripts.push({ type: 'link', content: '/js/tree-entity.js', module: true })
		return generatePage(data, 'standard.html', true)
	}

	async treePlace(user, slug, id) {
		const tree = trees.find(lookup => lookup.slug === slug)
		if (!tree) return null
		if (!tree.ownerId === user.userId && !user.role === 'super') return null
		const place = await getters.place(id)
		if (!place) return null
		/** @type {Page} */
		const data = {
			avatar: user.avatar ? `/img/avatars/${user.email.split('@')[0]}.png` : '/img/avatars/blank.png',
			title: `${smartify(place.name)} [${place.placeType}] - Places - ${tree.name} - Trees`,
			description: `Information on the place ${smartify(place.name)} of type ${place.placeType}`,
			breadcrumbs: [
				{ link: '/', text: 'Home' },
				{ link: '/trees', text: 'Trees' },
				{ link: `/trees/${tree.slug}`, text: tree.name },
				{ link: `/trees/${tree.slug}/places`, text: 'Places' },
				{ text: `${smartify(place.name)} [${place.placeType}]` }
			],
			full: [],
			menus: [
				{ file: 'account-menu.html' },
				{ file: 'theme-menu.html' }
			],
			stylesheets: ['https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'],
			scripts: [
				{ type: 'link', content: 'https://cdn.jsdelivr.net/npm/@floating-ui/core@1.7.5' },
				{ type: 'link', content: 'https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.7.6' },
				{ type: 'link', content: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js' }
			]
		}
		data.full.push({ type: 'header', content: `<img src="/img/tree.svg"> ${tree.name}`, level: 2, class: 'no-margin-bottom' })
		data.full.push({ type: 'header', content: smartify(place.name), level: 1, class: 'no-margin' })
		data.full.push({ type: 'header', content: place.placeType, level: 3, class: 'no-margin-top italics' })
		const dataPackage = {
			treeId: tree.id,
			treeSlug: slug,
			treeType: tree.key,
			treeLabel: tree.label,
			treePluralLabel: tree.pluralLabel,
			placeId: id,
			userId: user.userId,
			role: user.role
		}
		data.scripts.push(
			{
				type: 'inline',
				content: [
						`const dataPackage = JSON.parse(\`${JSON.stringify(dataPackage)}\`)`
				]
			}
		)
		data.scripts.push({ type: 'link', content: '/js/tree-place.js', module: true })
		return generatePage(data, 'standard.html', true)
	}

	async treePlaces(user, slug) {
		const tree = trees.find(lookup => lookup.slug === slug)
		if (!tree) return null
		if (!tree.ownerId === user.userId && !user.role === 'super') return null
		/** @type {Page} */
		const data = {
			avatar: user.avatar ? `/img/avatars/${user.email.split('@')[0]}.png` : '/img/avatars/blank.png',
			title: `${tree.pluralLabel} - ${tree.name} - Trees`,
			description: `Browse ${tree.pluralLabel} in tree ${tree.name}`,
			breadcrumbs: [
				{ link: '/', text: 'Home' },
				{ link: '/trees', text: 'Trees' },
				{ link: `/trees/${tree.slug}`, text: tree.name },
				{ link: `/trees/${tree.slug}/places`, text: 'Places' },
				{ text: 'Browse' }
			],
			full: [],
			menus: [
				{ file: 'account-menu.html' },
				{ file: 'theme-menu.html' }
			],
			stylesheets: [],
			scripts: [
				{ type: 'link', content: 'https://cdn.jsdelivr.net/npm/@floating-ui/core@1.7.5' },
				{ type: 'link', content: 'https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.7.6' }
			]
		}
		data.full.push({ type: 'header', content: `<img src="/img/tree.svg"> ${tree.name}`, level: 1 })
		const values = [{ value: '', text: 'All' }]
		for (const placeType of placeTypes) {
			values.push({ value: placeType.name, text: placeType.name })
		}
		data.full.push({
			type: 'filter-bar',
			method: 'POST',
			action: '/browse',
			fields: [
				{ name: 'filter-text', label: 'Filter', placeholder: 'Filter by name', type: 'text', autocomplete: true, nospellcheck: true },
				{ name: 'filter-type', label: 'Place Type', type: 'select', values, fixed: true }
			]
		})
		const dataPackage = {
			treeId: tree.id,
			treeSlug: slug,
			treeType: tree.entityTypeId,
			treeLabel: tree.label,
			userId: user.userId,
			role: user.role
		}
		data.scripts.push(
			{
				type: 'inline',
				content: [
						`const dataPackage = JSON.parse(\`${JSON.stringify(dataPackage)}\`)`
				]
			}
		)
		data.scripts.push({ type: 'link', content: '/js/tree-places-browse.js', module: true })
		return generatePage(data, 'standard.html', true)
	}

	async trees(user) {
		/** @type {Page} */
		const data = {
			avatar: user.avatar ? `/img/avatars/${user.email.split('@')[0]}.png` : '/img/avatars/blank.png',
			title: 'Trees',
			breadcrumbs: [
				{ link: '/', text: 'Home' },
				{ text: 'Trees' }
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
		data.full.push({ type: 'header', content: 'My Trees', level: 1 })
		const ownTreesButtons = []
		const ownTrees = await getters.userTrees(user.userId)
		for (const ownTree of ownTrees) {
			ownTreesButtons.push({ link: `/trees/${ownTree.slug}`, icon: '/img/tree.svg', text: [ownTree.name, `(${formatWordNumber(ownTree.c)} member${ownTree.c === 1 ? '' : 's'})`] })
		}
		ownTreesButtons.push({ id: 'add-tree', link: '/add-tree', icon: '/img/plus.svg', text: ['Add New Tree', '&nbsp;'] })
		data.full.push({ type: 'flex-link-list', buttonClass: 'big-button', content: ownTreesButtons })
		return generatePage(data, 'standard.html', true)
	}
}

const appGenerators = new AppGenerators()

module.exports = appGenerators
