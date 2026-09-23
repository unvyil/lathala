# System Architecture & Open-Source Principles

Lathala is architected as an **independent, client-first editorial design system**. Unlike closed SaaS newsletter builders, Lathala does not lock users into proprietary cloud backends.

---

## 1. Core Architectural Pillars

```
+---------------------------------------------------------------+
|                       LATHALA CLIENT                          |
|                                                               |
|  [Canvas Stage]      [Tool Dock]        [Inspector & Layers]  |
|  Free Resizing       Hierarchy Text     Figma Number Scrub    |
|  Marquee Multi-Sel   Shapes & Lines     Z-Index Reordering    |
+---------------------------------------------------------------+
                               |
                               v
+---------------------------------------------------------------+
|                      STUDIO CONTEXT                           |
|  - Projects & Editions State        - Multi-level Undo/Redo   |
|  - Audience Subscribers Store       - Merge Tag Interpolation |
|  - Storage Adapter Layer (Local / Supabase / Google Sheets)   |
+---------------------------------------------------------------+
                               |
             +-----------------+-----------------+
             |                                   |
             v                                   v
+------------------------+             +------------------------+
|  Local Workspace       |             |  BYOB Cloud Endpoints  |
|  - HTML5 LocalStorage  |             |  - User's Supabase     |
|  - Zero Config         |             |  - User's Clerk Auth   |
|  - Instant Prototyping |             |  - Google Apps Script  |
+------------------------+             +------------------------+
```

### 1.1 Client-First Determinism
All artboard rendering, vector math, layer positioning, and HTML email generation are executed client-side without round-trips to an external server. This guarantees instant UI response times and allows the studio to function offline.

### 1.2 Bring Your Own Backend (BYOB)
In an open-source project, hardcoding one central project owner's API keys (or database tables) breaks multi-tenant self-hosting. Lathala solves this by implementing a **pluggable BYOB strategy**:
1. **Local Mode (Default):** All artboards and subscriber tables are cached deterministically in browser `localStorage`.
2. **Self-Hosted Supabase:** Users specify their own `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in environment variables or through the in-app **Settings & BYOB** dialog.
3. **Self-Hosted Clerk:** Users provide their own Clerk publishable key for custom team authentication.
4. **Google Apps Script:** A light macro script deployed to the user's Google Drive syncs data with their own Google Sheet.

---

## 2. Canvas Engine Architecture

### 2.1 Coordinate Space & Free Scaling
The canvas engine operates with an internal virtual coordinate plane defined in pixels:
- `artboardWidth` (default: 600px, standard email width)
- `artboardHeight` (default: 880px)

The canvas container applies a CSS transform:
```css
transform: scale(zoom);
transform-origin: top left;
```
When user pointers interact with elements or drag-select marquees, coordinates are transformed into unscaled canvas space:
$$\Delta x_{canvas} = \frac{\Delta x_{client}}{zoom}, \quad \Delta y_{canvas} = \frac{\Delta y_{client}}{zoom}$$

### 2.2 Interactive Marquee Selection
When the user clicks and drags outside an element, an axis-aligned bounding box (AABB) is calculated. Any element intersecting the marquee:
$$el_{x1} < box_{x2} \land el_{x2} > box_{x1} \land el_{y1} < box_{y2} \land el_{y2} > box_{y1}$$
is added to `selectedIds`.

### 2.3 Figma Number Scrubbing (`ScrubbableNumberInput`)
Numeric properties (X, Y, Width, Height, Opacity, Radius, Stroke) use pointer lock and mouse movement delta with bidirectional visual cues (`◄ ►`). Holding `Shift` accelerates by 10x; holding `Alt` provides fractional precision.

---

## 3. Merge Tags & Email Safety

Exported email HTML generates standard table-based, inline-styled markup that conforms to major email clients (Gmail, Apple Mail, Outlook). Merge tags (`{{name}}`, `{{role}}`, `{{department}}`) can be resolved statically or passed through as ESP-specific syntax (e.g. Mailchimp, Resend, or SendGrid tags).
