---
title: Entity (Base Server)
tags:
  - ifs-base-server
  - ifs-base-server/model
aliases:
  - entity definition
  - entity model
  - Logical Unit
  - LU
related:
  - "[[Attribute Control Flags]]"
  - "[[Enumeration (Base Server)]]"
  - "[[Utility (Base Server)]]"
  - "[[Overview Diagram]]"
  - "[[Entity (Base Server)]]"
---

# Entity (Base Server)

An ==entity== is the fundamental business object in IFS Cloud. It maps to an Oracle database table and generates:
- An Oracle **view** (`<ENTITY_NAME>` in uppercase snake_case)
- A PL/SQL **API package** (`<EntityName>_API`)
- A PL/SQL **implementation package** body (`<EntityName>_SVC` in IFS Cloud generation)

The entity model file (`.entity`) is edited in IFS Developer Studio. It is displayed in a text-like editor but **stored as XML**. Do not edit the file outside the IDE.

> [!abstract] Syntax Skeleton
> ```marble
> [@Final]
> entityname  <EntityName>;
> component   <COMPONENT>;
> [layer      <Ext|Cust>;]
> [basedOn    <OtherEntity>;]
> [description "<text>";]
> [validity   <ValidityMethod>;]
>
> [codegenproperties {
>    <Property> "<value>";
> }]
>
> attributes {
>    key        <Name>  <Datatype>[(<size>)]  <Flags>;
>    [parentkey <Name>  <Datatype>[(<size>)]  <Flags>;]
>    public     <Name>  <Datatype>[(<size>)]  <Flags>;
>    private    <Name>  <Datatype>[(<size>)]  <Flags>;
> }
>
> [associations {
>    parent    <RefName>  <ToEntity>(<FK_Columns>)[/<DeleteBehaviour>] { }
>    reference <RefName>  <ToEntity>(<FK_Columns>)[/<DeleteBehaviour>] { }
> }]
>
> [states {
>    startstate { always transitionTo <FirstState>; }
>    state <StateName> {
>       on <Event> transitionTo <NextState>;
>    }
>    endstate <StateName> { }
> }]
> ```

---

## Header Keywords

| Keyword       | Required  | Description                                                                                                       |
| ------------- | --------- | ----------------------------------------------------------------------------------------------------------------- |
| `@Final`      | No        | Prevents other entities from extending this one. Place before `entityname`.                                       |
| `entityname`  | Yes       | The LU name. Must match the filename without `.entity`. PascalCase.                                               |
| `component`   | Yes       | The IFS component that owns this LU (e.g., `SHPORD`, `CONFIG`).                                                   |
| `layer`       | Cust only | `Ext` or `Cust` for customization files. Omit for Core.                                                           |
| `basedOn`     | No        | Indicates this entity inherits conceptually from another. Limited runtime effect — mostly a documentation marker. |
| `extends`     | No        | Extends another entity as a parent in the hierarchy.                                                              |
| `permits`     | No        | Declares that another entity is permitted as a child.                                                             |
| `description` | No        | Appears in Business Object tooling. No runtime effect.                                                            |
| `validity`    | No        | Controls how record validity is determined (e.g., for date-range validity).                                       |

---

## `attributes` Block

Every attribute in the entity maps to a column in the generated view and table.

```marble
attributes {
   key        ActorId    NUMBER(10)   KMI-L;
   parentkey  CountryCode TEXT(2)     KMI-L;
   public     FirstName  TEXT(100)    AMIUL;
   public     LastName   TEXT(100)    A-IUL;
   public     BirthDate  DATE         A-IUL;
   public     IsActive   TEXT(1)      A;
   private    InternalRef NUMBER(10)  --I--;
}
```

### Attribute Visibility

| Keyword | Generated as | Description |
|---------|-------------|-------------|
| `key` | Primary key column | Must be unique and non-null. Usually a `NUMBER(10)` sequence. |
| `parentkey` | Part of a composite key from a parent entity | Key column that comes from a parent association. |
| `public` | Regular column, exposed via the API | The most common type. Accessible from projections. |
| `private` | Column that exists but is not exposed by default | Internal use; requires explicit API exposure. |

### Attribute Data Types

| Type | Oracle equivalent | Usage |
|------|------------------|-------|
| `TEXT(n)` | `VARCHAR2(n)` | Most common. Use for all string data. |
| `NUMBER(n)` or `NUMBER(n,d)` | `NUMBER(n)` or `NUMBER(n,d)` | Integer or decimal. |
| `DATE` | `DATE` | Date without time. IFS stores times in DATE columns despite the type name. |
| `BOOLEAN` | `VARCHAR2(5)` | Stored as `'TRUE'` or `'FALSE'` strings. |
| `BINARY` | `BLOB` | Binary large object. |
| `CLOB` | `CLOB` | Character large object for long text. |

### Attribute Control Flags

The flag string (e.g., `AMIUL`, `KMI-L`) controls read/write behaviour. See [[Attribute Control Flags]] for the full reference.

| Common pattern | Meaning |
|----------------|---------|
| `KMI-L` | Key — Mandatory, Insert, not Updateable, LOV |
| `AMIUL` | Alter — Mandatory, Insert, Update, LOV (fully editable required field) |
| `A-IUL` | Alter — optional, Insert, Update, LOV (fully editable optional field) |
| `A----` | Alter (display only — set programmatically) |
| `--I--` | Insert only — never displayed or updated |

---

## `associations` Block

Associations define foreign key relationships to other entities.

```marble
associations {
   parent    CountryRef     IsoCountry(CountryCode)/CASCADE          { }
   reference AgencyRef      Agency(AgencyId)/NOCHECK                 { }
   reference DirectorRef    Actor(ActorId)/CUSTOM=(Validate_Dir__,)  { }
   reference GenreRef       MovieGenre(GenreCode)/CUSTOMLIST=(Check_Genre,Remove_Genre) { }
}
```

### Association Types

| Keyword | Description |
|---------|-------------|
| `parent` | Mandatory FK to a parent entity. Cascade behaviour controls what happens when the parent is deleted. |
| `reference` | Optional FK to another entity. Used for lookups and LOV dropdowns in the projection/client layer. |
| `viewreference` | Reference to a view rather than a full entity. |

### Delete Behaviour Suffixes

| Suffix | Description |
|--------|-------------|
| `/CASCADE` | Deletes child records when the referenced parent is deleted. |
| `/NOCHECK` | No referential integrity check. The FK is advisory only. |
| `/RESTRICT` | Prevents deletion of the parent if children exist. |
| `/CUSTOM=(ProcName,)` | Calls a custom PL/SQL procedure to validate the reference. |
| `/CUSTOMLIST=(CheckProc,RemoveProc)` | Calls separate procedures to check and remove. |

---

## `states` Block

The state machine controls the lifecycle of the entity's records.

```marble
states {
   startstate {
      always transitionTo Active;        -- first created record always goes to Active
   }

   state Active {
      on Suspend transitionTo Suspended;
      on Retire  transitionTo Retired;
   }

   state Suspended {
      on Resume  transitionTo Active;
      on Retire  transitionTo Retired;
   }

   superstate Released {                 -- superstate wraps multiple sub-states
      substate Printed  { }
      substate Invoiced { }
      on Cancel transitionTo Cancelled;  -- transition applies to all sub-states
   }

   endstate Retired  { }                 -- end states cannot be left
   endstate Cancelled { }
}
```

### State Keywords

| Keyword | Description |
|---------|-------------|
| `startstate` | The pseudo-state at creation time. Use `always transitionTo <State>` to set the initial state. |
| `state` | A regular state. Uses `on <Event> transitionTo <State>` for transitions. |
| `superstate` | A parent state that contains `substate` blocks. Transitions on the superstate apply to all sub-states. |
| `substate` | A state nested inside a `superstate`. |
| `endstate` | A terminal state. Records in an end state cannot be transitioned further. |

> [!tip] State Field in the Database
> The state is stored as a `VARCHAR2` column named `ROWSTATE` in the database table. The PL/SQL API generates `Finite_State_Machine___` and transition procedures automatically from the model.

---

## `codegenproperties` Block

An optional block that passes hints to the code generator.

```marble
codegenproperties {
   DbObjversionStyle "number";    -- use a number for optimistic locking instead of string
   TitleText "Actor Management";  -- display title for this entity
}
```

---

## Example — Complete Entity

```marble
entityname  Movie;
component   APPS8;
layer       Core;
description "Motion picture entity";

attributes {
   key       MovieId        NUMBER(10)    KMI-L;
   public    Title          TEXT(200)     AMIUL;
   public    ReleaseDate    DATE          A-IUL;
   public    DirectorId     NUMBER(10)    A;
   public    Duration       NUMBER(5)     A;
   public    Budget         NUMBER(15,2)  A;
   public    BoxOffice      NUMBER(15,2)  A;
   public    Synopsis       TEXT(2000)    A;
   public    IsReleased     TEXT(1)       A;
}

associations {
   parent    StudioRef     Studio(StudioId)/CASCADE                          { }
   reference DirectorRef   Actor(ActorId)/CUSTOM=(Validate_Director__,)      { }
   reference GenreRef      MovieGenre(GenreCode)/CUSTOMLIST=(Check_Genre,Remove_Genre) { }
}

states {
   startstate { always transitionTo PreProduction; }
   state PreProduction { on StartProduction transitionTo InProduction; }
   state InProduction  { on Finish transitionTo PostProduction; }
   state PostProduction {
      on Approve transitionTo Released;
      on Reject  transitionTo InProduction;
   }
   endstate Released  { }
   endstate Archived  { }
}
```

---

## What Gets Generated

When you build the entity, Developer Studio generates:

| Generated file | Content |
|---------------|---------|
| `<EntityName>.plsql` | The `<EntityName>_API` package specification and skeleton body |
| `<ENTITY_NAME>.views` | The `<ENTITY_NAME>` Oracle view definition |
| `<EntityName>.storage` | The `<ENTITY_NAME_TAB>` table DDL |

You hand-code the business logic inside the generated `.plsql` skeleton. The generated code establishes the contract; your code implements it.

---

## Patterns & Tips

> [!tip] Key Attributes Are Always `NUMBER(10)` with a Sequence
> By IFS convention, every entity has a single `key ActorId NUMBER(10) KMI-L;` backed by an Oracle sequence named `<ENTITY_NAME>_SEQ`. Composite natural keys are expressed via `parentkey` (for inherited FK keys) plus the local key column.

> [!tip] `TEXT(1)` for Boolean-like Flags
> IFS stores boolean flags as `TEXT(1)` with values `'Y'`/`'N'` or `TEXT(5)` as `'TRUE'`/`'FALSE'`. The `BOOLEAN` data type in the model generates `VARCHAR2(5)` in the database.

> [!warning] Do Not Edit `.entity` Files Outside the IDE
> The file is XML. Opening it in a text editor shows angle-bracket XML, not the clean text-like syntax shown in the Developer Studio editor. Editing the raw XML will corrupt the model.

> [!note] Difference from Projection Entity
> The base server `entity` (`.entity` file) is the **source of truth** for the Logical Unit. The projection `entity` (inside a `.projection` file) is a **client-facing view** of that LU — it exposes only the attributes the Aurena UI needs and adds computed attributes, references for LOVs, and inline actions. They are different things with the same keyword.

---

## See Also

- [[Attribute Control Flags]] — full reference for AMIUL, KMI-L, A-IUL etc.
- [[Overview Diagram]] — visual diagram of entity relationships
- [[Enumeration (Base Server)]] — fixed-value types used as attribute types
- [[Entity (Base Server)]] (projection) — the Aurena/projection-layer counterpart
