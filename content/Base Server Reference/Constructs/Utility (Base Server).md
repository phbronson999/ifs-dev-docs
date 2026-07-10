---
title: Utility (Base Server)
tags:
  - ifs-base-server
  - ifs-base-server/model
aliases:
  - utility definition
  - utility logical unit
  - utilityname
related:
  - "[[Entity (Base Server)]]"
  - "[[Overview Diagram]]"
---

# Utility (Base Server)

A ==utility== (Utility Logical Unit) defines a stateless PL/SQL utility package. Unlike an entity, a utility has **no database table, no view, and no CRUD operations** — it is purely a container for PL/SQL procedures and functions that perform calculations, orchestrations, or cross-entity operations.

The `.utility` file is a model declaration stored as XML in the IDE. It is one of the simplest model types — it exists mainly to register the utility in the component's model inventory and to generate the package declaration skeleton.

> [!abstract] Syntax Skeleton
> ```marble
> utilityname <UtilName>;
> component   <COMPONENT>;
> [layer      <Ext|Cust>;]
>
> [codegenproperties {
>    TitleText "<display title>";
> }]
> ```

---

## Keywords

| Keyword | Required | Description |
|---------|----------|-------------|
| `utilityname` | Yes | Name of the utility. Must match the filename without `.utility`. |
| `component` | Yes | The IFS component that owns this utility. |
| `layer` | Cust only | `Ext` or `Cust` for customization layers. Omit for Core. |

---

## Example

```marble
utilityname CalculationUtil;
component   APPS8;
layer       Core;

codegenproperties {
   TitleText "Collection of calculation methods";
}
```

---

## What Gets Generated

The utility model generates:
- A PL/SQL package specification: `<UtilName>_SYS` (or `_UTIL` depending on convention)
- A skeleton package body

You hand-code all procedures and functions inside the generated skeleton. The generated spec is empty — it is your responsibility to add the procedure/function declarations to both the spec and the body.

---

## When to Use a Utility vs. an Entity

| Use | Reason |
|-----|--------|
| **Entity** | The concept has data that is persisted in the database (rows, columns, state). |
| **Utility** | The concept is purely behavioral — calculations, orchestrations, API wrappers, or logic that operates on entity data but has no data of its own. |

> [!tip] Utility Packages Show in Overview Diagrams
> Utilities appear as nodes in the [[Overview Diagram]] alongside entities. You can draw **Dependency** links from entities to utilities to document which entities a utility operates on.

---

## See Also

- [[Entity (Base Server)]] — the stateful counterpart
- [[Overview Diagram]] — utilities appear as nodes in the entity relationship diagram
