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
  createHtmlEmail,
  sendEmail,
  sendSimpleEmail,
  type SimpleEmailOptions,
} from './sender';

// Export environment-aware email sender (auto-detects dev vs prod)
export {
  getEmailSender,
  MockEmailSender,
} from './mock-sender';

// Export environment utilities
export { isCloudflareEnvironment } from './env';
