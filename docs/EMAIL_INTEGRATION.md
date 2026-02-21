# Email Integration

**vorote.ch** uses a transactional email system powered by **Resend** and validated with **Cloudflare Turnstile**.

The integration logic is modularized in `lib/email`.

## ⚙️ Configuration

The following environment variables are required for the email system to function:

| Variable | Description | Location |
| :--- | :--- | :--- |
| `RESEND_API_KEY` | Your Resend API Key (`re_...`) | `.env` (Backend) |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile Secret Key | `.env` (Backend) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile Site Key | `.env.local` (Frontend) |
| `EMAIL_SUBJECT_PREFIX` | Optional prefix for email subjects (e.g., `[Local] `) | `.env` (Backend) |

## 🚀 How It Works

1.  **Frontend Form**:
    -   User fills out the contact form.
    -   A Turnstile token is generated client-side using `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
    -   The form submits `email`, `message`, and `token` to `/api/feedback`.

2.  **API Route (`/api/feedback`)**:
    -   **Validation**:
        -   Checks for required fields (`email`, `message`).
        -   Validates email format using Regex.
        -   Verifies the Turnstile token with Cloudflare's `siteverify` endpoint using `TURNSTILE_SECRET_KEY`.
    -   **Sending**:
        -   Constructs an email payload.
        -   Prepends `EMAIL_SUBJECT_PREFIX` if set.
        -   Calls `resend.emails.send(...)` using the `RESEND_API_KEY`.

3.  **Local Development**:
    -   If `RESEND_API_KEY` is missing in your local `.env`, the system will use a **Mock Sender**.
    -   The email content (To, From, Subject, Body) will be logged to the server console using `console.info`.
    -   This allows you to test the full flow without sending real emails or needing valid credentials.

## 📦 Key Files

*   `app/api/feedback/route.ts`: Main API endpoint handling validation and sending.
*   `lib/email/sender.ts`: Core utility that interfaces with the Resend SDK.
*   `lib/email/index.ts`: Public API for the email module.
