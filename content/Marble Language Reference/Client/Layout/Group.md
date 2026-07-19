---
title: Group
publish: true
tags:
  - ifs-marble/client
  - ifs-marble/construct
aliases:
  - group component
  - form group
  - field group
related:
  - '[[List]]'
  - '[[Fields and LOV]]'
  - '[[Dialog]]'
  - '[[Assistant]]'
  - '[[Pages]]'
---

# Group

A ==group== is the Aurena form panel — a labeled container of `field` and `lov` declarations that renders as a form rather than a grid. Groups are used inside [[Dialog|dialogs]], [[Assistant|assistants]], and [[Pages|form-style pages]] to present a structured set of fields for a single record.

Unlike a [[List]] (which shows many rows), a group shows the fields of one record at a time. Groups can contain the same `field`, `lov`, and `validate command` constructs as lists, but they also support `freeinput` on LOV fields and `initialfocus` for UX control.

> [!abstract] Syntax
> ```marble
> group <GroupName> for <EntityOrStructure> {
>    label = "<Panel label>";    -- set "" for no visible header
>
>    field <AttrName> {
>       size = <Small|Medium|Large|FullWidth>;
>       multiline = true;
>       validate command { execute { ... } }
>    }
>    lov <RefName> with <ReferenceSelectorName> {
>       size = <Medium|Large>;
>       description = <RefName>.<DescAttr>;
>       editable = [<expression>];
>       initialfocus = [true];
>       freeinput = [true];
>       validate command { execute { ... } }
>    }
> }
> ```

---

## Keywords

| Keyword | Required | Description |
|---------|----------|-------------|
| `group` | Yes | Declares the group. Name referenced by dialogs/assistants/pages. |
| `for <Entity/Structure>` | Yes | The entity, query, virtual, or structure whose single record is displayed. |
| `label` | No | Panel header text. Set `""` for no visible header (common in dialogs where the dialog title is enough). |
| `field` | No | Single-attribute form field. See [[Fields and LOV]] for sub-keywords. |
| `lov` | No | LOV dropdown field with linked lookup. See [[Fields and LOV]]. |
| `validate command` | No | Inline server callback triggered when a field loses focus. Runs `call` / `set` logic. |
| `initialfocus` | No | `initialfocus = [true]` on a `lov` or `field` puts the cursor there when the dialog opens. |
| `freeinput` | No | `freeinput = [true]` on a `lov` allows the user to type a value that isn't in the LOV list (open-ended filter input). |

---

## Example — Dialog Group with Validate Commands

> [!example] Source: `ifs-example/shpord/model/shpord/AddIndirectClockingDialog.fragment`

```plvc
group AddIndirectClockingGroup for AddIndirectClockingStructure {
   label = "";     -- no panel header; dialog title serves as the label

   -- LOV with validate command: when Contract changes, re-derive Company
   lov ContractRef with ReferenceUserAllowedSiteLovSelector {
      size = Medium;
      description = ContractRef.ContractDesc;
      validate command {
         execute {
            if [Contract != null] {
               -- Call a server function to get Company from Contract
               call ContractDataItemValidate(Contract) into Company;
               -- Recalculate time if all required fields are set
               if [(StartTime != null) and (FinishTime != null) and (IndirectJobId != null) and (EmployeeId != null)] {
                  call CalcMinutesIndirect(Company, EmployeeId, StartTime, FinishTime) into TimeResult;
               }
               else {
                  set TimeResult = null;
               }
            }
         }
      }
   }

   lov IndirectJobIdRef with ReferenceActiveIndirectJobSelector {
      size = Large;
      description = IndirectJobIdRef.Description;
      editable = [Contract != null];       -- disabled until a Contract is selected
      initialfocus = [true];               -- cursor lands here when dialog opens
   }

   lov EmployeeIdRef with ReferenceShopFloorEmployeeLovSelector {
      size = Medium;
      -- Disabled if called from another component (employee is pre-set by caller)
      editable = [Contract != null and (not CalledFromOtherComponent)];
      description = EmployeeIdRef.Name;
      validate command {
         execute {
            if [(StartTime != null) and (FinishTime != null) and (IndirectJobId != null) and (EmployeeId != null)] {
               call CalcMinutesIndirect(Company, EmployeeId, StartTime, FinishTime) into TimeResult;
            }
            else {
               set TimeResult = null;
            }
         }
      }
   }

   lov TeamIdRef with ReferenceShopFloorTeamLovSelector {
      size = Medium;
      editable = [Contract != null];
      description = TeamIdRef.Name;
   }

   lov WorkCenterNoRef with ReferenceWorkCenterInsideSelector {
      size = Medium;
      editable = [Contract != null];
      description = WorkCenterNoRef.Description;
   }

   field StartTime {
      validate command {
         execute {
            if [(StartTime != null) and (FinishTime != null) and (IndirectJobId != null) and (EmployeeId != null)] {
               call CalcMinutesIndirect(Company, EmployeeId, StartTime, FinishTime) into TimeResult;
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
            /* same time recalculation pattern */
         }
      }
   }

   field TimeResult;     -- read-only; computed by CalcMinutesIndirect

   field ClockingNoteText {
      size = FullWidth;
      multiline = true;  -- renders as a textarea for multi-line note input
   }
}
```

---

## Example — Group Inside an Assistant

> [!example] Source: `ifs-example/shpord/model/shpord/AggregateShopOrderCostsperShopOrder.client`

```plvc
-- Simple group for entering parameters in an assistant step
group ParameterGroup for TaskVirtual {
   label = "Parameters";

   lov SiteRef with ReferenceUserAllowedSiteLovSelector {
      -- freeinput: user can type a site code even if it's not in the dropdown
      freeinput = [true];
      description = SiteRef.ContractDesc;
   }
}
```

---

## Patterns & Tips

> [!tip] `label = ""` for Dialog Groups
> In a dialog, the dialog itself has a title. Adding a panel label to the group creates visual clutter. Set `label = ""` on groups that are the sole content of a dialog to suppress the redundant header.

> [!tip] Chain Validate Commands for Interdependent Fields
> When several fields depend on each other (e.g., StartTime, FinishTime, and EmployeeId all feed a CalcMinutes function), add the same validate command logic to each field. When any one changes and all conditions are met, the computation runs. This keeps the form reactive without requiring a Save.

> [!tip] `initialfocus` Goes on the First User-Editable Field
> Put `initialfocus = [true]` on the first field the user is expected to fill in. For dialogs where some fields are pre-populated by the init command, skip those and focus on the first "blank" field. This saves a click every time the dialog opens.

> [!warning] `validate command` Fires on Focus Loss, Not on Every Keystroke
> The `validate command` is triggered when the user leaves a field (tab/click away), not on each character typed. Design your validation logic around this — don't assume it runs in real time.

> [!warning] Groups in Assistants Must Reference the Correct `for` Entity
> In an assistant with a parent virtual and child virtual, each group must declare `for <CorrectVirtual>`. A group declared `for ParentVirtual` can't display child virtual attributes, and vice versa. Mismatch here silently shows empty fields.

---

## See Also

- [[Fields and LOV]] — all sub-keywords for `field` and `lov` inside groups
- [[Dialog]] — dialogs contain groups as their form content
- [[Assistant]] — assistants include groups inside steps
- [[List]] — grid alternative to group
- [[Commands and Expressions]] — `validate command` uses the same execute syntax
