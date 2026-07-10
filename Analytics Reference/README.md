---
title: IFS Analytics Reference
tags:
  - ifs-analytics
  - index
aliases:
  - Analytics Reference
  - Analytics Layer
related:
  - "[[IFS Marble Language Reference]]"
  - "[[IFS Base Server Reference]]"
---

# IFS Analytics Reference

IFS Cloud has **three distinct, unrelated mechanisms** for getting data into a reporting/dashboard surface. They use similar vocabulary ("data source") but are different DSLs, compiled by different tooling, and deployed to different targets. This section exists because that similarity is misleading — confusing one for another wastes time.

| Mechanism | DSL | Feeds | Compiles to | Runs on |
|-----------|-----|-------|-------------|---------|
| Lobby tile | [[Lobby Data Source]] | A single SQL-based KPI/list tile on a Lobby page | Nothing confirmed — see note | Oracle, queried live by the Lobby UI |
| Tabular Model | [[Analysis Data Source]] + [[Analysis Model]] | A full BI semantic model (measures, relationships, hierarchies) | `.ins` install scripts + a `.bim` Tabular Model definition | Oracle warehouse tables + Microsoft SSAS |
| Data lake export | [[Parquet Data Source]] | An external Parquet file for analytics outside IFS Cloud | Not found in this checkout — grammar only | Unknown (likely a data-lake/export job) |

> [!warning] Don't assume these three share tooling
> They were investigated together because they were easy to confuse by name. `Lobby Data Source` and `Analysis Data Source` sound like variants of the same thing — they are not. The Lobby mechanism is a simple SQL-select-to-tile binding; the Tabular Model mechanism is a full Microsoft SSAS deployment pipeline with its own runtime tables (`TM_*`) and PL/SQL deployer service.

---

## Notes in This Section

```dataview
TABLE aliases, tags
FROM #ifs-analytics
WHERE file.name != "README"
SORT file.name ASC
```

---

## How These Notes Were Built

The DSL grammar (keywords, structure) for all four came from the Marble MCP grammar server, which documents syntax but not deployment. For [[Analysis Data Source]] and [[Analysis Model]], the deployment pipeline was confirmed by reading real files in the `tabmdl`/`tabmfw` components (a working `.analysismodel` example, `tabmdl/deploy.ini`, `tabmfw/source/tabmfw/database/TabularModelDeployer.plsvc`). For [[Lobby Data Source]] and [[Parquet Data Source]], no real example file or compiler/deploy reference could be found anywhere in this checkout — that gap is called out explicitly in each note rather than guessed at.

## See Also

- [[IFS Marble Language Reference]] — the Aurena UI/Projection layer these data sources are independent of
- [[IFS Base Server Reference]] — the PL/SQL/entity layer that `oraclesource`/`sqlsource` blocks point back into
