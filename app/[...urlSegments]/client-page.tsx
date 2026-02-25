'use client';
import { Blocks } from '@/components/blocks';
import ErrorBoundary from '@/components/error-boundary';
import { PageQuery } from '@/tina/__generated__/types';
import { useTina } from 'tinacms/dist/react';

export interface ClientPageProps {
  data: {
    page: PageQuery['page'];
  };
  variables: {
    relativePath: string;
  };
  query: string;
}

export default function ClientPage(props: ClientPageProps) {
  const { data } = useTina({ ...props });
  return (
    <ErrorBoundary>
      <Blocks {...data?.page} />
    </ErrorBoundary>
  );
}
