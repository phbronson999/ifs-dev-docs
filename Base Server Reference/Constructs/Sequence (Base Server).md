---
title: Sequence (Base Server)
tags:
  - ifs-base-server
  - ifs-base-server/source
aliases:
  - sequence
  - SEQUENCE
  - IFS DB Sequence
related:
  - "[[Entity (Base Server)]]"
---

# Sequence (Base Server)

A ==Sequence== declares an Oracle database `SEQUENCE` — Marble's own description for this language is literally "IFS DB Sequence." Unlike `Entity`/`Enumeration`/`Utility`, it is **not** a standalone Developer Studio model file type (it doesn't appear in the New Model menu, and no `.sequence` file exists anywhere in this checkout). It's a grammar fragment that appears *inside* `.storage` files, alongside table/index DDL — confirmed by finding real usage in ten different `.storage` files across the checkout.

> [!info] Full parity with Marble's grammar source
> Checked against all 6 `.llm` files in Marble's `Sequence` grammar folder. It's a small, complete language — standard Oracle `CREATE SEQUENCE` syntax, just without the `CREATE` keyword.

> [!abstract] Syntax Skeleton
> ```marble
> SEQUENCE <SequenceName> IS
>    [INCREMENT BY <IncrementValue>]
>    [START WITH <StartValue>]
>    [MINVALUE <MinValue> | NOMINVALUE]
>    [MAXVALUE <MaxValue> | NOMAXVALUE]
>    [CYCLE | NOCYCLE]
>    [CACHE <CacheValue> | NOCACHE]
>    [ORDER | NOORDER]
>    [KEEP | NOKEEP]
>    [SESSION | GLOBAL]
> ;
> ```
> Every clause after `IS` is optional and order-independent (the grammar allows them in any order, repeated zero or more times each) — this is a direct mirror of Oracle's own `CREATE SEQUENCE` clause set.

---

## Keywords

None of these have `Description`/`Explanation` text from Marble — they're undocumented there because they're just standard Oracle SQL, not an IFS-specific abstraction. Glosses below are general Oracle knowledge, not sourced from Marble:

| Keyword | Meaning |
|---------|---------|
| `SEQUENCE <Name> IS ... ;` | Declares the sequence by name. |
| `INCREMENT BY <n>` | The value added to generate the next sequence number (negative values count down). |
| `START WITH <n>` | The first value the sequence will issue. |
| `MINVALUE <n>` / `NOMINVALUE` | Lower bound for the sequence; `NOMINVALUE` defers to Oracle's default minimum. |
| `MAXVALUE <n>` / `NOMAXVALUE` | Upper bound; `NOMAXVALUE` defers to Oracle's default (effectively unbounded for ascending sequences). |
| `CYCLE` / `NOCYCLE` | Whether the sequence wraps back to `MINVALUE` after hitting `MAXVALUE` (or errors instead). |
| `CACHE <n>` / `NOCACHE` | Pre-allocates `n` values in memory for performance; `NOCACHE` generates one at a time. |
| `ORDER` / `NOORDER` | Whether values must be generated in strict order across RAC instances (rarely needed outside RAC). |
| `KEEP` / `NOKEEP` | Whether the sequence is exempted from certain Oracle replication/Data Guard behaviors. |
| `SESSION` / `GLOBAL` | Session-scoped vs. globally-scoped sequence (an Oracle 18c+ session sequence feature). |

---

## Real Example (from `shpmnt/source/shpmnt/database/Shipment.storage`)

```marble
SEQUENCE SHIPMENT_SEQ IS MAXVALUE 999999999999999 INCREMENT BY 1 START WITH 1 NOCACHE;
```

In practice, IFS Cloud core usage is minimal — just `MAXVALUE`, `INCREMENT BY`, `START WITH`, and `NOCACHE`. None of the ten real `.storage` files found in this checkout (`JtTaskStep`, `JtTaskTransaction`, `JtTaskSurveyLog`, `ServiceBranch`, `Shipment`, `ShopOrderOperation`, `ShopOrderProp`, `MaintEvent`, `MroOnLog`, `DataCaptureSession`) used `CYCLE`, `ORDER`, `KEEP`, or `SESSION`/`GLOBAL` — those clauses are grammar-confirmed but not evidenced in actual IFS Cloud code.

---

## Why This Lives in `.storage`, Not Its Own File

`.storage` is documented in this section's [[../README|README]] as "Table and index DDL." A sequence is exactly that kind of database object — generated/maintained by hand alongside the `CREATE TABLE`/`CREATE INDEX` statements for the same Logical Unit, typically to back an `ID`-style key column. There's no dedicated "Sequence Model" because a sequence isn't a Logical Unit in its own right (no `.entity` registers it) — it's plumbing that `.storage` declares directly as plain SQL.

---

## See Also

- [[Entity (Base Server)]] — the Logical Unit a sequence's generated values typically populate (e.g. a key column's default)
- [[../README|Base Server Reference]] — the `.storage` file type this grammar lives inside
