---
title: Singleton
tags:
  - ifs-marble/client
  - ifs-marble/construct
aliases:
  - singleton
  - singleton reference
  - singleton definition
  - singleton bind
  - singleton alias
related:
  - "[[List]]"
  - "[[Group]]"
  - "[[Pages]]"
  - "[[../../Projection/Entities/Singleton|Singleton (Projection)]]"
---

# Singleton

A *singleton* displays a single, specific record from a datasource that's known to return at most one row — no list, no selection, just the record's fields laid out directly.
It's the client-side counterpart to a `.projection` `singleton` (see [[../../Projection/Entities/Singleton|Singleton (Projection)]]) — though in practice, almost every real singleton is populated from a plain array reference rather than a dedicated projection singleton (see below).

There are two distinct grammar forms: a **full declaration** (file scope, confirmed by Marble as `SingletonDefinition`) and a **placement reference** (used inside a page or tab, confirmed as `SingletonReference`). They look similar but serve different purposes.

---

## Form A: Full Declaration

> [!abstract] Syntax
> ```marble
> singleton <SingletonName> for <Datasource>;
> -- or, with CRUD/commands:
> singleton <SingletonName> for <Datasource> {
>    [crudactions { ... }]
>    ( command <Name>; | commandgroup <Name>; )*
> }
> ```

Declared at file scope, under the `-------------------------------- SINGLETONS ---------------------------------` section divider (the same divider convention used in `.projection` files). This is where a singleton gets its real datasource binding, plus any CRUD restrictions and commands.

### Keywords

| Keyword | Description |
|---------|-------------|
| `singleton <Name> for <Datasource>;` | Bare form — just declares the singleton against its datasource. |
| `singleton <Name> for <Datasource> { ... }` | Block form — adds `crudactions` and/or command/commandgroup references. |
| `crudactions { }` | Same CRUD-control construct used elsewhere (see [[../Controls/Advanced Controls#`crudactions` — Control New/Edit/Delete Availability]]) — controls whether the singleton's record can be created/updated/deleted. |
| `command <Name>;` / `commandgroup <Name>;` | References to commands available on the singleton — these commands run in the singleton's own record context, so `parent.Attr` inside them refers to the *page's* context, not the singleton's. |

### Real Example — Full Declaration with CRUD and Parent-Aware Commands

> [!example] Source: `equip/model/equip/EquipmentObjectNavigator.client`

```marble
singleton EquipmentTwSettingsSingleton for EquipmentTwSettings {
   crudactions {
      new {
         enabled = [SessionUser = Owner];
      }
      edit {
         enabled = [SessionUser = Owner];
      }
      delete {
         enabled = [SessionUser = Owner];
      }
   }
}

singleton TechObjectReferenceEquipSingleton for TechnicalObjectReference {
   crudactions {
      new {
         enabled = [parent.VisibleRequirements != false and parent.VisibleRequirements != null];
      }
      delete {
         enabled = [parent.VisibleRequirements != false and parent.VisibleRequirements != null];
      }
      edit {
         enabled = [parent.VisibleRequirements != false and parent.VisibleRequirements != null];
      }
   }
   command TechSpecChangeStatusCommand {
      visible = [TechnicalClass != "" and parent.VisibleRequirements != false and parent.VisibleRequirements != null];
   }
   command TechSpecRefreshAttributesCommand {
      visible = [TechnicalClass != "" and parent.VisibleRequirements != false and parent.VisibleRequirements != null];
   }
}
```

Note `parent.VisibleRequirements` — a variable declared on the *page*, read from inside the singleton's own `crudactions`/`command` blocks via [[../Concepts/Commands and Expressions#`parent.AttrName` — Parent Record in a Child List|`parent.AttrName`]]. This is the same `parent.*` mechanism used for child lists, applied here to a singleton's record context.

---

## Form B: Placement / Reference

> [!abstract] Syntax
> ```marble
> singleton <SingletonRef>
>    [alias <SingletonAlias>]
>    [ ( "(" <DetailRef> ")" [bind <SourceRef>] | bind <SourceRef> | url=... ) ]
>    ;
> ```

Valid inside `PageContent`, `TabContent`, or `ObjectConnectionDefinition` — i.e. directly on a page, inside a `tab`, or inside an `objectconnection`. This is how a singleton is actually **placed and populated** in the UI.

### Keywords

| Keyword | Description |
|---------|-------------|
| `singleton <Ref>;` | Bare reference — places/reuses a singleton that was already introduced elsewhere in the file (either a Form A full declaration, or a first `(DetailRef)` use as below). |
| `singleton <Ref>(<DetailRef>);` | **The form used by almost every real singleton.** `<DetailRef>` is an array/reference attribute that supplies the singleton's one row — e.g. `singleton FunctionalObjectGeneralSingleton(EquipmentFunctionalArray);`. The array is typically one the projection guarantees returns 0-or-1 rows for the current context. |
| `singleton <Ref>(<DetailRef>) bind <SourceRef>;` | Combines an array source *and* re-anchors the singleton relative to another already-placed component (commonly another singleton) instead of the page's primary record. |
| `singleton <Ref> bind <SourceRef>;` | `bind` alone, no array — re-anchors context without a separate array attribute. |
| `singleton <Ref> alias <Alias>;` | Gives the placed singleton an alternate local name, letting the same underlying singleton be placed more than once under different identities without a naming collision. |
| `singleton <Ref> url=...;` | Sources the singleton's record from a URL instead of an array or bind. |

> [!important] `group`, `list`, and `singleton` Share the Same Reference Grammar
> The `(<DetailRef>) [bind <SourceRef>]` / `bind <SourceRef>` / `url=...` placement pattern is *identical* across `singleton`, [[List]], and [[Group]] references (confirmed against Marble's `SingletonReference`/`ListReference`/`GroupReference` rules — same shape, same keywords). If you already know how a bound `group` or `list` works, a bound `singleton` behaves the same way. The only thing genuinely singleton-specific is the optional `alias`.

---

## How Singletons Are Actually Populated (the Real-World Pattern)

In practice, the file-scope `for <Datasource>` form (Form A) is rare, and the array-reference form `singleton Name(ArrayAttr);` (Form B) is how almost every singleton in shipping IFS Cloud code gets its data. The array attribute comes from the projection — typically a `reference`/`array` that the entity/projection author has arranged to return at most one row for the current key.

Marble's broader convention also applies here: **a component (`group`/`list`/`singleton`/`imageviewer`) is declared with its full shape once, then referenced by bare name everywhere else it's reused** in the same file — singleton is not special in this respect.

### Real Example — Three Singletons Chained Together in One Tab

> [!example] Source: `equip/model/equip/EquipmentObjectNavigator.client` — "More Information" tab

```marble
tab {
   label = "More Information";
   group TabTypeSelectionGroup;

   -- ********************** Type Designation *********************
   singleton TypeDesignationSingleton(TypeDesignationArray);
   group TypeDesignationGroup bind TypeDesignationSingleton {
      visible = [VisibleTypeDesignation = true];
   }

   -- A second singleton, sourced from an array relative to the FIRST singleton:
   singleton TypeDesTechnicalObjRefSingleton(TypeDesObjectReferenceArray) bind TypeDesignationSingleton;
   arrange {
      group CharPublicContainerGroup bind TypeDesTechnicalObjRefSingleton {
         visible = [VisibleTypeDesignation = true];
      }
      group AttributeTypeGroup {
         visible = [VisibleTypeDesignation = true];
      }
   }
   list TechnicalSpecNumericList(TechnicalSpecNumericArray) bind TypeDesTechnicalObjRefSingleton {
      visible = [VisibleTypeDesignation = true and SelectionParameters = "Numeric"];
   }

   -- ... (Spare Parts / Test Points / Journal / Parties lists omitted) ...

   -- ********************** Requirements/ Technical data *********************
   -- A THIRD, independent singleton in the same tab:
   singleton TechObjectReferenceEquipSingleton(TechnicalObjectReferenceArray);
   arrange {
      group CharPublicContainerGroup bind TechObjectReferenceEquipSingleton {
         visible = [VisibleRequirements = true];
      }
      group AttributeTypeGroup {
         visible = [VisibleRequirements = true];
      }
   }
   list TechnicalSpecNumericList(TechnicalSpecNumericArray) bind TechObjectReferenceEquipSingleton {
      visible = [VisibleRequirements = true and SelectionParameters = "Numeric"];
   }
}
```

This is the densest real singleton usage found in this checkout — worth tracing closely:

1. **`TypeDesignationSingleton(TypeDesignationArray)`** — sourced directly from an array off the page's main entity.
2. **`TypeDesTechnicalObjRefSingleton(TypeDesObjectReferenceArray) bind TypeDesignationSingleton`** — sourced from a *second* array, but that array is resolved **relative to the first singleton**, not the page. This is how singletons chain: page → singleton 1 → singleton 2.
3. **`TechObjectReferenceEquipSingleton(TechnicalObjectReferenceArray)`** — a third, independent singleton in the *same tab*, unrelated to the first two, sourced straight from the page again.
4. Every `group`/`list` that follows a singleton declaration uses `bind <SingletonName>` to attach its fields/rows to that singleton's record — note the same `group`/`list` names (`CharPublicContainerGroup`, `TechnicalSpecNumericList`) are reused twice in this tab, bound to two *different* singletons each time. Same component declaration, different binding context.

### Reusing a Singleton Across Multiple Tabs/Pages

Once a singleton has been introduced with its array (`singleton Name(ArrayAttr);`), other tabs (even in a different `page` block in the same file) can reference it bare:

```marble
-- First introduction, with its array:
tab {
   label = "Functional Object";
   singleton FunctionalObjectGeneralSingleton(EquipmentFunctionalArray);
   arrange {
      group FunctionalObjectGroup bind FunctionalObjectGeneralSingleton;
      imageviewer ObjectImageViewer using MediaLibraryResultSet(luname, keyref);
   }
}

-- Later reuse (different page in the same file), bare reference:
tab {
   label = "Functional Object";
   singleton FunctionalObjectGeneralSingleton;
   arrange {
      group FunctionalObjectGroup bind FunctionalObjectGeneralSingleton;
      imageviewer ObjectImageViewer using MediaLibraryResultSet(luname, keyref);
   }
}
```

---

## Where It Can Be Used

Confirmed via Marble's `DirectParents` for `SingletonReference`:

| Context | Notes |
|---------|-------|
| `page` (directly) | A singleton can sit at the top level of a page's content, alongside lists/groups. |
| `tab` | The most common placement — see the chained example above. |
| `objectconnection` | A singleton can also be one of the things an [[../Controls/Data Views#`objectconnection`|objectconnection]] panel exposes. |

`singleton` does **not** appear in Marble's grammar as valid inside a plain `arrange { }`/`dialog`/`assistant` content list directly — though the `group`/`list` controls bound *to* a singleton are commonly wrapped in `arrange { }` for layout (as in the examples above).

## What Can Bind to a Singleton / What a Singleton Can Bind to

- **What can bind to it:** [[Group]] and [[List]] references both accept `bind <SingletonName>` to attach their fields/rows to the singleton's record instead of the page's primary entity. A singleton can also bind to another singleton (chaining).
- **What it can bind to:** another already-placed `singleton` (most common, for chaining), or it can simply source its own row from an array attribute (`(<DetailRef>)`) without binding to anything else.
- **What populates it in the first place:** an array/reference attribute from the projection (the dominant real-world pattern), or — much more rarely in practice — a dedicated [[../../Projection/Entities/Singleton|projection-level singleton]] referenced via `for <Datasource>`.

---

## Patterns & Tips

> [!tip] Use Singletons to Avoid Navigating Away for "One More Record"
> The chained-singleton pattern (`singleton A; singleton B bind A;`) is how IFS shows several logically-related single records together on one tab without forcing the user through detail-page navigation for each one — e.g. an object's general info, its type designation, and its technical specification reference, all visible side by side.

> [!tip] Reused Component Names Are Scoped by Their Binding, Not Their Name
> The same `group`/`list` name can legitimately appear twice in one tab, `bind`-ed to two different singletons. Don't assume a duplicate name is a copy-paste mistake — check what each instance is bound to before "fixing" it.

> [!warning] `crudactions`/`command` Belong on the Full Declaration, Not the Placement
> CRUD restrictions and commands are declared once, on the Form A `singleton ... for ... { }` block — not repeated at each placement site. If you need a singleton's CRUD behavior to differ per-tab, that's not supported directly; you'd need a second, separately-declared singleton.

---

## See Also

- [[List]] — the multi-row counterpart; shares the same `bind`/array reference grammar
- [[Group]] — also displays one record's fields, and is what's actually `bind`-ed to a singleton in practice
- [[Pages]] — where singletons can be placed directly, and where `parent.*` expressions originate from
- [[../../Projection/Entities/Singleton|Singleton (Projection)]] — the rarely-used projection-level construct, vs. the array-reference pattern documented above
