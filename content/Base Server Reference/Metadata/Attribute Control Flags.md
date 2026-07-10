---
title: Attribute Control Flags
tags:
  - ifs-base-server
  - ifs-base-server/model
aliases:
  - attribute flags
  - AMIUL
  - KMI-L
  - flag string
  - control flags
related:
  - "[[Entity (Base Server)]]"
---

# Attribute Control Flags

Every attribute in a base server entity declaration ends with a **flag string** — a 5-character code that controls how the attribute behaves at runtime. The positions are fixed and always appear in the same order.

> [!abstract] Flag String Format
> ```marble
> Position:  1    2    3    4    5
> Meaning:   A    M    I    U    L
>            │    │    │    │    └─ LOV (appears in List of Values queries)
>            │    │    │    └───── Update (value can be changed after insert)
>            │    │    └────────── Insert (value can be set on insert)
>            │    └─────────────── Mandatory (must have a value)
>            └──────────────────── Alter (field is editable / shown for editing)
> ```
> A dash `-` in any position means **off** for that flag.
> `K` replaces position 1 for key attributes.

---

## Flag Meanings

| Flag | Position | Meaning when set |
|------|----------|-----------------|
| `A` | 1 | **Alter** — the attribute is exposed for editing. Without this, the field is effectively hidden from the UI. |
| `M` | 2 | **Mandatory** — the attribute must have a non-null value. The framework generates a mandatory check. |
| `I` | 3 | **Insert** — the value can be set when the record is first created. |
| `U` | 4 | **Update** — the value can be changed on existing records. |
| `L` | 5 | **LOV** — the attribute is included in List of Values queries. Required for the attribute to appear in LOV dropdowns in the Aurena UI. |
| `K` | 1 | **Key** — marks this as a primary key attribute. Replaces `A` in position 1. Keys are always mandatory and insert-only (position 4 is `-`). |
| `-` | any | **Off** — the flag is not set for this position. |

---

## Common Patterns

| Flag string | Typical use case |
|-------------|-----------------|
| `KMI-L` | **Primary key** — key, mandatory, set on insert, not updateable, included in LOV. The standard pattern for a sequence-backed key like `ActorId NUMBER(10)`. |
| `AMIUL` | **Mandatory editable** — shown for editing, required, insert + update, in LOV. Use for fields the user must always fill in (e.g., a name or code). |
| `A-IUL` | **Optional editable** — shown for editing, optional, insert + update, in LOV. The most common flag for regular fields. |
| `A----` | **Display/computed** — shown but not editable; set programmatically. Use for derived or system-managed values. |
| `A--UL` | **Update only** — not set on insert; can be edited after creation. Use for fields that are set later in the lifecycle. |
| `--I--` | **Insert-only hidden** — set on create, never shown or updated. Use for internal system fields (e.g., a created-by stamp set silently on insert). |
| `A-I-L` | **Optional, no update** — editable on create, locked afterwards, in LOV. Use for fields like an order type that can't change once set. |
| `AMIUL` with `K` prefix | Not valid — key attributes use `KMI-L`, not `KAMIUL`. |

---

## Reading the Flags in Code

```marble
-- In an entity attribute declaration:
key     ActorId    NUMBER(10)   KMI-L;
--                              ─────
--                              K = Key
--                               M = Mandatory
--                                I = Insert allowed
--                                 - = NOT updateable (keys are immutable)
--                                  L = appears in LOV queries

public  FirstName  TEXT(100)    AMIUL;
--                              ─────
--                              A = Alter (editable)
--                               M = Mandatory
--                                I = Insert allowed
--                                 U = Update allowed
--                                  L = in LOV queries

public  BirthDate  DATE         A-IUL;
--                              ─────
--                              A = Alter (editable)
--                               - = NOT mandatory (optional)
--                                I = Insert allowed
--                                 U = Update allowed
--                                  L = in LOV queries

public  Synopsis   TEXT(2000)   A;
--                              ─
--                              A = Alter (editable)
--                               (remaining positions default to -)
--                              Short form: just "A" is equivalent to "A----"
```

> [!note] Short-Form Flags
> You can omit trailing dashes. `A` is the same as `A----`. `KMI-L` cannot be shortened because the `-` in position 4 is significant (it distinguishes a key from an updateable attribute).

---

## How Flags Affect the UI

The flags primarily control the generated PL/SQL `ATTR_` string handling. The projection layer further constrains what the Aurena UI displays — for example, a projection `attribute` can override `editable = [false]` even if the base entity flag is `U`. **The base server flags are the maximum permissions; the projection can only restrict, not expand them.**

> [!warning] The `L` Flag and LOV Queries
> If an attribute lacks the `L` flag, it will **not** appear in generated LOV queries even if you declare a `reference` for it in the projection. A common debugging trap: the LOV dropdown is empty because the referenced entity's key attribute doesn't have `L` set.

---

## See Also

- [[Entity (Base Server)]] — where attribute flags are declared
- [[Entity (Base Server)]] (projection) — how projection attributes can further restrict base flags
