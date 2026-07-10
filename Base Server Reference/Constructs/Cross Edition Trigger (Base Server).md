---
title: Cross Edition Trigger (Base Server)
tags:
  - ifs-base-server
  - ifs-base-server/source
aliases:
  - xetrigger
  - XETRIGGER
  - XET
  - Cross Edition Trigger
related:
  - "[[Entity (Base Server)]]"
  - "[[Sequence (Base Server)]]"
---

# Cross Edition Trigger (Base Server)

A ==Cross Edition Trigger== (Marble language `xetrigger`, Description: "Cross Edition Trigger") is Oracle's **Edition-Based Redefinition (EBR)** mechanism for keeping an old and new edition of a table in sync during online patching — when a column is added/changed/dropped, a crossedition trigger keeps both editions' views of the row consistent while the patch is being applied with the application still live.

> [!warning] No real example exists anywhere in this checkout
> Unlike [[Sequence (Base Server)]], no `.xetrigger` file or `XETRIGGER FOR TABLE` text was found anywhere in this checkout, and there's no "Cross Edition Trigger" entry in the Developer Studio New Model menu. The most likely explanation: this isn't something developers hand-author at all — it's almost certainly **generated automatically by IFS's patch/upgrade tooling** from the differences between two editions' `.storage`/`.entity` definitions, then exists only transiently during an actual patch run rather than being checked into source as a static file. Marble can apparently parse the generated form (hence the grammar existing), but nothing here confirms how or when it's generated. Treat this note as the grammar, not as evidence anyone writes these by hand.

> [!info] Full parity, with a scoping decision
> This directory has **144 `.llm` files** — by far the largest of any language checked in this vault. Roughly 125 of them are a complete embedded PL/SQL grammar (every statement type, expression, predefined datatype, and SQL function) for the trigger body — not IFS-specific in any way, just confirmation that the trigger body is plain PL/SQL. Those are listed by category, not individually, below. The ~18 files that *are* IFS/XET-specific are documented in full.

---

## Top-Level Structure

> [!abstract] Syntax Skeleton
> ```marble
> [REVERSE] XETRIGGER FOR TABLE <TableName> IS
>    ( <TableDefinitionBlock> | <CodeRegistrationIgnore> )*
> END <TableLabel>;
> ```

| Keyword | Description |
|---------|-------------|
| `REVERSE` | Optional direction flag on the trigger as a whole. No Marble description — by Oracle EBR convention, a crossedition trigger can run "forward" (old edition → new) or `REVERSE` (new → old), needed because both directions must stay synced while a patch is in flight. |
| `XETRIGGER FOR TABLE <Name> IS ... END <Label>;` | Names the table the trigger keeps synced between editions. |
| `CodeRegistrationIgnore` | See below — can appear directly at this level, alongside table-definition blocks. |

## Table Definition Block

```marble
( CodeRegistration | CodeRegistrationBefore | CodeRegistrationAfter )
[CodeRegistrationType]
( AppendIfStatement )*
<PlsqlBlock>
```

| Keyword | Description |
|---------|-------------|
| `CodeRegistration` | `[Overtake] @CodeRegistrationAnnotation <Name>` — registers a named block of sync logic, optionally with `@Overtake` to replace a lower layer's version of the same registration entirely. |
| `CodeRegistrationBefore` | `@CodeRegistrationAfterAnnotation <CustName> <CoreName>` *(sic — filename says "Before" but the annotation token itself is named `CodeRegistrationAfterAnnotation` in this rule; likely a copy-paste artifact in Marble's own grammar)* — registers customer-layer logic to run before/in relation to a named core registration. |
| `CodeRegistrationAfter` | Same shape, for after. |
| `CodeRegistrationType` | "Code registration type" — a typed classification for the registration block; no enum of valid types is documented. |
| `CodeRegistrationIgnore` | `@CodeRegistrationIgnoreAnnotation <Name>` — marks a named registration as deliberately skipped. |
| `Override` | "Override annotation" — "Run additional code before and/or after the lower layer of code is executed." Same annotation family used elsewhere in this vault (e.g. `.projection`'s `@Override`). |
| `Overtake` | "Overtake annotation" — "Run this code instead of the code in lower layer(s)." Same family as seen in [[Analysis Model]]'s `@Overtake` and the Scheduling Model's `@Overtake`. |
| `<PlsqlBlock>` | The actual sync logic — a full PL/SQL block (see below). |

## Governance/Approval Annotations

These four read like deliberate-exception markers — explicitly approving a pattern that would otherwise be flagged, presumably because crossedition triggers run under tighter restrictions than ordinary PL/SQL (Oracle EBR triggers have real constraints: no `COMMIT`, limited DDL, etc.):

| Keyword | Where it can appear | Description |
|---------|---------------------|-------------|
| `ApproveDynamicStatement` | Any `Statement`, or inside a `FORALL` statement | No Marble description. By name: approves a dynamic SQL statement (`EXECUTE IMMEDIATE`) that would otherwise be disallowed/flagged in this context. |
| `ApproveGlobalVariable` | Anywhere | Approves use of a global/package-level variable. |
| `ApproveInheritedFwCall` | Any `Statement` | Approves a call into "inherited framework" code — likely a call up into a lower/core layer's logic from a customization. |
| `ApproveTransactionStatement` | Any `Statement` | Approves a transaction-control statement (`COMMIT`/`ROLLBACK`/`SAVEPOINT`) — notable because EBR crossedition triggers normally **cannot** commit; an explicit approval annotation existing for this suggests the restriction is enforced by IFS's own tooling/lint rather than (or in addition to) Oracle itself. |

All four take `$AnnotationArgument` — likely a justification string or rule-code argument, not documented further by Marble.

## Skip/Chunking Directives

| Keyword | Where it can appear | Description |
|---------|---------------------|-------------|
| `IgnoreDelete` | On a `DeleteStatement` | No description — marks a delete statement to be skipped/excluded from normal sync handling. |
| `IgnoreUpdate` | On an `UpdateStatement` | Same idea, for an update statement. |
| `IgnorePragmaSkipCommit` | Anywhere | Suppresses a "skip commit" pragma/check — implies there's an underlying rule that normally flags missing commits, which this annotation opts out of. |
| `ChunkUpdate` | On an `UpdateStatement`, with optional `ChunkUpdateSize` | Marks an update to be processed in batches of `ChunkUpdateSize` rows rather than as one statement — a standard technique for avoiding huge transactions/locks when backfilling large tables during a live patch. |

---

## The Trigger Body: Full Embedded PL/SQL

`<PlsqlBlock>` and everything inside an `AppendIfStatement` is ordinary PL/SQL, and Marble's grammar for it is exhaustive — full statement and expression coverage, not abbreviated. Categorized rather than itemized (these are standard Oracle PL/SQL constructs, not IFS-specific — there is nothing to "make sense of" beyond confirming they're plain PL/SQL):

| Category | Representative rules found |
|----------|------------------------------|
| Control flow | `IfStatement`, `CaseStatement`, `BasicLoopStatement`, `ForLoopStatement`, `ForLoopReverseStatement`, `CursorForLoopStatement`, `WhileLoopStatement`, `ExitStatement`, `ContinueStatement`, `GotoStatement` |
| Cursors | `CursorDeclaration`, `OpenStatement`, `FetchStatement`, `CloseStatement`, `CursorParameterDeclaration` |
| DML | `SelectStatement`, `InsertStatement`, `UpdateStatement`, `DeleteStatement`, `MergeStatement`, `LockTableStatement`, `ForallStatement`, `BulkCollectIntoClause` |
| Transactions | `CommitStatement`, `RollbackStatement`, `SavepointStatement`, `SetTransactionStatement` |
| Declarations | `VariableDeclaration`, `ConstantDeclaration`, `ExceptionDeclaration`, `TypeDefinition`, `SubtypeDefinition`, `RecordTypeDefinition`, `AssocArrayTypeDefinition`, `VarrayTypeDefinition`, `RefCursorTypeDefinition` |
| Datatypes | `PredefinedNumberDatatype`, `PredefinedCharDatatype`, `Varchar2Datatype`, `PredefinedDateDatatype`, `PredefinedBlobDatatype`, `PredefinedClobDatatype`, `PredefinedBooleanDatatype`, `PredefinedIntegerDatatype`, `PredefinedFloatDatatype`, `PredefinedIntervalDatatype`, `InheritedRecordDatatype` (`%ROWTYPE`), `InheritedScalarDatatype` (`%TYPE`) |
| SQL functions | `AbsSqlFunction`, `ChrSqlFunction`, `ModSqlFunction`, `ExtractSqlFunction`, `ToNumberSqlFunction`, `TrimSqlFunction`, `SysGuidSqlFunction`, `SysdateSqlFunction`, `UidSqlFunction`, `UserSqlFunction`, `CastSqlFunction`, `TreatSqlFunction` |
| Expressions | `AndExpression`, `OrExpression`, `CompareExpression`, `BetweenExpression`, `InExpression`, `LikeExpression`, `CaseExpression`, `MultisetExpression`, `MemberOfExpression`, `ConcatExpression` |
| Pragmas | `AutonomousTransactionPragma`, `ExceptionInitPragma`, `RestrictReferencesPragma`, `SeriallyReusablePragma`, `UdfPragma`, `InlinePragma`, `ParallelEnableClause`, `ResultCacheClause` |
| Procedures/functions | `ProcedureDeclaration`, `ProcedureDefinition`, `FunctionDeclaration`, `FunctionDefinition`, `MethodSignature` |
| Error handling | `RaiseStatement`, `ExceptionHandler` |
| Dynamic SQL | `ExecuteImmediateStatement`, `UsingClause`, `UsingInVariable`, `UsingOutVariable`, `UsingInOutVariable` |

None of these were individually queried for descriptions — they're standard PL/SQL, and Marble's own per-rule `Description`/`Explanation` fields are empty for this entire category in every spot-check performed.

---

## Unresolved: `RegionDivider`

Same situation as the Tabular Model languages — a `RegionDivider.llm` file exists here too, with the same empty content (`EBNF = "RegionName"`). Undetermined literal syntax, consistent across every language checked so far in this vault.

---

## See Also

- [[Sequence (Base Server)]] — another DB-level construct with no dedicated Developer Studio model file, embedded in `.storage` instead
- [[Entity (Base Server)]] — the Logical Unit whose table a crossedition trigger keeps synced across editions during a patch
