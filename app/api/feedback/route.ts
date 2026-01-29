import { createSimpleEmail, sendEmail } from '@/lib/email/sender';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

// Email configuration for feedback form
const FEEDBACK_EMAIL_CONFIG = {
  bindingName: 'SEND_FEEDBACK',
  fromAddress: 'noreply@vorote.ch',
  toAddress: 'hello@vorote.ch',
} as const;

/**
 * Creates a feedback notification email
 * @param options - Feedback email options
 * @returns EmailMessage instance ready to be sent
 */
function createFeedbackEmail(options: {
  from: string;
  subject: string;
  message: string;
}) {
  const htmlContent = `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">New Feedback Received</h2>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0;"><strong>From:</strong> ${options.from}</p>
        <p style="margin: 0 0 10px 0;"><strong>Subject:</strong> ${options.subject}</p>
        <div style="margin-top: 20px;">
          <strong>Message:</strong>
          <p style="white-space: pre-wrap; margin: 10px 0 0 0;">${options.message}</p>
        </div>
      </div>
    </div>
  `;

  return createSimpleEmail({
    to: FEEDBACK_EMAIL_CONFIG.toAddress,
    from: FEEDBACK_EMAIL_CONFIG.fromAddress,
    subject: `New Feedback: ${options.subject}`,
    body: htmlContent,
  });
}

/**
 * POST /api/feedback
 * Handles feedback form submissions
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string; message?: string; token?: string };
    const { email, message, token } = body;

    // Validate required fields
    if (!email || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate Turnstile token
    if (!token) {
      return Response.json({ error: 'Missing Turnstile token' }, { status: 400 });
    }

    const turnstileResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
      }),
    });

    const turnstileResult = (await turnstileResponse.json()) as { success?: boolean };

    if (!turnstileResult.success) {
      return Response.json({ error: 'Turnstile verification failed' }, { status: 400 });
    }

    // Create and send email
    const emailMessage = createFeedbackEmail({
      from: email,
      subject: 'Website Feedback',
      message,
    });

    // Get the email sender binding from process.env (available in nodejs runtime on Cloudflare)
    const env = process.env as Record<string, unknown>;
    const emailSender = env[FEEDBACK_EMAIL_CONFIG.bindingName] as SendEmail;
    await sendEmail(emailSender, emailMessage);

    return Response.json({
      success: true,
      message: 'Feedback sent successfully',
    });
  } catch (error) {
    console.error('Error processing feedback:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
