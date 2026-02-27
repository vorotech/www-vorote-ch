import React, { PropsWithChildren } from 'react';
import client from '../../tina/__generated__/client';
import { LayoutProvider } from './layout-context';
import { Footer } from './nav/footer';
import { Header } from './nav/header';
import { ResearchLayout } from './research-layout';

type LayoutProps = PropsWithChildren & {
  rawPageData?: any;
};

export default async function Layout({ children, rawPageData }: LayoutProps) {
  const { data: globalData } = await client.queries.global(
    {
      relativePath: 'index.json',
    },
    {
      fetchOptions: {
        next: {
          revalidate: 60,
        },
      },
    }
  );

  const theme = rawPageData?.data?.page?.theme || rawPageData?.data?.post?.theme || 'default';
  const isMocha = theme === 'mocha';

  const content = (
    <>
      <Header />
      <main className='overflow-x-hidden flex-1 pt-[73px] lg:pt-[81px]'>{children}</main>
      <Footer />
    </>
  );

  return (
    <div className='flex flex-col min-h-screen'>
      <LayoutProvider globalSettings={globalData.global} pageData={rawPageData}>
        {isMocha ? <ResearchLayout>{content}</ResearchLayout> : content}
      </LayoutProvider>
    </div>
  );
}
