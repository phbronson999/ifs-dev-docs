---
title: Dimension Model
tags:
  - ifs-analytics
  - ifs-analytics/tabular
aliases:
  - dimensionmodel
related:
  - "[[Analysis Data Source]]"
  - "[[Fact Model]]"
  - "[[Information Source Diagram]]"
---

# Dimension Model

Confirmed as a real "New Model" command in Developer Studio. **No Marble grammar entry exists for it**, and no real example file or reference could be found anywhere in this IFS Cloud core checkout.

> [!info] Working hypothesis — unconfirmed
> See [[Fact Model]] for the reasoning: this is likely the dimension-table counterpart in the same star-schema visual designer as [[Fact Model]], [[Filter Model]], and [[Information Source Diagram]] — a sibling concept to `oraclesource { type Fact; }` inside [[Analysis Data Source]], just for dimension tables (the `Dim*` -prefixed tables seen throughout `tabmdl`, e.g. `DimCurrencyCode_analysisdatasource.ins`, `DimAccAttr_analysisdatasource.ins`). Unconfirmed — no example file exists in this checkout.

## What's Actually Known

- Real, selectable Developer Studio model type.
- Not indexed in Marble's 47 supported text-DSL languages.
- No further detail available from this environment.

## See Also

- [[Analysis Data Source]] — dimension tables already exist there as plain `analysisdatasource` files (e.g. `DimCurrencyCode`)
- [[Fact Model]] / [[Filter Model]] / [[Information Source Diagram]] — the other model types in the same unconfirmed group
