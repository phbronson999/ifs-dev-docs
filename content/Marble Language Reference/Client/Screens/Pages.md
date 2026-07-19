---
title: Pages
publish: true
tags:
  - ifs-marble/client
  - ifs-marble/construct
aliases:
  - page declaration
  - List page
  - Form page
  - startupmode
  - bind
related:
  - '[[Entityset]]'
  - '[[List]]'
  - '[[Group]]'
  - '[[Navigator]]'
  - '[[Client File Structure]]'
---

# Pages

A ==page== is the top-level screen container in a client file. It binds to an [[Entityset]] (the data source) and declares which visual components — lists, groups, cards, charts — are displayed. Every page has a name, a data source (`using`), and at least one component.

Pages are navigated to either from a [[Navigator]] entry or programmatically via a `navigate` command.

> [!abstract] Syntax
> ```marble
> page <PageName> using <EntitysetName> {
>    label = "<Screen title>";
>    startupmode = <search|edit|...>;
>    editmode = <...>;
>
>    -- Components (choose one or combine):
>    list <ListName>;
>    group <GroupName>;
>    arrange { ... }
>
>    -- Nested / bound list:
>    list <ChildListName>(<ArrayName>) bind <ParentListName> {
>       display = Nested;
>    }
> }
> ```

---

## Keywords

| Keyword | Required | Description |
|---------|----------|-------------|
| `page` | Yes | Declares the page. Name must be unique within the client. Convention: `List`, `Form`, or a descriptive noun. |
| `using <EntitysetName>` | Yes | The [[Entityset]] this page reads from. The entityset must be declared in the projection. |
| `label` | No | Text shown in the Aurena breadcrumb / page title. |
| `startupmode` | No | Controls whether data loads immediately: `search` (user must search first), `edit` (opens directly editable). |
| `list <Name>` | No | Embeds a list component defined elsewhere in the client. |
| `group <Name>` | No | Embeds a group (form) component. |
| `arrange { }` | No | Side-by-side layout container holding multiple components. |
| `list <Child>(<Array>) bind <Parent>` | No | A detail list bound to the selected row of a parent list. The `<Array>` is an array name declared in the projection entity. |
| `display = Nested` | No | On a bound child list: renders it as an expandable nested section under each parent row rather than a separate panel. |

---

## Example — List-Only Page with `startupmode = search`

> [!example] Source: `ifs-example/shpord/model/shpord/ActualCostDetails.client`

```plvc
page List using ShopOrderCostUtilSet {
   label = "Shop Orders Actual Cost Details";
   -- startupmode = search: the page opens with an empty grid and a search bar
   -- Data only loads after the user submits a search filter
   startupmode = search;
   list ActualCostDetailsList;     -- the list component defined in the same file
}
```

---

## Example — Navigator Entry Opening a Specific Page

A page named `List` is the target when the navigator entry declares `page List`:

```plvc
navigator {
   entry ShopOrderActualCostDetailsNavEntry parent ShpordNavigator.ShopOrderActualCostNavEntry at index 900 {
      label = "Shop Orders Actual Cost Details";
      page List;   -- refers to the page named "List" in this client
   }
}
```

---

## Example — Page with a Master-Detail Nested List

> [!example] Source: `config/model/config/TiTraceback-Cust.client` (workspace — design pattern)

```plvc
-- Pattern: master list + bound child lists for traceback tree display
page TiTracebackOverviewPage using TiInspBridgeConnSet {
   list TiInspectionBridgeListExt;

   -- Bind: this list shows rows from StitchToFinBridgeArray for the selected inspection row
   list TiStitchToFinList(StitchToFinBridgeArray) bind TiInspectionBridgeListExt {
      display = Nested;   -- renders inside each parent row (expandable)
   }

   -- Further nesting: card rows for the selected stitch row
   list TiCardToStitchBridgeList(CardToStitchArray) bind TiStitchToFinList {
      display = Nested;
   }
   list TiWarpToStitchBridgeList(WarpToStitchArray) bind TiStitchToFinList {
      display = Nested;
   }
}
```

---

## Example — Form Page Navigated to Programmatically

When a command navigates to a form page on another client, the URL pattern is:

```plvc
command ShopOrderCostsCommand for ShopOrderCostUtil {
   label = "Shop Order Costs";
   enabled = [true];
   mode = SelectedRecords;
   bulkexecute {
      -- Navigate to another client's "Form" page, filtered by selected record keys
      bulknavigate "page/ShopOrderCosts/Form?$filter=OrderNo eq $[OrderNo] and ReleaseNo eq $[ReleaseNo] and SequenceNo eq $[SequenceNo]";
   }
}
```

The URL format is `page/<ClientName>/<PageName>?$filter=<OData filter>`.

---

## `arrange` — Side-by-Side Layout

Use `arrange { }` to place components side by side horizontally:

```plvc
page SomePage using SomeEntitySet {
   arrange {
      list LeftList;
      group RightGroup;
   }
}
```

> [!note] `arrange` Is a Layout Hint
> Aurena may override the side-by-side layout on small screens. `arrange` guarantees the intent but not the exact pixel layout.

---

## `remoteassistance`

"Declare that the page is enabled for Remote Assistance" — opts the page into IFS's Remote Assistance feature, defining what context gets sent to the person joining the remote session.

> [!abstract] Syntax
> ```marble
> page <PageName> using <EntitysetName> {
>    remoteassistance {
>       navigate {
>          page <TargetPage> {
>             filter(<Attr>, <Attr>);
>          }
>       }
>    }
> }
> ```

"Defines the context to send to the receiver" — the `navigate`/`switch navigate` action inside `remoteassistance` tells the receiving party which page (and filter context) to open when they join the session.

---

## Patterns & Tips

> [!tip] Page Name `List` and `Form` Are Conventions, Not Reserved Words
> You can name a page anything, but `List` (for grid views) and `Form` (for single-record detail views) are the universal IFS conventions. Navigation URLs in commands reference these names, so staying consistent matters.

> [!tip] `startupmode = search` for High-Volume Entities
> For entities that could return thousands of rows, always set `startupmode = search`. This prevents the page from loading all data on open and forces the user to filter first — critical for performance on Shop Order lists, inventory queries, etc.

> [!tip] Bound Lists Require Array Declarations in the Projection
> The `list Child(ArrayName) bind ParentList` syntax requires that the parent entity in the projection declares `array ArrayName(...) to ChildEntity(...)`. Without the projection array declaration, the bind has nothing to connect to.

> [!warning] `using` Must Reference a Declared Entityset
> The entityset name in `using <Name>` must be declared in the projection with `entityset <Name> for ...`. Referencing an undeclared entityset produces a build error. Remember: entitysets are in the projection, not the client.

---

## See Also

- [[Entityset]] — the data source the page binds to
- [[List]] — the list component used inside pages
- [[Group]] — the form group component
- [[Navigator]] — entries that open pages
- [[Commands and Expressions]] — `navigate` and `bulknavigate` for programmatic page navigation, plus `urlparameter`/`initcontext` for page URL parameters
- [[../Layout/Singleton|Singleton]] — for pages showing exactly one record instead of a list
- [[../Concepts/AI and Copilot|AI and Copilot]] — `aisettings`/`copilotprompt` at the page level
