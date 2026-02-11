import { sendEmail, type EmailOptions } from '@/lib/email';
import { logger } from '@/lib/logger';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

// Email configuration for feedback form
const FEEDBACK_EMAIL_CONFIG = {
  fromAddress: 'noreply@vorote.ch',
  toAddress: 'hello@vorote.ch',
  subjectPrefix: process.env.EMAIL_SUBJECT_PREFIX ?? '',
} as const;

/**
 * Creates a feedback notification email options
 * @param options - Feedback email options
 * @returns EmailOptions ready to be sent
 */
function createFeedbackEmail(options: {
  from: string;
  subject: string;
  message: string;
}): EmailOptions {
  const htmlContent = `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">New Feedback Received</h2>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0;"><strong>From:</strong> ${options.from}</p>
        <div style="margin-top: 20px;">
          <strong>Message:</strong>
          <p style="white-space: pre-wrap; margin: 10px 0 0 0;">${options.message}</p>
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

/**
 * POST /api/feedback
 * Handles feedback form submissions
 */
export async function POST(request: NextRequest) {
  logger.info('Request received', undefined, 'Feedback API');

  try {
    const body = (await request.json()) as { email?: string; message?: string; token?: string };
    logger.debug(
      'Body parsed',
      {
        hasEmail: !!body.email,
        hasMessage: !!body.message,
        hasToken: !!body.token,
      },
      'Feedback API'
    );

    const { email, message, token } = body;

    // Validate required fields
    if (!email || !message) {
      logger.warn(
        'Validation failed: missing required fields',
        {
          hasEmail: !!email,
          hasMessage: !!message,
        },
        'Feedback API'
      );
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Advanced email validation
    // Uses a robust regex to ensure the email follows standard format and has a valid TLD
    // This requires at least one '.' after the @ symbol (e.g. user@domain.com)
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

    if (!emailRegex.test(email)) {
      logger.warn('Validation failed: invalid email format', { email }, 'Feedback API');
      return Response.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Validate Turnstile token
    if (!token) {
      logger.warn('Validation failed: missing Turnstile token', undefined, 'Feedback API');
      return Response.json({ error: 'Missing Turnstile token' }, { status: 400 });
    }

    logger.debug('Validating Turnstile token', undefined, 'Feedback API');
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
    logger.debug('Turnstile validation result', { success: turnstileResult.success }, 'Feedback API');

    if (!turnstileResult.success) {
      logger.warn('Turnstile verification failed', undefined, 'Feedback API');
      return Response.json({ error: 'Turnstile verification failed' }, { status: 400 });
    }

    logger.debug('Creating feedback email', undefined, 'Feedback API');
    // Create email options
    const emailOptions = createFeedbackEmail({
      from: email,
      subject: 'Website Feedback',
      message,
    });
    logger.debug('Email options created', undefined, 'Feedback API');

    logger.info('Sending email via Resend', undefined, 'Feedback API');
    await sendEmail(emailOptions);
    logger.info('Email sent successfully', undefined, 'Feedback API');

    return Response.json({
      success: true,
      message: 'Feedback sent successfully',
    });
  } catch (error) {
    logger.error('Error processing feedback', error, 'Feedback API');
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
