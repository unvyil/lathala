/**
 * Google Apps Script Integration Template for Lathala CRM
 * Users copy this into their Google Sheet (Extensions > Apps Script) to enable two-way sync!
 */

export const GOOGLE_APPS_SCRIPT_SAMPLE = `/**
 * LATHALA CRM — GOOGLE APPS SCRIPT CONNECTOR
 * ----------------------------------------------------
 * Instructions:
 * 1. In your Google Sheet, click Extensions > Apps Script.
 * 2. Paste this entire code into Code.gs.
 * 3. Click Deploy > New deployment > Select type "Web app".
 * 4. Under "Execute as", choose "Me".
 * 5. Under "Who has access", choose "Anyone" (allows Lathala to POST/GET).
 * 6. Copy the Web App URL and paste it into Lathala's Settings > Google Sheets Sync.
 */

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  if (data.length === 0) {
    return ContentService.createTextOutput(JSON.stringify({ subscribers: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  var headers = data[0];
  var subscribers = [];
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var sub = {
      id: 'gs-' + i,
      name: '',
      email: '',
      role: '',
      department: '',
      status: 'pending',
      customData: {}
    };
    
    for (var j = 0; j < headers.length; j++) {
      var header = String(headers[j]).toLowerCase().trim();
      var val = row[j];
      
      if (header === 'name' || header === 'full name') sub.name = String(val);
      else if (header === 'email' || header === 'email address') sub.email = String(val);
      else if (header === 'role' || header === 'title') sub.role = String(val);
      else if (header === 'department' || header === 'dept') sub.department = String(val);
      else if (header === 'status') sub.status = String(val).toLowerCase() === 'sent' ? 'sent' : 'pending';
      else {
        sub.customData[headers[j]] = val;
      }
    }
    
    if (sub.email) {
      subscribers.push(sub);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    count: subscribers.length,
    subscribers: subscribers
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action || 'sync';
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    if (action === 'append') {
      var sub = body.subscriber;
      sheet.appendRow([
        sub.name,
        sub.email,
        sub.role,
        sub.department || 'General',
        sub.status || 'pending',
        new Date().toISOString()
      ]);
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Subscriber appended' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'update_status') {
      // Find row with matching email and update status
      var data = sheet.getDataRange().getValues();
      var emailIndex = -1;
      var statusIndex = -1;
      
      for (var j = 0; j < data[0].length; j++) {
        var h = String(data[0][j]).toLowerCase();
        if (h === 'email') emailIndex = j;
        if (h === 'status') statusIndex = j;
      }
      
      if (emailIndex !== -1 && statusIndex !== -1) {
        for (var i = 1; i < data.length; i++) {
          if (String(data[i][emailIndex]).toLowerCase() === String(body.email).toLowerCase()) {
            sheet.getRange(i + 1, statusIndex + 1).setValue(body.status);
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Unknown action' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`;

export const SUPABASE_MIGRATION_SQL = `-- LATHALA SUPABASE DATABASE SCHEMA
-- Run this in your Supabase SQL Editor to provision tables:

-- 1. Create Subscribers Table
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'Member',
  department_id TEXT,
  status TEXT DEFAULT 'pending',
  last_sent_at TIMESTAMPTZ,
  custom_data JSONB DEFAULT '{}'::jsonb
);

-- 2. Create Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL
);

-- 3. Create Projects / Newsletters Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  title TEXT NOT NULL,
  segment_id TEXT DEFAULT 'all',
  artboard_width INT DEFAULT 600,
  artboard_height INT DEFAULT 880,
  artboard_background TEXT DEFAULT '#F1EEE9',
  elements JSONB NOT NULL DEFAULT '[]'::jsonb,
  user_id TEXT -- For optional multi-tenant or Clerk/Supabase Auth owner
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- For public self-hosted instances (or add authenticated checks):
CREATE POLICY "Public full access for open source instances" 
ON public.subscribers FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public full access for departments" 
ON public.departments FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public full access for projects" 
ON public.projects FOR ALL USING (true) WITH CHECK (true);
`;
