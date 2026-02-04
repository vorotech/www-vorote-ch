# Email Integration Guide

## Overview

This project uses Cloudflare Email Routing for sending emails, with automatic environment detection to provide seamless integration across development, preview, and production environments.

## How It Works

### Environment Auto-Detection

The email system automatically detects your environment and uses the appropriate implementation:

```typescript
// In your code (app/api/feedback/route.ts)
import { getEmailSender } from '@/lib/email';

const emailSender = await getEmailSender('SEND_FEEDBACK');
await sendEmail(emailSender, message);
```

**Behind the scenes:**
- **Development**: Uses `MockEmailSender` (logs to console)
- **Preview/Production**: Uses real Cloudflare Email Routing binding

### Development Mode

When you run `pnpm dev`, emails are automatically mocked:

```bash
$ pnpm dev
# Submit feedback form...

[Email] Using mock email sender for development (binding 'SEND_FEEDBACK' not found)

┌─────────────────────────────────────────────────────────────┐
│ 📧 MOCK EMAIL SENDER (Development Mode)
├─────────────────────────────────────────────────────────────┤
│ From: noreply@vorote.ch
│ To: hello@vorote.ch
│ Subject: New Feedback: Website Feedback
│ Message: Your feedback message here...
├─────────────────────────────────────────────────────────────┤
│ 💡 To test with real emails, use: pnpm preview
└─────────────────────────────────────────────────────────────┘
```

### Preview Mode

When you run `pnpm preview`, real Cloudflare bindings are used:

```bash
$ pnpm preview
# Submit feedback form...

[Email] Using Cloudflare email binding: SEND_FEEDBACK
[wrangler:inf] send_email binding called with the following message: /tmp/.../email/abc123.eml
```

**Behavior:**
- Uses real Cloudflare Email Routing code path
- Emails saved as `.eml` files locally (via wrangler)
- You can open `.eml` files to preview the actual email

### Production Mode

When deployed with `pnpm deploy`, emails are sent for real:

```bash
$ pnpm deploy
# ... deploy completes ...
# Submit feedback from live site - real email delivered!
```

## Configuration

All email configuration is in `wrangler.jsonc`:

```jsonc
{
  "send_email": [
    {
      "name": "SEND_FEEDBACK",
      "allowed_destination_addresses": ["hello@vorote.ch"],
      "allowed_sender_addresses": ["noreply@vorote.ch"]
    }
  ]
}
```

### Prerequisites for Preview/Production

1. **Enable Email Routing** in Cloudflare Dashboard for your domain
2. **Verify destination addresses** (e.g., hello@vorote.ch)
3. **Configure wrangler.jsonc** with allowed addresses (already done)

## Usage Example

Here's how to use email sending in your API routes:

```typescript
import { createHtmlEmail, sendEmail, getEmailSender } from '@/lib/email';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  // Create email
  const emailMessage = await createHtmlEmail({
    from: { addr: 'noreply@example.com' },
    to: 'recipient@example.com',
    subject: 'Hello World',
    body: 'Plain text version',
    htmlBody: '<h1>HTML version</h1>',
    replyTo: 'reply@example.com',
  });

  // Get sender (automatically uses mock in dev, real in preview/prod)
  const emailSender = await getEmailSender('SEND_FEEDBACK');

  // Send email
  await sendEmail(emailSender, emailMessage);

  return Response.json({ success: true });
}
```

## API Reference

### Core Functions

#### `getEmailSender(bindingName: string)`

Automatically detects the environment and returns the appropriate email sender.

```typescript
const sender = await getEmailSender('SEND_FEEDBACK');
// Development: Returns MockEmailSender
// Preview/Production: Returns real Cloudflare binding
```

#### `createSimpleEmail(options)`

Creates a simple plain-text email.

```typescript
const message = await createSimpleEmail({
  from: 'sender@example.com',
  to: 'recipient@example.com',
  subject: 'Test Email',
  body: 'Email content...',
  replyTo: 'reply@example.com' // Optional
});
```

#### `createHtmlEmail(options)`

Creates an email with both plain text and HTML versions.

```typescript
const message = await createHtmlEmail({
  from: { addr: 'sender@example.com', name: 'Sender Name' },
  to: 'recipient@example.com',
  subject: 'HTML Email',
  body: 'Plain text fallback',
  htmlBody: '<h1>HTML content</h1>',
  replyTo: 'reply@example.com' // Optional
});
```

#### `sendEmail(sender, message)`

Sends an email message.

```typescript
await sendEmail(emailSender, message);
```

#### `sendSimpleEmail(sender, options)`

Creates and sends a simple email in one operation.

```typescript
await sendSimpleEmail(emailSender, {
  from: 'sender@example.com',
  to: 'recipient@example.com',
  subject: 'Welcome!',
  body: 'Thank you for signing up.',
});
```

### TypeScript Types

```typescript
interface EmailSendResult {
  messageId: string;
}

interface SendEmail {
  send(message: EmailMessage): Promise<EmailSendResult>;
}

interface SimpleEmailOptions {
  from: string;
  to: string;
  subject: string;
  body: string;
  replyTo?: string;
}
```

## More Examples

### Error Handling

```typescript
try {
  const sender = await getEmailSender('SEND_FEEDBACK');
  await sendSimpleEmail(sender, {
    from: 'noreply@example.com',
    to: 'user@example.com',
    subject: 'Test',
    body: 'Test message',
  });
} catch (error) {
  console.error('Failed to send email:', error);
  // Handle error appropriately
}
```

### Batch Sending

```typescript
const sender = await getEmailSender('SEND_NEWSLETTER');
const recipients = ['user1@example.com', 'user2@example.com'];

const results = await Promise.allSettled(
  recipients.map(recipient =>
    sendSimpleEmail(sender, {
      from: 'newsletter@example.com',
      to: recipient,
      subject: 'Monthly Update',
      body: 'Check out what\'s new...',
    })
  )
);
```

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│              Application Code (API Route)                │
└────────────────────┬─────────────────────────────────────┘
                     │
                     │ getEmailSender(bindingName)
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│            Environment Auto-Detection                    │
│              (lib/email/mock-sender.ts)                  │
└─────────┬──────────────────────────┬─────────────────────┘
          │                          │
   ┌──────▼──────┐          ┌────────▼────────┐
   │ Development │          │ Cloudflare      │
   │ MockSender  │          │ Real Binding    │
   │             │          │                 │
   │ Console Log │          │ Email Delivery  │
   └─────────────┘          └─────────────────┘
```

## Files

- **`lib/email/sender.ts`** - Core email creation and sending functions
- **`lib/email/mock-sender.ts`** - Mock email sender
- **`lib/email/index.ts`** - Module exports
- **`lib/email/examples.ts`** - Usage examples
- **`lib/email/env.ts`** - Environment detection
- **`app/api/feedback/route.ts`** - API handler

## Testing Workflow

### 1. Local Development
```bash
pnpm dev
# Fill out feedback form
# Check console for email output
```

### 2. Test with Cloudflare Locally
```bash
pnpm preview
# Fill out feedback form  
# Check wrangler output for .eml file path
# Open .eml file to preview
```

### 3. Production
```bash
pnpm deploy
# Test from live site
# Real emails delivered!
```

## Best Practices

1. **Use getEmailSender()** - Always use `getEmailSender()` instead of accessing bindings directly
2. **Wrap in try-catch** - Email sending can fail for various reasons
3. **Validate inputs** - Check email addresses and content before sending
4. **Log appropriately** - Log errors but be careful not to log sensitive user data
5. **Use constants for config** - Define email addresses as constants for reusability

## Troubleshooting

### Email not logging in development?

Check that you're importing from `@/lib/email`:
```typescript
import { getEmailSender } from '@/lib/email';
```

### Want to see the email content more clearly?

The mock sender logs to console. Check your terminal where `pnpm dev` is running.

### Need to test actual email delivery?

Use `pnpm preview` to test with real Cloudflare bindings locally, or deploy to a staging environment.

## Related Documentation

- [Cloudflare Email Routing](https://developers.cloudflare.com/email-routing/)
- [Email Workers - Send Email](https://developers.cloudflare.com/email-routing/email-workers/send-email-workers/)
