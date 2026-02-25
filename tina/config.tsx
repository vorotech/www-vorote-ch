import { defineConfig } from 'tinacms';
import nextConfig from '../next.config';

import Author from './collection/author';
import Global from './collection/global';
import Milestone from './collection/milestone';
import Page from './collection/page';
import Post from './collection/post';
import Tag from './collection/tag';

const config = defineConfig({
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID!,
  branch:
    process.env.NEXT_PUBLIC_TINA_BRANCH! || // custom branch env override
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF! || // Vercel branch env
    process.env.HEAD!, // Netlify branch env
  token: process.env.TINA_TOKEN!,
  media: {
    // If you wanted cloudinary do this
    // loadCustomStore: async () => {
    //   const pack = await import("next-tinacms-cloudinary");
    //   return pack.TinaCloudCloudinaryMediaStore;
    // },
    // this is the config for the tina cloud media store
    tina: {
      publicFolder: 'public',
      mediaRoot: 'uploads',
    },
  },
  build: {
    publicFolder: 'public', // The public asset folder for your framework
    outputFolder: 'admin', // within the public folder
    basePath: nextConfig.basePath?.replace(/^\//, '') || '', // The base path of the app (could be /blog)
    host: process.env.NEXT_PUBLIC_TINA_HOST || '127.0.0.1', // The host of the app
  },
  schema: {
    collections: [Page, Post, Author, Tag, Global, Milestone],
  },
});

export default config;
