import React from "react";
import { Metadata } from "next";
import { Abel, Source_Code_Pro } from "next/font/google";
import { cn } from "@/lib/utils";
import { VideoDialogProvider } from "@/components/ui/VideoDialogContext";
import VideoDialog from "@/components/ui/VideoDialog";

import "@/styles.css";
import { TailwindIndicator } from "@/components/ui/breakpoint-indicator";


// Source Code Pro for body text
const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-source-code-pro",
  weight: "300",
});

// Abel for headings
const abel = Abel({
  subsets: ["latin"],
  variable: "--font-abel",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Tina",
  description: "Tina Cloud Starter",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn(sourceCodePro.variable, abel.variable)}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <VideoDialogProvider>
          {children}
          <VideoDialog />
        </VideoDialogProvider>
        <TailwindIndicator />
      </body>
    </html>
  );
}
