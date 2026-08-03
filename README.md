# biolineage

A graph‑first genealogy and lineage platform

biolineage.app is a genealogy system built around a graph‑first data model. It ingests historical person records, normalizes places, constructs relationship graphs, and exposes lineage trees through a clean API. The project is developed by saiSquared for Norman Eaddy and his descendants, with contributions from Norman Eaddy, Charles Carroll, and Chris Rowley.

The system is designed for long‑term preservation of historical data, accurate lineage computation, and future expansion into geographical and sovereign‑entity modeling.

---

## 1. Project Goals

biolineage.app is built to:

- preserve historical family data
- compute accurate ancestor and descendant trees
- normalize inconsistent locality information
- provide a stable API for external integrations
- support future frontend components
- maintain a permanent hosted instance for the Eaddy family

The project emphasizes correctness, determinism, and clarity over convenience or vibe‑coding.

### Future Work

Proposals for upcoming architectural changes can be found in the proposals/ directory.

---

## 2. Core Features

### Graph‑first lineage model

Persons are nodes.
Relationships are edges.
This model supports:

- multiple parents
- blended families
- ambiguous historical data
- inferred relationships
- cycle detection
- deep ancestor and descendant traversal

### Event ingestion

The ingestion pipeline converts raw birth, death, and narrative event data into normalized PostgreSQL rows. Dates are normalized, places are linked, and narrative text is preserved.

### Place normalization

Localities are parsed, corrected, deduplicated, and assigned deterministic UUIDs. Ambiguous cases are documented for human review. The normalized dataset is maintained in places.xlsx.

### Lineage tree rendering

The `/person/:id/personal-tree` endpoint computes:

- ancestors
- descendants
- siblings
- spouses
- generation depth
- cycle‑safe traversal

The backend returns structured JSON; the frontend handles rendering.

### API integration

Fastify routes expose persons, events, relationships, places, and lineage trees. All responses are deterministic, stable, and JSON‑based.

---

## 3. Documentation

All technical documentation is stored in the `docs/` directory.

Milestone documents use date prefixes:

- 20260802-relationship-model-rationale.md
- 20260802-event-ingestion.md
- 20260802-place-normalization.md
- 20260802-sex-inference.md
- 20260802-tree-function-design.md
- 20260802-api-integration.md

These documents describe the architecture, ingestion logic, normalization rules, and API behavior.

Additional immutable Appendix information can be found in appendix.md.

---

## 4. Geography Tandem Project

biolineage.app integrates with a parallel project named geography.
This project maintains structured geopolitical data, including:

- sovereign entities
- subdivisions
- administrative divisions
- municipalities

These tables support ISO‑3166 codes, flags, armorial bearings, TLDs, FIPS codes, coordinates, and metadata. They provide the authoritative reference for all locality information used by biolineage.app.

---

## 5. Hosting Commitment

saiSquared will host and maintain an instance of biolineage.app in perpetuity for Norman Eaddy and his descendants. This ensures long‑term access to lineage data and historical records without subscription fees or service interruption.

---

## 6. Static Site Files

The `sites/` directory contains static files served directly by nginx.
These include HTML, CSS, JavaScript bundles, and frontend assets.
The backend does not modify or transform these files.

---

## 7. AI Involvement

Microsoft Copilot participated as a development team member.
Some code and documentation were AI‑generated, but all material was:

- reviewed
- tested
- corrected
- integrated intentionally

The project is not vibe‑coded; it is engineered.

---

## 8. License and Ownership

biolineage.app is a saiSquared project.
All copyright is assigned to saiSquared.
Credit is shared among Norman Eaddy, Charles Carroll, and Chris Rowley.

The project is licensed under the MIT License.
