---
title: Build Your First Screen
tags:
  - ifs-marble
  - ifs-marble/guide
  - ifs-marble/tutorial
aliases:
  - first screen tutorial
  - Marble tutorial
  - getting started tutorial
  - hello world
related:
  - "[[Thinking in Marble]]"
  - "[[Glossary]]"
  - "[[Client File Structure]]"
  - "[[Projection File Structure]]"
  - "[[Fragment]]"
---

# Build Your First Screen

This tutorial builds a complete, working IFS Cloud screen from scratch. By the end you will have written a projection file, a fragment, and a client file that together produce a navigable list page with a detail form, a LOV dropdown, a badge, and a command button.

> [!info] Prerequisites
> Read [[Thinking in Marble]] first. This tutorial assumes you understand the four-layer stack and the three rules. If a term is unfamiliar, check the [[Glossary]].

---

## What You'll Build

A **Leave Request** tracker — a screen where employees can view and submit leave requests, and managers can see all requests in a list.

```marble
┌─────────────────────────────────────────────────────────┐
│  Leave Requests                              [+ New]     │
│─────────────────────────────────────────────────────────│
│  Request ID  │ Employee  │ Type    │ Start    │ Status   │
│  LR-00001    │ Smith, J  │ Vacation│ 2024-06-01│ ● Open  │
│  LR-00002    │ Jones, A  │ Sick    │ 2024-06-03│ ● Open  │
│  LR-00003    │ Davis, M  │ Vacation│ 2024-05-20│ ✓ Closed│
└─────────────────────────────────────────────────────────┘

Clicking a row opens the detail form:

┌─────────────────────────────────────────────────────────┐
│  Leave Request: LR-00001                  ● Open        │
│─────────────────────────────────────────────────────────│
│  Request ID   LR-00001    Company    10               │
│  Employee     [Smith, John          ▼]  John Smith      │
│  Leave Type   Vacation                                  │
│  Start Date   2024-06-01                               │
│  End Date     2024-06-10                               │
│  Reason       ________________________________          │
│               [Submit Request]                          │
└─────────────────────────────────────────────────────────┘
```

You will build this in ten steps. Each step shows exactly what to add and why.

---

## The Files You'll Create

| File | Type | Purpose |
|------|------|---------|
| `LeaveRequest.projection` | Projection | Data contract: entity, entityset, reference, action |
| `EmployeeSelector.fragment` | Fragment | Reusable employee LOV (projection + client sides) |
| `LeaveRequest.client` | Client | UI: list page, form page, navigator entry, command |

In a real project, the selector fragment likely already exists — you would just include it. Here you'll write it yourself to understand what's inside.

---

## Step 1: Create the Projection File

Every screen starts with the projection. Create `LeaveRequest.projection`.

The file always opens with the same five header lines:

```plvc
component MYCOMP;             -- the IFS component this belongs to
layer Cust;                   -- Cust = customization layer (your code)
projection LeaveRequestHandling;  -- name used by client files

include fragment EmployeeSelector;   -- we'll write this in Step 3
```

> [!note] `layer Cust`
> Using `layer Cust` marks this as your customization code. IFS upgrades won't overwrite it. `layer Core` is reserved for IFS-supplied base code — never use it for your own files.

---

## Step 2: Define the Entity

The entity declares the data shape. Add this to your projection file:

```plvc
entity LeaveRequest {
   crud = Read, Create, Update, Delete;

   attribute RequestId      Text {
      label = "Request ID";
   }
   attribute Company        Text {
      label = "Company";
   }
   attribute EmployeeId     Text {
      label = "Employee";
   }
   attribute LeaveType      Text {
      label = "Leave Type";
   }
   attribute StartDate      Date {
      label = "Start Date";
   }
   attribute EndDate        Date {
      label = "End Date";
   }
   attribute Reason         LongText {
      label = "Reason";
      editable = [true];
   }
   attribute Objstate       Text {
      label = "Status";
      editable = [false];
   }
   attribute ObjstateDbVal  Text;   -- needed for state machine operations

   reference EmployeeRef(Company, EmployeeId) to Employee(Company, EmployeeId);

   keys CompanyKey = Company, RequestIdKey = RequestId;
}
```

**What each part does:**

- `crud = Read, Create, Update, Delete` — enables all four operations on the list and form
- Each `attribute` line declares one column. The name, type, and label are all you need to start.
- `editable = [false]` on `Objstate` — the status is controlled by actions, not direct editing
- `reference EmployeeRef(...)` — declares the foreign key that the employee LOV will use
- `keys` — tells the framework which attributes uniquely identify one record

> [!tip] Types at a Glance
> `Text` = VARCHAR, `Number` = numeric, `Date` = date only, `Timestamp` = date+time, `Boolean` = yes/no, `LongText` = multi-line text (CLOB equivalent).

---

## Step 3: Expose the Entity with an Entityset

The entity defines the data shape. The entityset makes it queryable by a client page. Add this directly below the entity:

```plvc
entityset LeaveRequestSet for LeaveRequest;
```

One line. Every page that wants to show `LeaveRequest` data will declare `using LeaveRequestSet`.

> [!note] Entityset vs Entity
> The entity is the *blueprint*. The entityset is the *public endpoint*. A page binds to the entityset; the entityset resolves to the entity. You can have multiple entitysets for one entity with different filters or ordering — but one is enough to start.

---

## Step 4: Declare the Action

Add the action that submits a request. When the user clicks "Submit Request," this is what runs on the server:

```plvc
action SubmitLeaveRequest {
   initialcheck none;
   parameter RequestId  Text;
   parameter Company    Text;

   supportwarnings = [true];
}
```

- `initialcheck none` — skips the framework's default pre-save check (appropriate for workflow actions)
- `parameter` lines — the data the client must pass when calling this action
- `supportwarnings = [true]` — allows the PL/SQL implementation to return warnings the user can override

> [!tip] You Don't Write the PL/SQL Here
> The `action` declaration is the contract. The PL/SQL implementation goes in the `.plsvc` file (same name as the projection). Writing that file is outside this tutorial's scope — here you're defining what the client can call.

---

## Step 5: Write the Employee Selector Fragment

This fragment provides the employee LOV. Create `EmployeeSelector.fragment`.

A fragment always has two sections — projection side first, then client side:

```plvc
component MYCOMP;
layer Cust;

----------------------------- PROJECTION FRAGMENTS ----------------------------

-- Exposes a read-only employee list for LOV lookups:
query EmployeeSelector for Employee {
   where = "OBJSTATE_DB = 'Active'";   -- only active employees
}

entityset EmployeeSelectorSet for EmployeeSelector;

------------------------------ CLIENT FRAGMENTS --------------------------------

-- The selector UI component — this is what `with ReferenceEmployeeSelector` refers to:
selector ReferenceEmployeeSelector for EmployeeSelectorSet {
   static EmployeeId;          -- the "code" column shown in the LOV field
   static Name;                -- the description shown next to the code
   static Company;
}
```

**Why two sections?**
The fragment must satisfy both sides of the contract at once. When the client `include`s this fragment, it gets the entityset (data) AND the selector component (UI) in one file. See [[Fragment]] for the full explanation.

> [!note] Naming Convention
> The selector is named `ReferenceEmployeeSelector` — the `Reference` prefix is the IFS convention for LOV selectors. This name is what the client uses in `lov EmployeeRef with ReferenceEmployeeSelector`.

---

## Step 6: Create the Client File

Create `LeaveRequest.client`. The header declares which projection it consumes and which fragments it needs:

```plvc
component MYCOMP;
layer Cust;
client LeaveRequest;
projection LeaveRequestHandling;

include fragment EmployeeSelector;   -- makes ReferenceEmployeeSelector available
```

> [!warning] `client` and `projection` Names Must Match
> The name after `client` and after `projection` must be identical. They're the binding key — the framework uses this to link the two files. A mismatch causes a build error.

---

## Step 7: Build the List Page

Add the list and its page to the client file:

```plvc
----------------------------------- LISTS -------------------------------------

list LeaveRequestList for LeaveRequest {
   orderby = StartDate desc;        -- newest requests first
   editmode = SingleCellEdit;
   multiselect = [true];

   fieldranking RequestId, EmployeeId, LeaveType, StartDate, Objstate;

   field RequestId {
      size = Small;
   }
   field StartDate {
      size = Small;
   }
   field EndDate {
      size = Small;
   }

   -- LOV column: shows EmployeeId code + name description
   lov EmployeeRef with ReferenceEmployeeSelector {
      label = "Employee";
      size  = Medium;
      description = EmployeeRef.Name;
   }

   field LeaveType {
      size = Medium;
   }

   -- Badge: status chip colored by Objstate value
   badge Objstate {
      label = "Status";
      emphasis StateOpen      = [Objstate = "Open"];
      emphasis StateReleased  = [Objstate = "Submitted"];
      emphasis StateCompleted = [Objstate = "Approved"];
      emphasis StateClosed    = [Objstate = "Closed"];
      emphasis StateCancelled = [Objstate = "Rejected"];
   }

   -- Command: appears as an action button on selected rows
   command SubmitRequestCommand;
}

----------------------------------- PAGES -------------------------------------

page List using LeaveRequestSet {
   label = "Leave Requests";
   startupmode = search;         -- wait for user to search before loading data
   list LeaveRequestList;
}
```

> [!tip] `startupmode = search`
> Always use `startupmode = search` on list pages for entities that could have many records. The page opens with an empty grid and a search bar — data only loads after the user applies a filter. Without it, the page tries to load every record on open.

---

## Step 8: Build the Detail Form

Add the group and form page. This is what the user sees after clicking a row:

```plvc
---------------------------------- GROUPS -------------------------------------

group LeaveRequestGroup for LeaveRequest {
   label = "";    -- no panel header; the page title serves as context

   field RequestId {
      size = Small;
      editable = [false];
   }
   field Company {
      size = Small;
      editable = [false];
   }

   lov EmployeeRef with ReferenceEmployeeSelector {
      label       = "Employee";
      size        = Medium;
      description = EmployeeRef.Name;
      editable    = [Objstate = "Open"];   -- lock after submission
   }

   field LeaveType {
      size     = Medium;
      editable = [Objstate = "Open"];
   }
   field StartDate {
      size     = Small;
      editable = [Objstate = "Open"];
   }
   field EndDate {
      size     = Small;
      editable = [Objstate = "Open"];
   }
   field Reason {
      size      = FullWidth;
      multiline = true;
      editable  = [Objstate = "Open"];
   }
}

-- The form page: shows the group for one selected record
page Form using LeaveRequestSet {
   label = "Leave Request";
   group LeaveRequestGroup;
}
```

> [!tip] `editable = [Objstate = "Open"]`
> This pattern — locking all fields once a request is no longer Open — is the standard IFS form approach. The user can only edit fields while the record is in its initial state. After submission, the form becomes read-only automatically.

---

## Step 9: Declare the Command

The command wires the client button to the server action. Add this to the client file, before the lists section:

```plvc
--------------------------------- COMMANDS ------------------------------------

command SubmitRequestCommand for LeaveRequest {
   label   = "Submit Request";
   mode    = SelectedRecords;
   enabled = [Objstate = "Open"];   -- only enabled on Open requests

   bulkexecute {
      call SubmitLeaveRequest(RequestId, Company);
   }
}
```

- `mode = SelectedRecords` — the command appears when one or more rows are selected
- `enabled = [Objstate = "Open"]` — grays out the button for already-submitted requests
- `bulkexecute` — runs once per selected row; calls the action declared in the projection

> [!note] `bulkexecute` vs `execute`
> Use `bulkexecute` + `bulknavigate`/`call` when the command operates on multiple selected rows. Use `execute` when the command operates on a single record (e.g., from a form page). For commands triggered from a list, `bulkexecute` is almost always correct.

---

## Step 10: Add the Navigator Entry

Without a navigator entry, the page can only be reached by URL. Add this to register it in the IFS application menu:

```plvc
--------------------------------- NAVIGATOR -----------------------------------

navigator {
   entry LeaveRequestNavEntry parent HrNavigator.LeaveManagementEntry at index 500 {
      label = "Leave Requests";
      page  List;
   }
}
```

- `parent HrNavigator.LeaveManagementEntry` — places this under an existing menu group
- `at index 500` — controls its sort position within that group (higher index = lower in menu)
- `page List` — the page to open when the user clicks the menu entry

> [!note] Parent Navigator Groups
> `HrNavigator.LeaveManagementEntry` is a fictional parent used for this tutorial. In a real project, find the correct parent by looking at neighboring features in the same module. The `Navigator.md` reference covers the full syntax.

---

## The Complete Files

Here are the three final files as they stand after all ten steps.

### `LeaveRequest.projection`

```plvc
component MYCOMP;
layer Cust;
projection LeaveRequestHandling;

include fragment EmployeeSelector;

entity LeaveRequest {
   crud = Read, Create, Update, Delete;

   attribute RequestId      Text {
      label = "Request ID";
   }
   attribute Company        Text {
      label = "Company";
   }
   attribute EmployeeId     Text {
      label = "Employee";
   }
   attribute LeaveType      Text {
      label = "Leave Type";
   }
   attribute StartDate      Date {
      label = "Start Date";
   }
   attribute EndDate        Date {
      label = "End Date";
   }
   attribute Reason         LongText {
      label = "Reason";
      editable = [true];
   }
   attribute Objstate       Text {
      label = "Status";
      editable = [false];
   }
   attribute ObjstateDbVal  Text;

   reference EmployeeRef(Company, EmployeeId) to Employee(Company, EmployeeId);

   keys CompanyKey = Company, RequestIdKey = RequestId;
}

entityset LeaveRequestSet for LeaveRequest;

action SubmitLeaveRequest {
   initialcheck none;
   parameter RequestId  Text;
   parameter Company    Text;
   supportwarnings = [true];
}
```

### `EmployeeSelector.fragment`

```plvc
component MYCOMP;
layer Cust;

----------------------------- PROJECTION FRAGMENTS ----------------------------

query EmployeeSelector for Employee {
   where = "OBJSTATE_DB = 'Active'";
}

entityset EmployeeSelectorSet for EmployeeSelector;

------------------------------ CLIENT FRAGMENTS --------------------------------

selector ReferenceEmployeeSelector for EmployeeSelectorSet {
   static EmployeeId;
   static Name;
   static Company;
}
```

### `LeaveRequest.client`

```plvc
component MYCOMP;
layer Cust;
client LeaveRequestHandling;
projection LeaveRequestHandling;

include fragment EmployeeSelector;

--------------------------------- COMMANDS ------------------------------------

command SubmitRequestCommand for LeaveRequest {
   label   = "Submit Request";
   mode    = SelectedRecords;
   enabled = [Objstate = "Open"];
   bulkexecute {
      call SubmitLeaveRequest(RequestId, Company);
   }
}

----------------------------------- LISTS -------------------------------------

list LeaveRequestList for LeaveRequest {
   orderby = StartDate desc;
   editmode = SingleCellEdit;
   multiselect = [true];
   fieldranking RequestId, EmployeeId, LeaveType, StartDate, Objstate;

   field RequestId {
      size = Small;
   }
   field StartDate {
      size = Small;
   }
   field EndDate {
      size = Small;
   }
   lov EmployeeRef with ReferenceEmployeeSelector {
      label = "Employee";
      size  = Medium;
      description = EmployeeRef.Name;
   }
   field LeaveType {
      size = Medium;
   }
   badge Objstate {
      label = "Status";
      emphasis StateOpen      = [Objstate = "Open"];
      emphasis StateReleased  = [Objstate = "Submitted"];
      emphasis StateCompleted = [Objstate = "Approved"];
      emphasis StateClosed    = [Objstate = "Closed"];
      emphasis StateCancelled = [Objstate = "Rejected"];
   }
   command SubmitRequestCommand;
}

---------------------------------- GROUPS -------------------------------------

group LeaveRequestGroup for LeaveRequest {
   label = "";
   field RequestId {
      size = Small;
      editable = [false];
   }
   field Company {
      size = Small;
      editable = [false];
   }
   lov EmployeeRef with ReferenceEmployeeSelector {
      label       = "Employee";
      size        = Medium;
      description = EmployeeRef.Name;
      editable    = [Objstate = "Open"];
   }
   field LeaveType {
      size = Medium;
      editable = [Objstate = "Open"];
   }
   field StartDate {
      size = Small;
      editable = [Objstate = "Open"];
   }
   field EndDate {
      size = Small;
      editable = [Objstate = "Open"];
   }
   field Reason {
      size = FullWidth;
      multiline = true;
      editable = [Objstate = "Open"];
   }
}

----------------------------------- PAGES -------------------------------------

page List using LeaveRequestSet {
   label = "Leave Requests";
   startupmode = search;
   list LeaveRequestList;
}

page Form using LeaveRequestSet {
   label = "Leave Request";
   group LeaveRequestGroup;
}

--------------------------------- NAVIGATOR -----------------------------------

navigator {
   entry LeaveRequestNavEntry parent HrNavigator.LeaveManagementEntry at index 500 {
      label = "Leave Requests";
      page  List;
   }
}
```

---

## What You've Covered

| Concept | Where it appeared |
|---------|------------------|
| Projection file structure | Step 1 |
| Entity with attributes and types | Step 2 |
| Entityset | Step 3 |
| Action declaration | Step 4 |
| Fragment (both sections) | Step 5 |
| Client file header + `include fragment` | Step 6 |
| List with `orderby`, `editmode`, `fieldranking` | Step 7 |
| `lov` with `description` | Step 7, Step 8 |
| `badge` with `emphasis` | Step 7 |
| Group with conditional `editable` | Step 8 |
| `command` with `bulkexecute` and `call` | Step 9 |
| Navigator entry | Step 10 |

---

## What's Not Covered Here

This tutorial builds the most common screen pattern. These topics go deeper:

| Topic | Reference |
|-------|-----------|
| Validate commands (onChange recalculation) | [[Fields and LOV]] |
| Dialog for data entry | [[Dialog]] + [[Virtual]] |
| Multi-step assistant wizard | [[Assistant]] + [[Virtual]] |
| Master-detail with nested lists | [[List]] → Bind section |
| Charts and calendar views | [[Charts]], [[Data Views]] |
| Search context (advanced filtering) | [[Selector and Search Context]] |
| State machine and Objstate transitions | [[Entity]] → Objstate section |
| Layer override on existing screens | [[Projection File Structure]] → Override section |

---

## Common First-Screen Errors

> [!warning] `include fragment` is missing
> If the LOV dropdown is empty or the build fails with an unknown selector error, you've forgotten `include fragment EmployeeSelector;` in either the projection file or the client file — it must be in **both**.

> [!warning] `client` and `projection` names don't match
> `client LeaveRequestHandling;` and `projection LeaveRequestHandling;` must be identical. A mismatch means the framework can't link the files and the screen won't build.

> [!warning] Page loads all records on open
> You forgot `startupmode = search;` on the list page. Add it to any page bound to a high-volume entity.

> [!warning] Command is always grayed out
> The `enabled = [Objstate = "Open"]` expression evaluates against the selected record. If you're testing with a record that's already in "Submitted" state, the button is correctly disabled. Try with an "Open" record.
