/**
 * Email Sender Utility for Cloudflare Workers
 *
 * This module provides utilities for sending emails using Cloudflare's Email Routing API.
 * It supports both simple text emails and MIME-formatted emails with attachments.
 *
 * @see https://developers.cloudflare.com/email-routing/email-workers/
 */

import { EmailMessage } from 'cloudflare:email';

export interface SimpleEmailOptions {
  from: string;
  to: string;
  subject: string;
  body: string;
  replyTo?: string;
}

export interface MimeEmailOptions {
  from: {
    name?: string;
    addr: string;
  };
  to: string | string[];
  subject: string;
  body: {
    contentType: 'text/plain' | 'text/html';
    data: string;
  };
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
}

/**
 * Creates a simple email message with plain text content
 *
 * @param options - Email configuration options
 * @returns EmailMessage instance ready to be sent
 *
 * @example
 * ```ts
 * const message = createSimpleEmail({
 *   from: 'noreply@example.com',
 *   to: 'user@example.com',
 *   subject: 'Hello World',
 *   body: 'This is a test email',
 *   replyTo: 'support@example.com'
 * });
 * ```
 */
export function createSimpleEmail(options: SimpleEmailOptions): EmailMessage {
  const { from, to, subject, body, replyTo } = options;

  let content = `Subject: ${subject}\r\n`;

  if (replyTo) {
    content += `Reply-To: ${replyTo}\r\n`;
  }

  content += '\r\n';
  content += body;

  // Use native Cloudflare EmailMessage constructor
  return new EmailMessage(from, to, content);
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
 *   from: 'noreply@example.com',
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
 *   from: 'noreply@example.com',
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
