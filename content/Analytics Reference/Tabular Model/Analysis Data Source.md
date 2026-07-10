---
title: Analysis Data Source
tags:
  - ifs-analytics
  - ifs-analytics/tabular
aliases:
  - analysisdatasource
  - tmdatasource
related:
  - "[[Analysis Model]]"
  - "[[Parquet Data Source]]"
---

# Analysis Data Source

An ==Analysis Data Source== defines one warehouse table or view that feeds the Tabular Model BI pipeline — the Oracle-side source, its columns, indexes, and load behavior. An [[Analysis Model]] then builds the semantic layer (measures, relationships) on top of one or more of these.

> [!info] Full parity with Marble's grammar source
> This note has been checked against every one of the 33 `.llm` files in Marble's `Analysisdatasource` grammar folder, not just the keywords that showed up in searches. Anything Marble documents about this language is reflected below, including the data type system and the load-type/filter properties that didn't appear in the first pass.

> [!abstract] Syntax Skeleton
> ```marble
> analysisdatasource <ModelName>;
> component           <ComponentName>;
> layer               <LayerName>;
> name                '<Value>';
> description         "<Value>";
>
> sqltable <TableId> {
>    name      '<Value>';
>    truncate  <true|false>;
>    [createprimarykeyonidcolumn <true|false>;]
>
>    oraclesource {
>       name     '<Value>';
>       type     <Fact|...>;
>       [supportsincremental <true|false>;]
>       [defaultloadtype <Full|Conditional|Incremental>;]
>       [defaultconditionalfilter '<sql predicate>';]
>       [defaultincrementalfilter '<sql predicate>';]
>       [module <Value>;]
>    }
>    -- or, for a SQL Server-sourced view instead of Oracle:
>    sqlsource {
>       name '<Value>';
>    }
> }
>
> [columnoverrides {
>    column '<ColumnName>' <DataType> [<Scale>] [<Precision>];
> }]
>
> [indices {
>    index [<IndexType>] on '<Column, Column>';
> }]
>
> [sqlviews {
>    sqlview <SqlViewId> {
>       name                  '<Value>';
>       globaldeploymentorder <int>;
>       viewdefinition        '<SQL>';
>    }
> }]
>
> [dependencies {
>    dependency <OtherDataSourceId> <SequenceNumber>;
> }]
> ```

---

## Keywords

| Keyword                                                                      | Description                                                                                                                                                                                                                                                                                                                                                |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `analysisdatasource` / `component` / `layer`                                 | Standard model header — file name, owning component, layer.                                                                                                                                                                                                                                                                                                |
| `name`                                                                       | The id for the data source, e.g. `'FACT_GL_BALANCE'`.                                                                                                                                                                                                                                                                                                      |
| `description`                                                                | Short description of what the data source provides.                                                                                                                                                                                                                                                                                                        |
| `sqltable { }`                                                               | Models the warehouse table instance. Contains `name`, `truncate`, `createprimarykeyonidcolumn`, and exactly one of `oraclesource{}` / `sqlsource{}`.                                                                                                                                                                                                       |
| `truncate`                                                                   | "Indicates if the table should be truncated by default before data loading." `true` or `false`.                                                                                                                                                                                                                                                            |
| `createprimarykeyonidcolumn`                                                 | "Optionally indicates if the table should have the primary key defined automatically if it has a column by the name 'ID'. Considered 'true' if not specified."                                                                                                                                                                                             |
| `oraclesource { }`                                                           | "Models the Oracle source information. This [is] based on a view in Oracle." Contains `name`, `type`, `supportsincremental`, `defaultloadtype`, `defaultconditionalfilter`, `defaultincrementalfilter`, `module`.                                                                                                                                          |
| `oraclesource.type`                                                          | "Indicates the type of the view in oracle," e.g. `Fact`. No enum of valid values is documented by Marble — `Dim`/`Dimension` is a reasonable guess given the warehouse's `Dim*`-prefixed tables, but unconfirmed.                                                                                                                                          |
| `oraclesource.supportsincremental`                                           | "Optionally indicates if the information source behind the view supports incremental loading. Considered 'false' if not specified."                                                                                                                                                                                                                        |
| `oraclesource.defaultloadtype`                                               | "Optionally indicates the load type of the information source behind the view. Considered 'Full' if not specified." See [[#Inferred Load Type Values]] below — Marble has no dedicated enum for this, but its value is constrained by what `defaultconditionalfilter`/`defaultincrementalfilter` reference.                                                |
| `oraclesource.defaultconditionalfilter`                                      | "Optionally indicates the default where clause to be used if the load type is 'Conditional'. Considered Null if not specified." Sample: `defaultconditionalfilter 'YEAR > 2020';`                                                                                                                                                                          |
| `oraclesource.defaultincrementalfilter`                                      | "Optionally indicates the default where clause to be used if the load type is 'Incremental'. Considered Null if not specified." Sample: `defaultincrementalfilter 'MVT_CREATED_DT > &LAST_MAX_INCR_LOAD_DT';`                                                                                                                                              |
| `oraclesource.module`                                                        | "Indicates the Module of the oracle source referred by the access view," e.g. `Module ACCRUL;` — an IFS component code.                                                                                                                                                                                                                                    |
| `sqlsource { name; }`                                                        | Same idea as `oraclesource`, but "based on a view in SQL Server" — only has a `name` property, none of the load-type/filter properties.                                                                                                                                                                                                                    |
| `columnoverrides { column '<Name>' <DataType> [Scale] [Precision]; }`        | "Models the column overrides for this tabular datasource. Column meta data will be automatically picked up by the framework, but if we want to override default mapping it should be described here. Should only be defined if `sqltable` was defined." `Scale`/`Precision` are optional positive integers, e.g. for a numeric column.                     |
| `indices { index [IndexType] on '<Col, Col>'; }`                             | "Models the index definitions for this tabular datasource. Should only be defined if sqltable was defined." `IndexType` is optional and unconstrained by any documented enum — `unique` is the only value seen in a real sample; SQL Server convention suggests `Primary`/`Clustered`/`Nonclustered` may also be valid, but that's a guess, not confirmed. |
| `sqlviews { sqlview <Id> { name; globaldeploymentorder; viewdefinition; } }` | "Models a sql view instance in the data warehouse."                                                                                                                                                                                                                                                                                                        |
| `sqlview.globaldeploymentorder`                                              | "Indicates the global deployment order of this view." Sample: `globaldeploymentorder 100;`                                                                                                                                                                                                                                                                 |
| `sqlview.viewdefinition`                                                     | "The complete select statement for the view as a string."                                                                                                                                                                                                                                                                                                  |
| `dependencies { dependency <Id> <Sequence>; }`                               | "Models all the other analysis datasources that this is dependent on."                                                                                                                                                                                                                                                                                     |
| `dependency`                                                                 | "A reference to another analysis datasource." Sample: `dependency FactCurrencyRatesBase 100;`                                                                                                                                                                                                                                                              |

---

## Data Types (`columnoverrides` only)

A `column` override's `<DataType>` must be one of these SQL Server-style type keywords — this is the "acceptable values" detail that was missing from the first pass of this note. The grammar groups them into three families:

| Family | Valid Keywords |
|--------|-----------------|
| Character | `char`, `nchar`, `nvarchar`, `varchar` |
| Date/Time | `date`, `datetime`, `datetime2`, `datetimeoffset`, `smalldatetime`, `time` |
| Numeric | `bigint`, `bit`, `decimal`, `float`, `int`, `money`, `numeric`, `real`, `smallint`, `smallmoney`, `tinyint` |

```marble
column 'STATEMENT_TYPE' nvarchar 300;
column 'CURRENCY_RATE' Numeric 5 2;
```

The two trailing integers after a type (seen as `Scale`/`Precision` in `ColumnProperty`'s own description) are optional and used for types that need them, e.g. scale and precision on a `decimal`/`numeric` column.

> [!tip] Why SQL Server types, not Oracle types
> Even though the source (`oraclesource`) is typically an Oracle view, the destination warehouse table these columns describe is a SQL Server Tabular Model data source (see [[Analysis Model]] — the consuming side is Microsoft SSAS) — hence SQL Server's type vocabulary rather than Oracle's `VARCHAR2`/`NUMBER`.

---

## Inferred Load Type Values

Marble has no dedicated enum rule for `defaultloadtype`'s value, but cross-referencing the three related property descriptions pins it down to exactly three values:

| Value | When it applies |
|-------|------------------|
| `Full` | The default if `defaultloadtype` is omitted entirely. |
| `Conditional` | Triggers use of `defaultconditionalfilter` as the where clause. |
| `Incremental` | Triggers use of `defaultincrementalfilter` as the where clause. |

This is inferred from cross-referencing three separate property descriptions, not from one explicit enum — flagged here per the vault's convention of distinguishing "documented fact" from "reasoned inference."

---

## Example

```marble
analysisdatasource FactCurrencyRates;
component           TABMDL;
layer                Core;
name                 'FACT_GL_BALANCE';
description          "Sample Description";

sqltable DIM_CODE_B {
   name     'DIM_CODE_BI';
   truncate true;

   oraclesource {
      name 'DIM_CODE_BI';
      type Fact;
      supportsincremental true;
      defaultloadtype Full;
      defaultconditionalfilter 'LAST_LOADED > 2005-01-01';
      defaultincrementalfilter 'YEAR = 2005';
   }
}

columns {
   column 'STATEMENT_TYPE' nvarchar 300;
}

indices {
   index unique on 'COMPANY, CODE';
}

sqlviews {
   sqlview DIM_CODE_B {
      name 'DIM_CODE_D_TM';
      globaldeploymentorder 100;
      viewdefinition 'SELECT s.*,
         cr.currency_rate_adj as rep_curr_rate,
         cr.ref_currency_code as rep_curr_code
         FROM FACT_GL_BALANCE_T1 s
         LEFT OUTER JOIN FACT_CURRENCY_RATES_TM cr ON
         s.dim_reporting_date_id = cr.currency_rate_date_key and
         s.base_currency_code = cr.currency_code';
   }
}

dependencies {
   dependency FactCurrencyRatesBase 100;
}
```

---

## What Gets Generated and How It Deploys

Confirmed by reading real files in the `tabmdl`/`tabmfw` components (not inferred):

- Each `.analysisdatasource` source file compiles to a `<Name>_analysisdatasource.ins` Oracle install script. `tabmdl/deploy.ini` lists this mapping for 100+ data sources, e.g.:
  ```ini
  File14=FactCurrencyRatesBase_analysisdatasource.ins
  File16=FactCurrencyRates_analysisdatasource.ins
  ```
  These `.ins` scripts are picked up by the standard IFS component installation framework like any other DDL/install script.
- At runtime, deployed data sources are tracked in `TM_*` warehouse tables (e.g. `tm_warehouse_model_data_srcs`, `tm_warehouse_drop_scripts`) and managed through `Tm_Data_Source_API` / `Tm_External_Db_Obj_Scripts_API` PL/SQL packages (component **TABMFW**).
- The actual deploy/redeploy/drop orchestration is driven by `tabmfw/source/tabmfw/database/TabularModelDeployer.plsvc`, which is the server side of the **Manage Tabular Models** admin page (`tabmfw/model/tabmfw/ManageTabularModels.client`). It builds and runs create/drop scripts for each data source, respecting the `deployment_order` declared via `sqlviews`/`dependencies`.

> [!tip] This is shared infrastructure with [[Analysis Model]]
> An `.analysisdatasource` doesn't do anything on its own — it has to be referenced by a `partition { datasource <Id>; }` block inside an [[Analysis Model]] table before it's loaded into the Tabular Model that SSAS actually serves.

---

## Unresolved: `RegionDivider`

One file in the grammar folder, `RegionDivider.llm`, doesn't fit anywhere above. Its only content is:

```
EBNF = "RegionName"
Description = ""
Explanation = ""
```

It's referenced as an optional element at four points in the top-level language EBNF (between the header, the `sqltable` block, `columnoverrides`/`indices`, and `sqlviews`/`dependencies` — see the original `get_language` output), which strongly suggests it's a named, foldable section-divider mechanism in the IDE (conceptually similar to the `---------------- SECTION ----------------` comment dividers used in `.projection` files, but apparently a real grammar token here rather than just a comment convention). Marble gives no keyword, no wrapping syntax, and no example — so the literal syntax for declaring one (is it a comment-like divider, a `region "Name" { }` block, something else?) could not be determined from this environment. Noted here rather than guessed at, per this vault's policy on unverified claims.

---

## See Also

- [[Analysis Model]] — the semantic layer built on top of one or more data sources
- [[Parquet Data Source]] — a separate, less-documented export mechanism for data lake consumption
- [[../Lobby/Lobby Data Source|Lobby Data Source]] — an unrelated, much simpler "data source" DSL — don't confuse the two
