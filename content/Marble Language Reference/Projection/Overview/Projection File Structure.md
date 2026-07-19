---
title: Projection File Structure
publish: true
tags:
  - ifs-marble/projection
  - ifs-marble/file-structure
aliases:
  - projection header
  - projection declaration
related:
  - '[[Entityset]]'
  - '[[Entity]]'
  - '[[Query]]'
  - '[[Action]]'
  - '[[Function]]'
  - '[[Client File Structure]]'
---

# Projection File Structure

A ==.projection== file is the API layer between the Aurena UI and the Oracle database. It declares what data sets are available, how entities are structured, and what server-side actions and functions can be called. One `.client` file consumes exactly one projection via its `projection <Name>;` declaration.

> [!abstract] Syntax Skeleton
> ```marble
> projection <ProjectionName>;
> component <COMPONENT>;
> layer <Core|Cust>;
> description "<Human readable description>";
> category <Users|Hidden|System>;
>
> include fragment <FragmentName>;
>
> ----------------------------- MAIN ENTRY POINTS -----------------------------
> entityset <SetName> for <EntityOrQuery>;
>
> ------------------------------ ENTITY DETAILS -------------------------------
> entity <EntityName> { ... }
> query <QueryName> { ... }
> virtual <VirtualName> { ... }
>
> ------------------------------- ENUMERATIONS --------------------------------
> enumeration <EnumName> { ... }
>
> ---------------------------------- ACTIONS ----------------------------------
> action <ActionName> { ... }
>
> --------------------------------- FUNCTIONS ---------------------------------
> function <FunctionName> <ReturnType> { ... }
>
> -------------------------------- STRUCTURES ---------------------------------
> structure <StructureName> { ... }
>
> --------------------------------- VIRTUALS ----------------------------------
> (virtual entities often placed here too)
>
> --------------------------------- SUMMARIES ---------------------------------
> -------------------------------- SINGLETONS ---------------------------------
> ```

---

## Header Keywords

| Keyword | Required | Description |
|---------|----------|-------------|
| `projection` | Yes | Names the projection. Must match the filename (without `.projection`). |
| `component` | Yes | The IFS component this belongs to (e.g., `SHPORD`, `CONFIG`, `MPCCOM`). Controls which module owns the code. |
| `layer` | Yes | `Core` for IFS base code, `Cust` for customer customizations. |
| `description` | No | Human-readable description shown in Developer Studio. |
| `category` | No | `Users` (visible in Aurena), `Hidden` (internal), `System` (system use). Defaults to `Users`. |
| `include fragment` | No | Imports a named fragment, making its entities, structures, actions, and functions available in this projection. Repeat for multiple fragments. |

---

## Standard Section Comments

IFS Developer Studio generates section divider comments. These are cosmetic but widely used as code organization markers:

```plvc
----------------------------- MAIN ENTRY POINTS -----------------------------
------------------------------ ENTITY DETAILS -------------------------------
------------------------------- ENUMERATIONS --------------------------------
---------------------------------- QUERIES ----------------------------------
---------------------------------- ACTIONS ----------------------------------
--------------------------------- FUNCTIONS ---------------------------------
-------------------------------- STRUCTURES ---------------------------------
--------------------------------- VIRTUALS ----------------------------------
--------------------------------- SUMMARIES ---------------------------------
-------------------------------- SINGLETONS ---------------------------------
```

> [!tip] Order Matters for Readability, Not Compilation
> The Marble compiler doesn't enforce section ordering, but Developer Studio and the team convention expect `entityset` declarations at the top and grouped constructs below. Keeping this order makes file comparisons and code reviews much easier.

---

## The `@DynamicComponentDependency` Annotation

When your projection uses constructs from an optional IFS component (one that may not be installed on every customer's system), wrap the `include fragment` with this annotation:

```plvc
@DynamicComponentDependency PROJ
include fragment ProjectLovSelector;

@DynamicComponentDependency CBSINT
include fragment ScheduleBatchBalanceDialog;
```

> [!warning] Missing Annotation = Compile Error on Minimal Installs
> If you reference an entity or fragment from an optional component without `@DynamicComponentDependency`, the build will fail on installations that don't have that component. Always check whether a component is optional before referencing its constructs.

---

## Example — Complete Projection Header

> [!example] Source: `ifs-example/shpord/model/shpord/BatchBalanceHandling.projection`

```plvc
----------------------------------------------------------------------------------------------------
-- Date        Sign    History
-- ----------  ------  -----------------------------------------------------------------------------
-- 200325      SUPMLK  Bug 153028, Added DefaultRevAltInfo structure and GetDefaultRevisions function.
----------------------------------------------------------------------------------------------------
projection BatchBalanceHandling;          -- File name without extension
component SHPORD;                         -- Shop Order component
layer Core;                               -- IFS base code (use Cust for customizations)
description "View BatchBalanceNode";      -- Shown in Developer Studio
category Users;                           -- Visible to end users in Aurena

include fragment ManufStructAltBuildLovSelector;      -- Required LOV fragments
include fragment PartRevisionDateLov3Selector;
include fragment InventoryPartLov20Selector;
include fragment BatchBalanceOrdersAvailableSelector;
include fragment UserAllowedSiteLovSelector;

include fragment PartRevisionDateLov2Selector;
include fragment ManufStructAltStateLovSelector;

-- Fragments for Supply/Demand Detail
include fragment ShopOrderRequisitionRelease;

@DynamicComponentDependency PROJ                      -- PROJ component may not be installed
include fragment ActivityTreeNavSelector;
@DynamicComponentDependency PROJ
include fragment ProjectQryFullAccessSelector;
@DynamicComponentDependency PROJ
include fragment ProjectLovSelector;

@DynamicComponentDependency CBSINT                    -- CBS Integration also optional
include fragment ScheduleBatchBalanceDialog;

include fragment BatchBalanceNodeInitialCheck;         -- Security check fragment

----------------------------- MAIN ENTRY POINTS -----------------------------

entityset BatchBalanceSet for BatchBalance;           -- Primary data set
entityset BatchBalanceNodeSet for BatchBalanceNode;
entityset BatchBalanceDemandAvailableSet for BatchBalanceDemandAvailable;
entityset ShopOrderPropVirtualSet for ShopOrderPropVirtual;
```

---

## Patterns & Tips

> [!tip] Naming Convention: Projection = Screen Name + "Handling"
> By convention, projection files are named `<ScreenName>Handling.projection`. The paired client file is named `<ScreenName>.client`. A dialog or assistant handler is named `<DialogName>Handling.projection`. This makes it easy to find the projection for any client file.

> [!tip] Customer Projections Use a `Ti` Prefix and `-Cust` Suffix
> Customer-layer files follow the pattern `Ti<Feature>-Cust.projection` with `layer Cust;` in the header. This distinguishes them from Core files and prevents naming collisions when IFS adds new base projections.

> [!note] Fragment vs. Projection Include
> `include fragment` in a projection pulls in only the PROJECTION FRAGMENTS section of the fragment file (the data constructs). The CLIENT FRAGMENTS section is pulled in by the `.client` file's own `include fragment` declaration.

---

## See Also

- [[Entityset]] — the main entry point declared right after the header
- [[Entity]] — most common construct inside a projection
- [[Query]] — read-only alternative to entity
- [[Fragment]] — how fragment files split between client and projection sections
- [[Client File Structure]] — the matching UI-layer file
