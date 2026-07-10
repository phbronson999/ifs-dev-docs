---
title: Enumeration
tags:
  - ifs-marble/projection
  - ifs-marble/construct
aliases:
  - enumeration definition
  - enum
  - Enumeration() type
related:
  - "[[Entity]]"
  - "[[Query]]"
  - "[[Virtual]]"
  - "[[Attribute Modifiers]]"
---

# Enumeration

An ==enumeration== defines a fixed set of named values for an attribute. When an attribute's type is declared as `Enumeration(<Name>)`, Aurena renders it as a dropdown list, and the projection ensures only valid values can be saved.

Enumerations are defined in the projection file (or fragment) and then referenced by attribute declarations throughout that projection. Each value in the enumeration has:
- A `value` — the human-readable string stored in the database
- An `identifier` — the PascalCase name used in code (conditions, comparisons)
- A `label` — the text shown in the Aurena UI (usually same as value)

> [!abstract] Syntax
> ```marble
> enumeration <EnumName> {
>    value = "<db_string>" {
>       identifier = "<PascalCaseName>";
>       label = "<UI display text>";
>    }
>    value = "<db_string>" {
>       identifier = "<PascalCaseName>";
>       label = "<UI display text>";
>    }
>    ...
> }
> ```
>
> Then reference it in an attribute:
> ```marble
> attribute <AttrName> Enumeration(<EnumName>) {
>    label = "...";
>    editable = [<expression>];
> }
> ```

---

## Keywords

| Keyword | Required | Description |
|---------|----------|-------------|
| `enumeration` | Yes | Declares the enumeration. Name is referenced as the type in attribute declarations. |
| `value` | Yes | The string value stored in the database column. |
| `identifier` | Yes | PascalCase code name used in client-side conditions (e.g., `enabled = [Status = "NotBalanced"]`). |
| `label` | Yes | Text displayed in the Aurena dropdown. Usually same as `value`. |

---

## Example — Balance Status Enumeration

> [!example] Source: `ifs-example/shpord/model/shpord/BatchBalanceHandling.projection`

```plvc
------------------------------- ENUMERATIONS --------------------------------

enumeration BalanceStatusEnum {
   value = "Not Balanced" {
      identifier = "NotBalanced";        -- used in client conditions: [Status = "NotBalanced"]
      label = "Not Balanced";            -- shown in Aurena dropdown
   }
   value = "Partially Balanced" {
      identifier = "PartiallyBalanced";
      label = "Partially Balanced";
   }
   value = "Over Balanced" {
      identifier = "OverBalanced";
      label = "Over Balanced";
   }
   value = "Completely Balanced" {
      identifier = "CompletelyBalanced";
      label = "Completely Balanced";
   }
}
```

The enumeration is then used as an attribute type:

```plvc
-- In the entity or virtual that uses this enumeration:
attribute BalanceStatus Enumeration(BalanceStatusEnum) {
   label = "Balance Status";
   editable = [false];
}
```

And in an action parameter:

```plvc
action ConnectSupplyToBalance {
   parameter OrderType Enumeration(BatchBalanceOrderType);  -- another enum used as param type
   ...
}
```

---

## Example — Enumeration on a Virtual Attribute

> [!example] Source: `ifs-example/shpord/model/shpord/AdjustSoOperationSplitDialogHandling.projection`

```plvc
virtual AdjustOpInSplitVirtual {
   crud = Read, Update;
   ...
   -- Enumeration type on a virtual attribute: renders as a read-only dropdown in the dialog
   attribute OperStatusCode Enumeration(OperStatusCode) {
      label = "Status";
      editable = [false];
   }
   attribute WorkCenterCode Enumeration(WorkCenterCode) {
      editable = [false];
   }
}
```

---

## Using Enumeration Values in Client Conditions

Once an attribute is typed as `Enumeration(...)`, you reference its `identifier` (not its `value`) in client-side `enabled`, `visible`, and `editable` expressions:

```plvc
-- Client command or field:
command ReleaseCommand for BatchBalance {
   enabled = [BalanceStatus = "CompletelyBalanced"];   -- use the identifier
   execute { ... }
}

-- Visibility driven by enum value:
field SomeField {
   visible = [OrderType = "ShopOrder"];
}
```

> [!note] Identifier vs. Value in Conditions
> In client-side conditions, compare against the `identifier` string (the PascalCase one), **not** the `value` string stored in the database. The Marble runtime translates identifiers to database values automatically. Using the raw database value in a condition will silently fail.

---

## Patterns & Tips

> [!tip] Prefer Enumerations Over Raw Text for Status Fields
> If an attribute has a fixed set of valid values (status, type, category), define it as an enumeration rather than a plain `Text` attribute. You get a free dropdown in the UI, type safety in conditions, and clear documentation of what values are valid.

> [!tip] Naming Convention: Enum Name + "Enum" Suffix
> IFS convention appends `Enum` to enumeration names: `BalanceStatusEnum`, `OrderTypeEnum`. Some older code omits the suffix (e.g., `OperStatusCode`). Either works, but consistency within your project matters.

> [!warning] Enumerations Are Not Validated in the Database
> The database column stores the raw `value` string (e.g., `"Not Balanced"`). Oracle doesn't know about the enumeration — there's no CHECK constraint. Validation happens only in the Marble/PL/SQL layer. If you insert a row with a raw SQL script, you can bypass the enumeration.

---

## See Also

- [[Attribute Modifiers]] — how `Enumeration(<Name>)` appears in attribute blocks
- [[Entity]] — where enumeration attributes most often appear
- [[Virtual]] — enumeration attributes on virtual dialogs
- [[Action]] — enumerations as action parameter types
