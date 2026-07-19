---
title: Analysis Model
publish: true
tags:
  - ifs-analytics
  - ifs-analytics/tabular
aliases:
  - analysismodel
  - Tabular Model
related:
  - '[[Analysis Data Source]]'
---

# Analysis Model

An ==Analysis Model== defines the BI semantic layer on top of one or more [[Analysis Data Source]] warehouse tables: tables, columns, measures, hierarchies, and relationships. It compiles into a Microsoft **Tabular Model** that is served by SSAS — this is the construct behind embedded KPI/BI experiences like the Industry Lobby KPIs.

> [!info] Full parity with Marble's grammar source
> This note has been checked against every one of the 60 `.llm` files in Marble's `Analysismodel` grammar folder — nearly double the size of [[Analysis Data Source]]'s. Most of the per-column Tabular properties (alignment, encoding hints, MDX availability, etc.) have no `Description`/`Explanation` text from Marble at all — they're listed below anyway, with a plain-English gloss clearly marked as general Microsoft Tabular Model knowledge rather than something Marble itself documents.

> [!abstract] Syntax Skeleton
> ```marble
> analysismodel <ModelName>;
> component      <ComponentName>;
> layer          <LayerName>;
> name           "<DisplayName>";
> description    "<Value>";
> version        <Major>.<Minor>.<Revision>;
>
> [expressions {
>    expression <ExpressionId> {
>       name          <Value>;
>       [description  <Value>;]
>       [datasource   <Value>;]
>       [mquery       <Value>;]
>       [columns {
>          column <ColumnOne> <ColumnTwo> [<DataType>] [<Formula>];
>       }]
>    }
> }]
>
> tables {
>    table <TableId> {
>       name           "<Value>";
>       [description   "<Value>";]
>       [ishidden      <true|false>;]
>       [datacategory  <Value>;]
>       [refexpression <ExpressionId>;]   -- table is based on a shared expression
>       [reftable      <TableId>;]        -- table is a calculated table, based on another table
>
>       [partitions {
>          partition <PartitionId> {
>             name         "<Value>";
>             [description "<Value>";]
>             [datasource  <AnalysisDataSourceId>;]
>             [mquery      <Value>;]      -- the complete m-query, used instead of `datasource`
>             [columns { column <C1> <C2> [<DataType>] [<Formula>]; }]
>          }
>       }]
>       [columns {
>          column <ColumnId> <DataType> {
>             [type             <Value>;]   -- TableColumnType
>             [description      "<Value>";]
>             [displayfolder    "<Value>";]
>             [ishidden         <true|false>;]
>             [name             "<DbColumnAlias>";]
>             [datacategory     <Value>;]
>             [datatype         <DataType>;]   -- overrides the required column-level data type above
>             [expression       <Value>;]      -- makes this a calculated column
>             [formatstring     "<Value>";]
>             [sortbycolumn     <Value>;]
>             [sourcecolumn     "<SourceColumnName>";]
>             [alignment        <Value>;]
>             [isavailableinmdx <true|false>;]
>             [isdatatypeinferred <true|false>;]
>             [isdefaultlabel   <true|false>;]
>             [isdefaultimage   <true|false>;]
>             [displayordinal   <int>;]
>             [encodinghint     <Value>;]
>             [iskeepuniquerows <true|false>;]
>             [iskey            <true|false>;]
>             [isnameinferred   <true|false>;]
>             [isnullable       <true|false>;]
>             [sourceprovidertype <Value>;]
>             [summarizeby      "<none|sum|...>";]
>             [tabledetailposition <Value>;]
>             [isunique         <true|false>;]
>          }
>       }]
>       [measures {
>          measure "<MeasureName>" {
>             [expression    "<DAX-like expression>";]
>             [formatstring  "<Value>";]
>             [description   "<Value>";]
>             [displayfolder "<Value>";]
>             [ishidden      <true|false>;]
>          }
>       }]
>       [hierarchies {
>          hierarchy <HierarchyId> {
>             name          "<Value>";
>             [description  "<Value>";]
>             [displayfolder "<Value>";]
>             [ishidden     <true|false>;]
>             [hidemembers  <Value>;]
>             [levels {
>                level <Column>;
>                -- repeats, one per hierarchy level, ordered top to bottom
>             }]
>          }
>       }]
>    }
> }
>
> [relationships {
>    relationship <FromTableId> <FromColumnId> <ToTableId> <ToColumnId>;
>    -- or, name-based:
>    relationship "<FromTableName>" "<FromColumnName>" "<ToTableName>" "<ToColumnName>";
> }]
> ```

---

## Data Types

`<DataType>` (wherever it appears — required on every `column` in a table, optional inside `datatype` overrides, optional inside expression `column` definitions) must be one of:

```
Text | DecimalNumber | WholeNumber | Currency | Boolean | Date | Binary | Unknown
```

This is the Tabular-Model equivalent of [[Analysis Data Source]]'s SQL-Server-style `<DataType>` enum — different vocabulary because this one describes a Tabular Model column type, not a SQL column type.

---

## Top-Level Keywords

| Keyword | Description |
|---------|-------------|
| `analysismodel` / `component` / `layer` | Standard model header. |
| `name` | Display name for the model, e.g. `"General Ledger"`. |
| `description` | Short description of what the model provides. |
| `version` | `Major.Minor.Revision`, e.g. `22.1.0`. |

## Expressions

| Keyword | Description |
|---------|-------------|
| `expressions { expression <Id> { ... } }` | "Models the shared expressions of this tabular model." |
| `expression.name` / `.description` | Standard name/description, scoped to this expression. |
| `expression.datasource` | No Marble description — points at an [[Analysis Data Source]] id, same as a partition's `datasource`. |
| `expression.mquery` | "The complete m-query in the absense [sic] of a datasource" — i.e. use either `datasource` or `mquery`, not both. |
| `expression.columns { column <C1> <C2> [DataType] [Formula]; }` | "Models the columns accessed through the datasource. Should only be defined if a datasource was defined for the parent." This `column` construct (`ColumnProperty`/`ColumnScope`) is distinct from the table-level `column` below — it takes two bare identifiers (`ColumnOne`/`ColumnTwo`) plus an optional data type and an optional `Formula`. `Formula` has no rule file of its own in Marble's index — likely a generic expression-string placeholder rather than a documented construct; noted here rather than guessed at. |

## Tables

| Keyword | Description |
|---------|-------------|
| `tables { table <Id> { ... } }` | "Models the table definitions for this tabular model." |
| `table.name` / `.description` | Standard name/description. |
| `table.ishidden` | "Indicate if the table is hidden, false if not specified." |
| `table.datacategory` | "The tabular data category for the table." No enum documented. |
| `table.refexpression` | "The referenced expression when table is based on a shared expression." — an alternative to `partitions{datasource}`: the table's rows come from an `expressions{}` block instead of a direct data source. |
| `table.reftable` | "The referenced Table when this is a calculated table." — a third way a table can get its rows: computed from another table in the same model, rather than partitioned from a data source or expression. |
| `partitions { partition <Id> { ... } }` | Required for a data-source-backed table (as opposed to `refexpression`/`reftable`-backed tables). |
| `partition.datasource` | Points at an [[Analysis Data Source]] id. |
| `partition.mquery` | Same meaning as `expression.mquery` — a complete m-query used instead of `datasource`. |
| `partition.columns { }` | Same `ColumnScope`/`ColumnProperty` construct as `expression.columns` — "should only be defined if a datasource was defined for the parent." |

## Table Columns

`columns { column <ColumnId> <DataType> { ... } }` — "The abstraction for the Microsoft Tabular Table Column class." Every property below is optional inside the `{ }` body (only `ColumnId` and the top-level `<DataType>` are required). None of these have `Description`/`Explanation` text from Marble — the glosses are general Microsoft Tabular Model knowledge, not sourced from Marble itself:

| Keyword | Plain-English gloss (not from Marble) |
|---------|------------------------------------------|
| `type` | The Tabular column type — e.g. Data vs. Calculated vs. RowNumber column. No enum documented. |
| `description` | Per-column description. |
| `displayfolder` | Groups the column under a folder in the client field list. |
| `ishidden` | Hides the column from end-user field lists while still usable in measures. |
| `name` | Display name for the column. |
| `datacategory` | Per-column data category (e.g. for geography-aware columns). |
| `datatype` | Overrides the data type given right after `column <Id>`. |
| `expression` | Makes this a calculated column — a DAX-like formula instead of a direct source mapping. |
| `formatstring` | Display format, e.g. `"#,0"`. |
| `sortbycolumn` | Sorts this column's values by another column instead of its own values. |
| `sourcecolumn` | The underlying source column name this maps to. |
| `alignment` | Display alignment hint. |
| `isavailableinmdx` | Whether the column is exposed to MDX queries (disabling can reduce model size). |
| `isdatatypeinferred` | Whether the data type was auto-inferred rather than explicitly set. |
| `isdefaultlabel` | Marks this column as the default label for the table's rows. |
| `isdefaultimage` | Marks this column as the default image for the table's rows. |
| `displayordinal` | Explicit display order among the table's columns. |
| `encodinghint` | VertiPaq storage encoding hint (e.g. value vs. hash encoding) for compression tuning. |
| `iskeepuniquerows` | Whether duplicate-row collapsing is disabled for this column. |
| `iskey` | Marks the column as (part of) the table's key. |
| `isnameinferred` | Whether the column's name was auto-inferred. |
| `isnullable` | Whether the column allows nulls. |
| `sourceprovidertype` | The source data provider type for this column. |
| `summarizeby` | Default aggregation, e.g. `"none"`, `"sum"`. |
| `tabledetailposition` | Ordering hint when this column is shown in table-detail/drillthrough views. |
| `isunique` | Marks the column as containing unique values. |

## Measures

| Keyword | Description |
|---------|-------------|
| `measures { measure "<Name>" { ... } }` | "Models the measure definitions for a tabular table." |
| `measure.expression` | A calculated value, written in a DAX-like expression syntax, e.g. `SUM('PROJECT BASE'[MS])`. |
| `measure.formatstring` / `.description` / `.displayfolder` / `.ishidden` | Same meaning as the table-column equivalents above, scoped to the measure. |

## Hierarchies

| Keyword | Description |
|---------|-------------|
| `hierarchies { hierarchy <Id> { ... } }` | "Models the hierarchy definitions for a tabular table." |
| `hierarchy.name` / `.description` / `.displayfolder` / `.ishidden` | Standard properties, scoped to the hierarchy. |
| `hierarchy.hidemembers` | No Marble description — controls which members are hidden within the hierarchy (standard Tabular concept: e.g. hiding blank members). |
| `levels { level <Column>; }` | "The abstraction for the Microsoft Tabular Level class." Each `level` names one column, and the order of `level` entries defines the hierarchy's drill-down order (top level first). |

## Relationships

| Keyword | Description |
|---------|-------------|
| `relationships { relationship ...; }` | "These are abstractions for Tabular Relationship class." |
| `relationship <FromTableId> <FromColumnId> <ToTableId> <ToColumnId>;` | ID-based join between two tables. `FromTableId`/`FromTableColumnId`/`ToTableId`/`ToTableColumnId` are bare identifiers with no further documentation. |
| `relationship "<FromName>" "<FromCol>" "<ToName>" "<ToCol>";` | "Models the relationship definitions for this tabular model" — the name-based equivalent, using display names/strings instead of internal ids. |

---

## Real Example (from `tmproj/model/tmproj/IfsIndustryLobby.analysismodel`)

This is a working file from the checkout, not a reconstruction — it backs the Industry Lobby KPI tiles:

```marble
analysismodel IfsIndustryLobby;
component TMPROJ;
layer Core;
name "Ifs Industry Lobby";
description "IFS Analysis Models - Ifs Industry Lobby";
version 22.1.0;

tables {
   table IndustryLobbyMeasures {
      name "INDUSTRY LOBBY MEASURES";
      description "";

      partitions {
         partition Partitionfull {
            name "PartitionFull";
            description "";
            datasource FactProjectBase;
         }
      }
      measures {
         measure "SUM MS" {
            expression "SUM('PROJECT BASE'[MS])";
            formatstring "#,0";
         }
         measure "SUM PO" {
            expression "SUM('PROJECT BASE'[PO])";
            formatstring "#,0";
         }
      }
   }

   table ProjectBase {
      name "PROJECT BASE";
      description "";

      partitions {
         partition Partitionfull {
            name "PartitionFull";
            description "";
            datasource FactProjectBase;
         }
      }
      columns {
         column CustomerId Text {
            name "CUSTOMER_ID";
            sourcecolumn "CUSTOMER_ID";
            summarizeby "none";
         }
         column Ms DecimalNumber {
            ishidden true;
            name "MS";
            formatstring "#,0";
            sourcecolumn "MS";
            summarizeby "sum";
         }
      }
   }
}
```

Note the pattern: a "measures" table (`IndustryLobbyMeasures`) with no real columns of its own, whose measures all reference columns on a separate, hidden-column "fact" table (`ProjectBase`) — both partitioned from the same underlying `FactProjectBase` [[Analysis Data Source]]. Note also that this real example only exercises a small fraction of the grammar documented above (no `expressions`, `hierarchies`, `relationships`, `refexpression`/`reftable` tables, or most of the table-column properties) — those remain grammar-only, unconfirmed against a working file.

---

## What Gets Generated and How It Deploys

Confirmed via `tabmfw/source/tabmfw/database/TabularModelDeployer.plsvc` and related `tabmfw` files (component **TABMFW**, the "Manage Tabular Models" feature):

- The model compiles to a Microsoft Tabular Model definition (`.bim` — JSON-based), which is what SSAS actually loads/processes.
- Deployment is orchestrated through the same `TM_*` runtime tables and PL/SQL deployer service described in [[Analysis Data Source]] — `.analysismodel` and `.analysisdatasource` are deployed as one connected pipeline, not independently.
- The end consumer is **Microsoft SQL Server Analysis Services (SSAS)** — IFS Cloud's embedded BI/KPI tiles (e.g. Industry Lobby KPIs) query the deployed Tabular Model rather than hitting Oracle directly.

> [!warning] Don't confuse this with [[Lobby Data Source]]
> Both involve a Lobby-facing KPI experience, but they are different pipelines: a plain [[Lobby Data Source]] is a single live SQL query bound directly to one tile. An Analysis Model is a full semantic layer deployed to SSAS, used when you need measures, relationships, or drill-down — not for a simple one-query tile.

---

## Unresolved: `RegionDivider`

Same situation as in [[Analysis Data Source]] — a `RegionDivider.llm` file exists in this grammar folder too, with identical empty content (`EBNF = "RegionName"`, no description). Whatever named-section mechanism this represents in the IDE, its literal text syntax could not be determined from this environment.

---

## See Also

- [[Analysis Data Source]] — the warehouse-table layer every `partition { datasource ...; }` points at
- [[Parquet Data Source]] — a separate export mechanism, not part of this SSAS pipeline
- [[../Lobby/Lobby Data Source|Lobby Data Source]] — the simpler, unrelated mechanism for basic Lobby tiles
