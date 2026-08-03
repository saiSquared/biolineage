'use strict'

// modules/bootstrap.js
const fs = require('node:fs')
const { executeSql } = require('../db/database.js')
const { env, nodeGroups, nodeTypes, linkProviders } = require('./globals.js')

function ingestObject(data, obj) {
	for (const row of data) {
		obj.push(row)
	}
}

async function initObjects() {
	ingestObject(await executeSql('select * from "nodeGroups";', null, true), nodeGroups)
	fs.writeFileSync(`${env.NGINX_PATH}/types/node-groups.json`, JSON.stringify(nodeGroups))
	ingestObject(await executeSql('select * from "nodeTypes";', null, true), nodeTypes)
	fs.writeFileSync(`${env.NGINX_PATH}/types/node-types.json`, JSON.stringify(nodeTypes))
	ingestObject(await executeSql('select id, name, url, icon, regex from "linkProviders";', null, true), linkProviders)
	const nodePicker = await executeSql('select "nodeGroups".id "nodeGroupId", "nodeTypes".id, "nodeTypes".name, "nodeTypes".description, "nodeGroups"."allowChildren" from "nodeTypes" join "nodeGroups" on "nodeGroups".id = "nodeTypes"."nodeGroupId" order by "nodeTypes".name', null, true)
	fs.writeFileSync(`${env.NGINX_PATH}/types/node-picker.json`, JSON.stringify(nodePicker))
}

module.exports = {
	initObjects
}
