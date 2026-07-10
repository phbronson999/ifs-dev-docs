---
title: Fragment
tags:
  - ifs-marble/client
  - ifs-marble/projection
  - ifs-marble/construct
aliases:
  - fragment file
  - .fragment file
  - CLIENT FRAGMENTS
  - PROJECTION FRAGMENTS
  - fragment include
related:
  - "[[Client File Structure]]"
  - "[[Projection File Structure]]"
  - "[[Dialog]]"
  - "[[Structure]]"
  - "[[Action]]"
  - "[[Function]]"
---

# Fragment

A ==.fragment== file is a dual-section file that contains both client-side (UI) and projection-side (data) constructs in one place. It's the primary code-reuse mechanism in Marble — anything that needs to be available to multiple clients or projections lives in a fragment.

A fragment is included with `include fragment <Name>;` in both the `.client` and `.projection` files that use it. The Marble framework automatically routes:
- The **CLIENT FRAGMENTS** section → into the client
- The **PROJECTION FRAGMENTS** section → into the projection

> [!abstract] Syntax
> ```marble
> fragment <FragmentName>;
> component <COMPONENT>;
> layer <Core|Cust>;
> description "<description>";
>
> ----------------------------- CLIENT FRAGMENTS ------------------------------
>
> -- UI constructs: dialogs, groups, commands, selectors
> dialog <DialogName> for <StructureOrVirtual> { ... }
> group <GroupName> for <StructureOrVirtual> { ... }
> command <CommandName> for <Entity> { ... }
>
> --------------------------- PROJECTION FRAGMENTS ----------------------------
>
> -- Data constructs: entitysets, entities, virtuals, structures, actions, functions
> entityset <SetName> for <Entity>;
> entity <EntityName> { ... }
> structure <StructureName> { ... }
> action <ActionName> { ... }
> function <FunctionName> <ReturnType>;
> ```

---

## Fragment Anatomy

A fragment file has two clearly-marked sections. The Marble compiler uses these section comments to know where to put each construct:

```plvc
fragment AddIndirectClockingDialog;   -- name matches filename
component SHPORD;
layer Core;
description "Use this dialog box to manually add a new clocking record for indirect labor time.";

----------------------------- CLIENT FRAGMENTS ------------------------------

-- Everything here is available to the client that includes this fragment
dialog AddIndirectClockingDialog for AddIndirectClockingStructure { ... }
command Ok for AddIndirectClockingStructure { ... }
command InitCommand for AddIndirectClockingStructure { ... }
group AddIndirectClockingGroup for AddIndirectClockingStructure { ... }

--------------------------- PROJECTION FRAGMENTS ----------------------------

-- Everything here is available to the projection that pairs with the including client
structure AddIndirectClockingStructure { ... }
function FrameStartupUserIndirect Text;
function CalcMinutesIndirect Number { ... }
function ContractDataItemValidate Text { ... }
action AddIndirectClocking { ... }
```

---

## Example — Complete Fragment for a Dialog

> [!example] Source: `ifs-example/shpord/model/shpord/AddIndirectClockingDialog.fragment`

```plvc
fragment AddIndirectClockingDialog;
component SHPORD;
layer Core;
description "Use this dialog box to manually add a new clocking record for indirect labor time.";

----------------------------- CLIENT FRAGMENTS ------------------------------

-- The dialog UI definition (consumed by any client that includes this fragment)
dialog AddIndirectClockingDialog for AddIndirectClockingStructure {
   label = "New Indirect Labor Clocking";
   input(Company, EmployeeIdIn, ContractIn, StartTimeIn, CalledFromOtherComponent, CurrentEmployeeId, CurrentTeamId) {
      command InitCommand;
   }
   group AddIndirectClockingGroup;
   commandgroup ButtonCmdGroup {
      command Ok;
      command Cancel;
   }
}

command Ok for AddIndirectClockingStructure {
   label = "OK";
   enabled = [not(Contract = null or IndirectJobId = null or StartTime = null)];
   execute {
      call AddIndirectClocking(Company, EmployeeId, Contract, IndirectJobId,
         StartTime, FinishTime, WorkCenterNo, TeamId, CurrentEmployeeId,
         CurrentTeamId, ClockingNoteText);
      exit OK;
   }
}

command InitCommand for AddIndirectClockingStructure {
   execute {
      if [ContractIn = null] {
         call FrameStartupUserIndirect() into Contract;
      }
      else {
         set Contract = ContractIn;
      }
      -- ... more init logic
   }
}

group AddIndirectClockingGroup for AddIndirectClockingStructure {
   label = "";
   lov ContractRef with ReferenceUserAllowedSiteLovSelector { ... }
   lov IndirectJobIdRef with ReferenceActiveIndirectJobSelector { ... }
   field StartTime {
      validate command { ... }
   }
   field ClockingNoteText {
      size = FullWidth;
      multiline = true;
   }
}

--------------------------- PROJECTION FRAGMENTS ----------------------------

-- The data container for the dialog (consumed by the projection)
structure AddIndirectClockingStructure {
   attribute Contract Text {
      maxlength = 5;
      required = [true];
      format = uppercase;
   }
   attribute Company Text {
      maxlength = 20;
   }
   attribute IndirectJobId Text {
      maxlength = 10;
      required = [true];
   }
   attribute EmployeeId Text {
      editable = [false];
      insertable = [true];
   }
   attribute StartTime Timestamp {
      required = [true];
   }
   attribute CalledFromOtherComponent Boolean;
   -- ... more attributes
   reference ContractRef(Contract) to UserAllowedSiteLov(Contract) {
      label = "Site";
   }
}

-- Functions called by the dialog's validate commands and init command
function FrameStartupUserIndirect Text;
function CalcMinutesIndirect Number {
   parameter Company Text;
   parameter EmployeeId Text;
   parameter StartTime Timestamp;
   parameter FinishTime Timestamp;
}

-- Action called by the OK command
action AddIndirectClocking {
   initialcheck UserAllowedSite(Contract);
   ludependencies = ShopOperClockingUtil, IndirectClocking;
   parameter Company Text;
   parameter EmployeeId Text;
   -- ... more parameters
}
```

---

## LOV Selector Fragments

A common fragment pattern is a "Selector" — a fragment that just contains a projection entity (or query) acting as a LOV data source. It's included in any projection that needs to look up values from that entity:

```plvc
-- Convention: the fragment is named <Entity>Selector
-- It provides the entity definition for use as a LOV target
fragment UserAllowedSiteLovSelector;
component FNDBAS;
layer Core;

--------------------------- PROJECTION FRAGMENTS ----------------------------

-- Just the entity declaration — no client constructs needed
-- Other projections include this to reference UserAllowedSiteLov in their references
query UserAllowedSiteLov {
   from = "user_allowed_site_pub";
   keys = Contract;
   attribute Contract Text {
      fetch = "contract";
   }
   attribute ContractDesc Text {
      fetch = "contract_desc";
   }
}
```

---

## How `include fragment` Wires Everything Together

```marble
MyDialog.client:
  include fragment AddIndirectClockingDialog;    → CLIENT FRAGMENTS section
  include fragment UserAllowedSiteLovSelector;   → PROJECTION FRAGMENTS section

MyDialogHandling.projection:
  (No separate include needed — client's include handles both)
  (But if projection is standalone, include fragment there too)
```

> [!warning] Include in Client = Both Sides Imported
> When you write `include fragment X;` in a `.client` file, the CLIENT FRAGMENTS section goes to the client **and** the PROJECTION FRAGMENTS section goes to the paired projection automatically. You only need to add `include fragment X;` directly in a `.projection` file if the projection is used independently of any client.

---

## Patterns & Tips

> [!tip] One Dialog = One Fragment
> The standard convention is one `.fragment` file per dialog. Name the fragment after the dialog: `AddIndirectClockingDialog.fragment`. This co-locates the dialog UI, the data structure, and the server actions/functions in one file.

> [!tip] LOV Selectors Are Shared Library Fragments
> IFS ships hundreds of `*Selector.fragment` files (e.g., `UserAllowedSiteLovSelector.fragment`). These are the LOV libraries — include them by name to get access to common lookup entities like sites, employees, parts, etc.

> [!tip] Customer Fragments Follow the Same Naming as Client/Projection
> Customer fragments: `Ti<Feature>-Cust.fragment` with `layer Cust;`. The `-Cust` suffix is important — it distinguishes them from base code and prevents naming collisions.

---

## See Also

- [[Client File Structure]] — `include fragment` in client headers
- [[Projection File Structure]] — `include fragment` in projection headers
- [[Dialog]] — the most common CLIENT FRAGMENTS construct
- [[Structure]] — the most common PROJECTION FRAGMENTS construct
- [[Action]] — actions in PROJECTION FRAGMENTS back dialog OK buttons
- [[Function]] — functions in PROJECTION FRAGMENTS power validate commands
