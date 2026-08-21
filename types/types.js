/**
 * @typedef {Object} BiolineageSession
 * @property {String} userId - UUID of session user
 * @property {String} email - email address of session user
 * @property {String} name - name of session user
 * @property {Boolean} avatar - whether the session user has an avatar
 * @property {String} role - role of session user
 */

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

/**
 * @typedef {Object} BiolineageEntityFact
 * @property {String} entityId - entity UUID this fact pertains to
 * @property {String|null} factId - fact UUID or null for new facts
 * @property {String} code - fact_types code
 * @property {String} [dateText] - human readable description of the fact date
 * @property {Number} [year] - year the fact took place in
 * @property {Number} [month] - month the fact took place in
 * @property {Number} [day] - day the fact took place in
 * @property {Number} [hour] - hour the fact took place at
 * @property {Number} [minute] - minute the fact took place at
 * @property {Number} [second] - second the fact took place at
 * @property {String} [timezone] - time zone the fact took place in
 * @property {no|existing|new} place - associated place information for the fact
 * @property {String} [placeId] - place UUID for existing places
 * @property {String} [placeType] - place type
 * @property {String} [placeName] - place name
 * @property {String} [placeDescription] - place description
 * @property {String} [sovereignEntity] - custom sovereign entity
 * @property {String} [sovereignEntityId] - UUID of sovereign entity
 * @property {String} [subdivision] - custom subdivision
 * @property {String} [subdivisionId] - UUID of subdivision
 * @property {String} [administrativeDivision] - custom administrative division
 * @property {String} [administrativeDivisionId] - UUID of administrative division
 * @property {String} [municipality] - custom municipality
 * @property {String} [municipalityId] - UUID of smunicipality
 * @property {Number} [latitude] - latitude of place
 * @property {Number} [longitude] - longitude of place
 * @property {String} [address] - street address of place
 * @property {String} [googlePlaceId] - extract pid from Google Maps share embed
 * @property {String} [placeNotes] - additional notes about the place
 */

/**
 * @typedef {Object} BiolineageEntityName
 * @property {String} entityId - entity UUID this name pertains to
 * @property {String|null} nameId - fact UUID or null for new facts
 * @property {String} nameType - the unique type for this name entry
 * @property {String} Display - name_parts Display
 * @property {String} [PrefixTitle] - name_parts PrefixTitle
 * @property {String} [Primary] - name_parts Primary
 * @property {String} [Moniker] - name_parts Moniker
 * @property {String} [Secondary] - name_parts Secondary
 * @property {String} [Middle] - name_parts Middle
 * @property {String} [Familiar] - name_parts Familiar
 * @property {String} [Religous] - name_parts Religous
 * @property {String} [Geographic] - name_parts Geographic
 * @property {String} [Family] - name_parts Family
 * @property {String} [Maiden] - name_parts Maiden
 * @property {String} [Patronymic] - name_parts Patronymic
 * @property {String} [Matronymic] - name_parts Matronymic
 * @property {String} [Occupational] - name_parts Occupational
 * @property {String} [Characteristic] - name_parts Characteristic
 * @property {String} [Postnom] - name_parts Postnom
 * @property {String} [Particle] - name_parts Particle
 * @property {String} [RootName] - name_parts RootName
 * @property {String} [SuffixTitle] - name_parts SuffixTitle
 * @property {String} [description] - description of this name type
 */

/**
 * @typedef {Object} BiolineageEntitySex
 * @property {String} entityId - entity UUID this fact pertains to
 * @property {String|null} sex - entity sex
 */
