/**
 * Sanitization utilities for handling user input
 */

/**
 * Escapes HTML special characters to prevent injection attacks.
 */
export function escapeHtml(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return str.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Validates if a string is a valid GitHub Security Advisory ID.
 * Format: GHSA-xxxx-xxxx-xxxx
 */
export function isValidGhsaId(id: string): boolean {
  return /^GHSA-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}$/i.test(id);
}
