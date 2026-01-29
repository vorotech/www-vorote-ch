/**
 * Email Sender Usage Examples
 *
 * This file demonstrates various ways to use the email-sender utility.
 * Based on Cloudflare Email Routing API examples.
 *
 * @see https://developers.cloudflare.com/email-routing/email-workers/
 */

import { createSimpleEmail, sendEmail, sendSimpleEmail, type EmailSenderBinding } from './sender';

// Example 1: Simple email with all options manually specified
export async function exampleSimpleEmail(env: { EMAIL_SENDER: EmailSenderBinding }) {
  const message = createSimpleEmail({
    from: 'noreply@example.com',
    to: 'user@example.com',
    subject: 'Welcome to Our Service',
    body: 'Thank you for signing up! We are excited to have you on board.',
    replyTo: 'support@example.com',
  });

  await sendEmail(env.EMAIL_SENDER, message);
}

// Example 2: One-liner email sending
export async function exampleQuickEmail(env: { EMAIL_SENDER: EmailSenderBinding }) {
  await sendSimpleEmail(env.EMAIL_SENDER, {
    from: 'noreply@example.com',
    to: 'user@example.com',
    subject: 'Password Reset',
    body: 'Click the link below to reset your password:\n\nhttps://example.com/reset/token123',
  });
}

// Example 3: Custom email with multiple headers
export async function exampleCustomEmail(env: { EMAIL_SENDER: EmailSenderBinding }) {
  const message = createSimpleEmail({
    from: 'newsletter@example.com',
    to: 'subscriber@example.com',
    subject: 'Monthly Newsletter - January 2026',
    body: `
Hello Subscriber,

Here are the highlights from this month:

1. New Feature Launch
2. Community Spotlight
3. Upcoming Events

Best regards,
The Team
    `.trim(),
    replyTo: 'no-reply@example.com',
  });

  await sendEmail(env.EMAIL_SENDER, message);
}

// Example 5: Error handling
export async function exampleWithErrorHandling(env: { EMAIL_SENDER: EmailSenderBinding }) {
  try {
    await sendSimpleEmail(env.EMAIL_SENDER, {
      from: 'noreply@example.com',
      to: 'user@example.com',
      subject: 'Test Email',
      body: 'This is a test email.',
    });

    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Failed to send email:', error);
    // Handle error - maybe retry, log to monitoring service, etc.
    throw error;
  }
}

// Example 6: Use in a Cloudflare Worker (Next.js API route with edge runtime)
// This is similar to the Cloudflare example you provided

interface Env {
  EMAIL_SENDER: EmailSenderBinding;
}

export async function POST(request: Request, { env }: { env: Env }) {
  try {
    const { recipient, subject, message } = (await request.json()) as {
      recipient: string;
      subject: string;
      message: string;
    };

    // Validate inputs
    if (!recipient || !subject || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Send email
    await sendSimpleEmail(env.EMAIL_SENDER, {
      from: 'noreply@example.com',
      to: recipient,
      subject: subject,
      body: message,
    });

    return new Response(JSON.stringify({ success: true, message: 'Email sent successfully!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    return new Response(JSON.stringify({ error: 'Failed to send email' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

// Example 7: Batch email sending (e.g., for notifications)
export async function exampleBatchEmails(env: { EMAIL_SENDER: EmailSenderBinding }, recipients: string[]) {
  const results = await Promise.allSettled(
    recipients.map((recipient) =>
      sendSimpleEmail(env.EMAIL_SENDER, {
        from: 'notifications@example.com',
        to: recipient,
        subject: 'Important Update',
        body: 'We have an important update to share with you...',
      })
    )
  );

  const succeeded = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  console.log(`Batch email sending complete: ${succeeded} sent, ${failed} failed`);

  return { succeeded, failed };
}

/*
 * Example 8: Using Local Configuration
 *
 * Define configuration locally where you use it, keeping the lib folder
 * generic and free of specific hardcoded values.
 */

export async function exampleWithLocalConfiguration() {
  // Define configuration inline or in your route file
  const EMAIL_CONFIG = {
    bindingName: 'SEND_FEEDBACK',
    fromAddress: 'noreply@vorote.ch',
    toAddress: 'hello@vorote.ch',
  } as const;

  // Access the environment using the binding name from config
  const env = process.env as any;
  const emailSender = env[EMAIL_CONFIG.bindingName]; // Gets env.SEND_FEEDBACK

  // Create and send email using local configuration
  const message = createSimpleEmail({
    from: EMAIL_CONFIG.fromAddress,
    to: EMAIL_CONFIG.toAddress,
    subject: 'New Feedback Received',
    replyTo: 'user@example.com',
    body: `New feedback from the website:\n\n` + `Great product!\n\n` + `---\n` + `From: user@example.com`,
  });

  await sendEmail(emailSender, message);
}

/*
 * ADVANCED: Using with mimetext library
 *
 * If you need more advanced features like HTML emails, attachments, or complex MIME structures,
 * you can install the 'mimetext' package and use it as shown in the Cloudflare example:
 *
 * ```bash
 * pnpm add mimetext
 * ```
 *
 * Then create a MIME email:
 *
 * ```typescript
 * import { createMimeMessage } from "mimetext";
 * import { EmailMessage } from "./sender";
 *
 * const msg = createMimeMessage();
 * msg.setSender({ name: "Your Name", addr: "sender@example.com" });
 * msg.setRecipient("recipient@example.com");
 * msg.setSubject("An email with HTML content");
 * msg.addMessage({
 *   contentType: "text/html",
 *   data: `<h1>Hello!</h1><p>This is an <strong>HTML</strong> email.</p>`,
 * });
 *
 * const message = new EmailMessage(
 *   "sender@example.com",
 *   "recipient@example.com",
 *   msg.asRaw()
 * );
 *
 * await sendEmail(env.EMAIL_SENDER, message);
 * ```
 */
