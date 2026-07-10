---
title: Common Patterns
tags:
  - ifs-marble
  - ifs-marble/guide
  - ifs-marble/tutorial
aliases:
  - cookbook
  - patterns
  - recipes
  - how-to
  - common patterns
related:
  - "[[Thinking in Marble]]"
  - "[[Build Your First Screen]]"
  - "[[Fields and LOV]]"
  - "[[Commands and Expressions]]"
  - "[[Display Controls]]"
---

# Common Patterns

Recipes for scenarios that appear in almost every IFS Cloud screen. Each pattern shows how constructs combine — not what each keyword does in isolation (that's in the reference notes), but how to wire them together to solve a specific problem.

**How to use this page:** Find the scenario that matches your problem. Read the solution code, then follow the "Why it works" explanation before copying it — patterns break in subtle ways when applied without understanding the mechanism.

---

## Forms

### 1. Lock All Fields After a State Transition

**Problem:** A record should be editable only while it's in its initial state (e.g., "Open"). Once submitted or approved, the form becomes read-only.

```plvc
group LeaveRequestGroup for LeaveRequest {
   -- Every editable field gets the same guard expression:
   lov EmployeeRef with ReferenceEmployeeSelector {
      editable = [Objstate = "Open"];
   }
   field LeaveType {
      editable = [Objstate = "Open"];
   }
   field StartDate {
      editable = [Objstate = "Open"];
   }
   field EndDate {
      editable = [Objstate = "Open"];
   }
   field Reason {
      editable = [Objstate = "Open"];
      multiline = true;
   }

   -- Read-only fields never need an editable guard:
   field RequestId {
      editable = [false];
   }
   field Objstate {
      editable = [false];
   }
}
```

**Why it works:** `editable` is evaluated against the current record's attribute values. When `Objstate` is no longer `"Open"`, every field becomes read-only simultaneously — the user sees a form that has visually "locked" without any page reload or navigation.

**Variations:**
- `editable = [ETag = null]` — editable only on a brand-new, unsaved record (common for key fields like `Company` or `RequestId`)
- `editable = [Objstate = "Open" or Objstate = "Draft"]` — allow editing in multiple early states

> [!related] [[Fields and LOV]], [[Property Index#E|`editable`]]

---

### 2. Dependent LOV (Filter by Parent Field)

**Problem:** The options in one LOV should be filtered by the value selected in another field — e.g., "Job" should only show jobs available at the selected "Site."

```plvc
group ClockingGroup for ClockingStructure {
   -- Step 1: the parent LOV — user picks Site first
   lov ContractRef with ReferenceUserAllowedSiteLovSelector {
      size = Medium;
      description = ContractRef.ContractDesc;
   }

   -- Step 2: the dependent LOV — grayed out until Site is selected
   lov IndirectJobIdRef with ReferenceActiveIndirectJobSelector {
      size = Large;
      description = IndirectJobIdRef.Description;
      editable = [Contract != null];    -- locked until parent has a value
   }

   -- The selector fragment for IndirectJob must filter by Contract:
   -- (in ReferenceActiveIndirectJobSelector inside the fragment)
   -- selector ReferenceActiveIndirectJobSelector for ActiveIndirectJobSet {
   --    static IndirectJobId;
   --    static Description;
   --    static Contract;     <-- exposed so the LOV can filter by it
   -- }
}
```

The filtering itself happens in the projection's selector fragment — the entityset for `ActiveIndirectJob` should have a `where` clause or the selector should pass the contract as a filter parameter.

**Why it works:** `editable = [Contract != null]` prevents selection before the dependency is satisfied. The underlying selector fragment filters the available options using the current `Contract` value from the record context.

**Common mistake:** Setting `editable` on the dependent LOV but forgetting to filter the selector's entityset — the user can only pick when the parent is filled, but they see all options instead of just the valid ones.

> [!related] [[Fields and LOV]], [[Fragment]], [[Selector and Search Context]]

---

### 3. Validate Command Chain (Recalculate When Any Input Changes)

**Problem:** A computed result (e.g., calculated time, total cost, adjusted quantity) depends on several input fields. It should recalculate automatically whenever any one of those fields changes.

```plvc
group TimesheetGroup for TimesheetEntry {
   lov ContractRef with ReferenceUserAllowedSiteLovSelector {
      validate command {
         execute {
            if [Contract != null] {
               call ContractDataItemValidate(Contract) into Company;
            }
            -- Re-run the calculation after deriving Company:
            if [(StartTime != null) and (FinishTime != null) and (EmployeeId != null)] {
               call CalcMinutes(Company, EmployeeId, StartTime, FinishTime) into TimeResult;
            }
            else {
               set TimeResult = null;
            }
         }
      }
   }

   -- Same calculation block on every field that feeds the result:
   field StartTime {
      validate command {
         execute {
            if [(StartTime != null) and (FinishTime != null) and (EmployeeId != null)] {
               call CalcMinutes(Company, EmployeeId, StartTime, FinishTime) into TimeResult;
            }
            else {
               set TimeResult = null;
            }
         }
      }
   }

   field FinishTime {
      validate command {
         execute {
            /* same block */
         }
      }
   }

   -- The result field is read-only — it's only written by validate commands:
   field TimeResult;
}
```

**Why it works:** Each `validate command` fires when its field loses focus. By putting the same recalculation logic on every input field, the result updates whenever any dependency changes — with no explicit "Recalculate" button needed.

**Key rule:** Always null-check all dependencies before calling the server (`if [(A != null) and (B != null)]`). Without this, the server call fires with incomplete data and may error or return a misleading result.

> [!related] [[Fields and LOV]], [[Commands and Expressions]], [[Group]]

---

### 4. InitCommand: Pre-Populate a Dialog on Open

**Problem:** A dialog should open with certain fields pre-filled — either from the calling record, from the user's session context, or from a server function.

```plvc
-- In the virtual entity's structure (projection side):
-- structure AddClockingStructure {
--    attribute ContractIn    Text;    -- passed in from the caller
--    attribute Contract      Text;    -- will be set by InitCommand
--    attribute EmployeeId    Text;
--    ...
-- }

-- In the dialog (client side):
dialog AddClockingDialog for AddClockingStructure {
   label = "Add Clocking";

   input(ContractIn, EmployeeIdIn);    -- values passed from the calling command

   init command {
      execute {
         -- Use the passed-in value, or fall back to user's default site:
         if [ContractIn = null] {
            call FrameStartupUserIndirect() into Contract;
         }
         else {
            set Contract = ContractIn;
         }

         -- Pre-set employee if called with one, else leave blank for user to fill:
         if [EmployeeIdIn != null] {
            set EmployeeId = EmployeeIdIn;
         }
      }
   }

   group AddClockingGroup;
   commandgroup DialogCommandGroup {
      command OkCommand;
      command CancelCommand;
   }
}
```

**Why it works:** `init command` runs automatically when the dialog opens, before the user sees the form. The `input(...)` declaration passes values from the calling context into the virtual structure's "In" attributes, which the init command then reads.

**Convention:** Name input parameters `<AttrName>In` — e.g., `ContractIn`, `EmployeeIdIn`. The init command reads these and uses `set` to populate the actual working attributes. This keeps the input contract explicit and readable.

> [!related] [[Dialog]], [[Virtual]], [[Commands and Expressions]]

---

### 5. Conditional Field Visibility Based on Another Field

**Problem:** Show a field only when a related field has a specific value — e.g., show "Rejection Reason" only when the status is "Rejected."

```plvc
group RequestGroup for LeaveRequest {
   field Objstate {
      editable = [false];
   }
   field ApprovalDate {
      visible = [Objstate = "Approved" or Objstate = "Rejected"];
   }
   field RejectionReason {
      size    = FullWidth;
      multiline = true;
      visible = [Objstate = "Rejected"];
      editable = [Objstate = "Rejected"];
   }
}
```

**Why it works:** `visible = [expression]` completely removes the field from the layout when false — the space it occupied collapses. This differs from `editable = [false]`, which keeps the field visible but gray.

**Tip:** When a field is `visible = [false]`, its value is still present in the record — it's just not shown. Use this for fields that are relevant only in certain states, not for sensitive fields that should never be transmitted.

> [!related] [[Fields and LOV]], [[Property Index#V|`visible`]]

---

## Lists

### 6. Master-Detail: Parent List with Bound Child List

**Problem:** Selecting a row in a parent list should load a child list showing that record's related data.

```plvc
-- In the projection, the parent entity needs an array:
-- entity SalesOrder {
--    array OrderLinesArray(OrderNo) to SalesOrderLine(OrderNo);
-- }

-- In the client page:
page OrderPage using SalesOrderSet {
   list SalesOrderList;

   -- The child list binds to the selected parent row.
   -- OrderLinesArray matches the array name in the projection entity.
   list OrderLinesList(OrderLinesArray) bind SalesOrderList {
      display = Nested;      -- expands inline under each parent row
   }
   -- Omit `display = Nested` for a side-by-side panel instead.
}

list SalesOrderList for SalesOrder {
   orderby = OrderNo;
   field OrderNo {
      size = Small;
   }
   field CustomerNo {
      size = Medium;
   }
   field OrderDate {
      size = Small;
   }
}

list OrderLinesList for SalesOrderLine {
   orderby = LineNo;
   field LineNo {
      size = Small;
   }
   field PartNo {
      size = Medium;
   }
   field Quantity {
      size = Small;
   }
   field LineTotal {
      size = Small;
   }
}
```

**Why it works:** `bind SalesOrderList` tells Aurena to re-query `OrderLinesList` every time the selected row in `SalesOrderList` changes. The `(OrderLinesArray)` parameter maps to the `array` declaration in the projection entity — without it, the framework doesn't know how to filter the child records.

> [!related] [[List]], [[Pages]], [[References and Arrays]]

---

### 7. Bulk Command on Selected Rows

**Problem:** An action button should operate on all selected rows, not just one at a time.

```plvc
-- The command:
command ApproveRequestsCommand for LeaveRequest {
   label   = "Approve";
   mode    = SelectedRecords;
   enabled = [Objstate = "Open"];    -- evaluates per row; button grays if any selected row isn't Open

   bulkexecute {
      call ApproveLeaveRequest(RequestId, Company);
   }
}

-- In the list:
list LeaveRequestList for LeaveRequest {
   multiselect = [true];    -- ensure multi-select is enabled (it's the default, but be explicit)
   ...
   command ApproveRequestsCommand;
}
```

**Why it works:** `mode = SelectedRecords` + `bulkexecute` runs the `call` once per selected row, passing each row's attribute values. The `enabled` expression is evaluated individually for every selected row — if any row doesn't match, the button is disabled.

**Bulk navigate variant:** Use `bulknavigate` inside `bulkexecute` to open a filtered page for each selected row:

```plvc
bulkexecute {
   bulknavigate "page/OrderClient/OrderDetailsPage?$filter=OrderNo eq $[OrderNo]";
}
```

`$[AttrName]` (square brackets) is the per-row substitution syntax inside `bulknavigate`. It's different from `${AttrName}` (curly braces), which is used in `set` and `navigate` for single-record context.

> [!related] [[Commands and Expressions]], [[List]]

---

### 8. Summary Totals Row

**Problem:** Show column totals (sum, count) at the bottom of a list without the user having to export to Excel.

```plvc
list OrderLinesList for SalesOrderLine {
   orderby = LineNo;

   -- Declare which columns get a summary total:
   summary = Quantity, LineTotal, DiscountAmount;

   field LineNo {
      size = Small;
   }
   field PartNo {
      size = Medium;
   }
   field Quantity {
      size = Small;
   }
   field LineTotal {
      size = Small;
   }
   field DiscountAmount {
      size = Small;
   }
}
```

**Why it works:** `summary` adds a pinned totals row at the bottom of the list. The values are calculated from the database — not just the rows currently visible on screen — so pagination doesn't affect the totals. The summary row only appears when the columns it references are currently visible.

> [!related] [[List]], [[Property Index#S|`summary`]]

---

### 9. Required Search Before Data Loads

**Problem:** A list page should open blank and force the user to enter search criteria before any data is loaded — preventing accidental full-table scans on large entities.

```plvc
-- In the search context:
searchcontext OrderSearch for SalesOrder {
   label = "Search Orders";

   pinnedsearchfields   = Company;        -- Company always visible, can't be removed
   requiredsearchfields = Company;        -- must enter Company before search runs
   defaultsearchfields  = Company, Objstate, OrderDate;

   lov CompanyRef with ReferenceCompanySelector {
      label = "Company";
      size  = Small;
   }
   field Objstate {
      label = "Status";
   }
   field OrderDate {
      label = "Order Date";
   }
   field CustomerNo {
      label = "Customer";
   }
}

-- In the page:
page List using SalesOrderSet {
   label         = "Sales Orders";
   startupmode   = search;       -- open with blank grid
   searchcontext OrderSearch;
   list SalesOrderList;
}
```

**Why it works:** `startupmode = search` prevents the initial data load. `requiredsearchfields = Company` keeps the Search button disabled until Company is filled. Together they guarantee the user provides at least a company filter before any query hits the database.

> [!related] [[Selector and Search Context]], [[Pages]], [[Property Index#S|`startupmode`]]

---

## Navigation

### 10. Drill-Down from a List Row to a Form Page

**Problem:** Clicking a row in a list (or a "Details" button) should navigate to the record's detail form.

**Option A — `details` property (adds a Details button to the list toolbar):**

```plvc
list OrderList for SalesOrder {
   details = OrderFormPage("OrderNo eq $[OrderNo] and Company eq $[Company]");
   ...
}
```

**Option B — Command with `bulknavigate` (custom button label, more control):**

```plvc
command ViewDetailsCommand for SalesOrder {
   label = "Open";
   mode  = SingleRecord;
   bulkexecute {
      bulknavigate "page/OrderClient/OrderFormPage?$filter=OrderNo eq $[OrderNo] and Company eq $[Company]";
   }
}
```

**Option C — Navigate to a page on another client (cross-client navigation):**

```plvc
command OpenShopOrderCommand for WorkOrder {
   label = "Shop Order";
   mode  = SelectedRecords;
   bulkexecute {
      bulknavigate "page/ShopOrderClient/ShopOrderForm?$filter=OrderNo eq $[ShopOrderNo]";
   }
}
```

The URL format is always: `page/<ClientFileName>/<PageName>?$filter=<OData filter>`.

**Why it works:** `$[AttrName]` substitutes the attribute value from each selected row into the URL. For `details`, the framework builds the URL automatically using the provided OData filter expression.

> [!related] [[Commands and Expressions]], [[Pages]]

---

### 11. Navigate Back After a Dialog Action

**Problem:** After a dialog's OK action runs, close the dialog and refresh the calling page.

```plvc
command OkCommand for AddClockingStructure {
   label = "Add";
   execute {
      -- Run the server action first:
      call AddIndirectClocking(Company, EmployeeId, Contract, IndirectJobId,
                               StartTime, FinishTime, ClockingNoteText);
      -- Then close the dialog — this triggers ludependencies refresh on the caller:
      exit OK;
   }
}

command CancelCommand for AddClockingStructure {
   execute {
      exit Cancel;    -- close without refresh
   }
}
```

**Why it works:** `exit OK` closes the dialog AND signals the framework to refresh any components on the calling page that declared `ludependencies` linking them to the action's entity. `exit Cancel` closes without triggering any refresh. Always pair a dialog's OK command with `exit OK` after the action call — without it, the caller won't update.

> [!related] [[Dialog]], [[Commands and Expressions]]

---

## Dialogs and Assistants

### 12. Confirmation Dialog Before a Destructive Command

**Problem:** A command that deletes records or sends irreversible notifications should ask the user to confirm before executing.

```plvc
command DeleteRequestCommand for LeaveRequest {
   label   = "Delete";
   mode    = SelectedRecords;
   enabled = [Objstate = "Open"];

   bulkexecute {
      confirm("Delete request ${RequestId}? This cannot be undone.") {
         call DeleteLeaveRequest(RequestId, Company);
      }
   }
}
```

**Alternative using `messagebox` for a named OK command:**

```plvc
command DeleteRequestCommand for LeaveRequest {
   execute {
      messagebox("Delete request ${RequestId}?", Question, "Yes", "No") {
         when "Yes" {
            call DeleteLeaveRequest(RequestId, Company);
            navigate back;
         }
      }
   }
}
```

**Why it works:** `confirm(...)` is the inline confirmation variant — it presents a yes/no dialog and executes the nested block only if the user confirms. `messagebox` is the explicit variant with named button choices. Use `confirm` for simple yes/no guards; use `messagebox` when you need custom button labels or more than two choices.

> [!related] [[Utility Controls]], [[Commands and Expressions]]

---

### 13. Data Entry Dialog (Virtual Entity + Fragment)

**Problem:** Build a modal dialog for data entry that doesn't correspond to a real database table — e.g., a "Quick Add" form, a parameter entry for a background job, or a confirmation with extra input.

**Step 1 — Projection fragment (data side):**

```plvc
-- In AddNoteDialog.fragment, PROJECTION FRAGMENTS section:
virtual AddNoteVirtual {
   crud = Read, Create;

   attribute RequestId  Text {
      editable = [false];
   }
   -- passed in
   attribute Company    Text {
      editable = [false];
   }
   -- passed in
   attribute NoteText   LongText;
   attribute NoteType   Text;
}
```

**Step 2 — Client fragment (UI side):**

```plvc
-- In AddNoteDialog.fragment, CLIENT FRAGMENTS section:
dialog AddNoteDialog for AddNoteVirtual {
   label = "Add Note";
   input(RequestId, Company);

   init command {
      execute {
         set RequestId = RequestIdIn;
         set Company   = CompanyIn;
      }
   }

   group AddNoteGroup;

   commandgroup {
      command SaveNoteCommand;
      command CancelCommand;
   }
}

group AddNoteGroup for AddNoteVirtual {
   label = "";
   field RequestId {
      editable = [false];
      size = Small;
   }
   field NoteType {
      size = Medium;
   }
   field NoteText {
      size = FullWidth;
      multiline = true;
      initialfocus = [true];
   }
}

command SaveNoteCommand for AddNoteVirtual {
   label = "Save";
   execute {
      call SaveNote(RequestId, Company, NoteType, NoteText);
      exit OK;
   }
}

command CancelCommand for AddNoteVirtual {
   execute {
      exit Cancel;
   }
}
```

**Step 3 — Call the dialog from the main client:**

```plvc
command AddNoteCommand for LeaveRequest {
   label = "Add Note";
   mode  = SingleRecord;
   execute {
      dialog AddNoteDialog(RequestId, Company);
   }
}
```

**Why it works:** The virtual entity is the server-side scratch pad — it holds the dialog's working data without a real table. The fragment packages both sides together so any client that includes `AddNoteDialog.fragment` gets the dialog ready to use. Calling `dialog AddNoteDialog(...)` passes values into the `input(...)` parameters defined on the dialog.

> [!related] [[Dialog]], [[Virtual]], [[Fragment]]

---

### 14. Show a Success Message in an Assistant's Final Step

**Problem:** After an assistant runs a background job or queues a process, the final step should show the user a meaningful confirmation message including the generated ID or name.

```plvc
-- In the virtual entity:
-- attribute ScheduleName  Text;
-- attribute ScheduleId    Number { editable = [false]; }
-- attribute ResultMessage Text   { editable = [false]; }

-- The finish command on the last step:
command FinishCommand for TaskVirtual {
   execute {
      if [TaskOption = "Now"] {
         call RunTaskNow(ScheduleName) into ResultMessage;
         set ResultMessage = "Task '${ScheduleName}' has been queued successfully.";
      }
      else {
         call ScheduleTask(ScheduleName, ScheduledTime) into ScheduleId;
         set ResultMessage = "Task '${ScheduleName}' scheduled with ID '${ScheduleId}'.";
      }
   }
}

-- On the final step's group:
group ResultGroup for TaskVirtual {
   label = "Result";
   staticfield ResultDisplay {
      value = "${ResultMessage}";
   }
}
```

**Why it works:** `set ResultMessage = "..."` uses `${FieldName}` string interpolation to embed the server-returned values into a human-readable message. `staticfield` displays it as read-only text on the confirmation step. The user sees exactly what happened, including any generated IDs.

> [!related] [[Assistant]], [[Virtual]], [[Commands and Expressions]], [[Display Controls#Static Field]]

---

## Display

### 15. Badge in List, State Indicator in Form (The Pairing Pattern)

**Problem:** Display a record's status in a scannable way in a list and in a prominent way on a form — using the same `Objstate` attribute and the same color mapping.

```plvc
-- In the list — compact chip, good for scanning many rows:
list LeaveRequestList for LeaveRequest {
   ...
   badge Objstate {
      emphasis StateOpen      = [Objstate = "Open"];
      emphasis StateReleased  = [Objstate = "Submitted"];
      emphasis StateCompleted = [Objstate = "Approved"];
      emphasis StateClosed    = [Objstate = "Closed"];
      emphasis StateCancelled = [Objstate = "Rejected"];
   }
}

-- In the form group — larger, more prominent status display:
group LeaveRequestGroup for LeaveRequest {
   stateindicator Objstate {
      emphasis StateOpen      = [Objstate = "Open"];
      emphasis StateReleased  = [Objstate = "Submitted"];
      emphasis StateCompleted = [Objstate = "Approved"];
      emphasis StateClosed    = [Objstate = "Closed"];
      emphasis StateCancelled = [Objstate = "Rejected"];
   }
   ...
}
```

**Why it works:** Both controls use the same `Objstate` attribute and the same emphasis constants — the color meaning is consistent across both views. `badge` renders as a compact chip appropriate for a grid column; `stateindicator` renders as a more prominent bubble suitable for a page header.

**Tip:** Define the emphasis mapping once as a comment block or in your team conventions doc — the same mapping should appear identically in both the list badge and the form stateindicator. Diverging mappings create confusing UX.

> [!related] [[Display Controls]], [[Emphasis and Colors]]

---

### 16. Lock Currency Unit After First Save

**Problem:** The currency code (or unit of measure) on a financial field should be selectable when creating a new record, but should lock permanently after the first save.

```plvc
currency InvoiceAmount(CurrencyCode) {
   label           = "Invoice Amount";
   unitlookup IsoCurrencyEntitySet(CurrencyCode);
   unitselector IsoCurrencySelector;

   -- Lock the unit once the record has been saved (ETag is not null after first save):
   uniteditable = [ETag = null];

   format = ifscurrency;
}
```

**Why it works:** `ETag = null` is true only for a record that hasn't been saved yet — the framework sets `ETag` after the first successful save. `uniteditable = [ETag = null]` therefore automatically locks the currency code the moment the record is created, without any additional logic.

**The same pattern for any "set-once" field:**

```plvc
field Company {
   editable = [ETag = null];
}
field RequestId {
   editable = [ETag = null];
}
```

> [!related] [[Input Controls#Currency and Measure]], [[Glossary#E|ETag]]

---

### 17. Computed Column Combining Two Attributes

**Problem:** Display a combined value in a list column — e.g., "FirstName LastName" as a single "Full Name" column — without adding an attribute to the projection.

```plvc
list EmployeeList for Employee {
   field EmployeeId {
      size = Small;
   }

   -- A computed column: combines two attributes into one display value
   computedfield FullName {
      label = "Name";
      value = "${FirstName} ${LastName}";
      type  = Text;
   }

   -- Computed percentage from two numeric attributes:
   computedfield CompletionRate {
      label  = "% Complete";
      value  = "${CompletedTasks / TotalTasks * 100}";
      type   = Number;
      format = percentage;
   }

   -- Aggregate from child array (sum of child record values):
   computedfield TotalLineValue {
      label  = "Line Total";
      value  = "${sum(OrderLines.LineAmount)}";
      type   = Number;
      format = ifscurrency;
   }
}
```

**Why it works:** `computedfield` calculates in the browser from attribute values already loaded for the page. It never hits the database. This makes it cheap for display-only formatting and combinations — but it means the value can't be used in server-side filters, is not exported unless the field is visible, and doesn't update unless the page reloads.

> [!related] [[Display Controls#Computed Field]], [[Property Index#V|`value`]]

---

### 18. Collapsible Section for Audit Fields

**Problem:** Audit fields (created by, modified date, etc.) should be available but not visible by default — they clutter the form for users who never need them.

```plvc
page OrderFormPage using SalesOrderSet {
   group OrderMainGroup;       -- always visible: core fields

   section AuditSection {
      label = "Audit Information";
      collapsed = [true];      -- starts collapsed; user can expand if needed

      group OrderAuditGroup;
   }
}

group OrderAuditGroup for SalesOrder {
   label = "";
   field CreatedBy {
      editable = [false];
      size = Medium;
   }
   field CreatedDate {
      editable = [false];
      size = Small;
   }
   field ModifiedBy {
      editable = [false];
      size = Medium;
   }
   field ModifiedDate {
      editable = [false];
      size = Small;
   }
}
```

**Why it works:** `section` with `collapsed = [true]` hides its content until the user explicitly expands it. The data is still loaded and available �� it's purely a visual grouping. Users who care about audit info click to see it; everyone else never sees it.

> [!related] [[Layout Controls]], [[Pages]]

---

## Quick Reference: Pattern by Problem

| I want to… | Pattern to use |
|-----------|---------------|
| Lock fields after submission | [[#1. Lock All Fields After a State Transition\|Pattern 1]] |
| Filter a LOV by another field | [[#2. Dependent LOV (Filter by Parent Field)\|Pattern 2]] |
| Auto-recalculate when fields change | [[#3. Validate Command Chain (Recalculate When Any Input Changes)\|Pattern 3]] |
| Pre-populate a dialog on open | [[#4. InitCommand: Pre-Populate a Dialog on Open\|Pattern 4]] |
| Show/hide a field conditionally | [[#5. Conditional Field Visibility Based on Another Field\|Pattern 5]] |
| Show child records for selected row | [[#6. Master-Detail: Parent List with Bound Child List\|Pattern 6]] |
| Act on multiple selected rows | [[#7. Bulk Command on Selected Rows\|Pattern 7]] |
| Show column totals | [[#8. Summary Totals Row\|Pattern 8]] |
| Force search before data loads | [[#9. Required Search Before Data Loads\|Pattern 9]] |
| Navigate from list to form | [[#10. Drill-Down from a List Row to a Form Page\|Pattern 10]] |
| Close a dialog and refresh caller | [[#11. Navigate Back After a Dialog Action\|Pattern 11]] |
| Confirm before a destructive action | [[#12. Confirmation Dialog Before a Destructive Command\|Pattern 12]] |
| Build a data entry modal | [[#13. Data Entry Dialog (Virtual Entity + Fragment)\|Pattern 13]] |
| Show a result message in an assistant | [[#14. Show a Success Message in an Assistant's Final Step\|Pattern 14]] |
| Status in list + status in form | [[#15. Badge in List, State Indicator in Form (The Pairing Pattern)\|Pattern 15]] |
| Lock currency after creation | [[#16. Lock Currency Unit After First Save\|Pattern 16]] |
| Combine attributes in one column | [[#17. Computed Column Combining Two Attributes\|Pattern 17]] |
| Hide audit fields by default | [[#18. Collapsible Section for Audit Fields\|Pattern 18]] |
