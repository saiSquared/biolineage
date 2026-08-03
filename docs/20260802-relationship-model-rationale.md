# 20260802-relationship-model-rationale.md

Relationship Model Rationale for biolineage

This document explains the rationale behind the relationship graph model used by biolineage. It describes how parent/child semantics are represented, how spouse and partner relationships are modeled, how inferred relationships are generated, how ambiguous or conflicting data is resolved, and why a graph-first model is superior to GEDCOM-style hierarchical trees.

The relationship model is one of the core architectural foundations of biolineage and directly informs lineage traversal, gender inference, event aggregation, and tree rendering.

---

## 1. Overview

The relationship model in biolineage is designed around a simple principle:

Persons are nodes.
Relationships are edges.

This graph-first approach allows the system to represent complex family structures, blended families, inferred parentage, historical ambiguity, and multi-generational lineage without the constraints of hierarchical tree formats such as GEDCOM.

The model supports:

- explicit parent/child edges
- spouse and partner edges
- inferred edges derived from events
- ambiguous or conflicting parentage
- cycle detection
- multi-parent families
- future expansion to species, clades, and sovereign entities

---

## 2. Parent/Child Semantics

Parent/child relationships form the backbone of the lineage graph. Each relationship is represented as a directional edge:

- parent → child
- child → parent

The relationship_type field stores the semantic meaning of the edge. Parent/child edges are always explicit and directional, allowing:

- ancestor traversal
- descendant traversal
- generation-level ordering
- cycle detection
- gender inference
- event linkage (birth, baptism, adoption)

Parent/child edges are never inferred from spouse relationships or sibling relationships. They must originate from:

- explicit data in Norm’s dataset
- inferred parentage from birth events
- manual correction during ingestion
- future editorial input

---

## 3. Spouse and Partner Relationships

Spouse and partner relationships are modeled as undirected edges represented by two directional rows:

- A → B (spouse)
- B → A (spouse)

This ensures:

- symmetric traversal
- correct rendering in personal trees
- ability to detect blended families
- ability to infer shared parentage
- correct handling of multiple marriages or partnerships

Spouse edges are never treated as ancestor or descendant edges. They exist solely to represent marital or partnership connections.

Partner relationships (non-marital) use the same structure but a different relationship_type.

---

## 4. Inferred Relationships

Inferred relationships are generated when event data strongly implies a parent/child connection. Examples include:

- a birth event with a listed mother or father
- a baptism event with godparents or guardians
- a burial event referencing next-of-kin
- a marriage event referencing parents of the bride or groom

Inferred edges are marked with inferred = true.

This allows the system to:

- include parentage even when Norm’s dataset lacks explicit relationship rows
- maintain correctness in lineage traversal
- support gender inference
- fill gaps in historical data

Inferred edges never override explicit edges. They supplement them.

---

## 5. Ambiguous or Conflicting Data

Historical datasets often contain ambiguity:

- multiple possible fathers
- conflicting birth records
- missing mothers
- blended families
- adoption vs biological parentage
- step-parents
- guardians
- narrative-only descriptions

The relationship model resolves ambiguity using deterministic rules:

1. Explicit parentage always wins.
2. Inferred parentage is included only when unambiguous.
3. Conflicting inferred parents are flagged for review.
4. Multiple parents are allowed.
5. Cycles are detected and prevented.
6. Narrative-only relationships are stored as notes.
7. Ambiguous edges are stored but marked ambiguous = true (future extension).

This ensures the lineage graph remains correct, complete, and stable.

---

## 6. Why Graph-First Is Superior to GEDCOM Hierarchies

GEDCOM represents families as hierarchical trees:

- one family unit
- two parents
- multiple children
- rigid structure
- limited support for blended families
- limited support for historical ambiguity
- no inferred relationships
- no multi-parent families
- no cycle detection
- no graph traversal semantics

The graph-first model used by biolineage solves all of these limitations.

### Advantages of the graph model

- supports any number of parents
- supports blended families
- supports historical ambiguity
- supports inferred relationships
- supports cycle detection
- supports deep recursion
- supports species/clade lineage
- supports sovereign entity lineage
- supports event-driven parentage inference
- supports future editorial corrections
- supports multi-generational traversal without structural constraints

The graph model is the correct representation for real-world lineage data.

---

## 7. Relationship Table Structure

The relationships table contains:

- uuid
- person_a_uuid
- person_b_uuid
- relationship_type
- inferred
- notes

This minimal structure allows:

- directional edges
- symmetric spouse edges
- multi-parent families
- inferred edges
- ambiguous edges
- future expansion
- clean traversal logic
- deterministic ingestion

The simplicity of the table is intentional. All complexity lives in traversal logic, not in the schema.

---

## 8. How the Relationship Model Supports Lineage Computation

The graph model enables:

- ancestor traversal
- descendant traversal
- cycle detection
- generation-level ordering
- gender inference
- event aggregation
- tree rendering
- place-linked event traversal
- future clade/species lineage modeling

The personal tree endpoint relies entirely on this model.

---

## 9. Summary

The relationship model in biolineage is designed to be:

- simple
- expressive
- correct
- extensible
- historically accurate
- graph-first
- event-aware
- ambiguity-tolerant

It is superior to hierarchical formats and is the foundation of all lineage computation in the platform.
