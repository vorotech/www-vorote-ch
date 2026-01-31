/**
 * Email Sender Utility for Cloudflare Workers
 *
 * This module provides utilities for sending emails using Cloudflare's Email Routing API.
 * Uses mimetext for proper MIME formatting and dynamic imports to avoid build-time module resolution.
 *
 * @see https://developers.cloudflare.com/email-routing/email-workers/
 */

import type { EmailMessage } from 'cloudflare:email';
import { createMimeMessage } from 'mimetext';

export interface SimpleEmailOptions {
  from: {
    name?: string;
    addr: string;
  };
  to: string;
  subject: string;
  body: string;
  replyTo?: string;
}

// Helper to safely get the EmailMessage class
async function getEmailMessageClass(): Promise<typeof EmailMessage> {
  try {
    const pkg = 'cloudflare:email';
    const mod = await import(pkg);
    return mod.EmailMessage;
  } catch (error) {
    // Fallback mock for build time / non-Worker environments
    console.warn('Failed to load cloudflare:email module, using mock implementation');
    return class {
      constructor(
        public from: string,
        public to: string,
        public raw: string
      ) {}
    } as unknown as typeof EmailMessage;
  }
}

/**
 * Creates a simple email message with plain text content using mimetext
 *
 * @param options - Email configuration options
 * @returns EmailMessage instance ready to be sent
 *
 * @example
 * ```ts
 * const message = await createSimpleEmail({
 *   from: { name: 'Support', addr: 'noreply@example.com' },
 *   to: 'user@example.com',
 *   subject: 'Hello World',
 *   body: 'This is a test email',
 *   replyTo: 'support@example.com'
 * });
 * ```
 */
export async function createSimpleEmail(options: SimpleEmailOptions): Promise<EmailMessage> {
  const { from, to, subject, body, replyTo } = options;

  // Create MIME message
  const msg = createMimeMessage();
  msg.setSender(from);
  msg.setRecipient(to);
  msg.setSubject(subject);

  if (replyTo) {
    msg.setHeader('Reply-To', replyTo);
  }

  msg.addMessage({
    contentType: 'text/plain',
    data: body,
  });

  // Create EmailMessage with MIME content
  const EmailMessageClass = await getEmailMessageClass();
  return new EmailMessageClass(from.addr, to, msg.asRaw());
}

/**
 * Creates an HTML email message using mimetext
 *
 * @param options - Email configuration options
 * @returns EmailMessage instance ready to be sent
 */
export async function createHtmlEmail(options: SimpleEmailOptions & { htmlBody?: string }): Promise<EmailMessage> {
  const { from, to, subject, body, htmlBody, replyTo } = options;

  const msg = createMimeMessage();
  msg.setSender(from);
  msg.setRecipient(to);
  msg.setSubject(subject);

  if (replyTo) {
    msg.setHeader('Reply-To', replyTo);
  }

  // Add plain text version
  msg.addMessage({
    contentType: 'text/plain',
    data: body,
  });

  // Add HTML version if provided
  if (htmlBody) {
    msg.addMessage({
      contentType: 'text/html',
      data: htmlBody,
    });
  }

  const EmailMessageClass = await getEmailMessageClass();
  return new EmailMessageClass(from.addr, to, msg.asRaw());
}

/**
 * Sends an email using Cloudflare Email Routing
 *
 * @param emailSender - Cloudflare Email Sender binding from environment
 * @param message - EmailMessage instance to send
 * @returns Promise that resolves when email is sent
 * @throws Error if email sending fails
 *
 * @example
 * ```ts
 * const message = await createSimpleEmail({
 *   from: { addr: 'noreply@example.com' },
 *   to: 'user@example.com',
 *   subject: 'Hello',
 *   body: 'Test message'
 * });
 *
 * await sendEmail(env.EMAIL_SENDER, message);
 * ```
 */
export async function sendEmail(emailSender: SendEmail, message: EmailMessage): Promise<void> {
  try {
    await emailSender.send(message);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error(`Email delivery failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Creates and sends a simple email in one operation
 *
 * @param emailSender - Cloudflare Email Sender binding from environment
 * @param options - Email configuration options
 * @returns Promise that resolves when email is sent
 * @throws Error if email sending fails
 *
 * @example
 * ```ts
 * await sendSimpleEmail(env.EMAIL_SENDER, {
 *   from: { name: 'Support', addr: 'noreply@example.com' },
 *   to: 'user@example.com',
 *   subject: 'Feedback Received',
 *   body: 'Thank you for your feedback!',
 *   replyTo: 'feedback@example.com'
 * });
 * ```
 */
export async function sendSimpleEmail(emailSender: SendEmail, options: SimpleEmailOptions): Promise<void> {
  const message = await createSimpleEmail(options);
  await sendEmail(emailSender, message);
}
