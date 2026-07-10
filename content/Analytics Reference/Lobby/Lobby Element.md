---
title: Lobby Element
tags:
  - ifs-analytics
  - ifs-analytics/lobby
aliases:
  - lobbyelement
related:
  - "[[Lobby Data Source]]"
---

# Lobby Element

A ==Lobby Element== is the visual tile/widget placed on a Lobby page — text, image, link, chart, etc. Confirmed as a real, first-class "New Model" command in Developer Studio. Where [[Lobby Data Source]] defines *what data* a tile shows, Lobby Element defines *how it's displayed and where it links*.

> [!abstract] Syntax Skeleton (per Marble grammar — this is the entire indexed grammar)
> ```marble
> lobbyelement <ModelName>;
> component    <ComponentName>;
> ```

> [!warning] Marble's grammar for this language is almost empty
> Unlike [[Lobby Data Source]] (which at least has a full set of keywords for `view`/`where`/`column`/etc.), Marble has **no rule at all** for the element body — no `text`, `image`, `link`, or `chart` keyword, nothing beyond the two header lines above. There is no `LobbyElementDefinition` rule. Whatever language/format actually describes element content (layout, font, links, image opacity, etc.) is not indexed by Marble at all.

---

## What Actually Ships: Runtime XML

Every Lobby element in the core checkout is a raw exported XML file with an embedded GUID, e.g.:

```
person/server/lobby/elements/TEAM TIMELINE UXX Lobby - ab602d28-....element.xml
```

```xml
<Text>
  <Author>IFS RnD</Author>
  <Component>PERSON</Component>
  <Name>TEAM TIMELINE UXX Lobby</Name>
  <ID>ab602d28-4662-4fe1-8fa4-d4fcaf98de25</ID>
  <WebUrl>page/EmployeeTimelinePage/EmployeeTimelinePage</WebUrl>
  <BodyText>Team Timeline</BodyText>
  <FontWeight>Bold</FontWeight>
  <FontSize>18</FontSize>
  <HorizontalAlignment>Center</HorizontalAlignment>
  <VerticalAlignment>Center</VerticalAlignment>
</Text>
```

The root tag varies by element type (`<Text>` here; presumably `<Image>`, `<Link>`, `<Chart>`, etc. exist for other element types, though none were found in this checkout to confirm their shape). This is what the front-end **Lobby Designer**'s Export produces — same mechanism as [[Lobby Data Source]].

---

## Practical Path

Same as [[Lobby Data Source]]: design the element visually in the Lobby Designer, Export, and check the resulting `*.element.xml` into `server/lobby/elements/` for the owning component. There is no evidence the Developer Studio "Lobby Element..." New Model command produces anything different from this XML — it's just a model-tree entry point into the same designer.

---

## See Also

- [[Lobby Data Source]] — the data side of the same Lobby tile
- [[../README|Analytics Reference]]
