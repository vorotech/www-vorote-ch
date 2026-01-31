import { createHtmlEmail, sendEmail } from '@/lib/email/sender';
import { logger } from '@/lib/logger';
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
async function createFeedbackEmail(options: {
  from: string;
  subject: string;
  message: string;
}) {
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

  return createHtmlEmail({
    from: { addr: FEEDBACK_EMAIL_CONFIG.fromAddress },
    to: FEEDBACK_EMAIL_CONFIG.toAddress,
    subject: `New Feedback: ${options.subject}`,
    body: plainText,
    htmlBody: htmlContent,
    replyTo: options.from,
  });
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
    // Create and send email
    const emailMessage = await createFeedbackEmail({
      from: email,
      subject: 'Website Feedback',
      message,
    });
    logger.debug('Email message created', undefined, 'Feedback API');

    // Get the email sender binding from process.env (available in nodejs runtime on Cloudflare)
    logger.debug('Getting email sender binding', undefined, 'Feedback API');
    const env = process.env as Record<string, unknown>;
    const emailSender = env[FEEDBACK_EMAIL_CONFIG.bindingName] as SendEmail;

    if (!emailSender) {
      logger.error('Email sender binding not found', { bindingName: FEEDBACK_EMAIL_CONFIG.bindingName }, 'Feedback API');
      throw new Error('Email sender binding not configured');
    }

    logger.info('Sending email', undefined, 'Feedback API');
    await sendEmail(emailSender, emailMessage);
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
