/**
 * Email Sender Utility for Cloudflare Workers
 *
 * This module provides utilities for sending emails using Cloudflare's Email Routing API.
 * Uses mimetext for proper MIME message formatting.
 *
 * @see https://developers.cloudflare.com/email-routing/email-workers/
 */

import { EmailMessage } from 'cloudflare:email';
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

/**
 * Creates a simple email message with plain text content using mimetext
 *
 * @param options - Email configuration options
 * @returns EmailMessage instance ready to be sent
 *
 * @example
 * ```ts
 * const message = createSimpleEmail({
 *   from: { name: 'Support', addr: 'noreply@example.com' },
 *   to: 'user@example.com',
 *   subject: 'Hello World',
 *   body: 'This is a test email',
 *   replyTo: 'support@example.com'
 * });
 * ```
 */
export function createSimpleEmail(options: SimpleEmailOptions): EmailMessage {
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
  return new EmailMessage(from.addr, to, msg.asRaw());
}

/**
 * Creates an HTML email message using mimetext
 *
 * @param options - Email configuration options
 * @returns EmailMessage instance ready to be sent
 */
export function createHtmlEmail(options: SimpleEmailOptions & { htmlBody?: string }): EmailMessage {
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

  return new EmailMessage(from.addr, to, msg.asRaw());
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
 * const message = createSimpleEmail({
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
  const message = createSimpleEmail(options);
  await sendEmail(emailSender, message);
}
