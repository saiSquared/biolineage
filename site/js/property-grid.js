'use strict'

export default function propertyGrid(container, inputObject) {
	// Convert input object → internal model array
	const model = Object.entries(inputObject || {}).map(([key, value]) => ({
		key,
		value
	}))

	// Always start with one empty row if no data
	if (model.length === 0) {
		model.push({ key: '', value: '' })
	}

	container.innerHTML = '' // Clear container

	const table = document.createElement('table')
	table.className = 'property-grid'

	const thead = document.createElement('thead')
	const headRow = document.createElement('tr')

	for (const header of ['Property', 'Value', '']) {
		const th = document.createElement('th')
		th.textContent = header
		headRow.appendChild(th)
	}

	thead.appendChild(headRow)
	table.appendChild(thead)

	const tbody = document.createElement('tbody')
	table.appendChild(tbody)

	container.appendChild(table)

	function focusCell(cell) {
		cell.focus()
		const range = document.createRange()
		range.selectNodeContents(cell)
		range.collapse(false)
		const sel = window.getSelection()
		sel.removeAllRanges()
		sel.addRange(range)
	}

	function focusKeyCellOfNewRow() {
		const lastRow = tbody.lastElementChild
		if (!lastRow) return
		focusCell(lastRow.children[0])
	}

	function render() {
		tbody.innerHTML = ''

		model.forEach((row, idx) => {
			const tr = document.createElement('tr')

			const keyTd = document.createElement('td')
			keyTd.contentEditable = 'true'
			keyTd.textContent = row.key || ''
			keyTd.oninput = () => {
				model[idx].key = keyTd.textContent.trim()
				container.dispatchEvent(new Event('propertygridchange', { bubbles: true }))
			}

			const valueTd = document.createElement('td')
			valueTd.contentEditable = 'true'
			valueTd.textContent = row.value || ''
			valueTd.oninput = () => {
				model[idx].value = valueTd.textContent.trim()
				container.dispatchEvent(new Event('propertygridchange', { bubbles: true }))
			}

			// ENTER in keyTd → move caret to valueTd
			keyTd.addEventListener('keydown', (ev) => {
				if (ev.key === 'Enter') {
					ev.preventDefault()
					focusCell(valueTd)
				}
			})

			// ENTER in valueTd → add new row
			valueTd.addEventListener('keydown', (ev) => {
				if (ev.key === 'Enter') {
					ev.preventDefault()
					api.add()
					focusKeyCellOfNewRow()
				}
			})

			const deleteTd = document.createElement('td')
			deleteTd.innerHTML = '⛔'
			deleteTd.onclick = () => {
				model.splice(idx, 1)
				render()
			}

			tr.appendChild(keyTd)
			tr.appendChild(valueTd)
			tr.appendChild(deleteTd)
			tbody.appendChild(tr)
		})
	}

	const api = {
		add() {
			model.push({ key: '', value: '' })
			render()
		},
		render,

		// Convert internal model → object output
		get value() {
			// If only one row and either key or value is empty → null
			if (model.length === 1) {
				const row = model[0]
				if (!row.key.trim() || !row.value.trim()) {
					return null
				}
			}

			// Build object from non-empty keys
			const obj = {}
			for (const row of model) {
				const key = row.key.trim()
				if (key !== '') {
					obj[key] = row.value
				}
			}

			// If object ended up empty → null
			return Object.keys(obj).length > 0 ? obj : null
		}
	}

	api.render()
	return api
}
