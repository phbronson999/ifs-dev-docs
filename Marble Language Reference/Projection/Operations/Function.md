---
title: Function
tags:
  - ifs-marble/projection
  - ifs-marble/construct
aliases:
  - function definition
  - server function
  - List<Entity> return
  - alterattribute
related:
  - "[[Action]]"
  - "[[Structure]]"
  - "[[Commands and Expressions]]"
  - "[[Entity]]"
---

# Function

A ==function== is a projection construct that maps to a server-side read operation — it returns data without modifying anything. Functions are the read complement to [[Action|actions]]. They're used for:

- Fetching a default value to pre-populate a field
- Computing a result from user input (e.g., time calculation)
- Returning a complex object or list of entity records based on parameters

The Marble framework generates an OData function import (`GET`) for each function. In the `.plsvc` file, each function becomes an Oracle `FUNCTION <Name>___` (triple underscore).

> [!abstract] Syntax
> ```marble
> -- Simple function returning a scalar:
> function <Name> <ReturnType>;
>
> -- Function with parameters:
> function <Name> <ReturnType> {
>    parameter <ParamName> <Type>;
>    parameter <ParamName> <Type>;
> }
>
> -- Function returning a structure:
> function <Name> Structure(<StructureName>) {
>    parameter <ParamName> <Type>;
> }
>
> -- Function returning a filtered list of entity records:
> function <Name> List<Entity(<EntityName>)> {
>    parameter <ParamName> <Type>;
>    alterattribute <AttrName> {
>       fetch = "<override expression>";
>    }
>    where = "<SQL WHERE clause using :ParamName>";
> }
> ```

---

## Return Types

| Return type syntax | What it returns |
|---|---|
| `Text` | Single `VARCHAR2` value |
| `Number` | Single numeric value |
| `Boolean` | `TRUE` / `FALSE` |
| `Date` | Single date |
| `Timestamp` | Single date+time |
| `Structure(<Name>)` | A [[Structure]] instance (multiple named fields) |
| `List<Entity(<Name>)>` | A filtered list of records from an existing entity |

---

## Keywords (inside function body)

| Keyword | Required | Description |
|---------|----------|-------------|
| `parameter` | No | Input parameter. Same types as [[Action]] parameters. |
| `alterattribute` | No | Overrides the `fetch` expression for a specific attribute in the returned entity list. Used to inject computed columns into a `List<Entity()>` result. |
| `where` | No | SQL WHERE clause scoping which rows the `List<Entity()>` function returns. Reference parameters as `:ParamName`. |

---

## Example — Simple No-Parameter Function

> [!example] Source: `ifs-example/shpord/model/shpord/AddIndirectClockingDialog.fragment`

```plvc
-- Semicolon-terminated: no body needed when there are no parameters
-- Returns the user's default site from an IFS utility
function FrameStartupUserIndirect Text;

-- In the .plsvc implementation:
-- FUNCTION Frame_Startup_User_Indirect___ RETURN VARCHAR2 IS
-- BEGIN
--    RETURN User_Default_API.Get_Contract;
-- END Frame_Startup_User_Indirect___;
```

In the client init command:
```plvc
init command {
   execute {
      if [ContractIn = null] {
         call FrameStartupUserIndirect() into Contract;  -- stores result in Contract field
      }
   }
}
```

---

## Example — Function with Parameters Returning a Number

> [!example] Source: `ifs-example/shpord/model/shpord/AddIndirectClockingDialog.fragment`

```plvc
-- Computes minutes between start and finish, accounting for employee schedule
function CalcMinutesIndirect Number {
   parameter Company Text;
   parameter EmployeeId Text;
   parameter StartTime Timestamp;
   parameter FinishTime Timestamp;
}
```

Called from a validate command on the StartTime field:
```plvc
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
```

The `.plsvc` implementation:
```plsql
FUNCTION Calc_Minutes_Indirect___(
   company_     IN VARCHAR2,
   employee_id_ IN VARCHAR2,
   start_time_  IN DATE,
   finish_time_ IN DATE ) RETURN NUMBER
IS
BEGIN
   RETURN Shop_Oper_Clocking_Util_API.Get_Indirect_Minutes_To_Report(
      company_, employee_id_, start_time_, finish_time_);
END Calc_Minutes_Indirect___;
```

---

## Example — Function Returning a Filtered Entity List

> [!example] Source: `ifs-example/shpord/model/shpord/BatchBalanceHandling.projection`

```plvc
-- Returns a filtered list of OrderSupplyDemandExtUiv records
-- with a computed running-total column injected via alterattribute
function GetSupplyDemandDetail List<Entity(OrderSupplyDemandExtUiv)> {
   parameter SelectionCount Number;
   parameter ParentKeysList Text;

   -- alterattribute overrides the fetch for ProjectedOnHand in the returned rows
   -- This injects a complex running-total SQL expression into the result
   alterattribute ProjectedOnHand {
      fetch = "NVL(Inventory_Part_In_Stock_Api.Get_Inventory_Quantity(...),0) + SUM(QTY_SUPPLY - QTY_DEMAND) OVER(PARTITION BY CONTRACT, PART_NO ORDER BY TRUNC(DATE_REQUIRED), ...)";
   }
   -- where uses :ParamName syntax to reference function parameters
   where = ":SelectionCount = 1
   AND Contract = Client_SYS.Get_Key_Reference_Value(:ParentKeysList, 'CONTRACT')";
}
```

---

## Example — Function Returning a Structure

```plvc
-- Returns scheduling parameters as a named structure
function GetParameters Structure(ScheduleTaskParameters);

-- Called in assistant init:
init command {
   execute {
      call GetParameters() into Params;       -- Params is typed Structure(ScheduleTaskParameters)
      set ScheduleMethodId = Params.ScheduleMethodId;
      set ScheduleName = Params.Description;
      set Site = Params.Site;
   }
}
```

---

## Patterns & Tips

> [!tip] Use `function` for Validate Logic, `action` for Saves
> The most common use of multi-parameter functions is powering validate commands — a field changes, the client calls a function to compute a derived value (like time minutes), and the result is stored into another field with `set`. Keep functions truly read-only; if you need to write, use an [[Action]].

> [!tip] `List<Entity()>` Functions Are Powerful for LOV and Detail Panels
> A function returning `List<Entity(SomeLu)>` with a `where` clause is the standard way to filter an entity list inside a dialog or assistant. It's used for custom LOV selectors and for loading child detail records scoped to a parent selection.

> [!tip] `alterattribute` Lets You Inject SQL Without Changing the Entity
> Use `alterattribute` inside a `List<Entity()>` function when you need a computed column that only makes sense in the context of this function call (e.g., a running total that requires the function's parameters). This avoids adding a permanent computed attribute to the entity.

> [!warning] Functions Cannot Have Side Effects
> The OData function import pattern is a `GET` request. The framework does not wrap functions in a transaction the way it does for actions. Don't call `INSERT`, `UPDATE`, or `DELETE` from a PL/SQL function backing a Marble function — use an [[Action]] instead.

---

## See Also

- [[Action]] — for write operations; the procedural counterpart
- [[Structure]] — return type for functions that return multiple values
- [[Commands and Expressions]] — `call Function() into Variable` syntax
- [[Fields and LOV]] — validate commands that call functions
