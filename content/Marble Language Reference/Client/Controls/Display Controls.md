---
title: Display Controls
publish: true
tags:
  - ifs-marble/client
  - ifs-marble/construct
aliases:
  - badge
  - boolean field
  - stateindicator
  - state indicator
  - computed field
  - computedfield
  - static field
  - staticfield
  - markdown text
  - markdowntext
  - progress field
  - progressfield
related:
  - '[[Emphasis and Colors]]'
  - '[[Fields and LOV]]'
  - '[[List]]'
  - '[[Group]]'
---

# Display Controls

Display controls present data in specialized visual formats. Most are read-only (or conditionally editable) and use [[Emphasis and Colors|emphasis]] to communicate status visually. They contrast with `field` — a `field` renders as a plain text input; display controls render as chips, toggles, progress bars, or formatted text blocks.

| Control | Comparable to | Purpose |
|---------|--------------|---------|
| `badge` | Material UI Chip, Bootstrap Badge, Ant Design Tag | Color-coded status or category chip |
| `boolean` | Styled toggle / checkbox in display mode | Yes/No with custom labels and colors |
| `stateindicator` | Status badge, stepper indicator | State machine state with standard IFS colors |
| `computedfield` | React derived state, Vue computed property | Client-side calculated display value |
| `staticfield` | `<span>` / read-only label | Fixed text or interpolated display string |
| `markdowntext` | `<ReactMarkdown>`, `dangerouslySetInnerHTML` | Rich Markdown-formatted text block |
| `progressfield` | HTML `<progress>`, React ProgressBar | Stacked progress visualization |

---

## `badge`

A colored chip displaying a field's value. Uses [[Emphasis and Colors|emphasis]] to apply color based on the value. Appears inline inside a `list`, `group`, or `card`.

> [!abstract] Syntax
> ```marble
> badge <AttrName> {
>    label    = "<label>";
>    style    = <TextOnly | IconOnly>;    -- default: text + color background
>    icon     = "<icon-name>";
>    emphasis <ColorConstant> = [<expression>];
>    visible  = [<expression>];
> }
> ```

```plvc
-- Status badge mapped to IFS state colors:
badge Objstate {
   label = "Status";
   emphasis StateOpen      = [Objstate = "Open"];
   emphasis StateReleased  = [Objstate = "Released"];
   emphasis StateCompleted = [Objstate = "Completed"];
   emphasis StateClosed    = [Objstate = "Closed"];
   emphasis StateCancelled = [Objstate = "Cancelled"];
}

-- Category badge with complementary colors:
badge PriorityLevel {
   label = "Priority";
   emphasis Complementary1 = [PriorityLevel = "High"];
   emphasis Complementary9 = [PriorityLevel = "Medium"];
   emphasis Complementary3 = [PriorityLevel = "Low"];
}

-- Icon-only badge for a boolean flag column:
badge HasAttachments {
   style   = IconOnly;
   icon    = "paperclip";
   emphasis Complementary3 = [HasAttachments = "TRUE"];
   visible = [HasAttachments = "TRUE"];
}
```

> [!tip] Replace `field Objstate` with `badge Objstate` in Lists
> A `field Objstate` shows raw text like "Released". A `badge Objstate` with emphasis shows a green chip labeled "Released". Users scanning a long list can identify status at a glance from color alone. This single change dramatically improves list readability.
>
> Compare to: **Material UI Chip** with `color` prop, **Bootstrap Badge** with contextual classes.

---

## `boolean`

Renders a boolean attribute as a styled toggle with custom true/false labels and optional emphasis colors. Can be editable (toggle) or read-only (colored display).

> [!abstract] Syntax
> ```marble
> boolean <AttrName> {
>    label      = "<label>";
>    truelabel  = "<text when true>";     -- default: "Yes"
>    falselabel = "<text when false>";    -- default: "No"
>    emphasis <ColorConstant> = [<expression>];
>    editable = [<expression>];
>    visible  = [<expression>];
> }
> ```

```plvc
-- Read-only boolean with semantic colors:
boolean IsActive {
   label      = "Active";
   truelabel  = "Active";
   falselabel = "Inactive";
   emphasis StateReleased  = [IsActive = "TRUE"];
   emphasis StateCancelled = [IsActive = "FALSE"];
}

-- Editable toggle in a form group:
boolean ApprovalRequired {
   label      = "Requires Approval";
   truelabel  = "Yes";
   falselabel = "No";
   editable   = [UserRole = "Admin"];
}

-- Minimal: default labels (Yes/No), no emphasis
boolean IsConfirmed;
```

> [!note] Default Labels Are "Yes" and "No"
> Override them whenever the field's semantics are more specific. Users understand "Active / Inactive" faster than "Yes / No" when the field name is `IsActive`.

---

## `stateindicator`

Shows the current state of an entity's state machine. Renders as a colored bubble or status chip using the standard IFS [[Emphasis and Colors|state color constants]]. Optionally shows a completion percentage for in-progress states.

> [!abstract] Syntax
> ```marble
> stateindicator <AttrName> {
>    label     = "<label>";
>    emphasis <StateConstant> = [<expression>];
>    completed = <percentage>;    -- 0-100%, for partial-completion display
> }
> ```

```plvc
-- Standard Objstate indicator:
stateindicator Objstate {
   label = "Status";
   emphasis StatePreliminary = [Objstate = "Preliminary"];
   emphasis StateOpen        = [Objstate = "Open"];
   emphasis StatePlanned     = [Objstate = "Planned"];
   emphasis StateReleased    = [Objstate = "Released"];
   emphasis StateCompleted   = [Objstate = "Completed"];
   emphasis StateClosed      = [Objstate = "Closed"];
   emphasis StateCancelled   = [Objstate = "Cancelled"];
}

-- With completion percentage for an in-progress state:
stateindicator WorkStatus {
   emphasis StateActive = [WorkStatus = "InProgress"];
   completed = 50%;     -- renders a half-filled bubble for in-progress
}
```

> [!tip] `stateindicator` vs `badge` for Status
> Both can display a colored status. Use **`stateindicator`** for state-machine states (entities with formal `Objstate` workflow transitions). Use **`badge`** for non-state attributes like category, priority, or type. The visual rendering differs slightly — `stateindicator` uses a bubble/dot style, `badge` uses a chip/tag style.

---

## `computedfield`

A client-side calculated display value. Doesn't exist as an attribute in the projection — it's computed in the browser from other attribute values via string interpolation or arithmetic aggregates.

> [!abstract] Syntax
> ```marble
> computedfield <Name> {
>    label   = "<label>";
>    value   = "<${Attr} interpolation or expression>";
>    type    = <Text | Number | Boolean | ...>;
>    format  = <decimal | ifscurrency | percentage | uppercase | lowercase | longtime>;
>    visible = [<expression>];
> }
> ```

```plvc
-- Combine two attributes into one display column:
computedfield FullName {
   label = "Name";
   value = "${FirstName} ${LastName}";
   type  = Text;
}

-- Sum child record values (array aggregate):
computedfield TotalOrderValue {
   label  = "Total";
   value  = "${sum(OrderLines.LineAmount)}";
   type   = Number;
   format = ifscurrency;
}

-- Percentage from two attributes:
computedfield CompletionRate {
   label  = "Completion";
   value  = "${CompletedCount / TotalCount * 100}";
   type   = Number;
   format = percentage;
}

-- Conditional text:
computedfield OverdueLabel {
   label   = "Overdue";
   value   = "OVERDUE";
   visible = [DueDate < Today];
}
```

> [!note] Client-Side Only — Does Not Persist
> `computedfield` values are calculated in the browser. They don't write to the database, can't be searched/filtered on, and don't appear in exports unless explicitly handled. For values that need persistence or server-side filtering, add a real attribute to the projection entity (computed server-side).
>
> Compare to: **Vue.js computed properties**, **React `useMemo`**, **Angular pipes**, **Svelte derived stores**.

### Available Aggregate Functions

| Function | Description |
|----------|-------------|
| `sum(Array.Attr)` | Sum of attribute over child array |
| `avg(Array.Attr)` | Average |
| `min(Array.Attr)` | Minimum value |
| `max(Array.Attr)` | Maximum value |
| `count(Array)` | Count of records in array |

---

## `staticfield`

A read-only display control that shows fixed text or an interpolated string. Unlike `computedfield`, there is no arithmetic — only string composition.

> [!abstract] Syntax
> ```marble
> staticfield <Name> {
>    label   = "<label>";
>    value   = "<text or ${Attr} interpolation>";
>    visible = [<expression>];
> }
> ```

```plvc
-- Display a composed description:
staticfield RecordSummary {
   label = "Summary";
   value = "Order ${OrderNo} placed on ${OrderDate} by ${CustomerName}";
}

-- Conditional warning message:
staticfield ArchivedWarning {
   value   = "This record is archived and cannot be modified.";
   visible = [IsArchived = "TRUE"];
}

-- Display a calculated server attribute as read-only text:
staticfield CreatedByInfo {
   label = "Created by";
   value = "${CreatedBy} on ${CreatedDate}";
}
```

> [!tip] Use `staticfield` for Context Labels in Dialogs
> Dialogs often need to show the parent record's key values as context (e.g., "Adding line to Order: ORD-001234"). A `staticfield` is the cleanest way to do this — just interpolate the key attribute from the virtual/structure.

---

## `markdowntext`

Renders a block of Markdown-formatted text. Used for instructions, dynamic notices, help text, or any rich content that needs formatting (bold, headers, lists, links).

> [!abstract] Syntax
> ```marble
> markdowntext <Name> {
>    text      = "<Markdown content or ${Attr} interpolation>";
>    emphasis <ColorConstant> = [<expression>];
>    visible   = [<expression>];
> }
> ```

```plvc
-- Static instructions in a dialog header:
markdowntext InstructionText {
   text = "## Step 1: Select a Site\n\nChoose the site where the work will be performed. Required fields are marked **bold**.";
}

-- Dynamic notice with conditional emphasis:
markdowntext OverdueWarning {
   text      = "**Warning:** This order is overdue by ${OverdueDays} days. Delivery date was ${DueDate}.";
   emphasis Alert = [IsOverdue = "TRUE"];
   visible   = [IsOverdue = "TRUE"];
}

-- Info callout:
markdowntext ReadOnlyNotice {
   text    = "> **Read-only mode**: This record is locked because it has been approved.";
   visible = [IsApproved = "TRUE"];
}
```

> [!note] Compare to Web Frameworks
> `markdowntext` is like React's `<ReactMarkdown>` component or `dangerouslySetInnerHTML` with a markdown renderer. Content is evaluated at render time and is not reactive to real-time field changes within the same page load — it updates on navigation.

---

## `htmltext`

"Static html text for explanations on pages etc." — like `markdowntext`, but with raw HTML markup instead of Markdown syntax.

> [!abstract] Syntax
> ```marble
> htmltext [bind <SourceRef>] {
>    [visible = [<condition>];]   -- optional, defaults to true
>    text = "<HTML content, with ${Attr} interpolation>";
> }
> ```

```marble
htmltext {
   visible = [condition]; -- Optional, defaults to true
   text = "<h1>Test for Activity with state: ${Objstate}<h1>
   <p>And Some paragraph text<p>";
}
```

> [!warning] Confirmed valid only inside `repeatingsection`
> Marble's grammar lists `htmltext`'s only direct parent as `RepeatingSectionContent` (see [[../Layout/Layout Controls#`repeatingsection`|Layout Controls → repeatingsection]]) — unlike `markdowntext`, which can be placed more broadly. If you need raw HTML elsewhere, double check whether `markdowntext` (which also accepts inline HTML in many renderers) covers the need first.

---

## `progressfield`

A horizontal stacked bar visualization. Shows how a total is divided into segments, where each segment has a value, color, and label.

> [!abstract] Syntax
> ```marble
> progressfield <Name> {
>    label      = "<outer label>";
>    total      = <AttrName>;     -- attribute holding the total amount
>    visible    = [<expression>];
>
>    value <SegmentName> {
>       emphasis <ColorConstant> = [<expression>];
>       valuelabel = <AttrName>;
>    }
> }
> ```

```plvc
-- Order fulfillment progress:
progressfield FulfillmentProgress {
   label = "Fulfillment";
   total = TotalQty;

   value ShippedSegment {
      emphasis StateCompleted = [true];
      valuelabel = ShippedQty;
   }
   value PlannedSegment {
      emphasis StatePlanned = [true];
      valuelabel = PlannedQty;
   }
   value RemainingSegment {
      emphasis StateCancelled = [true];
      valuelabel = RemainingQty;
   }
}
```

> [!note] Compare to HTML
> `progressfield` is like a segmented HTML `<progress>` bar, or a stacked bar chart component (React `ProgressBar` from react-bootstrap with multiple `variant` segments). The `total` attribute anchors the 100% mark.

---

## Patterns & Tips

> [!tip] Badge in Lists, State Indicator in Headers
> A common pattern: `badge Objstate` in list columns (compact, scannable) and `stateindicator Objstate` in page header groups (more prominent, with the full state label). They reference the same attribute — the choice is purely about visual hierarchy.

> [!tip] `computedfield` for Display, Projection Attribute for Logic
> If a computed value needs to drive `editable`/`visible` expressions elsewhere on the page, compute it in the projection (server-side attribute or virtual attribute). `computedfield` is browser-only and can't be used in other field's expressions.

> [!warning] Display Controls Don't Accept User Input
> `badge`, `stateindicator`, `staticfield`, `markdowntext`, and `progressfield` are always read-only. To allow editing a boolean or status, use a `field <AttrName>` with the appropriate `editable` expression — not a `boolean` display control.

---

## See Also

- [[Emphasis and Colors]] — the color system all display controls use
- [[Fields and LOV]] — `field` for standard editable input/display
- [[Input Controls]] — editable counterparts (radio buttons, rating controls, etc.)
- [[List]] — where display controls most commonly appear as columns
- [[Card and Sheet]] — card layouts that aggregate display controls
