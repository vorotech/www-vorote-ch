import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with the API key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, message, token } = (await request.json()) as { email: string; message: string; token: string };

    if (!email || !message || !token) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // 1. Validate Turnstile token
    const formData = new FormData();
    formData.append('secret', process.env.TURNSTILE_SECRET_KEY || '');
    formData.append('response', token);

    const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const turnstileData = (await turnstileRes.json()) as { success: boolean };

    if (!turnstileData.success) {
      return NextResponse.json({ message: 'Invalid captcha' }, { status: 403 });
    }

    // 2. Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Feedback Form <onboarding@resend.dev>', // Update this if you have a verified domain
      to: ['hello@vorote.ch'],
      subject: 'New Feedback Received',
      replyTo: email,
      text: `Start of feedback message:\n\n${message}\n\n---\nFrom: ${email}`,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ message: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Feedback sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
