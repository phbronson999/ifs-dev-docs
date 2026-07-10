---
title: Navigator
tags:
  - ifs-marble/client
  - ifs-marble/construct
aliases:
  - navigator entry
  - navigator declaration
  - navigation tree
  - entry parent
related:
  - "[[Client File Structure]]"
  - "[[Pages]]"
  - "[[Assistant]]"
---

# Navigator

The ==navigator== block declares where a client's pages and assistants appear in the Aurena left-hand navigation tree. Each `entry` creates one node in the tree. Entries can be nested under existing parent nodes, placed at specific positions, and linked to either a `page` or an `assistant`.

The navigator hierarchy is global — all components contribute entries to a shared tree. Each entry must specify a `parent` that already exists (defined in another client or fragment), or be a root-level entry if it's a top-level menu item.

> [!abstract] Syntax
> ```marble
> navigator {
>    entry <EntryName> parent <ParentPath> at index <n> {
>       label = "<Display text>";
>       page <PageName>;         -- links to a page in this client
>       -- OR
>       assistant <AssistantName>;  -- links to an assistant
>       -- OR sub-entries:
>       entry <ChildEntryName>;
>       entry <ChildEntryName>;
>    }
> }
>
> -- Entry defined outside the navigator block (standalone):
> entry <EntryName> {
>    label = "<Display text>";
>    page <PageName>;
> }
> ```

---

## Keywords

| Keyword | Required | Description |
|---------|----------|-------------|
| `navigator` | Yes | Container for all navigator entries in this client file. |
| `entry` | Yes | One navigation node. The name must be unique across the entire component. |
| `parent` | Yes | Dot-path to the parent entry: `<ClientOrFragment>.<ParentEntryName>`. The parent must be defined in some other client or navigator fragment that is loaded at runtime. |
| `at index` | Yes | Integer position among siblings. Lower numbers appear higher in the list. Gaps (100, 200, 300) leave room for future insertions. |
| `label` | Yes | Text shown in the Aurena navigation tree. |
| `page <PageName>` | No | Links the entry to a page defined in this client. Clicking the entry opens that page. |
| `assistant <AssistantName>` | No | Links the entry to an assistant defined in this client. Clicking the entry opens the assistant. |
| Sub-`entry` | No | Child entries nested inside a parent entry. Used to create expandable sub-menus. |

---

## Example — Simple Navigator Entry Pointing to a List Page

> [!example] Source: `ifs-example/shpord/model/shpord/ActualCostDetails.client`

```plvc
navigator {
   -- ShopOrderActualCostDetailsNavEntry: unique entry name (per-component convention)
   -- parent: ShpordNavigator.ShopOrderActualCostNavEntry — defined in SHPORD's main navigator
   -- at index 900: position in the parent's child list
   entry ShopOrderActualCostDetailsNavEntry parent ShpordNavigator.ShopOrderActualCostNavEntry at index 900 {
      label = "Shop Orders Actual Cost Details";
      page List;      -- opens the "List" page defined in this same .client file
   }
}
```

---

## Example — Navigator Entry Pointing to an Assistant

> [!example] Source: `ifs-example/shpord/model/shpord/AggregateShopOrderCostsperShopOrder.client`

```plvc
navigator {
   entry AggregateShopOrderCostsPerShopOrderNavEntry parent ShpordNavigator.ShopOrderActualCostNavEntry at index 250 {
      label = "Aggregate Shop Order Costs per Shop Order";
      assistant TaskAssistant;   -- clicking this entry opens the multi-step wizard
   }
}
```

---

## Example — Customer Navigator with Sub-Entries and Inline Entries

> [!example] Source: `config/model/config/TiTraceback-Cust.client` (workspace)

```plvc
navigator {
   -- Root-level customer entry with nested sub-entries
   entry TiTracebackNavEntry parent TiCustomizationNavigatorRoot.TiCustomizationRootNavEntry at index 103 {
      label = "Traceback";
      -- Sub-entries reference named entries defined below (outside the navigator block)
      entry TiCardingBridgeNavEntry;
      entry TiWarpingBridgeEntry;
      entry TiStitchbondBridgeEntry;
      entry TiFinishingBridgeNavEntry;
      entry TiInspectionBridgeNavEntry;
      entry TiTracebackOverviewNavEntry;
   }
}

-- Entries defined outside the navigator block are referenced by name above
entry TiCardingBridgeNavEntry {
   label = "Carding Bridge";
   page TiCardingBridgePage;      -- opens the page defined in the same or included fragment
}
entry TiWarpingBridgeEntry {
   label = "Warping Bridge";
   page TiWarpingBridgePage;
}
entry TiStitchbondBridgeEntry {
   label = "Stitchbond Bridge";
   page TiStitchbondBridgePage;
}
entry TiFinishingBridgeNavEntry {
   label = "Finishing Bridge";
   page TiFinishingBridgePage;
}
entry TiTracebackOverviewNavEntry {
   label = "Traceback Overview";
   page TiTracebackOverviewPage;
}
```

---

## Patterns & Tips

> [!tip] Index Gaps Give You Room to Insert Later
> Use index values 100, 200, 300 (or 10, 20, 30 for fine-grained control) rather than 1, 2, 3. This lets you insert new entries between existing ones without renumbering. IFS Core entries typically use multiples of 50 or 100.

> [!tip] Define Sub-Entries Outside the Navigator Block
> When a parent entry has many children, define the child entries as standalone `entry` blocks below the `navigator { }` block and just reference their names inside the parent. This keeps the navigator block readable and allows entries to be reused in multiple navigator contexts.

> [!tip] Entry Names Must Be Globally Unique Within a Component
> Navigator entry names are scoped to the component. If two `.client` files in the same component declare an entry with the same name, you'll get a build error. Prefix customer entries with your organization prefix (e.g., `Ti`) to avoid collisions.

> [!warning] `parent` Path Must Resolve at Runtime
> The `parent` path (`SomethingNavigator.SomeEntry`) must exist when the Aurena UI loads. If the referenced parent component is not deployed, your entry won't appear — with no error shown. Verify the parent path exists in the target environment.

> [!note] Entries Can Point to Pages in Included Fragments
> A client's navigator entry can point to a `page` defined in an included fragment. The page just needs to exist within the scope of the client at runtime — whether it's defined inline or imported via `include fragment`.

---

## See Also

- [[Client File Structure]] — where navigator blocks are declared
- [[Pages]] — the pages that navigator entries point to
- [[Assistant]] — assistants that navigator entries can open
