---
title: Database Change Model
publish: true
tags:
  - ifs-other-models
  - ifs-other-models/confirmed
aliases:
  - dbchange
  - .dbchange
related:
  - '[[IFS Base Server Reference]]'
---

# Database Change Model

A ==Database Change Model== (Marble language `dbchange`, file extension `.dbchange`) is already mentioned in passing in `Base Server Reference`'s file-types table (listed there as XML, IDE text view, "Database upgrade/migration change set") — this note gives it the grammar detail that table didn't include.

> [!abstract] Syntax Skeleton
> ```marble
> dbchange  <ModelName>;
> component <ComponentName>;
> layer     <LayerName>;
> ```

That's the entirety of what Marble indexes for this language — header only, no description/explanation/sample on any of the three keywords. Despite `Base Server Reference` describing `.dbchange` files as XML displayed in a text-like IDE editor (in the same category as `.entity`/`.enumeration`), Marble does have a real grammar entry for it (unlike `.entity`/`.enumeration`, which have none at all) — meaning the header portion at least is genuinely parseable text, even if the bulk of the change-set content is XML underneath.

## See Also

- [[IFS Base Server Reference]] — "The Critical XML Gotcha" section explains why this file looks like text but isn't fully one
