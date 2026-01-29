/**
 * Email Module
 *
 * A generic email sending module for Cloudflare Workers.
 * Provides utilities for sending emails via Cloudflare Email Routing.
 *
 * Configuration should be defined where the email sender is used,
 * not in this generic library.
 */

// Export all email sender utilities
export {
  createSimpleEmail,
  sendEmail,
  sendSimpleEmail,
  type EmailMessage,
  type EmailSenderBinding,
  type SimpleEmailOptions,
  type MimeEmailOptions,
} from './sender';
