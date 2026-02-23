# Snow Removal Vercel Setup (What to fill + where to find it)

Use this file when configuring environment variables for the Snow Removal lead form.

## Where to add in Vercel

In Vercel:

1. Open your project.
2. Go to **Settings** -> **Environment Variables**.
3. Add each variable below for the environments you want:
   - Production
   - Preview
   - Development

---

## Required variables (frontend EmailJS)

These are required for client-side EmailJS sending.

### `NEXT_PUBLIC_EMAILJS_SERVICE_ID`

- **Where to find it:** EmailJS Dashboard -> **Email Services** -> your connected service (`service_gd7hfdd`)
- **Example value:** `service_gd7hfdd`

### `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`

- **Where to find it:** EmailJS Dashboard -> **Email Templates** -> selected template ID
- **Example value:** `template_xxxxxxx`

### `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`

- **Where to find it:** EmailJS Dashboard -> **Account** -> **API Keys** -> Public Key
- **Example value:** `xxxxxxxxxxxxxxxx`

---

## Optional but recommended (backend dispatch notification)

These enable server-side delivery from `/api/snow-removal/contact` using Resend.

### `RESEND_API_KEY`

- **Where to find it:** Resend Dashboard -> **API Keys**
- **Example value:** `re_xxxxxxxxxxxxxxxxxx`

### `SNOW_REMOVAL_FROM_EMAIL`

- **Where to find it:** A verified sender/domain in Resend
- **Example value:** `snow@yourdomain.com`

### `SNOW_REMOVAL_TO_EMAIL`

- **Where to choose it:** The inbox that should receive leads
- **Example value:** `njsnowremoval26@gmail.com`

---

## Automation commands

Run these from the repo root:

- `npm run snow:env:check` (warn-only; safe for quick validation)
- `npm run snow:env:check:strict` (fails if required values are missing)

`npm run pipeline:deploy-checks` now includes the Snow Removal env check automatically.

---

## Post-deploy verification endpoint

After deploying, open:

- `https://<your-domain>/api/health/snow-removal`

What it tells you:

- `ready: true` -> all required Snow Removal env vars are configured
- `ready: false` -> one or more required vars are missing
- `checks.required.missing` -> exact required keys still missing
- `checks.optional.missing` -> optional backend-delivery keys not set yet

This endpoint never returns secret values; it only returns readiness metadata.
