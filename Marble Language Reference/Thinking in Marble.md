---
title: Thinking in Marble
tags:
  - ifs-marble
  - ifs-marble/guide
aliases:
  - Marble mental model
  - how Marble works
  - IFS development model
  - start here
related:
  - "[[Glossary]]"
  - "[[Client File Structure]]"
  - "[[Projection File Structure]]"
  - "[[Fragment]]"
---

# Thinking in Marble

Marble is a **declarative language** — you describe *what* to show and *what data to bind to*, not *how* to fetch, render, or persist it. The framework handles the mechanics. Your job is to specify the correct contracts between layers.

Read this page before diving into the reference notes. It is the mental model that makes everything else click.

---

## The Four-Layer Stack

Every IFS Cloud screen touches four distinct layers. Each layer has one responsibility and its own file type.

```marble
┌─────────────────────────────────────────┐
│   Aurena UI Layer                       │  .client / .fragment
│   "What does the user see and do?"      │
└────────────────┬────────────────────────┘
                 │ consumes
┌────────────────▼────────────────────────┐
│   Projection / API Layer                │  .projection / .fragment
│   "What data exists and what can        │
│    the server do with it?"              │
└────────────────┬────────────────────────┘
                 │ implemented by
┌────────────────▼────────────────────────┐
│   Service Layer                         │  .plsvc
│   "PL/SQL that executes actions and     │
│    queries behind the API layer"        │
└────────────────┬────────────────────────┘
                 │ reads/writes
┌────────────────▼────────────────────────┐
│   Database Layer                        │  .plsql / .views / .storage
│   "Oracle packages, views, tables"      │
└─────────────────────────────────────────┘
```

If you come from web development, each layer maps to something you already know:

| IFS Layer | File Type | Responsibility | Web Equivalent |
|-----------|-----------|----------------|----------------|
| Aurena UI | `.client` | Screens, components, user interactions | React / Vue component |
| Projection API | `.projection` | Data contract: entities, attributes, operations | GraphQL schema / REST API |
| Service | `.plsvc` | Implements the actions and functions | Express controller / Django view |
| Database | `.plsql` / `.views` | Oracle packages and views | SQL database + stored procedures |

The IFS stack is more opinionated than a typical web stack — the framework auto-generates a lot of the API plumbing — but the conceptual layers are identical.

---

## The Three Rules

These three rules resolve almost every "why isn't this working?" question in Marble development.

### Rule 1: The Projection Defines Reality

**Everything the client can show or do must be declared in the projection first.**

If an attribute doesn't exist in the projection entity, the client cannot display it. If an action isn't declared in the projection, the client cannot call it. The projection is the single source of truth for what data exists and what operations are available. The client is purely a consumer.

> [!note] Compare to React/GraphQL
> This is the same constraint as a GraphQL schema — your React component can only query fields that exist in the schema. Marble's projection is the schema. You can't ask for data that hasn't been declared.

### Rule 2: One Client, One Projection

A `.client` file opens with `projection <Name>;` — it binds to exactly one projection. You cannot reference two projections in one client. When you need to combine data from multiple sources, you do it in the projection layer (via entity references and arrays), not in the client.

The exception is fragments — but even there, fragments are included into both sides and don't mix projections.

### Rule 3: Design Data Before UI

Always start with the projection. What entity are you working with? What attributes does the screen need? What actions should the user be able to trigger? Answer those questions first. Then the client is straightforward — you're just choosing how to present what already exists.

If you start by sketching the UI and then try to wire up the data, you will hit the projection wall repeatedly. Design data-first.

---

## How the Files Connect

Here is a concrete mapping for a hypothetical employee absence screen:

```marble
EmployeeAbsence.client
│
├── projection EmployeeAbsence;
│       ↓
│   EmployeeAbsence.projection
│       ├── entityset EmployeeAbsenceSet for EmployeeAbsence
│       ├── entity EmployeeAbsence {
│       │       attribute EmployeeId   Text;
│       │       attribute AbsenceType  Text;
│       │       attribute StartDate    Date;
│       │       attribute Objstate     Text;
│       │       reference AbsenceTypeRef(AbsenceType) to AbsenceType(Code);
│       │   }
│       └── action ApproveAbsence(AbsenceId Text);
│
├── page AbsencePage using EmployeeAbsenceSet
│       │
│       └── list AbsenceList for EmployeeAbsence
│               ├── field EmployeeId              ← attribute on EmployeeAbsence
│               ├── field StartDate               ← attribute on EmployeeAbsence
│               ├── lov AbsenceTypeRef            ← reference on EmployeeAbsence
│               │   with ReferenceAbsenceTypeSelector
│               ├── badge Objstate { ... }        ← attribute on EmployeeAbsence
│               └── command ApproveCommand        ← calls action ApproveAbsence
```

Every line in the client has a corresponding declaration in the projection. There is no magic — every connection is explicit and traceable.

---

## Fragment: The Bridge

A `.fragment` file is the one exception to "one client, one projection." It contains **both** a `CLIENT FRAGMENTS` section and a `PROJECTION FRAGMENTS` section in the same file. It is the primary reuse mechanism in Marble.

The most common fragment is the **selector fragment** — it packages an entityset (projection side) and a selector UI component (client side) together, so any screen that needs a LOV dropdown can include the fragment and use it immediately.

```marble
AbsenceTypeLovSelector.fragment
├── PROJECTION FRAGMENTS
│       └── entityset AbsenceTypeLovSet for AbsenceType
└── CLIENT FRAGMENTS
        └── selector AbsenceTypeLovSelector for AbsenceTypeLovSet
```

The client includes it with `include fragment AbsenceTypeLovSelector;`, then uses:
```plvc
lov AbsenceTypeRef with ReferenceAbsenceTypeLovSelector { ... }
```

Both the entityset and the selector it needs come from the single fragment file. This is why LOVs "just work" once a fragment is included — there is no separate lookup; the fragment wires both sides.

> [!note] Compare to React
> A selector fragment is like a shared React component in a component library: someone wrote the component once (projection + client together), and you import it wherever you need a dropdown for that entity. You don't rebuild the dropdown per screen.

---

## How to Approach a New Screen

**Building from scratch:**

1. **Identify the entity** — which database table / Logical Unit is this screen about? Check the [[Base Server Reference/README|Base Server Reference]].
2. **Design the projection** — which attributes does the screen need? Which references (for LOVs)? Which actions can the user trigger?
3. **Choose the screen type** — a list page, a form page, a dialog, or a multi-step assistant?
4. **Lay out the client** — lists, groups, fields, LOVs, commands
5. **Add behavior** — validate commands, emphasis colors, filter conditions

Start at step 1. Skipping to step 4 means you will hit the projection wall at every field and every command.

---

## How to Read Existing Code

**Understanding code someone else wrote:**

| Question | Where to look |
|----------|--------------|
| What does this screen show? | `.client` — the page and list/group declarations |
| What data is it working with? | `.projection` — the entity and entityset |
| What attributes exist on the entity? | Projection's `entity` block |
| What does this command do? | The `execute { }` block in the client; the `action` in the projection |
| Where is the PL/SQL? | `.plsvc` file — same name as the projection |
| What is this LOV pulling from? | The selector fragment named in `with Reference<X>Selector` |
| Why is this field read-only? | The `editable`/`insertable` flags on the attribute in the projection |

The tracing pattern is always: **client → projection → service**. Start at the UI, follow the declaration name, find the server implementation.

---

## Common Mental Model Errors

> [!warning] "I'll just add this field in the client"
> You can't. A `field SomeName` in the client requires `attribute SomeName` in the projection entity. Add the attribute to the projection first, then the field in the client.

> [!warning] "The LOV dropdown is empty"
> Three things must all be present simultaneously: (1) the projection declares `reference RefName(...) to TargetEntity(...)`, (2) the client includes `include fragment TargetEntitySelector;`, and (3) that fragment file exists. All three, or nothing. Missing any one produces an empty or broken dropdown.

> [!warning] "My command calls the action but nothing happens"
> The most common cause: the parameter types in `call ActionName(Param1, Param2)` don't match the projection's `action ActionName(Param1 Text, Param2 Number)` declaration. A type mismatch silently fails. Check the parameter names and types exactly.

> [!warning] "I set `editable = [true]` in the client but the field won't save"
> The projection's attribute has `editable = [false]` or `insertable = [false]`. The client's `editable` property can make a field *more restrictive* than the projection allows, but it cannot make a field *less restrictive*. If the server says read-only, the client cannot override it.

> [!warning] "I'm editing the `.client` file but my LOV shows the wrong list"
> You're likely looking at the wrong side. LOV data comes from the entityset declared in the **selector fragment**, not from the client. Find the fragment named in `with Reference<X>Selector` and check its entityset definition.

---

## Where to Go From Here

| If you want to… | Start with… |
|----------------|-------------|
| Understand all the terms | [[Glossary]] |
| Write your first client file | [[Client File Structure]] |
| Write your first projection file | [[Projection File Structure]] |
| Build a list page | [[Pages]] → [[List]] |
| Build a dialog | [[Dialog]] → [[Virtual]] |
| Build a multi-step wizard | [[Assistant]] → [[Virtual]] |
| Understand LOV dropdowns end-to-end | [[Fragment]] → [[References and Arrays]] → [[Fields and LOV]] |
| Add a command button | [[Commands and Expressions]] → [[Action]] |
| Add status colors | [[Emphasis and Colors]] |
