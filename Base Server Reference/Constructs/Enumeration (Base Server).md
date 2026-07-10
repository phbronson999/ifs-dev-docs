---
title: Enumeration (Base Server)
tags:
  - ifs-base-server
  - ifs-base-server/model
aliases:
  - enumeration definition
  - base server enumeration
  - enumerationname
related:
  - "[[Entity (Base Server)]]"
  - "[[Enumeration]]"
---

# Enumeration (Base Server)

An ==enumeration== defines a fixed set of named values that represent a property in the application — a coded lookup table. Enumerations are used as attribute types in entities and as `Enumeration(Name)` typed attributes in projections.

Like the `.entity` file, the `.enumeration` file is **displayed as text in Developer Studio but stored as XML**. Do not edit it outside the IDE.

> [!abstract] Syntax Skeleton
> ```marble
> enumerationname <EnumName>;
> component       <COMPONENT>;
> [layer          <Ext|Cust>;]
>
> [codegenproperties {
>    TitleText "<display title>";
> }]
>
> values {
>    value <ValueName>;
>    value <ValueName>;
>    ...
> }
>
> [subsets {
>    subset <SubsetName> (<Value1>, <Value2>, ...);
> }]
> ```

---

## Keywords

| Keyword | Required | Description |
|---------|----------|-------------|
| `enumerationname` | Yes | The name of the enumeration. Must match the filename without `.enumeration`. |
| `component` | Yes | The IFS component that owns this enumeration. |
| `layer` | Cust only | `Ext` or `Cust` for customization layers. Omit for Core. |
| `values { }` | Yes | The complete list of valid value names. |
| `value` | Yes (inside `values`) | Declares one valid value. The name becomes a database string (usually uppercase). |
| `subsets { }` | No | Optional named subsets of the full value list. |
| `subset` | No (inside `subsets`) | Declares a named subset of values, useful for filtered dropdowns. |

---

## Example — Season Enumeration

```marble
enumerationname Season;
component       APPS8;
layer           Core;

codegenproperties {
   TitleText "Yearly season";
}

values {
   value Spring;
   value Summer;
   value Autumn;
   value Winter;
}

subsets {
   subset Warm (Spring, Summer, Autumn);
}
```

---

## Example — Order Status with Subsets

```marble
enumerationname ShopOrderStatus;
component       SHPORD;

values {
   value Planned;
   value Released;
   value Started;
   value PartiallyDelivered;
   value Delivered;
   value Closed;
   value Cancelled;
}

subsets {
   subset Active    (Planned, Released, Started, PartiallyDelivered);
   subset Finished  (Delivered, Closed);
   subset Closeable (Delivered);
}
```

---

## What Gets Generated

From the enumeration model, Developer Studio generates a PL/SQL package `<EnumName>_API` (or similar) with:
- Constants for each value
- A `Decode__` function to convert database values to display text
- A `Validate__` procedure for input validation
- LOV support queries filtered by any declared subsets

---

## Using Enumerations in Projections

In a `.projection` file, reference an enumeration as an attribute type:

```plvc
attribute OrderType Enumeration(ShopOrderStatus) {
   label = "Supply Type";
   editable = [false];
}
```

The projection enumeration block then defines the display labels:

```plvc
enumeration BatchBalanceOrderType {
   value "SHOPORDER" {
      label = "Shop Order";
   }
   value "PURORD" {
      label = "Purchase Order";
   }
}
```

> [!note] Two Different Enumeration Concepts
> The **base server enumeration** (`.enumeration` file) is the data model — it defines the valid codes stored in the database. The **projection enumeration** (inside a `.projection` file) maps those codes to display labels for the Aurena UI. They are separate constructs that work together.

---

## Patterns & Tips

> [!tip] Value Names Become Database Strings
> The `value` names you declare in the enumeration become the strings stored in the database column (usually as `VARCHAR2`). Keep them meaningful and avoid spaces — IFS convention uses PascalCase or `UpperCamelCase` value names.

> [!tip] Subsets Power Filtered LOVs
> Use subsets to restrict which values appear in a LOV dropdown based on context. For example, a "Closeable" subset showing only the values that are valid to close means the user never sees irrelevant options.

> [!warning] Stored as XML — Do Not Edit Outside the IDE
> The `.enumeration` file is XML. Opening it in a text editor shows raw XML, not the clean text syntax. Editing it directly will corrupt the model file.

---

## See Also

- [[Entity (Base Server)]] — entities use enumerations as attribute types
- [[Enumeration]] (projection) — how enumeration codes get display labels in Aurena
