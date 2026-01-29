/**
 * Email Module
 *
 * A generic email sending module for Cloudflare Workers.
 * Provides utilities for sending emails via Cloudflare Email Routing.
 *
 * Configuration should be defined where the email sender is used,
 * not in this generic library.
 */

// Export native Cloudflare EmailMessage
export { EmailMessage } from 'cloudflare:email';

// Export all email sender utilities
export {
  createSimpleEmail,
  sendEmail,
  sendSimpleEmail,
  type SimpleEmailOptions,
  type MimeEmailOptions,
} from './sender';
