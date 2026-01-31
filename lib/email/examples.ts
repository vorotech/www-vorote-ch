/**
 * Email Sender Usage Examples
 *
 * This file demonstrates various ways to use the email-sender utility.
 * Based on Cloudflare Email Routing API examples with mimetext.
 *
 * @see https://developers.cloudflare.com/email-routing/email-workers/
 */

import { createSimpleEmail, createHtmlEmail, sendEmail, sendSimpleEmail } from './sender';

// Example 1: Simple email with all options
export async function exampleSimpleEmail(env: { EMAIL_SENDER: SendEmail }) {
  const message = createSimpleEmail({
    from: { name: 'Support Team', addr: 'noreply@example.com' },
    to: 'user@example.com',
    subject: 'Welcome to Our Service',
    body: 'Thank you for signing up! We are excited to have you on board.',
    replyTo: 'support@example.com',
  });

  await sendEmail(env.EMAIL_SENDER, message);
}

// Example 2: One-liner email sending
export async function exampleQuickEmail(env: { EMAIL_SENDER: SendEmail }) {
  await sendSimpleEmail(env.EMAIL_SENDER, {
    from: { addr: 'noreply@example.com' },
    to: 'user@example.com',
    subject: 'Password Reset',
    body: 'Click the link to reset your password: https://example.com/reset',
  });
}

// Example 3: HTML email with both text and HTML versions
export async function exampleHtmlEmail(env: { EMAIL_SENDER: SendEmail }) {
  const message = createHtmlEmail({
    from: { name: 'Newsletter', addr: 'newsletter@example.com' },
    to: 'subscriber@example.com',
    subject: 'Monthly Newsletter',
    body: `
Dear Subscriber,

Here is your monthly update:
- Feature 1
- Feature 2
- Feature 3

Best regards,
The Team
    `,
    htmlBody: `
<!DOCTYPE html>
<html>
<body>
  <h1>Monthly Newsletter</h1>
  <p>Dear Subscriber,</p>
  <p>Here is your monthly update:</p>
  <ul>
    <li>Feature 1</li>
    <li>Feature 2</li>
    <li>Feature 3</li>
  </ul>
  <p>Best regards,<br>The Team</p>
</body>
</html>
    `,
    replyTo: 'contact@example.com',
  });

  await sendEmail(env.EMAIL_SENDER, message);
}

// Example 4: Feedback form email (similar to production use)
export async function exampleFeedbackEmail(env: { SEND_FEEDBACK: SendEmail }) {
  const userEmail = 'user@example.com';
  const feedbackMessage = 'Great product!';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Feedback Received</h2>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
        <p><strong>From:</strong> ${userEmail}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${feedbackMessage}</p>
      </div>
    </div>
  `;

  const plainText = `New Feedback Received\n\nFrom: ${userEmail}\nMessage:\n${feedbackMessage}`;

  const message = createHtmlEmail({
    from: { addr: 'noreply@example.com' },
    to: 'feedback@example.com',
    subject: 'New Feedback Received',
    body: plainText,
    htmlBody: htmlContent,
    replyTo: userEmail,
  });

  await sendEmail(env.SEND_FEEDBACK, message);
}
