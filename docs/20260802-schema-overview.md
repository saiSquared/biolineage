# 20260802‑schema‑overview.md

## PostgreSQL Schema Overview for **biolineage**

This document provides a high‑level description of the PostgreSQL schema used by **biolineage**, including the core tables, foreign‑key structure, UUID strategy, and the rationale behind each component. It is the authoritative reference for how lineage, events, relationships, and places interrelate within the system.

---

## 1. Guiding Principles of the Schema

The schema is designed around several core principles:

- **Graph‑first lineage modeling** — relationships are edges, persons are nodes.
- **Event‑centric historical modeling** — births, deaths, burials, marriages, migrations, etc. are first‑class entities.
- **Normalized place representation** — every locality is a structured, deduplicated, UUID‑identified row.
- **Deterministic ingestion** — raw data from Norm’s dataset is transformed into stable, predictable rows.
- **Historical accuracy** — counties, parishes, towns, and historical names are preserved when meaningful.
- **Future extensibility** — species, clades, and sovereign entities can be added without schema changes.

These principles shape every table described below.

---

## 2. Core Tables

The schema consists of four foundational tables:

- **persons**
- **events**
- **relationships**
- **places**

Each table is designed to be minimal, strongly typed, and linked through UUIDs.

---

## 3. UUID Strategy

All primary keys in biolineage are **UUIDv4**.
This ensures:

- global uniqueness
- safe merging of external datasets
- deterministic ingestion (UUIDs assigned before insertion)
- no reliance on sequential IDs
- compatibility with distributed or Dockerized deployments

UUIDs are generated during ingestion and stored in the transformation pipeline (`transform.js`).

---

## 4. persons Table

The **persons** table represents individuals in the lineage graph.

**Fields include:**

- `uuid` — primary key
- `given_name`
- `family_name`
- `gender` — inferred or explicit
- `notes` — narrative text
- `created_at` / `updated_at`

**Rationale:**

The persons table is intentionally minimal. All temporal and spatial information is stored in **events**, and all relational information is stored in **relationships**. This keeps the person entity clean and avoids duplication.

---

## 5. events Table

Events represent historical occurrences tied to persons.

**Fields include:**

- `uuid` — primary key
- `person_uuid` — FK → persons
- `event_type` — birth, death, burial, marriage, immigration, etc.
- `date` — normalized date or partial date
- `place_uuid` — FK → places
- `description` — narrative text
- `source` — optional provenance

**Rationale:**

Events allow biolineage to model history in a structured way.
Birth, death, and burial are not attributes of a person — they are **events**.
This enables:

- multiple events per person
- partial dates
- ambiguous or narrative descriptions
- future event types (military service, census, migration, etc.)

---

## 6. relationships Table

Relationships define edges in the lineage graph.

**Fields include:**

- `uuid` — primary key
- `person_a_uuid` — FK → persons
- `person_b_uuid` — FK → persons
- `relationship_type` — parent, child, spouse, partner, sibling, etc.
- `inferred` — boolean
- `notes` — optional narrative

**Rationale:**

The relationship model is **graph‑first**.
Every relationship is directional and explicit.
Parent/child relationships are stored as edges, not embedded in the person record.

This enables:

- recursive ancestor/descendant traversal
- cycle detection
- multi‑parent or blended families
- inferred relationships from event data
- future expansion to species/clade lineage

---

## 7. places Table

Places represent normalized localities.

**Fields include:**

- `uuid` — primary key
- `name` — canonical name
- `country` — ISO‑3166‑1 alpha‑2
- `region` — state/province/county/parish
- `city` — town/hamlet/locality
- `type` — city, county, parish, cemetery, hospital, region, discussion, etc.
- `notes` — narrative or historical context

**Rationale:**

Place normalization is one of the most complex parts of the ingestion pipeline.
Raw fields from Norm’s dataset (BirthCountry, BurialCountry, etc.) are parsed into:

- `ogName`
- `ogCountry`
- `ogRegion`
- `ogCity`

These are then normalized into structured place rows using:

- `places.xlsx` (dataset)
- `places-issues.md` (discussion cases)
- `transform.js` (operational logic)

Every place is assigned a UUID, ensuring deterministic linkage from events.

---

## 8. Foreign‑Key Structure

The schema uses a simple, predictable FK structure:

- **events → persons**
- **events → places**
- **relationships → persons (twice)**
- **places → none** (places are standalone)

This structure ensures:

- persons are the root nodes
- events attach temporal/spatial meaning
- relationships attach graph edges
- places attach locality meaning
- no circular dependencies
- clean deletion rules (events and relationships cascade)

---

## 9. How the Tables Interrelate**

The schema forms a three‑layer model:

### Layer 1: Persons

The nodes of the lineage graph.

### Layer 2: Events

Historical occurrences tied to persons.

### Layer 3: Relationships

Edges connecting persons.

### Layer 4: Places

Normalized localities referenced by events.

This creates a unified model:

- persons → events → places
- persons → relationships → persons

Everything else (tree rendering, gender inference, normalization) builds on this foundation.

---

## 10. Rationale for the Schema Shape

The schema is intentionally:

- **normalized** — no duplication of place or event data
- **graph‑oriented** — relationships are edges
- **event‑centric** — history is modeled as events
- **place‑aware** — localities are structured and deduplicated
- **extensible** — species, clades, and sovereign entities can be added without redesign
- **deterministic** — ingestion produces stable UUIDs and consistent rows
- **historically accurate** — counties, parishes, and historic names are preserved

This design supports both modern genealogy and historical lineage modeling.
