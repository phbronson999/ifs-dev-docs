---
title: Entity
publish: true
tags:
  - ifs-marble/projection
  - ifs-marble/construct
aliases:
  - entity definition
  - '@Override entity'
  - CRUD entity
related:
  - '[[Entityset]]'
  - '[[Attribute Modifiers]]'
  - '[[References and Arrays]]'
  - '[[Action]]'
  - '[[Query]]'
  - '[[Virtual]]'
---

# Entity

An ==entity== in a projection maps directly to an IFS Logical Unit (LU) — a named business object backed by a database table and a PL/SQL API package. The projection entity declares which attributes are exposed, how they're labeled, what business rules apply, and what references and actions are attached.

In `Cust` layer files you almost always use `@Override entity` to extend an existing Core entity rather than define one from scratch. This lets you add attributes, change labels, attach references, or add actions without touching the Core code.

> [!abstract] Syntax
> ```marble
> -- New entity (rare in Cust layer):
> entity <EntityName> {
>    crud = Create, Read, Update, Delete;
>    from = "<db_view_or_table>";
>    keys = Attr1, Attr2;
>    ludependencies = OtherLu1, OtherLu2;
>
>    attribute <AttrName> <Type> { ... }
>    reference <RefName>(<keys>) to <Entity>(<keys>) { ... }
>    array <ArrayName>(<key>) to <Entity>(<key>);
>    action <ActionName> { ... }
> }
>
> -- Override existing Core entity (common in Cust layer):
> @Override
> entity <EntityName> {
>    attribute <AttrName> <Type> { ... }   -- add or modify attributes
>    reference <RefName>(...) to ...;      -- add references
>    array <ArrayName>(...) to ...;        -- add child arrays
>    action <ActionName> { ... }           -- add inline actions
> }
> ```

---

## Keywords

| Keyword | Required | Description |
|---------|----------|-------------|
| `entity` | Yes | Declares the entity. Name must match the LU name. |
| `@Override` | Cust | Prefix that extends an existing Core entity without replacing it. |
| `crud` | No | Comma-separated list of allowed operations: `Create`, `Read`, `Update`, `Delete`. Omit to inherit defaults. |
| `from` | No | Database view or table name. Defaults to the LU's standard view. Override when you need a custom view. |
| `keys` | No | Comma-separated list of key attributes. Typically inherited from the LU — only specify to override. |
| `ludependencies` | No | Other LUs whose cache must be refreshed after changes to this entity. Used by the framework to invalidate related client data. |
| `attribute` | No | Adds or overrides an attribute. See [[Attribute Modifiers]] for all sub-keywords. |
| `reference` | No | Declares a FK lookup. See [[References and Arrays]]. |
| `array` | No | Declares a one-to-many child relationship. See [[References and Arrays]]. |
| `action` | No | Inline action scoped to this entity. See [[Action]]. |

---

## Data Types for Attributes

| Marble Type | Oracle equivalent | Notes |
|-------------|------------------|-------|
| `Text` | `VARCHAR2` | Most common. Set `maxlength`. |
| `Number` | `NUMBER` | Integer or decimal. |
| `Boolean` | `VARCHAR2('TRUE'/'FALSE')` | IFS convention — stored as string. |
| `Date` | `DATE` (date only) | No time component. |
| `Timestamp` | `DATE` (with time) | IFS stores timestamps in Oracle DATE columns. |
| `Enumeration(<Name>)` | `VARCHAR2` | Maps to an [[Enumeration]] definition. |
| `LargeText` | `CLOB` | For long text fields. |
| `Binary` | `BLOB` | Binary data. |

---

## Example — `@Override` Entity Adding Computed Attributes and Actions

> [!example] Source: `ifs-example/shpord/model/shpord/BatchBalanceHandling.projection`

```plvc
@Override                                    -- Extend the Core BatchBalance entity
entity BatchBalance {
   attribute OrderRef1 Text {
      label = "Order Ref 1";
      editable = [true];                     -- Override editable rule from Core
   }
   attribute OrderRef2 Text {
      label = "Order Ref 2";
      editable = [false];
   }
   attribute OrderType Enumeration(BatchBalanceOrderType) {
      label = "Supply Type";                 -- Maps to enumeration defined elsewhere
      editable = [false];
   }
   -- Computed attribute: fetch calls a PL/SQL API function
   attribute StartDate Date {
      fetch = "Batch_Balance_Util_API.Get_Order_Start_Date(balance_id, 1)";
      label = "Start Date";
      editable = [false];
   }
   -- Another computed attribute using Oracle DECODE for conditional concatenation
   attribute Label Text {
      fetch = "DECODE(ORDER_REF1, NULL, ' ', '' || ORDER_REF1) || DECODE(ORDER_REF2, NULL, ' ', ' - ' || ORDER_REF2)";
   }
   -- Attribute pulling a default value from an API
   attribute DefaultContract Text {
      fetch = "User_Allowed_Site_API.Get_Default_Site";
   }

   -- References add LOV lookup capability for these attributes
   reference InventoryPartRef(Contract, PartNo) to InventoryPart(Contract, PartNo);
   reference PartNoRef(Contract, PartNo) to InventoryPartLov20(Contract, PartNo) {
      label = "Part";                        -- LOV label override
   }
   reference ContractRef(Contract) to UserAllowedSiteLov(Contract) {
      label = "Site";
   }

   -- Inline action scoped to this entity
   action ReleaseBalance {
      ludependencies = BatchBalanceNode;     -- Refresh BatchBalanceNode after this action
   }
}
```

---

## Example — Cust-Layer Override Adding an Array Child

> [!example] Source: `config/model/config/TiTracebackConnections-Cust.fragment` (workspace)

```plvc
@Override
entity TiInspectionBridgeConn using TiInspectionBridge {
   -- ludependencies: tell the framework which LUs to invalidate after save
   ludependencies = TiFinishingBridge, TiFinToInspBridge, TiStitchToFinBridge, TiCardToStitchBridge, TiWarpToStitchBridge;

   -- Reference to a MaterialHistory entity with a custom where clause
   @DynamicComponentDependency MFGSTD
   reference MaterialHistRef(MaterialHistoryId) to MaterialHistory(MaterialHistoryId) {
      where = "material_history_action IN ('SCRAPPRODWIP','RECMFGPROD')";
   }
   -- Standard references
   reference FinToInspBridgeRef(AframeIssueTrans) to TiFinToInspBridge(AframeIssueTrans);
   reference FinishingRef(SourceAframeHu) to TiFinishingBridge(AframeHu);

   -- Arrays define one-to-many child collections navigable in the UI
   array StitchToFinBridgeArray(SourceAframeHu) to TiStitchToFinBridge(AframeHu);
   array ByprodToFinArray(SourceAframeHu) to TiByprodToFinBridge(AframeHu);
}
```

---

## Patterns & Tips

> [!tip] Use `@Override` — Almost Never Define a New Entity
> In customer-layer development, you almost always extend Core entities with `@Override`. Defining a completely new entity is only needed when you're adding a wholly new business concept with its own LU, database table, and API package.

> [!tip] Computed `fetch` Attributes Are Read-Only by Default
> Any attribute whose `fetch` calls a PL/SQL function rather than mapping a column is implicitly read-only. You don't need `editable = [false]` — but adding it makes intent explicit for the next developer.

> [!warning] `ludependencies` Affects Client Performance
> Every LU listed in `ludependencies` triggers a client-side cache refresh after any save. Keep the list minimal — only include LUs whose data is actually displayed on the same screen. Over-listing causes unnecessary round trips.

> [!note] Entity vs. Query
> Use `entity` when you need Create, Update, or Delete operations. Use [[Query]] when the data is read-only (reports, audit trails, aggregated views). The framework generates different OData endpoints for each.

---

## See Also

- [[Entityset]] — wraps an entity and exposes it to client pages
- [[Attribute Modifiers]] — all keywords inside an attribute block
- [[References and Arrays]] — reference and array declarations in detail
- [[Query]] — read-only alternative to entity
- [[Virtual]] — entity-like construct not backed by a real LU
- [[Action]] — actions scoped to an entity
