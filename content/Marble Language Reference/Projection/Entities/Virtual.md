---
title: Virtual
publish: true
tags:
  - ifs-marble/projection
  - ifs-marble/construct
aliases:
  - virtual entity
  - virtual construct
  - dialog virtual
  - assistant virtual
related:
  - '[[Entity]]'
  - '[[Entityset]]'
  - '[[Structure]]'
  - '[[Action]]'
  - '[[Dialog]]'
  - '[[Assistant]]'
---

# Virtual

A ==virtual== is a projection construct that behaves like an [[Entity]] but is not backed by a real database table or LU API. Virtuals exist only in memory for the duration of a user interaction — they're the standard way to model the data for dialogs, assistants, and multi-step wizards.

Because virtuals have no underlying table, they cannot use `from` or inherit CRUD from an LU. All persistence logic is handled explicitly in [[Action|actions]] attached to the virtual or called from [[Commands and Expressions|client commands]].

Virtuals can be ==nested== — a parent virtual can have an `array` child relationship to another virtual. This models the parent/detail pattern inside dialogs (e.g., a header with a list of line items to distribute quantities across).

> [!abstract] Syntax
> ```marble
> -- Exposed as a named entry point:
> entityset <SetName> for <VirtualName>;
>
> virtual <VirtualName> {
>    crud = Read, Update;             -- optional; limits allowed operations
>    ludependencies = LuName1, LuName2;
>
>    attribute <AttrName> <Type> {
>       label = "...";
>       editable = [<expression>];
>       validate [<expression>] message "<error message>";
>    }
>    array <ChildArrayName>() to <ChildVirtual>();
>    action <ActionName> { ... }
>    reference <RefName>(<keys>) to <Entity>(<keys>);
> }
>
> virtual <ChildVirtualName> {
>    crud = Read, Update;
>    attribute <AttrName> <Type> { ... }
> }
> ```

---

## Keywords

| Keyword | Required | Description |
|---------|----------|-------------|
| `virtual` | Yes | Declares the virtual. |
| `crud` | No | Which OData operations to allow. Omit to allow all. `Read, Update` is common for dialog lines that can be edited but not created/deleted. |
| `ludependencies` | No | LUs whose client cache should be refreshed after a save through this virtual. Same semantics as on [[Entity]]. |
| `attribute` | No | Data fields. Supports the same sub-keywords as entity attributes, plus `validate`. |
| `validate` | No | Inline validation rule: `validate [<condition>] message "<msg>"`. Evaluated on the server when the row is saved. |
| `array` | No | Child virtual collection. Rendered in the client as a nested list inside the dialog/assistant. See [[References and Arrays]]. |
| `action` | No | Inline action that the user triggers inside the dialog. Common for "Apply" / "OK" operations. |
| `reference` | No | FK lookup for LOV. Same as [[Entity]] references. |

---

## Example — Parent + Child Virtuals for an Operation Split Dialog

> [!example] Source: `ifs-example/shpord/model/shpord/AdjustSoOperationSplitDialogHandling.projection`

```plvc
-- The entityset exposes the parent virtual to the client
entityset AdjustOperationSplitSet for AdjustOperationSplitVirtual;

-- Parent virtual: holds header-level data for the dialog
virtual AdjustOperationSplitVirtual {
   -- ludependencies: after the action, refresh ShopOrd and ShopOrderOperation in the client
   ludependencies = AdjustOpInSplitVirtual;

   attribute OrderNo Text {
      editable = [false];                  -- display-only; populated by input parameters
   }
   attribute ReleaseNo Text {
      editable = [false];
   }
   attribute SequenceNo Text {
      editable = [false];
   }
   attribute TotalQty Number {
      label = "Total Qty to Adjust";
      editable = [false];
   }
   attribute RemainingQty Number {
      label = "Remaining Qty to Adjust";
      editable = [false];
   }
   attribute UnitMeas Text;

   -- Array child: each element is an AdjustOpInSplitVirtual row
   -- Parentheses can hold key parameters to scope the child query
   array AdjustSplitOpArray() to AdjustOpInSplitVirtual();

   -- Inline action: user clicks "OK" in the dialog to trigger this
   action AdjustSplitQuantities {
      supportwarnings = [true];
      ludependencies = ShopOrd, ShopOrderOperation;
   }
}

-- Child virtual: one row per operation split line
virtual AdjustOpInSplitVirtual {
   crud = Read, Update;                   -- lines can be read and edited, not created/deleted

   attribute Contract Text {
      label = "Site";
      editable = [false];
   }
   attribute OperationNo Number {
      label = "Operation No";
      editable = [false];
   }
   -- Inline validation: prevents negative quantities
   attribute QtyToDistribute Number {
      label = "New Qty to Report";
      editable = [true];
      validate [QtyToDistribute >= 0] message "Negative values are not allowed";
   }
   attribute QtyScrapped Number {
      label = "Scrapped Qty";
      editable = [false];
   }
   -- Enumeration attribute: value maps to an enumeration definition
   attribute OperStatusCode Enumeration(OperStatusCode) {
      label = "Status";
      editable = [false];
   }
   attribute WorkCenterNo Text {
      label = "Work Center";
      editable = [false];
   }

   reference WorkCenterNoRef(Contract, WorkCenterNo) to WorkCenter(Contract, WorkCenterNo) {
      label = "Work Center";
   }
}
```

---

## Example — Virtual for a Scheduled Task Assistant

> [!example] Source: `ifs-example/shpord/model/shpord/AggregateShopOrderCostsperShopOrderHandling.projection` (inferred from client)

```plvc
-- Virtuals for assistants follow the same pattern
entityset TaskVirtuals for TaskVirtual;

virtual TaskVirtual {
   -- Holds scheduling parameters and execution state
   attribute ScheduleMethodId Number;
   attribute ScheduleName Text {
      label = "Task Name";
   }
   attribute TaskOption Text;
   attribute Site Text;
   attribute Result Text {
      editable = [false];
   }
   -- Params is a structure returned by GetParameters() function
   attribute Params Structure(ScheduleTaskParameters);
}
```

---

## Patterns & Tips

> [!tip] Virtual + Structure vs. Virtual + Virtual
> Use a [[Structure]] when you need to pass a fixed set of parameters to an action or function (like function return values). Use a child `virtual` when you need a list of editable rows inside a dialog (like quantity distribution lines). Structures can't be listed; virtuals can.

> [!tip] Always Declare `crud` on Child Virtuals
> Without a `crud` declaration on a child virtual, the framework defaults to allowing all operations, including Delete. Dialog line rows are rarely deletable — explicitly set `crud = Read, Update` to prevent the user from deleting lines they shouldn't be able to delete.

> [!warning] Virtuals Don't Persist — Actions Must Do the Work
> A virtual has no Save button behavior by default. Data entered in a virtual dialog only reaches the database when an [[Action]] is called (typically from the dialog's OK command). If you forget to wire up the action, user input is silently discarded.

> [!note] `validate` on Virtual Attributes Is Server-Validated
> The `validate [condition] message "..."` syntax on virtual attributes is enforced server-side when the record is saved. It's different from client-side `enabled` or `editable` conditions — the user can attempt to save but will get an error message if validation fails.

---

## See Also

- [[Entity]] — for database-backed, persistent data constructs
- [[Structure]] — for fixed parameter bags passed to actions/functions
- [[Entityset]] — wraps the virtual to expose it to a client page
- [[Action]] — the server-side logic triggered by dialog OK/Apply
- [[Dialog]] — the client UI construct that uses a virtual
- [[Assistant]] — multi-step UI wizard that uses a virtual
- [[References and Arrays]] — `array` for child virtual collections
