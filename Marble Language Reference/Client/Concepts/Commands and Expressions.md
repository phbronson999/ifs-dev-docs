---
title: Commands and Expressions
tags:
  - ifs-marble/client
  - ifs-marble/construct
aliases:
  - command declaration
  - execute block
  - call statement
  - set statement
  - if else statement
  - navigate statement
  - bulkexecute
  - bulknavigate
  - exit OK
  - enabled expression
  - visible expression
  - variable declaration
  - messagebox
  - info warning success error
  - original.Attr
  - parent.Attr
  - component reference
  - server expression
  - command clone
related:
  - "[[Action]]"
  - "[[Function]]"
  - "[[List]]"
  - "[[Group]]"
  - "[[Dialog]]"
  - "[[Assistant]]"
---

# Commands and Expressions

==Commands== are the event handlers of the Marble client layer — they define what happens when a user clicks a button, selects rows, or navigates. The `execute` block inside a command is a mini scripting language that can call server functions/actions, set field values, navigate, and branch on conditions.

This note covers:
- **Command declaration** — structure, mode, enabled/visible
- **Execute statements** — `call`, `set`, `if/else`, `navigate`, `exit`, `bulkexecute`, `bulknavigate`
- **Boolean expressions** — used in `enabled`, `visible`, `editable`, `if`, `next command`

---

## Command Declaration

> [!abstract] Syntax
> ```marble
> command <CommandName> for <EntityOrStructureOrVirtual> {
>    label = "<Button text>";
>    enabled = [<boolean expression>];
>    visible = [<boolean expression>];
>    mode = <SingleRecord|SelectedRecords|Global>;
>
>    execute {
>       <statements>
>    }
>
>    -- Bulk variant (for SelectedRecords mode):
>    bulkexecute {
>       <statements>
>    }
> }
> ```

### Command Keywords

| Keyword | Required | Description |
|---------|----------|-------------|
| `command` | Yes | Declares a command. Name is referenced by lists, groups, dialogs, and assistants. |
| `for <Entity>` | Yes | The entity/structure/virtual this command operates on. |
| `label` | No | Button text shown in Aurena. If omitted, derived from the command name. |
| `enabled` | No | Boolean expression. When false, the button is grayed out. Evaluated per-row for `SingleRecord`/`SelectedRecords` mode. |
| `visible` | No | Boolean expression. When false, the button is hidden entirely. |
| `mode` | No | `SingleRecord` (row context menu), `SelectedRecords` (multi-row action), `Global` (page-level toolbar). Default varies by context. |
| `execute { }` | No | Run once. Used for single-record actions. |
| `bulkexecute { }` | No | Run once per selected row (for `SelectedRecords` mode). Use `bulknavigate` inside for bulk navigation. |

---

## Execute Statements

### `call` — Invoke a Server Function or Action

```plvc
-- Call a function with no parameters, store result:
call FrameStartupUserIndirect() into Contract;

-- Call a function with parameters, store result:
call CalcMinutesIndirect(Company, EmployeeId, StartTime, FinishTime) into TimeResult;

-- Call a function returning a structure:
call GetParameters() into Params;
set ScheduleName = Params.Description;     -- access structure fields with dot notation

-- Call an action (no return value):
call AddIndirectClocking(Company, EmployeeId, Contract, IndirectJobId, StartTime,
   FinishTime, WorkCenterNo, TeamId, CurrentEmployeeId, CurrentTeamId, ClockingNoteText);

-- Call a virtual's inline action:
call AdjustSplitQuantities();
```

> [!note] `call` vs direct function name
> In the client, all server functions and actions are invoked with `call <Name>(params)`. The `into <Variable>` part is optional and only used when the function returns a value.

---

### `set` — Assign a Value to a Field

```plvc
-- Set from a literal:
set Contract = ContractIn;
set TimeResult = null;

-- Set from an expression (string interpolation):
set Result = "Task '${ScheduleName}' has been successfully queued as a background job.";
set Result = "Task '${ScheduleName}', assigned with the Id '${ScheduleId}', was successfully scheduled.";
```

> [!warning] `set` Only Works on Editable or `insertable = [true]` Fields
> If a field has `editable = [false]` and `insertable` is not `[true]`, calling `set` on it is silently ignored. This is a common source of confusion when init commands don't seem to work. Check the structure/virtual attribute definition.

---

### `if / else` — Conditional Branching

```plvc
if [ContractIn = null] {
   call FrameStartupUserIndirect() into Contract;
}
else {
   set Contract = ContractIn;
}

-- Nested if:
if [CalledFromOtherComponent] {
   set EmployeeId = EmployeeIdIn;
   set StartTime = StartTimeIn;
}
else {
   if [CurrentEmployeeId != null] {
      set EmployeeId = CurrentEmployeeId;
   }
   else {
      if [CurrentTeamId != null] {
         set TeamId = CurrentTeamId;
      }
   }
}

-- if with and/or:
if [(StartTime != null) and (FinishTime != null) and (IndirectJobId != null) and (EmployeeId != null)] {
   call CalcMinutesIndirect(Company, EmployeeId, StartTime, FinishTime) into TimeResult;
}
else {
   set TimeResult = null;
}
```

---

### `navigate` — Programmatic Navigation

```plvc
-- Navigate back to previous screen:
navigate back;

-- Navigate to a specific page with filter:
navigate "page/ShopOrderCosts/Form?$filter=OrderNo eq '${OrderNo}'";
```

---

### `exit` — Close a Dialog or Assistant

```plvc
-- Close dialog with success (triggers ludependencies refresh on caller):
exit OK;

-- Close dialog with cancel (no refresh):
exit Cancel;
```

---

### `bulkexecute` / `bulknavigate` — Multi-Row Commands

When a command has `mode = SelectedRecords`, use `bulkexecute` instead of `execute`. Inside `bulkexecute`, use `bulknavigate` to navigate using values from each selected row.

```plvc
command ShopOrderCostsCommand for ShopOrderCostUtil {
   label = "Shop Order Costs";
   enabled = [true];
   mode = SelectedRecords;        -- command appears in multi-row action bar

   bulkexecute {
      -- $[AttrName] syntax: replaced with the value from each selected row
      bulknavigate "page/ShopOrderCosts/Form?$filter=OrderNo eq $[OrderNo] and ReleaseNo eq $[ReleaseNo] and SequenceNo eq $[SequenceNo]";
   }
}
```

> [!note] `$[AttrName]` vs `${AttrName}`
> `$[AttrName]` (square brackets) is the bulk substitution syntax inside `bulknavigate` — it substitutes the attribute value from each selected row. `${AttrName}` (curly braces) is string interpolation used inside `set` and other navigate statements to embed a field value from the current context.

---

## Boolean Expression Syntax

Boolean expressions appear in `enabled`, `visible`, `editable`, `if`, and `next command`:

```plvc
-- Null checks:
enabled = [Contract != null]
enabled = [not(Contract = null)]

-- Compound conditions:
enabled = [Contract != null and IndirectJobId != null and StartTime != null]
enabled = [not(Contract = null or IndirectJobId = null or StartTime = null)]

-- Comparison:
enabled = [QtyToDistribute >= 0]
visible = [TaskOption = "Schedule"]
visible = [SerialTracked = "TRUE"]

-- ETag pattern (new record check):
editable = [ETag = null]

-- Complex conditions with parentheses:
enabled = [(
   (TaskOption = "Now") or
   (TaskOption = "Schedule" and ScheduleName != null and
   (ScheduleOption = "Daily" and ScheduleTime != null) or
   (ScheduleOption = "Weekly" and ScheduleTime != null and ScheduledDays != null))
)]
```

### Expression Operators

| Operator | Meaning |
|----------|---------|
| `=` | Equals |
| `!=` | Not equals |
| `>`, `<`, `>=`, `<=` | Numeric comparison |
| `and` | Logical AND |
| `or` | Logical OR |
| `not(...)` | Logical NOT |
| `= null` | Is null check |
| `!= null` | Is not null |

---

## Example — Init Command with Complex Logic

> [!example] Source: `ifs-example/shpord/model/shpord/AddIndirectClockingDialog.fragment`

```plvc
command InitCommand for AddIndirectClockingStructure {
   execute {
      -- Fetch default site if not passed in
      if [ContractIn = null] {
         call FrameStartupUserIndirect() into Contract;
      }
      else {
         set Contract = ContractIn;
      }

      -- Conditional initialization based on caller context
      if [CalledFromOtherComponent] {
         -- Called from another component with an employee already selected
         set EmployeeId = EmployeeIdIn;
         set StartTime = StartTimeIn;
         set FinishTime = StartTimeIn;
      }
      else {
         -- Called standalone: pre-select current employee or team from user's session
         if [CurrentEmployeeId != null] {
            set EmployeeId = CurrentEmployeeId;
         }
         else {
            if [CurrentTeamId != null] {
               set TeamId = CurrentTeamId;
            }
         }
      }
   }
}
```

---

## Patterns & Tips

> [!tip] Use `not(A or B)` Over Chained `and not` for Cleaner Enabled Logic
> `enabled = [not(Contract = null or IndirectJobId = null)]` reads more clearly than `enabled = [Contract != null and IndirectJobId != null]`, especially for three or more conditions.

> [!tip] String Interpolation in `set` with `${}` 
> Use `${FieldName}` inside string literals to embed field values: `set Result = "Scheduled task '${ScheduleName}' starting at ${ScheduledTime}."`. This is the standard pattern for building confirmation messages in the `final step`.

> [!tip] `call Action()` Then `exit OK` Is the Standard Dialog OK Pattern
> Every dialog OK command follows: `call TheAction(...);` then `exit OK;`. The action does the work; `exit OK` triggers the framework to refresh `ludependencies` on the calling page.

> [!warning] `bulknavigate` Cannot Call Actions
> `bulkexecute` can only contain `bulknavigate` — it cannot call actions directly. If you need to call an action on multiple rows, use an `action` with a list parameter, or iterate via the framework's batch action pattern.

---

---

## Variables in Commands

Declare local variables before `execute {}`. They hold temporary values for the duration of that one execution:

```plvc
command MyCommand for MyEntity {
   variable VarLotBatchNo;                          -- short form, defaults to Text
   variable VarLocationNo Text;
   variable VarCount {
      type = Number;
   }
   variable VarCanReserve {
      type = Boolean;
   }
   variable VarCostInfo {
      type = Structure(CostInfoStructure);          -- typed to a projection structure
   }
   execute {
      call GetDefaultLotBatch(OrderNo) into VarLotBatchNo;
      call FetchCostInfo(Contract, PartNo) into VarCostInfo;
      set TotalCost = VarCostInfo.TotalCost;
   }
}
```

Variables can also appear inside `init command` in assistants.

---

## `#{...}` — Server-Side Expressions

When a `set` value requires server-side arithmetic or Oracle date functions, wrap the expression in `"#{...}"`:

```plvc
-- Arithmetic:
set VarReceivingQty = "#{InventoryReceiptCount + SerialInventoryReceiptCount}";
set QtyToReceive = "#{VarReservedQty - VarReceivedQty}";

-- Date arithmetic using Oracle built-ins:
set ExpirationDate = "#{toDate(addDays(ManufacturedDate, DurabilityDay))}";
```

> [!note] `#{...}` vs `[...]`
> `[...]` is client-side — use it for `enabled`, `visible`, `editable`, and `if` conditions. `"#{...}"` is server-side — use it in `set` statements when the calculation needs Oracle SQL functions or cannot be expressed in client-side logic.

---

## Feedback Statements

Show non-blocking notifications to the user during command execution:

```plvc
info("Identification is required to continue.");
warning("Assigned quantity exceeds the reserved Lot/Batch ${LotBatchNo}.");
success("${TotalQtyReceived} ${UoM} of ${PartNo} was successfully received.");
error("Different locations for serials not allowed when Pack is set.");
```

String interpolation with `${Attr}` works inside all feedback messages.

---

## `messagebox` — Blocking Confirmation Dialog

```plvc
messagebox("Unsaved Changes", warning, "Quantities entered have not been received. Discard?") {
   when "Discard" {
      exit OK;
   }
   when "Cancel" {
      set ReceivedPartSource = original.ReceivedPartSource;
      exit;
   }
}
```

The second argument is the icon type: `warning`, `info`, or `error`. The `when` labels become the dialog's buttons.

---

## `translatable = true` on `set`

Marks the string value for IFS translation extraction. Use for any user-visible message:

```plvc
set FinishExecuteSuccessMessage = "${TotalQtyReceived} ${UoM} of part ${PartNo} was successfully received on Shop Order ${OrderNo}" {
   translatable = true;
}
set HeaderLoginLabel = "Employee: ${EmployeeName} " {
   translatable = true;
}
```

---

## Additional Execute Statements

```plvc
refresh;                                -- reload current page data from server

printdialog VarHULabelReportResultKeys;  -- open print dialog for report result keys

copy VarFilterInfo into this;           -- copy all matching fields from a structure into the current record

focus ShopFloorWorkbenchHeadGroup.BarcodeId;  -- set keyboard focus to a specific field
```

---

## Context References in Expressions

### `original.AttrName` — Pre-edit Value

Only available inside `validate command`. Holds the field value before the current edit:

```plvc
validate command {
   execute {
      if [original.ReceivedPartSource != null and original.ReceivedPartSource != ReceivedPartSource] {
         messagebox("Unsaved Changes", warning, "Discard?") {
            when "Discard" { exit OK; }
            when "Cancel" {
               set ReceivedPartSource = original.ReceivedPartSource;
               exit;
            }
         }
      }
   }
}
```

### `parent.AttrName` — Parent Record in a Child List

Only available in fields/LOVs inside a list that is bound to a parent via an array. Reads attributes from the owning record:

```plvc
list InventoryReceiptList for InventoryReceipt {
   field LotBatchNo {
      editable = [not ExistsInInventory and parent.ReceivedPartSource = "ShopOrder"];
      columnvisible = [parent.IsLotTrackedPart];
   }
   lov LocationRef with ReferenceInventoryLocation6Selector {
      required = [parent.ReceiveType = "STANDARD"];
   }
}
```

### `selection.<ListName>.<Attr>` — Selected Row Attributes

Read attributes from the currently selected row in a named list. Used in `visible`/`enabled` on bound child lists:

```plvc
list ShopOrderOperGuideList(GuideArray) bind ShopFloorWorkbenchOperationsList {
   visible = [selection.ShopFloorWorkbenchOperationsList.OperationGuidelineCount > 0];
}
```

### `component.*` — Page and Component State

```plvc
-- Assistant step state (in finish command enabled expression):
enabled = [component.ReceiveShopOrderAssistant.ActiveStepByName = component.ReceiveShopOrderAssistant.LastVisibleStepByName
           and component.ReceiveShopOrderAssistant.IsActiveStepValid];

-- Check if a list has unsaved edits:
if [component.InventoryReceiptList.IsDirty] { ... }

-- Read/write a page-level global variable:
set component.global.ActiveDownClockingExists = DownClockingsStruct.ActiveDowntimeExists;
enabled = [component.global.ActiveDownClockingExists];

-- Set the idle timer:
set component.Form.Idletimer = VarIdleTime;
```

### `isNew` — New Row Check

```plvc
field LotBatchNo {
   editable = [isNew];     -- editable only while the row is new (not yet saved)
}
```

### `count(*, condition)` — Count Matching Rows

```plvc
enabled = [count(*, Selected = false) > 0];
enabled = [count(*, QtyToReceive > 0) > 0];
```

### `Selection` Variable in `bulkexecute`

Holds the OData selection key set for all selected rows. Pass it to server actions:

```plvc
command SelectSerialsForReceiptCmd for SerialToReceive {
   mode = SelectedRecords;
   bulkexecute {
      call SelectSerialsForReceipt(Selection, parent.Objkey);
   }
}
```

---

## Opening Dialogs from Execute

```plvc
-- Dialog with output parameters:
dialog SelectLocationForSerialsDlg(parent.Contract) into(VarLocationNo) {
   when OK {
      call SetLocationForSerials(Selection, VarLocationNo);
      exit;
   }
   when CANCEL {
      exit;
   }
}

-- Dialog with no output:
dialog ReserveShopOrderDialog(OrderNo, ReleaseNo, SequenceNo) {
   when OK { exit OK; }
}
```

---

## Opening Assistants from Execute

```plvc
-- Fragment-qualified assistant:
assistant StartIndirectTimeDialog.StartIndirectTimeAssistant(Contract, TeamId, EmployeeId, Company, VarStartTime) {
   when OK {
      call CheckActiveIndirectClockingExists(Company, EmployeeId, TeamId) into component.global.ActiveIndirectClockingExists;
   }
}

-- Assistant with output into variables:
assistant DefineCostStructureAssistant(Contract, PartNo, ConfigId, LotBatchNo, SerialNo, ConditionCode, "SHOP ORDER RECEIPT", VarCostDetailId) into(CostDetailId) {
   when CANCEL {
      exit CANCEL;
   }
}

-- Anonymous assistant:
assistant KanbanReplenishReqAssistant {
   when OK { exit OK; }
}
```

---

## `command clone` — Command Inheritance

Clone creates a new command that inherits the structure of an existing one. Use `super;` to run the parent's `execute` block:

```plvc
command SelectorIdentifyCommand clone IdentifyCommand {
   execute {
      set EmployeeId = null;
      super;          -- runs IdentifyCommand's execute block after setting EmployeeId = null
   }
}
```

---

## `urlparameter`

"A url parameter is defined and used within the execution of an action. When defined, it will be used to fetch parameters on the url for the page and will be accessible in commands."

> [!abstract] Syntax
> ```marble
> urlparameter <ParameterName>;
> -- or, with an explicit name override:
> urlparameter <ParameterName> {
>    urlparametername = "<Value>";
> }
> ```

```marble
urlparameter StatusCode;
```

Valid inside an `init command` or a regular `command`. Once declared, the parameter's value (read from the page's URL) becomes accessible by name in that command's `execute` block.

## `initcontext`

"Allows accessing the parameters directly without any prefixing." Groups one or more URL parameters together with an init command, all scoped to the whole page.

> [!abstract] Syntax
> ```marble
> initcontext <Name> {
>    urlparameter <ParamName>;   -- one or more
>    init command { ... }
> }
> ```

"Defining page parameters, provided on the URL, that are available on the whole page, and an init command that runs every time the URL is changed for the page."

## `wfaction`

"Defines a free-formed record that can be used as workflow action input" — a standalone, parameter-bag-style construct (similar in spirit to a `.projection` `structure`) used to pass typed arguments into a workflow action.

> [!abstract] Syntax
> ```marble
> wfaction <Name> {
>    parameter <ParamName> <Type>;
>    -- one or more
> }
> ```

```marble
wfaction EnhancementTest {
   parameter Description String;
   parameter DoTest Boolean;
   parameter Amount Number;
}
```

> [!info] Broader Workflow construct coverage deferred
> `WorkflowDefinition`, `WorkflowStepDefinition`, and related workflow constructs already had some passing vault coverage before this pass and weren't part of this gap-filling round. `wfaction` was specifically in scope because it had zero prior mention.

---

## See Also

- [[Action]] — server-side procedures called with `call ActionName(...)`
- [[Function]] — server-side reads called with `call FunctionName(...) into Var`
- [[Dialog]] — `exit OK/Cancel` usage context
- [[Assistant]] — `navigate back`, `finish command`, `cancel command`
- [[List]] — commands that appear on list rows
- [[Group]] — `validate command` inside groups
