# Setup & Deployment Guide

This guide walks through deploying and configuring your own instance of **Lathala**.

---

## 1. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Your personal Supabase Project URL | `https://xyzcompany.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase Anonymous Public Key | `eyJhbGciOi...` |
| `VITE_CLERK_PUBLISHABLE_KEY` | Your Clerk Frontend Publishable Key | `pk_test_...` |
| `VITE_GOOGLE_APPS_SCRIPT_URL` | Deployed Web App Macro URL | `https://script.google.com/macros/s/...` |
| `PORT` | Local dev server port | `3000` |

*Note: None of these are required to run locally. Lathala will automatically default to zero-config local storage.*

---

## 2. Setting Up Supabase (Self-Hosted / Cloud)

Create two tables in your Supabase SQL Editor:

```sql
-- 1. Projects Table
create table public.projects (
  id text primary key,
  title text not null,
  edited_at timestamptz default now(),
  created_at timestamptz default now(),
  segment_id text default 'all',
  artboard_width integer default 600,
  artboard_height integer default 880,
  artboard_background text default '#F1EEE9',
  elements jsonb not null default '[]'::jsonb
);

-- 2. Subscribers Table
create table public.subscribers (
  id text primary key,
  name text not null,
  email text not null unique,
  role text,
  department_id text not null,
  status text default 'pending',
  last_sent_at timestamptz,
  custom_data jsonb default '{}'::jsonb
);

-- Enable Row Level Security (RLS)
alter table public.projects enable row level security;
alter table public.subscribers enable row level security;

-- Allow public access with anon key for self-hosted instances
create policy "Allow anon access" on public.projects for all using (true);
create policy "Allow anon access" on public.subscribers for all using (true);
```

---

## 3. Setting Up Google Sheets CRM Integration

1. Create a new Google Spreadsheet.
2. In the menu, click **Extensions > Apps Script**.
3. Paste the sample Apps Script provided in Lathala (**Audience CRM > Google Sheets Integration > View Script**).
4. Click **Deploy > New Deployment**.
5. Select type **Web App**:
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Copy the Web App URL and paste it into Lathala's **Settings & BYOB** dialog.

---

## 4. Production Build

To bundle the application for production:

```bash
npm run build
```

The compiled assets will be placed into the `dist/` directory, ready to be hosted on Vercel, Netlify, Cloudflare Pages, or Docker.
