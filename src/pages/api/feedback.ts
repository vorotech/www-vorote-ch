import type { APIRoute } from 'astro';
import { type EmailOptions, sendEmail } from '../../lib/email/index';
import { logger } from '../../lib/logger';
import { escapeHtml } from '../../lib/sanitization';

const FEEDBACK_EMAIL_CONFIG = {
  fromAddress: 'noreply@vorote.ch',
  toAddress: 'hello@vorote.ch',
  subjectPrefix: process.env.EMAIL_SUBJECT_PREFIX ?? '',
} as const;

function createFeedbackEmail(options: {
  from: string;
  subject: string;
  message: string;
}): EmailOptions {
  const sanitizedFrom = escapeHtml(options.from);
  const sanitizedMessage = escapeHtml(options.message);

  const htmlContent = `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">New Feedback Received</h2>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0;"><strong>From:</strong> ${sanitizedFrom}</p>
        <div style="margin-top: 20px;">
          <strong>Message:</strong>
          <p style="white-space: pre-wrap; margin: 10px 0 0 0;">${sanitizedMessage}</p>
        </div>
      </div>
    </div>
  `;

  const plainText = `New Feedback Received\n\nFrom: ${options.from}\nMessage:\n${options.message}`;

  return {
    from: FEEDBACK_EMAIL_CONFIG.fromAddress,
    to: FEEDBACK_EMAIL_CONFIG.toAddress,
    subject: `${FEEDBACK_EMAIL_CONFIG.subjectPrefix}${options.subject}`,
    text: plainText,
    html: htmlContent,
    replyTo: options.from,
  };
}

export const POST: APIRoute = async ({ request }) => {
  logger.info('Request received', undefined,'Feedback API');

  try {
    const body = (await request.json()) as { email?: string; message?: string; token?: string };
    const { email, message, token } = body;

    if (!email || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (!token) {
      return new Response(JSON.stringify({ error: 'Missing Turnstile token' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const turnstileResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
      }),
    });

    const turnstileResult = (await turnstileResponse.json()) as { success?: boolean };
    if (!turnstileResult.success) {
      return new Response(JSON.stringify({ error: 'Turnstile verification failed' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const emailOptions = createFeedbackEmail({
      from: email,
      subject: 'Website Feedback',
      message,
    });

    await sendEmail(emailOptions);

    return new Response(JSON.stringify({ success: true, message: 'Feedback sent successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    logger.error('Error processing feedback', error, 'Feedback API');
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
