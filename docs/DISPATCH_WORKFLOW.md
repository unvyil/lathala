# Editorial Dispatch & CRM Workflow

This guide explains how audience segmentation, personalization merge tags, and newsletter dispatches work together in Lathala.

---

## 1. Audience Structure

The CRM tracks subscribers with both standard attributes and dynamic columns:

| Field | Description | Example |
| :--- | :--- | :--- |
| `name` | Subscriber's full name | `Elena Rostova` |
| `email` | Target delivery email address | `elena@example.com` |
| `role` | Position / role within the organization | `Lead Typography Designer` |
| `department` | Organizational segment (Engineering, Design, Marketing, etc.) | `Design` |
| `status` | Delivery status: `pending`, `sent`, `bounced`, `unsubscribed` | `sent` |

### Custom Dynamic Columns
You can add custom spreadsheet columns (e.g., `City`, `Membership Tier`, `Favorite Topic`). These automatically become available as merge tags inside the design studio (e.g., `{{city}}`, `{{tier}}`).

---

## 2. Using Merge Tags on the Canvas

In any text element, you can include tags using double-bracket notation:

```
Hello {{name}},

Welcome to the {{department}} weekly dispatch. As {{role}}, you have full access to our editorial archive.
```

### Live Preview Switcher
In the Design Studio's top action bar, use the **Preview as** dropdown to preview exactly how the newsletter will render for any individual subscriber in your audience.

---

## 3. Dispatching an Edition

1. **Direct from Department Table:**
   - In the **Dashboard > Department Dispatch Table**, select individual members or use the "Select All" checkbox.
   - Click the floating **Dispatch Newsletter to Selected** action button.
   - All selected members receive the current edition, and their status updates to `SENT`.

2. **From the Design Studio:**
   - Click the **Dispatch** button in the top right.
   - Choose your target segment (`Everyone`, `Engineering`, `Marketing`, etc.) or individual recipients.
   - Click **Send Production Dispatch**.

3. **Exporting Raw HTML:**
   - Click **Export HTML** to copy the email-client-safe markup or download the `.html` file for use with external ESPs (e.g. Resend, SendGrid, Amazon SES, or Mailchimp).
