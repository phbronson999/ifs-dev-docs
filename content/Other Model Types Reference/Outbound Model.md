---
title: Outbound Model
publish: true
tags:
  - ifs-other-models
  - ifs-other-models/confirmed
aliases:
  - outbound
  - .outbound
related:
  - '[[Scheduling Model]]'
---

# Outbound Model

An ==Outbound Model== "defines the documentation for outbound services" — per-method API documentation for IFS Cloud's outbound web service integrations. Confirmed real with many examples in this checkout, e.g. `order/model/order/SalesIntegrationService.outbound`, `shpmnt/model/shpmnt/FreightBookingIntegrationService.outbound`, `purch/model/purch/ProcurementIntegrationService.outbound`.

> [!abstract] Syntax Skeleton
> ```marble
> outbound  <ModelName>;
> component <ComponentName>;
> layer     <LayerName>;
>
> [@DynamicComponentDependency <COMPONENT>]
> method <MethodName> {
>    @ApiDoc {
>       <description text for API documentation>
>    }
>    <PayloadCreationMethod>
>    <OutboundMethodStructure>
>    <OutboundMethodDataType>
> }
> -- one `method` block per outbound operation, repeatable
> ```

---

## Keywords

| Keyword | Description |
|---------|-------------|
| `outbound` / `component` / `layer` | Standard model header. |
| `method <Name> { }` | One outbound service method/operation. Can be preceded by `@Override`, `@ApiDoc`, and any number of `@DynamicComponentDependency` annotations. |
| `@ApiDoc { }` | Description text included in generated API documentation for the method. |
| `PayloadCreationMethod` / `OutboundMethodStructure` / `OutboundMethodDataType` | Internal sub-rules describing the payload shape and data type for the method — not individually queried for this note (no `Description`/`SourceSample` were returned for the header-level rules either, so this DSL is grammar-confirmed but not prose-documented by Marble beyond the top-level shape).

---

## See Also

- [[Scheduling Model]] — a different integration DSL, for the RSO/PSO scheduling engine rather than generic outbound web services
- Real examples in this checkout: `order/model/order/SalesIntegrationService.outbound`, `invoic/model/invoic/EInvoiceIntegrationService.outbound`
