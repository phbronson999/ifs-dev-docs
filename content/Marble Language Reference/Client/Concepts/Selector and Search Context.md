---
title: Selector and Search Context
tags:
  - ifs-marble/client
  - ifs-marble/construct
aliases:
  - selector
  - searchcontext
  - search context
  - defaultsearchfields
  - pinnedsearchfields
  - requiredsearchfields
related:
  - "[[Pages]]"
  - "[[List]]"
  - "[[Fragment]]"
  - "[[Entityset]]"
---

# Selector and Search Context

These two constructs control how users **find** records to work with on a page, rather than how data is displayed.

| Control | Comparable to | Purpose |
|---------|--------------|---------|
| `selector` | Filter panel / search bar | Top-of-page record selector; filters which record the page displays |
| `searchcontext` | Advanced search / faceted filter | Named set of search fields controlling what the page queries |

---

## `selector`

A `selector` is a top-of-page control that lets the user choose the record(s) displayed on the page. It functions like a persistent header filter. On a detail (form) page, the selector is typically a dropdown or field that drives the main entity being shown.

A `selector` in a `.client` file references a `selector` construct defined in the projection or a fragment.

> [!abstract] Syntax
> ```marble
> -- Reference (in a page or group):
> selector <SelectorName>;
>
> -- Tree usage (reference to main entity selector):
> tree <Name> for <Entity> {
>    selector = <SelectorName>;
>    ...
> }
> ```

```plvc
-- Reference a selector on a page:
page ProjectDetailPage using ProjectSet {
   selector = ProjectSelector;
   group ProjectHeaderGroup;
   list ProjectLinesList;
}
```

The `selector` construct itself is defined in the projection or fragment (see [[Entityset]] and [[Fragment]]) — the `.client` file only references it by name.

> [!note] Selectors Are Defined in Projections
> A `selector` is not purely a client construct — it has both a projection-side definition (which entity/query it queries) and a client-side reference (where it appears on the page). The fragment pattern is common: a `XxxSelector.fragment` file contains both the projection entityset definition and the client selector layout.

---

## `searchcontext`

A `searchcontext` defines a named set of search fields that users fill in to filter a page's data. It is the IFS equivalent of an advanced search panel or a filter sidebar.

Unlike a browser URL query string or a direct `filter` property, the `searchcontext` is **user-controlled** — it renders as a visible form where users can enter filter criteria, and the page data reloads with those criteria applied.

> [!abstract] Syntax
> ```marble
> searchcontext <Name> for <Entity> {
>    label    = "<panel label>";
>    defaults = <DefaultFunctionName>();    -- function to fetch default values
>
>    defaultsearchfields  = <Attr1>, <Attr2>, ...;  -- shown upfront in the panel
>    pinnedsearchfields   = <Attr1>, <Attr2>, ...;  -- always visible, non-removable
>    requiredsearchfields = <Attr1>, <Attr2>, ...;  -- must be filled before search runs
>
>    field <AttrName> { size = ...; }
>    lov   <RefName> with <Selector> { ... }
>    ...
> }
>
> -- Reference in a page:
> page <PageName> using <EntitySet> {
>    searchcontext <SearchContextName>;
>    ...
> }
> ```

```plvc
-- Search context for a work order search page:
searchcontext WorkOrderSearch for WorkOrder {
   label    = "Search Work Orders";
   defaults = GetSearchDefaults();

   -- These appear immediately in the search panel:
   defaultsearchfields  = Company, WorkOrderNo, Objstate;
   -- This one can never be removed from the panel (always required context):
   pinnedsearchfields   = Company;
   -- Users must enter Company before the search runs:
   requiredsearchfields = Company;

   lov CompanyRef with ReferenceCompanySelector {
      label = "Company";
      size  = Small;
   }
   field WorkOrderNo {
      size = Small;
   }
   field Description {
      size = Large;
   }
   lov ObjtateRef with ReferenceWorkOrderStateSelector {
      label = "Status";
   }
   field PlannedStartDate {
      label = "Start Date From";
   }
   field PlannedEndDate {
      label = "Start Date To";
   }
}

-- Using the search context on a page:
page SearchPage using WorkOrderSet {
   label         = "Work Orders";
   startupmode   = search;
   searchcontext WorkOrderSearch;
   list WorkOrderList;
}
```

### Search Context Field Properties

| Property | Description |
|----------|-------------|
| `defaultsearchfields` | Fields shown immediately in the search panel when first opened. The user can add/remove others via the "Add filter" button. |
| `pinnedsearchfields` | Fields always shown in the panel and that cannot be removed by the user. Use for mandatory context (e.g., Company). |
| `requiredsearchfields` | Fields that must have a value before the search executes. The search button stays disabled until these are filled. |
| `defaults` | A server function called to pre-populate search field values when the page opens. |

> [!tip] `startupmode = search` + `requiredsearchfields` = Controlled Data Load
> Combine `startupmode = search` on the page with `requiredsearchfields = Company` in the search context. The page opens empty and won't load data until the user has selected a company. This prevents inadvertent full-table scans on high-volume entities.
>
> Compare to: A search page in SQL where `WHERE company_id = :company_id` is mandatory, enforced by the UI before the query fires.

> [!tip] `defaultsearchfields` Controls First-Time UX
> The search panel can have many fields, but showing all of them at once is overwhelming. `defaultsearchfields` sets which 2–4 fields appear immediately. The user can always expand to see more fields — but the defaults should be the fields 90% of searches need.

> [!warning] Search Context vs List `filter`
> `filter = [Company = GlobalCompany]` on a `list` is a **hard-coded server filter** the user cannot change. A `searchcontext` is a **user-controlled filter panel**. Use `filter` for context that should always apply (multi-tenant company scoping), and `searchcontext` for criteria that users set per search.

---

## Patterns & Tips

> [!tip] Fragment Pattern for Reusable Selectors
> Selectors used on multiple pages should be placed in a fragment file (`XxxSelector.fragment`). The fragment provides both the projection entityset (server side) and the client selector layout (UI side). Include it in each client file via `include fragment XxxSelector;`. See [[Fragment]].

> [!tip] `pinnedsearchfields` for Multi-Tenant Contexts
> In an IFS implementation with multiple companies, `pinnedsearchfields = Company` ensures Company is always visible and can never be accidentally removed from the filter. This is a critical guard against users inadvertently querying across company boundaries.

---

## See Also

- [[Pages]] — where `searchcontext` and `selector` are placed
- [[List]] — `filter` and `defaultfilter` for hard-coded list filters
- [[Fragment]] — selector fragment pattern for reusable selectors
- [[Entityset]] — the data source that selectors and search contexts query
