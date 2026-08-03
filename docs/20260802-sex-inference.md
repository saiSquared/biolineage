# 20260802-sex-inference.md

Sex Inference Methodology for biolineage

This document describes the sex inference subsystem used by biolineage. It explains how sex is inferred from relationships, how ambiguous cases are handled, how conflicting data is resolved, and how sex is stored and updated in the database. The sex inference logic is used only when Norm’s dataset does not explicitly provide sex information.

---

## 1. Overview

Norm’s dataset contains many individuals without explicit sex fields. To support lineage traversal, relationship modeling, and event interpretation, biolineage infers sex when reliable structural evidence exists.

Sex inference is based solely on:

- explicit parent/child relationships
- spouse or partner relationships
- event context (e.g., “mother”, “father” in narrative text)
- deterministic rules that avoid assumptions

Sex is never inferred from names, cultural stereotypes, or historical generalizations.

---

## 2. Sources of Sex Information

Sex may originate from three sources:

1. Explicit sex provided in Norm’s dataset
2. Inferred sex from relationship structure
3. Inferred sex from event context

Explicit sex always takes precedence.

---

## 3. Inferring Sex from Parent/Child Relationships

Parent/child edges provide the strongest structural evidence for sex inference.

Examples:

- If an entity is explicitly listed as the mother of a child, sex is inferred as female.
- If an entity is explicitly listed as the father of a child, sex is inferred as male.

Norm’s dataset does not contain explicit “mother” or “father” labels, but parentage can be inferred from event context or relationship structure.

When two parents are listed for a child:

- If one parent already has explicit sex, the other parent may be inferred when the relationship type indicates a spouse or partner.
- If both parents have explicit sex, no inference is needed.
- If neither parent has explicit sex, no inference is made.

Parent/child relationships never imply sex unless additional context exists.

---

## 4. Inferring Sex from Spouse or Partner Relationships

Spouse or partner relationships do not automatically imply sex. However, they may contribute to inference when combined with parent/child edges.

Examples:

- If two individuals are spouses and one is explicitly the mother of a child, the other may be inferred as the father when the relationship structure supports it.
- If two individuals are spouses and one has explicit sex, the other is not inferred unless parentage context exists.

Spouse relationships alone are not sufficient to infer sex.

---

## 5. Inferring Sex from Event Context

Narrative event descriptions occasionally contain sex‑specific terms such as:

- mother
- father
- widow
- widower

When these terms appear in narrative text, they may be used to infer sex.

Examples:

- “Widow of John Smith” → inferred female
- “Widower of Mary Jones” → inferred male

Narrative context is used only when the term is unambiguous.

---

## 6. Ambiguous Cases

Many individuals in Norm’s dataset lack sufficient information for sex inference. Ambiguous cases include:

- individuals with no relationships
- individuals with only sibling relationships
- individuals with only spouse relationships and no children
- individuals with narrative-only event descriptions
- individuals with conflicting or unclear parentage

Ambiguous cases remain with sex = null.

No assumptions are made based on:

- given names
- family names
- cultural naming patterns
- historical norms
- statistical likelihood

Sex is inferred only when structural evidence exists.

---

## 7. Conflicting Data

Conflicting data may occur when:

- narrative text contradicts relationship structure
- multiple inferred relationships suggest different sexes
- historical records contain inconsistent information

Conflict resolution rules:

1. Explicit sex always wins.
2. Inferred sex from parent/child edges overrides narrative inference.
3. Narrative inference overrides spouse-only inference.
4. If two inference sources conflict, sex remains null.

This ensures correctness and avoids incorrect assumptions.

---

## 8. How Sex Is Stored and Updated

Sex is stored in the entities table as:

- male
- female
- null (unknown or ambiguous)

During ingestion:

1. Explicit sex is applied first.
2. Inferred sex is applied only when unambiguous.
3. Conflicting inferred sex results in null.
4. Sex is never overwritten once set explicitly.
5. Inferred sex may be overwritten by explicit sex if provided later.

This ensures deterministic and stable sex assignment.

---

## 9. Interaction with Other Subsystems

Sex inference supports:

- relationship traversal
- ancestor and descendant tree rendering
- event interpretation
- spouse and partner modeling
- future editorial corrections

Sex is not required for lineage computation, but it improves clarity and correctness in tree rendering and event context.

---

## 10. Summary

The sex inference subsystem in biolineage is designed to be:

- deterministic
- conservative
- structurally grounded
- ambiguity-aware
- free of cultural or naming assumptions
- correct across ingestion runs

Sex is inferred only when reliable evidence exists. Ambiguous cases remain unresolved until explicit or structural information becomes available.
