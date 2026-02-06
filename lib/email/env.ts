/**
 * Email Environment Utilities
 *
 * Helper functions for detecting and working with email environments
 */

/**
 * Check if we're running in a Cloudflare environment
 */
export function isCloudflareEnvironment(): boolean {
  // Check for Cloudflare-specific environment indicators
  return !!(
    process.env.CF_PAGES ||
    process.env.CLOUDFLARE_ACCOUNT_ID ||
    process.env.CLOUDFLARE_API_TOKEN ||
    // In Cloudflare Workers, these are typically available
    (typeof caches !== 'undefined' && caches !== null)
  );
}
