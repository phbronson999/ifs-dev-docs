---
title: Filter Model
tags:
  - ifs-analytics
  - ifs-analytics/tabular
aliases:
  - filtermodel
related:
  - "[[Analysis Data Source]]"
  - "[[Fact Model]]"
  - "[[Dimension Model]]"
---

# Filter Model

Confirmed as a real "New Model" command in Developer Studio. **No Marble grammar entry exists for it**, and no real example file or reference could be found anywhere in this IFS Cloud core checkout.

> [!info] Working hypothesis — unconfirmed
> `tabmdl/deploy.ini` lists several `.analysisdatasource` files named like row-level-security filters — `GlCompanyRls_analysisdatasource.ins`, `BusinessPlanRls_analysisdatasource.ins`, `PlanningUnitRls_analysisdatasource.ins` ("Rls" = Row Level Security). A "Filter Model" in the same star-schema designer as [[Fact Model]]/[[Dimension Model]] would plausibly define these row-level security filters visually rather than as a plain `analysisdatasource`. Unconfirmed — no example file exists in this checkout to verify the connection.

## What's Actually Known

- Real, selectable Developer Studio model type.
- Not indexed in Marble's 47 supported text-DSL languages.
- No further detail available from this environment.

## See Also

- [[Analysis Data Source]] — RLS-style filter data sources already exist here as plain `analysisdatasource` files
- [[Fact Model]] / [[Dimension Model]] / [[Information Source Diagram]] — the other model types in the same unconfirmed group
