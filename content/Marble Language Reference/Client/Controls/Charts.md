---
title: Charts
publish: true
tags:
  - ifs-marble/client
  - ifs-marble/construct
aliases:
  - bar chart
  - line chart
  - pie chart
  - funnel chart
  - chart controls
  - barchart
  - linechart
  - piechart
  - funnelchart
  - radarchart
  - stackedchart
  - chartsettings
  - colorpalette
  - constantline
related:
  - '[[Emphasis and Colors]]'
  - '[[List]]'
  - '[[Pages]]'
  - '[[Data Views]]'
---

# Charts

IFS Marble supports four chart types — bar, line, pie, and funnel — as first-class client constructs. Charts bind to an entity or query and use a consistent property set. They appear alongside lists and groups on pages, and support drill-down navigation when a slice or bar is clicked.

| Chart | Comparable to | Purpose |
|-------|--------------|---------|
| `barchart` | Chart.js Bar, D3 bar | Comparing values across categories |
| `linechart` | Chart.js Line, Recharts Line | Trending over time or ordered categories |
| `piechart` | Chart.js Pie/Doughnut | Proportional distribution |
| `funnelchart` | Funnel.js, Recharts Funnel | Stage-by-stage conversion / volume drop-off |

---

## Common Chart Properties

All four chart types share this core property set:

| Property | Type | Description |
|----------|------|-------------|
| `label` | String | Chart title; supports `${Attr}` interpolation |
| `filter` | Expression | Record filter: `filter = [Company = GlobalCompany];` |
| `details` | Page Reference | Drill-down: clicking a bar/slice navigates to a page |
| `collapsed` | Boolean | Starts collapsed: `collapsed = [true];` |
| `visible` | Boolean/Expression | Visibility condition |
| `emphasis` | Color expression | Series colors — see [[Emphasis and Colors]] |
| `crosshairs` | Boolean | Show crosshair lines on hover (`true` by default; bar and line only) |
| `centerlabel` | Boolean | Show sum total in center (pie and funnel only) |

---

## `barchart`

> [!abstract] Syntax
> ```marble
> barchart <Name> for <Entity> {
>    label     = "<title>";
>    filter    = [<condition>];
>    details   = <PageName>(<args>);
>    collapsed = [<boolean>];
>    crosshairs = [<boolean>];
>    visible   = [<expression>];
>
>    category <CategoryAttr>;     -- X-axis / bar groups
>    value    <ValueAttr>;        -- bar height
>    series   <SeriesAttr>;       -- optional: multiple bar series
>    emphasis <ColorConstant> = [<expression>];
> }
> ```

```plvc
barchart SalesPerRegionChart for SalesSummary {
   label  = "Sales by Region";
   filter = [FiscalYear = CurrentYear];

   category RegionName;
   value    TotalSales;
   emphasis Complementary3 = [true];    -- all bars blue

   details = RegionSalesPage("RegionCode eq $[RegionCode]");
}

-- Multi-series bar chart:
barchart BudgetVsActualChart for BudgetSummary {
   label    = "Budget vs. Actual";
   category Period;
   value    BudgetAmount;
   series   CategoryType;    -- groups bars by CategoryType within each Period
}
```

> [!tip] `details` Turns Charts into Navigation
> Adding `details = SomePage(...)` to a chart makes every bar/slice clickable. Clicking navigates to a filtered detail page. This is one of the most effective patterns for ERP dashboards — a chart is both a visualization and a navigation entry point.

---

## `linechart`

> [!abstract] Syntax
> ```marble
> linechart <Name> for <Entity> {
>    label      = "<title>";
>    filter     = [<condition>];
>    details    = <PageName>(<args>);
>    collapsed  = [<boolean>];
>    crosshairs = [<boolean>];
>    visible    = [<expression>];
>
>    category <CategoryAttr>;     -- X-axis
>    value    <ValueAttr>;        -- Y-axis (line height)
>    series   <SeriesAttr>;       -- optional: multiple lines
>    emphasis <ColorConstant> = [<expression>];
> }
> ```

```plvc
linechart OrderTrendChart for OrderHistory {
   label    = "Order Volume Trend";
   filter   = [CompanyId = Company];
   category OrderMonth;
   value    OrderCount;
   emphasis Complementary5 = [true];
}
```

---

## `piechart`

> [!abstract] Syntax
> ```marble
> piechart <Name> for <Entity> {
>    label       = "<title>";
>    filter      = [<condition>];
>    details     = <PageName>(<args>);
>    collapsed   = [<boolean>];
>    centerlabel = [<boolean>];    -- show sum in the donut hole
>    visible     = [<expression>];
>
>    category <CategoryAttr>;     -- slice labels
>    value    <ValueAttr>;        -- slice sizes
>    emphasis <ColorConstant> = [<expression>];
> }
> ```

```plvc
piechart OrdersByStatusChart for OrderSummary {
   label       = "Orders by Status";
   centerlabel = [true];    -- shows total count in the center

   category Objstate;
   value    RecordCount;
   emphasis StateOpen      = [Objstate = "Open"];
   emphasis StateReleased  = [Objstate = "Released"];
   emphasis StateClosed    = [Objstate = "Closed"];
}
```

---

## `funnelchart`

> [!abstract] Syntax
> ```marble
> funnelchart <Name> for <Entity> {
>    label       = "<title>";
>    filter      = [<condition>];
>    details     = <PageName>(<args>);
>    collapsed   = [<boolean>];
>    centerlabel = [<boolean>];
>    visible     = [<expression>];
>
>    category <CategoryAttr>;     -- stage labels
>    value    <ValueAttr>;        -- stage volumes
>    emphasis <ColorConstant> = [<expression>];
> }
> ```

```plvc
funnelchart SalesFunnelChart for SalesPipelineSummary {
   label    = "Sales Pipeline";
   category StageName;
   value    OpportunityCount;
   emphasis Complementary3 = [true];
}
```

---

## `radarchart`

A radar (spider) chart connected to a datasource — multiple value axes radiating from a center point.

> [!abstract] Syntax
> ```marble
> radarchart <Name> [for <Entity>] {
>    label = "<title>";
>    [visible = [<expression>];]
>    [orientation = ...;]
>    [collapsed = [<boolean>];]
>    [orderby = <Attr> asc;]
>    [emphasis ...;]
>    [transposed = [<boolean>];]
>    [height = <Value>;]
>    [fetchsize = <N>;]
>    [chartsettings <SettingsRef>;]
>    x { ... }
>    y { ... }
>    ( command <Name>; | commandgroup <Name>; )*
> }
> ```

```marble
radarchart Statistics for PersonInfo {
   x {
      value FirstName;
   }
   y {
      value Salary;
   }
}
```

## `stackedchart`

A bar/column chart where values stack on top of each other per category — supports full-stacked mode and crosshair tooltips.

> [!abstract] Syntax
> ```marble
> stackedchart <Name> [for <Entity>] {
>    label = "<title>";
>    [fullstacked = [<boolean>];]
>    [crosshairs = [<boolean>];]
>    [visible = [<expression>];]
>    [orientation = ...;]
>    [collapsed = [<boolean>];]
>    [orderby = <Attr> asc;]
>    [emphasis ...;]
>    [height = <Value>;]
>    [fetchsize = <N>;]
>    [enablesettings = [<boolean>];]
>    [chartsettings <SettingsRef>;]
>    [enablemultiselect = [<boolean>];]
>    [subscribable = [<boolean>];]
>    [card <CardRef>;]
>    x { ... }
>    y {
>       ...
>       topn = Count(<N>);   -- limit to top N series
>    }
>    ( command <Name>; | commandgroup <Name>; )*
> }
> ```

```marble
stackedchart Statistics for PersonInfo {
   x {
      label = "Name";
      value FirstName;
   }
   y {
      label = "Salary";
      value Salary;
      topn = Count(4);
   }
}
```

---

## `chartsettings` — Settings Dialog

"Enables the settings dialog" — a named, reusable configuration block referenced from a chart via `chartsettings <Ref>;` (see `radarchart`/`stackedchart` above), letting end users change which fields drive the X-axis, Y-axis, argument, value, group-by, or color-by at runtime instead of those being fixed at design time.

> [!abstract] Syntax
> ```marble
> chartsettings <SettingsName> {
>    ( xselector ... | yselector ... | argumentselector ... | valueselector ... | groupby ... | colorby ... )*
> }
> ```

### `argumentselector` / `valueselector`

Both are simple dropdown enablers for the settings dialog — "Argument/Value selector dropdown in the settings dialog. This can be used with Pie Charts."

```marble
argumentselector url=... {
   enabled = [<condition>];
}
valueselector url=... {
   enabled = [<condition>];
}
```

> [!info] `xselector`/`yselector`/`groupby`/`colorby` not detailed here
> `XselectorDefinition`, `YselectorDefinition`, `GroupByDefinition`, and `ColorByDefintion` (note: misspelled in the grammar itself) are the other four children of `chartsettings`. They already had some passing vault coverage before this pass and weren't part of this gap-filling round.

---

## `colorpalette`

A custom color palette, built by extending one of the design system's predefined palettes.

> [!abstract] Syntax
> ```marble
> colorpalette <Name> extends <SystemColorPaletteRef> {
>    columns = <N>;
>    colorvalue "<colorN>";   -- one or more, references a color slot from the base palette
> }
> ```

```marble
colorpalette FleetPalette extends Dataviz {
   columns = 3;
   colorvalue "color1";
}
```

## `colorsplit`

"Selects the colour of a particular bar depending on the available values in a specified column." Nests inside a `piechart`, or inside a chart's `x { }`/`y { }` block.

```marble
colorsplit {
   value <Attr>;
}
```

## `constantline`

"Enables vertical and horizontal line marks in charts" — a fixed reference line (e.g. a target or threshold) drawn across the chart. Nests inside `x { }` or `y { }`.

> [!abstract] Syntax
> ```marble
> constantline {
>    label = "<Value>";
>    value = "<Value>";
>    [pattern <PatternName> = [<condition>];]
>    [emphasis <Color> = [<condition>];]
>    [labelvisible = [<condition>];]
>    [visible = [<condition>];]
> }
> ```

```marble
constantline {
   label = "point x";
   value = "1";
   pattern linepattern1 = [true];
   emphasis Complementary6 = [true];
}
```

---

## Placing Charts on Pages

Charts are declared at the file level (alongside lists and groups) and then referenced by name on a page:

```plvc
-- Chart declaration:
barchart SalesChart for SalesSummary {
   label    = "Sales by Month";
   category SalesMonth;
   value    TotalAmount;
}

-- Page placement:
page DashboardPage using SalesSummarySet {
   label = "Sales Dashboard";
   arrange {
      SalesChart;          -- chart on the left
      list RecentOrdersList;   -- detail list on the right
   }
}
```

---

## Patterns & Tips

> [!tip] Pair a Chart with a `filter = [...]` to Scope Its Data
> Without a filter, a chart queries all records in its entity. This can be very slow and produce meaningless aggregations. Always scope to the relevant company, year, or context using `filter = [Company = GlobalCompany]` or similar.

> [!tip] Use `crosshairs = [false]` for Cleaner Pie Charts
> Crosshairs are useful for bar/line charts but irrelevant for pie/funnel. Set `crosshairs = [false]` on pie and funnel to avoid a visual artifact.

> [!warning] Chart Data Is Not Live
> Charts load data when the page opens. They don't auto-refresh. If the user modifies records and expects the chart to update, they must reload the page or navigate away and back.

> [!warning] `details` Page Reference Must Match Chart Entity
> The filter arguments in `details = SomePage("Attr eq $[Attr]")` reference attributes from the chart's entity (not the page's entity). Mismatching attributes causes navigation to the detail page with an empty or invalid filter.

---

## See Also

- [[Emphasis and Colors]] — emphasis color constants for chart series
- [[Pages]] — charts are placed on pages like any other component
- [[List]] — lists often accompany charts for drill-down detail
- [[Data Views]] — Timeline, Calendar, and Gantt for time-based data visualization
