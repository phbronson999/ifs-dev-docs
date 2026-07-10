---
title: Declaration Order Rules
tags:
  - ifs-marble/client
  - ifs-marble/reference
aliases:
  - ordering rules
  - declaration order
  - label must be first
related:
  - "[[Assistant]]"
  - "[[Dialog]]"
  - "[[Pages]]"
  - "[[List]]"
  - "[[Group]]"
---

# Declaration Order Rules

IFS Developer Studio enforces a strict **top-to-bottom ordering** of keywords inside every Marble client construct. If you place a keyword in the wrong position, Developer Studio highlights all keywords above it as invalid — not the misplaced keyword itself. This makes the error confusing to diagnose.

This page documents the required ordering for each construct, inferred from IFS source examples. No official documentation for these rules exists.

> [!warning] The Error Is on the Lines Above, Not the Misplaced Line
> When ordering is violated, Developer Studio marks everything **above** the out-of-place keyword as an error. If you see a block of unexpected red underlines, look **below** the last valid line — there is almost certainly a keyword in the wrong position there.

---

## `assistant` Block

```plvc
assistant <Name> using <EntitysetName> {
   label = "<title>";                -- [1] FIRST — if present, must be before everything else

   input(<Param1>, <Param2>);        -- [2] parameters passed in on open

   init command {                    -- [3] runs immediately when assistant opens
      execute { ... }
   }

   singlestep {                      -- [4a] single-screen wizard (no step navigation)
      group <GroupName>;
      list <ListName>(<ArrayName>);
   }
   -- OR (not both):
   steps {                           -- [4b] multi-step wizard
      step { ... }
      final step { ... }
      cancelled step { ... }
   }

   finish command {                  -- [5] primary action on Finish click
      enabled = [<expression>];
      execute { ... }
   }

   cancel command {                  -- [6] runs on Cancel click
      execute {
         navigate back;
      }
   }

   command <CommandName>;            -- [7] additional named commands — always last, repeatable
}
```

| Phase | Keywords | Notes |
|-------|----------|-------|
| 1 | `label` | Must be the very first item if used |
| 2 | `input(...)` | Before `init command` |
| 3 | `init command { }` | Before content |
| 4 | `singlestep { }` **or** `steps { }` | Mutually exclusive |
| 5 | `finish command { }` | After content |
| 6 | `cancel command { }` | After `finish command` |
| 7 | `command <Name>` | Repeatable; always last |

---

## `steps` Block (inside `assistant`)

```plvc
steps {
   step { } -- [1] regular steps — one or more, in display order
   step { }
   final step { } -- [2] shown after finish command completes; displays ${Result}
   cancelled step { } -- [3] shown if user cancels mid-wizard
}
```

> [!note] `final step` and `cancelled step` Always Come Last
> All regular `step { }` blocks must come before `final step` and `cancelled step`. Developer Studio will flag the regular steps as invalid if they appear after either special step.

---

## `step` Block (inside `steps`)

```plvc
step {
   label = "<Step label>";           -- [1] FIRST if used
   description = "<text>";           -- [1] also phase 1 (used in final step / cancelled step)

   group <GroupName>;                -- [2] content groups and lists, repeatable
   list  <ListName>(<ArrayName>);    -- [2]

   next command {                    -- [3] LAST — controls Next button; optional
      enabled = [<expression>];
   }
   command <CommandName>;            -- [3] additional commands — last, repeatable
}
```

---

## `dialog` Block

```plvc
dialog <Name> for <StructureOrVirtual> {
   label = "<Dialog title>";         -- [1] FIRST

   input(<Param1>, <Param2>) {       -- [2] parameters; optional init command inside
      command InitCommandName;
   }

   group <GroupName>;                -- [3] form content — repeatable
   list  <ListName>(<ArrayName>);    -- [3] line items — after groups

   commandgroup <ButtonGroupName> {  -- [4] LAST — button bar (OK, Cancel, etc.)
      command Ok;
      command Cancel;
   }
}
```

| Phase | Keywords | Notes |
|-------|----------|-------|
| 1 | `label` | First |
| 2 | `input(...) { }` | Before content |
| 3 | `group`, `list` | Repeatable; groups before lists |
| 4 | `commandgroup { }` | Must be the last item |

---

## `page` Block

```plvc
page <Name> using <EntitysetName> {
   label = "<Screen title>";         -- [1] FIRST

   startupmode = search;             -- [2] mode settings
   editmode    = SingleCellEdit;     -- [2]

   list  <ListName>;                 -- [3] components — repeatable
   group <GroupName>;                -- [3]
   arrange { ... } -- [3]

   list <Child>(<Array>) bind <Parent> {  -- [3] bound lists — after their parent list
      display = Nested;
   }
}
```

---

## `list` Block

```plvc
list <Name> for <Entity> {
   label   = "<label>";              -- [1] settings — in any order among themselves
   orderby = <AttrName>;            -- [1]
   editmode = SingleCellEdit;       -- [1]

   field <AttrName> { ... } -- [2] columns — repeatable
   lov   <RefName> with <Selector> { ... } -- [2]

   command <CommandName>;           -- [3] LAST — repeatable
}
```

> [!tip] `command` Must Always Be the Last Thing in a List
> Any `command` reference after a `field` or `lov` is valid. Any `field` or `lov` after a `command` is an ordering violation.

---

## `group` Block

```plvc
group <Name> for <EntityOrStructure> {
   label = "<Panel header>";         -- [1] FIRST — use "" to suppress the header

   field <AttrName> { ... } -- [2] fields — repeatable
   lov   <RefName> with <Selector> { ... } -- [2]
}
```

---

## `init command` / `finish command` / `cancel command` / `next command` Blocks

```plvc
init command {
   enabled = [<expression>];        -- [1] guard condition (optional)
   execute {                        -- [2] action body — LAST
      ...
   }
}
```

`enabled` must precede `execute`. The `execute { }` block is always last.

---

## Common Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| `label` after any other keyword | Everything above `label` goes red | Move `label` to be the first line inside the block |
| `commandgroup` not last in a dialog | Lines above it go red | Move `commandgroup` to the bottom of the dialog block |
| `command` before `field`/`lov` in a list | Fields/LOVs below the command go red | Move all `command` references to the end of the list |
| `finish command` before `steps`/`singlestep` | Content block goes red | Move `finish command` after the content block |
| Regular `step { }` after `final step { }` | Regular step goes red | All regular steps must come before `final step` |

---

## See Also

- [[Assistant]] — full syntax and examples
- [[Dialog]] — dialog syntax with input/commandgroup
- [[Pages]] — page syntax
- [[List]] — list syntax with field/lov/command ordering
- [[Group]] — group syntax
