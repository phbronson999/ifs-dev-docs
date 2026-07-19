---
title: Advanced Controls
publish: true
tags:
  - ifs-marble/client
  - ifs-marble/construct
aliases:
  - badge
  - measure
  - markdowntext
  - lovswitch
  - fieldranking
  - crudactions
  - contactwidget
  - columnexclude
  - columnvisible
  - defaulttoprevious
  - preview LOV
  - filterexclude
  - using LOV filter
  - collapsed group
  - multiselect list
  - commandgroup
  - global variable
  - idletimer
  - selector
  - showasaction
  - icon command
  - emphasis Primary
related:
  - '[[Fields and LOV]]'
  - '[[List]]'
  - '[[Group]]'
  - '[[Commands and Expressions]]'
  - '[[Assistant]]'
---

# Advanced Controls

This note covers the full set of field-level and layout constructs beyond basic `field` and `lov` declarations — drawn from production files like `ReceiveShopOrder.client` and `ShopFloorWorkbench.client`.

---

## `badge` — State Indicator

A read-only colored chip that shows an entity's state. Used for `Objstate` and other status attributes. Supports configurable color emphasis per value.

```plvc
badge Objstate {
   label = "Status";
   size = Small;
   style = TextOnly;          -- renders as colored text instead of a filled chip
   emphasis Progress1 = [Objstate = "Planned"];
   emphasis Progress3 = [Objstate = "Released"];
   emphasis Progress6 = [Objstate = "Reserved"];
   emphasis Progress9 = [Objstate = "Started"];
   emphasis Progress12 = [Objstate = "Closed"];
   emphasis StateCancelled = [Objstate = "Cancelled"];
   emphasis StateBlocked = [Objstate = "Parked"];
}

-- In a list:
badge TrackedStructureComplete {
   size = Small;
   columnexclude = [not parent.IsMultilevelTrackingEn];
   emphasis Alert = [TrackedStructureComplete = false];
   emphasis Info = [TrackedStructureComplete = true];
   style = TextOnly;
}

-- Highlight a command button:
command IdentifyCommand for Site {
   emphasis Primary = [EmployeeId = null and TeamId = null];
}
```

### Emphasis Tokens

| Token | Color | Typical Use |
|-------|-------|------------|
| `Progress1` | Pale blue | Planned |
| `Progress3` | Blue | Released |
| `Progress6` | Orange | Reserved |
| `Progress9` | Dark orange | Started |
| `Progress12` | Green | Closed / Complete |
| `StateCancelled` | Red/strikethrough | Cancelled |
| `StateBlocked` | Grey | Blocked / Parked |
| `Alert` | Red | Error / needs attention |
| `Info` | Blue | Informational |
| `Primary` | Brand accent | Highlight / required action |
| `Warning` | Yellow/orange | Warning state |

---

## `measure` — Numeric Field with Unit of Measure

Displays a numeric value alongside its unit attribute. The parenthesized argument is the attribute that holds the unit string.

```plvc
-- In a group:
measure QtyToReceive(UoM) {
   label = "Qty to Receive";
   size = Small;
   required = [ReceiveType = "STANDARD"];
}
measure CatchQtyToReceive(CatchUoM) {
   label = "Catch Qty to Receive";
   size = Small;
   visible = [IsCatchQtyEnabledPart];
   required = [IsCatchQtyEnabledPart and ReceiveType = "STANDARD"];
}

-- In a list:
measure QtyToReceive(UoM) {
   size = Small;
   editable = [QtyToReceive > 0];
   required = [parent.IsCatchQtyEnabled and QtyToReceive > 0];
   columnexclude = [not parent.IsCatchQtyEnabled];
}
measure InputQty(InputUom) {
   size = Small;
   columnexclude = [not parent.InputUnitMeasAllowed];
   editable = [InputUomRef.FormulaId = null];
}
```

---

## `markdowntext` — Inline Message

An informational or warning banner inside a page, group, or assistant step. The `text` supports `${Attr}` interpolation. `emphasis` sets the visual style.

```plvc
markdowntext {
   visible = [ReceiveLotMessage != null];
   text = "${ReceiveLotMessage}";
   emphasis Warning = [true];
}

markdowntext {
   visible = [ReportingMode = "Employee" and EmployeeId = null and TeamId = null];
   text = "Identification as either a team or an employee is required to use Shop Floor Workbench on site ${Contract}";
   emphasis Warning = [true];
}

markdowntext {
   visible = [ReportOperationMessage != null];
   text = "${ReportOperationMessage}";
   emphasis Info = [true];
}
```

| `emphasis` value | Visual style |
|-----------------|-------------|
| `Warning = [true]` | Yellow/orange banner |
| `Info = [true]` | Blue banner |
| `Error = [true]` | Red banner |

---

## `lovswitch` — Conditional LOV

Switches between different LOV selectors based on a runtime condition. Declared inside a `field` block:

```plvc
field LotBatchNo {
   editable = [not ExistsInInventory];
   columnvisible = [parent.IsLotTrackedPart];
   lovswitch {
      when [parent.ReceivedPartSource = "ShopOrder" or parent.ReceivedPartSource = "SubstitutePart"] {
         lov LotBatchNoRef with ReferenceSoLotBatchLovSelector using GetSoLotBatches {
            freeinput = [not parent.IsMultilevelTrackingEn];
            validate command {
               execute {
                  if [LotBatchNo != null] {
                     call GetWaivDevRej(PartNo, SerialNo, LotBatchNo) into WaivDevRejNo;
                  }
               }
            }
         }
      }
      when [parent.ReceivedPartSource = "Byproduct"] {
         lov LotBatchNoRef with ReferenceSoLotBatchLovSelector using GetSoLotBatches {
            freeinput = [true];
         }
      }
   }
}
```

`lovswitch` is evaluated top-to-bottom; the first matching `when` fires. If no `when` matches, the field has no LOV. Applies to serial no, lot batch no, and other fields where the lookup target depends on the context (order type, part type, etc.).

---

## `fieldranking` — Default Column Order

Controls the default left-to-right order of columns in a list. Columns not mentioned appear after the ranked ones:

```plvc
list InventoryReceiptList for InventoryReceipt {
   fieldranking QtyToReceive, CatchQtyToReceive, InputQty, LocationRef, LotBatchNoRef, HandlingUnitIdRef, WaivDevRejNo, AvailabilityControlRef, ConditionCodeRef, ExpirationDate, EngChgLevelRef;
}
```

---

## `crudactions` — Control New/Edit/Delete Availability

Inside a list, `crudactions` overrides the default availability of row CRUD operations:

```plvc
list InventoryReceiptList for InventoryReceipt {
   crudactions {
      new {
         enabled = [parent.ReceivedPartSource = "ShopOrder" or parent.ByproductPart != null];
      }
      delete {
         enabled = [not ExistsInInventory];
      }
   }
}

-- Disable new/delete but allow edit:
crudactions {
   new {
      enabled = [false];
   }
   edit {
      enabled = [true];
   }
   delete {
      enabled = [false];
   }
}
```

`crudactions` also accepts a `paste` block — "Defines the condition for enabling/disabling of the Paste option":

```marble
crudactions {
   paste {
      enabled = [false];
   }
}
```

---

## `contactwidget` — CRM Contact Link

Adds a contact card popup to a LOV field. Used on LOVs that reference people, customers, or suppliers:

```plvc
lov OwningCustomerNoRef with ReferenceCustOrdCustomerSelector {
   description = OwningCustomerNoRef.Name;
   contactwidget {
      enabled = [OwningCustomerNo != null];
      source = Customer;     -- Customer | Person | Supplier
      key = OwningCustomerNo;
   }
}

lov EmployeeIdRef with ReferenceShopFloorEmployeeLovSelector {
   contactwidget {
      enabled = [true];
      source = Person;
      key = EmployeeIdRef.PersonId;
   }
}
```

---

## `columnexclude` and `columnvisible`

Control column visibility in lists:

```plvc
field SystemCode {
   columnexclude = true;                          -- always excluded from list
}
field OpId {
   columnexclude = [true];
   columnvisible = [false];
}
field Company {
   columnvisible = [false];                       -- hidden by default, user can show it
   columnvisible = [parent.ClockingOperationCount > 1];  -- dynamic
}
measure CatchQtyToReceive(CatchUoM) {
   columnexclude = [not parent.IsCatchQtyEnabled]; -- conditionally exclude
}
lov ConditionCodeRef with ReferenceConditionCodeSelector {
   columnexclude = [not parent.IsConditionCodeEnabledPart];
}
```

| Keyword | Description |
|---------|-------------|
| `columnvisible = [false]` | Column hidden by default; user can reveal it via column chooser |
| `columnexclude = true` | Column completely omitted — not available even in column chooser |
| `columnexclude = [expr]` | Conditionally omit column based on parent/context |

---

## `defaulttoprevious` — Pre-fill from Last Record

Carries the field value forward from the previous saved row. Useful for printing options that the user typically keeps the same:

```plvc
field PrintHULabels {
   defaulttoprevious = [true];
}
field PrintHUContentLabels {
   defaulttoprevious = [true];
}
```

---

## `preview` on LOV — Card Popup

Shows a card component as a popup preview when hovering the LOV:

```plvc
lov OrderNoRef with ReferenceShopOrdLov99XSelector using ShopOrdLov99Set {
   preview = ShopOrdLov99Card;         -- references a card component by name
   filterexclude = ReleaseNo, SequenceNo;
}
```

---

## `filterexclude` on LOV

Prevents specific attributes from being included in the LOV's built-in filter:

```plvc
lov OrderNoRef with ReferenceShopOrdLov99XSelector using ShopOrdLov99Set {
   filterexclude = ReleaseNo, SequenceNo;
}
```

---

## `using` — Filtered LOV

The `using` clause passes a server function call to filter the LOV rows:

```plvc
-- Filter by a function:
lov InputUomRef with ReferenceInputUomSelector using FilterUnitCodeManuf(UomGroupId) {
   size = Small;
}

-- Filter with a parameterized entityset function:
lov HandlingUnitIdRef with ReferenceHandlingUnitLov8Selector using FilterHandlingUnitsByLocation(LocationNo) {
   size = Small;
   label = "Handling Unit ID";
}

-- Named entityset function on the list itself:
list ShopFloorWorkbenchOperationsList using GetOperations(Contract, FilterBy, DispListFilterId, Selection) {
   label = "Dispatch List";
}
```

---

## `multiselect` in Lists

Enables multi-row checkbox selection:

```plvc
list SerialsToReceiveList for SerialToReceive {
   editmode = SingleCellEdit;
   multiselect = [true];
   ...
}
```

---

## `collapsed` on Groups

Makes the group render collapsed (accordion-closed) by default:

```plvc
group ShopOrderAdditionalGroup for ReceiveShopOrder {
   label = "Receive Attributes";
   collapsed = [true];                           -- always collapsed on open
}
group ReceiveShopOrderGroup for ReceiveShopOrder {
   collapsed = [not StartedFromNavigator];       -- collapsed when opened from another screen
}
```

---

## `global` Page Variables

Page-level variables that persist for the page lifetime. Declare inside `page { }`, read/write via `component.global.*`:

```plvc
page Form using ShopFloorWorkbenchHeadSet {
   global ActiveDownClockingExists Boolean = false;
   global ActiveIndirectClockingExists Boolean = false;
   global UnregisteredDowntimeExists Boolean = false;
}

-- Set from a command:
set component.global.ActiveDownClockingExists = DownClockingsStruct.ActiveDowntimeExists;

-- Read in an enabled expression:
command StopDowntimeCommand for Site {
   enabled = [component.global.ActiveDownClockingExists];
}
```

---

## `idletimer` — Inactivity Trigger

Fires a command after the specified seconds of inactivity. `0` disables it; set dynamically via `component.Form.Idletimer`:

```plvc
page Form using ShopFloorWorkbenchHeadSet {
   idletimer 0 command IdentifyCommand;    -- starts disabled; enabled from command
}

-- Enable with a duration from a server call:
set component.Form.Idletimer = VarIdleTime;
```

---

## `selector` — Context Selector

A site or context picker at the top of the page. `selectionchanged` fires a command when the user switches context:

```plvc
page Form using ShopFloorWorkbenchHeadSet {
   selector ShopFloorWorkbenchSiteSelector {
      selectionchanged command SelectorIdentifyCommand;
   }
}
```

---

## `showasaction` and `icon` on Commands

Controls how a command appears in the UI toolbar:

```plvc
command RefreshCommand for Site {
   showasaction = IfRoom;    -- show as a primary button if space allows; otherwise in overflow
   icon = "refresh";
   label = "Refresh";
}
command IdentifyCommand for Site {
   showasaction = IfRoom;
   icon = "person";
   label = "Identify";
}
command StartDowntimeCommand for Site {
   showasaction = IfRoom;
   icon = "attention";
}
```

Common IFS icon names: `refresh`, `person`, `people`, `people-alt`, `attention`, `attention-alt`, `barcode`, `hourglass-start`, `hourglass-end`, `contract`.

---

## `when [condition] use subset` — Conditional Enum Subset

Restricts which enumeration values are shown in a dropdown based on context:

```plvc
field ReceivedPartSource {
   when [OrderCode = "Disassembly"] use subset Disassembly;
   validate command {
      execute { ... }
   }
}
```

The `subset` name maps to an enumeration subset defined on the enumeration in the projection.

---

## Nested Bound Lists (`bind` + `display = Nested`)

A child list that expands inline under each selected parent row:

```plvc
-- In the page:
list ShopOrderOperGuideList(ShopOrderOperGuideArray) bind ShopFloorWorkbenchOperationsList {
   label = "Guidelines";
   display = Nested;
   visible = [selection.ShopFloorWorkbenchOperationsList.OperationGuidelineCount > 0];
}
list ShopOrderHandlingUnitList(HandlingUnitArray) bind ShopFloorWorkbenchOperationsList {
   display = Nested;
   details = "tree/HandlingUnit/HandlingUnitStructureTree?$filter=HandlingUnitId eq $[HandlingUnitId]";
}
```

| Keyword | Description |
|---------|-------------|
| `bind <ParentListName>` | Attaches this list as a child of the named parent list |
| `display = Nested` | Renders expanded inline below the parent row |
| `details = "tree/..."` | Provides a drill-down navigation URL for the nested data |
| `visible = [selection.<ParentList>.<Attr>]` | Shows the nested list only when the parent row has relevant data |

---

## See Also

- [[Fields and LOV]] — `field`, `lov`, `size`, `validate command`
- [[List]] — list constructs and column management
- [[Group]] — group layout and LOV patterns
- [[Commands and Expressions]] — execute block, context references, messagebox
- [[Assistant]] — `badge`/`markdowntext` inside step content
