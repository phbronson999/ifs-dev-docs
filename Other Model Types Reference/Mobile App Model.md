---
title: Mobile App Model
tags:
  - ifs-other-models
  - ifs-other-models/confirmed
aliases:
  - app
  - .app
related:
  - "[[IFS Marble Language Reference]]"
---

# Mobile App Model

A ==Mobile App Model== (Marble language `app`, file extension `.app`) defines an offline-capable mobile/field app: which client model it presents, what entities sync for offline use, and app-level settings (auth, GPS, barcode scanning, multi-device/multi-user support, notifications). Not part of the original research pass for this vault — found incidentally while cross-referencing the Developer Studio New Model menu against Marble's language index.

> [!abstract] Syntax Skeleton
> ```marble
> appname   <ModelName>;
> component <ComponentName>;
> layer     <LayerName>;
> description "<Value>";
> version     <AppVersion>;
>
> clientmodel <ClientModelName>;   -- repeatable, one or more
>
> settings {
>    -- ErrorHandlingDefinition | PinAuthenticationDefinition | GpsTrackingDefinition |
>    -- MultiDeviceDefinition | BarcodeScanningDefinition | MultiUserDefinition | NotificationHub
> }
>
> [syncentities {
>    -- AppEntityDefinition | AppQueryDefinition, one or more
> }]
> [parameters {
>    -- ParameterDefinition*
> }]
> [docman {
>    -- SyncScheduleDefinition | EntityDefinition
> }]
> [medialibrary {
>    -- SyncScheduleDefinition | MediaEntityDefinition
> }]
> [securitygroups {
>    -- SecurityGroupDefinition*
> }]
> [notifications {
>    -- NotificationsEntityDefinition, one or more
> }]
> -- AddressField, GeofenceRuleSet, ContactWidget, StatusIndicator can also appear at this level
> ```

---

## Keywords

| Keyword | Description |
|---------|-------------|
| `appname` / `component` / `layer` | Standard model header. |
| `description` | Short description, e.g. `"App for processing work orders on a mobile device."` |
| `version` | The app's version number. |
| `clientmodel <Name>;` | The `.client` model this app presents on the device. |
| `settings { }` | App-level behavior toggles: error handling, PIN authentication, GPS tracking, multi-device support, barcode scanning, multi-user support, notification hub wiring. |
| `syncentities { }` | Entities/queries that sync to the device for offline use. |
| `parameters { }` | App-level configuration parameters. |
| `docman { }` | Document management sync configuration. |
| `medialibrary { }` | Media library sync configuration. |
| `securitygroups { }` | Security group definitions scoped to the app. |
| `notifications { }` | Push-notification entity wiring. |

This is one of the more substantial DSLs found in this pass — comparable in scope to `.client`/`.projection` — but it was not searched for real example files in this checkout. If you're building a mobile app customization, it's worth a follow-up pass to find a working `.app` file before relying solely on this grammar skeleton.

## See Also

- [[IFS Marble Language Reference]] — the `.client` model every `clientmodel` line points at
