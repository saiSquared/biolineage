# 20260802-place-normalization.md

Place Normalization Methodology for biolineage

This document describes the formal methodology used to normalize place data in biolineage. It explains how raw BirthCountry/BurialCountry/etc fields are parsed, how ogName / ogCountry / ogRegion / ogCity are interpreted, how UUIDs are assigned, how misspellings and historical locality names are resolved, and how ambiguous cases are flagged for human review. This specification defines the logic behind places.xlsx, places-issues.md, and the ingestion pipeline implemented in transform.js.

---

## 1. Overview

Place normalization is one of the most complex components of the biolineage ingestion pipeline. Norm’s dataset contains thousands of locality references in inconsistent formats, including:

- misspellings
- partial locality names
- counties treated as cities
- parishes treated as regions
- historical names
- narrative-only descriptions
- ambiguous or conflicting entries
- multiple variants of the same locality

The goal of place normalization is to convert these raw fields into structured, deduplicated, UUID-identified place rows in PostgreSQL.

---

## 2. Raw Place Fields

Norm’s dataset provides locality information through several structured fields:

- BirthCountry, BirthRegion, BirthCity
- DeathCountry, DeathRegion, DeathCity
- BurialCountry, BurialRegion, BurialCity

These fields may contain:

- country codes
- state or province abbreviations
- county names
- city names
- narrative text
- misspellings
- historical locality names
- placeholders such as “?”, “unknown”, “tbd”

The ingestion pipeline extracts these fields and converts them into normalized place rows.

---

## 3. Parsing Raw Fields into ogName / ogCountry / ogRegion / ogCity

Each raw locality field is parsed into four canonical components:

- ogName
- ogCountry
- ogRegion
- ogCity

These represent the original values exactly as they appear in the dataset, without correction. Examples:

Raw: “Sumter Cemetary, SC, USA”
Parsed:

- ogName: Sumter Cemetary
- ogCountry: us
- ogRegion: SC
- ogCity: Sumter

Raw: “Leinfelden Stutgart, BW, Germany”
Parsed:

- ogName: null
- ogCountry: de
- ogRegion: BW
- ogCity: Leinfelden Stutgart

Raw: “?”
Parsed:

- ogName: ?
- ogCountry: null
- ogRegion: null
- ogCity: null

These parsed fields form the basis for normalization.

---

## 4. UUID Assignment

Every normalized place is assigned a UUID. UUIDs are deterministic and stored in places.xlsx. The ingestion pipeline uses the following rules:

1. If a placeFixes rule matches the raw fields, the UUID from the rule is used.
2. If a place already exists in places.xlsx, its UUID is reused.
3. If a new place is created, a new UUID is generated and added to places.xlsx.

This ensures stable linkage between events and places across multiple ingestion runs.

---

## 5. Normalization Rules

Normalization converts ogName / ogCountry / ogRegion / ogCity into structured place rows. The rules include:

### 5.1 Country normalization

Countries are normalized to ISO-3166-1 alpha-2 codes. Examples:

- USA → us
- United States → us
- Germany → de
- England → gb

Unknown or ambiguous countries remain null.

### 5.2 Region normalization

Regions may represent:

- states
- provinces
- counties
- parishes
- historical districts

Region normalization preserves historically meaningful names. Examples:

- SC → South Carolina
- BW → Baden-Württemberg
- Christ Church Parish → preserved as region
- Darlington District → preserved as historical region

### 5.3 City normalization

Cities may represent:

- towns
- hamlets
- communities
- villages
- neighborhoods
- districts

City normalization corrects misspellings when unambiguous. Examples:

- Gainsville → Gainesville
- Silver Sprinig → Silver Spring
- Jonhsonville → Johnsonville

Ambiguous city names are flagged for review.

### 5.4 Name normalization

ogName may represent:

- cemetery names
- hospital names
- churches
- farms
- estates
- narrative text
- partial locality names

Name normalization corrects misspellings when unambiguous. Examples:

- Cemetary → Cemetery
- Ole Johnsonville Cemetery → Old Johnsonville Cemetery

Narrative-only names are preserved but marked as type = discussion.

---

## 6. Misspellings, Variants, and Historical Names

The normalization pipeline handles:

- spelling variants
- historical locality names
- county vs city confusion
- parish vs region confusion
- multiple variants of the same cemetery
- multiple variants of the same town
- international transliteration issues

Examples:

- Escambria → Escambia
- Musberg Stuttgart → Musberg (district of Leinfelden-Echterdingen)
- Poyngyang → Pyongyang
- Hamung → Hamhung

Historical names are preserved when meaningful. Examples:

- Dorsetshire → Dorset
- Darlington District → preserved as historical region

---

## 7. Ambiguous Cases and Human Review

Some localities cannot be normalized automatically. These are flagged as type = discussion in places.xlsx and described in detail in places-issues.md.

Examples include:

- New York vs Orange (New York)
- Texas vs Corsicana (Texas)
- Leinfelden Stuttgart vs Musberg Stuttgart
- Hamung vs Hamongji vs Jungpyongkun
- Silver Valley (multiple states)
- Escambia vs Escambria
- Orangetown vs Tappan
- Anderson County Hospital vs Anderson County Cemetery

Ambiguous cases require human decision from Norm and Charles.

---

## 8. Place Types

Each normalized place is assigned a type. Examples:

- city
- county
- parish
- region
- cemetery
- hospital
- discussion
- ambiguous

Type classification is stored in places.xlsx and used during ingestion and event linkage.

---

## 9. Normalization Pipeline Flow

The normalization pipeline follows this sequence:

1. Extract raw locality fields
2. Parse into ogName / ogCountry / ogRegion / ogCity
3. Apply placeFixes rules
4. Normalize country, region, city, and name
5. Assign UUID
6. Classify type
7. Insert or update places.xlsx
8. Flag ambiguous cases for human review
9. Document issues in places-issues.md

This deterministic flow ensures stable output across ingestion runs.

---

## 10. Summary

The place normalization methodology in biolineage is designed to be:

- deterministic
- structured
- historically accurate
- narrative-preserving
- ambiguity-aware
- extensible
- consistent across ingestion runs

places.xlsx contains the authoritative dataset of normalized places.
places-issues.md contains the human review log for ambiguous cases.
transform.js contains the operational implementation of this methodology.
