---
title: Dialog
publish: true
tags:
  - ifs-marble/client
  - ifs-marble/construct
aliases:
  - dialog declaration
  - dialog input
  - commandgroup
  - dialog Ok Cancel
related:
  - '[[Fragment]]'
  - '[[Virtual]]'
  - '[[Structure]]'
  - '[[Group]]'
  - '[[Commands and Expressions]]'
---

# Dialog

A ==dialog== is a modal overlay in Aurena — a pop-up form the user completes before returning to the parent screen. Dialogs are almost always defined in [[Fragment|fragments]] (not directly in `.client` files) so they can be reused across multiple clients.

A dialog has:
- A data context: the [[Structure]] or [[Virtual]] that holds its form data
- An `input(...)` clause: the parameters passed in by the caller when opening the dialog
- One or more `group` components that display the form fields
- A `commandgroup` containing OK, Cancel, and any other buttons

> [!abstract] Syntax
> ```marble
> dialog <DialogName> for <StructureOrVirtual> {
>    label = "<Dialog title>";
>    input(<Param1>, <Param2>, ...) {
>       command <InitCommandName>;    -- runs when dialog opens
>    }
>
>    group <GroupName>;               -- the form content
>    group <AnotherGroup>;            -- additional groups if needed
>    list <ListName>(<ArrayName>);    -- child list if dialog has lines
>
>    commandgroup <ButtonGroupName> {
>       command Ok;
>       command Cancel;
>       command <OtherCommandName>;
>    }
> }
> ```

---

## Keywords

| Keyword | Required | Description |
|---------|----------|-------------|
| `dialog` | Yes | Declares the dialog. Name referenced by [[Commands and Expressions|dlg commands]] and [[Navigator]] entries. |
| `for <Structure/Virtual>` | Yes | The data container. [[Structure]] for simple flat forms; [[Virtual]] for forms with child lists. |
| `label` | No | Title bar text. |
| `input(<params>)` | No | Parameters passed in by the calling command. These become attributes in the structure/virtual. The block can contain a `command InitCommandName` that fires when the dialog opens. |
| `group <Name>` | No | A [[Group]] component shown in the dialog body. |
| `list <Name>(<Array>)` | No | A child list inside the dialog (only when `for` is a [[Virtual]] with an `array`). |
| `commandgroup <Name>` | No | A logical button bar. Contains one or more `command` declarations. |

---

## Example — Full Dialog with Input Parameters and Init Command

> [!example] Source: `ifs-example/shpord/model/shpord/AddIndirectClockingDialog.fragment`

```plvc
dialog AddIndirectClockingDialog for AddIndirectClockingStructure {
   label = "New Indirect Labor Clocking";

   -- input: parameters the calling command passes when opening this dialog
   -- These become attributes in AddIndirectClockingStructure
   input(Company, EmployeeIdIn, ContractIn, StartTimeIn, CalledFromOtherComponent, CurrentEmployeeId, CurrentTeamId) {
      -- InitCommand runs immediately when the dialog opens (before user interaction)
      command InitCommand;
   }

   -- The form content comes from this group
   group AddIndirectClockingGroup;

   -- Standard button bar at the bottom of the dialog
   commandgroup ButtonCmdGroup {
      command Ok;
      command Cancel;
   }
}
```

---

## The `InitCommand` Pattern

An `InitCommand` (also written as `init command` in assistants) runs immediately when the dialog opens. It's used to:
- Pre-populate fields from the input parameters
- Fetch default values from the server via [[Function|functions]]
- Apply conditional initialization logic

```plvc
command InitCommand for AddIndirectClockingStructure {
   execute {
      -- If no site was passed in, get the user's default site from the server
      if [ContractIn = null] {
         call FrameStartupUserIndirect() into Contract;
      }
      else {
         set Contract = ContractIn;       -- use the passed-in value
      }
      -- Initialize employee or team based on context
      if [CalledFromOtherComponent] {
         set EmployeeId = EmployeeIdIn;
         set StartTime = StartTimeIn;
         set FinishTime = StartTimeIn;
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
   }
}
```

---

## The OK Command Pattern

The OK button command validates the required fields (via `enabled`) and calls the action that persists the dialog data:

```plvc
command Ok for AddIndirectClockingStructure {
   label = "OK";
   -- enabled expression: OK is grayed out until all required fields have values
   enabled = [not(Contract = null or IndirectJobId = null or StartTime = null)];
   execute {
      -- Call the projection action with all required parameters
      call AddIndirectClocking(Company, EmployeeId, Contract, IndirectJobId,
         StartTime, FinishTime, WorkCenterNo, TeamId, CurrentEmployeeId,
         CurrentTeamId, ClockingNoteText);
      exit OK;    -- close the dialog with OK result (refreshes calling page)
   }
}
```

> [!note] `exit OK` vs `exit Cancel`
> `exit OK` closes the dialog and signals success — the caller's `ludependencies` are refreshed. `exit Cancel` (used in the Cancel command) closes without triggering a refresh.

---

## Opening a Dialog from a Command

A dialog is opened by a command on a list or page using the `dialog` keyword in the execute block:

```plvc
command AddIndirectClockingCommand for SomeEntity {
   label = "Add Indirect Clocking";
   mode = SelectedRecords;
   execute {
      -- Open dialog, passing attributes from the selected row as input parameters
      dialog AddIndirectClockingDialog(Company, null, Contract, null, true, EmployeeId, null) {
         when OK {
            -- Optionally do something after dialog closes with OK
         }
         when CANCEL {
            -- Optionally handle cancel
         }
      }
   }
}
```

---

## Patterns & Tips

> [!tip] Always Verify the `enabled` Condition on OK
> The OK command's `enabled` expression is the client-side gate before calling the action. Include checks for all fields marked `required = [true]` in the structure. If a required field is null and the user clicks OK anyway (bypassing the enabled check), the server will reject the call with an error.

> [!tip] Dialogs Belong in Fragments, Not Client Files
> Defining a dialog directly in a `.client` file means it can only be opened from that one client. If the same dialog might be useful from multiple screens, define it in a `.fragment` file and include the fragment wherever needed.

> [!warning] Input Parameters Must Match the Structure Attributes
> Every parameter in `input(Param1, Param2, ...)` must correspond to an attribute declared in the structure or virtual. A mismatch between the input parameter list and the structure attributes causes a build error.

> [!warning] Don't Confuse `command InitCommand` (in dialog) with `init command` (in assistant)
> Dialogs reference a named command in the `input { command InitCommandName; }` block. Assistants use a different syntax: `init command { execute { ... } }` inline. Don't mix the patterns.

---

## See Also

- [[Fragment]] — where dialogs are usually defined
- [[Structure]] — the flat data container for simple dialogs
- [[Virtual]] — the data container for dialogs with child lists
- [[Group]] — the form content inside a dialog
- [[Commands and Expressions]] — `exit OK/Cancel`, `call`, `set`, `if/else`
- [[Fields and LOV]] — field and LOV declarations inside dialog groups
