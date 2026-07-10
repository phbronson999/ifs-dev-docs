---
title: References and Arrays
tags:
  - ifs-marble/projection
  - ifs-marble/construct
aliases:
  - reference declaration
  - array declaration
  - LOV reference
  - child array
  - FK reference
related:
  - "[[Entity]]"
  - "[[Query]]"
  - "[[Virtual]]"
  - "[[Fields and LOV]]"
  - "[[List]]"
---

# References and Arrays

Two constructs link projection entities together:

- A ==reference== declares a foreign-key relationship to another entity. In the UI, references power LOV (List of Values) lookups — the dropdown selectors that let users pick a valid value with a description.
- An ==array== declares a one-to-many child relationship. In the UI, arrays power nested lists and detail panels that expand under a parent row.

Both are declared inside entity, query, virtual, or structure blocks.

---

## Reference

> [!abstract] Syntax
> ```marble
> reference <RefName>(<LocalKey1>, <LocalKey2>) to <TargetEntity>(<TargetKey1>, <TargetKey2>) {
>    label = "<LOV label>";
>    where = "<SQL filter on the target>";
> }
> ```

The `RefName` becomes the logical name used in the client to bind a `lov` field. The client `lov` syntax then uses `Reference<RefName>Selector` as the selector fragment name.

### Reference Keywords

| Keyword | Required | Description |
|---------|----------|-------------|
| `reference` | Yes | Declares the FK relationship. |
| `<RefName>` | Yes | Logical name. By convention: `<AttrName>Ref`. E.g., `ContractRef`, `InventoryPartRef`. |
| `(<LocalKey...>)` | Yes | The attribute(s) in the **current** entity that form the FK. |
| `to <Entity>(<TargetKey...>)` | Yes | The target entity and its key attributes. |
| `label` | No | Label override for the LOV column header. |
| `where` | No | Additional SQL filter restricting which target rows appear in the LOV. Uses column names (snake_case). |

---

### Example — References in a Query

> [!example] Source: `ifs-example/shpord/model/shpord/ActualCostDetailsHandling.projection`

```plvc
query ShopOrderCostUtil {
   ...
   -- Single-key reference: enables LOV on PartNo
   -- Local key: (Contract, PartNo) → Target: InventoryPartLov2(Contract, PartNo)
   reference InventoryPartRef(Contract, PartNo) to InventoryPartLov2(Contract, PartNo);

   -- Reference with a label override:
   reference SequenceNoRef(OrderNo, ReleaseNo, SequenceNo) to ShopOrd(OrderNo, ReleaseNo, SequenceNo) {
      label = "Sequence No";
   }

   -- Multi-key reference with label:
   reference ConfigurationIdRef(Contract, PartNo, ConfigurationId) to InventoryPartConfig(Contract, PartNo, ConfigurationId) {
      label = "Configuration ID";
   }
}
```

In the client, this reference is used as:
```plvc
lov InventoryPartRef with ReferenceInventoryPartLov2Selector {
   label = "Part";
   size = Large;
   description = InventoryPartRef.Description;   -- pulls description from the target entity
}
```

---

### Example — Reference with `where` Filter

> [!example] Source: `config/model/config/TiTracebackConnections-Cust.fragment` (workspace)

```plvc
@Override
entity TiInspectionBridgeConn using TiInspectionBridge {
   -- Reference filtered to only certain action types
   @DynamicComponentDependency MFGSTD
   reference MaterialHistRef(MaterialHistoryId) to MaterialHistory(MaterialHistoryId) {
      where = "material_history_action IN ('SCRAPPRODWIP','RECMFGPROD')";
   }
}
```

---

### Example — Reference in a Structure (Dialog LOV)

> [!example] Source: `ifs-example/shpord/model/shpord/AddIndirectClockingDialog.fragment`

```plvc
structure AddIndirectClockingStructure {
   attribute Contract Text {
      maxlength = 5;
   }
   attribute IndirectJobId Text {
      maxlength = 10;
   }
   attribute EmployeeId Text {
      maxlength = 11;
   }

   -- References in a structure enable LOV fields in the dialog group
   reference ContractRef(Contract) to UserAllowedSiteLov(Contract) {
      label = "Site";
   }
   -- Multi-key reference: IndirectJob is scoped to the selected Contract
   reference IndirectJobIdRef(Contract, IndirectJobId) to ActiveIndirectJob(Contract, IndirectJobId) {
      label = "Indirect Job";
   }
   -- Three-key reference:
   reference EmployeeIdRef(Contract, Company, EmployeeId) to ShopFloorEmployeeLov(Contract, Company, EmployeeId) {
      label = "Employee";
   }
}
```

---

## Array

> [!abstract] Syntax
> ```marble
> array <ArrayName>(<ParentKey>) to <ChildEntity>(<ChildFK>);
>
> -- With a scoping where clause (less common):
> array <ArrayName>(<ParentKey>) to <ChildEntity>(<ChildFK>) {
>    where = "<SQL filter>";
> }
> ```

Arrays declare a one-to-many relationship. The parent entity owns the array; each child record's FK maps back to the parent's key. In the client, arrays are consumed by a `list` inside a `page` or `dialog` with `bind` or by child lists referenced directly.

### Array Keywords

| Keyword | Required | Description |
|---------|----------|-------------|
| `array` | Yes | Declares the relationship. |
| `<ArrayName>` | Yes | Logical name. Used in the client as the second argument to a `list`: `list ChildList(ArrayName)`. |
| `(<ParentKey>)` | Yes | The parent attribute(s) that scope the child. |
| `to <ChildEntity>(<ChildFK>)` | Yes | The child entity and its FK attribute(s) pointing back to the parent. |

---

### Example — Arrays for a Complex Traceback Structure

> [!example] Source: `config/model/config/TiTracebackConnections-Cust.fragment` (workspace)

```plvc
@Override
entity TiInspectionBridgeConn using TiInspectionBridge {
   -- Array: for each inspection record, retrieve related finishing bridge records
   -- Parent key: SourceAframeHu → Child FK: AframeHu in TiStitchToFinBridge
   array StitchToFinBridgeArray(SourceAframeHu) to TiStitchToFinBridge(AframeHu);
   array ByprodToFinArray(SourceAframeHu) to TiByprodToFinBridge(AframeHu);
}

@Override
entity TiStitchToFinBridge {
   -- Nested arrays: stitchbond has its own children (card and warp feeds)
   reference StitchbondRef(GreigeHu) to TiStitchbondBridge(GreigeHu);
   array CardToStitchArray(GreigeHu) to TiCardToStitchBridge(GreigeHu);
   array WarpToStitchArray(GreigeHu) to TiWarpToStitchBridge(GreigeHu);
}
```

In the client, these arrays render as nested lists:
```plvc
page TiTracebackOverviewPage using TiInspBridgeConnSet {
   list TiInspectionBridgeListExt;
   -- Nested list bound to the StitchToFinBridgeArray of the parent list's selected row:
   list TiStitchToFinList(StitchToFinBridgeArray) bind TiInspectionBridgeListExt {
      display = Nested;
   }
}
```

---

### Example — Array on a Virtual (Child Rows in a Dialog)

> [!example] Source: `ifs-example/shpord/model/shpord/AdjustSoOperationSplitDialogHandling.projection`

```plvc
virtual AdjustOperationSplitVirtual {
   ...
   -- Parent virtual has an array of child virtual rows
   -- Empty parentheses () means "all children for this parent instance"
   array AdjustSplitOpArray() to AdjustOpInSplitVirtual();
}
```

In the client, the assistant renders the child array as an editable list:
```plvc
singlestep {
   group ParentHeaderGroup;
   list SplitLinesList(AdjustSplitOpArray);  -- renders the child virtual rows
}
```

---

## Accessing Reference Fields in the Client

Once a reference is declared in the projection, the client can access the target entity's attributes using dot notation:

```plvc
-- Dot notation: AttributeName from the referenced entity
field InventoryPartRef.UnitMeas {
   size = Small;
   label = "Unit of Measure";
}

-- Description pulled from a reference target:
lov CostBucketRef with ReferenceCostBucketSelector {
   label = "Cost Bucket";
   description = CostBucketRef.Description;  -- Description attribute from CostBucket entity
}

field CostBucketRef.CostBucketType {
   label = "Bucket Type";
}
```

---

## Patterns & Tips

> [!tip] Convention: Reference Name = Attribute Name + "Ref"
> `ContractRef`, `InventoryPartRef`, `WorkCenterNoRef`. This makes it immediately clear which attribute the reference backs and matches the generated selector fragment name pattern `Reference<RefName>Selector`.

> [!tip] Multi-Key References Are Common in IFS
> IFS entities almost always use compound keys (e.g., Contract + PartNo). Your references must include **all** FK components in the same order as the target entity's key declaration. Missing a key causes LOV filtering to fail silently.

> [!warning] The Selector Fragment Must Be Included
> A `reference` declaration alone doesn't give you a working LOV. You also need:
> 1. `include fragment <TargetEntity>Selector;` in the projection header
> 2. A `lov <RefName> with Reference<TargetEntity>Selector { ... }` in the client group or list
> All three pieces must be present for the LOV to work.

> [!warning] Array Key Parameters Must Match
> The parent key in `array ArrayName(<ParentKey>)` must match an attribute declared in the parent entity, and the child FK `to <Child>(<ChildFK>)` must match an attribute in the child entity. Typos here cause runtime errors that can be hard to trace.

---

## See Also

- [[Fields and LOV]] — client-side `lov` and `field` using references
- [[Entity]] — where references and arrays are most commonly declared
- [[Virtual]] — arrays for child rows in dialogs/assistants
- [[List]] — client lists that render array children with `bind`
- [[Projection File Structure]] — `include fragment` for selector fragments
