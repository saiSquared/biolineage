# 20260802‑sqlite-to-postgresql-tree-comparison.md

## Comparison of Lineage Tree Computation: SQLite vs PostgreSQL

This document compares the original lineage tree logic implemented in SQLite with the redesigned PostgreSQL implementation used by **biolineage**. It explains the differences in recursion strategy, improvements in ancestor/descendant traversal, correctness issues discovered in the SQLite version, and the validation tests used to confirm the correctness of the PostgreSQL model.

This comparison demonstrates why PostgreSQL is the correct long‑term home for lineage computation.

---

## 1. Background

The original norm.app lineage tree was computed using SQLite recursive queries. While functional for small datasets, SQLite’s recursion model revealed several limitations when applied to a large, multi‑generational dataset with inferred relationships, ambiguous parentage, and historical inconsistencies.

The PostgreSQL redesign addresses these limitations by providing:

- deeper recursion
- cycle detection
- stable ordering
- correct ancestor/descendant traversal
- predictable performance
- a graph‑first relationship model

This document outlines the differences.

---

## 2. Differences in Recursion Strategy

### SQLite Recursion Model

SQLite supports recursive CTEs, but with constraints:

- recursion depth is limited by default
- cycle detection must be implemented manually
- ordering inside recursive queries is unstable
- performance degrades significantly with large graphs
- recursive queries cannot easily incorporate multiple relationship types

The original implementation relied on:

- a single recursive CTE
- manual parent/child traversal
- no cycle detection
- no inferred relationship support

This worked for simple trees but broke down with complex family structures.

---

### PostgreSQL Recursion Model

PostgreSQL provides a more robust recursive CTE engine:

- deeper recursion without performance collapse
- stable ordering within recursive layers
- ability to join multiple tables inside recursion
- better cycle detection patterns
- support for multi‑edge graph traversal
- predictable performance even with thousands of nodes

The redesigned lineage tree uses:

- recursive CTEs for ancestor traversal
- recursive CTEs for descendant traversal
- cycle detection via visited‑set accumulation
- stable ordering using generation depth
- relationship‑type filtering
- inferred edges included when appropriate

This results in correct, complete lineage trees.

---

## 3. Improvements in Ancestor/Descendant Traversal

### SQLite Limitations

The SQLite version exhibited several traversal issues:

- **Missing ancestors** when recursion depth was exceeded
- **Duplicate ancestors** when cycles were present
- **Incorrect ordering** (children appearing before parents)
- **Spouse relationships incorrectly treated as ancestors**
- **Inferred relationships ignored**
- **Ambiguous parentage causing traversal gaps**

These issues were visible in the personal tree output and required manual correction.

---

### PostgreSQL Improvements

The PostgreSQL implementation resolves all of the above:

- **Full ancestor traversal** regardless of depth
- **Cycle detection** prevents infinite loops
- **Stable ordering** based on generation level
- **Correct relationship filtering** (parent/child only)
- **Inferred relationships included** when flagged
- **Ambiguous parentage handled deterministically**
- **Descendant traversal matches ancestor traversal symmetry**

The result is a lineage tree that is:

- complete
- correct
- stable
- reproducible

This correctness is essential for downstream features such as gender inference and event aggregation.

---

## 4. Correctness Issues Found in the SQLite Version

During the migration, several correctness issues were discovered in the SQLite implementation:

### A. Missing ancestors

Certain individuals lacked grandparents or great‑grandparents due to recursion depth limits.

### B. Incorrect spouse traversal

Spouses were sometimes treated as ancestors or descendants due to relationship misclassification.

### C. Cycles causing duplication

Cycles in the relationship graph (common in historical datasets) caused repeated nodes.

### D. Ambiguous parentage

Individuals with multiple possible parents were inconsistently resolved.

### E. Ordering instability

The same query produced different ordering depending on dataset state.

### F. No inferred relationships

Relationships inferred from events (e.g., birth event → parent linkage) were not included.

### G. Performance degradation

Large trees caused slow queries or timeouts.

All of these issues are resolved in the PostgreSQL version.

---

## 5. Validation Tests Comparing Both Outputs

To ensure correctness, a series of validation tests were run comparing:

- SQLite personal tree output
- PostgreSQL personal tree output

These tests included:

### 1. Direct comparison of ancestor lists

Every ancestor in SQLite was checked against PostgreSQL output.

### 2. Depth comparison

PostgreSQL consistently produced deeper trees.

### 3. Cycle detection tests

PostgreSQL avoided duplicate nodes; SQLite did not.

### 4. Relationship filtering tests

PostgreSQL correctly excluded spouses and non‑parental relationships.

### 5. Inferred relationship tests

PostgreSQL included inferred parents; SQLite did not.

### 6. Performance tests

PostgreSQL completed deep trees in milliseconds; SQLite slowed significantly.

### 7. Event‑linked traversal tests

PostgreSQL correctly linked events to places and persons during traversal.

The PostgreSQL implementation passed all validation tests.

---

## 6. Why PostgreSQL Is the Correct Long‑Term Home

PostgreSQL is the correct long‑term home for lineage computation because it provides:

- **robust recursion**
- **stable ordering**
- **cycle detection**
- **graph‑friendly relationship modeling**
- **event‑centric historical modeling**
- **place normalization integration**
- **scalability for large datasets**
- **predictable performance**

SQLite served as a useful prototype, but PostgreSQL is required for correctness, stability, and future expansion.
