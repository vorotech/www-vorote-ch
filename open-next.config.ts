const config = {
  default: {
    override: {
      wrapper: 'cloudflare-node',
      converter: 'edge',
    },
  },
  edgeExternals: ['cloudflare:email'],
};
export default config;
