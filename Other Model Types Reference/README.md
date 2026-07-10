---
title: Other Model Types Reference
tags:
  - ifs-other-models
  - index
aliases:
  - Other Model Types Reference
related:
  - "[[IFS Marble Language Reference]]"
  - "[[IFS Base Server Reference]]"
  - "[[Analytics Reference]]"
---

# Other Model Types Reference

Developer Studio's **New Model** menu has far more entries than the Client/Projection/Base-Server/Analytics layers documented elsewhere in this vault. This section catalogs the remaining ones: some have real, documented Marble grammar; several confirmed-real menu items have **no** indexed grammar at all, meaning they're almost certainly XML- or visual-editor-only model types (the same situation as `Entity Model`/`Entity Overview Diagram` in `Base Server Reference`).

> [!info] How "confirmed" vs "unconfirmed" was determined
> Marble's grammar server reads from a fixed local folder of `.llm` files, one per language. Every language abbreviation below was checked directly against that folder (and several plausible name variants, e.g. `Scheduling` vs `Schedulingmodel`) — "no grammar found" means no matching folder exists under any reasonable name, not that the search was shallow.

## Notes With Real Grammar

```dataview
TABLE aliases, tags
FROM #ifs-other-models/confirmed
SORT file.name ASC
```

## Notes With No Grammar Found (Confirmed Real in Developer Studio, Undocumented Here)

```dataview
TABLE aliases, tags
FROM #ifs-other-models/unconfirmed
SORT file.name ASC
```

## Other Menu Items Noticed But Not Yet Investigated

Seen in the Developer Studio New Model menu but not pursued in this pass — no Marble grammar found under any obvious abbreviation, and not yet researched further: **Report Model**, **Javaclient Model**, **BizAPI Model**, **Client Package Model**, **Cloud Package Model**, **Component Model**. Ask for these specifically if you want them added.

## See Also

- [[Analytics Reference]] — Lobby and Tabular Model DSLs
- [[IFS Marble Language Reference]] — Client/Projection/Fragment
- [[IFS Base Server Reference]] — Entity/Enumeration/Utility, and why some model types are XML-only with no text grammar
