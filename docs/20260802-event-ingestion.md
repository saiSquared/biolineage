# 20260802-event-ingestion.md

Event Ingestion Pipeline for biolineage

This document describes how raw event data (birth, death, immigration, and narrative historical events) is transformed into normalized PostgreSQL event rows. It explains the parsing rules, event typing, date normalization, place linkage, and handling of incomplete or narrative event descriptions. The event ingestion pipeline is a core part of the biolineage data model and ensures that historical information is represented consistently and accurately.

---

## 1. Overview

Events are first-class entities in biolineage. Instead of storing birth or death information directly on the person record, each occurrence is represented as an event row linked to the person and to a normalized place. This event-centric model allows the system to represent:

- multiple events per person
- partial or ambiguous dates
- narrative descriptions
- historical locality variations
- inferred relationships
- future event types without schema changes

Burial and marriage information are handled differently:

- Norm’s dataset contains **burial places** but **no burial dates**, so burial events are not created.
- Norm’s dataset contains **no marriage dates or marriage locality fields**, so marriage events are not created.
- Marriage is represented solely through relationship edges.

---

## 2. Raw Event Fields

Norm’s dataset provides structured event information for:

- BirthCountry, BirthRegion, BirthCity
- DeathCountry, DeathRegion, DeathCity
- DeathDate
- BirthDate

It also provides:

- BurialCountry, BurialRegion, BurialCity (place only, no date)
- Narrative text fields
- Partial or ambiguous dates
- Historical locality names
- Misspellings or variants

There are **no marriage fields** and **no burial dates**.

---

## 3. Event Typing

Each event is assigned an event_type. The core types include:

- birth
- death
- immigration (only when detected in narrative text)
- miscellaneous (for narrative-only events)

Marriage and burial are intentionally excluded because the dataset does not contain dates for either.

Event typing is deterministic. For example:

- BirthCountry → birth
- DeathCountry → death

Narrative fields may produce additional event types when recognizable patterns are present.

---

## 4. Parsing Rules

The ingestion pipeline applies a series of parsing rules to convert raw fields into structured event rows.

### 4.1 Field extraction

Birth event:

- BirthCountry
- BirthRegion
- BirthCity
- BirthDate
- BirthNotes

Death event:

- DeathCountry
- DeathRegion
- DeathCity
- DeathDate
- DeathNotes

Burial fields are extracted for place normalization but do not produce an event.

Marriage fields do not exist in the dataset.

### 4.2 Null and placeholder handling

Common placeholder values include:

- unknown
- ?
- tbd
- narrative-only text
- empty strings

These are converted to null or moved into the description field.

### 4.3 Narrative extraction

Narrative fields are preserved in the description column. Examples:

- “Died young”
- “Some say born 1732”
- “Age 57.5 hours”

Narrative text is never discarded.

---

## 5. Date Normalization

Dates in Norm’s dataset appear in many formats:

- YYYY-MM-DD
- MM/DD/YYYY
- Month YYYY
- YYYY
- “circa 1819”
- “before 1900”
- “after 1750”
- “unknown”

The ingestion pipeline normalizes dates into one of three forms:

1. Full date
2. Partial date (year only or month/year)
3. Null date with narrative preserved

Examples:

Raw: “9/30/1819” → Normalized: 1819-09-30
Raw: “1732?” → Normalized: 1732 with uncertainty noted in description
Raw: “circa 1819” → Normalized: null date, description preserved

Date normalization ensures consistent sorting and traversal.

---

## 6. Place Linkage

Every event is linked to a normalized place row via place_uuid.

Place normalization is handled by:

- places.xlsx
- places-issues.md
- transform.js
- the placeFixes array
- deterministic UUID assignment

The ingestion pipeline converts raw locality fields into:

- ogName
- ogCountry
- ogRegion
- ogCity

These are then resolved to a place_uuid.

Burial places follow the same normalization pipeline, but do not produce event rows.

---

## 7. Handling Incomplete or Narrative Event Descriptions

Many events contain incomplete or narrative-only information. Examples:

- “Died young”
- “Some say died 9/30/1819”
- “Age 57.5 hours”
- “Some say born 1732”

The ingestion pipeline handles these cases by:

1. Preserving narrative text in description
2. Linking to a normalized place when possible
3. Creating a miscellaneous event when no type can be inferred
4. Avoiding incorrect assumptions about event type or locality

Narrative text is always preserved because it may contain historically meaningful information.

---

## 8. Event Table Structure

The events table contains:

- uuid
- person_uuid
- event_type
- date
- place_uuid
- description
- source

This minimal structure allows:

- multiple events per person
- partial or null dates
- narrative descriptions
- linkage to normalized places
- future event types without schema changes

Burial locality is stored in the places table and linked to the person through context, not through an event row.

Marriage is represented through relationship edges, not through events.

---

## 9. Ingestion Pipeline Flow

The ingestion pipeline follows this sequence:

1. Extract raw fields
2. Determine event type
3. Normalize date
4. Normalize place
5. Assign UUID
6. Construct event row
7. Insert into PostgreSQL
8. Log ambiguous cases for review

Burial locality is normalized but does not produce an event row.
Marriage relationships are handled by the relationship ingestion pipeline, not the event pipeline.

---

## 10. Summary

The event ingestion pipeline in biolineage is designed to be:

- deterministic
- structured
- narrative-preserving
- place-aware
- historically accurate
- flexible
- extensible

Events are the backbone of historical modeling in the platform. Burial and marriage information are preserved through place normalization and relationship edges, respectively, but do not produce event rows due to the absence of structured date fields.
