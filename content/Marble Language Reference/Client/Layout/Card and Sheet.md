---
title: Card and Sheet
publish: true
tags:
  - ifs-marble/client
  - ifs-marble/construct
aliases:
  - card control
  - sheet control
  - card view
  - fieldranking card
  - summaryfield
  - card template
related:
  - '[[List]]'
  - '[[Layout Controls]]'
  - '[[Display Controls]]'
  - '[[Data Views]]'
---

# Card and Sheet

`card` and `sheet` are visual container templates used to change how records are rendered in certain views.

| Control | Comparable to | Purpose |
|---------|--------------|---------|
| `card` | React Card component, Material UI Card | A template defining how a single record renders in Card View, Calendar, or Tree Diagram |
| `sheet` | Bottom sheet, drawer overlay | A sub-panel attached to a card, visible conditionally |

---

## `card`

A `card` defines the layout of a single record when it is displayed in **Card View** (a visual alternative to List View in a grid), or when used as a popup/detail template in [[Data Views#Calendar|Calendar]] and [[Data Views#Tree Diagram|Tree Diagram]] controls.

A `card` is a layout template — not a page or a data source. It references attributes from the same entity as the list or calendar it belongs to.

> [!abstract] Syntax
> ```marble
> card <CardName> for <Entity> {
>    label        = "<Card title or ${Attr} interpolation>";
>    fieldranking = <Attr1>, <Attr2>, ...;    -- fields shown when space is limited
>    summaryfield <AttrName>;                 -- emphasized field (top-right, prominent)
>
>    field <AttrName> { size = ...; }
>    badge <AttrName> { emphasis ... }
>    stateindicator <AttrName> { ... }
>    ...
> }
> ```

```plvc
-- Card template for a Shop Order list:
card ShopOrderCard for ShopOrder {
   label        = "${OrderNo}";
   fieldranking = OrderNo, Description, Objstate, PlannedStartDate;
   summaryfield OrderQty;

   field Description {
      size = FullWidth;
   }
   field PlannedStartDate;
   field PlannedEndDate;
   badge Objstate {
      emphasis StateOpen      = [Objstate = "Open"];
      emphasis StateReleased  = [Objstate = "Released"];
      emphasis StateCompleted = [Objstate = "Completed"];
      emphasis StateClosed    = [Objstate = "Closed"];
   }
}

-- Reference the card in the list:
list ShopOrderList for ShopOrder {
   orderby = OrderNo;
   fieldranking OrderNo, Description, Objstate;
   card ShopOrderCard;
   ...
}
```

> [!note] Enabling Card View in a List
> Adding `card <CardName>` to a `list` declaration enables the **CardView** toggle in the list toolbar. Users can switch between the standard row grid (List View) and the card layout. The initial view is controlled by `initialview = CardView` (see [[List#Advanced List Properties]]).

### `fieldranking`

Specifies which attributes are most important to show when card or screen space is limited. In a list, `fieldranking` also controls which columns stay visible at small screen widths (lowest-ranked columns hide first).

```plvc
list OrderList for SalesOrder {
   fieldranking OrderNo, CustomerName, OrderDate, Objstate;
   -- When screen narrows: OrderNo + CustomerName stay; OrderDate + Objstate hide first
   ...
}
```

> [!note] User Profile Overrides Field Ranking
> User-set column visibility preferences are stored in the user profile and take priority over `fieldranking`. `fieldranking` only applies the first time a user sees the page, or when they reset their profile settings.

### `summaryfield`

Places one attribute in a visually emphasized position on the card (typically top-right, right-aligned). Used for the single most important numeric or status value on a record.

```plvc
card ProductCard for InventoryPart {
   label        = "${PartNo} - ${Description}";
   summaryfield ListPrice;    -- displayed prominently at top-right of card
   field Description {
      size = FullWidth;
   }
   field PartNo {
      size = Small;
   }
}
```

---

## `sheet`

A `sheet` is an overlay sub-panel attached to a card. It appears as a small expandable section within the card, typically triggered by an attribute value condition (`visibility`). Used to show additional context without navigating away.

> [!abstract] Syntax
> ```marble
> sheet <SheetName> for <Entity> {
>    label      = "<Sheet title or ${Attr}>";
>    visibility = [<expression>];    -- when to show the sheet tab on the card
>
>    field <AttrName>;
>    badge <AttrName> { ... }
>    ...
> }
>
> -- Reference inside a card:
> card <CardName> for <Entity> {
>    ...
>    sheet <SheetName>;
> }
> ```

```plvc
-- Sheet: shows attachment info when an attachment exists
sheet AttachmentSheet for ShopOrder {
   label      = "Attachments";
   visibility = [$ {
      AttachmentCount
   }
   != ""];   -- only visible when there are attachments

   field AttachmentCount {
      size = Small;
   }
   field LastAttachmentDate;
}

-- Add the sheet to the card:
card ShopOrderCard for ShopOrder {
   label = "${OrderNo}";
   summaryfield OrderQty;
   field Description {
      size = FullWidth;
   }
   badge Objstate { ... }
   sheet AttachmentSheet;
}
```

> [!note] `visibility` vs `visible`
> `sheet` uses **`visibility`** (not `visible`) to control when the sheet tab appears on the card. The expression `[${Attr} = ""]` uses string interpolation syntax — this is specific to the `sheet` control and differs from the standard boolean expression syntax used in `visible = [...]`.

---

## Using Cards in Other Controls

Cards are referenced by name in other controls to provide a popup detail view:

```plvc
-- In a Calendar: clicking an event shows the card as a popup
calendar AbsenceCalendar for EmployeeAbsence {
   ...
   card AbsenceCard;    -- popup when clicking a calendar event
}

-- In a Tree Diagram: clicking a node shows the card
treediagram BusinessUnitDiagram for BusinessUnit {
   ...
   card BusinessUnitCard;
}
```

---

## `cardclick` Command

A command that fires when the user clicks/taps the card itself (as opposed to a field, badge, or button inside it).

> [!abstract] Syntax
> ```marble
> card <Name> for <Entity> {
>    cardclick command {
>       execute {
>          call FetchDefaults();
>       }
>    }
> }
> ```

---

## `swipeactions` — Mobile Swipe Gestures

Configures left/right swipe gesture actions on a card — a mobile UI pattern (swipe left/right to reveal action buttons, similar to email app "archive"/"delete" swipes).

> [!abstract] Syntax
> ```marble
> card <Name> for <Entity> {
>    swipeactions {
>       rightswipe {
>          swipeaction { command CommandName; }   -- Priority 1 (first to appear)
>          swipeaction { command CommandName2; }  -- Priority 2
>       }
>       leftswipe {
>          swipeaction { command CommandName3; }
>       }
>    }
> }
> ```

```marble
swipeactions {
   rightswipe {
      swipeaction {
         command COMMANDNAME; // Priority 1
      }
      swipeaction {
         command COMMANDNAME; // Priority 2
      }
   }
   leftswipe {
      swipeaction {
         command COMMANDNAME; // Priority 1
      }
   }
}
```

`leftswipe`/`rightswipe` each hold one or more `swipeaction { command <Ref>; }` blocks — "Actions triggered on left/right swipe based on Priority order," i.e. the order they're declared determines which swipe-revealed button appears first.

---

## Patterns & Tips

> [!tip] `fieldranking` Is Your Mobile Column Priority List
> Think of `fieldranking` as declaring: "if you can only show N columns, show these first." The first attribute in the list is the most critical — put key IDs, names, and status there.

> [!tip] Cards in Calendar Make Events Informative
> A Calendar entry shows only its `title` attribute by default. Adding a `card` means users can click any event and immediately see the full record details in a popup — without navigating to the detail page. This dramatically reduces page transitions in scheduling workflows.

> [!warning] Card Fields Are Templates, Not Copies
> A `card` declaration doesn't copy or cache data — it references the same attributes as the list it's attached to. Changes to the entity's projection attributes are automatically reflected in the card.

---

## See Also

- [[List]] — where cards are attached to enable Card View
- [[Data Views]] — Calendar, Tree Diagram, and Kanban use cards for event/node/card popups
- [[Display Controls]] — `badge`, `stateindicator` used inside cards
- [[Layout Controls]] — page-level layout containing lists with card views
- [[../Concepts/AI and Copilot|AI and Copilot]] — `aisettings` can also attach directly to a `card`
