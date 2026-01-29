# Email Module

A generic, reusable email sending module for Cloudflare Workers, designed for use with Cloudflare Email Routing API in Next.js Edge Runtime.

## Overview

This module provides a clean, type-safe interface for sending emails using Cloudflare's Email Routing service. It's based on the [official Cloudflare Email Workers documentation](https://developers.cloudflare.com/email-routing/email-workers/).

**Design Philosophy**: This library provides generic utilities only. Configuration (email addresses, binding names) should be defined in your application code where the email sender is used, not in this library. This keeps the lib folder clean and reusable across different projects.

## Features

- ✅ **Type-safe** - Full TypeScript support with proper interfaces
- ✅ **Simple API** - Easy-to-use functions for common email tasks
- ✅ **Generic & Reusable** - No hardcoded values or project-specific configuration
- ✅ **Multi-binding support** - Works with any EmailSenderBinding from wrangler
- ✅ **Specialized helpers** - Pre-built functions for common use cases (feedback emails, etc.)
- ✅ **Error handling** - Comprehensive error handling and logging
- ✅ **Well-documented** - Extensive comments and examples
- ✅ **Edge runtime compatible** - Works with Next.js Edge Runtime and Cloudflare Workers

## Files

- **`sender.ts`** - Core email sending utilities
- **`index.ts`** - Clean module exports
- **`examples.ts`** - Comprehensive usage examples
- **`README.md`** - This documentation file

## Quick Start

### 1. Configure Email Bindings in wrangler.jsonc

Add your email sender bindings with allowed addresses:

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

### 2. Define Configuration Locally in Your Route

```typescript
import { createFeedbackEmail, sendEmail } from '@/lib/email';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

// Define configuration where you use it
const EMAIL_CONFIG = {
  bindingName: 'SEND_FEEDBACK',
  fromAddress: 'noreply@vorote.ch',
  toAddress: 'hello@vorote.ch',
} as const;

export async function POST(request: NextRequest) {
  const env = process.env as any;
  const { email, message } = await request.json();

  // Access the binding using your local config
  const emailSender = env[EMAIL_CONFIG.bindingName];

  // Create and send email
  const emailMessage = createFeedbackEmail({
    from: EMAIL_CONFIG.fromAddress,
    to: EMAIL_CONFIG.toAddress,
    userEmail: email,
    message: message,
  });

  await sendEmail(emailSender, emailMessage);

  return new Response('Email sent!');
}
```

## API Reference

#### `createSimpleEmail(options)`

Creates a simple plain-text email message.

```typescript
const message = createSimpleEmail({
  from: 'sender@example.com',
  to: 'recipient@example.com',
  subject: 'Test Email',
  body: 'Email content...',
  replyTo: 'reply@example.com' // Optional
});
```

#### `sendEmail(emailSender, message)`

Sends an email message using the Cloudflare Email Sender binding.

```typescript
await sendEmail(emailSender, message);
```

#### `sendSimpleEmail(emailSender, options)`

Creates and sends a simple email in one operation.

```typescript
await sendSimpleEmail(emailSender, {
  from: 'sender@example.com',
  to: 'recipient@example.com',
  subject: 'Welcome!',
  body: 'Thank you for signing up.',
});
```

### Specialized Helpers

#### `createFeedbackEmail(options)`

Creates a pre-formatted feedback email with proper subject and structure.

```typescript
const message = createFeedbackEmail({
  from: 'noreply@example.com',
  to: 'feedback@example.com',
  userEmail: 'customer@example.com',
  message: 'Great service!'
});

await sendEmail(emailSender, message);
```

## Usage Examples

### Example 1: Feedback Form with Local Configuration (Recommended)

```typescript
import { createFeedbackEmail, sendEmail } from '@/lib/email';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

// Define configuration locally
const EMAIL_CONFIG = {
  bindingName: 'SEND_FEEDBACK',
  fromAddress: 'noreply@vorote.ch',
  toAddress: 'hello@vorote.ch',
} as const;

export async function POST(request: NextRequest) {
  const env = process.env as any;
  const { email, message } = await request.json();

  const emailSender = env[EMAIL_CONFIG.bindingName];

  const emailMessage = createFeedbackEmail({
    from: EMAIL_CONFIG.fromAddress,
    to: EMAIL_CONFIG.toAddress,
    userEmail: email,
    message: message,
  });

  await sendEmail(emailSender, emailMessage);

  return new Response('Feedback sent!');
}
```

### Example 2: Error Handling

```typescript
const EMAIL_CONFIG = {
  bindingName: 'SEND_FEEDBACK',
  fromAddress: 'noreply@vorote.ch',
  toAddress: 'hello@vorote.ch',
} as const;

try {
  const env = process.env as any;
  const emailSender = env[EMAIL_CONFIG.bindingName];
  
  await sendSimpleEmail(emailSender, {
    from: EMAIL_CONFIG.fromAddress,
    to: 'user@example.com',
    subject: 'Test',
    body: 'Test message',
  });
} catch (error) {
  console.error('Failed to send email:', error);
  // Handle error appropriately
}
```

### Example 3: Batch Sending

```typescript
const NEWSLETTER_CONFIG = {
  bindingName: 'SEND_NEWSLETTER',
  fromAddress: 'newsletter@example.com',
  toAddress: 'subscribers@example.com',
} as const;

const env = process.env as any;
const emailSender = env[NEWSLETTER_CONFIG.bindingName];

const recipients = ['user1@example.com', 'user2@example.com'];

const results = await Promise.allSettled(
  recipients.map(recipient =>
    sendSimpleEmail(emailSender, {
      from: NEWSLETTER_CONFIG.fromAddress,
      to: recipient,
      subject: 'Monthly Update',
      body: 'Check out what\'s new...',
    })
  )
);
```

## Advanced Usage with MIME

For more complex emails (HTML, attachments, multiple recipients), you can use the `mimetext` library:

### 1. Install mimetext

```bash
pnpm add mimetext
```

### 2. Create MIME Email

```typescript
import { createMimeMessage } from "mimetext";
import { EmailMessage, sendEmail } from '@/lib/email';

const msg = createMimeMessage();
msg.setSender({ name: "Your Name", addr: "sender@example.com" });
msg.setRecipient("recipient@example.com");
msg.setSubject("HTML Email");
msg.addMessage({
  contentType: "text/html",
  data: `<h1>Hello!</h1><p>This is <strong>HTML</strong> email.</p>`,
});

const message = new EmailMessage(
  "sender@example.com",
  "recipient@example.com",
  msg.asRaw()
);

await sendEmail(env.EMAIL_SENDER, message);
```

## TypeScript Types

```typescript
interface EmailSenderBinding {
  send(message: EmailMessage): Promise<void>;
}

interface SimpleEmailOptions {
  from: string;
  to: string;
  subject: string;
  body: string;
  replyTo?: string;
}
```

## Best Practices

1. **Define configuration locally** - Define email configuration in your route files where you use it, not in the lib folder
2. **Use constants for config** - Use `const CONFIG = { ... } as const;` to make configuration type-safe and clear
3. **Always use try-catch** - Email sending can fail for various reasons
4. **Validate inputs** - Check email addresses and content before sending
5. **Use environment-specific senders** - Different addresses for dev/staging/production
6. **Handle missing bindings gracefully** - The email sender binding may not be available in local development
7. **Log appropriately** - Log errors but be careful not to log sensitive user data

## Troubleshooting

### Email not sent in local development

The `EMAIL_SENDER` binding is only available when deployed to Cloudflare. In local development, emails won't be sent, but the code will log a warning and continue.

### TypeScript errors

Make sure you have run `pnpm cf-typegen` to generate Cloudflare type definitions:

```bash
pnpm cf-typegen
```

### Email routing not working

1. Verify your domain is configured in Cloudflare Dashboard under Email Routing
2. Check your `wrangler.jsonc` has the correct binding configuration
3. Ensure the `from` address matches an allowed domain

## Related Documentation

- [Cloudflare Email Routing](https://developers.cloudflare.com/email-routing/)
- [Email Workers Documentation](https://developers.cloudflare.com/email-routing/email-workers/)
- [Next.js Edge Runtime](https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes)
