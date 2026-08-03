# 20260802‑schema‑overview.md

## PostgreSQL Schema Overview for **biolineage**

This document provides a high‑level description of the PostgreSQL schema used by **biolineage**, including the core tables, foreign‑key structure, UUID strategy, and the rationale behind each component. It is the authoritative reference for how lineage, events, relationships, and places interrelate within the system.

---

## 1. Guiding Principles of the Schema

The schema is designed around several core principles:

- **Graph‑first lineage modeling** — relationships are edges, entities are nodes.
- **Event‑centric historical modeling** — births, deaths, burials, marriages, migrations, etc. are first‑class entities.
- **Normalized place representation** — every locality is a structured, deduplicated, UUID‑identified row.
- **Deterministic ingestion** — raw data from Norm’s dataset is transformed into stable, predictable rows.
- **Historical accuracy** — counties, parishes, towns, and historical names are preserved when meaningful.
- **Future extensibility** — species, clades, and sovereign entities can be added without schema changes.

These principles shape every table described below.

---

## 2. Core Tables

The schema consists of four foundational tables:

- **entities**
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

## 4. entities Table

The **entities** table represents individuals in the lineage graph.

**Fields include:**

- `uuid` — primary key
- `given_name`
- `family_name`
- `gender` — inferred or explicit
- `notes` — narrative text
- `created_at` / `updated_at`

**Rationale:**

The entities table is intentionally minimal. All temporal and spatial information is stored in **events**, and all relational information is stored in **relationships**. This keeps the entity clean and avoids duplication.

Perfect — now that all the incorrect *person/people* usages are fixed, what you need is a **clear, authoritative section** in the docs that explains *why Biolineage uses “entity” instead of Norm’s original “person” table*. This section should justify the terminology shift, anchor it in real domain needs, and prevent future confusion for contributors.

Below is a fully‑formed documentation section you can drop directly into your `.md` files. It’s structured, semantically precise, and grounded in the actual architectural motivations you described.

---

### Entity Model Rationale

Biolineage models **entities** rather than “persons,” diverging intentionally from the original `person` table in Norm’s early schema. This change reflects the broader scope of lineage modeling and corrects several semantic and architectural limitations inherent in human‑only terminology.

#### Why “entity” is the correct abstraction

- **Semantic neutrality** — “Person” implies a biological human. Biolineage needs a term that applies equally to humans, animals, organizations, artifacts, and other lineage‑bearing nodes. “Entity” is the only term that scales cleanly across domains.

- **Multi‑species support** — Modern lineage systems must handle horses, dogs, livestock, lab organisms, and historical non‑human subjects. The original “person” table cannot represent these without semantic distortion. “Entity” avoids anthropocentric bias.

- **Instigator model alignment** — Biolineage’s ingestion pipeline treats the source record (GEDCOM individual, horse registry entry, manuscript provenance record, etc.) as the *instigator* of an entity. Using “entity” keeps the conceptual boundary clean: the instigator is the record; the entity is the graph node created from it.

- **Better ontology for lineage graphs** — Lineage graphs often include non‑person nodes: farms, stables, breeding programs, labs, estates, and events. “Entity” allows these to coexist naturally without special‑case tables.

- **Future‑proofing** — As Biolineage expands into historical sovereignty, manuscript lineage, or biological sample tracking, “entity” remains valid. “Person” would require repeated schema migrations or awkward renaming.

### Relationship to Norm’s original `person` table

Norm’s early schema used a `person` table because the initial scope was human genealogy. Once horse records and other non‑human datasets were introduced, the limitations became obvious:

- Horse registries treat animals as first‑class lineage subjects.
- Breed associations track ancestry exactly like human genealogical systems.
- Many datasets mix humans and non‑humans (e.g., breeder → horse → offspring).

Rather than creating parallel tables (`person`, `horse`, `animal`, etc.), Biolineage unifies them under **entity**, with type metadata determining the specific category.

#### Practical consequences for contributors

- When referring to the **graph node**, always use **entity**.
- When referring to a **biological human**, use **person**.
- When referring to a **GEDCOM record**, use **individual**.
- When referring to **source provenance**, use **instigator**.
- When referring to **relationship roles**, use **subject/object** or domain‑specific terms (parent, child, sire, dam).

This keeps the documentation consistent, avoids anthropocentric assumptions, and ensures the model remains extensible.

---

## 5. events Table

Events represent historical occurrences tied to entities.

**Fields include:**

- `uuid` — primary key
- `entity_uuid` — FK → entities
- `event_type` — birth, death, burial, marriage, immigration, etc.
- `date` — normalized date or partial date
- `place_uuid` — FK → places
- `description` — narrative text
- `source` — optional provenance

**Rationale:**

Events allow biolineage to model history in a structured way.
Birth, death, and burial are not attributes of an entity — they are **events**.
This enables:

- multiple events per entity
- partial dates
- ambiguous or narrative descriptions
- future event types (military service, census, migration, etc.)

---

## 6. relationships Table

Relationships define edges in the lineage graph.

**Fields include:**

- `uuid` — primary key
- `entity_a_uuid` — FK → entities
- `entity_b_uuid` — FK → entities
- `relationship_type` — parent, child, spouse, partner, sibling, etc.
- `inferred` — boolean
- `notes` — optional narrative

**Rationale:**

The relationship model is **graph‑first**.
Every relationship is directional and explicit.
Parent/child relationships are stored as edges, not embedded in the entity record.

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

- **events → entities**
- **events → places**
- **relationships → entities (twice)**
- **places → none** (places are standalone)

This structure ensures:

- entities are the root nodes
- events attach temporal/spatial meaning
- relationships attach graph edges
- places attach locality meaning
- no circular dependencies
- clean deletion rules (events and relationships cascade)

---

## 9. How the Tables Interrelate**

The schema forms a three‑layer model:

### Layer 1: Entities

The nodes of the lineage graph.

### Layer 2: Events

Historical occurrences tied to entities.

### Layer 3: Relationships

Edges connecting entities.

### Layer 4: Places

Normalized localities referenced by events.

This creates a unified model:

- entities → events → places
- entities → relationships → entities

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
