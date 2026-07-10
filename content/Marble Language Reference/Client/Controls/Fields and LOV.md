---
title: Fields and LOV
tags:
  - ifs-marble/client
  - ifs-marble/construct
aliases:
  - field declaration
  - lov declaration
  - List of Values
  - lov with selector
  - validate command
  - field size
  - description attribute
  - initialfocus
  - freeinput
related:
  - "[[List]]"
  - "[[Group]]"
  - "[[References and Arrays]]"
  - "[[Commands and Expressions]]"
  - "[[Function]]"
---

# Fields and LOV

`field` and `lov` are the individual data-display declarations used inside [[List|lists]] and [[Group|groups]]. Every column in a grid and every form field in a dialog comes from one of these two constructs.

- A ==field== displays a single attribute value. It can be read-only or editable (based on the attribute's `editable` rule in the projection), and can trigger a `validate command` when the value changes.
- A ==lov== (List of Values) displays a dropdown lookup linked to a [[References and Arrays|reference]]. It shows a code field and optionally a description from the target entity, and can have a `validate command` that fires when the selected value changes.

---

## Field Declaration

> [!abstract] Syntax
> ```marble
> field <AttrName> {
>    label = "<Override label>";
>    size = <Small|Medium|Large|FullWidth>;
>    multiline = true;
>    editable = [<expression>];
>    visible = [<expression>];
>    validate command {
>       execute {
>          <statements>
>       }
>    }
> }
>
> -- Dot-notation field (from a referenced entity):
> field <RefName>.<AttrName> {
>    label = "<label>";
>    size = Small;
> }
>
> -- Minimal field (no overrides):
> field <AttrName>;
> ```

### Field Keywords

| Keyword | Required | Description |
|---------|----------|-------------|
| `field` | Yes | Names the attribute to display. |
| `label` | No | Overrides the projection's `label`. Use when the same attribute needs a different label in different contexts. |
| `size` | No | Column/field width hint: `Small` (~80px), `Medium` (~150px), `Large` (~250px), `FullWidth` (100%). |
| `multiline` | No | `multiline = true` renders a `<textarea>` instead of a single-line input. For notes and long text. |
| `editable` | No | Client-side override on top of the projection's `editable`. Can be more restrictive. |
| `visible` | No | Hides the field entirely when false. |
| `validate command` | No | Runs when the field loses focus. Contains `execute { call ... ; set ... ; }` logic. |

---

## LOV Declaration

> [!abstract] Syntax
> ```marble
> lov <RefName> with <Reference<TargetName>Selector> {
>    label = "<Override label>";
>    size = <Small|Medium|Large>;
>    description = <RefName>.<DescriptionAttr>;
>    editable = [<expression>];
>    visible = [<expression>];
>    initialfocus = [true];
>    freeinput = [true];
>    validate command {
>       execute {
>          <statements>
>       }
>    }
> }
> ```

### LOV Keywords

| Keyword | Required | Description |
|---------|----------|-------------|
| `lov` | Yes | Names the reference to use for the lookup. Must match a `reference <Name>...` in the projection. |
| `with <SelectorName>` | Yes | The selector fragment that provides the target entity. Convention: `Reference<TargetEntity>Selector`. The matching `include fragment <TargetEntity>Selector;` must be in the client header. |
| `label` | No | Overrides the reference label from the projection. |
| `size` | No | Width of the code input field. |
| `description` | No | Shows a secondary read-only field next to the code with a description from the target entity. Format: `<RefName>.<AttrName>`. |
| `editable` | No | Client-side editability override. |
| `visible` | No | Hides the LOV field when false. |
| `initialfocus` | No | `initialfocus = [true]` places cursor here when dialog/group opens. Use on the first user-entry field. |
| `freeinput` | No | `freeinput = [true]` allows typing a value not in the LOV list. Used for filter fields where partial matches are acceptable. |
| `validate command` | No | Fires when the LOV selection changes (user picks a value). Used to trigger dependent field recalculation. |

---

## Example — Fields and LOVs in a List

> [!example] Source: `ifs-example/shpord/model/shpord/ActualCostDetails.client`

```plvc
list ActualCostDetailsList for ShopOrderCostUtil {
   orderby = TransactionId;

   -- Simple field with size:
   field OrderNo {
      size = Small;
   }
   -- Field with no overrides (uses projection defaults):
   field DateCreated;
   field TransactionDesc;

   -- LOV: shows Part code + description
   lov InventoryPartRef with ReferenceInventoryPartLov2Selector {
      label = "Part";
      size = Large;
      -- description pulls from the InventoryPartLov2 entity's Description attribute
      description = InventoryPartRef.Description;
   }

   -- Dot-notation field: attribute from the referenced entity (read-only column)
   field InventoryPartRef.UnitMeas {
      size = Small;
      label = "Unit of Measure";
   }

   lov CostBucketRef with ReferenceCostBucketSelector {
      label = "Cost Bucket";
      size = Medium;
      description = CostBucketRef.Description;
   }

   -- Another dot-notation field from a different reference:
   field CostBucketRef.CostBucketType {
      size = Small;
      label = "Bucket Type";
   }

   lov WorkCenterNoRef with ReferenceWorkCenterSelector {
      label = "Work Center";
      size = Medium;
      description = WorkCenterNoRef.Description;
   }
   field WorkCenterNoRef.WorkCenterCode {
      size = Small;
      label = "Work Center Code";
   }
}
```

---

## Example — LOVs with Validate Commands in a Group

> [!example] Source: `ifs-example/shpord/model/shpord/AddIndirectClockingDialog.fragment`

```plvc
group AddIndirectClockingGroup for AddIndirectClockingStructure {
   label = "";

   lov ContractRef with ReferenceUserAllowedSiteLovSelector {
      size = Medium;
      description = ContractRef.ContractDesc;
      -- validate command: fires when Contract selection changes
      validate command {
         execute {
            if [Contract != null] {
               -- Re-derive Company when site changes
               call ContractDataItemValidate(Contract) into Company;
               -- Recalculate time if all prereqs are met
               if [(StartTime != null) and (FinishTime != null) and
                   (IndirectJobId != null) and (EmployeeId != null)] {
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
      editable = [Contract != null];   -- grayed out until Site is selected
      initialfocus = [true];           -- cursor starts here when dialog opens
   }

   lov EmployeeIdRef with ReferenceShopFloorEmployeeLovSelector {
      size = Medium;
      editable = [Contract != null and (not CalledFromOtherComponent)];
      description = EmployeeIdRef.Name;
      validate command {
         execute {
            if [(StartTime != null) and (FinishTime != null) and
                (IndirectJobId != null) and (EmployeeId != null)] {
               call CalcMinutesIndirect(Company, EmployeeId, StartTime, FinishTime) into TimeResult;
            }
            else {
               set TimeResult = null;
            }
         }
      }
   }

   -- Field with validate command: same time recalculation on every change
   field StartTime {
      validate command {
         execute {
            if [(StartTime != null) and (FinishTime != null) and
                (IndirectJobId != null) and (EmployeeId != null)] {
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
            /* same pattern */
         }
      }
   }

   -- Read-only computed field (no editable override needed — projection says editable=[false]):
   field TimeResult;

   -- Multi-line text area:
   field ClockingNoteText {
      size = FullWidth;
      multiline = true;
   }
}
```

---

## Example — `freeinput` LOV for a Filter Field

```plvc
-- From AggregateShopOrderCostsperShopOrder.client:
group ParameterGroup for TaskVirtual {
   label = "Parameters";
   lov SiteRef with ReferenceUserAllowedSiteLovSelector {
      -- freeinput: user can type a site pattern even if not an exact LOV match
      -- Useful for "run for all sites" type inputs
      freeinput = [true];
      description = SiteRef.ContractDesc;
   }
}
```

---

## Patterns & Tips

> [!tip] Always Set `description =` on LOVs for User-Facing Screens
> A LOV that shows only a code (e.g., `W001`) with no description is hostile to users who don't have all codes memorized. Always add `description = RefName.Description` (or whatever the description attribute is named) to every LOV on a user-facing screen.

> [!tip] Chain Validate Commands Across Related Fields
> When TimeResult depends on StartTime, FinishTime, IndirectJobId, and EmployeeId, add the same validate logic to all four fields. The server call is cheap; the alternative (manually clicking Recalculate) is annoying.

> [!tip] `editable = [DependentField != null]` for Dependent LOVs
> When one LOV depends on another (e.g., IndirectJob scoped to a Site), set `editable = [Site != null]` on the dependent LOV. This prevents the user from selecting a job before selecting a site, avoiding invalid combinations.

> [!warning] Dot-Notation Fields Are Always Read-Only
> `field RefName.SubAttr` always renders read-only, regardless of the target entity's editable settings. It's a display column only. To make the user edit a referenced entity's field, that field must be an attribute on the main entity, not accessed via dot notation.

> [!warning] `with ReferenceXSelector` Must Match an Included Fragment
> The selector name `ReferenceUserAllowedSiteLovSelector` must correspond to a fragment named `UserAllowedSiteLovSelector` that is included in the client header. If the fragment isn't included, the build fails. Check both the `include fragment` line in the client and the reference declaration in the projection.

---

## See Also

- [[References and Arrays]] — the projection `reference` declarations these `lov` fields consume
- [[Group]] — the container where most LOVs with validate commands appear
- [[List]] — where fields and lovs appear as grid columns
- [[Commands and Expressions]] — the `execute` block inside validate commands
- [[Projection File Structure]] — `include fragment <Name>Selector;` for LOV fragments
