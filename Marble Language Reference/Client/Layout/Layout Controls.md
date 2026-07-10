---
title: Layout Controls
tags:
  - ifs-marble/client
  - ifs-marble/construct
aliases:
  - arrange
  - section
  - fieldset
  - tabset
  - tab
  - panel
  - groupingfieldset
  - groupingfield
related:
  - "[[Pages]]"
  - "[[Group]]"
  - "[[List]]"
  - "[[Dialog]]"
  - "[[Card and Sheet]]"
---

# Layout Controls

Layout controls are structural containers in a `.client` file. They organize other controls into columns, collapsible sections, tabs, and visual groupings — but they do not display data themselves.

| Control | Comparable to | Purpose |
|---------|--------------|---------|
| `arrange` | CSS Flexbox row, `<div class="flex">` | Side-by-side horizontal layout |
| `section` | HTML `<details>`, accordion component | Collapsible group within a page |
| `fieldset` | HTML `<fieldset>`, form section | Labeled flat field grouping (non-collapsible) |
| `tabset` / `tab` | Browser tabs, React `<Tabs>` | Tab navigation within a page |
| `groupingfieldset` | Grouped form with sub-groups | Field grouping with nested `groupingfield` blocks |
| `panel` | Bordered content panel | Standalone bordered container |

---

## `arrange`

Groups two or more components horizontally side by side. Typically used inside a `page` to create multi-column layouts (a summary group + a detail list, for example).

> [!abstract] Syntax
> ```marble
> arrange {
>    <Component1>;
>    <Component2>;
>    ...
> }
> ```

```plvc
page OrderDetailPage using SalesOrderSet {
   -- Side by side: header form on left, line items on right
   arrange {
      group OrderHeaderGroup;
      list OrderLinesList;
   }
}
```

> [!note] Responsive Behavior
> On narrow viewports, Aurena may stack `arrange` columns vertically. The layout is a hint, not a guarantee — the framework is responsive. Compare to: CSS `flex-wrap`, Bootstrap `col-md-6`.

> [!tip] The Classic ERP Layout
> The most common usage is `arrange { group SummaryGroup; list DetailsListWithBind; }` — a summary form on the left with a bound child list on the right. This mirrors the standard master-detail layout seen in SAP Fiori, Salesforce record pages, and most enterprise UIs.

---

## `section`

A collapsible section within a page or dialog. The user can expand or collapse it by clicking the section header. Useful for separating primary data (always visible) from secondary data (collapsed by default).

> [!abstract] Syntax
> ```marble
> section <SectionName> {
>    label = "<Section header text>";
>    collapsed = [<boolean>];    -- true = starts collapsed; false = starts expanded
>
>    <contents: group, list, arrange, or other controls>
> }
> ```

```plvc
page CustomerPage using CustomerSet {
   group CustomerHeaderGroup;    -- always visible: core fields

   section ContactSection {
      label = "Contact Details";
      collapsed = [true];        -- collapsed by default; users expand if needed
      group ContactGroup;
   }

   section AuditSection {
      label = "Audit Information";
      collapsed = [true];
      group AuditGroup;
   }
}
```

> [!tip] Use `collapsed = [true]` for Secondary Data
> Primary data (the record's core fields) should never be in a collapsible section — users should see it immediately. Put audit info, optional details, and rarely-used fields in collapsed sections.
>
> Compare to: **Material UI Accordion** with `defaultExpanded={false}`, **Bootstrap Collapse**, HTML `<details>` element.

---

## `fieldset`

A flat, labeled grouping of fields within a `group` or `dialog`. Unlike `section`, a fieldset is not collapsible — it just provides visual separation and a sub-label within a form. Useful when a single `group` contains logically distinct areas.

> [!abstract] Syntax
> ```marble
> -- Used inside a group:
> fieldset <Name> {
>    label = "<Fieldset header>";
>    <field/lov declarations>
> }
> ```

```plvc
group CustomerGroup for Customer {
   label = "Customer";

   field CustomerName {
      size = Large;
   }
   field CustomerNo {
      size = Small;
   }

   fieldset BillingFieldset {
      label = "Billing Address";
      field BillingStreet {
         size = FullWidth;
      }
      field BillingCity {
         size = Medium;
      }
      field BillingPostalCode {
         size = Small;
      }
      field BillingCountry {
         size = Medium;
      }
   }

   fieldset ShippingFieldset {
      label = "Shipping Address";
      field ShippingStreet {
         size = FullWidth;
      }
      field ShippingCity {
         size = Medium;
      }
      field ShippingPostalCode {
         size = Small;
      }
   }
}
```

> [!note] Fieldset vs Section vs Group
> Use **`group`** for the top-level form container bound to an entity. Use **`fieldset`** to subdivide that form visually without creating a new entity binding. Use **`section`** to add collapsibility at the page level.
>
> Compare to: HTML `<fieldset>` + `<legend>`, a React `FormSection` wrapper component.

---

## `tabset` and `tab`

Groups components into tabs within a page. The user clicks tab headers to switch between panels. Each tab is an independent section with its own content.

> [!abstract] Syntax
> ```marble
> tabset {
>    tab <TabName1> {
>       label = "<Tab header>";
>       <contents>
>    }
>    tab <TabName2> {
>       label = "<Tab header>";
>       <contents>
>    }
> }
> ```

```plvc
page OrderDetailPage using SalesOrderSet {
   group OrderHeaderGroup;

   tabset {
      tab LinesTab {
         label = "Order Lines";
         list OrderLinesList;
      }
      tab DeliveryTab {
         label = "Delivery";
         group DeliveryGroup;
      }
      tab NotesTab {
         label = "Notes & Attachments";
         group NotesGroup;
      }
   }
}
```

> [!tip] Tabs vs Sections: When to Choose Which
> Use **tabs** when sections are mutually exclusive — the user views one at a time (order lines vs. delivery vs. notes). Use **sections** when sections might be viewed together but one is less important (core fields always visible, audit trail collapsed).
>
> Compare to: SPA routing patterns, **React Router** `<Tabs>`, browser native tab panels.

---

## `groupingfieldset` and `groupingfield`

An advanced form layout that groups fields into a visual grid with column headers. The `groupingfieldset` is the container; `groupingfield` defines one column of the grid.

> [!abstract] Syntax
> ```marble
> groupingfieldset <Name> {
>    label = "<outer label>";
>    groupingfield <FieldGroupName> {
>       label = "<column header>";
>       <field/lov declarations>
>    }
>    groupingfield <FieldGroupName2> {
>       label = "<column header>";
>       <field/lov declarations>
>    }
> }
> ```

```plvc
groupingfieldset QuantityBreakdown {
   label = "Quantities";
   groupingfield PlannedGroup {
      label = "Planned";
      field PlannedQty {
         size = Small;
      }
      field PlannedDate {
         size = Small;
      }
   }
   groupingfield ActualGroup {
      label = "Actual";
      field ActualQty {
         size = Small;
      }
      field ActualDate {
         size = Small;
      }
   }
   groupingfield VarianceGroup {
      label = "Variance";
      field VarianceQty {
         size = Small;
      }
   }
}
```

> [!note] When to Use `groupingfieldset`
> Use when you have parallel sets of fields that share a logical structure — planned vs. actual vs. variance, or multiple time period columns (Q1, Q2, Q3, Q4). Compare to: a comparison table in HTML, a styled `<table>` with column headers.

---

## `repeatingsection`

A container bound to an array attribute that repeats its content (a `list`, `markdowntext`, or `htmltext`) once per row — distinct from `list` itself, this is for repeating *mixed display content*, not a grid.

> [!abstract] Syntax
> ```marble
> repeatingsection <Name> for <Datasource> {
>    [orderby = <Attr> asc;]
>    ( list <Name> ...; | markdowntext { ... } | htmltext { ... } )*
> }
> ```

No Marble description beyond the grammar shape. See [[../Controls/Display Controls#`htmltext`|Display Controls → htmltext]] for the `htmltext` construct most commonly nested here.

---

## `resizablearrange`

A container variant of `arrange` whose panels can be resized by the user at runtime — "A container for an arranged set of individual visual items."

> [!abstract] Syntax
> ```marble
> resizablearrange {
>    [orientation = <Horizontal | Vertical>;]
>    [height = <Value>;]
>    [collapsed = [<condition>];]
>    [arrangeid = <Value>;]
>    -- content: map, gantt, list, etc.
> }
> ```

```marble
page ... {
   resizablearrange {
      map ...
      gantt ...
      list ...
   }
}
```

> [!tip] `resizablearrange` vs. plain `arrange`
> Plain `arrange` (documented above) is a fixed side-by-side layout declaration. `resizablearrange` is for the same idea but lets the end user drag to resize each panel at runtime — useful when combining a `map`/`ganttchart` with a `list` where neither panel has an obviously "correct" fixed width.

---

## Patterns & Tips

> [!tip] Page Structure Pattern: Header → Tabs → Detail
> A common IFS page pattern is: `group HeaderGroup` (always-visible key fields) → `tabset` (categorized sub-sections). This gives users immediate access to the core record data while organizing additional details into named tabs.

> [!warning] Don't Nest Sections Inside Tabs Inside Sections
> Deep layout nesting (section > tab > section) creates a confusing user experience. Keep the hierarchy flat: at most one level of tabs or sections within any given page area.

> [!warning] `arrange` Components Must Be Defined Elsewhere
> The identifiers inside `arrange { }` (like `list SomeList`) must be fully declared as standalone constructs in the same `.client` file (or included fragment). `arrange` is purely a placement declaration — not a definition.

---

## See Also

- [[Pages]] — where arrange, tabset, and section are declared
- [[Group]] — the form container placed inside layout controls
- [[List]] — grids placed inside layout controls
- [[Card and Sheet]] — card templates and sheet overlays
- [[Dialog]] — dialogs use fieldset and arrange for multi-column layouts
