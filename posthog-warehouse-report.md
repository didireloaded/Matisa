# PostHog Data Warehouse — Source Setup Report

**Date:** 2026-08-07  
**Project:** Default project (ID: 243318)

---

## Summary

No sources were automatically created via the CLI — credentials were not provided for any of the three detected sources. All three need to be completed through the PostHog browser UI using the links below.

---

## Sources Detected

| Source | Kind | Status |
|--------|------|--------|
| Supabase | Postgres (Session pooler) | Needs browser setup |
| Resend | Resend | Needs browser setup |
| Sentry | Sentry | Needs browser setup |

---

## Manual Setup Steps

### 1. Supabase (as Postgres)

Open this URL to connect your Supabase database as a Postgres source:

**[Connect Supabase → PostHog](https://eu.i.posthog.com/project/243318/data-warehouse/new-source?kind=Postgres&utm_source=wizard&utm_campaign=warehouse-source)**

When filling in the form, use the **Session pooler** credentials (not the direct host):

- **Host:** `aws-0-<region>.pooler.supabase.com` — find in Supabase → Settings → Database → Connection pooling → Session mode
- **Port:** `6543`
- **Database:** `postgres`
- **User:** `postgres.<your-project-ref>` — project ref is in Supabase → Settings → General
- **Password:** your database password (Supabase → Settings → Database → Database password) — NOT the anon key or service_role JWT

### 2. Resend

Open this URL to connect Resend:

**[Connect Resend → PostHog](https://eu.i.posthog.com/project/243318/data-warehouse/new-source?kind=Resend&utm_source=wizard&utm_campaign=warehouse-source)**

- You need a **full-access** API key (not the send-only restricted key that's likely in your `.env`)
- Create one at [resend.com/api-keys](https://resend.com/api-keys) — it needs read access to Audiences, Broadcasts, Contacts, Domains, and Emails

### 3. Sentry

Open this URL to connect Sentry:

**[Connect Sentry → PostHog](https://eu.i.posthog.com/project/243318/data-warehouse/new-source?kind=Sentry&utm_source=wizard&utm_campaign=warehouse-source)**

- You need an **internal integration token** (not a DSN or personal user token)
- Create one in Sentry → Settings → Developer Settings → Internal Integrations, with these scopes:
  - `alerts:read`, `event:read`, `member:read`, `org:integrations`, `org:read`, `project:read`, `team:read`
- You will also need your Sentry organization slug (visible in your Sentry URL: `sentry.io/organizations/<slug>/`)

---

## Files Modified or Created

- **`posthog-warehouse-report.md`** — this report (created)

No application source files were modified. This skill only configures external data connections in PostHog.
