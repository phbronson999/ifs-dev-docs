---
title: Data Views
tags:
  - ifs-marble/client
  - ifs-marble/construct
aliases:
  - timeline
  - calendar
  - gantt chart
  - gantchart
  - tree
  - tree diagram
  - treediagram
  - box-matrix
  - boxmatrix
  - kanbanboard
  - map
  - imageviewer
  - jsonviewer
  - xdviewer
  - objectconnection
  - yearview
  - data visualization
related:
  - "[[Emphasis and Colors]]"
  - "[[Card and Sheet]]"
  - "[[Charts]]"
  - "[[List]]"
  - "[[Pages]]"
---

# Data Views

Data views display records in specialized time-based, hierarchical, spatial, or matrix layouts. They are alternatives to the standard grid (list) for data that has a natural time, relationship, or matrix structure.

| Control | Comparable to | Purpose |
|---------|--------------|---------|
| `timeline` | React Timeline, Ant Design Timeline | Chronological event log per record |
| `calendar` | FullCalendar, Google Calendar embed | Scheduled events on a calendar grid |
| `ganttchart` | Gantt libraries (DHTMLX, Bryntum) | Project scheduling with dependencies |
| `tree` | React Tree (rc-tree), jsTree | Hierarchical parent-child navigation |
| `treediagram` | OrgChart, React Flow | Visual org chart / network diagram |
| `boxmatrix` | 9-box talent grid | Records grouped into a 2-axis box matrix |
| `kanbanboard` | Kanban board (Trello columns) | Drag-and-drop cards across status columns |
| `map` | Mapbox / Google Maps embed | Pins, routes, and clusters on a geographic map |
| `imageviewer` / `jsonviewer` / `xdviewer` | Lightbox / JSON viewer / 3D model viewer | Specialized viewers for images, raw JSON, and XD/3D models |
| `objectconnection` | N/A (IFS-specific) | Cross-object attachment/connection panel |
| `yearview` | Full year calendar | Year-at-a-glance scheduling view |

---

## `timeline`

Displays records as a chronological log — one entry per record, sorted by a date attribute. Used for activity feeds, event histories, or audit trails on a detail page.

> [!abstract] Syntax
> ```marble
> timeline <Name> for <Entity> {
>    label     = "<title>";
>    date      = <DateAttr>;       -- attribute that defines the time position (required)
>    header    = <AttrName>;       -- title of each entry
>    field     = <AttrName>;       -- body text of each entry
>    collapsed = [<boolean>];
>    details   = <PageName>(<args>);
>    emphasis <ColorConstant> = [<expression>];
>    visible   = [<expression>];
>    legends   { ... }             -- optional: legend definition
>    preview   { ... }             -- optional: hover preview
> }
> ```

```plvc
timeline OrderActivityLog for OrderActivity {
   label  = "Activity History";
   date   = ActivityDate;      -- positions entries on the time axis
   header = ActivityType;      -- bold entry title
   field  = Description;       -- entry body text
   emphasis Complementary3 = [ActivityType = "Create"];
   emphasis Complementary9 = [ActivityType = "Modify"];
   emphasis Complementary1 = [ActivityType = "Delete"];
}
```

> [!note] `date` Is Required
> The `date` attribute must be of type `DATE`, `TIMESTAMP`, or `TIME`. It positions the entry chronologically. Without it, the timeline has no ordering.

---

## `calendar`

A full calendar view displaying records as events on date/time slots. Supports day, week, work-week, month, and timeline views. Used for scheduling, absence management, production planning.

> [!abstract] Syntax
> ```marble
> calendar <Name> for <Entity> {
>    label      = "<title>";
>    start      = <TimestampAttr>;    -- event start time (required)
>    end        = <TimestampAttr>;    -- event end time
>    startdate  = <DateAttr>;         -- DATE variant (no time component needed)
>    enddate    = <DateAttr>;
>    allday     = [<expression>];     -- true: event spans whole day
>    alldaylabel = "<label>";
>    fetchsize  = <N>;                -- max records loaded (default: 500)
>    card       = <CardName>;         -- popup card on event click
>
>    view <ViewName>;                 -- enable a view (Day, Week, WorkWeek, Month, TimelineMonth)
>    view <ViewName> {
>       timemarker     = [<boolean>]; -- show current-time marker line
>       slotsize       = <Hour | Day>;
>       customdaterange = [<boolean>];
>    }
>
>    resource <AttrName> {            -- grouping dimension (max 2 resources)
>       filter = [<boolean>];
>       ranking <RankAttr>;
>    }
>    grouping <AttrName> {
>       ranking <RankAttr>;
>    }
>    groupby <AttrName>;
>    orientation = <Horizontal | Vertical>;
>
>    weekstart   = <WeekStartAttr>;
>    weeknumbers = [<boolean>];
>    workdaystart = <AttrName>;
>    workdayend   = <AttrName>;
>
>    emphasis <ColorConstant> = [<expression>];
>    visible  = [<expression>];
> }
> ```

```plvc
calendar AbsenceCalendar for EmployeeAbsence {
   label     = "Employee Absences";
   start     = AbsenceStart;
   end       = AbsenceEnd;
   fetchsize = 200;
   card      = AbsenceCard;    -- clicking an event shows this card

   view Day;
   view WorkWeek {
      timemarker = [true];     -- show red line at current time
   }
   view Month;
   view TimelineMonth {
      customdaterange = [true];
   }

   resource EmployeeName {
      filter = [true];         -- allow filtering by employee
   }
   grouping Department;

   emphasis Complementary3 = [AbsenceType = "Vacation"];
   emphasis Complementary1 = [AbsenceType = "SickLeave"];
}
```

> [!tip] Use `startdate`/`enddate` for All-Day Events
> For events that are full-day (like absences or project milestones), use `startdate`/`enddate` (DATE type, no time) rather than `start`/`end` (TIMESTAMP). Combine with `allday = [true]` to prevent the calendar from trying to render time slots.

> [!tip] Two Resource Types Maximum
> The `resource` section supports at most two resource groupings. Define `filter = [true]` on a resource to show a filter toggle in the calendar toolbar, allowing users to show/hide specific resource values.

> [!info] A richer scheduling alternative exists
> For multi-day, per-resource scheduling with attendance/reports/progress tracking, see [[Stacked Calendar and Scheduling]] (`stackedcalendar`) — a separate, much larger construct from this `calendar`.

---

## `ganttchart`

A project schedule chart showing tasks as horizontal bars on a time axis, with optional dependencies, sub-rows, and work schedule shading. The most complex client control in Marble.

The Gantt chart is declared in sections:
- `ganttchart` — top-level reference (placed on page)
- `ganttchart` block — main chart definition
- `ganttchartitem` — items (bars) within a row
- `ganttchartrow` — sub-rows within the chart
- `ganttchartschedule` — work schedule shading
- `ganttchartitemstyle` — bar appearance styles
- `ganttdependency` — dependency arrows
- `ganttcharttimemarker` — vertical time markers

> [!abstract] Core Syntax
> ```marble
> ganttchart <RefName> {
>    label     = "<title>";
>    filter    = [<condition>];
>    collapsed = [<boolean>];
> }
>
> ganttchart <ChartName> for <Entity> {
>    label        = "<title>";
>    zoomlevels(Year, Month, Day, Hour);
>    snaptime     = <minutes | "Free">;
>    height       = <small | medium | large>;
>    currenttime  = <DbFunctionName>();
>    timerange    = GetTimerangeFromData();
>
>    datagrid {
>       label = "<column header>";
>       ganttcolumn <AttrName>;
>    }
>
>    ganttchartitem <ItemName>(<ArrayAttr>) {
>       starttime <StartAttr>;
>       endtime   <EndAttr>;
>       card      <CardName>;
>       ganttfield <AttrName>;
>       ganttchartitemstyle <StyleName> = [<condition>];
>       ganttdependency <DepName>(<ArrayAttr>);
>       [rowiconset { ... }]
>       create command { ... }
>       resize command { ... }
>       move   command { ... }
>       delete command { ... }
>       edit   command { ... }
>    }
>
>    ganttchartrow <RowName>(<ArrayAttr>) {
>       datagrid { ganttcolumn <AttrName>; }
>       ganttchartitem <ItemName>(<ArrayAttr>) { ... }
>       [rowiconset { ... }]
>       orderby = <AttrName> asc;
>    }
>
>    scheduleid <CalendarIdAttr>;
>    ganttchartschedule <ScheduleName>(<ArrayAttr>) {
>       scheduleid <CalendarIdAttr>;
>       schedulestart <StartTimeAttr>;
>       scheduleend   <EndTimeAttr>;
>    }
>    ganttcharttimemarker <MarkerName>(<ArrayAttr>) {
>       label     = "Constraints";
>       starttime <StartAttr>;
>       endtime   <EndAttr>;
>       emphasis  = <ColorConstant>;
>    }
> }
>
> ganttchartitemstyle <StyleName> {
>    label    = "<legend label>";
>    shape    = <default | schedule | icon | bracket | diamond | buffer>;
>    emphasis = <ColorConstant>;
>    icon     = "<icon-name>";   -- used when shape = icon
> }
> ```

```plvc
-- Minimal Gantt declaration:
ganttchart ProjectGantt {
   label  = "Project Schedule";
   filter = [ProjectId = ProjectId];
}

ganttchart ProjectScheduleGantt for ProjectActivity {
   label       = "Activity Schedule";
   zoomlevels(Month, Day, Hour);
   snaptime    = 15;
   height      = medium;
   timerange   = GetTimerangeFromData();

   datagrid {
      label = "Activities";
      ganttcolumn ActivityNo;
      ganttcolumn Description;
   }

   ganttchartitem ActivityItem(ActivityItemArray) {
      starttime EarlyStart;
      endtime   EarlyFinish;
      card ActivityCard;
      ganttfield ActivityNo;
      ganttchartitemstyle CriticalStyle = [TotalFloat = 0];
      ganttdependency ActivityDependency(DependencyArray) {
         dependencytype FinishToStart = [DepType = "FS"];
         fromitem = "${PredecessorSeq}";
         toitem   = "${SuccessorSeq}";
      }
      resize command ResizeActivityCommand;
      move   command MoveActivityCommand;
   }
}

ganttchartitemstyle CriticalStyle {
   label    = "Critical Path";
   shape    = default;
   emphasis = Complementary1;   -- red for critical path items
}
```

### Item Bands, Categories, Legend, and Row Icons

A handful of additional Gantt sub-constructs, each declared standalone and referenced by name from `ganttchartitem`/`ganttchartrow`. None have rich Marble descriptions beyond what's shown:

| Construct | Shape | Notes |
|-----------|-------|-------|
| `ganttchartitembandbottom <Name> { label; ...emphasis/icon; }` | Styles a band drawn along the **bottom** edge of a Gantt bar. | No Marble description; shares emphasis/icon settings with `ganttchartitemstyle`. |
| `ganttchartitembandstart <Name> { label; ...emphasis/icon; }` | Same idea, for the **start** edge of the bar. | |
| `ganttchartitemcategory <Name> { label; icon; emphasis; }` | "Enable Gantt Item header categories." | `ganttchartitemcategory MilestoneCategory { label = Project; icon = aviation; emphasis = True; }` |
| `ganttchartlegend <Name> { ...legend groups; }` | A named legend for the chart, made of `GanttLegendGroup` entries. | No Marble description. |
| `ganttchartrowicon <Name> { label; color; icon; emphasis; }` | "To Define the icons of the Gantt chart rows." | |
| `rowiconset { icon ...; emphasis ...; }` | A set of row icons — valid inside both `ganttchartitem` and `ganttchartrow`. | |
| `dependencycreate command { execute { ... } }` | Fires when a user draws a new dependency arrow between two Gantt items. | `dependencycreate command { execute { call FetchDefaults(); } }` |

---

## `tree`

A hierarchical navigation control. Records are shown as expandable/collapsible tree nodes. Clicking a node navigates to a detail page or applies a filter. Used for project hierarchies, organizational structures, and category trees.

> [!abstract] Syntax
> ```marble
> tree <Name> for <Entity> {
>    label         = "<title>";
>    selector      = <SelectorName>;
>    searchcontext <SearchContextName> { ... }
>    navicontexts  { context <Name>; context <Name2>; }
>
>    rootnode <NodeName> for <Entity> {
>       label    = "<${Attr}>";
>       orderby  = <Attr> asc;
>       iconset  { expression = [<cond>]; icon "<icon-name>" { } }
>       navigate { filter(<Attr>, <Attr>); }
>       visible  = [<expression>];
>       connections {
>          node <ChildNodeName>(<ChildArray>);
>       }
>    }
>
>    node <ChildNodeName> for <ChildEntity> {
>       label    = "<${Attr}>";
>       orderby  = <Attr> asc;
>       navigate { filter(<Attr>, <Attr>); }
>       connections { node <GrandChildNodeName>(<GrandChildArray>); }
>       oncopy   { ... }
>       onmove   { ... }
>    }
> }
> ```

```plvc
tree ProjectTree for TstProject {
   label    = "Project Hierarchy";
   selector = ProjectSelector;

   rootnode ProjectNode for TstProject {
      label   = "${ProjectId} - ${Description}";
      orderby = ProjectId asc;
      navigate {
         filter(ProjectId, ProjectId);
      }
      connections {
         node SubProjectNode(SubProjectArray);
      }
   }

   node SubProjectNode for TstSubProject {
      label   = "Sub: ${SubProjectId}";
      orderby = SubProjectId asc;
      navigate {
         filter(SubProjectId, SubProjectId);
      }
      visible = [Material or Installation];
   }
}
```

> [!note] `connections` Defines Children
> A node without a `connections` block is a leaf node — it cannot be expanded. The `connections` block lists child node types and the array attribute that provides the child records.

---

## `treediagram`

An organizational chart / network diagram visualization. Records appear as rectangular nodes with optional color stripes, icons, and a card popup. Used for business unit hierarchies, approval chains, and process flows.

> [!abstract] Syntax
> ```marble
> treediagram <Name> for <Entity> {
>    label     = "<title>";
>    collapsed = [<boolean>];
>    card      = <CardName>;       -- popup on node click
>    details   = <PageName>(<args>);
>
>    field <AttrName>;              -- attributes shown on each node
>    badge <AttrName> { ... }
>    iconset {
>       expression = [<cond>];
>       icon "<icon-name>" {
>          emphasis <Color> = [<cond>];
>       }
>    }
>    emphasis <ColorConstant> = [<expression>];   -- node color stripe
>
>    connections {
>       node <ChildEntityAttr>;
>    }
> }
> ```

```plvc
treediagram BusinessUnitDiagram for BusinessUnit {
   label     = "Business Unit Structure";
   collapsed = [false];
   card      = BusinessUnitCard;
   details   = BusinessUnitPage("BusinessUnitId eq $[BusinessUnitId]");

   field BusinessUnitName;
   field BusinessUnitType;
   badge BusinessUnitType {
      emphasis Complementary3 = [BusinessUnitType = "Department"];
      emphasis Complementary5 = [BusinessUnitType = "Division"];
   }
   iconset {
      icon "alert" {
         expression = [IssueCount > 0];
         emphasis Complementary1 = [IssueCount > 5];
      }
   }
   emphasis Complementary3 = [IsHeadquarters = "TRUE"];

   connections {
      node ChildBusinessUnits;
   }
}
```

---

## `boxmatrix`

Displays records grouped into a two-axis matrix of boxes — one box per (X, Y) combination, similar to a 9-box performance/potential talent grid.

> [!warning] Earlier version of this section was incorrect
> A previous revision described `boxmatrix` as an inline property block written directly inside `list { boxmatrix { ... } }`, with no `xaxis`/`yaxis` at all. That was wrong. Verified against Marble's real `BoxMatrixDefinition`/`BoxMatrixReference`/`BoxMatrixXaxisDefinition` rules: `boxmatrix` is a **standalone top-level construct** (declared with `for <Datasource>`, just like `ganttchart`/`tree`) with a required `xaxis` and optional `yaxis` block, which a `list` then merely *references* by name via `boxmatrix <Name>;`. Corrected below.

> [!abstract] Syntax
> ```marble
> boxmatrix <BoxMatrixName> for <Datasource> {
>    [description = "<Value, e.g. with ${shownCount}/${totalCount}>";]
>    [card <CardName>;]
>    [count = [<condition>];]
>    [initialview = <ViewName>;]
>    [boxcolor <Attr>;]                                  -- "adds a color to the boxes"
>    [boximage <Attr> { emphasis <Color> = [<condition>]; ... }]   -- Text/LongText/Binary image data
>    [boxvalue <Attr>;]                                  -- "value that displays inside the boxes"
>    [boxtitle <Attr>;]                                  -- "title for the boxes"
>    xaxis <Attr> from <Datasource2> using <EntitySet> {
>       [orderby = <Attr> asc;]
>       map <ValueAttr>;
>    }
>    [yaxis <Attr> from <Datasource3> using <EntitySet2> {
>       [orderby = <Attr> asc;]
>       map <ValueAttr>;
>    }]
> }
>
> -- referenced from a list:
> list <ListName> for <Entity> {
>    boxmatrix <BoxMatrixName>;
> }
> ```

```marble
boxmatrix CareerAdvancementLevelBoxMatrix for Person {
   description = "Displaying ${shownCount} of ${totalCount} employee";
   card PersonCard;
   count = [true];
   boxtitle CareerAdvancementLevel;
   boxvalue FirstName;
   boxcolor ColorCategory;
   boximage PersonImage {
      emphasis Complementary2 = [Performance = "Meets"];
      emphasis Complementary8 = [Performance = "Below"];
      emphasis Complementary9 = [Performance = "Exceeds" and Potential = "High"];
   }

   xaxis Potential from MainPotential using MainPotentialSet {
      orderby = Ranking asc;
      map Value;
   }
   yaxis Performance from MainPerformance using MainPerformanceSet {
      orderby = Ranking asc;
      map Value;
   }
}

list PersonBoxMatrixList for Person {
   boxmatrix CareerAdvancementLevelBoxMatrix;
}
```

### `xaxis` / `yaxis`

"This is used define the X-axis [/Y-axis] of the Box Matrix." Each axis pulls its category values from a separate datasource/entityset (`from <Datasource> using <EntitySet>`), with an optional `orderby` and a `map <Attr>;` connecting the axis category to the matching value on the main datasource.

> [!tip] Box-Matrix as a 9-Box Grid
> With both `xaxis` and `yaxis` defined (e.g. Potential × Performance), `boxmatrix` becomes IFS's version of a classic "9-box" talent grid — each record lands in exactly one (X, Y) box.

---

## `kanbanboard` and `kanbancard`

A true drag-and-drop Kanban board — distinct from `boxmatrix` (a static grid, no dragging). Cards move between columns (typically backed by an enumeration/state attribute), triggering a move command.

> [!abstract] Syntax
> ```marble
> kanbanboard <Name> for <Datasource> {
>    [label = "<Value>";]
>    [kanbancolumn <Attr>;]
>    [kanbancard <CardRef>;]
>    [kanbanmove command { ... }]
>    [kanbangroupby <Attr>;]
> }
>
> kanbancard <Name> for <Datasource> {
>    [label = "<Value>";]
>    [emphasis <Color> = [<condition>];]
>    -- CardContent, same shape as `card` in [[Card and Sheet]]
>    ( command <Name>; | commandgroup <Name>; )*
>    [nodeiconset { ... }]
> }
> ```

```marble
kanbanboard SampleKanbanBoard for Activity {
   label = "Work Flow";
   kanbancolumn Objstate;
}
```

"Named Kanban board need to be for a specific datasource (entity, query or summary)."

> [!info] `kanbanmove`/`kanbangroupby` not detailed here
> `KanbanMoveCommandDefinition` and `KanbanGroupByDefinition` already had passing vault coverage before this pass and weren't part of this gap-filling round — full depth on those two is deferred.

---

## `map`

> [!info] Minimal coverage — full `map`/`pin`/`route` documentation deferred
> `map`, `pin`, and `route` had no real documentation in this vault before this pass (an earlier "mentioned somewhere" classification turned out to be a false-positive substring match, not real content). This section only covers the specific sub-pieces that were in scope for this round: `polyline`, `startlocation`/`endlocation`, `pinstyle`, and `clustercommand`. Full `map`/`pin`/`route` parity is a good candidate for a future pass.

### `polyline`

"Polyline definition" — draws a route line on a map between a start and end location.

> [!abstract] Syntax
> ```marble
> polyline <Name> {
>    label = "<Value>";
>    [visible = [<condition>];]
>    startlocation { latitude = <Attr>; longitude = <Attr>; }
>    endlocation   { latitude = <Attr>; longitude = <Attr>; }
>    [card <CardRef>;]
>    ( emphasis ... | tooltip ... )*
> }
> ```

### `startlocation` / `endlocation`

"Location details of a position." Both take the same shape — `latitude`/`longitude` — and are also used inside `route` (not otherwise documented in this pass).

### `pinstyle`

"Pin style definition" — controls how a map pin renders.

> [!abstract] Syntax
> ```marble
> pinstyle <Name> {
>    label = "<Value>";
>    [visible = [<condition>];]
>    [shape = <Value>;]
>    [contactimage = <Attr>;]
>    [displayvalue = <Value>;]
>    ( icon = "<icon-name>"; | emphasis <Color> = [<condition>]; )*
> }
> ```

### `clustercommand`

"Cluster command for pin" — nests inside a `pin` definition; fires when a user interacts with a cluster of pins grouped together at low zoom levels.

```marble
clustercommand {
   execute {
      call FetchDefaults();
   }
}
```

---

## `imageviewer`, `jsonviewer`, and `xdviewer`

Three specialized "viewer" controls for displaying images, raw JSON, and XD (3D/visual digital twin) models.

### `imageviewer`

"A container for displaying a set of images."

> [!abstract] Syntax
> ```marble
> imageviewer <Name> [for <Datasource>] {
>    [label = "<Value>";]
>    [collapsed = [<condition>];]
>    [scale = <Value>;]
>    [height = <Value>;]
>    [defaultimage = <Value>;]
>    [imageid <Attr>;]
>    [fullscreenonly = [<condition>];]
>    [fullscreencommand <CommandRef>;]
>    image { label = ...; url = ...; }
>    -- one or more `image` entries
> }
> ```

```marble
imageviewer ProductViewer for PersonInfo {
   image {
      label = ...;
      url = ...;
   }
   image {
      label = ...;
      url = ...;
   }
}
```

`fullscreencommand` — "Command being available when in fullscreen mode": `fullscreencommand Download;`

### `jsonviewer`

"Static control for displaying any JSON data." Formats the returned JSON to make it easier to read.

> [!abstract] Syntax
> ```marble
> jsonviewer <Name> for <Datasource> {
>    [label = "<Value>";]
>    ( jsonattribute <Attr>; | jsonfunction <FunctionRef>; )
>    [visible = [<condition>];]
>    [collapsed = [<condition>];]
> }
> ```

### `xdviewer` and `detailsview`

"Definition of an XdViewer. Named xdviewer need to be for a specific datasource (entity, query or summary)."

> [!abstract] Syntax
> ```marble
> xdviewer <Name> for <Datasource> {
>    label = "<Value>";
>    [collapsed = [<condition>];]
>    [visible = [<condition>];]
>    uri    <XdUriAttr>;
>    view   <XdViewIdAttr>;
>    object <XdObjectIdAttr>;
>    [detailsview <Name2> [(<DetailRef>)] [bind <SourceRef> | url=...] {
>       card <CardRef>;   -- one or more
>    }]
> }
> ```

```marble
xdviewer MyXdViewer for TstModelViewerData {
   label = "Object visualizer";
   card ObjectCard;
   uri XdUri;
   view XdViewId;
   object XdObjectid;
}
```

`detailsview` ("Definition of an DetailsView") nests inside `xdviewer` and binds one or more `card`s to a detail/drill-down context within the 3D viewer:

```marble
detailsview DetailsViewName using Plants {
   card ObjectCard;
}
```

---

## `objectconnection`

"Definition of an objectconnection attachment." A named panel linking the current record to related objects elsewhere in the system — selectors, groups, singletons, lists, plugins, image viewers, or XD viewers — plus commands.

> [!abstract] Syntax
> ```marble
> objectconnection <Name> {
>    label = "<Value>";
>    ( selector ... | group ... | singleton ... | list ... | plugin ... | imageviewer ... | xdviewer ... )*
>    ( command <Name>; )*
> }
> ```

```marble
objectconnection NcrObjectConnection {
   label = 'Non Conformance Reports';
   list NcrObjectConnectionList using GetOCTResultSet(luname, keyref) {
      details = 'page/NonConformance/Form?$filter=NcrNo eq $[NcrNo]';
   }
   command CreateNcr;
   command AttachNcr;
}
```

---

## `yearview`

A year-at-a-glance scheduling view, paired with a schedule reference.

> [!abstract] Syntax
> ```marble
> yearview <Name> for <Datasource>[, <ScheduleRef>] {
>    label = "<Value>";
>    [visible = [<condition>];]
>    [calendarschedule = ...;]
>    [calendarresource <Ref>;]
>    [events <Ref>;]
>    ( command <Name>; | commandgroup <Name>; )*
> }
> ```

---

## Patterns & Tips

> [!tip] `calendar` + `card` = Full Scheduling UX
> The `card` property on a calendar makes it possible to view and act on a record without leaving the calendar view. Design the card to show the key fields users need when clicking an event — time, person, type, status — and the calendar becomes self-contained for scheduling workflows.

> [!tip] Tree Navigation Pairs with a Main Page
> Trees work best when the `navigate { filter(...) }` on each node drives content on the same page — typically a list or group that filters based on the selected tree node. The tree becomes a persistent navigation rail, and the content area updates on node selection.

> [!warning] Gantt Chart Complexity
> The Gantt chart is the most property-dense control in Marble. Start with a minimal implementation (just `starttime`, `endtime`, and `ganttchartitem`) and add features incrementally. All the `ganttchartrow`, `ganttchartschedule`, dependency, band, category, legend, and row-icon features are optional.

---

## See Also

- [[Emphasis and Colors]] — coloring events, nodes, and bars
- [[Card and Sheet]] — card templates used by Calendar, Tree Diagram, Kanban, and Map pins
- [[Charts]] — for aggregated/summary data visualization
- [[List]] — grid view alternative for the same data; also where `boxmatrix` is referenced
- [[Stacked Calendar and Scheduling]] — the larger, separate resource-scheduling calendar
- [[Pages]] — where data view controls are placed
