---
title: Emphasis and Colors
publish: true
tags:
  - ifs-marble/client
  - ifs-marble/concept
aliases:
  - emphasis property
  - color constants
  - contextual colors
  - state colors
  - Complementary
  - StateOpen
related:
  - '[[Display Controls]]'
  - '[[List]]'
  - '[[Charts]]'
---

# Emphasis and Colors

`emphasis` is the Marble property that controls the ==color== of a visual control. It maps a boolean expression to a named color constant. Almost every visual control — badges, booleans, state indicators, chart bars, timeline entries — uses `emphasis` to communicate status, category, or urgency.

This is Marble's equivalent of a `color` or `variant` prop in React component libraries (Material UI, Ant Design, Chakra UI), or a CSS utility class like `bg-green-500` in Tailwind.

---

## Syntax

> [!abstract] Syntax
> ```marble
> emphasis <ColorConstant> = [<boolean expression>];
>
> -- Multiple rules — first match wins:
> emphasis StateOpen      = [Objstate = "Open"];
> emphasis StateReleased  = [Objstate = "Released"];
> emphasis StateClosed    = [Objstate = "Closed"];
>
> -- Always-on default (catch-all):
> emphasis Complementary3 = [true];
> ```

Rules are evaluated **top to bottom**. Only the first matching rule is applied.

---

## State Color Constants

Used for controls that communicate the state of a state machine entity. These are IFS-standard colors — using them consistently across pages means users learn the color-to-meaning mapping once and it applies everywhere in the application.

| Constant | Standard Color | Typical meaning |
|----------|---------------|-----------------|
| `StatePreliminary` | Dark Blue | Draft, not yet started |
| `StateOpen` | Dark Blue | Active and open |
| `StatePlanned` | Light Blue | Scheduled for future |
| `StateActive` | Yellow | Currently being worked on |
| `StatePrepared` | Yellow | Ready to proceed |
| `StatePosted` | Yellow | Submitted / posted |
| `StateDefined` | Yellow | Defined but not started |
| `StateTransferred` | Yellow | Handed off |
| `StateReleased` | Green | Approved / released |
| `StateCompleted` | Green | Done / finished |
| `StateBlocked` | Pink | Blocked / error |
| `StateStopped` | Pink | Halted |
| `StateClosed` | Dark Grey | Closed / archived |
| `StateCancelled` | Light Grey | Cancelled |

> [!tip] Map `Objstate` to These Constants
> Every IFS entity with a state machine has an `Objstate` attribute. Map its values to these constants in your `stateindicator` and `badge` controls. This keeps color semantics consistent across the entire application — what green means in one screen, it means everywhere.

---

## Complementary Color Constants

Used for categorical distinctions — grouping records by category, highlighting specific values, adding visual variety without state-machine semantics.

| Constant | Color |
|----------|-------|
| `Complementary1` | Pink |
| `Complementary2` | Light Pink |
| `Complementary3` | Blue |
| `Complementary4` | Light Blue |
| `Complementary5` | Teal / Dark |
| `Complementary6` | Light Teal |
| `Complementary7` | Purple |
| `Complementary8` | Light Purple |
| `Complementary9` | Orange |
| `Complementary10` | Light Orange |
| ... | ... |
| `Complementary18` | (pale variant) |

Odd-numbered constants are the main colors; even-numbered are lighter variants of the preceding odd constant.

> [!note] Verify Colors Against the Icon Library
> The exact hex values can change between IFS versions. The authoritative source is the Icon Library at `https://<your-server>/main/ifsapplications/web/iconlibrary`. The base URL (`<your-server>`) must be replaced with your environment's application server address.

---

## Color Picker Constants

Used specifically with the [[Input Controls#Color Picker|color picker]] control to set the default selected color.

| Range | Usage |
|-------|-------|
| `Colorpicker0` – `Colorpicker18` | Pre-defined palette entries for the color picker control |

```plvc
colorpicker CategoryColor {
   defaultemphasis Colorpicker4 = [true];   -- starts with the 5th palette color selected
}
```

---

## Where `emphasis` Is Used

| Control | What it colors |
|---------|----------------|
| [[Display Controls#Badge\|Badge]] | The chip background/text color |
| [[Display Controls#Boolean\|Boolean]] | The true/false toggle color |
| [[Display Controls#State Indicator\|State Indicator]] | The state bubble background |
| [[Display Controls#Progress Field\|Progress Field]] | Progress bar segment color |
| [[Charts#Bar Chart\|Bar Chart]] | Individual bars |
| [[Charts#Line Chart\|Line Chart]] | Line series |
| [[Charts#Funnel Chart\|Funnel Chart]] | Funnel segments |
| [[Charts#Pie Chart\|Pie Chart]] | Pie slices |
| [[Data Views#Timeline\|Timeline]] | Entry color |
| [[Data Views#Tree Diagram\|Tree Diagram]] | Node color stripe |
| [[Data Views#Box-matrix\|Box-matrix]] | Box border top color |
| [[Data Views#Calendar\|Calendar]] | Event chip color |
| [[Display Controls#Markdown Text\|Markdown Text]] | Text/background color |

---

## Examples

```plvc
-- State indicator: Objstate → standard IFS state colors
stateindicator Objstate {
   emphasis StatePreliminary = [Objstate = "Preliminary"];
   emphasis StateOpen        = [Objstate = "Open"];
   emphasis StateReleased    = [Objstate = "Released"];
   emphasis StateCompleted   = [Objstate = "Completed"];
   emphasis StateClosed      = [Objstate = "Closed"];
   emphasis StateCancelled   = [Objstate = "Cancelled"];
}

-- Badge: map a category attribute to colors (A/B/C priority)
badge PriorityLevel {
   label = "Priority";
   emphasis Complementary1 = [PriorityLevel = "High"];
   emphasis Complementary3 = [PriorityLevel = "Medium"];
   emphasis Complementary5 = [PriorityLevel = "Low"];
}

-- Boolean with semantic colors:
boolean IsActive {
   truelabel  = "Active";
   falselabel = "Inactive";
   emphasis StateReleased  = [IsActive = "TRUE"];
   emphasis StateCancelled = [IsActive = "FALSE"];
}

-- Catch-all default at the bottom:
badge RiskLevel {
   emphasis Complementary1  = [RiskLevel = "High"];
   emphasis Complementary9  = [RiskLevel = "Medium"];
   emphasis Complementary3  = [true];    -- default: blue for anything else
}
```

---

## Patterns & Tips

> [!tip] First Match Wins — Put Specific Cases First
> Place the most specific conditions at the top and use `= [true]` as the last rule for a fallback color. This is identical to how CSS cascade works — more specific rules earlier, default last.

> [!tip] No `emphasis` = Default Blue/Grey
> If no `emphasis` is defined on a `boolean` or `badge`, true renders blue and false renders grey. For `stateindicator`, a neutral grey is used. Adding even one explicit `emphasis` rule opts the control out of this default.

> [!warning] Emphasis Colors Are Theme-Controlled
> Color constants map to the active IFS theme's palette. You cannot override specific colors with custom CSS without modifying the theme. After an IFS upgrade, re-verify colors against the Icon Library if a color looks wrong.

> [!warning] `emphasis` Is Not a Style Property on `field`
> Standard `field` declarations do not support `emphasis`. To color a field's value, wrap it in a `badge` or `boolean` control instead. If you need row-level coloring in a list, that requires field-level emphasis on a badge column.

---

## See Also

- [[Display Controls]] — `badge`, `boolean`, `stateindicator` use emphasis most heavily
- [[Charts]] — chart controls use emphasis to color series
- [[Data Views]] — `timeline`, `calendar`, `tree diagram` use emphasis for entry colors
- [[Fields and LOV]] — standard fields do not support emphasis directly
