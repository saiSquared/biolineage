'use strict'

import treeModal from '/js/tree-modal.js'

const addTree = document.getElementById('add-tree')

async function createTree(event) {
	event.preventDefault()
	const modal = treeModal()
	await modal.show()
}

addTree.addEventListener('click', createTree)

document.addEventListener('DOMContentLoaded', () => {
	console.log('DOM loaded: Home')
})
