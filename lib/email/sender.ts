import { Resend } from 'resend';

export interface EmailOptions {
  from: string;
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
}

/**
 * Sends an email using Resend
 * Falls back to console logging if RESEND_API_KEY is not set
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.info('Mock Email Sender (Resend API Key not found):', options);
    return;
  }

  const resend = new Resend(apiKey);

  const payload: any = {
    from: options.from,
    to: options.to,
    subject: options.subject,
  };

  if (options.text) payload.text = options.text;
  if (options.html) payload.html = options.html;
  if (options.replyTo) payload.replyTo = options.replyTo;

  try {
    const { error } = await resend.emails.send(payload);

    if (error) {
      throw new Error(`Resend API Error: ${error.message}`);
    }
  } catch (error) {
    console.error('Failed to send email via Resend:', error);
    throw error;
  }
}
