---
title: Test Case
tags:
  - ifs-other-models
  - ifs-other-models/confirmed
aliases:
  - pltst
  - plsvt
  - projectiontest
  - testsuite
related:
  - "[[IFS Base Server Reference]]"
---

# Test Case

Developer Studio's "Test Case..." New Model command is a generic entry point into **three distinct, layer-specific test formats**, each with its own Marble grammar and file extension. There is no single unified "testcase" grammar — Marble has no language by that literal name; querying it returns nothing.

## `.pltst` and `.plsvt` — PL/SQL Unit Tests

Both share the exact same grammar (`Description = "IFS PL/SQL Unittest"`), differing only in which layer they test: `.pltst` tests `.plsql` packages (entity API layer), `.plsvt` tests `.plsvc` packages (projection service layer). Confirmed real with hundreds of examples, e.g. `accrul/test/accrul/database/Voucher.pltst`, `fndbas/test/fndbas/database/LobbyDatasourceConfiguration.plsvt`.

> [!abstract] Syntax Skeleton
> ```marble
> UNITTEST <UnitTestName> FOR
>    <InstrumentedMethodDeclaration>*    -- the procedures/functions under test
> USING
>    <MockContext>
>    ( <MockTable> | <MockCursor> | <MockPassthru> | <MockPackage> | <Mock> )*
> IS
>    <TestContext>
>    <Body>
> END UNITTEST;
> ```

A mock-based unit test framework: you declare which methods are instrumented, set up mock tables/cursors/packages to isolate the unit under test, then write assertions in the body.

## `.projectiontest` — Projection Tests

A higher-level, CRUD-oriented test format for `.projection` files. Confirmed real, though no example file was located in this specific checkout pass.

> [!abstract] Syntax Skeleton
> ```marble
> testsuite <ModelName>;
> [description "<Value>";]
>
> test <TestName> {
>    -- any of:
>    -- CreateDefinition | UpdateDefinition | DeleteDefinition |
>    -- ActionDefinition | FunctionDefinition | AssertDefinition
> }
> -- one `test` block per scenario, repeatable
> ```

Each `test { }` block exercises the projection's entities/actions/functions directly (create/update/delete a row, call an action or function) and then asserts on the result — a CRUD-and-action-level integration test, as opposed to `.pltst`/`.plsvt`'s mock-isolated unit tests.

> [!tip] Don't confuse this with `.mkd` test automation
> This vault's `test-automation` skill covers `.mkd` (Script-A-Rest/TAR) files, which are end-to-end UI/API test scripts — a different layer entirely from the PL/SQL- and projection-level tests documented here.

## See Also

- [[IFS Base Server Reference]] — the `.plsql`/`.plsvc` layers these tests exercise
- Real examples: `accrul/test/accrul/database/*.pltst`, `fndbas/test/fndbas/database/LobbyDatasourceConfiguration.plsvt`
