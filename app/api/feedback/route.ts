import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

// Email configuration for feedback form
const FEEDBACK_EMAIL_CONFIG = {
  bindingName: 'SEND_FEEDBACK',
  fromAddress: 'noreply@vorote.ch',
  toAddress: 'hello@vorote.ch',
} as const;

// Email message type
interface EmailMessage {
  from: string;
  to: string;
  content: string;
}

// Email sender binding type
interface EmailSenderBinding {
  send(message: EmailMessage): Promise<void>;
}

export async function POST(request: NextRequest) {
  try {
    // Check if email sending is enabled
    const isEnabled = process.env.ENABLE_EMAIL_SENDING !== 'false';

    if (!isEnabled) {
      return Response.json({ message: 'Email sending is currently disabled' }, { status: 503 });
    }

    const env = process.env as any;

    // Parse request body
    let email: string, message: string, token: string;
    try {
      const body = (await request.json()) as { email: string; message: string; token: string };
      email = body.email;
      message = body.message;
      token = body.token;
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return Response.json({ message: 'Invalid request body' }, { status: 400 });
    }

    if (!email || !message || !token) {
      return Response.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // 1. Validate Turnstile token
    const secretKey = env?.TURNSTILE_SECRET_KEY;
    if (!secretKey) {
      console.error('TURNSTILE_SECRET_KEY environment variable is not set');
      return Response.json({ message: 'Server configuration error' }, { status: 500 });
    }

    const formData = new FormData();
    formData.append('secret', secretKey);
    formData.append('response', token);

    let turnstileRes;
    try {
      turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: formData,
      });
    } catch (fetchError) {
      console.error('Failed to verify Turnstile token:', fetchError);
      return Response.json({ message: 'Captcha verification failed' }, { status: 500 });
    }

    let turnstileData;
    try {
      turnstileData = (await turnstileRes.json()) as { success: boolean };
    } catch (jsonError) {
      console.error('Failed to parse Turnstile response:', jsonError);
      return Response.json({ message: 'Captcha verification failed' }, { status: 500 });
    }

    if (!turnstileData.success) {
      return Response.json({ message: 'Invalid captcha' }, { status: 403 });
    }

    // 2. Get email sender using local configuration
    const emailSender = env[FEEDBACK_EMAIL_CONFIG.bindingName] as EmailSenderBinding | undefined;

    if (!emailSender) {
      console.warn(`${FEEDBACK_EMAIL_CONFIG.bindingName} binding not available - email not sent`);
      console.log(`Feedback from ${email}: ${message}`);
      return Response.json({ message: 'Feedback received (email delivery unavailable)' }, { status: 200 });
    }

    // 3. Create email message inline
    const emailContent =
      `Subject: New Feedback Received\r\n` + `Reply-To: ${email}\r\n` + `\r\n` + `New feedback from the website:\n\n${message}\n\n---\nFrom: ${email}`;

    const emailMessage: EmailMessage = {
      from: FEEDBACK_EMAIL_CONFIG.fromAddress,
      to: FEEDBACK_EMAIL_CONFIG.toAddress,
      content: emailContent,
    };

    // 4. Send email
    try {
      await emailSender.send(emailMessage);
    } catch (emailError) {
      console.error('Cloudflare Email error:', emailError);
      return Response.json({ message: 'Failed to send email' }, { status: 500 });
    }

    return Response.json({ message: 'Feedback sent successfully' }, { status: 200 });
  } catch (error) {
    // Catch any unexpected errors
    console.error('Unexpected feedback API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ message: 'Internal server error', error: errorMessage }, { status: 500 });
  }
}
