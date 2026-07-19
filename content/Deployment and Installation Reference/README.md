---
title: IFS Deployment and Installation Reference
publish: true
tags:
  - ifs-deployment
  - index
aliases:
  - Deployment and Installation
  - Deployment Reference
  - Installation Reference
related:
  - '[[IFS Base Server Reference]]'
---

# IFS Deployment and Installation Reference

Every IFS Cloud **component** — Base, Framework, ExtendedApplication, Product, Trans, or External — ships with a **profile file** that tells the build and installation tooling how to package, version, connect, and upgrade it. This section documents those profile files: their sections, their syntax, and the rules that govern how components move from one release to the next.

This is distinct from the [[Base Server Reference/README|Base Server Reference]] layer: Base Server documents *what a component contains* (entities, enumerations, PL/SQL). This section documents *how a component is declared, built, and deployed* — a concern that sits above and across every component type, not just Base Server ones.

---

## Notes in This Vault

```dataview
TABLE aliases, tags
FROM #ifs-deployment/profile
SORT file.name ASC
```

---

## See Also

- [[Component Deployment Profile File]] — the `deploy.ini` reference: sections, syntax, version/upgrade chains
- [[IFS Base Server Reference]] — the entities, enumerations, and PL/SQL that a deployed component owns
