import { defineCloudflareConfig } from '@opennextjs/cloudflare';

// cloudflare:email is a runtime module provided by Cloudflare Workers
// It doesn't need to be bundled or externalized
export default defineCloudflareConfig();
