# 20260802-api-integration.md

API Integration for biolineage

This document describes the API endpoints exposed by biolineage. It explains request and response formats, Fastify route structure, serialization rules, how the API integrates with the lineage tree renderer, and how the API will integrate with future frontend components. This document serves as the reference for all external integrations.

---

## 1. Overview

The biolineage API is a lightweight, JSON‑based interface built on Fastify. It exposes endpoints for:

- retrieving entity records
- retrieving events
- retrieving relationships
- retrieving normalized places
- computing lineage trees
- supporting future frontend components

The API is designed to be:

- predictable
- stable
- deterministic
- easy to consume
- compatible with modern frontend frameworks

All endpoints return structured JSON with consistent serialization rules.

---

## 2. Fastify Route Structure

Routes follow a simple pattern:

- `/entity/:uuid`
- `/entity/:uuid/events`
- `/entity/:uuid/relationships`
- `/entity/:uuid/entity-tree`
- `/place/:uuid`
- `/search/entity`
- `/search/place`

Each route is defined in a dedicated Fastify plugin. Plugins are loaded during server initialization to keep the route structure modular and maintainable.

Example route definition:

```js
app.get('/entity/:uuid', async (req, reply) => {
  const entity = await db.getEntity(req.params.uuid)
  reply.send(entity)
})
```

All routes return JSON.

---

## 3. Serialization Rules

Serialization is handled by Fastify’s built‑in JSON serializer. The rules are:

1. All UUIDs are returned as lowercase strings.
2. Dates are returned in ISO‑8601 format when present.
3. Null values are preserved.
4. Arrays are always returned, even when empty.
5. Objects follow a stable key ordering for readability.
6. No additional metadata is added unless explicitly required.

Serialization is deterministic across all endpoints.

---

## 4. Entity Endpoints

### 4.1 `/entity/:uuid`

Returns a single entity record.

Response fields include:

- uuid
- given_name
- family_name
- sex
- notes
- created_at
- updated_at

### 4.2 `/entity/:uuid/events`

Returns all events associated with the entity.

Each event includes:

- uuid
- event_type
- date
- place_uuid
- description
- source

### 4.3 `/entity/:uuid/relationships`

Returns all relationship edges involving the entity.

Each relationship includes:

- uuid
- entity_a_uuid
- entity_b_uuid
- relationship_type
- inferred
- notes

---

## 5. Place Endpoints

### 5.1 `/place/:uuid`

Returns a normalized place record.

Fields include:

- uuid
- name
- country
- region
- city
- type
- notes

### 5.2 `/search/place`

Supports searching for places by name, region, or country.

---

## 6. Lineage Tree Endpoint

### 6.1 `/entity/:uuid/entity-tree`

This endpoint computes and returns the lineage tree for the target entity. It integrates directly with the tree rendering functions described in 20260802-tree-function-design.md.

The response includes:

- entity
- ancestors
- descendants
- spouses
- siblings
- meta

Example response structure:

```json
{
  "entity": { ... },
  "ancestors": [
    { "uuid": "...", "depth": 1, "relationship": "parent" }
  ],
  "descendants": [
    { "uuid": "...", "depth": 1, "relationship": "child" }
  ],
  "spouses": [
    { "uuid": "...", "relationship": "spouse" }
  ],
  "siblings": [
    { "uuid": "...", "relationship": "sibling" }
  ],
  "meta": {
    "cycles_detected": false,
    "generated_at": "timestamp"
  }
}
```

The endpoint does not perform rendering. Rendering is handled entirely by the frontend.

---

## 7. Integration with the Lineage Tree Renderer

The lineage tree renderer is a backend subsystem that:

- performs ancestor traversal
- performs descendant traversal
- detects cycles
- derives siblings
- attaches spouses
- orders nodes by generation depth

The API simply calls the renderer and returns its output.

The renderer is designed to be:

- stateless
- deterministic
- fast
- safe for deep recursion

This ensures consistent results across all API calls.

---

## 8. Integration with Future Frontend Components

The API is designed to support future frontend features, including:

- interactive lineage trees
- entity detail pages
- event timelines
- place detail pages
- search interfaces
- relationship visualizations
- historical map overlays

The JSON structures returned by the API are intentionally simple and predictable to make frontend integration straightforward.

---

## 9. Error Handling

All endpoints follow consistent error handling rules:

- 404 for missing UUIDs
- 400 for invalid parameters
- 500 for unexpected server errors
- JSON error responses with a stable structure

Example error response:

```json
{
  "error": "Not Found",
  "message": "Entity not found",
  "statusCode": 404
}
```

---

## 10. Summary

The biolineage API is designed to be:

- simple
- predictable
- stable
- easy to integrate
- compatible with modern frontend frameworks
- tightly coupled to the lineage tree renderer
- extensible for future features

It provides a clean interface for retrieving entities, events, relationships, places, and lineage trees.
