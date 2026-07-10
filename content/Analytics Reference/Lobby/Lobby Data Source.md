---
title: Lobby Data Source
tags:
  - ifs-analytics
  - ifs-analytics/lobby
aliases:
  - lobbydatasource
  - SQLDataSource
related:
  - "[[Analysis Data Source]]"
---

# Lobby Data Source

A ==Lobby Data Source== defines a single SQL query that feeds one tile/element on an IFS Cloud Lobby page (a KPI number, a small list, a chart). It is the simplest of the three analytics mechanisms in this vault — there is no semantic model, no measures, no relationships, just a name, a database view, and a column list.

> [!abstract] Syntax Skeleton (per Marble grammar)
> ```marble
> lobbydatasource <ModelName>;
> component       <ComponentName>;
>
> name        <Name>;
> view        <ViewName>;
> [where      <Condition>;]
> [orderby    <Expression>;]
> [groupby    <Expression>;]
>
> author          <Author>;
> keywords        <Keywords>;
> descriptivetext <Text>;
> locked          <true|false>;
>
> column {
>    name     <DbColumnAlias>;
>    alias    <DisplayName>;
>    [datatype <Type>;]
> }
> -- column block repeats, one per displayed column
> ```

---

## Keywords

| Keyword | Required | Description |
|---------|----------|--------------|
| `lobbydatasource` | Yes | Model file name. |
| `component` | Yes | IFS component that owns the data source. |
| `name` | Yes | The data source's id, referenced by the Lobby element/tile that consumes it. |
| `view` | Yes | The Oracle view the data source selects from. |
| `where` | No | Filter predicate. |
| `orderby` | No | Sort expression. |
| `groupby` | No | Group-by expression. |
| `author`, `keywords`, `descriptivetext`, `locked` | No | Metadata fields — Marble has no description text for these, but they map to plain top-level properties. |
| `column { name; alias; datatype; }` | Repeats | One block per column the tile displays. `datatype` is optional. |

> [!warning] Marble's documentation for this language is grammar-only
> Unlike [[Analysis Data Source]], none of these keywords have a `Description`/`Explanation`/`SourceSample` in the Marble grammar server — only the bare EBNF token. The skeleton above is reconstructed from the grammar plus a real runtime XML example (see below), not from prose documentation.

---

## What Actually Ships: Runtime XML, Not `.lobbydatasource` Text Files

A full search of the IFS Cloud core checkout found **zero** `.lobbydatasource` text files anywhere, despite `lobbydatasource` being a real, registered Marble language. Every Lobby data source that actually ships in core is a raw exported XML file instead, named with an embedded GUID, e.g.:

```
timrep/server/lobby/datasources/Time_Remain_Auth_Week_Lobby - da084437-....datasource.xml
```

```xml
<SQLDataSource>
  <Author>IFS RnD</Author>
  <Component>TIMREP</Component>
  <Name>Time_Remain_Auth_Week_Lobby</Name>
  <ID>da084437-01ee-4d40-803a-ff257163be7a</ID>
  <Select>
    <DataColumn>
      <Column>REMAIN</Column>
      <Name>Remain</Name>
    </DataColumn>
  </Select>
  <View>Time_Remain_Auth_Week_Lobby</View>
</SQLDataSource>
```

This XML shape is exactly what the front-end **Lobby Designer**'s "Export" function produces. The element side (`*.element.xml`) works the same way — e.g. a `<Text>` element with `BodyText`, `WebUrl`, font and alignment properties.

> [!danger] Open question
> It is unconfirmed whether Developer Studio's compiler actually accepts a hand-written `.lobbydatasource` text file and turns it into this XML/runtime form, or whether the Marble grammar entry exists for some other reason (e.g. a newer SaaS-only authoring path not present in this on-prem checkout). No build script, compiler reference, or generated-output example was found to confirm either way.

---

## Practical Path for Customizations

Given the above, the proven way to add a Lobby tile (matching how every shipping core example does it) is:

1. Design the data source and element visually in the front-end **Lobby Designer**.
2. **Export** it — this produces the `*.datasource.xml` / `*.element.xml` (and `*.page.xml` for the page layout).
3. Check the exported XML into the component's `server/lobby/{datasources,elements,pages}/` folder.

Treat the `.lobbydatasource` text-DSL route as unverified until tested against a real Developer Studio build.

---

## See Also

- [[Analysis Data Source]] — the unrelated, much more heavily documented "data source" DSL for the Tabular Model / BI pipeline
- [[../README|Analytics Reference]] — why these mechanisms are kept separate in this vault
