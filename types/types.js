/**
 * @typedef {Object} BiolineageTree
 * @property {String} id - UUID of the tree
 * @property {String} ownerId - UUID of the user who owns the tree
 * @property {String} entityTypeId - UUID of the entity_type
 * @property {String} name - name of the tree
 * @property {String} slug - unique slug for the tree
 * @property {String|null} description - optional description of the three
 * @property {Boolean} archived - whether the tree is in archive status
 * @property {String} createdBy - UUID of user who created the tree
 * @property {Date} createDate - timewstamp of when the tree's definition was created
 * @property {String} modifiedBy - UUID of the user who last modified the tree's definition
 * @property {Date} modifiedDate - timewstamp of the last time the tree's definition was modified
 * @property {String} key - unique key for the entity_type
 * @property {String} label - label text for referring to the entity_type
 */

/**
 * @typedef {Object} BiolineageEntityType
 * @property {String} id - UUID of the entity_type
 * @property {String} key - the unique key for the entity_type
 * @property {String} label - user-facing name to use for the entity_type
 * @property {String} description - description of the entity_type
 */

/**
 * @typedef {Object} BiolineageEntityNameParts
 * @property {String} id - UUID of the entity_name_part
 * @property {String} code - GEDCOM-X code used as property name in name_parts
 * @property {String} slug - id for the part on forms
 * @property {String} label - label for the part on forms
 * @property {Boolean} surface - whether the part should always shown on forms
 * @property {Boolean} required - whether the part is required on forms
 * @property {String} placeholder - placeholder attribute for the part on forms
 * @property {String|null} format - optional formatting for the part when rendering a name
 * @property {String} description - description of the part for use as tooltip on forms
 * @property {String} width - amount of space to reserve for the part on forms
 */
