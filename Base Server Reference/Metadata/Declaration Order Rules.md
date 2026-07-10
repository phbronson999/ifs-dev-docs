---
title: IFS Base Server Reference
tags:
  - ifs-base-server
  - index
aliases:
  - Base Server Reference
  - Base Server Layer
related:
  - "[[IFS Marble Language Reference]]"
---

# IFS Base Server Reference

The **Base Server layer** is the foundation of every IFS Cloud component. It defines the business entities (Logical Units), enumerations, and utilities that the Aurena/Marble layer builds on top of. You cannot write a meaningful projection or client without understanding what the base server has already defined.

> [!info] Official Reference
> IFS maintains a generated reference at [developer.ifs.com — Base Server Syntax](https://developer.ifs.com/assets/pages/devstudioreference/generated/base/server/default.htm). Sub-pages require an IFS-approved browser session.

---

## The Critical XML Gotcha

> [!warning] These Files Look Like Text — They Are Actually XML
> `.entity` and `.enumeration` files appear to be text/code in Developer Studio. They are **not**. The IDE displays them in a text-like editor, but the underlying files are stored as **XML**. You cannot edit them as raw text files outside the IDE without corrupting them.
>
> `.overview` files are also XML, but are displayed as a **visual diagram** (boxes connected by lines) — you never see the underlying text at all.
>
> `.plsql`, `.views`, `.plsvc`, `.storage`, `.ddlsource`, `.dmlsource` are **real text files** that can be edited in any editor.

---

## File Types at a Glance

| Extension | Format | Purpose | Who creates it |
|-----------|--------|---------|----------------|
| `.entity` | XML (IDE text view) | Defines a Logical Unit — the core business object | Developer Studio model editor |
| `.enumeration` | XML (IDE text view) | Defines a fixed set of named values | Developer Studio model editor |
| `.utility` | XML (IDE text view) | Declares a stateless utility package | Developer Studio model editor |
| `.dbchange` | XML (IDE text view) | Database upgrade/migration change set | Developer Studio |
| `.overview` | XML (visual diagram) | Entity relationship diagram | Developer Studio diagram editor |
| `.plsql` | PL/SQL text | Oracle PL/SQL package — the business logic | Hand-coded |
| `.views` | SQL text | Oracle view definitions | Hand-coded or generated |
| `.storage` | SQL text | Table and index DDL | Hand-coded or generated |
| `.ddlsource` | SQL text | Additional DDL | Hand-coded |
| `.dmlsource` | SQL text | DML scripts (data patches) | Hand-coded |

---

## Layer Architecture

```marble
Aurena UI (.client / .fragment)
         │ consumes
         ▼
Projection API (.projection / .fragment)
         │ maps to PL/SQL via naming convention
         ▼
Service Implementation (.plsvc)
         │ calls
         ▼
Oracle PL/SQL Package (.plsql)  ◄── This is the Base Server layer
         │ reads/writes
         ▼
Oracle Database (.views / .storage / tables)
```

The Base Server layer is everything from `.plsql` downward. The entity model (`.entity`) is the design-time definition that **generates** the `.plsql` and `.views` skeleton — you then fill in the business logic by hand.

---

## Notes in This Vault

### Model Definitions (XML-backed)

```dataview
TABLE aliases, tags
FROM "Base Server Reference"
WHERE file.name != "README" AND contains(tags, "ifs-base-server/model")
SORT file.name ASC
```

### PL/SQL & Source Files

```dataview
TABLE aliases, tags
FROM "Base Server Reference"
WHERE file.name != "README" AND contains(tags, "ifs-base-server/source")
SORT file.name ASC
```

---

## Key Concepts

**Logical Unit (LU)** — The fundamental building block. An entity is a Logical Unit. Its PL/SQL package is named `<EntityName>_API`. Its database view is `<ENTITY_NAME>`. Every attribute in the entity becomes a column.

**Component** — The IFS module that owns the LU (e.g., `SHPORD`, `CONFIG`, `MPCCOM`). Every file declares which component it belongs to.

**Layer** — `Core` for IFS base code, `Ext`/`Cust` for customizations. Setting `layer Ext` or `layer Cust` signals that this file is a customization and should not be overwritten by IFS upgrades.

**Code Generation** — The entity/enumeration/utility model files are design artifacts. Developer Studio **generates** the PL/SQL package skeleton, view definitions, and table DDL from them. You then add business logic to the generated skeleton.

---

## See Also

- [[Entity]] — full entity reference
- [[Enumeration (Base Server)]] — enumeration definition
- [[Utility (Base Server)]] — utility package declaration
- [[Attribute Control Flags]] — decoding AMIUL, KMI-L, A-IUL etc.
- [[Overview Diagram]] — the visual entity relationship diagram
- [[PL-SQL Annotations]] — @Override, @Final, @SecurityCheck etc.
- [[Marble Language Reference]] — the Aurena/projection layer that builds on this
