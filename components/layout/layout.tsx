import React, { PropsWithChildren } from "react";
import { LayoutProvider } from "./layout-context";
import client from "../../tina/__generated__/client";
import { Header } from "./nav/header";
import { Footer } from "./nav/footer";

type LayoutProps = PropsWithChildren & {
  rawPageData?: any;
};

export default async function Layout({ children, rawPageData }: LayoutProps) {
  const { data: globalData } = await client.queries.global({
    relativePath: "index.json",
  },
    {
      fetchOptions: {
        next: {
          revalidate: 60,
        },
      }
    }
  );

  return (
    <div className="flex flex-col min-h-screen">
      <LayoutProvider globalSettings={globalData.global} pageData={rawPageData}>
        <Header />
        <main className="overflow-x-hidden flex-1">
          {children}
        </main>
        <Footer />
      </LayoutProvider>
    </div>
  );
}
