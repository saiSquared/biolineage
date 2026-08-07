const fs = require('node:fs')
const { smartify, addIndent } = require('../modules/clubside-utils.js')

const partialCache = {}

const formatValue = (v, f) => {
	switch (f) {
		case 'smart':
			return smartify(v)
		case 'decimal':
			return formatDecimalNumber(v)
		case 'number':
			return formatNumber(v)
		case 'currency':
			return formatCurrency(v)
		default:
			return v
	}
}

const formatItemCount = number => {
	switch (number) {
		case 1:
			return 'View one item'
		case 2:
			return 'View both items'
		default:
			return `View all ${new Intl.NumberFormat(navigator.language, {
				minimumFractionDigits: 0,
				maximumFractionDigits: 0
			}).format(number)} items`
	}
}

const formatCurrency = number => {
	return new Intl.NumberFormat(navigator.language, {
		style: 'currency',
		currency: 'USD'
	}).format(number)
}

const formatNumber = number => {
	return new Intl.NumberFormat(navigator.language, {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(number)
}

const formatDecimalNumber = number => {
	return new Intl.NumberFormat(navigator.language, {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2
	}).format(number)
}

const formatRelativeDate = date => {
	const now = new Date()
	const diffMs = now - date
	const diffSec = Math.floor(diffMs / 1000)
	const diffMin = Math.floor(diffSec / 60)
	const diffHr = Math.floor(diffMin / 60)
	const diffDay = Math.floor(diffHr / 24)

	const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

	const fullDate = new Intl.DateTimeFormat('en', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit'
	})

	const weekdayTime = new Intl.DateTimeFormat('en', {
		weekday: 'long',
		hour: 'numeric',
		minute: '2-digit'
	})

	if (diffSec < 60) return 'Just now'

	if (diffMin < 60) return rtf.format(-diffMin, 'minute')

	if (diffHr < 24) return rtf.format(-diffHr, 'hour')

	if (diffDay === 1) {
		const time = date.toLocaleTimeString('en', {
			hour: 'numeric',
			minute: '2-digit'
		})
		return `Yesterday at ${time}`
	}

	if (diffDay < 7) {
		return weekdayTime.format(date)
	}

	return fullDate.format(date)
}

function handleReplacements(match, object, debug) {
	const templateItem = match.substring(4, match.length - 3).trim()
	if (debug) console.log(templateItem)

	let directive
	let param

	if (templateItem.includes(':')) {
		const idx = templateItem.indexOf(':')
		directive = templateItem.substring(0, idx)
		param = templateItem.substring(idx + 1)
	} else {
		directive = templateItem
	}

	if (param && param[0] === '{') {
		param = JSON.parse(param)
	}

	if (debug) console.log(directive, object[directive], param)

	switch (directive) {
		case 'array': {
			if (object[param.var]) {
				const indent = '\t'
				const arrayItem = object[param.var]
				let arrayOutput = arrayItem
				let html = ''
				if (param.assign || param.start) {
					html += param.indent ? `${indent.repeat(param.indent)}${param.assign ? `const ${param.assign} = ` : ''}${param.start || ''}\n` : `${param.assign ? `${param.assign} = ` : ''}${param.start || ''}`
				}
				if (param.indent) {
					let innerIndent = param.indent
					if (param.assign) {
						innerIndent++
					}
					arrayOutput = arrayItem.map((item) => `${indent.repeat(innerIndent)}${param.assign ? "'" : ''}${item}${param.assign ? "'" : ''}`)
				}
				html += arrayOutput.join(param.join ? `${param.join}${param.assign ? '\n' : ''}` : '\n')
				if (param.end) {
					html += param.indent ? `${param.join}${param.assign ? '\n' : ''}${indent.repeat(param.indent)}${param.end}\n` : ''
				}

				if (debug) console.log(html)

				return html
			} else {
				return ''
			}
		}

		case 'breadcrumbs': {
			if (!object.breadcrumbs) return ''

			return addIndent(renderBreadcrumbs(object.breadcrumbs), 3)
		}

		case 'currentDate': {
			const now = new Date()
			return now.toISOString()
		}

		case 'include': {
			if (partialCache[param]) return partialCache[param]

			const file = `parts/${param}`
			if (!fs.existsSync(file)) return ''

			const content = fs.readFileSync(file, 'utf8')
			partialCache[param] = content
			return content
		}

		case 'menus': {
			if (!object.menus) return ''

			let html = ''
			for (const menu of object.menus) {
				if (partialCache[menu.file]) {
					html += partialCache[menu.file]
				} else {
					const file = `menus/${menu.file}`
					if (fs.existsSync(file)) {
						const content = fs.readFileSync(file, 'utf8')
						partialCache[param] = content
						html += content
					}
				}
				if (menu.replacements) {
					for (const replacement of menu.replacements) {
						html = html.replaceAll(`{${replacement.field}}`, replacement.value)
					}
				}
			}

			return addIndent(html, 1)
		}

		case 'scripts': {
			if (!object.scripts) return ''

			let html = ''
			for (const script of object.scripts) {
				switch (script.type) {
					case 'inline': {
						html += `<script${script.module ? ' type="module"' : ''}>\n`
						for (const line of script.content) {
							html += `\t${line}\n`
						}
						html += '</script>\n'
						break
					}
					case 'link': {
						html += `<script src="${script.content}"`
						if (script.module) html += ' type="module"'
						if (script.async) html += ' async'
						if (script.defer) html += ' defer'
						html += '></script>\n'
						break
					}
					case 'importmap': {
						html += '<script type="importmap">\n'
						html += '\t{\n'
						html += '\t\t"imports": {\n'
						let i = 1
						for (const line of script.content) {
							html += `\t\t\t"${line.item}": "${line.src}"`
							if (i < script.content.length) {
								html += ',\n'
							} else {
								html += '\n'
							}
							i++
						}
						html += '\t\t}\n'
						html += '\t}\n'
						html += '</script>\n'
						break
					}
				}
			}

			return addIndent(html, 1)
		}

		case 'slot': {
			const slotItems = object[param]
			if (!slotItems) return ''

			let html = ''
			for (const slotItem of slotItems) {
				switch (slotItem.type) {
					case 'audio':
						html += `<div><audio class="full-width-audio" src="${slotItem.content}" controls preload></div>\n`
						break

					case 'breadcrumbs':
						html += renderBreadcrumbs(slotItem.content, 'breadcrumbs-block')
						break

					case 'button-list':
						html += `<ul class="${slotItem.class}">\n`
						for (const filter of slotItem.content) {
							if (filter.link) {
								html += `\t<li><a href="${filter.link}">`
							} else {
								html += '\t<li><div>'
							}
							html += `<img src="/img/${filter.icon}"><span>${filter.text}</span>`
							if (filter.link) {
								html += '</a></li>\n'
							} else {
								html += '</div></li>\n'
							}
						}
						html += '</ul>\n'
						break

					case 'card': {
						const card = slotItem.content
						html += '<div class="card">\n'
						html += '\t<div class="card-header">\n'
						html += '\t\t<div>\n'
						html += `\t\t\t<a href="/${card.profile}/">\n`
						html += `\t\t\t\t<img src="${card.profilePic}" loading="lazy" alt="${card.profileName}">`
						html += '\t\t\t</a>\n'
						html += '\t\t</div>\n'
						html += '\t\t<div>\n'
						html += `\t\t\t<h4><a href="/${card.profile}/">${card.profileName}</a></h4>\n`
						html += `\t\t\t<div class="card-timestamp">${formatRelativeDate(card.date)}</div>\n`
						html += '\t\t</div>\n'
						html += '\t</div>\n'
						html += '\t<div class="card-body">\n'
						html += `\t\t<div class="card-text">${card.body}</div>\n`
						if (card.includes) {
							const includes = card.includes
							for (const include of includes) {
								switch (include.type) {
									case 'item': {
										const cdnPath = `https://cdn.cossocial.com/${include.itemYear}/${String(include.itemMonth).padStart(2, '0')}/${card.profile}/${include.filename}`
										html += `\t\t<a class="card-item" href="/${card.profile}/items/${include.itemId}">\n`
										html += '\t\t\t<picture>\n'
										html += `\t\t\t\t<source srcset="${cdnPath}-thumb.webp" type="image/webp">\n`
										html += `\t\t\t\t<img src="${cdnPath}-thumb.jpg" width="${include.width}" height="${include.height}" loading="lazy" alt="${include.title}">`
										html += '\t\t\t</picture>\n'
										html += `\t\t\t<div>${include.title}</div>\n`
										html += '\t\t</a>\n'
										break
									}
								}
							}
						}
						html += '\t</div>\n'
						html += '\t<div class="card-actions">\n'
						html += '\t\t<button class="action-button"><svg><use href="#action-like"></use></svg>Like</button>\n'
						html += '\t\t<button class="action-button"><svg><use href="#action-comment"></use></svg>Comment</button>\n'
						html += '\t\t<button class="action-button"><svg><use href="#action-share"></use></svg>Share</button>\n'
						html += '\t</div>\n'
						html += '</div>\n'
						break
					}

					case 'diff': {
						const groups = slotItem.content
						html += '<div class="diff-grid">\n'
						for (const group of groups) {
							html += '\t<div class="diff-grid-group">\n'
							for (const field of group) {
								html += '\t\t<div class="diff-grid-field">\n'
								html += `\t\t\t<span>${field.field}</span>`
								html += `\t\t\t<div>${field.value || '&nbsp;'}</div>`
								html += '\t\t</div>\n'
							}
							html += '\t</div>\n'
						}
						html += '</div>\n'
						break
					}

					case 'flex-link-list':
						html += '<ul class="flex-button-list">\n'
						for (const button of slotItem.content) {
							html += `\t<li><a class="${slotItem.buttonClass}" href="${button.link}">`
							html += `<img src="${button.icon}">`
							for (const text of button.text) {
								html += `<span>${text}</span>`
							}
							html += '</a></li>\n'
						}
						html += '</ul>\n'
						break

					case 'form': {
						html += `<form${slotItem.class ? ` class="${slotItem.class}"` : ''} method="${slotItem.method}" action="${slotItem.action}">\n`
						for (const field of slotItem.fields) {
							if (field.label) {
								html += `\t<label for="${field.name}">${field.label}</label>\n`
							}
							switch (field.type) {
								case 'text':
								case 'email':
								case 'password': {
									let fieldHtml = `\t<input type="${field.type}" name="${field.name}" id="${field.name}"`
									if (field.class) fieldHtml += ` class="${field.class}"`
									if (field.placeholder) fieldHtml += ` placeholder="${field.placeholder}"`
									if (field.minlength) fieldHtml += ` minlength="${field.minlength}"`
									if (field.maxlength) fieldHtml += ` maxlength="${field.maxlength}"`
									if (field.pattern) fieldHtml += ` pattern="${field.pattern}"`
									if (field.title) fieldHtml += ` title="${field.title}"`
									if (field.value) fieldHtml += ` value="${field.value}"`
									if (field.required) fieldHtml += ' required'
									if (field.readonly) fieldHtml += ' readonly'
									if (field.autocomplete) fieldHtml += ' autocomplete="on"'
									if (field.nospellcheck) fieldHtml += ' spellcheck="false"'
									html += `${fieldHtml}>\n`
									break
								}
								case 'select': {
									html += `\t<select name="${field.name}" id="${field.name}">\n`
									for (const value of field.values) {
										html += `\t\t<option value="${value.value}"${value.value === field.value ? ' selected' : ''}>${value.text}</option>\n`
									}
									html += '\t</select>\n'
								}
							}
						}
						for (const button of slotItem.buttons) {
							let buttonHtml = `\t<button type="${button.type}"`
							if (button.class) buttonHtml += ` class="${button.class}"`
							buttonHtml += `>${button.text}</button>\n`
							html += buttonHtml
						}
						html += '</form>\n'
						break
					}

					case 'filter-bar': {
						html += '<div class="filter-stats"></div>\n'
						html += `<form class="filter-bar" method="${slotItem.method}" action="${slotItem.action}">\n`
						for (const field of slotItem.fields) {
							html += `\t<label${field.fixed ? ' class="fixed"' : ''}>`
							html += `\t\t<span>${field.label}</span>`
							switch (field.type) {
								case 'text':
								case 'email':
								case 'password': {
									let fieldHtml = `\t<input type="${field.type}" name="${field.name}" id="${field.name}"`
									if (field.class) fieldHtml += ` class="${field.class}"`
									if (field.placeholder) fieldHtml += ` placeholder="${field.placeholder}"`
									if (field.minlength) fieldHtml += ` minlength="${field.minlength}"`
									if (field.maxlength) fieldHtml += ` maxlength="${field.maxlength}"`
									if (field.pattern) fieldHtml += ` pattern="${field.pattern}"`
									if (field.title) fieldHtml += ` title="${field.title}"`
									if (field.value) fieldHtml += ` value="${field.value}"`
									if (field.required) fieldHtml += ' required'
									if (field.readonly) fieldHtml += ' readonly'
									if (field.inputmode) fieldHtml += ` inputmode="${field.inputmode}"`
									if (field.autocomplete) fieldHtml += ' autocomplete="on"'
									if (field.nospellcheck) fieldHtml += ' spellcheck="false"'
									html += `${fieldHtml}>\n`
									break
								}
								case 'select': {
									html += `\t<select name="${field.name}" id="${field.name}">\n`
									for (const value of field.values) {
										html += `\t\t<option value="${value.value}"${value.value === field.value ? ' selected' : ''}>${value.text}</option>\n`
									}
									html += '\t</select>\n'
								}
							}
							html += '\t</label>\n'
						}
						html += '</form>\n'
						html += '<div class="filter-results"></div>\n'
						html += '<div class="filter-nav"></div>\n'
						break
					}

					case 'grid-list':
						html += `<div class="${slotItem.cssClass}">\n`
						for (const item of slotItem.content) {
							html += `\t<div${item.cssClass ? ` class="${item.cssClass}"` : ''}>`
							html += item.value
							html += '</div>\n'
						}
						html += '</div>\n'
						break

					case 'header': {
						if (slotItem.link) {
							html += `<a href="${slotItem.link}">`
						}
						html += `<h${slotItem.level}${slotItem.anchor ? ` id="${slotItem.anchor}"` : ''}${slotItem.class ? ` class="${slotItem.class}"` : ''}>${smartify(slotItem.content)}</h${slotItem.level}>\n`
						if (slotItem.link) {
							html += '</a>'
						}
						break
					}

					case 'image-full': {
						html += `<div class="photo-holder" style="--item-photo: url(${slotItem.thumb});">\n`
						html += `\t<a class="mobx mobx-full" data-rel="images" data-type="image" data-title="${smartify(slotItem.title)}" href="${slotItem.file}"></a>\n`
						html += '</div>\n'
						break
					}

					case 'images-2-up':
						html += '<div class="images-2-up">\n'
						for (const image of slotItem.content) {
							html += `\t<a class="mobx" data-rel="images" data-type="image" data-title="${image.caption}" href="${image.file}"><img class="mobx" src="${image.thumbnail || image.file}"></a>\n`
						}
						html += '</div>\n'
						break

					case 'images-full':
						for (const item of slotItem.content) {
							html += `<h3>${item.title}</h3>\n`
							html += `<a class="mobx mobx-full" data-rel="images" data-type="image" data-title="${item.title}" href="${item.file}"><img src="${item.file}"></a>\n`
						}
						break

					case 'infobar':
						html += '<div class="infobar">\n'
						for (const item of slotItem.content) {
							if (item.type === 'text') {
								html += `\t<div>${item.value}</div>\n`
							} else {
								html += `\t<img src="${item.value}" title="${item.title}">\n`
							}
						}
						html += '</div>\n'
						break

					case 'item-actions':
						html += '<div class="metrics">\n'
						html += `\t<div class="metrics-reactions" data-reactions="${slotItem.content.reactions}"><svg><use href="#action-liked"></use></svg>${formatNumber(slotItem.content.reactions)}</div>\n`
						html += `\t<div class="metrics-comments" data-comments="${slotItem.content.comments}">${formatNumber(slotItem.content.comments)}<svg><use href="#action-comments"></use></svg></div>\n`
						html += '</div>\n'
						html += `<div class="item-actions${slotItem.class ? ` ${slotItem.class}` : ''}">\n`
						html += `\t<button data-id="${slotItem.content.id}" data-posttype="3" class="action-button button-ui action-reaction"><svg><use href="#action-like"></use></svg>Like</button>\n`
						html += `\t<button data-id="${slotItem.content.id}" class="action-button button-ui action-comment"><svg><use href="#action-comment"></use></svg>Comment</button>\n`
						html += `\t<button data-id="${slotItem.content.id}" class="action-button button-ui action-share"><svg><use href="#action-share"></use></svg>Share</button>\n`
						html += '</div>\n'
						break

					case 'item-owner': {
						const card = slotItem.content
						html += '<div class="item-details-owner">\n'
						html += '\t<div>\n'
						html += `\t\t<a href="/${card.profile}/">\n`
						html += `\t\t\t<img src="${card.profilePic}" loading="lazy" alt="${card.profileName}">`
						html += '\t\t</a>\n'
						html += '\t</div>\n'
						html += '\t<div>\n'
						html += `\t\t<h4><a href="/${card.profile}/">${card.profileName}</a></h4>\n`
						html += `\t\t<div class="card-timestamp">${formatRelativeDate(card.date)}</div>\n`
						html += '\t</div>\n'
						html += '</div>\n'
						break
					}

					case 'items-filter':
						html += '<div class="filter-bar-holder">\n'
						html += '\t<div class="filter-bar-count">&nbsp;</div>\n'
						html += '\t<div class="filter-bar">\n'
						html += '\t\t<div>\n'
						html += '\t\t\t<input id="filter-text" class="filter-text" placeholder="Filter items...">\n'
						html += '\t\t\t<button id="filter-field" title="Filter by..."><img src="/img/filter-field.svg"></button>\n'
						html += '\t\t</div>\n'
						html += '\t\t<div>\n'
						html += '\t\t\t<button id="items-count" title="Items per page"><img src="/img/items-per-page.svg"></button>\n'
						html += '\t\t\t<button id="items-sort" title="Sort Options"><img src="/img/sort-ascending.svg"></button>\n'
						html += '\t\t\t<div id="items-navigation" style="display: none;">\n'
						html += '\t\t\t\t<button id="items-previous-page" title="Previous page"><img src="/img/arrow-previous.svg"></button>\n'
						html += '\t\t\t\t<span>Page</span>\n'
						html += '\t\t\t\t<input id="items-page" value="1">\n'
						html += '\t\t\t\t<span id="items-page-count">of 1</span>\n'
						html += '\t\t\t\t<button id="items-next-page" title="Next page"><img src="/img/arrow-next.svg"></button>\n'
						html += '\t\t\t</div>\n'
						html += '\t\t</div>\n'
						html += '\t</div>\n'
						html += '</div>\n'
						html += '<div class="items-holder"></div>\n'
						break

					case 'link':
						html += `<a href="${slotItem.link}"`
						if (slotItem.class) html += ` class="${slotItem.class}"`
						html += '>'
						if (slotItem.image) html += `<img src="${slotItem.image}">`
						html += `<span>${slotItem.text}</span></a>\n`
						break

					case 'list':
						html += '<ul class="nested-list">\n'
						for (const item of slotItem.content) {
							let listItem = '\t<li>'
							if (item.link) {
								listItem += `<a href="${item.link}">`
							}
							listItem += smartify(item.name)
							if (item.link) {
								listItem += '</a>'
							}
							listItem += '</li>\n'
							html += listItem
						}
						html += '</ul>\n'
						break

					case 'menu-list':
						html += '<ul class="menu-list">\n'
						for (const item of slotItem.content) {
							let listItem = '\t<li>'
							listItem += `<a href="${item.link}">`
							listItem += `<img src="${item.image}">`
							listItem += '<div>'
							listItem += smartify(item.name)
							if (item.description) listItem += `<span>${item.description}</span>`
							listItem += '</div>'
							listItem += '</a>'
							listItem += '</li>\n'
							html += listItem
						}
						html += '</ul>\n'
						break

					case 'metadata':
						html += renderMetadata(slotItem.content)
						break

					case 'missing-data':
						html += `<div class="missing-data">${slotItem.content}</div>\n`
						break

					case 'node-categories':
						html += slotItem.content.map(item => {
							let itemHtml = '<a'
							if (item.id) itemHtml += ` id="${item.id}"`
							if (item.class) itemHtml += ` class="${item.class}"`
							itemHtml += ` href="${item.link}" title="${item.text}">`
							if (item.figure) {
								itemHtml += `<figure><img src="${item.image}"></figure>`
							} else {
								itemHtml += `<img src="${item.image}">`
							}
							itemHtml += `<span>${item.text}</span></a>`
							return itemHtml
						}).join('\n')
						break

					case 'node-items':
						for (const item of slotItem.content) {
							html += '<div class="node-card">\n'
							html += `\t<a href="${item.link}"><img src="${item.image}"></a>\n`
							html += '\t<div>\n'
							html += `\t\t<a href="${item.link}"><h2>${item.text}</h2></a>\n`
							if (item.explore) html += `\t\t<a href="${item.explore}"><img src="/img/explore.svg">Explore</a>\n`
							if (item.itemCount > 0) html += `\t\t<a href="${item.link}/all-items"><img src="/img/observation.svg">${formatItemCount(item.itemCount)}</a>\n`
							html += '\t</div>\n'
							html += '</div>\n'
						}
						break

					case 'paragraph':
						html += `<p>${smartify(slotItem.content)}</p>\n`
						break

					case 'paragraph-sections': {
						const sections = slotItem.content
						for (const section of sections) {
							html += `<h2 id="${section.jump}">${smartify(section.name)}</h2>\n`
							for (const item of section.items) {
								html += `<h3 id="${item.jump}">${smartify(item.name)}</h3>\n`
								html += `<p>${smartify(item.text)}</p>\n`
							}
						}
						break
					}

					case 'profile': {
						const profile = slotItem.content
						html += `<div class="profile-poster-holder${profile.poster ? '' : ' no-poster'}">\n`
						html += '\t<div class="profile-poster">\n'
						if (profile.owner) {
							html += '\t\t<input id="profile-poster-input" type="file" accept="image/*,image/heif,image/heic" hidden>'
							html += `\t\t<button id="edit-profile-poster"><img src="/img/camera.svg"><span>${profile.poster ? 'Edit' : 'Add'} poster</span></button>\n`
						}
						html += '\t</div>\n'
						html += '</div>\n'
						html += '<div class="profile-header-holder">\n'
						html += '\t<section class="profile-header">\n'
						html += '\t\t<div class="profile-icon-holder">\n'
						html += '\t\t\t<div class="profile-icon">\n'
						html += '\t\t\t\t<img src="">\n'
						if (profile.owner) html += '\t\t\t\t<button id="edit-profile-icon"><img src="/img/camera.svg"></button>\n'
						html += '\t\t\t</div>\n'
						html += '\t\t</div>\n'
						html += '\t\t<div class="profile-identity">\n'
						html += `\t\t\t<h1 title="${profile.name}">${profile.name}</h1>\n`
						html += `\t\t\t<h4>${profile.blurb || '&nbsp;'}</h4>\n`
						html += '\t\t\t<ul class="profile-links">\n'
						if (profile.links.length > 0) {
							console.log(profile.links)
							html += profile.links.map(data => {
								let item = '\t\t\t\t<li>'
								item += `<a href="${data.url}" title="${data.title || data.name}" target="_blank"><img src="${data.customIcon || `/img/link-providers/${data.icon}`}"></a>`
								item += '</li>\n'
								return item
							}).join('')
						}
						html += '\t\t\t</ul>\n'
						html += '\t\t</div>\n'
						html += '\t\t<div class="profile-actions">'
						if (profile.owner) html += '\t\t\t<button id="profile-edit" class="action-button">Edit</button>\n'
						if (profile.loggedIn && profile.canFollow) html += '\t\t\t<button id="follow" class="action-button button-accent">Follow</button>\n'
						html += '\t\t</div>\n'
						html += '\t</section>\n'
						html += '\t<div class="profile-header-separator"></div>\n'
						html += '</div>\n'
						break
					}

					case 'profile-tabs':
						html += '<div class="tabs">\n'
						html += slotItem.content.map(data => {
							return `\t<a href="${data.link}"${data.active ? ' class="tab-active"' : ''}>${data.text}</a>`
						}).join('\n')
						html += '\n</div>\n'
						break

					case 'property-grid': {
						html += '<div class="property-grid">\n'
						html += slotItem.content.map(data => `\t<span>${data.field}</span><div>${data.value ? formatValue(data.value, data.format) : ''}</div>\n`).join('')
						html += '</div>\n'
						break
					}

					case 'raw':
						html += slotItem.content
						break

					case 'search-nav':
						html += '<ul class="search-nav">\n'
						for (const page of slotItem.content) {
							html += '\t<li>'
							if (!page.link || page.text === slotItem.page) {
								html += page.text
							} else {
								html += `<a href="${page.link}">${page.text}</a>`
							}
							html += '</li>\n'
						}
						html += '</ul>\n'
						break

					case 'search-results': {
						const hits = slotItem.content
						if (slotItem.container) html += `<div class="${slotItem.container}">\n`
						for (const hit of hits) {
							html += '<div class="search-hit">\n'
							if (hit.link) {
								html += `\t<div class="search-hit-image"><a href="${hit.link}"><img src="${hit.image}" alt="${hit.name}"></a></div>\n`
								html += '\t<div class="search-hit-body">\n'
								html += `\t\t<div class="search-hit-header"><a href="${hit.link}"><h2>${hit.name}</h2></a></div>\n`
								html += '\t</div>\n'
							} else {
								html += `\t<div class="search-hit-image"><a href="${hit.file}" data-file="${hit.file}"><img src="${hit.image}" alt="${hit.name}"></a></div>\n`
								html += '\t<div class="search-hit-body">\n'
								html += `\t\t<div class="search-hit-header"><a href="${hit.file}" data-file="${hit.file}"><h2>${hit.name}</h2></a> <a href="${hit.open}"><img src="/img/open-file.svg"></a></div>\n`
								html += `\t\t<div>${hit.file}</div>\n`
								if (hit.date) html += `\t\t<div>${formatRelativeDate(hit.date)}</div>\n`
								if (hit.text) html += `\t\t<div>${hit.text}</div>\n`
								html += '\t</div>\n'
							}
							html += '</div>\n'
						}
						if (slotItem.container) html += '</div>\n'
						break
					}

					case 'table': {
						html += '<div class="table-holder">\n'
						html += '<table>\n'
						html += '\t<colgroup>\n'
						html += slotItem.cols.map(data => `\t\t<col width="${data}">\n`).join('')
						html += '\t</colgroup>\n'
						html += '\t<thead>\n'
						html += '\t\t<tr>\n'
						html += slotItem.headers.map(data => `\t\t\t<th${data.align ? ` style="text-align: ${data.align};"` : ''}>${data.text}</th$>\n`).join('')
						html += '\t\t</tr>\n'
						html += '\t</thead>\n'
						html += '\t<tbody>\n'
						for (const row of slotItem.content) {
							html += '\t\t<tr>\n'
							for (let i = 1; i <= slotItem.cols.length; i++) {
								html += `\t\t\t<td style="width: ${slotItem.cols[i - 1]}${slotItem.headers[i - 1].align ? `; text-align: ${slotItem.headers[i - 1].align}` : ''};">`
								const text = row[i - 1]
								if (slotItem.cols[i - 1].format) {
									switch (slotItem.cols[i - 1].format) {
										case 'smart':
											html += smartify(text)
											break
										case 'decimal':
											html += formatDecimalNumber(text)
											break
										case 'number':
											html += formatNumber(text)
											break
										case 'currency':
											html += formatCurrency(text)
											break
									}
								} else {
									html += text
								}
								html += '</td>\n'
							}
							html += '\t\t</tr>\n'
						}
						html += '\t</tbody>\n'
						html += '</table>\n'
						html += '</div>\n'
						break
					}

					case 'tag-cloud': {
						if (slotItem.content.tags) {
							const maxFontSizeForTag = 3
							html += '<div class="tag-cloud-holder">\n'
							html += '\t<ul class="tag-cloud">\n'
							html += slotItem.content.tags.map((item) => {
								const numberOfItems = item.c
								const logCount = Math.log(numberOfItems + 1)
								const logMax = Math.log(slotItem.content.max + 1)
								let fontSize = (logCount / logMax) * maxFontSizeForTag
								fontSize = Math.max(1, fontSize)

								let fontWeight = '400'
								if (fontSize > 3) {
									fontWeight = '900'
								} else if (fontSize > 2.5) {
									fontWeight = '800'
								} else if (fontSize > 2) {
									fontWeight = '700'
								} else if (fontSize > 1.5) {
									fontWeight = '600'
								} else if (fontSize > 1.1) {
									fontWeight = '500'
								}
								console.log({ tag: item.slug, count: item.c, fontSize })
								let tagLink = ''
								tagLink += '\t\t<li>'
								tagLink += `<a href="/tags/${item.slug}" style="font-size: ${fontSize}em; font-weight: ${fontWeight};">${item.name}</a>`
								tagLink += '</li>\n'
								return tagLink
							}).join('')
							html += '\t</ul>\n'
							html += '</div>\n'
						}
						break
					}

					case 'tags':
						html += '<ul class="tags-holder">\n'
						html += slotItem.content.map(data => `\t<li><a href="/tags/${data.slug}/">${data.name}</a></li>`).join('\n')
						html += '</ul>\n'
						break

					case 'video':
						html += `<div><video class="full-width-video" src="${slotItem.content}" poster="${slotItem.poster}" controls playsinline preload></div>\n`
						break

					default:
						if (debug) console.warn(`Unknown slot type: ${slotItem.type}`)
				}
			}
			return addIndent(html, 3)
		}

		case 'string':
			return object[param] ? smartify(object[param]) : ''

		case 'stylesheets':
			return object.stylesheets
				? addIndent(object.stylesheets.map(href => `<link href="${href}" rel="stylesheet">`).join('\n'), 1)
				: ''

		case 'var':
			return object[param] ? object[param] : ''

		default:
			return ''
	}
}

function renderBreadcrumbs(breadcrumbs, cssClass) {
	let html = '<nav aria-label="Breadcrumb">\n'
	html += `\t<ol class="breadcrumbs${cssClass ? ` ${cssClass}` : ''}" itemscope itemtype="https://schema.org/BreadcrumbList">\n`
	let i = 1
	for (const crumb of breadcrumbs) {
		html += '\t\t<li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">'
		if (i > 1) html += '&gt '
		if (crumb.link) {
			html += `<a href="${crumb.link}" itemprop="item"><span itemprop="name">${smartify(crumb.text)}</span></a>`
		} else {
			html += `<span itemprop="name" style="font-weight: 500;">${smartify(crumb.text)}</span>`
		}
		html += `<meta itemprop="position" content=${i} />`
		html += '</li>\n'
		i++
	}
	html += '\t</ol>\n'
	html += '</nav>\n'
	return html
}

function renderMetadata(metadata) {
	let html = '<details class="image-metadata">\n'
	html += '\t<summary>Image Metadata</summary>\n'
	for (const section of metadata) {
		html += '\t<section>\n'
		html += `\t\t<h3>${section.header}</h3>\n`
		html += '\t\t<table>\n'
		for (const field of section.fields) {
			html += `\t\t\t<tr><td>${field.field}</td><td>${field.value}</td></tr>\n`
		}
		html += '\t\t</table>\n'
		html += '\t</section>\n'
	}
	html += '</details>\n'
	return html
}

exports.generatePage = async (data, template, debug) => {
	if (debug) console.log(data)
	const templateFile = fs.readFileSync(`templates/${template}`)
	const html = templateFile.toString('utf-8')

	return html.replace(/<!--([\s\S]*?)-->/img, match => handleReplacements(match, data, debug))
}

exports.generatePartial = async (data, templateString, debug) => {
	if (debug) console.log(data)

	return templateString.replace(/<!--([\s\S]*?)-->/img, match => handleReplacements(match, data, debug))
}
