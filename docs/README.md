# Proposal for biolineage

Additional information regarding documentation for this project can be found in overview.md

## What is this document?

This proposal describes the unified data model, ingestion pipeline, and normalization strategy used by **biolineage**, the successor to **norm.app**. It consolidates the work performed during the migration from SQLite to PostgreSQL, the redesign of the relationship graph, and the formalization of place, event, and lineage semantics.

The goal of this document is to provide Norm and Charles with:

- a clear explanation of how raw genealogical data is transformed into a structured, queryable, and historically accurate graph
- a rationale for each subsystem (relationships, events, places, gender inference, tree rendering, API integration)
- a record of all normalization decisions, including ambiguous or historically complex cases
- a stable foundation for future ingestion, editing, and expansion of the dataset

This proposal is supported by the following artifacts in `docs/`:

- **places-issues.md** — narrative explanation of locality normalization and all ambiguous cases
- **places.xlsx** — the full dataset of extracted place rows, including type classifications and discussion flags
- **transform.js** — the operational transformation pipeline used during ingestion
- **20260802‑series documents** — detailed subsystem specifications (schema overview, event ingestion, relationship model, etc.)

Together, these documents define the complete data model and processing methodology for biolineage.

---

## Technology Stack

The biolineage platform is intentionally minimal, predictable, and deployable in environments ranging from bare‑metal Linux to Dockerized cloud instances. Each component was chosen for stability, performance, and long‑term maintainability.

---

### Nginx (static file delivery + reverse proxy)

Nginx serves two roles:

1. **Static file delivery**
   It provides fast, zero‑overhead delivery of assets such as the lineage tree visualizations, client‑side scripts, and documentation pages.

2. **Reverse proxy**
   It forwards API requests to the Node.js Fastify server, enabling:
   - TLS termination
   - clean routing
   - separation of static vs dynamic workloads
   - future load‑balancing or multi‑instance deployments

Nginx was chosen because it is stable, widely supported, and ideal for high‑throughput static content.

---

### Node.js (application runtime behind reverse proxy)

Node.js powers the ingestion pipeline, API layer, and lineage computation engine. It was selected because:

- its event‑driven model is ideal for I/O‑heavy workloads (database queries, ingestion streams)
- it integrates cleanly with Fastify
- it allows the entire platform (ingestion, normalization, API) to be written in one language
- it is easy to deploy in Docker or bare‑metal environments

Node.js is the execution environment for all transformation logic, including `transform.js`, relationship inference, and place normalization.

---

### Fastify (HTTP framework)

Fastify is used instead of Express because:

- it is significantly faster
- it has a strict schema‑first philosophy
- it provides built‑in validation, serialization, and plugin isolation
- it integrates cleanly with TypeScript (future direction)
- it is ideal for building predictable APIs for lineage queries

Fastify is the backbone of the API endpoints used by the entity tree renderer, event lookup, and place resolution.

---

### PostgreSQL (primary data store)

PostgreSQL is the authoritative database for biolineage. It was chosen because:

- it supports complex relational queries needed for lineage traversal
- it handles recursive CTEs efficiently (ideal for ancestor/descendant graphs)
- it provides strong typing for places, events, and relationships
- it is stable, widely supported, and ideal for long‑term archival data
- it integrates well with Node.js via `pg`

PostgreSQL replaces SQLite as the primary store, though SQLite remains useful for comparison and validation during ingestion.

---

### Redis (cache and ephemeral store)

Redis is used as the in‑memory cache layer for biolineage. It was chosen because:

- it provides extremely fast key/value access for repeated lineage tree queries
- it reduces PostgreSQL load during ancestor/descendant traversal
- it supports caching of normalized place lookups
- it enables future session storage when OIDC SSO is implemented
- it integrates cleanly with Node.js through lightweight client libraries
- it is stable, widely supported, and ideal for ephemeral or high‑frequency data

Redis does not store authoritative data. It accelerates computation and improves responsiveness across the API.

---

### Docker (deployment target)

Although the current environment runs directly on the host, Docker is the intended deployment target for:

- reproducible installs
- isolated environments
- versioned database containers
- easy migration between servers
- future multi‑instance scaling

The platform is designed so that each component (Nginx, Node.js, PostgreSQL) can be containerized independently.

---

### Other technologies (not emphasized)

Some components are intentionally omitted from the proposal because they are implementation details rather than architectural choices:

- `dotenv` — environment variable loading
- `nodemon` — development auto‑restart
- `sharp` — image processing
- `argon2` — password hashing
- `better-sqlite3` — ingestion comparison

These are part of the implementation but not core architectural decisions.

Here is the **final section** you want for `proposal.md`: a clean, structured set of descriptions for every file in `docs/`. This section belongs at the end of the proposal, after all subsystem explanations, and serves as a reference index for Norm and Charles.

I’ll write it in a way that fits the tone of the proposal packet and aligns with the architecture you’ve already established.

---

## Appendix: Documentation Index

This section provides a description of each file in the `docs/` directory. These documents collectively define the data model, ingestion pipeline, normalization methodology, and API behavior of **biolineage**. They are intended to be read alongside the main proposal to provide deeper technical detail where needed.

---

### 20260802-schema-overview.md

A high‑level description of the PostgreSQL schema used by biolineage.
It explains:

- core tables (entities, events, relationships, places)
- foreign‑key structure
- UUID strategy
- how lineage, events, and places interrelate
- rationale for each table’s shape

This document is the authoritative reference for the database model.

---

### 20260802-sqlite-to-postgresql-tree-comparison.md

A comparison between the original SQLite lineage tree logic and the redesigned PostgreSQL implementation.
It covers:

- differences in recursion strategy
- improvements in ancestor/descendant traversal
- correctness issues found in the SQLite version
- validation tests comparing both outputs

This document demonstrates why PostgreSQL is the correct long‑term home for lineage computation.

---

### 20260802-relationship-model-rationale.md

A detailed explanation of the relationship graph model.
It includes:

- parent/child semantics
- spouse and partner relationships
- inferred relationships
- how ambiguous or conflicting data is resolved
- why the graph-first model is superior to GEDCOM-style hierarchical trees

This document is essential for understanding how biolineage computes lineage.

---

### 20260802-event-ingestion.md

A description of how raw event data (birth, death, burial, marriage, immigration, etc.) is transformed into normalized PostgreSQL event rows.
It explains:

- parsing rules
- event typing
- date normalization
- place linkage
- handling of incomplete or narrative event descriptions

This document defines the ingestion pipeline for all event data.

---

### 20260802-place-normalization.md

The formal specification for place normalization.
It covers:

- how raw BirthCountry/BurialCountry/etc fields are parsed
- how ogName / ogCountry / ogRegion / ogCity are interpreted
- how UUIDs are assigned
- how misspellings, counties, parishes, and historical names are resolved
- how ambiguous cases are flagged for human review

This document is the methodology behind `places-issues.md` and `places.xlsx`.

---

### 20260802-sex-inference.md

A description of the sex inference subsystem.
It explains:

- how sex is inferred from relationships
- how ambiguous cases are handled
- how conflicting data is resolved
- how sex is stored and updated in the database

This document defines the logic used to infer sex when Norm’s dataset does not explicitly provide it.

---

### 20260802-tree-function-design.md

A technical description of the lineage tree rendering functions.
It includes:

- ancestor traversal
- descendant traversal
- cycle detection
- ordering rules
- how the API returns tree structures to the frontend

This document defines the algorithms behind `/entity/:id/entity-tree`.

---

### 20260802-api-integration.md

A description of the API endpoints exposed by biolineage.
It covers:

- request/response formats
- Fastify route structure
- serialization rules
- how the API integrates with the lineage tree renderer
- how the API will integrate with future frontend components

This document is the reference for all external integrations.

---

### places-issues.md

A narrative document describing all ambiguous or problematic place entries extracted from Norm’s dataset.
It contains:

- every row marked `discussion` in `places.xlsx`
- detailed case-by-case analysis
- questions requiring human decision (Norm & Charles)
- historical locality issues
- misspellings, county/city confusion, international transliteration problems

This document is the human review log for place normalization.

---

### places.xlsx

The full dataset of extracted place rows.
It includes:

- raw values from Norm’s BirthCountry/BurialCountry/etc fields
- normalized fields (ogName, ogCountry, ogRegion, ogCity)
- UUIDs
- type classifications (normalized, fixable, discussion, ambiguous)
- links to `places-issues.md` for all discussion rows

This spreadsheet is the authoritative dataset for place normalization.

---

### transform.js

The operational ingestion pipeline.
It contains:

- parsing logic
- normalization rules
- the `placeFixes` array
- UUID resolution
- deterministic output functions
- the glue between raw Norm data and the PostgreSQL schema

This file is the executable implementation of the methodology described in the proposal.

Additional immutable Appendix information can be found in appendix.md
