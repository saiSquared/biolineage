# 20260802-tree-function-design.md

Lineage Tree Function Design for biolineage

This document describes the technical design of the lineage tree rendering functions used by biolineage. It explains ancestor traversal, descendant traversal, cycle detection, ordering rules, and how the API returns tree structures to the frontend. These functions power the `/entity/:id/entity-tree` endpoint and form the computational core of lineage visualization.

---

## 1. Overview

The lineage tree functions compute an entity tree for any individual in the database. An entity tree consists of:

- ancestors
- descendants
- spouses and partners
- siblings (derived from shared parents)
- generation ordering
- cycle-safe traversal

The tree is computed using PostgreSQL recursive queries and returned as a structured JSON object through the API.

The design is graph-first: entities are nodes, relationships are edges. The tree functions traverse these edges to build a complete lineage structure.

---

## 2. Ancestor Traversal

Ancestor traversal begins at a target entity and walks upward through parent edges. The traversal uses a recursive CTE with the following rules:

1. Start with the target entity.
2. Select all parents of the current generation.
3. Add each parent to the ancestor list.
4. Continue recursively until no further parents exist.
5. Track visited nodes to prevent cycles.
6. Record generation depth for ordering.

Generation depth is defined as:

- depth 0: the target entity
- depth 1: parents
- depth 2: grandparents
- depth 3: great-grandparents
- and so on

Ancestor traversal produces a list of nodes with their generation depth and relationship context.

---

## 3. Descendant Traversal

Descendant traversal mirrors ancestor traversal but walks downward through child edges.

Rules:

1. Start with the target entity.
2. Select all children of the current generation.
3. Add each child to the descendant list.
4. Continue recursively until no further children exist.
5. Track visited nodes to prevent cycles.
6. Record generation depth for ordering.

Generation depth for descendants is defined as:

- depth 0: the target entity
- depth 1: children
- depth 2: grandchildren
- depth 3: great-grandchildren
- and so on

Descendant traversal produces a list of nodes with their generation depth and relationship context.

---

## 4. Cycle Detection

Historical datasets often contain cycles, such as:

- repeated parentage
- incorrect relationships
- blended families with circular edges
- data entry errors

Cycle detection is implemented by maintaining a visited set inside the recursive CTE. When a node is encountered that has already been visited:

- the traversal stops for that branch
- the node is not added again
- the cycle is recorded internally for debugging

This ensures that lineage trees do not contain infinite loops or duplicate nodes.

---

## 5. Ordering Rules

Ordering is essential for rendering a readable lineage tree. The ordering rules are:

1. Sort ancestors by generation depth ascending.
2. Sort descendants by generation depth ascending.
3. Within each generation, sort by uuid for deterministic output.
4. Spouses and partners are listed alongside the target entity.
5. Siblings are derived from shared parents and grouped together.
6. Nodes with missing sex or ambiguous relationships are included but not used for ordering beyond depth.

These rules ensure stable output across ingestion runs and consistent rendering in the frontend.

---

## 6. Spouse and Partner Handling

Spouses and partners are not part of ancestor or descendant traversal. They are attached to the target entity as relational context.

Rules:

1. Retrieve all spouse or partner edges for the target entity.
2. Include spouses in the entity tree output.
3. Do not treat spouses as ancestors or descendants.
4. Use spouse relationships to infer sibling groups when children exist.

This ensures correct representation of blended families.

---

## 7. Sibling Derivation

Siblings are not stored directly in the database. They are derived from shared parents.

Rules:

1. Retrieve all parents of the target entity.
2. Retrieve all children of those parents.
3. Exclude the target entity.
4. Group siblings by shared parent sets.

Sibling derivation is performed after ancestor traversal and before descendant traversal.

---

## 8. API Output Structure

The `/entity/:id/entity-tree` endpoint returns a structured JSON object containing:

- entity
- ancestors
- descendants
- spouses
- siblings
- metadata

Example structure:

```json
{
  "entity": { ... },
  "ancestors": [
    { "uuid": "...", "depth": 1, "relationship": "parent" },
    { "uuid": "...", "depth": 2, "relationship": "grandparent" }
  ],
  "descendants": [
    { "uuid": "...", "depth": 1, "relationship": "child" },
    { "uuid": "...", "depth": 2, "relationship": "grandchild" }
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

The API does not perform rendering. Rendering is handled by the frontend.

---

## 9. Performance Considerations

PostgreSQL recursive CTEs provide stable performance even for deep lineage trees. Performance optimizations include:

- indexing relationship edges
- indexing entity UUIDs
- caching normalized place lookups
- limiting traversal to relevant relationship types
- using deterministic ordering

The tree functions are designed to scale to thousands of nodes.

---

## 10. Summary

The lineage tree functions in biolineage are designed to be:

- graph-first
- cycle-safe
- deterministic
- deeply recursive
- structurally accurate
- consistent across ingestion runs

They form the computational foundation of the entity tree endpoint and support all lineage visualization features.
