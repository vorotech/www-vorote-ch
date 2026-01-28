import { createSimpleEmail, sendEmail } from '@/lib/email';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

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
  to: string;
  userEmail: string;
  message: string;
}) {
  return createSimpleEmail({
    from: options.from,
    to: options.to,
    subject: 'New Feedback Received',
    replyTo: options.userEmail,
    body: `New feedback from the website:\n\n` + `${options.message}\n\n` + `---\n` + `From: ${options.userEmail}`,
  });
}

export async function POST(request: NextRequest) {
  const env = process.env as any;

  try {
    const { email, message, token } = (await request.json()) as {
      email: string;
      message: string;
      token: string;
    };

    if (!email || !message || !token) {
      return new Response(JSON.stringify({ message: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // 1. Validate Turnstile token
    const formData = new FormData();
    formData.append('secret', env?.TURNSTILE_SECRET_KEY || '');
    formData.append('response', token);

    const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const turnstileData = (await turnstileRes.json()) as { success: boolean };

    if (!turnstileData.success) {
      return new Response(JSON.stringify({ message: 'Invalid captcha' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    // 2. Get email sender using local configuration
    const emailSender = env[FEEDBACK_EMAIL_CONFIG.bindingName];

    if (!emailSender) {
      console.warn(`${FEEDBACK_EMAIL_CONFIG.bindingName} binding not available - email not sent`);
      console.log(`Feedback from ${email}: ${message}`);
      return new Response(JSON.stringify({ message: 'Feedback received (email delivery unavailable)' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. Create and send feedback email
    const emailMessage = createFeedbackEmail({
      from: FEEDBACK_EMAIL_CONFIG.fromAddress,
      to: FEEDBACK_EMAIL_CONFIG.toAddress,
      userEmail: email,
      message: message,
    });

    try {
      await sendEmail(emailSender, emailMessage);
    } catch (emailError) {
      console.error('Cloudflare Email error:', emailError);
      return new Response(JSON.stringify({ message: 'Failed to send email' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ message: 'Feedback sent successfully' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Feedback API error:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
