---
title: Component Deployment Profile File
publish: true
tags:
  - ifs-deployment
  - ifs-deployment/profile
aliases:
  - deploy.ini
  - Component Deployment Profile
  - Deploy INI
related:
  - '[[Entity (Base Server)]]'
---

# Component Deployment Profile File

==`deploy.ini`== is the profile file that defines the deployment and installation properties of an IFS Cloud **component**. It's an ordinary INI file — sections in `[Brackets]`, `Key=Value` entries underneath — that tells the build/installation tooling how to package a component, what it depends on, which versions exist, and how to upgrade between them.

The sections defining installation dependencies between components are merged into the resulting installation profile file `install.ini`, which drives the actual multi-component install/upgrade run.

> [!info] Official Reference
> [IFS TechDocs — Component Deployment Profile File](https://docs.ifs.com/techdocs/24r1/060_development/027_base_server_dev/007_concepts/150_deploy_ini/)

> [!info] Applies to every component type, not just Base Server
> `deploy.ini` exists once per component regardless of [ComponentType](#componenttype) — `Base`, `ExtendedApplication`, `Framework`, `Product`, `Trans`, or `External`. This is why it lives in its own [[README|Deployment and Installation Reference]] section rather than under [[Base Server Reference/README|Base Server Reference]].

> [!info] Verified against a real, full-scale checkout
> This note was cross-checked against all **239** real `deploy.ini` files in a local IFS Cloud core checkout (`IFSCloud_localUse\Buildplace\checkout\<component>\deploy.ini`), not just the official doc and one example file. That survey confirmed the sections below, surfaced one section the official reference doesn't document ([`[ObsoleteFilesRemove]`](#obsoletefilesremove)), and found several rare/one-off sections — see [Sections Observed in Practice but Not in the Official Reference](#sections-observed-in-practice-but-not-in-the-official-reference).

---

## Profile Sections

| Section                                                                                                 | Description                                                                                 |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [`[Component]`](#component)                                                                             | Name of the component. Mandatory.                                                           |
| [`[ComponentName]`](#componentname)                                                                     | Description of the component.                                                               |
| [`[ComponentType]`](#componenttype)                                                                     | Type of the component.                                                                      |
| [`[Connections]`](#connections)                                                                         | Connections and connection type to other IFS components. Mandatory.                         |
| [`[<component>Versions]`](#componentversions-and-componentupgrade)                                      | Every released version of the component. Mandatory.                                         |
| [`[<component>Upgrade]`](#componentversions-and-componentupgrade)                                       | Script files that upgrade from any supported version to current.                            |
| [`[<component>PreUpgrade]`](#componentpreupgrade)                                                       | File executed for a specific version, before any component has been upgraded.               |
| [`[PostInstallationData]`](#postinstallationdata-postinstallationdataseq-and-postinstallationobject)    | Files executed after all components are deployed, in parallel with other components' files. |
| [`[PostInstallationDataSeq]`](#postinstallationdata-postinstallationdataseq-and-postinstallationobject) | Same as `PostInstallationData`, but run in sequence to avoid lock contention.               |
| [`[PostInstallationObject]`](#postinstallationdata-postinstallationdataseq-and-postinstallationobject)  | Oracle objects created after all components are deployed, in parallel.                      |
| [`[CapMergeFiles]`](#capmergefiles-and-capmergefileslast)                                               | Merge order for files of the same type with dependencies between them.                      |
| [`[CapMergeFilesLast]`](#capmergefiles-and-capmergefileslast)                                           | Files that must be deployed last, in sequence.                                              |
| [`[IgnoreDeployFiles]`](#ignoredeployfiles)                                                             | Generated-type files to exclude from the merge entirely.                                    |
| [`[ObsoleteFilesRemove]`](#obsoletefilesremove)                                                         | ⚠️ Not in the official reference. Files to actively delete from a target install/upgrade.    |
| [`[PreComponent]`](#precomponent)                                                                       | Names a preceding component — used when renaming/splitting components.                      |
| [`[BuildHomeFiles]`](#buildhomefiles)                                                                   | Files copied to the root of `<build_home>`.                                                 |
| [`[Bootstrap]`](#bootstrap)                                                                             | Files deployed before any component. IFS Cloud platform components only.                    |
| [`[Layering]`](#layering)                                                                               | Restricts Layered Application Architecture customization for the component.                 |
| `[<component>Defines]`                                                                                  | Variables added as `DEFINE`/`UNDEFINE` to `.tem` files with predefined values.              |
| `[Comments]`                                                                                            | Free-text change history for the `deploy.ini` file.                                         |

> [!info] `<component>`-prefixed section names are validated
> The `<component>` prefix in section names like `[ShpordVersions]` or `[ShpordUpgrade]` must exactly match the `Name` declared in `[Component]`, and section names must be unique.

---

## `[Component]`

Mandatory. Declares the component's name.

```ini
[Component]
Name=Shpord
```

## `[ComponentName]`

Human-readable description of the component.

```ini
[ComponentName]
Description=Shop Order
```

## `[ComponentType]`

Declares which of the six component types this is.

```ini
[ComponentType]
Type=Base
```

| Type | Description |
|---|---|
| `Base` | Base components |
| `ExtendedApplication` | Components running in Extended Server, e.g. BizAPIs |
| `External` | Components not deployed via framework tools |
| `Framework` | Extended Server components |
| `Product` | Product components |
| `Trans` | Component containing language files |

> [!info] `Trans` components skip name validation
> Language files in a component with `Type=Trans` have special handling in IFS Configuration Builder — the check of component name in language files is ignored.

## `[Connections]`

Mandatory. Declares which other components this one connects to, and how.

```ini
[Connections]
ConnectedComponent=ConnectionType
```

`ConnectionType` is one of:

- **`STATIC`** — a direct, hard-coded API call to the component. At least one `STATIC` dependency is required (except for `FNDBAS`). `STATIC` dependencies determine installation order — a `STATIC` dependency must be installed before the component that depends on it.
- **`DYNAMIC`** — a PL/SQL API call made conditionally (via conditional compilation or similar), only used if the target component happens to be installed. Deployment does not fail if a `DYNAMIC` dependency is absent.

## `[<component>Versions]` and `[<component>Upgrade]`

Mandatory (`Versions`). Together these two sections define the component's full version history and how to upgrade between consecutive versions — this is the part that matters most when planning an update, since it's what the installer walks to get from the currently-installed version to current.

```ini
[<component>Versions]
x.y.z=VersionDescription

[<component>Upgrade]
x.y.z=x1y1z1.upg
```

`[<component>Upgrade]` entry `x.y.z=x1y1z1.upg` means: to upgrade **from** `x.y.z` **to** the next version in the list, run `x1y1z1.upg`. During deployment, all the individual `.upg` scripts are merged into a single `<component>.upg` file with a version marker between each upgrade sequence.

**Rules:**

- Versions must be listed in chronological order — the last entry is always the current version.
- Every version-to-next-version step must have an upgrade entry, even if it's a no-op (empty value). Because of this, `[<component>Upgrade]` always has exactly one fewer entry than `[<component>Versions]` — there's no upgrade step *away from* the current (last) version.

## `[<component>PreUpgrade]`

Defines a file to execute for a specific version, before *any* component has been upgraded — useful for pre-upgrade statements that need packages still present in the pre-upgrade database.

```ini
[<component>PreUpgrade]
File1=appsrvpre.sql {x.x.x;y.y.y}
```

The file name and version list must be separated by a single space — no tabs. Versions in `{}` are semicolon-separated. If no version/wildcard is given, the wildcard `Always` is implied. See [wildcards](#postinstallationdata-postinstallationdataseq-and-postinstallationobject) below.

## `[PostInstallationData]`, `[PostInstallationDataSeq]`, and `[PostInstallationObject]`

All three run after every component has been deployed to the database. Use them when a script needs to touch data/objects that may not exist yet at merge time — e.g. Oracle objects defined by another component.

| Section | When it runs | Execution |
|---|---|---|
| `[PostInstallationObject]` | After all components are deployed | Parallel with other components (dependency order preserved) |
| `[PostInstallationData]` | After `PostInstallationObject`, and after runtime caches are refreshed | Parallel with other components (dependency order preserved) — better performance |
| `[PostInstallationDataSeq]` | Immediately after all `PostInstallationData` files | **Sequential**, not parallel — use only when files from different components risk locking the same data |

```ini
[PostInstallationData]
File1=PostInstallationDataFile1.sql {Always}
File2=PostInstallationDataFile2.sql {x.x.x;y.y.y}
File3=PostInstallationDataFile3.sql {AnyUpgrade}
```

Each entry's `{}` restricts which upgrade-from version(s) trigger the file. As with `PreUpgrade`, the file name and version list are space-separated (no tabs), and the line must start with `File`. Three wildcards are available instead of literal versions:

| Wildcard | Meaning |
|---|---|
| `FreshInstall` | Runs only when the component is installed for the first time. |
| `AnyUpgrade` | Runs when the component is lifted from one core version to another. |
| `Always` | Runs in fresh installs, upgrades, and deliveries (deliveries only when the file is actually touched/included). |

If no version or wildcard is given at all, the file behaves as `Always`.

## `[CapMergeFiles]` and `[CapMergeFilesLast]`

Files of the same type are normally merged alphabetically. Use these sections when merge order matters because files depend on each other.

```ini
[CapMergeFiles]
File1=ObjectProperty.apy

[CapMergeFilesLast]
File1=XlrMvUtil.apy
File2=XlrDimSourceHintItem.apy
```

`[CapMergeFiles]` only needs to list files that must come *before* others — anything unlisted (or the whole section, if absent) merges alphabetically as usual. `[CapMergeFilesLast]` lists files that must merge last, in the order given — in the example, `File2` is deployed after `File1`.

## `[IgnoreDeployFiles]`

Excludes files from the merge process entirely — typically used when a file is intentionally being emptied out in a patch.

```ini
[IgnoreDeployFiles]
File1=fileName.cre
File2=*.sql
```

Wildcards `?` and `*` are supported. Entry names just need to be unique.

## `[ObsoleteFilesRemove]`

> [!warning] Not in the official IFS reference
> This section doesn't appear anywhere in the official `deploy.ini` documentation, but it's real and reasonably common — present in **40 of the 239** components surveyed in a local core checkout (more common than `[PostInstallationObject]` at 28, `[PreComponent]` at 14, or `[IgnoreDeployFiles]` at 9).

Lists files to be **actively removed/deleted** from a target install — as opposed to `[IgnoreDeployFiles]`, which only excludes files from the merge step but doesn't delete anything. Used to clean up artifacts (e.g. renamed/replaced Lobby elements and datasources) left behind by an older version. Entries use full relative paths, not bare filenames:

```ini
[ObsoleteFilesRemove]
File1=\server\lobby\datasources\TE Last 5 Active Users - 78f98f5f-3739-4965-8330-73aac72ed38a.datasource.xml
File2=\server\lobby\elements\TE License Consumption - e15b31ce-b513-4b20-a780-a81fd4341a77.element.xml
```

(Real excerpt from `fndadm/deploy.ini`, which had the largest `[ObsoleteFilesRemove]` list surveyed, at 12 entries — all removing orphaned Lobby elements/datasources.)

## `[PreComponent]`

Names the component this one succeeds — used when a component is renamed or split.

```ini
[PreComponent]
name=fndser
```

> [!info] Version-numbering convention
> When starting a new component with a `[PreComponent]`, continue the version sequence from the preceding component rather than restarting at `1.0.0`. E.g. if the preceding component `fndser` ended at `3.0.0`, the new component `fndbas` should start at `4.0.0`.

## `[BuildHomeFiles]`

Files copied to the root of `<build_home>`.

```ini
[BuildHomeFiles]
File1=Setup.exe
```

## `[Bootstrap]`

Files deployed before *any* component — in the `BootStrapSection` of `install.tem`.

```ini
[Bootstrap]
File1=Installation.api
File2=Installation.apy
File3=Bootstrap.cre
```

> [!warning] Platform components only
> This section should only be used by IFS Cloud platform components.

## `[Layering]`

Restricts Layered Application Architecture (LAA) customization at the component level.

```ini
[Layering]
Implementation=Final
```

Marking a component `Final` blocks customization of any model inside it, blocks adding new customization models to it, and restricts code generation for any customized models within it.

---

## Sections Observed in Practice but Not in the Official Reference

Beyond `[ObsoleteFilesRemove]` (documented [above](#obsoletefilesremove)), a full survey of 239 real `deploy.ini` files turned up a handful of rare or one-off sections worth knowing about if you spot them during the update — none of these are part of the documented grammar, and most look like legacy or accidental artifacts rather than something to intentionally author:

| Section | Seen in | What it looks like |
|---|---|---|
| `[ServerDeployFiles]` | 2 components (`empsrv`, `nainfe`) | Empty header, no entries in either occurrence — presumed legacy/reserved, not currently functional. |
| `[RuntimeDeployFiles]` | 1 component (`rental`) | Also empty. Other components' `[Comments]` history explicitly logs *removing* this section (e.g. `"Removed section [RuntimeDeployFiles]"`), confirming it's deprecated. |
| `[ShortName]` | 1 component (`inttst`) | `Name=Inttst` — duplicates the value already in `[Component]`. Looks like a one-off copy/paste artifact, not a real mechanism. |
| `[CapMergeFileLast]` (singular "File") | 1 component (`pmrp`) | A misspelling of `[CapMergeFilesLast]`. Since section names are matched literally, this is very likely a silent no-op in that component's `deploy.ini` — worth flagging if you ever touch `pmrp`. |
| `[<ComponentName>InstallDialog]` (e.g. `[TimcloInstallDialog]`) | 1 component (`timclo`) | Empty, component-specific custom section — not a general pattern seen elsewhere. |

Also notable: `[<component>Defines]` **is** documented in the official reference, but it was not found in any of the 239 real `deploy.ini` files surveyed — treat it as rare-to-nonexistent in current core code rather than a commonly-used section.

---

## Real Example

Trimmed excerpts from a real production `deploy.ini` for the `SHPORD` (Shop Order) component, found at `ifs-marble-language-reference/ifs-example/shpord/deploy.ini` in this checkout:

```ini
[Component]
Name=Shpord

[ComponentName]
Description=Shop Order

[ComponentType]
Type=Base

[Connections]
Mfgstd=STATIC
Callc=DYNAMIC
Cbsint=DYNAMIC
...
Mso=DYNAMIC

[ShpordVersions]
12.0.0=Shop Order version 12.0.0
12.1.0-GET=Shop Order version 12.1.0-GET
12.1.0=Shop Order version 12.1.0
13.0.0-GET=Shop Order version 13.0.0-GET
13.0.0=Shop Order version 13.0.0
21.1.0=Shop Order IFS Cloud 21.1.0
21.2.0=Shop Order IFS Cloud 21.2.0
22.1.0=Shop Order IFS Cloud 22.1.0
22.2.0=Shop Order IFS Cloud 22.2.0
23.1.0=Shop Order IFS Cloud 23.1.0
23.2.0=Shop Order IFS Cloud 23.2.0

[ShpordUpgrade]
12.0.0=1210.upg
12.1.0-GET=
12.1.0=1300.upg
13.0.0-GET=GET_TO_CLOUD.upg
13.0.0=2110.upg
21.1.0=2120.upg
21.2.0=2210.upg
22.1.0=2220.upg
22.2.0=2310.upg
23.1.0=2320.upg

[CapMergeFiles]
File1=Report.cre
File2=ShopOrdUtil.api

[CapMergeFilesLast]
File1=ShpordInfoSourceDefaultFolder.ins
File2=ShpordMvRefreshCategoryDetails.ins

[PostInstallationData]
File1=ShpordTimman.ins                                  {Always}
File8=POST_SHPORD_UpgRefreshMvCategories.sql            {12.0.0; 12.1.0; 12.1.0-GET}
File28=POST_SHPORD_UpdateSORevisedDueDate.sql           {12.0.0; 12.1.0; 12.1.0-GET; 13.0.0; 13.0.0-GET; 21.1.0}
```

A few things this real file confirms about the rules above:

- `12.1.0-GET=` in `[ShpordUpgrade]` is a real no-op upgrade entry — the version-to-next-version step existed but needed no script.
- `[ShpordUpgrade]` has 10 entries against 11 versions in `[ShpordVersions]` — exactly one fewer, as the rule requires.
- `[PostInstallationData]` entries mix `{Always}` with explicit multi-version lists like `{12.0.0; 12.1.0; 12.1.0-GET; 13.0.0; 13.0.0-GET; 21.1.0}` — files only fire for the upgrade-from versions they're relevant to, so an old data-fix script naturally stops running once every environment has upgraded past its listed versions.

The `-GET` suffix seen on some versions (`12.1.0-GET`, `13.0.0-GET`) isn't a special keyword the grammar treats differently — it's just a version string like any other. Across the wider checkout it consistently pairs with an upgrade script named `GET_TO_CLOUD.upg`, which points to it being a naming convention IFS used to mark the cohort of customers migrating from the older on-premise IFS Applications line into IFS Cloud during that transition, rather than anything with functional meaning in `deploy.ini` itself.

---

## See Also

- [[README|Deployment and Installation Reference]] — section index
- [[Entity (Base Server)]] — the Logical Units a component's `[Connections]` and version history ultimately govern the deployment of
