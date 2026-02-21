# HourTrack — Complete Setup Guide
# Step-by-step from zero to live, including your real motor data

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR FILES (everything you need is in this folder)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  index.html     ← The complete app (deploy this)
  manifest.json  ← PWA install config
  sw.js          ← Offline support
  setup.sql      ← Step A: Run this FIRST (creates the tables)
  seed_data.sql  ← Step B: Run this SECOND (loads your 153 motors)
  README.md      ← This guide

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT WILL BE IN YOUR APP AFTER SETUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

153 motors from your February 2026 field sheets:
  ✓ Panel 185CC12A/B  — Substation 1
  ✓ Panel 185CC11A/B  — Substation 1
  ✓ Panel 185CB11     — Substation 1
  ✓ Panel 185CC11E    — Substation 1
  ✓ VSD 185BU11       — Substation 1
  ✓ Panel 285CC11A/B  — Substation 2
  ✓ Panel 285CC11E    — Substation 2
  ✓ Panel 285CC12A/B  — Substation 2
  ✓ Panel 285CB11     — Substation 2
  ✓ VSD 285BU11       — Substation 2
  + Counter replacement flags on 188K002AM01 and 292P001A-M01


═══════════════════════════════════════════════
STEP 1 — Create free Supabase account
═══════════════════════════════════════════════

1. Go to https://supabase.com in your browser

2. Click "Start your project" — sign up free (no credit card)

3. Click "New project" and fill in:
     Project name:      HourTrack
     Database Password: (something strong, write it down)
     Region:            Europe West  (closest for Middle East)

4. Click "Create new project" and wait ~2 minutes


═══════════════════════════════════════════════
STEP 2 — Create the database tables
═══════════════════════════════════════════════

1. In the left sidebar, click "SQL Editor"

2. Click "New query"

3. Open setup.sql in Notepad → Ctrl+A, Ctrl+C to copy all

4. Paste into Supabase SQL Editor → click green "Run" button

5. You should see: "Success. No rows returned" ✓


═══════════════════════════════════════════════
STEP 3 — Load all 153 motors (your real data)
═══════════════════════════════════════════════

1. In SQL Editor, click "New query" again

2. Open seed_data.sql in Notepad → Ctrl+A, Ctrl+C to copy

3. Paste into Supabase SQL Editor → click "Run"

4. "Success. No rows returned" ✓

5. To verify: click "Table Editor" in sidebar → click "assets"
   You should see all your motors listed.


═══════════════════════════════════════════════
STEP 4 — Turn off email confirmation
═══════════════════════════════════════════════

This lets your team sign in immediately without clicking emails.

1. Left sidebar → "Authentication"
2. Click "Settings"
3. Find "Enable email confirmations" → toggle it OFF
4. Click "Save"


═══════════════════════════════════════════════
STEP 5 — Get your two connection keys
═══════════════════════════════════════════════

1. Left sidebar (very bottom) → gear icon "Settings"
2. Click "API"
3. Copy these two values and keep them in Notepad:

   ┌────────────────────────────────────────────────┐
   │  Project URL:                                  │
   │  https://xxxxxxxxxx.supabase.co                │
   │                                                │
   │  anon public key (under "Project API keys"):   │
   │  eyJhbGciOiJIUzI1NiIsInR5cCI6...              │
   └────────────────────────────────────────────────┘


═══════════════════════════════════════════════
STEP 6 — Add your keys to index.html
═══════════════════════════════════════════════

1. Right-click index.html → Open with → Notepad

2. Near the top, find these 2 lines:
     const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
     const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';

3. Replace YOUR_SUPABASE_URL_HERE with your Project URL
   Replace YOUR_SUPABASE_ANON_KEY_HERE with your anon key
   (keep the single quotes ' ' on both sides!)

   Example after editing:
     const SUPABASE_URL = 'https://abcde.supabase.co';
     const SUPABASE_KEY = 'eyJhbGciOiJIUzI1Ni...';

4. Ctrl+S to save


═══════════════════════════════════════════════
STEP 7 — Deploy to Netlify
═══════════════════════════════════════════════

1. Go to https://netlify.com and log in

2. Drag this entire folder onto the Netlify deploy area

3. In ~30 seconds you get a live URL like:
   https://amazing-name-12345.netlify.app

4. Optional: Site settings → Change site name to something
   like "hourtrack-yourfacility"


═══════════════════════════════════════════════
STEP 8 — First login (you become Admin)
═══════════════════════════════════════════════

1. Open your Netlify URL

2. Click "Sign Up" and create your account

3. You are automatically Admin (first account always is)

4. You will see all 153 motors from your field sheets!


═══════════════════════════════════════════════
STEP 9 — Add team members
═══════════════════════════════════════════════

1. Share the Netlify URL with colleagues

2. They click "Sign Up" → they start as Viewer (read-only)

3. You go to the "Users" tab in the app

4. Find their email → change role using the dropdown:

   Viewer    — See all data and reports. Cannot edit.
   Engineer  — Add monthly readings, log replacements.
   Admin     — Everything + close months, manage users.


═══════════════════════════════════════════════
MONTHLY WORKFLOW
═══════════════════════════════════════════════

Each month after collecting readings:

1. Go to "Monthly Entry" tab
2. Select the month
3. Enter each motor's reading — the app validates live
4. Click "Save All"
5. Admin clicks "Close Month" to lock the period

For counter replacements → use the "Replacements" tab
For reports + CSV export → use the "Reports" tab


═══════════════════════════════════════════════
TROUBLESHOOTING
═══════════════════════════════════════════════

Blank page / stuck loading:
  → Check SUPABASE_URL and SUPABASE_KEY in index.html
  → Make sure no extra spaces, quotes are in place

"Invalid API key" error:
  → Re-copy the "anon public" key from Supabase Settings → API
  → Do NOT use the "service_role" key

Data not appearing after login:
  → Click ↻ Sync button (top right of the app)
  → If still empty, re-run seed_data.sql

User can't log in after signing up:
  → Check that email confirmation is turned OFF (Step 4)

Team member is Viewer when they should be Engineer:
  → That's correct behavior — you promote them in Users tab
