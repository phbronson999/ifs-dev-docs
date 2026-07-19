---
title: Stacked Calendar and Scheduling
publish: true
tags:
  - ifs-marble/client
  - ifs-marble/construct
aliases:
  - stackedcalendar
  - daysinfo
  - attendance
  - reports
  - progressarea
related:
  - '[[Data Views]]'
  - '[[Commands and Expressions]]'
---

# Stacked Calendar and Scheduling

A ==stackedcalendar== is a resource-scheduling calendar view — distinct from the simpler `calendar` control documented in [[Data Views]]. It stacks per-day information (notes/attendance/reports/progress) across a week, week-start/length and minute-increment settings, and several day-level sub-blocks. This whole family (11 constructs) had zero prior vault coverage.

> [!abstract] Top-Level Syntax
> ```marble
> stackedcalendar <Name> for <Datasource> {
>    label = "<Value>";
>    weekstart           = <Value>;
>    weeklength          = <Value>;
>    minuteincremenets    = <Value>;   -- note: misspelled in the grammar itself ("incremenets")
>    serverusesminutes   = <Value>;
>
>    daysinfo for <Datasource2> url=... { ... }
>    reports for <Datasource3> url=... { ... }
>    attendance for <Datasource4> url=... { ... }
>    progressarea for <Datasource5> url=... { ... }
>    [legends { ... }]
>
>    ( command <Name>; | commandgroup <Name>; )*
>    [showwageattendance = [<condition>];]
>    [showdailystatus = [<condition>];]
>    [showinfoattendance = [<condition>];]
>    [showweeklyprogress = [<condition>];]
>    [showweeknumber = [<condition>];]
> }
> ```

---

## `daysinfo`

> [!abstract] Syntax
> ```marble
> daysinfo for <Datasource> url=... {
>    date <DateRef>;
>    duration = <Value>;
>    [card <CardRef>;]
>    [cardindication { ... }]
>    [indication { ... }]
>    wageleft = <Value>;
>    jobleft  = <Value>;
>    statuses { status = <Value>; ... }
>    editduration command { ... }
>    [createreport command { ... }]
>    [createattendance command { ... }]
> }
> ```

Per-day data for the stacked calendar — date, duration, wage/job-remaining figures, status list, and the commands available on a given day.

### `cardindication`

"Indicator of notes/more information on a day." `cardindication { <EmphasisSetting>+ }` — nests inside `daysinfo`.

### `indication`

"Corner indication for items in stacked calendar." `indication { <EmphasisSetting>+ }` — same shape as `cardindication`, but also valid inside `reports`/`attendance` content (not just `daysinfo`).

### `statuses`

`statuses { status = <Value>; ... }` — the list of status values shown for the day. No further description from Marble.

### `editduration command`

"Edit duration command for calendar."

```marble
editduration command {
   execute {
      call FetchDefaults();
   }
}
```

Valid inside both `reports` and `attendance` content (not just `daysinfo`).

### `createreport command`

"Create a report on the day."

```marble
createreport command {
   execute {
      call FetchDefaults();
   }
}
```

### `createattendance command`

"Create attendance on the day."

```marble
createattendance command {
   execute {
      call FetchDefaults();
   }
}
```

---

## `reports`

```marble
reports for <Datasource> url=... {
   -- ReportsContent: can include indication, editduration command, etc.
}
```

No further description from Marble beyond the header shape — its content block (`ReportsContent`) is shared with `attendance`'s content (both can host `indication` and `editduration command`).

## `attendance`

```marble
attendance for <Datasource> url=... {
   -- AttendanceContent: can include indication, editduration command, etc.
}
```

Same situation as `reports` — minimal header description, shared content shape (`AttendanceContent`).

## `progressarea`

```marble
progressarea for <Datasource> url=... {
   label = "<Value>";
   controlling = <Value>;
   value = <Value>;
   -- value repeats, one or more
}
```

No further description from Marble. By field shape, this renders a progress bar/area driven by one or more `value` settings against a `controlling` reference.

---

## Day-Level Flags on `stackedcalendar`

| Flag | Purpose (inferred from name, no Marble description) |
|------|---------------------------------------------------------|
| `showwageattendance` | Show/hide the wage-attendance figure. |
| `showdailystatus` | Show/hide the daily status indicator. |
| `showinfoattendance` | Show/hide the info-attendance indicator. |
| `showweeklyprogress` | Show/hide the weekly progress summary. |
| `showweeknumber` | Show/hide the ISO week number. |

---

## See Also

- [[Data Views]] — the simpler `calendar`/`ganttchart`/`yearview` controls
- [[Commands and Expressions]] — `execute`/`call` syntax used inside every command block here
