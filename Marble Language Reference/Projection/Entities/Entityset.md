---
title: Entityset
tags:
  - ifs-marble/projection
  - ifs-marble/construct
aliases:
  - main entry point
  - entityset declaration
  - defaultwhere
related:
  - "[[Entity]]"
  - "[[Query]]"
  - "[[Virtual]]"
  - "[[Projection File Structure]]"
  - "[[Pages]]"
---

# Entityset

An ==entityset== is the named entry point that a client page binds to. It declares which entity, query, or virtual is the data source for a page, and optionally restricts the default data set with a `defaultwhere` clause. Every client `page` declaration references an entityset via `using <EntitysetName>`.

Think of an entityset as a named, filterable view over a projection construct — it's the bridge between the Aurena page and the server data.

> [!abstract] Syntax
> ```marble
> entityset <SetName> for <EntityOrQueryOrVirtual> {
>    defaultwhere = "<SQL WHERE clause fragment>";
> }
> ```
> The body block is optional. Without `defaultwhere` the entityset exposes all rows the entity/query returns.

---

## Keywords

| Keyword | Required | Description |
|---------|----------|-------------|
| `entityset` | Yes | Declares the entry point. The name is what the client `page ... using` refers to. |
| `for <Name>` | Yes | The entity, query, virtual, or [[Singleton]] this set exposes. |
| `defaultwhere` | No | A SQL WHERE fragment applied as the initial filter. Uses the database column names (snake_case), not attribute names. Parameters from the current context can be referenced with `:ParamName`. |

---

## Example — Basic Entityset with `defaultwhere`

> [!example] Source: `ifs-example/shpord/model/shpord/ActualCostDetailsHandling.projection`

```plvc
----------------------------- MAIN ENTRY POINTS -----------------------------

-- "Set" suffix is the naming convention for entitysets
entityset ShopOrderCostUtilSet for ShopOrderCostUtil {
   -- defaultwhere uses SQL column names (snake_case), not Marble attribute names
   -- This limits the initial page load to the last 100 days
   defaultwhere = "date_created BETWEEN (sysdate-100) AND (sysdate+1)";
}
```

The paired client page binds to this set:
```plvc
page List using ShopOrderCostUtilSet {
   label = "Shop Orders Actual Cost Details";
   startupmode = search;   -- user must search before data loads
   list ActualCostDetailsList;
}
```

---

## Example — Multiple Entitysets in One Projection

> [!example] Source: `ifs-example/shpord/model/shpord/BatchBalanceHandling.projection`

```plvc
----------------------------- MAIN ENTRY POINTS -----------------------------

-- Each entityset corresponds to a different entity or virtual in this projection
entityset BatchBalanceSet for BatchBalance;
entityset BatchBalanceNodeSet for BatchBalanceNode;
entityset BatchBalanceDemandAvailableSet for BatchBalanceDemandAvailable;
entityset ShopOrderPropVirtualSet for ShopOrderPropVirtual;  -- virtual for a dialog
```

---

## Example — Virtual Entityset (for Dialogs and Assistants)

When a projection powers a dialog or assistant (backed by a [[Virtual]] rather than a real table), the entityset still follows the same pattern:

```plvc
entityset AdjustOperationSplitSet for AdjustOperationSplitVirtual;
```

The client assistant then references it:
```plvc
assistant TaskAssistant using TaskVirtuals {
   ...
}
```

---

## Patterns & Tips

> [!tip] Naming Convention: Entity Name + "Set"
> Entitysets are almost always named by appending `Set` to the entity or query name: `BatchBalanceSet for BatchBalance`, `ShopOrderCostUtilSet for ShopOrderCostUtil`. Stick to this — Developer Studio autocomplete and code generation expect it.

> [!tip] `defaultwhere` Is the Right Place for Business-Driven Initial Filters
> Use `defaultwhere` for filters that should always apply on first open (e.g., date ranges, status filters, site restrictions). Don't put security filters here — use [[Action#`initialcheck`|initialcheck]] on actions and the entity's own security instead.

> [!warning] `defaultwhere` Uses Database Column Names, Not Marble Attribute Names
> Marble attribute names are PascalCase (`DateCreated`). The `defaultwhere` clause is raw SQL, so you must use snake_case column names (`date_created`). Getting this wrong causes a runtime error, not a compile error.

> [!note] One Entityset = One Client Page
> A single projection can expose many entitysets. Each one can be consumed by a separate `page ... using <SetName>` in the client. This is how a single projection file can back multiple tabs or detail pages.

---

## See Also

- [[Entity]] — the most common target of an entityset
- [[Query]] — read-only entity variant, also a valid entityset target
- [[Virtual]] — non-table-backed target, used for dialogs and assistants
- [[Pages]] — client construct that consumes an entityset via `using`
