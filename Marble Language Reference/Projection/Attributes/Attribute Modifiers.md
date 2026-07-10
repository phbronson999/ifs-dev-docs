---
title: Attribute Modifiers
tags:
  - ifs-marble/projection
  - ifs-marble/construct
aliases:
  - attribute keywords
  - fetch
  - editable expression
  - format ifscurrency
  - attribute format
  - required expression
related:
  - "[[Entity]]"
  - "[[Query]]"
  - "[[Virtual]]"
  - "[[Structure]]"
  - "[[Enumeration]]"
---

# Attribute Modifiers

Attribute modifiers are the sub-keywords inside an `attribute` block that control how a field behaves — what data it maps to, how it's labeled, whether it's editable, how it's formatted, and what validation applies. They appear inside every entity, query, virtual, and structure.

```plvc
attribute <AttrName> <Type> {
   fetch    = "<expression>";
   label    = "<UI label>";
   maxlength = <n>;
   required = [<expression>];
   editable = [<expression>];
   insertable = [<expression>];
   format   = <uppercase|lowercase|ifscurrency|...>;
   validate [<condition>] message "<error>";
}
```

All modifiers are optional. An attribute with no body (`attribute OrderNo Text;`) inherits its defaults from the LU definition.

---

## Modifier Reference

### `fetch`

Overrides what the projection reads from the database for this attribute.

| `fetch` form | What it does |
|---|---|
| `"column_name"` | Maps to a database view column (snake_case) |
| `"Pkg_API.Get_Value(col1, col2)"` | Calls a PL/SQL function per row |
| `"SQL_expression"` | Any Oracle SQL expression (DECODE, NVL, TO_CHAR, etc.) |
| `"sys_guid()"` | Oracle built-in — generates a GUID |
| `"'literal'"` | Returns a hard-coded string |
| `"1"` | Returns a hard-coded number |

> [!note] `fetch` in Entities vs. Queries
> In a [[Query]], every attribute typically needs `fetch` because the projection maps to a view. In an [[Entity]] `@Override`, only add `fetch` when you're overriding the default column mapping or computing a new value. Don't repeat `fetch` for columns the LU already declares.

---

### `label`

```plvc
attribute DateCreated Timestamp {
   label = "Date Created";
}
```

The string shown as the column header or field label in Aurena. If omitted, IFS derives a label from the attribute name (PascalCase → space-separated words). Always set an explicit label for readability.

---

### `maxlength`

```plvc
attribute OrderNo Text {
   maxlength = 12;
}
```

Maximum number of characters for `Text` attributes. Controls the input field width hint in Aurena and the PL/SQL `VARCHAR2(n)` size in generated code. Required for any `Text` attribute that the user can edit.

---

### `required`

```plvc
attribute Contract Text {
   required = [true];
}

-- Conditional required (required only when creating a new record):
attribute LotBatchNo Text {
   required = [LotTracked = "TRUE"];
}
```

Boolean expression. When `true`, Aurena marks the field with a required indicator and blocks save if the field is empty. The expression is evaluated client-side.

---

### `editable`

```plvc
-- Always read-only:
attribute PartDescription Text {
   editable = [false];
}

-- Editable only when creating a new record (ETag is null for new rows):
attribute OrderNo Text {
   editable = [ETag = null];
}

-- Editable based on another field's value:
attribute IndirectJobId Text {
   editable = [Contract != null];
}
```

Boolean expression evaluated client-side. `ETag = null` is the standard pattern for "editable only on insert" — when a record already exists, the ETag header is populated, so the field becomes read-only.

---

### `insertable`

```plvc
attribute EmployeeId Text {
   editable = [false];
   insertable = [true];   -- allows init command to set this via "set EmployeeId = ..."
}
```

When `editable = [false]`, the attribute is locked from user input. Adding `insertable = [true]` allows the client `set` command (in an `init command` or `validate command`) to write to the field programmatically even though the user can't. Without `insertable = [true]`, `set` on a non-editable field is silently ignored.

---

### `format`

```plvc
attribute OrderNo Text {
   format = uppercase;     -- input is forced to uppercase
}

attribute LevelCost Number {
   format = ifscurrency;   -- rendered with the user's currency format settings
}
```

| Format value | Effect |
|---|---|
| `uppercase` | User input is automatically uppercased |
| `lowercase` | User input is automatically lowercased |
| `ifscurrency` | Number displayed with IFS currency symbol and decimal format |

---

### `validate` (Virtual attributes only)

```plvc
-- Server-side validation: user sees this message if condition is false
attribute QtyToDistribute Number {
   editable = [true];
   validate [QtyToDistribute >= 0] message "Negative values are not allowed";
}
```

Applies to [[Virtual]] and [[Structure]] attributes. The condition is checked server-side when the record is submitted. If the condition evaluates to false, the framework returns the message as an error and blocks the save.

> [!warning] `validate` Is Server-Side, `enabled`/`editable` Are Client-Side
> `validate [condition]` runs on the server when the user saves. It does not prevent the user from typing an invalid value — it catches it on submit. For real-time field disabling, use `editable = [expression]` instead (client-side, immediate).

---

## Complete Example — Many Modifiers in One Query

> [!example] Source: `ifs-example/shpord/model/shpord/ActualCostDetailsHandling.projection`

```plvc
query ShopOrderCostUtil {
   from = "so_actual_cost_details_uiv2";
   keys = OrderNo, ReleaseNo, SequenceNo, GuId;

   attribute OrderNo Text {
      fetch = "order_no";            -- maps to view column
      label = "Order No";
      maxlength = 12;
      required = [true];
      editable = [ETag = null];      -- only editable when inserting
      format = uppercase;            -- auto-uppercase input
   }
   attribute GuId Text {
      fetch = "sys_guid()";          -- synthetic key via Oracle function
      editable = [false];
   }
   attribute DateCreated Timestamp {
      fetch = "date_created";
      label = "Date Created";
      required = [true];
      editable = [false];            -- always read-only
   }
   -- Computed via PL/SQL API call:
   attribute TransactionDesc Text {
      fetch = "Mpccom_Transaction_Code_API.Get_Transaction(transaction_code)";
      label = "Transaction Desc";
      maxlength = 2000;
      required = [true];
   }
   -- Currency-formatted number:
   attribute LevelCost Number {
      fetch = "level_cost";
      label = "Total Level Cost";
      format = ifscurrency;
   }
   -- Always read-only + uppercase:
   attribute BucketPostingGroupId Text {
      fetch = "bucket_posting_group_id";
      label = "Posting Cost Group ID";
      maxlength = 20;
      editable = [false];
      format = uppercase;
   }
}
```

---

## Patterns & Tips

> [!tip] `ETag = null` Is the Canonical Insert-Only Pattern
> The `ETag` header is populated by the framework when a record exists in the database. For fields that should only be set at creation time (keys, initial classification), `editable = [ETag = null]` is idiomatic and understood by every IFS developer.

> [!tip] Omit `fetch` in `@Override` Entity Unless You're Changing It
> When you add `@Override entity SomeLu { attribute SomeAttr Text { label = "..."; } }`, you only need `fetch` if you're changing what the attribute maps to. If you just want to change the label, `maxlength`, or `editable`, you can omit `fetch` entirely.

> [!warning] Large `maxlength` Values Affect UI Layout
> Aurena uses `maxlength` as a hint for input field sizing. Setting `maxlength = 2000` on a field that holds short values will cause the field to render disproportionately wide in some layouts. Set `maxlength` to a realistic maximum, not the database column size.

---

## See Also

- [[Entity]] — attributes on LU-backed entities
- [[Query]] — attributes on read-only view queries
- [[Virtual]] — attributes on transient dialog/assistant entities
- [[Structure]] — attributes on parameter bags
- [[Enumeration]] — `Enumeration(<Name>)` as an attribute type
