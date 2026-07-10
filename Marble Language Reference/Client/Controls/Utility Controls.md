---
title: Utility Controls
tags:
  - ifs-marble/client
  - ifs-marble/construct
aliases:
  - process viewer
  - processviewer
  - toast
  - message box
  - messagebox
  - contact widget
  - contactwidget
  - toast notification
related:
  - "[[Pages]]"
  - "[[Dialog]]"
  - "[[Commands and Expressions]]"
---

# Utility Controls

Utility controls handle notifications, process visualization, and contextual people data. They are less frequently written from scratch (many come pre-configured in standard IFS modules) but appear throughout the framework.

| Control | Comparable to | Purpose |
|---------|--------------|---------|
| `processviewer` | Step indicator, Stepper (Material UI) | Visual multi-stage process status tracker |
| `toast` | Toast notification (React Toastify, Ant Design `message`) | Transient feedback message after an action |
| `messagebox` | Alert/confirm dialog (browser `alert()`, `confirm()`) | Modal message requiring user acknowledgment |
| `contactwidget` | User profile card, People card (Microsoft 365) | Shows person info (avatar, name, phone, email) from a user/person attribute |

---

## `processviewer`

Displays the stages of a multi-step process as a horizontal step bar. Highlights the current stage. Used for approval flows, manufacturing stages, and order fulfillment pipelines.

> [!abstract] Syntax
> ```marble
> processviewer <Name> for <Entity> {
>    label       = "<label>";
>    activestage = "${StageName}";    -- attribute or expression for current stage
>    visible     = [<expression>];
> }
> ```

```plvc
-- Show a 3-stage approval pipeline:
processviewer ApprovalProcess for PurchaseOrder {
   label       = "Approval Status";
   activestage = "${ApprovalStage}";
}
```

The stages themselves and their labels are defined in the entity's state machine (in the projection/server layer). The `processviewer` control simply reads the `activestage` attribute and illuminates the corresponding stage in the visual bar.

> [!note] Compare to UI Steppers
> `processviewer` is like a read-only **Material UI Stepper** or **Ant Design Steps** component — it shows position in a predefined sequence. It doesn't control navigation between steps (that's [[Assistant]]'s role); it purely visualizes where a record currently is in a workflow.

---

## `toast`

A transient notification shown briefly at the top or bottom of the screen after an action completes. Disappears automatically after a few seconds without user interaction.

In Marble, `toast` is typically invoked inside a `command`'s `execute` block rather than declared as a static control on a page.

> [!abstract] Usage in Commands
> ```marble
> execute {
>    call SomeAction(...);
>    toast("Action completed successfully.");
>    -- or with severity:
>    toast("Record saved.", success);
>    toast("Validation failed: check required fields.", error);
> }
> ```

```plvc
command SubmitOrderCommand for SalesOrder {
   label = "Submit";
   enabled = [Objstate = "Draft"];
   execute {
      call SubmitSalesOrder(OrderNo, Company);
      toast("Order ${OrderNo} submitted successfully.");
   }
}
```

> [!note] Compare to Notification Libraries
> Marble's `toast` is equivalent to calling `toast.success("...")` in React Toastify, `message.success("...")` in Ant Design, or `snackbar.open(...)` in Material UI. It's a single-line feedback mechanism for confirming actions without a blocking dialog.

---

## `messagebox`

A modal dialog requiring the user to acknowledge a message before proceeding. Unlike `toast`, `messagebox` is blocking — the user must click OK or Cancel.

> [!abstract] Usage in Commands
> ```marble
> execute {
>    messagebox("<message text>", <Yes | No | OK | Cancel>, <CommandIfYes>, <CommandIfNo>);
> }
> ```

```plvc
command DeleteRecordCommand for SalesOrder {
   label   = "Delete";
   enabled = [Objstate = "Draft"];
   execute {
      messagebox("Are you sure you want to delete Order ${OrderNo}? This cannot be undone.",
         Yes, No,
         DeleteConfirmedCommand,
         null
      );
   }
}

command DeleteConfirmedCommand for SalesOrder {
   execute {
      call DeleteSalesOrder(OrderNo, Company);
      navigate back;
   }
}
```

> [!note] Compare to Browser Dialogs
> `messagebox` is like the browser's `window.confirm("Are you sure?")` or a **Material UI Dialog** with action buttons. It interrupts the user flow and requires explicit confirmation before a destructive or irreversible action proceeds.

> [!tip] Use `messagebox` Before Destructive Commands
> Any command that deletes records, sends external notifications, or makes irreversible changes should be guarded with a `messagebox`. This matches the UX principle: "never let a user destroy data with a single accidental click."

---

## `contactwidget`

Displays person contact information (avatar, name, phone, mobile, email) for a user or contact linked to the record. The information is fetched from the IFS people/user registry using a key attribute.

> [!abstract] Syntax
> ```marble
> contactwidget <Name> {
>    label   = "<label>";
>    key     = <AttrName>;     -- attribute containing the person's user ID
>    source  = <Person | User | Customer | Supplier>;
>    enabled = [<expression>];
> }
>
> -- Conditional source (selects type based on a field value):
> contactwidget OrderContact {
>    source = Customer = [RefTypeDb = "CUSTOMER"];
>    source = Supplier = [RefTypeDb = "SUPPLIER"];
>    -- falls back to Person if no condition matches
>    key = ContactId;
> }
> ```

```plvc
-- Show the assigned buyer's contact card:
contactwidget BuyerContact {
   label  = "Assigned Buyer";
   key    = BuyerId;
   source = User;
}

-- Conditional contact: customer or supplier depending on record type:
contactwidget OrderPartyContact {
   label  = "Order Contact";
   key    = PartyId;
   source Customer = [PartyType = "CUSTOMER"];
   source Supplier = [PartyType = "SUPPLIER"];
}
```

> [!note] Compare to People Cards in Microsoft 365
> `contactwidget` is like the **Microsoft 365 People Card** or **LinkedIn hover card** — click a person's name and see their avatar, job title, phone, and email inline without navigating away. It's surfacing directory data attached to a record.

> [!note] The `key` Attribute Must Be a Person/User ID
> The attribute named in `key` must hold a value that IFS can resolve against its user or person registry. A free-text name won't work — the ID must match a registered user/person/customer/supplier record.

---

## Patterns & Tips

> [!tip] `toast` for Confirmations, `messagebox` for Confirmations Requiring Choices
> Use `toast` when the action has already succeeded and you just want to confirm it: "Record saved." Use `messagebox` when you need the user to decide: "Are you sure? Yes/No." Don't use `messagebox` for successes — it interrupts flow unnecessarily.

> [!tip] `processviewer` Works Best at the Top of a Form Page
> Place `processviewer` in the page's header group or as the first component on the page so the user immediately sees where the record is in its lifecycle. It contextualizes every subsequent field and action.

> [!warning] `contactwidget` Requires IFS People Registry Access
> If the underlying people/user registry query fails (permission issue, missing person record), the widget renders empty rather than erroring. Always test with both a valid and null `key` attribute value.

---

## See Also

- [[Commands and Expressions]] — `toast` and `messagebox` are called from execute blocks
- [[Assistant]] — multi-step wizard with a built-in step indicator (similar to processviewer)
- [[Dialog]] — for blocking modals that capture user input (vs. messagebox which just acknowledges)
- [[Display Controls]] — badge, stateindicator for record-level status display
