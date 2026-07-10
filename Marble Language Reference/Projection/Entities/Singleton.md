---
title: Singleton
tags:
  - ifs-marble/projection
  - ifs-marble/construct
aliases:
  - singleton definition
  - SingletonSetDefinition
  - single-record datasource
related:
  - "[[Query]]"
  - "[[Entity]]"
  - "[[Entityset]]"
  - "[[../../Client/Layout/Singleton|Singleton (Client)]]"
---

# Singleton

A *singleton* is "a datasource that returns a single record, typically corresponding to the current user." 
It's the projection-side counterpart to a [[../../Client/Layout/Singleton|Singleton (Client)]] — 
Marble's own `-------------------------------- SINGLETONS ---------------------------------` section divider (used in both `.projection` and `.client` files) 
is where it belongs in file layout, alongside `entity`/`query`/`structure`.

Internally Marble calls this rule `SingletonSetDefinition`, with two distinct forms.

> [!abstract] Syntax — Form 1: Wrapping an Existing Entity
> ```marble
> singleton <SingletonName> for <ReferenceObjectName> {
>    where = "<SQL predicate, e.g. selecting the current user's row>";
> }
> ```

```marble
singleton Me for PersonInfo {
   where = "person_id = User_API.Get_Current_Person";
}
```

This is the canonical pattern from Marble's own example: `Me` wraps the existing `PersonInfo` entity, and `where` narrows it down to exactly one guaranteed row — the current session's person record.

> [!abstract] Syntax — Form 2: A Fully-Defined Singleton (Query-Like)
> ```marble
> singleton <SingletonName> {
>    from  = "<db_view_or_table>";
>    where = "<SQL predicate>";
>    keys  = Attr1, Attr2;
>
>    attribute <Name> <Type> { ... }
>    -- or any of:
>    -- computeditem, action, function, array, aggregate
> }
> ```

This form *looks* structurally close to [[Query]] — its own `from`/`keys`/`attribute` declarations rather than reusing an existing entity — but confirmed direct testing shows it does **not** behave like one. See the verified finding below before using this form.

---

## Verified: Form 2 Generates a Full LU-Style Scaffold, but the Fetch Body Is a Placeholder

> [!info] Working theory, confirmed by further testing below
> Nothing in the grammar *requires* `from`/`where`/`keys` — every property in Form 2's body is optional. The likely explanation: Form 2 isn't meant to wrap a real table at all. It's meant for a **computed singleton** — one built entirely from `attribute`s whose `fetch` calls a PL/SQL function, plus `computeditem`/`action`/`function`. Under that reading, the generated `SELECT ... FROM dual` isn't a bug, it's the literal correct behavior for a record with no backing table — you're expected to give every attribute its own `fetch` expression rather than relying on a table scan. `from`/`where` look like they were carried over from the same grammar rule template as [[Query]] but were never wired to anything for this form.

> [!danger] Confirmed by direct testing — `from`/`where` have no effect on the fetch body
> A test singleton was written and deployed against a real view:
> ```marble
> singleton TestSing {
>    from = "ti_stitchbond_bridge";
>    where = "greige_hu = 3254659";
>    keys = GreigeHu;
>    attribute GreigeHu Number;
>    attribute GreigeQty Number;
>    attribute PreferredResourceId Text;
> }
> ```
> The generated PL/SQL service function was:
> ```plsql
> FUNCTION Test_Sing RETURN Test_Sing_Rec
> IS
>    result_ Test_Sing_Rec;
> BEGIN
>    General_SYS.Init_Method(Ti_Traceback_Handling_SVC.lu_name_, 'Ti_Traceback_Handling_SVC', 'Test_Sing', trace_only_ => TRUE);
>    SELECT (greige_hu),
>              (greige_qty),
>              (preferred_resource_id)
>       INTO result_
>       FROM dual;
>       RETURN result_;
> END Test_Sing;
> ```
> Deployment failed with `preferred_resource_id` not existing — because the generated query selects `FROM dual`, never `FROM ti_stitchbond_bridge`. The `from`/`where`/`keys` properties are accepted by the parser but have **no effect on the generated query** for this form. Every bare attribute name is selected as a literal expression against `dual`, not as a column from any real table.
>
> **Practical consequence:** every `attribute` in a Form 2 singleton needs a self-contained `fetch` expression — a function call (`sysdate`, `User_API.Get_Current_Person`, a custom PL/SQL function), a literal, or a calculation. A bare column name only works if that exact name happens to be resolvable against `dual` (which it almost never will be). **This form cannot actually query a table or view** despite `from` suggesting otherwise.
>
> **If you need to query a real table/view for a guaranteed-single-row result, use Form 1** (`singleton <Name> for <ExistingEntityOrQuery> { where = "..."; }`) instead — that form wraps something that already has a real `from`, so the underlying entity/query's table access works normally; only the `where` clause is added.

### What Gets Generated

Confirmed from the test above — Form 2 generates the **same family of scaffolding a real Entity gets**, not a stripped-down placeholder:

- A fetch function in the projection's `.plsvc` service package, named via the usual PascalCase → underscore convention (`TestSing` → `Test_Sing`), with a `SELECT ... FROM dual` body.
- `TYPE Test_Sing_Rec IS RECORD (...)` — one field per declared `attribute`.
- `TYPE Test_Sing_Default_Copy_Rec IS RECORD (...)` — the same shape again, used to hold default values for a "new" record. Its existence confirms Form 2 fully supports create/CRUD semantics, not just read.
- `TYPE Test_Sing_Key IS RECORD (greige_hu NUMBER);` — generated directly from the `keys = GreigeHu;` declaration. **This confirms `keys` is fully functional** — it's only `from`/`where` that don't reach the fetch body.
- An auto-generated `.fragment` selector wired to the singleton and its key:
  ```marble
  selector TestSingSelector for TestSing {
     label = "${GreigeHu}";
     static GreigeHu;
  }
  ```
  This is the same default-selector scaffolding Developer Studio generates for a freshly created Entity, confirming Form 2 is registered as a full, selector-addressable data shape — not a lightweight/inert construct.

This is consistent with the [[../../Base Server Reference/Constructs/Utility (Base Server)|Utility]] pattern documented elsewhere in this vault: Marble generates the full skeleton (types, key, selector) and leaves the actual fetch logic for the developer to implement by hand in the generated function body — it's a starting point, not a finished, working query.

---

## Keywords

| Keyword | Form | Description |
|---------|------|--------------|
| `singleton <Name> for <Entity/Query/Virtual>` | 1 | Wraps an existing data shape; the body only needs a `where` to pin it to one row. |
| `singleton <Name> { ... }` | 2 | Defines the singleton from scratch like a [[Query]], with its own `from`/`keys`/attributes. |
| `where` | Both | Form 1: the predicate guaranteeing a single row against the wrapped entity/query's real table — this works normally. Form 2: parsed, but **confirmed to have no effect** on the generated `SELECT ... FROM dual`. |
| `from` | 2 only | **Confirmed non-functional** — accepted by the parser but the generated query always selects `FROM dual` regardless of this value. Do not rely on it to query a real table. |
| `keys` | 2 only | **Confirmed functional** — generates a `<Name>_Key` record type and seeds the auto-generated default selector's `static` field, even though `from`/`where` don't. |
| `attribute` / `computeditem` / `action` / `function` / `array` / `aggregate` | 2 only | Declared the same way as in [[Entity]]/[[Query]], but every `attribute` must resolve as a standalone expression (function call, literal) since there is no real table in scope — see verified finding below. |

---

## Exposing a Singleton to the Client

Like an entity or query, a singleton needs an `entityset` entry point before a `.client` page can bind to it:

```marble
entityset MeSet for Me;
```

The client side then references it via the [[../../Client/Layout/Singleton|Singleton (Client)]] construct — either as a page's primary entityset, or as an additional `singleton` placed inside a page/tab.

---

## Is Form 2 Worth Using?

Once you know it works as a computed, function-backed record (per-attribute `fetch`, no real table, `keys` driving the `_Key` type and selector), it's a legitimate construct — but evaluated against the alternatives already in this vault, it has no practical advantage:

- A [[Structure]] does the same "typed bag of computed values" job, without the unused `from`/`where` noise or the implication that it queries a table.
- Form 1 (`singleton X for ExistingEntity { where = "..."; }`) is the right tool whenever a real single-row table lookup is actually needed.

The interesting part isn't a use case — it's that **this is the only construct in the Marble grammar that generates `SELECT ... FROM dual` without the developer ever writing `dual` anywhere.** Every other PL/SQL generation path in this vault writes the `from` value verbatim into the query; this is the one exception.

---

> [!warning] No core example exists, and Form 2's intended use case is still a working theory
> A full search of every `.projection` file in this checkout for a top-level `singleton` declaration (anchored at line-start, allowing for leading whitespace) returned **zero matches** — no shipping IFS Cloud core component uses either form, so there's no real-world reference to confirm the "computed-only singleton" theory above against. What direct testing *has* confirmed: Form 2 generates a complete LU-style scaffold (Rec, Default_Copy_Rec, Key, selector) and a fetch function body that always selects `FROM dual` regardless of `from`/`where`. Whether that body is meant to be hand-completed (like a `Utility` package) or driven entirely by per-attribute `fetch` expressions with no table at all is not yet confirmed either way. The widespread real-world usage of "singleton" is entirely on the [[../../Client/Layout/Singleton|client side]], where `.client` files declare singletons via array references off an existing entity/array (`singleton Name(ArrayAttr);`) rather than via this projection-level construct at all.

---

## See Also

- [[Query]] — the closest sibling construct; Form 2 of `singleton` is structurally a query guaranteed to return one row
- [[Entity]] — Form 1 wraps an existing entity (or query/virtual)
- [[Entityset]] — required to expose a singleton to a `.client` page
- [[../../Client/Layout/Singleton|Singleton (Client)]] — how singletons are actually populated and used in practice
