/**
 * Mock Email Sender for Local Development
 *
 * This provides a fake email sender that logs emails to the console
 * instead of actually sending them. Perfect for local development
 * without needing Cloudflare bindings.
 */

import { isCloudflareEnvironment } from './env';

interface EmailAddress {
  name: string;
  email: string;
}

interface EmailAttachment {
  disposition: 'inline' | 'attachment';
  filename: string;
  type: string;
  content: string | ArrayBuffer | ArrayBufferView;
}

interface EmailMessage {
  readonly from: string;
  readonly to: string;
}

interface EmailSendResult {
  messageId: string;
}

interface SendEmail {
  send(message: EmailMessage): Promise<EmailSendResult>;
  send(builder: {
    from: string | EmailAddress;
    to: string | string[];
    subject: string;
    replyTo?: string | EmailAddress;
    cc?: string | string[];
    bcc?: string | string[];
    headers?: Record<string, string>;
    text?: string;
    html?: string;
    attachments?: EmailAttachment[];
  }): Promise<EmailSendResult>;
}

/**
 * Decode MIME encoded-word (RFC 2047)
 * Example: =?utf-8?B?TmV3IEZlZWRiYWNr?= -> "New Feedback"
 */
function decodeMimeWord(encoded: string): string {
  const match = encoded.match(/=\?([^?]+)\?([BQ])\?([^?]+)\?=/gi);
  if (!match) return encoded;

  let decoded = encoded;
  match.forEach((word) => {
    const parts = word.match(/=\?([^?]+)\?([BQ])\?([^?]+)\?=/i);
    if (parts) {
      const [, , encoding, content] = parts;
      try {
        if (encoding.toUpperCase() === 'B') {
          // Base64 decode
          decoded = decoded.replace(word, atob(content));
        } else if (encoding.toUpperCase() === 'Q') {
          // Quoted-printable decode (simplified)
          const qpDecoded = content.replace(/_/g, ' ').replace(/=([0-9A-F]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
          decoded = decoded.replace(word, qpDecoded);
        }
      } catch (e) {
        // If decoding fails, keep original
      }
    }
  });
  return decoded;
}

export class MockEmailSender implements SendEmail {
  // Implement the send() method with both overloads
  send(
    messageOrBuilder:
      | EmailMessage
      | {
          from: string | EmailAddress;
          to: string | string[];
          subject: string;
          text?: string;
          replyTo?: string | EmailAddress;
          cc?: string | string[];
          bcc?: string | string[];
          headers?: Record<string, string>;
          html?: string;
          attachments?: EmailAttachment[];
        }
  ): Promise<EmailSendResult> {
    let from: string;
    let to: string;
    let subject: string;
    let text: string | undefined;

    // Check if it's an EmailMessage (raw MIME) or a builder object
    if ('from' in messageOrBuilder && 'to' in messageOrBuilder && !('subject' in messageOrBuilder)) {
      // It's an EmailMessage with raw MIME content
      const message = messageOrBuilder as any;
      from = message.from;
      to = message.to;

      // Parse the raw MIME to extract subject and body
      try {
        const rawContent = typeof message.raw === 'string' ? message.raw : new TextDecoder().decode(message.raw);

        // Extract and decode subject
        const subjectMatch = rawContent.match(/^Subject: (.+)$/m);
        if (subjectMatch) {
          subject = decodeMimeWord(subjectMatch[1]);
        } else {
          subject = '(no subject)';
        }

        // Extract plain text body - look for text/plain section
        const plainTextMatch = rawContent.match(
          /Content-Type: text\/plain[^\n]*\n(?:Content-Transfer-Encoding: [^\n]+\n)?\n([\s\S]*?)(?:\n--|\r\n--|\n\nContent-Type|\r\n\r\nContent-Type|$)/
        );
        if (plainTextMatch) {
          text = plainTextMatch[1].trim();
        } else {
          // Fallback: try to get any text after headers
          const bodyMatch = rawContent.match(/\n\n([\s\S]+?)(?:\n--|\r\n--|$)/);
          if (bodyMatch) {
            text = bodyMatch[1].trim();
          }
        }
      } catch (error) {
        subject = '(error parsing MIME)';
        text = undefined;
      }
    } else {
      // It's a builder object
      const builder = messageOrBuilder as {
        from: string | EmailAddress;
        to: string | string[];
        subject: string;
        text?: string;
      };
      from = typeof builder.from === 'string' ? builder.from : builder.from.email;
      to = typeof builder.to === 'string' ? builder.to : builder.to[0];
      subject = builder.subject;
      text = builder.text;
    }

    console.log('\n┌─────────────────────────────────────────────────────────────┐');
    console.log('│ 📧 MOCK EMAIL SENDER (Development Mode)');
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log(`│ From: ${from}`);
    console.log(`│ To: ${to}`);
    console.log(`│ Subject: ${subject}`);

    // Show message text if available
    if (text) {
      console.log('├─────────────────────────────────────────────────────────────┤');

      // Truncate very long messages
      const maxLength = 300;
      const displayText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;

      // Split into lines and display each line
      const lines = displayText.split('\n');
      lines.forEach((line) => {
        // Truncate very long lines to fit in the box
        const truncatedLine = line.length > 59 ? line.substring(0, 56) + '...' : line;
        console.log(`│ ${truncatedLine}`);
      });
    }

    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log('│ 💡 To test with real emails, use: pnpm preview');
    console.log('└─────────────────────────────────────────────────────────────┘\n');

    // Return a fake messageId
    const messageId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@localhost`;
    return Promise.resolve({ messageId });
  }
}

/**
 * Get the appropriate email sender based on environment
 *
 * @param bindingName - Name of the email binding (e.g., 'SEND_FEEDBACK')
 * @returns Email sender instance (real or mock)
 */
export async function getEmailSender(bindingName: string): Promise<SendEmail> {
  const env = process.env as Record<string, unknown>;
  const binding = env[bindingName];

  // If we have a real binding, use it (Cloudflare environment)
  if (binding && typeof binding === 'object' && 'send' in binding) {
    console.log(`[Email] Using Cloudflare email binding: ${bindingName}`);
    return binding as SendEmail;
  }

  // Otherwise, use mock sender (local development)
  console.log(`[Email] Using mock email sender for development (binding '${bindingName}' not found)`);
  return new MockEmailSender();
}
