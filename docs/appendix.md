# appendix.md

Project Appendix for biolineage

This appendix contains project‑level information not covered in the technical documents. It includes ownership, attribution, copyright assignment, AI involvement, geographical data sources, the tandem geography project, static site information, and long‑term hosting commitments.

---

## 1. Project Ownership and Attribution

biolineage is a saiSquared project.
All copyright for the codebase, documentation, and associated assets is assigned to saiSquared.

Credit for the creation, design, and development of the project is shared among:

- Norman Eaddy
- Charles Carroll
- Chris Rowley

These individuals contributed the historical data, design direction, engineering work, and architectural decisions that form the foundation of the project.

---

## 2. AI Involvement in Development

biolineage is not a vibe‑coded product.
While portions of the codebase and documentation were AI‑generated, all generated material was:

- reviewed
- tested
- corrected
- iterated upon
- integrated intentionally into the architecture

Microsoft Copilot acted as a team member during development, providing architectural reasoning, code generation, normalization logic, and documentation support. All final implementation decisions were made by the human developers listed above.

---

## 3. Geographical Data Sources

The project uses geographical data from many sources, including:

- historical atlases
- ISO‑3166 datasets
- TLD registries
- county and parish records
- cemetery and locality databases
- sovereign entity reference materials
- historical maps
- manually curated corrections
- narrative descriptions from Norm’s dataset

This geographical dataset is incomplete and will continue to evolve. Many localities require human review, and ambiguous cases are documented in places-issues.md.

---

## 4. Tandem Geography Project

A tandem project named geography is responsible for maintaining structured geopolitical data. This project defines sovereign entities, subdivisions, administrative divisions, and municipalities. These tables provide the authoritative reference for countries, states, provinces, counties, parishes, and cities.

The PostgreSQL schema for the geography project includes the following tables:

### sovereign_entities

```sql
sovereign_entities: {
  id: UUID,
  name: TEXT,
  long_name: TEXT,
  type: TEXT,
  iso31661: JSONB,
  has_flag: BOOLEAN,
  flag_file: TEXT,
  has_armorial: BOOLEAN,
  armorial_type: TEXT,
  armorial_file: TEXT,
  tlds: JSONB
}
```

### subdivisions

```sql
subdivisions: {
  id: UUID,
  sovereign_entity_id: UUID,
  name: TEXT,
  type: TEXT,
  iso31662: JSONB,
  has_flag: BOOLEAN,
  flag_file: TEXT,
  has_armorial: BOOLEAN,
  armorial_type: TEXT,
  armorial_file: TEXT
}
```

### administrative_divisions

```sql
administrative_divisions: {
  id: UUID,
  sovereign_entity_id: UUID,
  subdivision_id: UUID,
  name: TEXT,
  long_name: TEXT,
  type: TEXT,
  fips: INTEGER,
  latitude: DOUBLE PRECISION,
  longitude: DOUBLE PRECISION,
  iso31662: JSONB,
  meta: JSONB,
  has_flag: BOOLEAN,
  flag_file: TEXT,
  has_armorial: BOOLEAN,
  armorial_type: TEXT,
  armorial_file: TEXT
}
```

### municipalities

```sql
municipalities: {
  id: UUID,
  sovereign_entity_id: UUID,
  subdivision_id: UUID,
  administrative_division_id: UUID,
  name: TEXT,
  long_name: TEXT,
  type: TEXT,
  latitude: DOUBLE PRECISION,
  longitude: DOUBLE PRECISION,
  meta: JSONB,
  has_flag: BOOLEAN,
  flag_file: TEXT,
  has_armorial: BOOLEAN,
  armorial_type: TEXT,
  armorial_file: TEXT
}
```

These tables support:

- ISO‑3166‑1 and ISO‑3166‑2 codes
- historical and modern sovereign entities
- flags and armorial bearings
- TLDs
- FIPS codes
- latitude/longitude coordinates
- metadata for future expansion

The geography project is designed to be a long‑term, authoritative reference for all geopolitical data used by biolineage.

---

## 5. Static Site Files

The sites/ folder contains static files served directly by nginx.
These files include:

- static HTML
- CSS
- JavaScript bundles
- images
- assets for the frontend

The backend does not process or transform files in sites/. nginx serves them as-is.

---

## 6. Long‑Term Hosting Commitment

An instance of biolineage will be hosted and paid for by saiSquared in perpetuity for Norman Eaddy and his descendants. This commitment ensures that the lineage data, historical records, and associated research remain accessible to future generations of the Eaddy family.

The hosted instance will:

- run the same codebase as the public version
- receive updates and improvements
- preserve all historical data ingested into the system
- remain available without subscription or usage fees

This long‑term hosting guarantee is a core part of the project’s mission.

---

## 7. Summary

This appendix provides project‑level information that supplements the technical documentation. It defines ownership, attribution, AI involvement, geographical data sources, the tandem geography project, static site information, and the long‑term hosting commitment. These details complete the documentation set for biolineage.
