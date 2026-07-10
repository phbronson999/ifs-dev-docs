---
title: Business Object Model
tags:
  - ifs-other-models
  - ifs-other-models/confirmed
aliases:
  - bo
  - .bo
  - businessobject
related:
  - "[[IFS Base Server Reference]]"
---

# Business Object Model

A ==Business Object Model== (Marble language `bo`, file extension `.bo`) groups a main entity together with related sub-entities into a single named "Business Object" — a higher-level grouping than an individual Entity/Logical Unit. Found incidentally while cross-referencing the Developer Studio New Model menu against Marble's language index; not part of the original research pass.

> [!abstract] Syntax Skeleton
> ```marble
> businessobject <ModelName>;
> component       <ComponentName>;
> layer           <LayerName>;
> description     "<Value>";
> [deprecated     <true|false>;]
>
> [mainentity <EntityDefinition>]
>
> [@DynamicComponentDependency <COMPONENT>]
> entity <EntityDefinition>
> -- repeatable, one per sub-entity
> ```

---

## Keywords

| Keyword | Description |
|---------|-------------|
| `businessobject` / `component` / `layer` | Standard model header. |
| `description` | Short description, e.g. `"Customer order planning and procurement."` |
| `deprecated` | Boolean — marks the whole BO model as deprecated. |
| `mainentity` | The main entity of the Business Object. |
| `entity` | A sub-entity of the Business Object. Can be wrapped in `@DynamicComponentDependency` for optional-component sub-entities, same pattern as `.projection`'s `include fragment`. |

`EntityDefinition` itself was not drilled into for this note — it's likely a reference to an existing `.entity`'s Logical Unit name rather than a fresh inline definition, but that's inferred from naming convention, not confirmed against a real `.bo` example file.

## See Also

- [[IFS Base Server Reference]] — the individual `.entity` Logical Units a Business Object groups together
