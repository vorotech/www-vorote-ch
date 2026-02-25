import Layout from '@/components/layout/layout';
import client from '@/tina/__generated__/client';
import React from 'react';
import ClientPage from './[...urlSegments]/client-page';

export const revalidate = 300;

export async function generateMetadata() {
  const data = await client.queries.page({
    relativePath: `home.mdx`,
  });
  return {
    title: data.data.page.title || 'Vorotech',
  };
}

export default async function Home() {
  const data = await client.queries.page({
    relativePath: `home.mdx`,
  });

  return (
    <Layout rawPageData={data}>
      <ClientPage {...data} />
    </Layout>
  );
}
