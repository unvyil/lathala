# Lathala — Open-Source Newsletter Design Studio & Audience CRM

**Lathala** is a modern, open-source editorial design and audience platform inspired by **Figma & Canva**, integrated directly with an interactive **Spreadsheet CRM** for audience segmentation and newsletter dispatch.

Architected with a strict **"Bring Your Own Keys" (BYOK)** philosophy: you can connect your own **Clerk** authentication project and **Supabase** PostgreSQL instance with complete data sovereignty and zero vendor lock-in.

---

## 🌟 Key Features

### 1. Strict Startup Authentication (Clerk)
- **Immediate Auth Gate:** Requires Clerk sign-in/sign-up immediately upon opening the workspace.
- **BYOK Configurable:** Plug in your own `pk_test_...` key from the Clerk dashboard or configure via `.env`.
- **Instant Workspace Profiles:** One-click demo roles (Elena Rostova - Editorial Director, Marcus Vance - Lead Designer) for immediate sandbox testing.

### 2. User-Specific Cloud Persistence (Supabase PostgreSQL)
- **Configured Instance:** Pre-configured to connect to `https://vvjsesddnbsledhwoczp.supabase.co`.
- **Ready Schema:** Ready-to-run `schema.sql` file included at root for one-click setup in Supabase SQL Editor.
- **Per-User Syncing:** Automatically saves projects, artboards, dimensions, layers, departments, and CRM subscribers per user account.

### 3. Canvas, Navigation & Zooming
- **Keyboard Zoom:** `Ctrl +` to zoom in, `Ctrl -` (or `Ctrl _`) to zoom out.
- **Mouse / Trackpad Zoom:** Hold `Ctrl` and scroll with your mouse wheel or pinch-to-zoom on your trackpad.
- **Save Shortcut:** Press `Ctrl + S` or `Cmd + S` to instantly save designs and sync to Supabase with toast confirmation.
- **Area / Marquee Selection:** Click and drag starting *outside* the canvas onto the canvas area to multi-select elements with pointer capture.
- **Free-Form Canvas Resizing:** Select the newsletter frame to adjust dimensions, or drag bottom/side handles directly.

### 4. UI Layout & Independent Sidebar Toggles
- **Inner-Corner Toggles:**
  - **Left Tool Dock:** Collapse toggle located at the inner **top-right** corner of the dock. When closed, a docked expand button is available on the left edge.
  - **Right Inspector/Layers:** Collapse toggle located at the inner **top-left** corner of the sidebar. When closed, a docked expand button is available on the right edge.
- **Dynamic Font & Button Sizing:** Responsive, non-overflowing typography and controls with text truncation and flexible layouts.
- **Clean Templates:** All default templates and elements use clean real copy with zero `{{ }}` placeholder syntax.

### 5. Consolidated Tool Widgets
- **Text Widget:** Structured Google Docs-inspired editorial hierarchy (*Title, Heading, Subheading, Body, Caption/Footnote*) with Figma typographic properties.
- **Shapes Widget:** Grouped vector primitives (*Rectangle, Ellipse, Pill, Triangle, Star*).
- **Line Widget:** Customizable rule lines (*Solid, Dashed, Dotted, Arrowheads, Endpoints*).

### 6. Interactive CRM & Newsletter Preview
- **Fully Editable CRM:** Edit names, emails, roles, and custom fields directly in the spreadsheet grid.
- **Department Dropdowns:** Interactive, color-coded dropdowns for each subscriber.
- **Smart CSV / Excel Import:** Upload spreadsheets/CSV files and automatically extract **only** core fields:
  - **Name**
  - **Email**
  - **Role / Position**
  - **Department**
  *(All extraneous columns from Excel or Google Sheets are safely filtered out, except registered custom CRM columns)*.
- **Newsletter Preview:** Dedicated preview modal featuring live desktop (600px) and mobile (375px) frames with real personalized data.

---

## 🚀 Quick Start & BYOK Setup

### 1. Environment Configuration (`.env`)

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Your `.env` file contains:

```env
# Supabase PostgreSQL Database
VITE_SUPABASE_URL=https://vvjsesddnbsledhwoczp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2anNlc2RkbmJzbGVkaHdvY3pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNTkyMzQsImV4cCI6MjEwNTczNTIzNH0.xpzi-quju_BwZ_ccw4h0ARx1OKMibYbjJ3joUx7PPyw

# Clerk Authentication (BYOK)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_bGF0aGFsYS1zdHVkaW8tYXV0aC0yMDI2JGxpdmU

# Optional: Google Apps Script Web App URL
VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycbx_EXAMPLE/exec
```

### 2. Supabase Database Initialization (`schema.sql`)

1. Open your Supabase Dashboard: [https://supabase.com/dashboard/project/vvjsesddnbsledhwoczp](https://supabase.com/dashboard/project/vvjsesddnbsledhwoczp)
2. Go to **SQL Editor** -> **New Query**.
3. Paste the contents of `schema.sql` (located in the root folder) and click **Run**.
4. The tables (`projects`, `subscribers`, `departments`, `folders`, `custom_columns`) and Row Level Security policies will be created automatically.

### 3. Run Development Server

```bash
npm run dev
```

App runs on `http://localhost:3000`.

---

## 📧 Google Apps Script & Gmail Dispatch Engine

Lathala includes production-tested Google Apps Script logic for concurrency-safe Gmail dispatch:

```javascript
function sendPersonalizedNewsletter(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000); // 30-second concurrency lock
  
  try {
    var data = JSON.parse(e.postData.contents);
    var recipientEmail = data.email;
    var subject = data.subject || "Editorial Dispatch";
    var htmlBody = data.htmlBody;
    
    GmailApp.sendEmail(recipientEmail, subject, "", {
      htmlBody: htmlBody,
      name: data.senderName || "Lathala Studio"
    });
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
```

Access the complete copyable script template at any time in the app via **CRM -> Apps Script Code**.
