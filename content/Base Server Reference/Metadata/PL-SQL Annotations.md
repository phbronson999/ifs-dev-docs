---
title: PL/SQL Annotations
publish: true
tags:
  - ifs-base-server
  - ifs-base-server/source
aliases:
  - plsql annotations
  - '@Override'
  - '@Final'
  - '@SecurityCheck'
  - '@DynamicComponentDependency'
  - annotations
related:
  - '[[Entity (Base Server)]]'
  - '[[Utility (Base Server)]]'
---

# PL/SQL Annotations

PL/SQL annotations are special comments placed immediately before a procedure or function declaration in `.plsql`, `.plsvc`, `.views`, or `.storage` files. They communicate **intent and constraints** to IFS Developer Studio's static analyser — they have no effect on the Oracle database but are enforced during build.

```sql
-- Annotation format: a comment with the @ prefix
@AnnotationName [arguments]
PROCEDURE ProcedureName__ ...
```

---

## Layer Control Annotations

These annotations control how code layers interact during upgrades and customization.

### `@Override`

Marks a procedure or function in an `Ext`/`Cust` layer file as an intentional override of a `Core` layer implementation.

```sql
@Override
PROCEDURE New__ (
   info_   OUT VARCHAR2,
   objid_  OUT VARCHAR2,
   objver_ OUT VARCHAR2,
   attr_   IN OUT VARCHAR2,
   action_ IN  VARCHAR2
)
IS
BEGIN
   -- Custom pre-processing
   Client_SYS.Add_To_Attr('CUSTOM_FIELD', 'value', attr_);
   super(info_, objid_, objver_, attr_, action_);  -- call Core implementation
END New__;
```

> [!note] `super()` in Overrides
> In IFS Cloud, overriding a procedure in a `Cust` layer file gives access to `super()` — a call to the `Core` implementation. This allows you to add pre/post logic without duplicating the entire Core procedure.

### `@Final`

Prevents lower layers (or other customization layers) from overriding this procedure.

```sql
@Final
PROCEDURE SensitiveOperation__ (
   contract_ IN VARCHAR2
)
IS
BEGIN
   ...
END SensitiveOperation__;
```

### `@Overtake`

Used in `Cust` layer to completely replace a `Core` procedure without calling `super()`. Unlike `@Override`, there is no call-through to Core.

```sql
@Overtake
PROCEDURE Calculate__ (
   result_ OUT NUMBER,
   input_  IN  NUMBER
)
IS
BEGIN
   -- Completely replaces Core implementation
   result_ := input_ * 2;
END Calculate__;
```

---

## Security Annotations

### `@SecurityCheck`

Marks a procedure that performs a security/privilege check. Developer Studio's static analyser verifies that certain calls are preceded by this check.

```sql
@SecurityCheck User_Allowed_Site_API.Exist(contract_)
PROCEDURE Process__ (
   contract_ IN VARCHAR2,
   order_no_ IN VARCHAR2
)
IS
BEGIN
   ...
END Process__;
```

### `@UncheckedAccess`

Explicitly marks a procedure or function as intentionally bypassing security checks. Required by the static analyser when a method is accessible without a full security check.

```sql
@UncheckedAccess
FUNCTION Get_State (
   order_no_ IN VARCHAR2
) RETURN VARCHAR2
IS
BEGIN
   RETURN 'Released';
END Get_State;
```

### `@ServerOnlyAccess`

Marks a procedure as callable only from server-side code — not directly from Aurena/projection layer actions.

### `@ReadOnlyAccess`

Marks a function as read-only — it performs no DML and can be called from read-only contexts.

---

## Usage Control Annotations

### `@DynamicComponentDependency`

Marks code that depends on an **optional** IFS component. Without this annotation, the build fails on installations that don't have the referenced component.

```sql
@DynamicComponentDependency PROJ
PROCEDURE Link_To_Project__ (
   objkey_     IN VARCHAR2,
   project_id_ IN VARCHAR2
)
IS
BEGIN
   Project_Connection_Util_API.Create_Connection('ShopOrder', objkey_, project_id_);
END Link_To_Project__;
```

> [!warning] Always Annotate Optional Component Dependencies
> If your PL/SQL code calls an API from a component that is not always installed (e.g., `PROJ`, `CBSINT`, `MFGSTD`), you **must** annotate with `@DynamicComponentDependency <COMPONENT>`. Missing this annotation causes a build error on any installation that doesn't have that component.

### `@Deprecated`

Marks a procedure or function as deprecated. Developer Studio's static analyser will warn when other code calls it.

```sql
@Deprecated
PROCEDURE OldCalculation__ (
   result_ OUT NUMBER
)
IS
BEGIN
   NULL;
END OldCalculation__;
```

### `@ApproveTransactionStatement`

Required when a procedure contains explicit `COMMIT` or `ROLLBACK` statements, which are normally forbidden in IFS PL/SQL outside of specific contexts.

```sql
@ApproveTransactionStatement
PROCEDURE Commit_And_Continue__ IS
BEGIN
   COMMIT;
END Commit_And_Continue__;
```

### `@ApproveDynamicStatement`

Required when a procedure uses `EXECUTE IMMEDIATE` or dynamic SQL. The static analyser flags dynamic SQL as a potential security risk and requires explicit approval.

```sql
@ApproveDynamicStatement
PROCEDURE Run_Dynamic__ (
   sql_ IN VARCHAR2
)
IS
BEGIN
   EXECUTE IMMEDIATE sql_;
END Run_Dynamic__;
```

### `@AllowTableOrViewAccess`

Permits direct `SELECT` from a database table (e.g., `SHOP_ORDER_TAB`) instead of going through the API view. IFS convention requires using the `_TAB` suffix table directly only in specific low-level procedures.

```sql
@AllowTableOrViewAccess ShopOrder_TAB
PROCEDURE Bulk_Process__ IS
BEGIN
   FOR rec_ IN (SELECT * FROM shop_order_tab WHERE state = 'Released') LOOP
      ...
   END LOOP;
END Bulk_Process__;
```

---

## Static Analysis (`$SEARCH`)

The `$SEARCH` annotation is a directive to the static analyser rather than a procedure-level annotation. It enables or disables specific analysis rules.

```sql
-- $SEARCH DISABLE SomeRuleName
PROCEDURE SomeException__ IS
BEGIN
   -- code that would otherwise trigger the rule
END SomeException__;
-- $SEARCH ENABLE SomeRuleName
```

---

## Quick Reference Table

| Annotation | Category | Purpose |
|-----------|----------|---------|
| `@Override` | Layer Control | Extend a Core procedure in Cust layer, with `super()` call-through |
| `@Final` | Layer Control | Prevent further overriding of this procedure |
| `@Overtake` | Layer Control | Fully replace a Core procedure without `super()` |
| `@SecurityCheck` | Security | Mark that a security check is performed |
| `@UncheckedAccess` | Security | Intentionally bypass security check |
| `@ServerOnlyAccess` | Security | Restrict to server-side calls only |
| `@ReadOnlyAccess` | Security | Declare function as read-only |
| `@DynamicComponentDependency` | Usage Control | Mark dependency on optional component |
| `@Deprecated` | Usage Control | Mark procedure as deprecated |
| `@ApproveTransactionStatement` | Usage Control | Allow explicit COMMIT/ROLLBACK |
| `@ApproveDynamicStatement` | Usage Control | Allow EXECUTE IMMEDIATE |
| `@AllowTableOrViewAccess` | Usage Control | Allow direct table access |
| `@ApproveGlobalVariable` | Usage Control | Allow package-level global variables |

---

## See Also

- [[Entity (Base Server)]] — entity model that generates the PL/SQL skeleton
- [[Utility (Base Server)]] — utility model for stateless packages
