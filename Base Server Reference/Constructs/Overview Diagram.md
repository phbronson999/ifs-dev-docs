---
title: Overview Diagram
tags:
  - ifs-base-server
  - ifs-base-server/model
aliases:
  - overview diagram
  - .overview file
  - entity relationship diagram
  - ERD
related:
  - "[[Entity (Base Server)]]"
  - "[[Utility (Base Server)]]"
---

# Overview Diagram

An ==overview diagram== is a visual canvas in IFS Developer Studio that shows entities and utilities as boxes connected by relationship lines. It is the closest thing IFS has to an entity-relationship diagram (ERD).

> [!warning] Not a Text File — Do Not Try to Edit It as Code
> The `.overview` file is **XML** displayed as a **visual diagram** — there is no text editor view at all. You interact with it entirely through the diagram canvas: drag-and-drop, right-click context menus, and a toolbar. If you open a `.overview` file in a text editor you will see raw XML position/relationship data that is not meant to be read or edited directly.

---

## What It Shows

Each node on the diagram represents either an **Entity** or a **Utility Logical Unit**. Lines between nodes represent:

| Line type | Meaning |
|-----------|---------|
| **Parent Association** | A mandatory parent-child FK. Arrow points from child to parent. The child entity has a `parent` association in its model. |
| **Reference** | An optional FK lookup. The entity has a `reference` association. |
| **BasedOn** | One entity declares `basedOn <OtherEntity>`. An inheritance/derivation marker. |
| **Dependency** | A utility depends on an entity (or vice versa). No FK — a documentation-only link. |

Entities with a **state machine** show a small state machine icon in their header box.

---

## Toolbar Actions

| Action | What it does |
|--------|-------------|
| Create New Entity | Draws a new blank entity node and creates the `.entity` file |
| Add Existing Entity | Places an entity that already exists in the project onto this diagram |
| Create Utility LU | Draws a new utility node and creates the `.utility` file |
| Add Existing Utility | Places an existing utility onto this diagram |
| Create Reference | Draw a Reference line between two entity nodes |
| Create Parent Association | Draw a Parent line between two entity nodes |
| Create Dependency | Draw a Dependency line (entity ↔ utility or entity ↔ entity) |
| Create Based-On Link | Draw a BasedOn line between two entities |
| Add Note | Add a text annotation box to the diagram |

---

## Right-Click Actions on an Entity Node

| Action | What it does |
|--------|-------------|
| **Open file** | Opens the `<EntityName>.entity` model in the text editor |
| **Go To Source** | Sub-menu listing generated source files (`.plsql`, `.views`, `.storage`) |
| **Add Entity Attribute** | Adds a new attribute to the entity directly from the diagram |
| **Show All Links** | Draws all associations this entity has with other entities on the canvas |
| **Show Entity Methods** | Fetches and displays the deployed database methods (requires a DB connection) |
| **Recreate from Database** | Re-reads the entity definition from the connected database |
| **Remove from diagram** | Removes this node from the diagram — **does not delete the model file** |
| **Delete File** | Deletes the `.entity` file — **permanent** |

---

## Missing Entities and Invalid Links

- **Red node**: The `.entity` file referenced by this diagram node no longer exists on disk. Either the file was deleted or is not in the local model cache.
- **Red line**: The association between two entities has incorrect or missing attribute mappings in the property sheet. Open the entity file and verify the FK column names match.

To clean up red nodes for permanently deleted entities: right-click → **Remove from diagram**.

---

## Multiple Diagrams per Component

A component can have multiple `.overview` files, each showing a different subset of its entities. This is common in large components where showing all entities on one diagram would be unreadable. For example, a shop order component might have:
- `ShopOrderMain.overview` — core order entities
- `ShopOrderCost.overview` — cost-related entities
- `ShopOrderReporting.overview` — reporting-specific views

An entity can appear on multiple diagrams. Adding it to a diagram does not copy or move it.

---

## Adding Entities from the Project Navigator

The fastest way to populate a diagram is drag-and-drop:
1. Open the `.overview` file to show the diagram canvas
2. In the project navigator, select the `.entity` files you want (hold Ctrl for multi-select)
3. Drag them onto the diagram canvas

The diagram will show each entity as a box. You can then use **Show All Links** to auto-draw all the associations between the entities you added.

---

## See Also

- [[Entity (Base Server)]] — the entity model that appears as nodes in the diagram
- [[Utility (Base Server)]] — utility nodes in the diagram
