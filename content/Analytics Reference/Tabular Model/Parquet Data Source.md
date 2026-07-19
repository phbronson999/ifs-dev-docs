---
title: Parquet Data Source
publish: true
tags:
  - ifs-analytics
  - ifs-analytics/tabular
aliases:
  - parquetdatasource
related:
  - '[[Analysis Data Source]]'
---

# Parquet Data Source

A ==Parquet Data Source== defines an Oracle-side source view plus a destination Parquet file in a data lake. By field shape (`type Fact`, `module`, a file path with a max-age) it's clearly meant for exporting warehouse-style data out of IFS Cloud for consumption by external analytics tooling — but unlike [[Analysis Data Source]] and [[Analysis Model]], no compiler, build script, or deployed-runtime trace for this DSL exists anywhere in this checkout (see warning below).

> [!info] Full parity with Marble's grammar source
> This note has been checked against all 16 `.llm` files in Marble's `Parquetdatasource` grammar folder — by far the smallest of the three Tabular-pipeline languages (33 for [[Analysis Data Source]], 60 for [[Analysis Model]]). Unlike those two, there is genuinely **no per-column or data-type system** in this language at all — no `columns{}`/`columnoverrides{}` block, no `DataType` enum. The entire grammar is just the 16 files already reflected in this note: a flat header (`name`/`description`/`version`), one `oraclesource{}` block, and one `parquetdestination{}` block. That's a confirmed finding, not a gap.

> [!abstract] Syntax Skeleton
> ```marble
> parquetdatasource <ModelName>;
> component          <ComponentName>;
> layer              <LayerName>;
> name               '<Value>';
> description        "<Value>";
> version            <Major>.<Minor>.<Revision>;
>
> oraclesource {
>    name   '<Value>';
>    type   <Value>;
>    module <Value>;
> }
>
> parquetdestination {
>    filenametemplate '<Value>';
>    path             '<Value>';
>    maxage           <minutes>;
> }
> ```

---

## Keywords

| Keyword | Description |
|---------|-------------|
| `parquetdatasource` / `component` | Model file name and owning component, e.g. `component AMDSRC;`. |
| `layer` | No description given in Marble's grammar (header field, presumably `Core`/`Cust` as elsewhere). |
| `name` | The id for the parquet data source, e.g. `'FACT_GL_BALANCE'`. |
| `description` | Short description of what the data source provides. |
| `version` | `Major.Minor.Revision`, e.g. `23.1.0`. |
| `oraclesource { name; type; module; }` | The Oracle source view: `type` indicates the view's type in Oracle (e.g. `Fact`); `module` indicates the Module of the Oracle source referred by the access view (an IFS component code, e.g. `ACCRUL`). Note: this `oraclesource` is its own rule for this language — simpler than the one in [[Analysis Data Source]] (no `supportsincremental`/load-type/filter properties). |
| `parquetdestination { filenametemplate; path; maxage; }` | `filenametemplate` — file name template for the Parquet file; `path` — path of the file in the data lake; `maxage` — max age in minutes for the data source (presumably a refresh/staleness threshold). |

This is the most thoroughly *documented* of the four DSLs in this section — every field above has a real `Description` and a working `SourceSample` in the Marble grammar server, unlike [[Lobby Data Source]].

---

## Example (assembled from Marble's own `SourceSample` fields)

```marble
parquetdatasource ParquetDataSource;
component AMDSRC;
layer Core;

name 'FACT_GL_BALANCE';
description "Sample Description";
version 23.1.0;

oraclesource {
   name 'FACT_WORK_TASK_BI';
   type Fact;
   module 'WO';
}

parquetdestination {
   filenametemplate 'FACT_WORK_TASK_BI';
   path 'path/path1/path2';
   maxage 120;
}
```

---

## What Gets Generated and How It Deploys

> [!danger] Not found in this checkout
> A full search of the IFS Cloud core checkout for `.parquetdatasource` files, compiler references, build scripts, or any generated output (Parquet job configs, export service code) returned **zero matches** — in Java, PL/SQL, XML, and property files alike. Despite the grammar being well-documented (unlike [[Lobby Data Source]]), there is no concrete evidence in this checkout of where it's used, what it compiles to, or how it's deployed.
>
> Plausible explanation, unconfirmed: this may be a newer or SaaS-only data-lake export feature not present in this on-prem checkout/version. Treat everything below the syntax skeleton as the limit of what's currently knowable from this codebase — don't extrapolate a deployment story without finding a real example first.

---

## Unresolved: `RegionDivider`

Same situation as [[Analysis Data Source]] and [[Analysis Model]] — a `RegionDivider.llm` file exists in this grammar folder too (identical empty content: `EBNF = "RegionName"`, no description). Its literal text syntax remains undetermined across all three Tabular-pipeline languages.

---

## See Also

- [[Analysis Data Source]] — the much better-evidenced sibling DSL, with a confirmed `.ins`/SSAS deployment pipeline
- [[Analysis Model]] — the semantic layer consuming Analysis Data Sources
- [[../README|Analytics Reference]] — overview of all three mechanisms and why they're kept separate
