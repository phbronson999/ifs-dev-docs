---
title: Scheduling Model
publish: true
tags:
  - ifs-other-models
  - ifs-other-models/confirmed
aliases:
  - scheduling
  - .scheduling
related:
  - '[[Outbound Model]]'
---

# Scheduling Model

A ==Scheduling Model== defines a data interface and a set of actions for interaction with the **scheduling server** — IFS Cloud's integration with its external Resource Scheduling Optimization (RSO/PSO) engine. Confirmed real: example files exist in this checkout (`fndsch/model/fndsch/Users.scheduling`, `mso/model/mso/PsoShopOrderIntegration.scheduling`, `svcsch/model/svcsch/PsoServiceIntegration.scheduling`, `wops/model/wops/PsoWorkOrderIntegration.scheduling`).

> [!abstract] Syntax Skeleton
> ```marble
> scheduling <ModelName>;
> component   <ComponentName>;
> layer       <LayerName>;
> [description "<Value>";]
>
> [parameters {
>    <ParamName> <Type> [lookupview <View>];
> }]
>
> [schedulingdata {
>    [@Overtake <Layer>]
>    <SomeDataFetch>;
>    -- repeats, one of ~150 *DataFetch entity types: ActivityDataFetch, ResourceDataFetch,
>    -- ShiftDataFetch, VehicleDataFetch, SkillDataFetch, CalendarDataFetch, etc.
> }]
>
> [modellingdata {
>    -- same idea, ~140 RAM*DataFetch entries (Resource & Activity Modelling) e.g.
>    -- RAMResourceDataFetch, RAMShiftTemplateDataFetch, RAMSkillDataFetch
> }]
>
> [systemdata {
>    -- ~25 entries: UsersDataFetch, GroupsDataFetch, ProfileDataFetch, OrganisationPermissionDataFetch, etc.
> }]
>
> [machinelearningdata {
>    -- MLFeatureDataFetch, MLModelDataFetch, MLDatasetDataFetch, MLBlobDataFetch, MLCsvDataFetch
> }]
> ```

---

## Keywords

| Keyword | Description |
|---------|-------------|
| `scheduling` / `component` / `layer` | Standard model header. |
| `description` | Short text — Marble's own description for this field is the generic definition of scheduling itself: *"Scheduling is the process of assigning jobs (activities) to people (resources) in the most efficient way possible, according to a defined set of constraints."* |
| `parameters { }` | Parameters for the dataset, e.g. `Company Text lookupview Company;`. |
| `schedulingdata { }` | The operational data interface — activities, resources, shifts, vehicles, availability, etc. Roughly 150 `*DataFetch` entity types are valid here. |
| `modellingdata { }` | The `RAM*`-prefixed configuration/modelling data interface (Resource & Activity Modelling) — templates, patterns, rules, categories that define *how* scheduling should behave, as opposed to the live operational data in `schedulingdata`. |
| `systemdata { }` | Users, groups, profiles, permissions — system-level data the scheduling server needs. |
| `machinelearningdata { }` | Feature/model/dataset data for the scheduling engine's ML-based optimization features. |
| `@Overtake <Layer>` | An annotation usable inside any of the four data blocks: *"Run this code instead of the code in lower layer(s)."* — a layer-override mechanism, conceptually similar to `@Override` in Projections. |

> [!tip] Each `*DataFetch` keyword is its own tiny rule
> Marble indexes each of the ~300+ `*DataFetch` entity names (`ActivityDataFetch`, `RAMResourceDataFetch`, etc.) as a separate rule. They were not individually queried for this note — there are too many to be useful as a flat list — but if you need the exact shape of a specific one (e.g. `VehicleDataFetch`), it can be looked up by name the same way the rest of this vault's notes were built.

---

## See Also

- [[Outbound Model]] — a different integration-documentation DSL, for outbound web services rather than the scheduling engine
- Real examples in this checkout: `fndsch/model/fndsch/Users.scheduling`, `wops/model/wops/PsoWorkOrderIntegration.scheduling`
