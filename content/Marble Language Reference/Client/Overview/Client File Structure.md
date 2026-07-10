---
title: Client File Structure
tags:
  - ifs-marble/client
  - ifs-marble/file-structure
aliases:
  - client header
  - client declaration
  - .client file
related:
  - "[[Projection File Structure]]"
  - "[[Navigator]]"
  - "[[Pages]]"
  - "[[Fragment]]"
---

# Client File Structure

A ==.client== file defines the Aurena UI for a single screen. It declares which projection it consumes, which fragments to include, the navigation entry point, and all visual components — pages, lists, groups, dialogs, assistants, and commands.

One client file consumes exactly one projection. The projection is the data contract; the client is the presentation layer.

> [!abstract] Syntax Skeleton
> ```marble
> client <ClientName>;
> component <COMPONENT>;
> layer <Core|Cust>;
> projection <ProjectionName>;
> description "<optional description>";
>
> include fragment <FragmentName>;
>
> ----------------------------- NAVIGATOR ENTRIES -----------------------------
> navigator { ... }
>
> -------------------------------- MAIN PAGES ---------------------------------
> page <PageName> using <EntitysetName> { ... }
>
> -------------------------------- ASSISTANTS ---------------------------------
> assistant <AssistantName> using <EntitysetName> { ... }
>
> --------------------------------- COMMANDS ----------------------------------
> command <CommandName> for <Entity> { ... }
>
> --------------------------------- SELECTORS ---------------------------------
> ---------------------------------- GROUPS -----------------------------------
> group <GroupName> for <Entity> { ... }
>
> ----------------------------------- LISTS -----------------------------------
> list <ListName> for <Entity> { ... }
>
> ----------------------------------- CARDS -----------------------------------
> ---------------------------------- DIALOGS ----------------------------------
> ---------------------------------- CHARTS -----------------------------------
> --------------------------------- CALENDARS ---------------------------------
> ---------------------------------- SHEETS -----------------------------------
> ----------------------------- STATE INDICATORS ------------------------------
> ----------------------------------- TREES -----------------------------------
> ---------------------------------- PLUGINS ----------------------------------
> ------------------------------- IMAGE VIEWERS -------------------------------
> ```

---

## Header Keywords

| Keyword | Required | Description |
|---------|----------|-------------|
| `client` | Yes | Names the client. Must match the filename (without `.client`). |
| `component` | Yes | The IFS component (e.g., `SHPORD`, `CONFIG`). |
| `layer` | Yes | `Core` for IFS code, `Cust` for customer customizations. |
| `projection` | Yes | The projection this client consumes. The projection must declare [[Entityset|entitysets]] that the client's pages reference via `using`. |
| `description` | No | Human-readable description shown in Developer Studio. |
| `include fragment` | No | Imports a named fragment's CLIENT FRAGMENTS section (dialogs, groups, selectors) and its PROJECTION FRAGMENTS section into the paired projection. |

---

## Section Comments

Developer Studio generates cosmetic section dividers. These organize the file into recognized zones. Keep them — they're used as navigation anchors by the tooling:

```plvc
----------------------------- NAVIGATOR ENTRIES -----------------------------
-------------------------------- MAIN PAGES ---------------------------------
-------------------------------- ASSISTANTS ---------------------------------
--------------------------------- COMMANDS ----------------------------------
--------------------------------- SELECTORS ---------------------------------
---------------------------------- GROUPS -----------------------------------
----------------------------------- LISTS -----------------------------------
----------------------------------- CARDS -----------------------------------
---------------------------------- DIALOGS ----------------------------------
---------------------------------- CHARTS -----------------------------------
--------------------------------- CALENDARS ---------------------------------
---------------------------------- SHEETS -----------------------------------
----------------------------- STATE INDICATORS ------------------------------
----------------------------------- TREES -----------------------------------
---------------------------------- PLUGINS ----------------------------------
------------------------------- IMAGE VIEWERS -------------------------------
```

---

## Example — Client File for a List Page

> [!example] Source: `ifs-example/shpord/model/shpord/ActualCostDetails.client`

```plvc
client ActualCostDetails;          -- matches filename ActualCostDetails.client
component SHPORD;                  -- Shop Order component
layer Core;                        -- IFS base code
projection ActualCostDetailsHandling;  -- consumes this projection

-- Import the LOV selector fragment for InventoryPart
include fragment InventoryPartLov2Selector;

----------------------------- NAVIGATOR ENTRIES -----------------------------

navigator {
   entry ShopOrderActualCostDetailsNavEntry parent ShpordNavigator.ShopOrderActualCostNavEntry at index 900 {
      label = "Shop Orders Actual Cost Details";
      page List;                   -- clicking this entry opens the List page
   }
}

-------------------------------- MAIN PAGES ---------------------------------

page List using ShopOrderCostUtilSet {   -- binds to entityset in the projection
   label = "Shop Orders Actual Cost Details";
   startupmode = search;          -- user must search before data loads
   list ActualCostDetailsList;    -- renders the list defined below
}

--------------------------------- COMMANDS ----------------------------------

command ShopOrderCostsCommand for ShopOrderCostUtil {
   label = "Shop Order Costs";
   enabled = [true];
   mode = SelectedRecords;        -- appears in the row action menu
   bulkexecute {
      bulknavigate "page/ShopOrderCosts/Form?$filter=OrderNo eq $[OrderNo] and ReleaseNo eq $[ReleaseNo]";
   }
}

----------------------------------- LISTS -----------------------------------

list ActualCostDetailsList for ShopOrderCostUtil {
   orderby = TransactionId;
   field OrderNo {
      size = Small;
   }
   field DateCreated;
   lov InventoryPartRef with ReferenceInventoryPartLov2Selector {
      label = "Part";
      size = Large;
      description = InventoryPartRef.Description;
   }
   command ShopOrderCostsCommand;
}
```

---

## Example — Client File for a Multi-Step Assistant

> [!example] Source: `ifs-example/shpord/model/shpord/AggregateShopOrderCostsperShopOrder.client`

```plvc
client AggregateShopOrderCostsperShopOrder;
component SHPORD;
layer Core;
projection AggregateShopOrderCostsperShopOrderHandling;

include fragment ScheduledTasksCommon;    -- provides shared assistant step groups
include fragment UserAllowedSiteLovSelector;

----------------------------- NAVIGATOR ENTRIES -----------------------------

navigator {
   entry AggregateShopOrderCostsPerShopOrderNavEntry parent ShpordNavigator.ShopOrderActualCostNavEntry at index 250 {
      label = "Aggregate Shop Order Costs per Shop Order";
      assistant TaskAssistant;            -- entry opens an assistant, not a page
   }
}

-- (Groups, assistant, and commands defined below — see Assistant.md)
```

---

## Patterns & Tips

> [!tip] Client Name = Screen Name, Projection Name = Screen Name + "Handling"
> By convention: `ActualCostDetails.client` consumes `ActualCostDetailsHandling.projection`. For dialogs launched from within a client, a separate `<DialogName>.client` + `<DialogName>Handling.projection` pair is common.

> [!tip] Customer Client Files Use `Ti` Prefix and `-Cust` Suffix
> Customer-layer client files follow `Ti<Feature>-Cust.client` with `layer Cust;`. The matching projection is `Ti<Feature>Handling-Cust.projection` (or the projection may be in a fragment).

> [!note] `include fragment` in Client vs. Projection
> When you write `include fragment X;` in a `.client` file, the framework pulls the CLIENT FRAGMENTS section of fragment X into this client, and the PROJECTION FRAGMENTS section into the paired projection. You do **not** separately include the fragment in the projection — the client's include handles both sides.

> [!warning] Don't Duplicate `include fragment` in Both Client and Projection
> If you put `include fragment X;` in both the `.client` and `.projection` files, you'll get duplicate symbol errors at build time. Include it in the client — that's sufficient.

---

## See Also

- [[Projection File Structure]] — the paired server-side file
- [[Navigator]] — navigator entry declarations
- [[Pages]] — page declarations inside the client
- [[List]] — list component declarations
- [[Group]] — group component declarations
- [[Fragment]] — how fragments supply reusable client sections
- [[Assistant]] — multi-step wizard declarations
