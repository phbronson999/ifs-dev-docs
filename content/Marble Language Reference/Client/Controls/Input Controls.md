---
title: Input Controls
tags:
  - ifs-marble/client
  - ifs-marble/construct
aliases:
  - currency field
  - measure field
  - currency measure
  - date range field
  - daterangefield
  - datetimepicker
  - date time picker
  - colorpicker
  - color picker
  - radiogroup
  - radio button
  - ratingcontrol
  - rating control
  - itempicker
  - item picker
  - addressfield
  - address field
  - signature
related:
  - "[[Fields and LOV]]"
  - "[[Group]]"
  - "[[Emphasis and Colors]]"
---

# Input Controls

Input controls are specialized form controls beyond the standard `field` and `lov`. They handle structured inputs (dates, units, addresses), selection patterns (radio groups, item pickers), and media capture (signature, color). All support `editable`, `visible`, `required`, and `label` unless noted.

| Control | Comparable to | Purpose |
|---------|--------------|---------|
| `currency` / `measure` | `<input>` + `<select>` unit combo | Numeric value paired with a unit (currency code or unit of measure) |
| `daterangefield` | Date range picker (e.g., react-datepicker range) | Start + end date selection in one control |
| `datetimepicker` | `<input type="datetime-local">` | Explicit date + time selection |
| `colorpicker` | Color swatch palette picker | Select a predefined color from a palette |
| `radiogroup` | `<input type="radio">` group | Mutually exclusive option selection |
| `ratingcontrol` | Star rating widget (React Stars, Ant Design Rate) | Numeric rating on a 1–N scale |
| `itempicker` | Dual-list transfer widget (e.g., Ant Design Transfer) | Move items between Available and Selected lists |
| `addressfield` | Structured address form | Multi-line address entry |
| `signature` | Signature pad | Freehand signature capture |

---

## `currency` and `measure`

A composite control pairing a **numeric value** with a **unit** (currency code or unit of measure). The unit can come from an entityset lookup and be editable or read-only independently of the value.

> [!abstract] Syntax
> ```marble
> currency <ValueAttr>(<UnitAttr>) {
>    label            = "<label>";
>    unitlookup <EntitySet>(<UnitKeyAttr>);
>    unitselector <SelectorName>;
>    uniteditable     = [<expression>];    -- false: unit read-only, value editable
>    unitvisible      = [<expression>];
>    unitrequired     = [<expression>];
>    unitexportlabel  = "<Excel column header for the unit column>";
>    format           = <decimal | ifscurrency | percentage>;
>    preserveprecision = [<boolean>];
>    editable         = [<expression>];
>    visible          = [<expression>];
>    required         = [<boolean>];
>    showlabel        = [<boolean>];
>    searchable       = [<boolean>];
>    size             = <Small | Medium | Large | FullWidth>;
>    validate command { execute { ... } }
> }
>
> -- Measure works identically but the unit entity is IsoUnit instead of IsoCurrency:
> measure <ValueAttr>(<UnitAttr>) {
>    unitlookup <EntitySet>(<UnitKeyAttr>);
>    unitselector <SelectorName>;
>    ...
> }
> ```

```plvc
-- Currency field: Amount in CurrencyCode, unit editable only on new records
currency EntryFee(CurrencyCode) {
   label           = "Entry Fee";
   unitlookup IsoCurrencyEntitySet(CurrencyCode);
   unitselector IsoCurrencySelector;
   uniteditable    = [isNew];        -- lock currency after initial save
   format          = ifscurrency;
   preserveprecision = [true];
   validate command {
      execute {
         if [Amount > 10] {
            alert("Amount greater than 10");
         }
      }
   }
}

-- Measure field: Quantity in a unit of measure
measure OrderQty(UnitOfMeasure) {
   label        = "Order Quantity";
   unitlookup IsoUnitEntitySet(UnitOfMeasure);
   unitselector IsoUnitSelector;
   uniteditable = [isNew];
   format       = decimal;
}

-- Read-only unit (no unitlookup needed when unit is never editable):
currency BudgetAmount(BudgetCurrency) {
   label        = "Budget";
   uniteditable = [false];
   format       = ifscurrency;
}
```

> [!tip] `uniteditable = [isNew]` Is the Standard Pattern
> Currency and unit fields are almost always set at record creation and never changed afterward. `uniteditable = [isNew]` (where `isNew` evaluates true when `ETag = null`) enforces this naturally.
>
> Compare to: a React form where the currency `<select>` is disabled once the record has been saved.

> [!note] `preserveprecision`
> When enabled, the value stores more decimal places than the format displays. For example, `format = ifscurrency` might show 2 decimals, but with `preserveprecision = [true]`, all digits are preserved and become visible when the user edits the field.

---

## `daterangefield`

A control that captures both a start date and an end date in a single UI component. The user picks a date range using a calendar widget.

> [!abstract] Syntax
> ```marble
> daterangefield <Name> {
>    label       = "<label>";
>    size        = <Small | Medium | Large | FullWidth>;
>    editable    = [<boolean>];
>    visible     = [<boolean>];
>    required    = [<boolean>];
>    searchable  = [<boolean>];
>    filterlabel = "<label in search/filter panel>";
> }
> ```

```plvc
daterangefield AbsencePeriod {
   label      = "Absence Period";
   size       = Medium;
   required   = [true];
   filterlabel = "Period";
}
```

> [!note] The Attribute Must Hold Both Dates
> The attribute named in `daterangefield` must be a structured date range type in the projection — it stores both start and end. This is different from two separate `field StartDate` and `field EndDate` declarations.

---

## `datetimepicker`

An explicit date and time input control. Used for attributes that store a `TIMESTAMP` and require the user to specify both the date and the time-of-day portion. Optionally shows seconds.

> [!abstract] Syntax
> ```marble
> datetimepicker <AttrName> {
>    label    = "<label>";
>    format   = longtime;    -- include seconds display; omit for HH:MM only
>    size     = <Small | Medium | Large | FullWidth>;
>    editable = [<expression>];
>    visible  = [<expression>];
> }
> ```

```plvc
datetimepicker ScheduledStart {
   label  = "Scheduled Start";
   size   = Medium;
}

-- With seconds display:
datetimepicker ActualClockIn {
   label  = "Clock In";
   format = longtime;    -- renders HH:MM:SS instead of HH:MM
}
```

> [!note] `datetimepicker` vs `field` for Timestamps
> A standard `field <TimestampAttr>` will also display a date+time input based on the projection data type. Use `datetimepicker` explicitly when you need `format = longtime` (seconds), or when the visual distinction from a plain date field matters in context.

---

## `colorpicker`

A palette-based color selector. The user picks from a predefined set of IFS color swatches. The selected color is stored as a string constant in the attribute.

> [!abstract] Syntax
> ```marble
> colorpicker <AttrName> {
>    label            = "<label>";
>    defaultemphasis <ColorpickerN> = [true];    -- default selected swatch
>    editable         = [<expression>];
>    size             = <Small | Medium | Large | FullWidth>;
> }
> ```

```plvc
colorpicker CategoryColor {
   label           = "Category Color";
   defaultemphasis Colorpicker4 = [true];   -- 5th palette color as default
   editable        = [IsEditable];
}
```

> [!note] Color Constants: `Colorpicker0` – `Colorpicker18`
> The palette has 19 pre-defined colors (indices 0–18). The selected value is stored in the attribute as the constant name string. See [[Emphasis and Colors]] for the `boximage` usage pattern that pairs with color picker values.

---

## `radiogroup`

A set of mutually exclusive radio buttons. Used for attributes with a small fixed set of options where seeing all choices at once is better than a dropdown. Corresponds to an [[Enumeration|enumeration]] or a fixed value set.

> [!abstract] Syntax
> ```marble
> radiogroup <AttrName> {
>    label              = "<label>";
>    size               = <Small | Medium | Large>;
>    editable           = [<expression>];
>    visible            = [<expression>];
>    required           = [<boolean>];
>    showlabel          = [<boolean>];
>    defaulttoprevious  = [<boolean>];    -- remember last selection in user profile
>    validate command { execute { ... } }
> }
> ```

```plvc
-- Schedule type selection:
radiogroup ScheduleOption {
   label    = "Schedule";
   editable = [TaskOption = "Schedule"];
   validate command {
      execute {
         if [ScheduleOption = "Daily"] {
            set ScheduledDays = null;
         }
      }
   }
}

-- Simple inline radio group:
radiogroup TaskOption {
   label = "Run";
   size  = Small;
}
```

> [!tip] Radio vs LOV: When to Choose Radio
> Use **`radiogroup`** when: there are 2–4 options, all options are equally valid to see upfront, and the choice affects other fields (triggering validate commands). Use a **`lov`** when: there are many options, the options change dynamically, or the list is fetched from the database.
>
> Compare to: React's `<RadioGroup>` (Material UI), HTML `<input type="radio">` group.

---

## `ratingcontrol`

A star (or numeric scale) rating input. The user clicks to set a rating from 1 to `maxrating`.

> [!abstract] Syntax
> ```marble
> ratingcontrol <AttrName> {
>    label     = "<label>";
>    maxrating = <N | AttrName>;    -- integer 1-10, or an attribute holding the max
>    showlabel = [<boolean>];
>    size      = <Small | Medium | Large | FullWidth>;
> }
> ```

```plvc
-- 5-star rating (fixed):
ratingcontrol CustomerSatisfaction {
   label     = "Satisfaction";
   maxrating = 5;
}

-- Dynamic max rating from an attribute:
ratingcontrol SkillLevel {
   label     = "Skill Level";
   maxrating = MaxSkillLevel;    -- from the entity
}
```

> [!note] Stored as a Number
> The underlying attribute is a numeric value (1 to `maxrating`). The control renders it visually as filled stars — the storage is a plain integer in the database.

---

## `itempicker`

A dual-list transfer control. Users move items from an "Available" list to a "Selected" list. Equivalent to Ant Design's Transfer component or any dual-list multi-select pattern.

> [!abstract] Syntax
> ```marble
> itempicker <Name> using <EntitysetName>(<EntityRef>) {
>    label               = "<label>";
>    displayvalue        = <AttrName>;       -- attribute to show in the lists (required)
>    orderby             = <AttrName> asc;
>    filter              = [<condition>];
>    availableitemslabel = "<Available list header>";
>    selecteditemslabel  = "<Selected list header>";
>    compactmode         = [<boolean>];      -- compact: shows selected only, full control on click
>    enableordering      = [<boolean>];      -- allow user to reorder selected items
>    editable            = [<boolean>];
>    visible             = [<boolean>];
> }
> ```

```plvc
-- Language selection picker:
itempicker LanguagePicker using LanguageEntitySet(LanguageRef) {
   label               = "Supported Languages";
   displayvalue        = LanguageName;
   orderby             = LanguageName asc;
   availableitemslabel = "Available Languages";
   selecteditemslabel  = "Selected Languages";
}

-- Compact mode with ordering:
itempicker NotificationGroupPicker using NotificationGroupSet(GroupRef) {
   label               = "Notification Groups";
   displayvalue        = GroupName;
   filter              = [ActiveFlag = "TRUE"];
   compactmode         = [true];
   enableordering      = [true];
}
```

> [!tip] `displayvalue` Is Required
> The `itempicker` has no implicit way to know which attribute to show in the lists. `displayvalue = <AttrName>` is mandatory. Without it, the lists render empty.
>
> Compare to: **Ant Design Transfer**, **React DualListBox**, Windows "Add/Remove" dialog.

---

## `addressfield`

A structured multi-line address input control. Renders as a composite control with standard address sub-fields (street, city, postal code, country).

> [!abstract] Syntax
> ```marble
> addressfield <AttrName> {
>    label       = "<label>";
>    size        = <Small | Medium | Large | FullWidth>;
>    editable    = [<boolean>];
>    visible     = [<boolean>];
>    required    = [<boolean>];
>    searchable  = [<boolean>];
>    showlabel   = [<boolean>];
>    filterlabel = "<label in search panel>";
> }
> ```

```plvc
addressfield DeliveryAddress {
   label    = "Delivery Address";
   editable = [OrderStatus = "Open"];
   required = [true];
}

-- Read-only display with search/filter support:
addressfield BillingAddress {
   label      = "Billing Address";
   editable   = [false];
   searchable = [true];
}
```

---

## `signature`

A freehand signature capture pad. The user draws their signature on screen. The result is stored as an image or binary attribute.

> [!abstract] Syntax
> ```marble
> signature <AttrName> {
>    label    = "<label>";
>    size     = <Small | Medium | Large | FullWidth>;
>    editable = [<expression>];
>    visible  = [<expression>];
> }
> ```

```plvc
signature ApprovalSignature {
   label    = "Approval Signature";
   size     = Medium;
   editable = [ApprovalStatus = "Pending"];
   visible  = [RequiresSignature = "TRUE"];
}
```

> [!info] Not the same as `digitalsignature`
> `signature` (above) captures a drawn signature image on a single field. `digitalsignature` is a separate, list/group-level construct for hash-based signed-content tracking — see [[../Layout/List#`digitalsignature`|List → digitalsignature]].

---

## `fileselector`

A file upload control with `onfileselect`/`onfiledelete` command hooks.

> [!abstract] Syntax
> ```marble
> fileselector [<Name>] {
>    [enabled  = [<expression>];]
>    [multifile = [<boolean>];]
>    [init command { ... }]
>    [onfileselect { ( variable ...; | execute { ... } )+ }]
>    [onfiledelete { ( variable ...; | execute { ... } )+ }]
>    label = "<label>";   -- one or more
> }
> ```

Valid inside a `dialog` or `assistant`'s content.

### `onfileselect`

"onfileselect command for a file selector" — fires when the user picks a file.

```marble
onfileselect {
   execute {
      call FetchDefaults();
   }
}
```

### `onfiledelete`

"onfiledelete command for a file deletion" — fires when the user removes a previously selected file.

```marble
onfiledelete {
   execute {
      call FetchDefaults();
   }
}
```

---

## Patterns & Tips

> [!tip] `currency`/`measure` Pattern: Lock Unit After Creation
> Use `uniteditable = [ETag = null]` (or an equivalent `isNew` check) to allow unit selection only when creating a new record. Changing a currency or unit of measure on an existing record with transaction history is almost always a data integrity problem.

> [!tip] `radiogroup` + `validate command` for Conditional Sections
> When the radio selection controls what other fields are visible/required, add a `validate command` that sets dependent fields to null when the option changes. This keeps the form clean and prevents stale data in hidden fields.

> [!warning] `itempicker` Requires an Entityset
> Unlike a `lov` (which uses a fragment selector), `itempicker` binds directly to an entityset using the `using` keyword. That entityset must be declared in the projection with the correct entity type. The `<EntityRef>` parameter maps selected items back to the parent entity.

---

## See Also

- [[Fields and LOV]] — standard `field` and `lov` for most input scenarios
- [[Group]] — the form container where input controls are placed
- [[Display Controls]] — read-only counterparts
- [[Emphasis and Colors]] — for `colorpicker` color constants
- [[Enumeration]] — the projection construct powering `radiogroup` options
