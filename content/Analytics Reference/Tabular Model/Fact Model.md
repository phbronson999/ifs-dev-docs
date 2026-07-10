---
title: Fact Model
tags:
  - ifs-analytics
  - ifs-analytics/tabular
aliases:
  - factmodel
related:
  - "[[Analysis Data Source]]"
  - "[[Dimension Model]]"
  - "[[Information Source Diagram]]"
---

# Fact Model

Confirmed as a real "New Model" command in Developer Studio. **No Marble grammar entry exists for it** (not in the 47-language Marble index, no `.llm` folder), and no real `.factmodel`-style file or reference to it could be found anywhere in this IFS Cloud core checkout.

> [!info] Working hypothesis — unconfirmed
> [[Analysis Data Source]]'s `oraclesource { type Fact; }` property uses the literal value `Fact` for star-schema fact tables. Given that, plus the fact that Fact Model/[[Dimension Model]]/[[Filter Model]]/[[Information Source Diagram]] all appear together in the New Model menu with star-schema-suggestive icons, the most likely explanation is that these four are visual/XML-backed node types in a star-schema designer — the BI equivalent of how `Entity`/`Enumeration`/`Utility` are node types inside an `Entity Overview Diagram` (see `Base Server Reference`). That would make `Information Source Diagram` the canvas, and Fact/Dimension/Filter Model the boxes you place on it.
>
> This has **not** been verified — no example file exists in this checkout to confirm it. Treat it as a lead for next time you have an active Developer Studio session, not as documented fact.

## What's Actually Known

- It is a real, selectable item in Developer Studio's New Model menu.
- It is not one of Marble's indexed text-DSL languages — meaning either it's XML/visual-only (like `.entity`/`.overview`), or it belongs to a toolset Marble's extension doesn't cover.
- No further detail is available from this environment.

## See Also

- [[Analysis Data Source]] — has a confirmed `type Fact;` property value
- [[Dimension Model]] / [[Filter Model]] / [[Information Source Diagram]] — the other model types in the same unconfirmed group
