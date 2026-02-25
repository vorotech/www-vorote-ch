/**
 * Email Module
 *
 * A generic email sending module using Resend.
 * Provides utilities for sending transactional emails.
 * Make sure RESEND_API_KEY is set in your environment variables.
 */

export { sendEmail, type EmailOptions } from './sender';
