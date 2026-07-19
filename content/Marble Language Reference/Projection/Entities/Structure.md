---
title: Structure
publish: true
tags:
  - ifs-marble/projection
  - ifs-marble/construct
aliases:
  - structure definition
  - parameter structure
  - return structure
related:
  - '[[Virtual]]'
  - '[[Action]]'
  - '[[Function]]'
  - '[[Attribute Modifiers]]'
  - '[[Dialog]]'
---

# Structure

A ==structure== is a named, flat collection of typed attributes used to pass grouped data between the client and server. Structures are the parameter bags of the Marble language — they appear as:

- The body of a [[Dialog]] (the form fields that collect user input)
- The return type of a [[Function]] that returns a complex object
- The `into` target when a function call returns multiple values

Unlike a [[Virtual]], a structure cannot be listed (no child arrays, no CRUD). It's strictly a container for a fixed set of named values. Structures are defined in the PROJECTION FRAGMENTS section of a `.fragment` file or directly in a `.projection` file.

> [!abstract] Syntax
> ```marble
> structure <StructureName> {
>    attribute <AttrName> <Type> {
>       label = "...";
>       maxlength = <n>;
>       required = [<expression>];
>       editable = [<expression>];
>       format = <uppercase|ifscurrency|...>;
>       insertable = [<expression>];
>    }
>    reference <RefName>(<keys>) to <Entity>(<keys>) {
>       label = "...";
>    }
> }
> ```

---

## Keywords

| Keyword | Required | Description |
|---------|----------|-------------|
| `structure` | Yes | Declares the structure. Name must end in a noun describing the payload (e.g., `AddIndirectClockingStructure`, `ScheduleTaskParameters`). |
| `attribute` | No | A named field in the structure. Supports the same sub-keywords as entity attributes. See [[Attribute Modifiers]]. |
| `reference` | No | FK lookup for a LOV inside the dialog that uses this structure. See [[References and Arrays]]. |
| `insertable` | No | Sub-keyword on attribute. `insertable = [true]` allows setting the attribute even when `editable = [false]`. Used for fields populated by the `init command` that the user shouldn't manually change. |

---

## Example — Dialog Structure with References and Init-Only Fields

> [!example] Source: `ifs-example/shpord/model/shpord/AddIndirectClockingDialog.fragment`

```plvc
structure AddIndirectClockingStructure {
   -- User-visible fields: shown in the dialog form
   attribute Contract Text {
      label = "Site";
      maxlength = 5;
      required = [true];
      format = uppercase;
   }
   attribute Company Text {
      label = "Company";
      maxlength = 20;
      required = [true];
      format = uppercase;
   }
   attribute IndirectJobId Text {
      label = "Indirect Job";
      maxlength = 10;
      required = [true];
      format = uppercase;
   }
   -- EmployeeId: not editable by the user, but settable by the init command
   attribute EmployeeId Text {
      label = "Employee";
      maxlength = 11;
      format = uppercase;
      editable = [false];
      insertable = [true];   -- allows the init command to set this via "set EmployeeId = ..."
   }
   attribute TeamId Text {
      label = "Team";
      maxlength = 12;
      format = uppercase;
   }
   attribute StartTime Timestamp {
      label = "Start Time";
      required = [true];
   }
   attribute FinishTime Timestamp {
      label = "Stop Time";
   }
   attribute TimeResult Number {
      label = "Time Result";
      editable = [false];    -- computed server-side; user cannot edit
   }
   attribute ClockingNoteText Text {
      label = "Clocking Note";
      maxlength = 2000;
   }

   -- Input-only attributes: passed from the caller, not shown to the user directly
   -- These are "hidden" fields used by the init command for initialization logic
   attribute EmployeeIdIn Text;
   attribute ContractIn Text;
   attribute StartTimeIn Timestamp;
   attribute CalledFromOtherComponent Boolean;
   attribute CurrentEmployeeId Text;
   attribute CurrentTeamId Text;

   -- References: enable LOV lookups for the named attributes in the dialog group
   reference ContractRef(Contract) to UserAllowedSiteLov(Contract) {
      label = "Site";
   }
   reference IndirectJobIdRef(Contract, IndirectJobId) to ActiveIndirectJob(Contract, IndirectJobId) {
      label = "Indirect Job";
   }
   reference EmployeeIdRef(Contract, Company, EmployeeId) to ShopFloorEmployeeLov(Contract, Company, EmployeeId) {
      label = "Employee";
   }
   reference TeamIdRef(Contract, TeamId) to ShopFloorTeamLov(Contract, TeamId) {
      label = "Team";
   }
   reference WorkCenterNoRef(Contract, WorkCenterNo) to WorkCenterInside(Contract, WorkCenterNo) {
      label = "Work Center";
   }
}
```

---

## Using a Structure as a Function Return Type

A function can return a structure to deliver multiple values at once:

```plvc
-- Projection declaration:
function GetParameters Structure(ScheduleTaskParameters);

-- In the client, called during init:
init command {
   execute {
      call GetParameters() into Params;
      set ScheduleMethodId = Params.ScheduleMethodId;
      set ScheduleName = Params.Description;
      set Site = Params.Site;
   }
}
```

The `into Params` syntax stores the returned structure in a virtual attribute of type `Structure(ScheduleTaskParameters)`. Fields are then accessed as `Params.FieldName`.

---

## Patterns & Tips

> [!tip] Separate User-Visible from Input-Only Attributes
> Structures commonly carry both fields the user fills in and "hidden" parameters passed in by the `input(...)` clause of the dialog. Keep input-only attributes at the bottom of the structure, without `label`, `required`, or `editable` keywords — this signals they're infrastructure, not UI fields.

> [!tip] `insertable = [true]` Is the Right Tool for Init-Populated Fields
> When a field should be set by the `init command` but not directly edited by the user, combine `editable = [false]` with `insertable = [true]`. This prevents UI editing while allowing the client's `set FieldName = ...` command to write to the field.

> [!warning] Structure vs. Virtual: Structures Can't Be Listed
> If you need a list of rows inside a dialog (e.g., operation lines to distribute quantities across), use a child [[Virtual]] with an `array`. A structure is flat — it can't contain arrays or collections.

---

## See Also

- [[Virtual]] — for listable, multi-row dialog data
- [[Function]] — functions that return structures
- [[Action]] — structure fields often become action parameters
- [[Attribute Modifiers]] — sub-keywords inside attribute blocks
- [[Dialog]] — the client construct that uses a structure as its form
