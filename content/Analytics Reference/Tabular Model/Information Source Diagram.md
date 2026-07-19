---
title: Information Source Diagram
publish: true
tags:
  - ifs-analytics
  - ifs-analytics/tabular
aliases:
  - informationsourcediagram
related:
  - '[[Fact Model]]'
  - '[[Dimension Model]]'
  - '[[Filter Model]]'
  - '[[Analysis Data Source]]'
---

# Information Source Diagram

Confirmed as a real "New Model" command in Developer Studio. **No Marble grammar entry exists for it**, and no real example file or reference could be found anywhere in this IFS Cloud core checkout.

> [!info] Working hypothesis — unconfirmed
> By name and position in the New Model menu (grouped with [[Fact Model]], [[Dimension Model]], [[Filter Model]]), this is most likely the **visual canvas** for composing a star schema — the BI-pipeline equivalent of `Entity Overview Diagram` in `Base Server Reference`, which is a visual diagram (XML-backed, rendered as boxes-and-lines, no text grammar) where `Entity`/`Enumeration`/`Utility` nodes are placed and connected. If that parallel holds, Information Source Diagram would be the diagram where Fact/Dimension/Filter Model boxes are arranged and connected, similar to how an [[Analysis Model]]'s `relationships{}` block connects tables — but visually, at design time, rather than in `.analysismodel` text.
>
> Unconfirmed — this is a reasoned guess based on naming and menu grouping, not a verified fact. No example diagram file exists in this checkout.

## What's Actually Known

- Real, selectable Developer Studio model type, displayed with a diagram-style icon.
- Not indexed in Marble's 47 supported text-DSL languages — consistent with it being a visual/XML diagram type with no text syntax (same situation as `Entity Overview Diagram`).
- No further detail available from this environment.

## See Also

- [[Fact Model]] / [[Dimension Model]] / [[Filter Model]] — the model types this diagram likely composes
- [[Analysis Data Source]] / [[Analysis Model]] — the text-DSL layer this diagram may generate or sit alongside
