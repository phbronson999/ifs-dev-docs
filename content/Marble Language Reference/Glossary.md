---
title: Glossary
tags:
  - ifs-marble
  - ifs-marble/reference
aliases:
  - Marble glossary
  - IFS terms
  - definitions
related:
  - "[[Thinking in Marble]]"
  - "[[Client File Structure]]"
  - "[[Projection File Structure]]"
---

# Glossary

Definitions for every term used across this vault. If a word in a note isn't making sense, look here first.

Terms are marked with the layer they primarily belong to: `[Client]` `[Projection]` `[Base Server]` `[Cross-cutting]`.

---

## A

**Action** `[Projection]`
A server-side operation that modifies data or triggers a process. Declared in the projection with `action <Name>(...parameters...)`. Called from the client with `call <Name>(...)` inside an `execute` block. Has side effects — compare to a POST/PUT/DELETE in REST, or a mutation in GraphQL. See [[Action]].

**Array** `[Projection]`
A child collection declared on a projection entity. Enables a parent entity to carry a set of child records (e.g., an Order entity with an array of Order Lines). The array is what makes `list Child(ArrayName) bind Parent` work in the client. See [[References and Arrays]].

**Assistant** `[Client]`
A multi-step wizard screen. Each step is a named block with its own group and optional list. The user progresses through steps linearly. Used for complex data entry that is too long or context-dependent for a single form. Backed by a [[Virtual Entity]] in the projection. See [[Assistant]].

**Attribute** `[Projection]`
A single named data field on an entity. Equivalent to a column in a SQL table. Every `field` and `lov` in the client maps back to an attribute (or a reference) on the entity in the projection. Attributes have a type, and optionally `editable`, `insertable`, `updatable`, `required`, and `label` modifiers. See [[Attribute Modifiers]].

**Attribute Control Flags** `[Base Server]`
A compact notation on base server entities that encodes multiple boolean properties in a single string (e.g., `AMIUL`, `KMI-L`). Each letter position means something: A=Allow Null, M=Mandatory, I=Insertable, U=Updatable, L=LOV. See [[Attribute Control Flags]].

**Aurena** `[Cross-cutting]`
The IFS Cloud web framework — the browser-side rendering engine that reads Marble `.client` files and produces the actual Aurena UI. When IFS documentation says "Aurena," it means the web UI layer. Marble is the language you write; Aurena is the framework that runs it.

---

## B

**Badge** `[Client]`
A colored chip control displaying a field value. Pairs with [[Emphasis]] to color the chip based on the value. Used in lists for status, category, and priority columns. The visual equivalent of a Bootstrap badge or Material UI Chip. See [[Display Controls]].

**Bind** `[Client]`
The mechanism that links a child list to the currently-selected row in a parent list. Declared on the page: `list ChildList(ArrayName) bind ParentList`. The child list re-queries every time the parent selection changes. Requires an [[Array]] declaration in the projection entity. See [[List]].

**Boolean** `[Client]`
A display control that renders a boolean attribute as a styled toggle with custom true/false labels and optional emphasis colors. Use `boolean` instead of `field` when you want colored "Active/Inactive" text rather than a plain "true/false" cell. See [[Display Controls]].

---

## C

**Card** `[Client]`
A template that defines how a single record is rendered in Card View, Avatar View, Calendar event popups, and Tree Diagram node popups. A card is declared separately and then attached to a list or other component. The card determines which fields appear and in what layout — `fieldranking` controls priority. See [[Card and Sheet]].

**Client** `[Client]`
(1) Short for `.client` file — the Marble source file describing an Aurena screen. Contains page declarations, lists, groups, dialogs, assistants, navigator entries, and commands. (2) The UI presentation layer of the IFS stack. Always consumes a projection. See [[Client File Structure]].

**Command** `[Client]`
An event handler that renders as an action button in the Aurena UI. Declared with `command <Name> for <Entity>`. Its `execute` block contains the client-side script (call, set, if, navigate, exit). Commands appear in list row context menus, group toolbars, dialog footers, and assistant step footers. See [[Commands and Expressions]].

**Component** `[Base Server]`
The IFS module that owns a set of Logical Units. Examples: `SHPORD` (Shop Orders), `CONFIG` (Configurator), `MPCCOM` (Manufacturing Planning). Every file declares its component in the header. Think of it as a namespace or package in other languages.

**Computed Field** `[Client]`
A client-side-only display field calculated from other attribute values via string interpolation or aggregate functions. Not stored in the database. Cannot be used as a filter target. Use when you need to combine or format values for display without changing the data model. See [[Display Controls]].

**Core** `[Cross-cutting]`
The base layer containing IFS-supplied code. Never edit Core files directly — customizations go in the `Cust` layer using `@Override`. Core files are replaced during IFS upgrades.

**Currency / Measure** `[Client]`
A composite input control pairing a numeric value with a unit (currency code or unit of measure). The value and unit are separate attributes in the entity. The unit lookup uses an entityset from a selector. See [[Input Controls]].

**Cust** `[Cross-cutting]`
The customer customization layer. Files in the `Cust` layer can extend or replace Core functionality using `@Override` without touching the original files. Cust-layer changes survive IFS upgrades because the framework merges layers rather than replacing them.

---

## D

**Dataview** `[Cross-cutting]`
An Obsidian plugin that renders live query results as tables inside notes. Used in this vault's README files to auto-generate indexes of notes by tag. Queries use `FROM #tag` syntax. Not an IFS concept — specific to this documentation vault.

**Dialog** `[Client]`
A modal overlay screen. Declared with `dialog <Name>` in the client. Backed by a [[Virtual Entity]] or [[Structure]] in the projection. Opened by a command using `assistant` or `dialog` syntax. Used for data entry that doesn't warrant a full page. See [[Dialog]].

---

## E

**Editable Expression** `[Cross-cutting]`
A boolean expression placed on a field, LOV, or control — `editable = [SomeAttr = "Open"]` — that controls whether the control accepts user input. The client-side expression can only make a field *more restrictive* than the projection allows; it cannot override a projection-level `editable = [false]`.

**Emphasis** `[Client]`
The property that applies color to visual controls. Takes the form `emphasis <ColorConstant> = [<boolean expression>]`. The first matching rule wins. Used by badge, boolean, state indicator, charts, timeline, and many other controls. See [[Emphasis and Colors]].

**Entity** `[Projection]`
The core data model construct in a projection. Declares which attributes, references, arrays, and operations the screen can work with. Backed by a real database table or view (via the Base Server entity). One entity in the projection maps to one Logical Unit in the base server. See [[Entity]].

**Entity (Base Server)** `[Base Server]`
The design-time XML definition of a Logical Unit. Declares attributes, attribute control flags, and relationships. Developer Studio generates the PL/SQL package skeleton and database view from this file. See [[Entity (Base Server)]].

**Entityset** `[Projection]`
An exposed query endpoint that a client page binds to with `using <EntitysetName>`. Think of it as the "public API" for reading a set of entity records. Declared in the projection with `entityset <Name> for <Entity>`. Every page must bind to an entityset. See [[Entityset]].

**Enumeration** `[Projection]` `[Base Server]`
A fixed set of named values. In the projection, `enumeration <Name>` declares the valid values for an attribute of that type. In the base server, `.enumeration` files define code sets. The client renders enumeration attributes as dropdowns or radio groups automatically. See [[Enumeration]].

**ETag** `[Cross-cutting]`
A concurrency token stored on every record. The framework uses it to detect concurrent edits. In client expressions, `ETag = null` means the record is new and hasn't been saved yet — a common pattern for `editable = [ETag = null]` to allow editing only on creation.

**Execute Block** `[Client]`
The scripting body inside a command: `execute { call ...; set ...; if [...] { ... }; navigate ...; exit ...; }`. It is not a general-purpose programming language — it is a constrained set of instructions for calling server operations and updating local field values. See [[Commands and Expressions]].

---

## F

**Field** `[Client]`
A declaration inside a list or group that renders one attribute as a column or form field. The most basic data display unit in the client. Supports `size`, `label`, `multiline`, `editable`, `visible`, and `validate command`. See [[Fields and LOV]].

**Fieldranking** `[Client]`
A comma-separated list of attributes on a list or card that declares their priority for display when screen space is limited. Lower-ranked attributes hide first on narrow viewports. Equivalent to a priority queue for column visibility. See [[Card and Sheet]] and [[List]].

**Fragment** `[Cross-cutting]`
A `.fragment` file containing both a `CLIENT FRAGMENTS` section and a `PROJECTION FRAGMENTS` section. The primary reuse mechanism in Marble. Selector fragments (for LOV dropdowns) are the most common type. Included in both the `.client` and `.projection` using `include fragment <Name>;`. See [[Fragment]].

**Function** `[Projection]`
A server-side read operation that returns a value without side effects. Declared in the projection with `function <Name>(...) returns <Type>`. Called from the client with `call <Name>(...) into <Variable>`. Compare to a GET endpoint in REST, or a query in GraphQL. See [[Function]].

---

## G

**Group** `[Client]`
A form panel — a labeled container of `field` and `lov` declarations that renders as a single-record form rather than a grid. The primary component for displaying and editing one record at a time. Equivalent to a `<form>` element in HTML, or a form component in React. See [[Group]].

---

## I

**InitCommand** `[Client]`
A conventional name for a command on a virtual entity that runs when a dialog or assistant first opens. It pre-populates fields using `call` and `set` statements. Not a reserved keyword — it's a naming convention. See [[Dialog]].

---

## L

**Label** `[Cross-cutting]`
The display name of an attribute, control, or page. Defined in the projection on the attribute (the default), or overridden in the client on a field/lov declaration. The projection's label is the single source of truth; the client label is a local override for a specific context.

**Layer** `[Cross-cutting]`
A precedence level that controls which version of a file "wins" when multiple layers define the same construct. `Core` = IFS base code. `Cust` = customer customizations. `Test` = test/sandbox code. Cust overrides Core; Test overrides everything. Declared at the top of every file: `layer <LayerName>;`.

**List** `[Client]`
A grid component that displays multiple records from an entity or query. Columns are declared as `field` and `lov`. Supports `editmode`, `orderby`, `filter`, `summary`, `card`, `command`, and many other properties. The workhorse of IFS list pages. See [[List]].

**Logical Unit (LU)** `[Base Server]`
The fundamental building block of the base server layer. An LU is a business entity (e.g., SalesOrder, InventoryPart). Its PL/SQL API package is named `<LU_Name>_API`. Its database view is named `<LU_NAME>` (uppercase). Every projection entity maps back to an LU.

**LOV (List of Values)** `[Client]`
A dropdown lookup control linked to a [[Reference]] on the entity. Declared with `lov <RefName> with <SelectorName>`. Shows a code field and optionally a description. The most common way to enter foreign key values in IFS forms. See [[Fields and LOV]].

---

## M

**Marble** `[Cross-cutting]`
The informal name for the declarative language used to write IFS Cloud UI and API layers. Also seen as PLVC (PL/VC) or MTG in tooling and older documentation. The official term in recent IFS versions is "IFS Cloud development framework." This vault uses "Marble" throughout for consistency.

---

## N

**Navigator** `[Client]`
The application menu/sidebar entry that registers a page in the IFS Cloud navigation tree. Declared with `navigator { entry <Name> ... { label = "..."; page <PageName>; } }`. Without a navigator entry, a page can only be reached by programmatic navigation. See [[Navigator]].

---

## O

**Objstate** `[Cross-cutting]`
The conventional attribute name for the current workflow state of a state-machine entity. Almost every IFS business entity that has a lifecycle (Open → Released → Closed, etc.) uses `Objstate` as the attribute name. Use [[Emphasis and Colors|state color constants]] (`StateOpen`, `StateReleased`, etc.) when displaying `Objstate` in a badge or state indicator.

**Override (`@Override`)** `[Base Server]`
A PL/SQL annotation declaring that a method in a `Cust`-layer file replaces or extends the same method in the `Core`-layer file. The base server framework merges layers at build time — `@Override` is the hook that says "use my version." See [[PL-SQL Annotations]].

---

## P

**Page** `[Client]`
The top-level navigable screen. Declared with `page <Name> using <EntitysetName>`. Contains layout components (lists, groups, arrange, tabsets). The client file can contain multiple pages. Convention: name the main list page `List` and the detail page `Form`. See [[Pages]].

**Projection** `[Projection]`
(1) The `.projection` file — the server-side data contract for a client. Declares entitysets, entities, virtuals, actions, functions, and enumerations. (2) The API/mapping layer of the IFS stack. A client file declares `projection <Name>;` to consume it. See [[Projection File Structure]].

---

## Q

**Query** `[Projection]`
A read-only entity backed by a view or a subset of a full entity. Used when you need to display data but not edit it. No `create`, `update`, or `delete` operations. Declared with `query <Name>` in the projection. See [[Query]].

---

## R

**Reference** `[Projection]`
A foreign key relationship from one entity to another. Declared with `reference <Name>(<LocalKey>) to <TargetEntity>(<TargetKey>)`. The `lov` control in the client uses references to provide dropdown selection. See [[References and Arrays]].

---

## S

**Selector** `[Client]` `[Projection]`
A UI component (client side) + entityset (projection side) packaged together in a [[Fragment]] to provide a LOV dropdown for a specific entity. Convention: named `<EntityName>LovSelector`. Any client that needs a LOV for that entity just includes the fragment. See [[Fragment]] and [[Selector and Search Context]].

**Service** `[Cross-cutting]`
The `.plsvc` (PL/VC Service) file containing Oracle PL/SQL implementations of the actions and functions declared in the projection. Named to match the projection file. The service layer is the bridge between the declarative Marble API and the imperative database logic.

**Sheet** `[Client]`
An overlay sub-panel attached to a card that appears conditionally based on a `visibility` expression. Used to show additional record details within a card without navigating to a new page. See [[Card and Sheet]].

**State Indicator** `[Client]`
A control that renders a workflow state as a colored bubble. Uses `emphasis` with [[Emphasis and Colors|state color constants]] to color by state value. More prominent than a badge — typically placed in the page header group to give immediate status context. See [[Display Controls]].

**Structure** `[Projection]`
An inline data shape used in fragments. Unlike a [[Virtual Entity]], a structure has no CRUD operations and no individual record lifecycle — it is a pure data carrier. Used to pass parameter sets to dialogs and assistants. See [[Structure]].

---

## V

**Validate Command** `[Client]`
An inline command on a `field` or `lov` that fires when the user leaves the field (focus-out). Used to trigger server recalculations when a field value changes. Does not wait for the user to save. Declared inside the field/lov block with `validate command { execute { ... } }`. See [[Fields and LOV]].

**Virtual Entity** `[Projection]`
A projection entity that is not backed by a database table. Used for dialogs and assistants — it holds the temporary working data for the interaction. Actions on a virtual entity perform real operations (e.g., submitting a clocking entry) but the virtual itself doesn't persist. See [[Virtual]].

**Visible Expression** `[Cross-cutting]`
A boolean expression on any client control — `visible = [SomeAttr != null]` — that hides the control entirely when false (vs. `editable` which keeps it visible but read-only). Evaluated against the current record's attribute values.

---

## W

**Wikilink** `[Cross-cutting]`
Obsidian's internal link syntax: `[[Note Name]]`. Used throughout this vault to link related notes. Obsidian resolves wikilinks by file name, not file path — links survive folder moves. Not an IFS concept; specific to this documentation vault.

---

## Quick Reference: Client Term Equivalents

| Marble term | React equivalent | SQL/REST equivalent |
|-------------|-----------------|---------------------|
| `projection` | GraphQL schema | REST API spec |
| `entity` | data type / model | database table |
| `entityset` | data fetching query | GET /resource endpoint |
| `action` | mutation function | POST/PUT/DELETE endpoint |
| `function` | selector / derived data | GET /resource/compute |
| `page` | route component | — |
| `list` | `<Table>` / `<DataGrid>` | SELECT result |
| `group` | `<Form>` | single-row SELECT |
| `dialog` | `<Modal>` | — |
| `assistant` | `<Stepper>` / wizard | — |
| `command` | `onClick` handler | — |
| `validate command` | `onChange` handler | — |
| `lov` | `<Select>` / dropdown | FK lookup |
| `reference` | foreign key prop | FOREIGN KEY constraint |
| `array` | child collection prop | one-to-many JOIN |
| `fragment` | shared component | — |
| `emphasis` | `color` / `variant` prop | — |
| `ETag = null` | `isNew` / `!record.id` | WHERE id IS NULL |
| `Objstate` | `status` field | state machine column |
