---
title: Assistant
tags:
  - ifs-marble/client
  - ifs-marble/construct
aliases:
  - assistant declaration
  - wizard
  - multi-step wizard
  - singlestep
  - steps
  - init command
  - finish command
  - autorestart
  - keeponrestart
  - savemode OnLostFocus
  - restart command
  - warningsenabled
related:
  - "[[Virtual]]"
  - "[[Group]]"
  - "[[List]]"
  - "[[Commands and Expressions]]"
  - "[[Navigator]]"
  - "[[Dialog]]"
---

# Assistant

An ==assistant== is Aurena's multi-step wizard component. It presents a sequence of steps the user navigates through, with a Finish button at the end that triggers the final action. Assistants are used for complex operations that require gathering multiple inputs across logical stages (scheduling tasks, batch operations, structured data entry).

An assistant differs from a [[Dialog]] in that it supports multiple steps (or a single `singlestep` for simple wizards), step-level validation, step-by-step navigation controls, and distinct `finish`, `cancel`, and `next` command hooks.

> [!abstract] Syntax
> ```marble
> assistant <AssistantName> using <EntitysetName> {
>    label = "<Wizard title>";
>    input(<Param1>, <Param2>, ...);
>
>    init command {
>       execute { ... }
>    }
>
>    -- Single-step wizard (no navigation between steps):
>    singlestep {
>       group <GroupName>;
>       list <ListName>(<ArrayName>);
>    }
>
>    -- Multi-step wizard:
>    steps {
>       step {
>          label = "<Step label>";
>          group <GroupName>;
>          next command { enabled = [<expression>]; }
>       }
>       step { ... }
>       final step {
>          description = "${Result}";
>          command <SomeCommand> { visible = [<expression>]; }
>       }
>       cancelled step {
>          description = "Task was cancelled";
>       }
>    }
>
>    finish command {
>       enabled = [<expression>];
>       execute { ... }
>    }
>    cancel command {
>       execute { ... }
>    }
>    command <SomeCommand>;
> }
> ```

---

## Keywords

| Keyword | Required | Description |
|---------|----------|-------------|
| `assistant` | Yes | Declares the wizard. Name referenced by navigator entries and commands. |
| `using <EntitysetName>` | Yes | The [[Entityset]] / [[Virtual]] this assistant binds to. Almost always a virtual. |
| `label` | No | Title shown at the top of the wizard. Supports `${Attr}` interpolation. |
| `input(<params>)` | No | Parameters passed in when the assistant is opened programmatically. |
| `keeponrestart(<attrs>)` | No | Attributes preserved across assistant restarts (not reset when the assistant loops). |
| `autorestart` | No | Boolean expression. When true, the assistant automatically restarts after finish (used for batch workflows). |
| `savemode` | No | `OnLostFocus` — auto-saves when focus leaves a field. `OnFinish` — saves on Finish only. |
| `init command` | No | Runs when the assistant first loads. Supports `variable` declarations before `execute {}`. |
| `singlestep { }` | No | A single-screen wizard (no step navigation). Contains groups and lists. |
| `steps { }` | No | Multi-step wizard container. Contains `step`, `final step`, and `cancelled step` blocks. |
| `step <Name> { }` | No | One named step. `visible` and `enabled` control whether the step appears in the flow. |
| `final step { }` | No | The last step shown after `finish command` completes. Displays `description = "${Result}"`. |
| `cancelled step { }` | No | Shown if the user cancels mid-wizard. |
| `next command { }` | No | Inline command controlling navigation from this step to the next. `enabled` gates the Next button. Can declare `variable` blocks and run `execute {}` logic before advancing. |
| `finish command { }` | No | The wizard's primary execution command. Runs when user clicks Finish on the last step. |
| `cancel command { }` | No | Runs when user clicks Cancel. Typically calls a cleanup action then `navigate back` or `exit CANCEL`. |
| `restart command { }` | No | Controls whether the Restart button is available (for `autorestart` assistants). |
| `command <Name>` | No | Additional commands available inside the assistant. |
| `setup <Name> { }` | No | A named setup command — "setup command for an assistant or page." Unlike the single, unnamed `init command`, you can declare multiple named `setup` blocks. |

---

## Example — Multi-Step Scheduling Assistant

> [!example] Source: `ifs-example/shpord/model/shpord/AggregateShopOrderCostsperShopOrder.client`

```plvc
assistant TaskAssistant using TaskVirtuals {
   label = "Aggregate Shop Order Costs per Shop Order";

   -- init command: runs on open to pre-populate scheduling defaults
   init command {
      execute {
         call GetParameters() into Params;          -- fetch saved defaults from server
         set ScheduleMethodId = Params.ScheduleMethodId;
         set ScheduleName = Params.Description;
         set Site = Params.Site;                    -- pre-fill the Site parameter field
      }
   }

   steps {
      -- Step 1: user chooses Run Now vs. Schedule
      step {
         label = "Task Options";
         group ExecuteOptionGroup;                  -- radio buttons: Now / Schedule
         group ParameterGroup;                      -- Site selection
         next command {
            -- Next is only enabled when Schedule is chosen
            -- (Run Now jumps straight to Finish)
            enabled = [TaskOption = "Schedule"];
         }
      }

      -- Step 2: scheduling parameters (only reached if TaskOption = "Schedule")
      step {
         label = "Schedule";
         group SchedulingParametersGroup;           -- from included ScheduledTasksCommon fragment
         group SchedulingStartAndStopDateGroup;
      }

      -- Step 3: advanced scheduling options
      step {
         label = "Schedule Options";
         group ScheduledTasksAssistantAdvOpGroup;
         group ScheduledTasksAssistantStreamsGroup;
      }

      -- Final step: confirmation message (shown after finish command completes)
      final step {
         description = "${Result}";                -- ${Result} is a virtual attribute set during finish
         command NavigateToScheduledTask {
            visible = [TaskOption = "Schedule"];   -- only show this if a schedule was created
         }
      }

      -- Cancelled step: shown if user clicks Cancel
      cancelled step {
         description = "Task was cancelled";
      }
   }

   -- Finish command: execute the task or schedule it
   finish command {
      -- Complex enabled expression: validates different conditions per schedule option
      enabled = [(
         (TaskOption = "Now") or
         (TaskOption = "Schedule" and ScheduleName != null and
         (ScheduleOption = "Daily" and ScheduleTime != null) or
         (ScheduleOption = "Weekly" and ScheduleTime != null and ScheduledDays != null) or
         (ScheduleOption = "Monthly" and ScheduleTime != null and ScheduledDayNumber > 0 and ScheduledDayNumber < 32) or
         (ScheduleOption = "Date" and ScheduleDatetime != null) or
         (ScheduleOption = "Interval" and ScheduleInterval != null) or
         (ScheduleOption = "Custom" and ExecutionPlan != null)))];

      execute {
         if [TaskOption = "Now"] {
            call ExecuteTask();
            -- Set Result to populate the final step description
            set Result = "Task '${ScheduleName}' has been successfully queued as a background job.";
         }
         else {
            call ScheduleTask() into ScheduledTask;
            set ScheduleId = ScheduledTask.ScheduleId;
            set Result = "Task '${ScheduleName}', assigned with the Id '${ScheduleId}', was successfully scheduled to start ${ScheduledTask.ScheduledDate} at ${ScheduledTask.ScheduledTime}.";
         }
      }
   }

   -- Cancel command: navigate back to wherever the user came from
   cancel command {
      execute {
         navigate back;
      }
   }
}
```

---

## Example — Single-Step Assistant for Data Entry

> [!example] Source: `ifs-example/shpord/model/shpord/AddComponentsToTrackedStructureAssistant.client`

```plvc
assistant AddComponentsToTrackedStructureAssistant using ParentComponents {
   label = "Add Components to Parent";
   -- input: parameters from the parent page (selected record context)
   input(OrderNo, ReleaseNo, SequenceNo, Selection, VarSerialLot, VarLotBatchNo, PartLotTracked, SerialTracked);

   init command {
      execute {
         set ComponentSelection = Selection;
         if [VarSerialLot != null] {
            set ComponentSerialNo = VarSerialLot;
            set SerialNo = VarSerialLot;
         }
         if [VarLotBatchNo != null] {
            set ComponentLotBatchNo = VarLotBatchNo;
            set LotBatchNo = VarLotBatchNo;
         }
      }
   }

   -- singlestep: no Next/Previous navigation; user sees one screen then clicks Finish
   singlestep {
      group ParentComponentsGroup;
      list AddComponentsList(AddComponentsArray);   -- editable list of components to add
   }

   -- Named command used as the Finish action
   command AddComponentsToParentOkCommand;
   command Cancel;
}

-- The finish logic is in a named command (alternative to inline finish command):
command AddComponentsToParentOkCommand for ParentNodesVirtual {
   label = "OK";
   execute {
      call AddComponents(Objkey, SerialNo, LotBatchNo);
      exit OK;
   }
}
```

---

---

## Advanced Assistant Patterns

### Named Steps with `visible` / `enabled`

Steps can be named and conditionally shown or skipped:

```plvc
assistant ReceiveShopOrderAssistant using ReceiveShopOrderSet {
   label = "${AssistantTitle}";
   autorestart = [RemainingSelection != null];
   savemode = OnLostFocus;
   input(AssistantMode, RemainingSelection, InputOrderNo, InputReleaseNo, InputSequenceNo, CurrentEmployeeId);
   keeponrestart(RemainingSelection, CurrentSelectionCount, TotalSelectionCount);

   init command {
      variable VarInitInfo {
         type = Structure(InitInformationStructure);
      }
      variable VarReceiveType {
         type = Text;
      }
      execute {
         if [AssistantMode = 0] {
            set AssistantTitle = "Receive Shop Order Manually";
            set ReceiveShopOrd = true;
         }
         if [RemainingSelection != null] {
            call GetInitInformation(RemainingSelection) into VarInitInfo;
            set ReceiveType = VarInitInfo.ReceiveType;
         }
      }
   }

   steps {
      step StepReportOperation {
         visible = [ReportOperation = true and StartedFromNavigator = false];
         label = "Report Operation";

         markdowntext {
            visible = [ReportOperationMessage != null];
            text = "${ReportOperationMessage}";
            emphasis Info = [true];
         }
         group ReportOperationGroup;
         next command {
            enabled = [ReceiveShopOrd or QtyToReport > 0 or CloseOperation];
            execute {
               if [ReceiveType = "LOT"] {
                  call InitReceiveLot();
               }
            }
         }
      }
      step StepReceive {
         visible = [AssistantMode = 1 and ReceiveType = "STANDARD"];
         label = "Receive";
         group ReceiveShopOrderGroup;
         next command {
            enabled = [QtyToReceive > 0 and Location != null];
         }
      }
      final step {
         -- empty — framework shows completion UI
      }
      cancelled step {
      }
   }

   finish command {
      enabled = [component.ReceiveShopOrderAssistant.ActiveStepByName = component.ReceiveShopOrderAssistant.LastVisibleStepByName
                 and component.ReceiveShopOrderAssistant.IsActiveStepValid
                 and QtyToReceive > 0];
      variable VarReturnStruct {
         type = Structure(FinishExecuteReturnStructure);
      }
      execute {
         call FinishExecute() into VarReturnStruct;
         set TotalQtyReceived = VarReturnStruct.TotalQtyReceived;
         if [VarReturnStruct.HULabelReportResultKeys != null] {
            printdialog VarReturnStruct.HULabelReportResultKeys;
         }
         if [StartedFromNavigator] {
            navigate back;
         }
         else {
            exit OK;
         }
      }
   }
   cancel command {
      execute {
         call ReceiveShopOrderCancelExecute();
         if [StartedFromNavigator] {
            navigate back;
         }
         else {
            exit CANCEL;
         }
      }
   }
   restart command {
      enabled = [RemainingSelection != null];
   }
}
```

### `component.AssistantName.*` Properties

| Property | Description |
|----------|-------------|
| `component.<Name>.ActiveStepByName` | Name of the currently active step (use with named steps) |
| `component.<Name>.LastVisibleStepByName` | Name of the last visible step in the flow |
| `component.<Name>.IsActiveStepValid` | True if all required fields on the current step are valid |

Use these in the `finish command`'s `enabled` expression to ensure the user is on the last valid step before allowing Finish.

### Calling Nested Assistants (Sub-Wizard)

Open another assistant inline, capture output, branch on result:

```plvc
assistant DefineCostStructureAssistant(Contract, PartNo, ConfigurationId, LotBatchNo, SerialNo, ConditionCode, "SHOP ORDER RECEIPT", VarCostDetailId) into(CostDetailId) {
   when CANCEL {
      exit CANCEL;
   }
}
```

### `setup <Name>` — Named Setup Command

"setup command for an assistant or page." Like `init command`, but named — so an assistant (or page) can declare more than one, and other commands/components can be wired to trigger a specific one.

```marble
setup InitPage {
   execute {
      call FetchDefaults();
   }
}
```

### `warningsenabled` for Actions

At the top of the `.client` file, list actions that should show a support warnings dialog before executing:

```plvc
warningsenabled = FinishExecute, StartClockings, CheckEmployeeBeforeStartOp;
```

---

## Patterns & Tips

> [!tip] Use `singlestep` for Simple "Wizard" Dialogs
> If your wizard has only one screen of content, use `singlestep { }` instead of `steps { step { } }`. It's simpler to write and produces a cleaner UI without step navigation breadcrumbs.

> [!tip] `${Result}` Pattern for Confirmation Messages
> Set a virtual attribute named `Result` in the `finish command`'s execute block, then display it in the `final step` with `description = "${Result}"`. This gives users a meaningful completion message ("Task X scheduled for...") rather than a blank final screen.

> [!tip] `next command { enabled = [condition] }` Guards Step Progression
> Use the `next command`'s `enabled` expression to prevent users from advancing past a step until required fields are filled. This is cleaner than duplicating validation in the `finish command`.

> [!tip] `autorestart` + `keeponrestart` for Batch Workflows
> Use `autorestart = [RemainingSelection != null]` to loop the assistant over a selection (e.g., receive multiple shop orders one at a time). `keeponrestart` lists the attributes that should carry over between iterations rather than resetting to null.

> [!tip] Named Steps Enable Step-State Inspection
> Give steps names (`step StepReceive { ... }`) to use `component.AssistantName.ActiveStepByName = "StepReceive"` in `enabled` expressions. This is the standard pattern for guarding the `finish command` on assistants with conditional step flows.

> [!tip] Variables in `finish command` for Structured Returns
> Declare `variable VarReturn { type = Structure(ReturnStructure); }` inside the `finish command` to capture a structured return from the server, then unpack its fields with `set` statements.

> [!warning] `init command` vs `input { command InitCmd; }`
> Assistants use `init command { execute { ... } }` syntax — an inline block. Dialogs use `input(...) { command InitCommandName; }` — a reference to a separately-defined command. Don't mix the patterns.

> [!warning] The `final step` Is Not Editable
> The `final step` is a read-only confirmation screen. No groups or lists with editable fields should be placed here. It's a summary/result display only.

> [!warning] `step visible` vs `step enabled`
> `visible = [false]` skips a step entirely (it's not counted in the flow). `enabled = [false]` shows the step but grays out its content. Use `visible` to skip steps that don't apply to the current mode.

---

## See Also

- [[Virtual]] — the data container for assistants (`using <EntitysetName>`)
- [[Group]] — groups used inside steps and singlestep
- [[List]] — lists inside singlestep for editable rows
- [[Commands and Expressions]] — `call`, `set`, `navigate back`, `exit OK`
- [[Navigator]] — how assistants appear in the navigation tree
- [[Dialog]] — simpler modal alternative for single-screen interactions
