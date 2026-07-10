---
title: Query
tags:
  - ifs-marble/projection
  - ifs-marble/construct
aliases:
  - query definition
  - read-only entity
  - view-based query
related:
  - "[[Entity]]"
  - "[[Entityset]]"
  - "[[Attribute Modifiers]]"
  - "[[References and Arrays]]"
---

# Query

A ==query== is a read-only projection construct that maps to a database view. Unlike an [[Entity]], a query does not generate Create, Update, or Delete endpoints — it is strictly for displaying data. Use a query when you're surfacing an aggregated view, an audit log, a report dataset, or any other data that users should never edit through the UI.

Internally, a query generates an OData `GET` endpoint backed by the specified database view.

> [!abstract] Syntax
> ```marble
> query <QueryName> {
>    from = "<db_view_name>";
>    keys = Attr1, Attr2;
>
>    attribute <AttrName> <Type> {
>       fetch = "<column_or_expression>";
>       label = "<UI label>";
>       ...
>    }
>    reference <RefName>(<keys>) to <Entity>(<keys>);
> }
> ```

---

## Keywords

| Keyword | Required | Description |
|---------|----------|-------------|
| `query` | Yes | Declares the query. Name is arbitrary but typically mirrors the view name in PascalCase. |
| `from` | Yes | The database view name (snake_case). The framework generates SQL `SELECT ... FROM <from>`. |
| `keys` | Yes | Comma-separated attribute names that uniquely identify a row. Needed for OData `$filter` and for client navigation. |
| `attribute` | No | Each column or computed expression exposed by the query. See [[Attribute Modifiers]]. |
| `reference` | No | FK lookup for LOV or description display. See [[References and Arrays]]. |

> [!note] No `crud`, No `entity`
> A query does not support `crud`, `action`, or `array`. If you need those, use [[Entity]] instead.

---

## Example — Full Query with Computed and API-Fetched Attributes

> [!example] Source: `ifs-example/shpord/model/shpord/ActualCostDetailsHandling.projection`

```plvc
query ShopOrderCostUtil {
   from = "so_actual_cost_details_uiv2";   -- database view name (snake_case)

   -- keys uniquely identify each row; used by OData filtering and client navigation
   keys = OrderNo, ReleaseNo, SequenceNo, GuId;

   attribute OrderNo Text {
      fetch = "order_no";                  -- maps directly to a view column
      label = "Order No";
      maxlength = 12;
      required = [true];
      editable = [ETag = null];            -- editable only when row is new (no ETag yet)
      format = uppercase;
   }
   -- GuId is a synthetic key generated server-side, never user-entered
   attribute GuId Text {
      fetch = "sys_guid()";               -- Oracle function call as the fetch expression
      editable = [false];
   }
   attribute ReleaseNo Text {
      fetch = "release_no";
      label = "Release No";
      maxlength = 4;
      required = [true];
      editable = [ETag = null];
      format = uppercase;
   }
   attribute DateCreated Timestamp {
      fetch = "date_created";
      label = "Date Created";
      required = [true];
      editable = [false];
   }
   -- TransactionDesc: fetch calls a PL/SQL API function rather than reading a column
   attribute TransactionDesc Text {
      fetch = "Mpccom_Transaction_Code_API.Get_Transaction(transaction_code)";
      label = "Transaction Desc";
      maxlength = 2000;
      required = [true];
   }
   attribute LineItemNo Number {
      fetch = "line_item_no";
      label = "Structure Line No";
   }
   attribute PartNo Text {
      fetch = "part_no";
      label = "Part No";
      maxlength = 100;
   }
   -- Another API-fetched computed attribute
   attribute PartDescription Text {
      fetch = "Inventory_Part_API.Get_Description(contract,part_no)";
      label = "Part Description";
      maxlength = 2000;
      editable = [false];
   }
   attribute LevelCost Number {
      fetch = "level_cost";
      label = "Total Level Cost";
      format = ifscurrency;               -- renders with IFS currency formatting
   }
   attribute Contract Text {
      fetch = "contract";
      label = "Site";
      maxlength = 20;
   }

   -- References add LOV lookup capability to query attributes
   reference InventoryPartRef(Contract, PartNo) to InventoryPartLov2(Contract, PartNo);
   reference CostBucketRef(Contract, CostBucketId) to CostBucket(Contract, CostBucketId);
   -- Reference with custom label override
   reference SequenceNoRef(OrderNo, ReleaseNo, SequenceNo) to ShopOrd(OrderNo, ReleaseNo, SequenceNo) {
      label = "Sequence No";
   }
}
```

---

## Patterns & Tips

> [!tip] Use Query When the Data Source Is a `_UIV` or `_EXT` View
> IFS naming convention for views used by the UI layer is `<lu_name>_UIV` or `<lu_name>_UIV2`. When your `from` points to such a view, `query` is almost always the right construct. These views are designed for reading and typically join multiple tables.

> [!tip] API Calls in `fetch` Are Powerful but Have a Cost
> Using `Pkg_API.Get_Something(col1, col2)` in a `fetch` expression calls a PL/SQL function for every row returned. For small result sets this is fine. For large sets (thousands of rows), prefer adding the computed value to the database view itself.

> [!warning] Keys in a Query Must Be Truly Unique
> The `keys` declaration tells the framework how to uniquely address a row for OData operations. If your key combination can produce duplicates in the view, filtering and navigation will behave unpredictably. Adding `GuId Text { fetch = "sys_guid()"; }` as a supplemental key is a common workaround for views without a natural unique key.

> [!warning] References Without a Matching LOV Fragment Are Inert
> A `reference` in a query enables the client to render a LOV (dropdown lookup) for that attribute. But the LOV only appears if the matching `include fragment <Name>Selector;` is present in the projection header — and the client's list/group includes a `lov` field pointing to that reference. Without both pieces the reference does nothing visible.

---

## Query vs. Entity Decision Guide

| Need | Use |
|------|-----|
| Read-only display of view data | `query` |
| Create / Update / Delete | `entity` |
| Screen backed by a real LU table | `entity` |
| Report or audit log | `query` |
| Dialog or assistant data (transient) | [[Virtual]] |
| Override an existing Core entity | `@Override entity` |

---

## See Also

- [[Entity]] — full CRUD entity for editable data
- [[Entityset]] — wraps a query to expose it to client pages
- [[Attribute Modifiers]] — `fetch`, `format`, `editable`, `required`, `label`, `maxlength`
- [[References and Arrays]] — adding LOV lookups to query attributes
- [[Virtual]] — transient, non-table-backed alternative for dialogs
