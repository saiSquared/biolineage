# overview.md

Documentation Overview for biolineage

This document provides an overview of the biolineage documentation set. It explains the purpose of each file in the docs/ directory, the milestone‑based structure, and how the appendix fits into the overall documentation system.

## Future Work

Proposals for upcoming architectural changes can be found in the proposals/ directory.
Proposals represent planned architectural changes. They are not milestones and do not describe completed work.

---

## 1. Documentation Structure

The documentation in the docs/ directory is divided into two categories:

1. milestone documents
2. immutable appendix information

Milestone documents describe architectural decisions, ingestion logic, normalization rules, and API behavior at specific points in time. They are versioned using date prefixes.

The appendix contains permanent project‑level information that does not change across milestones.

---

## 2. Milestone Documents

Milestone documents use the format:

```text
YYYYMMDD-topic.md
```

Each milestone captures the state of a subsystem at a specific point in time. The current milestone set includes:

### 20260802-relationship-model-rationale.md

Explains the graph‑first relationship model, including parent/child semantics, spouse and partner edges, inferred relationships, ambiguity handling, and why graph traversal is superior to hierarchical GEDCOM structures.

### 20260802-event-ingestion.md

Describes how raw event data is transformed into normalized PostgreSQL rows. Covers parsing rules, event typing, date normalization, place linkage, and handling of incomplete or narrative event descriptions.

### 20260802-place-normalization.md

Defines the formal methodology for place normalization. Explains how raw locality fields are parsed, how ogName / ogCountry / ogRegion / ogCity are interpreted, how UUIDs are assigned, how misspellings and historical names are resolved, and how ambiguous cases are flagged.

### 20260802-sex-inference.md

Describes the sex inference subsystem. Covers inference from relationships, narrative context, ambiguous cases, conflict resolution, and how sex is stored and updated in the database.

### 20260802-tree-function-design.md

Explains the lineage tree rendering functions. Covers ancestor traversal, descendant traversal, cycle detection, ordering rules, sibling derivation, spouse handling, and the structure returned by the personal tree API.

### 20260802-api-integration.md

Documents the API endpoints exposed by biolineage. Covers Fastify route structure, request and response formats, serialization rules, lineage tree integration, and future frontend compatibility.

---

## 3. Immutable Appendix

The appendix.md file contains permanent project‑level information, including:

- project ownership
- copyright assignment
- attribution
- AI involvement
- geographical data sources
- tandem geography project schema
- static site information
- long‑term hosting commitment

This information does not change across milestones and is not versioned by date.

---

## 4. How Milestones Work

Milestones represent stable snapshots of architectural decisions. New milestones are created when:

- ingestion logic changes
- normalization rules evolve
- new subsystems are added
- schema changes occur
- API behavior is updated

Milestones are not edited after creation. Future changes are documented in new dated files.

---

## 5. Relationship to the Codebase

The documentation corresponds directly to the implementation:

- ingestion logic in transform.js
- relationship and event tables in PostgreSQL
- place normalization rules in places.xlsx and placeFixes
- lineage tree functions in the personal tree endpoint
- API routes in Fastify plugins
- geography schema in db/pg-definitions.js

Each milestone document maps to a specific subsystem in the codebase.

---

## 6. Navigation

For a high‑level understanding, read:

- overview.md
- appendix.md

For subsystem details, read the milestone documents in chronological order.

---

## 7. Summary

The docs/ directory contains a complete, dated, and structured record of the biolineage architecture. Milestones capture technical decisions at specific points in time, while the appendix provides permanent project metadata. This overview serves as the entry point for understanding the documentation set.
