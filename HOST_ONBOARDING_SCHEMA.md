# Host Onboarding & Verification – Data Model Proposal

This document describes how to persist host onboarding, KYC, GST and bank
verification information in Supabase using the existing `host_info` table.

It is written to match the current React implementation in
`src/components/CadreagoHotelBooking.jsx` and the Supabase services in
`src/services/authService.js`.

## 1. Existing `host_info` table

From your description the `host_info` table currently has:

- `id` (primary key)
- `host_id` (FK → `profiles.id`)
- `member_since` (timestamp)
- `response_rate` (numeric)
- `response_time` (text)
- `verified` (boolean)
- `languages` (text[] or text)
- `total_properties` (integer)
- `created_at` (timestamp)
- `updated_at` (timestamp)

The React app already uses this table via `updateHostInfo` in
`src/services/authService.js`, but until now it only stored basic host
metrics.

## 2. New columns for onboarding and verification

To support Aadhaar KYC, optional GST and bank verification, add these
columns to `host_info` in Supabase (SQL can be run from the SQL editor):

```sql
ALTER TABLE public.host_info
  ADD COLUMN IF NOT EXISTS aadhaar_number text,
  ADD COLUMN IF NOT EXISTS aadhaar_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS aadhaar_verified_at timestamptz,

  ADD COLUMN IF NOT EXISTS gst_registered boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS gst_number text,
  ADD COLUMN IF NOT EXISTS gst_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS gst_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS gst_tax_slab numeric(5,2),

  ADD COLUMN IF NOT EXISTS bank_account_number text,
  ADD COLUMN IF NOT EXISTS bank_ifsc text,
  ADD COLUMN IF NOT EXISTS bank_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS bank_verified_at timestamptz,

  ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;
```

Notes:

- `aadhaar_status`, `gst_status`, `bank_status` can use values:
  - `'pending' | 'otp_sent' | 'verified' | 'failed'`
- `verified` (existing column) should be treated as:
  - `true` when Aadhaar and bank are verified, and
  - GST is either not provided or verified.
- `gst_tax_slab` is meant for slabs like `5`, `12`, `18` (percent).

If you prefer stricter types, you can add CHECK constraints or use
Postgres enums for the status columns.

## 3. Where data is used in the React app

The following state lives in `CadreagoHotelBooking.jsx`:

- `aadhaar = { number, status }`
- `gstRegistered` (boolean)
- `gst = { number, status }`
- `bank = { account, ifsc, status }`
- `hostOnboardingCompleted` (boolean)

And verification gating logic:

- Host onboarding completion button:
  - Enabled when Aadhaar and bank are verified, and (if GST is provided)
    GST is verified.
- Host dashboard property activation:
  - Uses `hostIsVerified = aadhaar.status === 'verified' && bank.status === 'verified'`
    to allow toggling listings.

The app will:

1. Write these values into `host_info` via `updateHostInfo(hostId, hostInfoData)`.
2. Read them back using:
   - `getCurrentUser()` (which joins `profiles` + `host_info(*)`).
   - `fetchProfileById()` (same join).
3. Derive `hostOnboardingCompleted` and `hostIsVerified` from the stored
   statuses so the state survives reloads.

## 4. Suggested mapping: React state → `host_info`

When saving host onboarding:

- `aadhaar.number` → `aadhaar_number`
- `aadhaar.status` → `aadhaar_status`
- `gstRegistered` → `gst_registered`
- `gst.number` → `gst_number` (nullable when not provided)
- `gst.status` → `gst_status`
- `bank.account` → `bank_account_number`
- `bank.ifsc` → `bank_ifsc`
- `bank.status` → `bank_status`
- `hostOnboardingCompleted` → `onboarding_completed`
- `verified`:
  - `true` when:
    - `aadhaar_status = 'verified'`
    - `bank_status = 'verified'`
    - and either `gst_registered = false` or `gst_status = 'verified'`
  - `false` otherwise.

Timestamps:

- Set `aadhaar_verified_at`, `gst_verified_at`, `bank_verified_at` on the
  backend when a verification provider (Cashfree) confirms success.
- Set `onboarding_completed_at` when the host finishes the onboarding
  flow.

## 5. Cashfree verification flows (backend responsibility)

The React app is purely a client; the actual Cashfree integrations should
live in a secure backend (for example, serverless functions or a small
Node/Next.js API) that:

### Aadhaar KYC (with OTP)

- Endpoint 1 – start KYC:
  - `POST /api/kyc/aadhaar/start`
  - Request: `{ aadhaar_number }`
  - Calls Cashfree to send OTP.
  - Stores a short-lived KYC session in the database (separate table).
  - Updates `host_info.aadhaar_status = 'otp_sent'`.

- Endpoint 2 – verify OTP:
  - `POST /api/kyc/aadhaar/verify`
  - Request: `{ session_id, otp_code }`
  - Verifies via Cashfree.
  - On success:
    - `aadhaar_status = 'verified'`
    - `aadhaar_verified_at = now()`
  - On failure:
    - `aadhaar_status = 'failed'`

OTP rules from your requirements:

- OTP valid for up to 10 minutes.
- Allow resend after 1–2 minutes if OTP not received.

### GST collection (optional, no OTP)

- Collects:
  - `gst_number` (GSTIN)
  - `gst_tax_slab` (5 / 12 / 18, etc.)
- Verification is optional because Cadreago is the primary supplier and
  pays GST on behalf of the host.
- Backend may validate GSTIN format or hit a GST validation API and set:
  - `gst_status = 'verified' | 'failed'`.

### Bank verification (penny drop / reverse)

- Endpoint:
  - `POST /api/kyc/bank/verify`
  - Request: `{ account_number, ifsc }`
  - Calls Cashfree’s bank verification / penny-drop API.
  - On success:
    - `bank_status = 'verified'`
    - `bank_verified_at = now()`
  - On failure:
    - `bank_status = 'failed'`

## 6. Enforcement before activating listings

Front-end gating:

- The React app already disables the “Activate listing” button if:
  - Aadhaar is not verified, or
  - Bank is not verified.
- With `host_info` persisted, the same gating will apply after reloads.

Backend/RLS gating (recommended):

- Add a CHECK or trigger on `properties` that prevents setting
  `status = 'active'` for a property unless its host has:
  - `host_info.verified = true`.

This ensures a property cannot be activated via direct API calls if the
host is not fully verified, even if the UI is bypassed.

