---
title: Client Property Index
publish: true
tags:
  - ifs-marble/client
  - ifs-marble/reference
aliases:
  - property index
  - client properties
  - property reference
  - all properties
related:
  - '[[Thinking in Marble]]'
  - '[[Glossary]]'
  - '[[Fields and LOV]]'
  - '[[Commands and Expressions]]'
  - '[[Emphasis and Colors]]'
---

# Client Property Index

An alphabetical reference of every property available in IFS Cloud `.client` files. Use this when you encounter a property in existing code and need a quick description and a pointer to the full documentation.

**How to read the table**

- **Type** — the expected value kind (`Boolean`, `String`, `Expression`, `Constant`, `DataItemRef`)
- **Default** — the value used when the property is omitted; `—` means no default (required or not applicable)
- **Controls** — the controls where this property is valid (see abbreviation key below)
- **Description** — one-line summary; follow the link in the See Also column for full syntax and examples

**Control abbreviations**

| Abbr | Control | Full note |
|------|---------|-----------|
| `list` | List | [[List]] |
| `group` | Group | [[Group]] |
| `field` | Field (inside list/group) | [[Fields and LOV]] |
| `lov` | LOV (inside list/group) | [[Fields and LOV]] |
| `badge` | Badge | [[Display Controls]] |
| `bool` | Boolean | [[Display Controls]] |
| `state` | State Indicator | [[Display Controls]] |
| `computed` | Computed Field | [[Display Controls]] |
| `static` | Static Field | [[Display Controls]] |
| `markdown` | Markdown Text | [[Display Controls]] |
| `progress` | Progress Field | [[Display Controls]] |
| `currency` | Currency / Measure | [[Input Controls]] |
| `radio` | Radio Group | [[Input Controls]] |
| `rating` | Rating Control | [[Input Controls]] |
| `picker` | Item Picker | [[Input Controls]] |
| `color` | Color Picker | [[Input Controls]] |
| `address` | Address Field | [[Input Controls]] |
| `daterange` | Date Range Field | [[Input Controls]] |
| `datetime` | Date Time Picker | [[Input Controls]] |
| `sig` | Signature | [[Input Controls]] |
| `card` | Card | [[Card and Sheet]] |
| `sheet` | Sheet | [[Card and Sheet]] |
| `chart` | Bar / Line / Pie / Funnel Chart | [[Charts]] |
| `calendar` | Calendar | [[Data Views]] |
| `timeline` | Timeline | [[Data Views]] |
| `tree` | Tree | [[Data Views]] |
| `diagram` | Tree Diagram | [[Data Views]] |
| `gantt` | Gantt Chart | [[Data Views]] |
| `boxmatrix` | Box-matrix | [[Data Views]] |
| `page` | Page | [[Pages]] |
| `dialog` | Dialog | [[Dialog]] |
| `assistant` | Assistant | [[Assistant]] |
| `cmd` | Command | [[Commands and Expressions]] |
| `search` | Search Context | [[Selector and Search Context]] |
| `selector` | Selector | [[Selector and Search Context]] |
| `process` | Process Viewer | [[Utility Controls]] |
| `contact` | Contact Widget | [[Utility Controls]] |

---

## A

| Property | Type | Default | Controls | Description |
|----------|------|---------|----------|-------------|
| `activestage` | String | — | `process` | Attribute or expression that identifies the current active stage to highlight. |
| `advancedview` | List Reference | — | `lov` | Reference to a list control providing the expanded advanced-search dialog for the LOV. |
| `allday` | Boolean / Expression | `false` | `calendar` | When true, event spans the entire day and the time portion is ignored. |
| `alldaylabel` | String | — | `calendar` | Custom label for the all-day time slot. Defined per view: `view WorkWeek { alldaylabel = "Whole day"; }` |
| `autorestart` | Boolean / Expression | — | `assistant` | Whether the assistant automatically restarts after the finish step is completed. |
| `availableitemslabel` | String | — | `picker` | Header text for the "Available" list in an item picker. |

---

## B

| Property | Type | Default | Controls | Description |
|----------|------|---------|----------|-------------|
| `basedate` | DataItemRef | — | `field` | A DATE-typed attribute that the date picker opens at by default. |
| `boxcolor` | DataItemRef | — | `boxmatrix` | Attribute whose value (from a color picker) sets the border-top color of each box. |
| `boximage` | String | — | `boxmatrix` | Attribute providing the avatar image for each record in the box-matrix. |
| `boxtitle` | DataItemRef | — | `boxmatrix` | Attribute displayed as the header title of each box. |
| `boxvalue` | DataItemRef | — | `boxmatrix` | Attribute displayed as the primary value inside each box. |

---

## C

| Property | Type | Default | Controls | Description |
|----------|------|---------|----------|-------------|
| `card` | CardReference | — | `list`, `calendar`, `diagram`, `gantt` | Card template to use for CardView / AvatarView (list) or event/node popups. |
| `centerlabel` | Boolean | `false` | `chart` (Pie, Funnel) | Shows the sum of all values in the center of the chart. |
| `collapsed` | Boolean | `false` | `list`, `chart`, `timeline`, `diagram`, `gantt` | Whether the control starts in the collapsed/minimized state. |
| `columnexclude` | Boolean | `false` | `field` (in `list`) | Permanently excludes the column from the user's column picker. Use for internal/technical columns. |
| `columnvisible` | Boolean | `true` | `field` (in `list`) | When `false`, column is hidden by default but available in the column picker. |
| `compactmode` | Boolean | `false` | `picker` | Shows only the selected-items list; clicking it opens the full dual-list control. |
| `completed` | Percentage | `0%` | `state` | Percentage (0–100%) shown as a partial fill on the state indicator bubble. |
| `connections` | Object | — | `tree` (node) | Declares child node types for a tree node. A node without `connections` is a leaf. |
| `copyoncruddefault` | Key mapping | — | `list` | Maps parent record keys to new child record fields: `copyoncruddefault(ParentKey) to(ChildKey)`. |
| `count` | Boolean | `false` | `boxmatrix` | Shows the record count inside each box. Clicking the count navigates to a filtered list. |
| `crosshairs` | Boolean | `true` | `chart` (Bar, Line) | Shows crosshair guide lines on mouse hover. |
| `customdaterange` | Boolean | `false` | `calendar` (TimelineMonth view) | Allows the user to edit the displayed date range. |

---

## D

| Property | Type | Default | Controls | Description |
|----------|------|---------|----------|-------------|
| `date` | Date / Timestamp | — | `timeline` | **Required.** The attribute used to position each entry on the time axis. |
| `defaultemphasis` | Boolean | `Colorpicker0` | `color` | Sets the default selected color swatch: `defaultemphasis Colorpicker4 = [true];` |
| `defaultfilter` | Expression | — | `list`, `page` | A query filter applied when the page/list first loads. The user can modify or clear it. |
| `defaults` | FunctionReference | — | `search` | Server function called to pre-populate search context fields on page open. |
| `defaultsearchfields` | DataItemRef | — | `search`, `page` | Fields shown upfront in the search panel. Users can add more via "Add filter." |
| `defaulttoprevious` | Boolean / Expression | — | `field`, `lov`, `radio` | Saves the last-used value to the user profile and pre-fills on next open. |
| `description` | DataItemRef / String | — | `lov`, `boxmatrix`, `assistant` (steps) | For LOVs: secondary read-only attribute shown beside the code (`description = Ref.Name`). For box-matrix: title text. For assistant steps: descriptive text under the step indicator. |
| `details` | PageReference | — | `list`, `chart`, `timeline`, `diagram` | Drill-down page opened when clicking a row / bar / slice / node. |
| `display` | Constant | `Standalone` | `list` (bound child) | `Nested` — expands under each parent row. `Standalone` — renders as a separate component. |
| `displayvalue` | DataItemRef | — | `picker` | **Required.** Attribute whose values are displayed in the item picker lists. |
| `dynamic` | Object | — | `assistant` (step) | Calls a server function to dynamically generate the step's contents at runtime. |

---

## E

| Property          | Type                 | Default        | Controls                                                                                                  | Description                                                                                                                      |
| ----------------- | -------------------- | -------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `editable`        | Boolean / Expression | `true`         | `field`, `lov`, `bool`, `currency`, `radio`, `badge`, `address`, `daterange`, `datetime`, `picker`, `sig` | Whether the control accepts user input. Client-side only — cannot override a projection-level `editable = [false]`.              |
| `editmode`        | Constant             | `MultiRowEdit` | `list`                                                                                                    | `SingleCellEdit` — one cell at a time. `SingleRowEdit` — one row at a time. `MultiRowEdit` — bulk edit with an Edit/Save button. |
| `emphasis`        | Expression           | —              | `badge`, `bool`, `state`, `progress`, `chart`, `calendar`, `timeline`, `diagram`, `markdown`, `boxmatrix` | Maps a boolean expression to a color constant. First matching rule wins. See [[Emphasis and Colors]].                            |
| `enabled`         | Boolean / Expression | `true`         | `cmd`, `contact`, `assistant` (steps)                                                                     | Whether the command/control is active. Disabled commands are grayed out.                                                         |
| `enableordering`  | Boolean              | `false`        | `picker`                                                                                                  | Shows up/down ordering buttons in the selected-items list.                                                                       |
| `end`             | DataItemRef          | —              | `calendar`                                                                                                | TIMESTAMP attribute marking the end of a calendar event.                                                                         |
| `enddate`         | DataItemRef          | —              | `calendar`                                                                                                | DATE attribute for event end (use instead of `end` when time precision isn't needed).                                            |
| `enumerationtrue` | Identifier           | —              | `field`                                                                                                   | The enumeration value treated as "true" when rendering a field as a toggle button.                                               |

---

## F

| Property | Type | Default | Controls | Description |
|----------|------|---------|----------|-------------|
| `falselabel` | String | `"No"` | `bool` | Text shown when the boolean value is false. |
| `fetchsize` | Number | `500` | `calendar` | Maximum number of records loaded into the calendar at one time. |
| `field` | Attribute | — | `timeline` | Attribute displayed as the body text of each timeline entry. |
| `fieldhint` | Constant | — | `field` | UI hint telling the device how to interpret the field (e.g., what keyboard type to show on mobile). |
| `fieldranking` | DataItemRef (list) | — | `list`, `card` | Comma-separated priority order. Lower-ranked columns hide first on narrow screens. |
| `filter` | Expression / Boolean | — | `list`, `chart`, `calendar` (resource), `picker`, `gantt` | Query condition applied to the data source. For lists: always-on, user cannot remove it. For calendar resources: enables per-resource filtering toggle. |
| `filterlabel` | String | — | `field`, `lov`, `address`, `daterange` | Label shown in the search/filter panel when it differs from the field's regular label. |
| `format` | Constant | — | `field`, `computed`, `currency`, `datetime` | Display format: `decimal`, `ifscurrency`, `percentage`, `uppercase`, `lowercase`, `longtime`. |
| `freeinput` | Boolean / Expression | `false` | `lov` | Allows the user to type a value not in the LOV list. Useful for filter/search fields. |

---

## G

| Property | Type | Default | Controls | Description |
|----------|------|---------|----------|-------------|
| `groupby` | Variable | — | `calendar` | Attribute used to re-group the groupings already defined by `grouping`. |
| `grouping` | Variable | — | `calendar` | Attribute used to group calendar items into named lanes or rows. |

---

## H

| Property | Type | Default | Controls | Description |
|----------|------|---------|----------|-------------|
| `header` | String | — | `timeline` | Attribute or string shown as the bold title of each timeline entry. |
| `height` | Constant | `auto` | `field` (multiline), `gantt` | Size of the control: `small`, `medium`, `large` for Gantt; `small` / `auto` for multiline fields. |
| `hidekey` | Boolean / Expression | `false` | `lov` | Hides the key/code column in the LOV dropdown, showing only the description. |

---

## I

| Property | Type | Default | Controls | Description |
|----------|------|---------|----------|-------------|
| `icon` | String | — | `badge`, `cmd`, `diagram` (iconset) | Icon name from the IFS icon library. For badges: displayed on the chip. For commands: displayed on the button. |
| `iconset` | Object | — | `tree` (node), `diagram` | Set of icons with conditions: `iconset { expression = [...]; icon "name" { } }` |
| `initialfocus` | Boolean / Expression | `false` | `field`, `lov` | Places the cursor in this field when the dialog or group opens. Use on the first user-editable field. |
| `initialview` | Constant | `ListView` | `list`, `boxmatrix` | Default view when the user first opens the list. Stored in user profile after first visit. Values: `ListView`, `CardView`, `TileView`, `AvatarView`, `BoxMatrixView`. |

---

## K

| Property | Type | Default | Controls | Description |
|----------|------|---------|----------|-------------|
| `keeponrestart` | Attribute list | — | `assistant` | Fields whose values are preserved when the assistant restarts: `keeponrestart(Attr1, Attr2);` |
| `key` | Attribute | — | `contact` | Attribute containing the person's user/employee ID used to look up contact information. |

---

## L

| Property | Type | Default | Controls | Description |
|----------|------|---------|----------|-------------|
| `label` | String | control name | Most controls | Display title. Supports `${Attr}` interpolation. Setting `""` suppresses the header on groups and dialogs. |
| `legends` | Object | — | `timeline` | Defines the legend shown below the timeline. |
| `lovswitch` | Object | — | `field` | Conditional LOV: `lovswitch { reference RefA = [Condition]; reference RefB = [Condition]; }` — switches which reference drives the LOV based on a condition. |

---

## M

| Property | Type | Default | Controls | Description |
|----------|------|---------|----------|-------------|
| `maxlength` | Number | — | `field` | Maximum character count for a text field. |
| `maxrating` | Integer / Attribute | — | `rating` | Maximum value on the rating scale (1–10). Can be a fixed integer or an attribute. |
| `mode` | Constant | — | `cmd` | `SingleRecord` — operates on one selected row. `SelectedRecords` — operates on all selected rows. `Global` — operates at the page level (not row-bound). |
| `multiline` | Boolean | — | `field` | Renders the field as a `<textarea>` for multi-line text entry. |
| `multiselect` | Boolean | `true` | `list` | When `false`, only one row can be selected at a time (no checkboxes). |

---

## N

| Property | Type | Default | Controls | Description |
|----------|------|---------|----------|-------------|
| `navicontexts` | Object | — | `tree` | Named contexts used to conditionally change tree navigation and node visibility. |
| `navigate` | Object | — | `tree` (node) | Page navigation triggered when the user clicks a tree node. |
| `node` | Tree Node | — | `tree` | Declares a child node type (entity + label + connections) within a tree. |

---

## O

| Property | Type | Default | Controls | Description |
|----------|------|---------|----------|-------------|
| `oncopy` | Object | — | `tree` (node) | Commands executed when this node is copied into another node. |
| `onmove` | Object | — | `tree` (node) | Commands executed when this node is moved into another node. |
| `optional` | Boolean / Expression | `false` | `assistant` (steps) | Adds a "Skip" option to the step. |
| `orderby` | DataItemRef | — | `list`, `picker`, `tree` (node), `gantt` (row) | Default sort order. Supports `asc` / `desc` and comma-separated columns. |
| `orientation` | Constant | `Vertical` | `calendar` | Layout direction for grouped calendar resources: `Horizontal` or `Vertical`. |

---

## P

| Property | Type | Default | Controls | Description |
|----------|------|---------|----------|-------------|
| `pinnedsearchfields` | DataItemRef | — | `search`, `page` | Fields always visible in the search panel; users cannot remove them. |
| `preselect` | Boolean | `false` | `list` | Automatically selects the first row when the page loads. |
| `preserveprecision` | Boolean | `false` | `currency`, `field` | Stores full precision but displays fewer decimals; full precision visible on edit. |
| `preview` | Object | — | `lov`, `timeline` | Preview definition for hover/expand behavior. |

---

## R

| Property | Type | Default | Controls | Description |
|----------|------|---------|----------|-------------|
| `ranking` | DataItemRef | — | `calendar` (resource / grouping) | Attribute providing sort order within calendar resource or grouping groups. |
| `regexp` | String | — | `field` | Regular expression the field's value must match. Field turns red on mismatch. |
| `required` | Boolean / Expression | `false` | `address`, `daterange`, `currency`, `lov`, `radio` | Whether a value must be entered before the record can be saved. |
| `requiredsearchfields` | DataItemRef | — | `search`, `page` | Fields that must have values before the search query is allowed to execute. |
| `resource` | DataItemRef | — | `calendar` | Resource dimension for grouping calendar events. Maximum two resources per calendar. |
| `rootnode` | Tree Node | — | `tree` | Declares the root-level node of a tree control. |

---

## S

| Property | Type | Default | Controls | Description |
|----------|------|---------|----------|-------------|
| `savemode` | Constant | `Default` | `list`, `assistant` | `Default` — rows saved individually. `Buffer` — all changes held until explicit Save. `Unbound` — commands run on dirty records without auto-save (requires `SingleCellEdit` or `SingleRowEdit`). |
| `searchable` | Boolean | `true` | `address`, `daterange`, `currency` | Whether the control's value can be included in search/filter queries. |
| `searchcontext` | SearchContextRef | — | `tree` | Reference to the tree's filter/search context definition. |
| `selecteditemslabel` | String | — | `picker` | Header text for the "Selected" list in an item picker. |
| `selector` | SelectorReference | — | `tree` | Reference to the main entity selector driving the tree's root records. |
| `showlabel` | Boolean | `true` | `address`, `currency`, `lov`, `radio`, `rating` | Whether the field label is rendered. |
| `showonlydate` | Boolean / Expression | — | `field` (Timestamp) | Displays only the date portion of a Timestamp attribute, hiding the time. |
| `size` | Constant | `Medium` | `field`, `lov`, `badge`, `address`, `daterange`, `datetime`, `currency`, `radio`, `rating`, `sig` | Width of the control: `Small` (~80px), `Medium` (~150px), `Large` (~250px), `FullWidth` (100%). |
| `skipattribute` | Attribute | — | `assistant` (steps) | Attribute that stores whether the step has been skipped. |
| `slotsize` | Constant | `Hour` | `calendar` | Time-slot granularity: `Hour` or `Day`. |
| `sortable` | Boolean | `true` | `field` (in `list`) | Whether the user can click the column header to sort by this field. |
| `source` | Keyword | `Person` | `contact` | Type of person record to display: `Person`, `User`, `Customer`, or `Supplier`. Supports conditional: `source Customer = [RefType = "CUSTOMER"];` |
| `start` | DataItemRef | — | `calendar` | TIMESTAMP attribute marking the start of a calendar event. |
| `startdate` | DataItemRef | — | `calendar` | DATE attribute for event start (use instead of `start` when time precision isn't needed). |
| `startupmode` | Constant | — | `page` | `search` — page opens with empty grid; data loads only after user searches. `edit` — page opens directly editable. |
| `staticlabel` | String | — | `assistant`, `page` | Label used in the breadcrumb when the screen is reached by navigation rather than a navigator entry. |
| `style` | Constant | — | `badge`, `cmd` | `TextOnly` — text only. `IconOnly` — icon only. Default: text and background color. |
| `summary` | DataItemRef | — | `list` | Comma-separated attributes shown in a totals row at the bottom of the list. Values calculated from the database, not just visible rows. |
| `summaryfield` | Attribute | — | `card` | Attribute shown in an emphasized position (top-right) on the card. |

---

## T

| Property | Type | Default | Controls | Description |
|----------|------|---------|----------|-------------|
| `text` | String | — | `markdown` | Markdown content to render. Supports `${Attr}` interpolation. |
| `tile` | ListReference | — | `list` | Enables Tile View for the list. Self-referencing: `tile MyList;` |
| `timemarker` | Boolean | `true` | `calendar` (view) | Shows a red line at the current time in the calendar. Defined per view: `view WorkWeek { timemarker = [true]; }` |
| `total` | Variable | — | `progress` | Attribute holding the 100% total value for the progress bar. |
| `truelabel` | String | `"Yes"` | `bool` | Text shown when the boolean value is true. |
| `type` | Constant | `Text` | `field`, `computed` | Data type: `Text`, `Number`, `Boolean`, `Enumeration`, `LongText`. For computed fields: controls how the value expression is evaluated. |

---

## U

| Property | Type | Default | Controls | Description |
|----------|------|---------|----------|-------------|
| `uniteditable` | Boolean / Expression | `true` | `currency` | Whether the unit (currency/UoM) can be changed. Pattern: `uniteditable = [ETag = null]` locks after first save. |
| `unitexportlabel` | String | — | `currency` | Column header for the unit field in Excel exports. |
| `unitlookup` | EntitySet reference | — | `currency` | EntitySet providing the available unit values: `unitlookup IsoCurrencyEntitySet(CurrencyCode);` |
| `unitrequired` | Boolean / Expression | `true` | `currency` | Whether a unit value must be selected. |
| `unitselector` | SelectorReference | — | `currency` | Selector fragment providing the unit dropdown. Required when `uniteditable = [true]`. |
| `unitvisible` | Boolean / Expression | `true` | `currency` | Whether the unit field is shown alongside the value. |

---

## V

| Property | Type | Default | Controls | Description |
|----------|------|---------|----------|-------------|
| `valid` | Boolean / Expression | `true` | `assistant` (steps) | Whether the data entered in this step is valid. The Next button is disabled when `false`. |
| `validate` | Command reference | — | `lov`, `radio` | Named-command variant of the focusout trigger: `validate command MyCommandName;` |
| `validatecommand` | Command script | — | `currency`, `field`, `lov`, `radio` | Inline focusout command. Fires when the user leaves the field. See [[Fields and LOV]]. |
| `value` | String / Expression | — | `computed`, `progress` | For computed fields: the interpolated or calculated display value. For progress: the value of one stacked segment. |
| `valuelabel` | Various | — | `progress` | Label shown on each stacked progress segment. |
| `variable` | Enumeration | — | `cmd` | Declares a local variable for use within the command's execute block: `variable MyVar;` |
| `view` | Constant | — | `calendar` | Enables a calendar view: `Day`, `Week`, `WorkWeek`, `Month`, `TimelineMonth`. |
| `visible` | Boolean / Expression | `true` | Most controls | Whether the control is rendered at all. When `false`, the control is completely absent from the DOM — unlike `editable`, which keeps it visible but read-only. |
| `visibility` | Expression | — | `sheet` | Condition for showing the sheet tab on a card. Uses `[${Attr} != ""]` string-interpolation syntax (not standard boolean expression syntax). |

---

## W

| Property | Type | Default | Controls | Description |
|----------|------|---------|----------|-------------|
| `weeknumbers` | Boolean | `true` | `calendar` | Whether week numbers are displayed in the calendar grid. |
| `weekstart` | Variable | — | `calendar` | Attribute holding the first day of the week for the calendar display. |
| `workdayend` | Variable | — | `calendar` | Attribute indicating the end time of the scheduled work period for work-schedule shading. |
| `workdaystart` | Variable | — | `calendar` | Attribute indicating the start time of the scheduled work period. |

---

## Z

| Property | Type | Default | Controls | Description |
|----------|------|---------|----------|-------------|
| `zoomlevel` | Comma-separated | — | `gantt` | Available timescale levels: `zoomlevels(Year, Month, Day, Hour);` |

---

## Properties by Purpose

A cross-reference for when you know what you want to achieve but not which property to use.

### Visibility and Editability

| Property | What it controls |
|----------|-----------------|
| `visible` | Whether the control exists in the UI at all |
| `editable` | Whether the control accepts input (still visible when false) |
| `enabled` | Whether a command button is clickable (grayed out when false) |
| `columnvisible` | Whether a list column is shown by default (user can toggle) |
| `columnexclude` | Whether a list column appears in the column picker at all |
| `showlabel` | Whether the field label text is rendered |

### Layout and Sizing

| Property | What it controls |
|----------|-----------------|
| `size` | Width of a field/LOV/control (Small → FullWidth) |
| `height` | Height of a multiline field or Gantt chart |
| `display` | Nested vs. Standalone for a bound child list |
| `initialview` | Default view mode for a list (ListView, CardView, etc.) |
| `style` | TextOnly vs. IconOnly rendering for badges and commands |
| `fieldranking` | Column priority order when screen space is limited |
| `orientation` | Horizontal vs. Vertical calendar grouping |

### Filtering and Data Loading

| Property | What it controls |
|----------|-----------------|
| `filter` | Hard-coded server filter; user cannot override |
| `defaultfilter` | Initial filter; user can modify or clear |
| `startupmode` | Whether data loads immediately or waits for user search |
| `defaultsearchfields` | Fields shown by default in the search panel |
| `pinnedsearchfields` | Fields the user cannot remove from the search panel |
| `requiredsearchfields` | Fields that must be filled before search executes |
| `fetchsize` | Maximum records loaded (calendar) |
| `orderby` | Default sort order |

### User Input Behavior

| Property | What it controls |
|----------|-----------------|
| `initialfocus` | Which field gets focus when a dialog/group opens |
| `freeinput` | Whether a LOV allows typed values not in the list |
| `required` | Whether a value must be entered before saving |
| `regexp` | Pattern validation on a text field |
| `multiline` | Renders a field as a textarea |
| `format` | How the value is formatted for display |
| `maxlength` | Maximum character count |
| `defaulttoprevious` | Pre-fill from user's last-used value |

### Save and Edit Behavior

| Property | What it controls |
|----------|-----------------|
| `editmode` | How list rows enter edit mode (SingleCellEdit, MultiRowEdit, etc.) |
| `savemode` | When changes are saved (Default, Buffer, Unbound) |
| `copyoncruddefault` | Keys auto-copied from parent to new child records |

### Status and Color

| Property | What it controls |
|----------|-----------------|
| `emphasis` | Color constant mapped to a boolean condition |
| `defaultemphasis` | Default color swatch for a color picker control |
| `completed` | Partial-fill percentage on a state indicator |
| `truelabel` / `falselabel` | Text labels for boolean true and false states |

### Navigation and Drill-Down

| Property | What it controls |
|----------|-----------------|
| `details` | Drill-down page when a row, bar, or node is clicked |
| `startupmode` | Whether page opens in search or edit mode |
| `staticlabel` | Breadcrumb label for non-navigator pages |

### Calendar and Time Views

| Property | What it controls |
|----------|-----------------|
| `start` / `end` | TIMESTAMP attributes for event start and end |
| `startdate` / `enddate` | DATE attributes for event start and end (no time) |
| `allday` | Whether events span the full day |
| `view` | Which calendar views are enabled |
| `slotsize` | Time slot granularity (Hour or Day) |
| `timemarker` | Current-time red-line indicator |
| `resource` | Resource grouping dimension |
| `grouping` | Grouping attribute for calendar lanes |
| `weeknumbers` | Show week numbers |
| `weekstart` | First day of the week |
| `workdaystart` / `workdayend` | Work schedule shading bounds |
| `fetchsize` | Maximum records loaded |

---

## See Also

- [[Emphasis and Colors]] — full reference for all color constants used with `emphasis`
- [[Fields and LOV]] — `field` and `lov` keyword deep-dive including `validate command`
- [[Commands and Expressions]] — `execute`, `bulkexecute`, `enabled`, `visible`, `mode`
- [[List]] — `editmode`, `savemode`, `filter`, `summary`, `initialview`, `fieldranking` in context
- [[Display Controls]] — `badge`, `bool`, `state`, `computed` with full examples
- [[Input Controls]] — `currency`, `radio`, `rating`, `picker` with full examples
- [[Data Views]] — `calendar`, `timeline`, `tree`, `gantt` with their full property sets
