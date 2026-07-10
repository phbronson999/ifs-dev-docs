---
title: List
tags:
  - ifs-marble/client
  - ifs-marble/construct
aliases:
  - list component
  - list declaration
  - grid
  - editmode SingleCellEdit
  - orderby
related:
  - "[[Pages]]"
  - "[[Fields and LOV]]"
  - "[[Commands and Expressions]]"
  - "[[Group]]"
  - "[[References and Arrays]]"
---

# List

A ==list== is the Aurena grid component — it displays a collection of rows from an entity or query, with columns defined as `field` and `lov` declarations. Lists appear inside [[Pages]] or nested inside other lists via the `bind` mechanism.

Lists can be read-only, fully editable, or cell-editable depending on the `editmode`. They support ordering, commands (row-level action buttons), and inline LOV lookups.

> [!abstract] Syntax
> ```marble
> list <ListName> for <EntityOrQuery> {
>    orderby = <AttrName>;
>    editmode = <SingleCellEdit|MultiRowEdit|...>;
>    label = "<optional label>";
>
>    field <AttrName> {
>       size = <Small|Medium|Large|FullWidth>;
>       label = "<override label>";
>       multiline = true;
>    }
>    lov <RefName> with <Reference<TargetName>Selector> {
>       label = "<LOV label>";
>       size = <Small|Medium|Large>;
>       description = <RefName>.<DescriptionAttr>;
>    }
>    field <RefName>.<SubAttr> {
>       label = "<label>";
>       size = Small;
>    }
>    command <CommandName>;
> }
> ```

---

## Keywords

| Keyword | Required | Description |
|---------|----------|-------------|
| `list` | Yes | Declares the list. Name is referenced by `page` declarations and `bind` clauses. |
| `for <Entity>` | Yes | The entity or query whose rows this list displays. |
| `orderby` | No | Attribute name to default-sort by. Supports `asc`/`desc` and comma-separated columns. |
| `editmode` | No | `SingleCellEdit` (click a cell to edit), `MultiRowEdit` (all rows editable simultaneously). Omit for read-only. |
| `label` | No | Override label shown above the list. |
| `field` | No | A column displaying a single attribute. See [[Fields and LOV]]. |
| `lov` | No | A LOV (dropdown lookup) column. See [[Fields and LOV]]. |
| `field <Ref>.<Attr>` | No | A column displaying an attribute from a referenced entity (via dot notation). |
| `command` | No | Action button available on each row (or in bulk selection). See [[Commands and Expressions]]. |
| `card` | No | Attaches a card template — enables Card View and Avatar View. See [[Card and Sheet]]. |

---

## Field Size Options

| Size | Approximate width | Use for |
|------|---|---|
| `Small` | ~80px | Codes, numbers, short IDs |
| `Medium` | ~150px | Names, dates, descriptions |
| `Large` | ~250px | Long names, descriptions |
| `FullWidth` | 100% | Notes, long text fields |

---

## Example — List Page with LOV Fields and a Command

> [!example] Source: `ifs-example/shpord/model/shpord/ActualCostDetails.client`

```plvc
list ActualCostDetailsList for ShopOrderCostUtil {
   orderby = TransactionId;       -- default sort by TransactionId

   -- Simple fields: column displays the attribute value
   field OrderNo {
      size = Small;               -- compact column for short codes
   }
   field ReleaseNo {
      size = Small;
   }
   field Contract {
      size = Small;
   }
   field TransactionId {
      size = Small;
   }
   field DateCreated;             -- no size = default (Medium)
   field TransactionDesc;

   -- LOV field: shows InventoryPartRef as a linked lookup with description
   lov InventoryPartRef with ReferenceInventoryPartLov2Selector {
      label = "Part";             -- override the label from the projection
      size = Large;
      -- description pulls a second attribute from the referenced entity:
      description = InventoryPartRef.Description;
   }
   -- Dot-notation field: an attribute from the referenced InventoryPart entity
   field InventoryPartRef.UnitMeas {
      size = Small;
      label = "Unit of Measure";
   }

   lov CostBucketRef with ReferenceCostBucketSelector {
      label = "Cost Bucket";
      size = Medium;
      description = CostBucketRef.Description;
   }
   field Quantity {
      size = Small;
   }
   field LevelCost {
      size = Small;
   }
   field AccumCost {
      size = Small;
   }

   -- Dot-notation: attribute from the referenced entity (read-only column)
   field CostBucketRef.CostBucketType {
      size = Small;
      label = "Bucket Type";
   }

   lov WorkCenterNoRef with ReferenceWorkCenterSelector {
      label = "Work Center";
      size = Medium;
      description = WorkCenterNoRef.Description;
   }

   -- Command: appears as a row action button
   command ShopOrderCostsCommand;
}
```

---

## Example — Editable List Inside a Dialog or Assistant

> [!example] Source: `ifs-example/shpord/model/shpord/AddComponentsToTrackedStructureAssistant.client`

```plvc
list AddComponentsList for VrtUnassignedComponents {
   editmode = SingleCellEdit;     -- click a cell to edit it inline
   label = "";

   field QtyToAdd {
      -- editable expression: only editable when ComponentSerialNo is wildcard
      editable = [ComponentSerialNo = "*"];
   }
   field QtyAvailable {
      size = Small;
   }
   field ComponentPartNo;
   field ComponentSerialNo;
   field ComponentLotBatchNo;
}
```

---

## Nested (Bound) List in a Page

A list can display child records for the row selected in another list. The `list Child(ArrayName) bind Parent` pattern in the page declaration creates this:

```plvc
-- In the page declaration:
page TiTracebackPage using TiInspBridgeConnSet {
   list TiInspectionBridgeList;                             -- parent list

   list TiStitchToFinList(StitchToFinBridgeArray) bind TiInspectionBridgeList {
      display = Nested;                                    -- expands under each parent row
   }
}
```

The list itself is defined like any other list:
```plvc
list TiStitchToFinList for TiStitchToFinBridge {
   field GreigeHu {
      size = Small;
   }
   field GreigeRunTotalPerSourceUpper {
      size = Small;
   }
   field GreigeRunTotalPerSourceLower {
      size = Small;
   }
}
```

---

## Patterns & Tips

> [!tip] `field RefName.SubAttr` for Read-Only Related Data
> Use dot notation (`field CostBucketRef.CostBucketType`) to display attributes from a referenced entity without making that column editable or showing a LOV dropdown. It's cleaner than adding the attribute to the entity just to display it.

> [!tip] Put `description =` on LOV Fields to Show Both Code and Name
> Most IFS LOV entities have a `Description` or `Name` attribute. Setting `description = RefName.Description` on a `lov` field shows the description in a secondary column next to the code — a critical usability improvement users expect.

> [!tip] `command` at the Bottom of the List
> Commands on a list appear in the row's context menu / action bar. Multiple commands on the same list appear as separate buttons. Order them from most-used to least-used.

> [!warning] `lov` Requires a Selector Fragment
> A `lov RefName with ReferenceXSelector` only works if:
> 1. The projection declares `reference RefName(...) to X(...)`
> 2. The client (or fragment) includes `include fragment XSelector;`
> All three must be present or you'll get a build error. See [[References and Arrays]] and [[Projection File Structure]].

---

---

## Advanced List Properties

These properties control filtering, selection, view modes, column visibility, and save behavior.

### Data Filtering

```plvc
list OrderList for SalesOrder {
   -- Hard-coded filter: always applies, user cannot change it
   filter = [Company = GlobalCompany];

   -- Default filter: applied initially; user can change or remove it
   defaultfilter = [Objstate = "Open"];
   ...
}
```

| Property | Description |
|----------|-------------|
| `filter` | A server-side query condition **always** applied to the list data. The user cannot override it. Use for multi-tenant company scoping or context constraints. Equivalent to a fixed SQL `WHERE` clause. |
| `defaultfilter` | A query condition applied when the list first loads. The user can modify or clear it in the filter panel. Equivalent to a default pre-set filter that can be overridden. |

### Column Visibility and Priority

```plvc
list OrderList for SalesOrder {
   -- Priority order: when screen narrows, later columns hide first
   fieldranking OrderNo, CustomerName, OrderDate, Objstate;

   field OrderNo {
      size = Small;
   }
   field CustomerName {
      size = Medium;
   }
   field OrderDate {
      size = Small;
   }
   field Objstate {
      size = Small;
   }
   field InternalNotes  {
      columnvisible = false;    -- hidden by default; user can show it from column picker
   }
   field SystemId       {
      columnexclude = true;     -- never appears in the column picker at all
   }
}
```

| Property | Used on | Description |
|----------|---------|-------------|
| `fieldranking` | List | Comma-separated attributes in priority order. When the screen is too narrow to show all columns, lower-ranked columns are hidden first. Compare to: CSS `order` property for flex items. |
| `columnvisible = false` | Field inside a list | Column is hidden by default but appears in the user's column picker — they can opt in. Compare to: an HTML table column with `display:none` that's listed in the user's column preferences. |
| `columnexclude = true` | Field inside a list | Column never appears in the column picker at all. Use for internal IDs or technical attributes that should never be surfaced to users. |

> [!note] User Profile Overrides Ranking
> Column visibility settings are stored per-user. `fieldranking` and `columnvisible` only control the *default* state when a user first encounters the list. Once the user customizes their column view, those preferences persist.

### Row Selection and Summary

```plvc
list OrderList for SalesOrder {
   multiselect = [false];      -- single-row selection only
   preselect   = [true];       -- first row selected automatically on page load
   summary     = OrderQty, TotalAmount, LineCount;    -- totals row at the bottom
   ...
}
```

| Property | Default | Description |
|----------|---------|-------------|
| `multiselect` | `true` | When `false`, only one row can be selected at a time. Disables the checkbox column. Compare to: `selectionMode="single"` in AG Grid. |
| `preselect` | `false` | When `true`, the first record in the list is selected automatically when the page loads. Useful for master-detail pages where the detail always needs a selected row. |
| `summary` | None | Comma-separated attribute names. Adds a **totals row** at the bottom of the list. Values are calculated from the database (not just the visible page). Compare to: Excel `SUM` row, SQL `GROUP BY ROLLUP`. |

### View Modes

```plvc
list EmployeeList for Employee {
   initialview = CardView;     -- open in Card View instead of List View
   card        = EmployeeCard; -- required for CardView/AvatarView
   tile        = EmployeeList; -- enables Tile View option in the toolbar
   ...
}
```

| Property | Values | Description |
|----------|--------|-------------|
| `initialview` | `ListView` (default), `CardView`, `TileView`, `AvatarView`, `BoxMatrixView` | The view mode when the user first opens the list. Stored in user profile after first visit. Compare to: a default layout setting that users can override. |
| `card` | Card name | Attaches a card template, enabling `CardView` and `AvatarView`. See [[Card and Sheet]]. |
| `tile` | List name (self-reference) | Enables the `TileView` option in the toolbar. All columns display as tiles. |

### Save Behavior

```plvc
list OrderLinesList for OrderLine {
   editmode = SingleCellEdit;
   savemode = Buffer;           -- all changes held until explicit Save
   ...
}
```

| Value | Description |
|-------|-------------|
| `Default` | Each row is saved individually when focus moves away from it. |
| `Buffer` | All edits across all rows are buffered. Nothing saves until the user clicks **Save**. All changes commit or roll back as one transaction. Compare to: a form with a single Submit button vs. auto-save-on-blur. |
| `Unbound` | Commands can run on a dirty (unsaved) row without triggering an auto-save first. Only valid when `editmode = SingleCellEdit` or `SingleRowEdit`. Compare to: optimistic UI updates that don't wait for server confirmation. |

### CRUD Defaults

```plvc
list ChildLinesList for OrderLine {
   -- When creating a new child line, copy these keys from the parent record:
   copyoncruddefault(Company, OrderNo) to(Company, OrderNo);
   ...
}
```

`copyoncruddefault(<parent attributes>) to(<child attributes>)` specifies key mapping from the parent record to new child records created in the list. Without this, the user has to manually enter foreign key fields that should be auto-populated from the parent.

Compare to: a SQL `INSERT INTO child SELECT parent_key FROM parent WHERE ...` pattern, or a form that pre-fills a foreign key field from the parent context.

### Details Navigation

```plvc
list ActivityList for ProjectActivity {
   details = ActivityDetailsPage("ActivityNo eq $[ActivityNo] and ActivityType eq $[ActivityType]");
   -- Or external URL:
   details = "page/ActivityClient/ActivityDetailsPage?$filter=ActivityNo eq $[ActivityNo]";
   ...
}
```

`details = <PageName>(args)` adds a **Details** button to the list toolbar. Clicking it navigates to the specified detail page, filtered to the selected record(s). Equivalent to a "View Details" or "Open" button in a grid.

---

## Example — List with Advanced Properties

```plvc
list WorkOrderList for WorkOrder {
   orderby      = WorkOrderNo;
   editmode     = SingleCellEdit;
   savemode     = Default;
   filter       = [Company = GlobalCompany];
   defaultfilter = [Objstate = "Open"];
   fieldranking = WorkOrderNo, Description, Objstate, PlannedStart;
   multiselect  = [true];
   preselect    = [false];
   summary      = EstimatedHours, ActualHours;
   initialview  = ListView;
   card         = WorkOrderCard;
   details      = WorkOrderDetailPage("WorkOrderNo eq $[WorkOrderNo]");

   copyoncruddefault(Company, SiteId) to(Company, SiteId);

   field WorkOrderNo {
      size = Small;
   }
   field Description {
      size = Large;
   }
   field SiteId {
      size = Small;
   }
   field Objstate {
      size = Small;
      columnvisible = false;
   }
   field SystemCode {
      columnexclude = true;
   }

   badge Objstate {
      emphasis StateOpen      = [Objstate = "Open"];
      emphasis StateReleased  = [Objstate = "Released"];
      emphasis StateCompleted = [Objstate = "Completed"];
      emphasis StateClosed    = [Objstate = "Closed"];
   }

   command PrintWorkOrderCommand;
   command CloseWorkOrderCommand;
}
```

---

## `drag` — Drag-and-Drop Targets

"This block maps mandatory values that need to initiate the dragging record(s) from an element to another. Elements that are targets for receiving drops should be defined inside the block."

> [!abstract] Syntax
> ```marble
> list <Name> for <Entity> {
>    drag {
>       ganttchart {
>          duration <DurationAttr>;
>       }
>    }
> }
> ```

```marble
drag {
   ganttchart {
      duration JobDuration;
   }
}
```

Used to make list rows draggable onto a [[../Controls/Data Views#`ganttchart`|ganttchart]] — e.g. dragging an unscheduled job from a list onto the Gantt timeline to schedule it. `duration` maps the attribute that determines how long the dropped item should span once placed on the chart.

---

## `digitalsignature`

"Sets up digital signature" for the list's entity — distinct from the `signature` input field documented in [[../Controls/Input Controls#`signature`|Input Controls]], which captures a drawn signature image on a single record. This construct is list/group-level and works with a hash-based signed-content flag.

> [!abstract] Syntax
> ```marble
> list <Name> for <Entity> {
>    digitalsignature for <Datasource> {
>       hashcontent = [<SignedFlagCondition>];
>    }
> }
> ```

```marble
digitalsignature for AvExTaskAction {
   hashcontent = [SignedFlag = true];
}
```

Also valid inside a `group` (see [[Group]]).

---

## See Also

- [[Fields and LOV]] — deep dive on field and lov sub-keywords
- [[Pages]] — how lists are embedded in pages and bound to parents
- [[Commands and Expressions]] — commands that appear on list rows
- [[References and Arrays]] — `reference` declarations that power `lov` fields
- [[Group]] — form-style alternative to lists for single-record display
- [[Card and Sheet]] — card templates for Card View and Avatar View
- [[Selector and Search Context]] — `searchcontext` and `filter` for page-level search
