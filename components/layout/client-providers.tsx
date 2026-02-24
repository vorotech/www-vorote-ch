'use client';

import { ThemeProvider } from "next-themes";
import { VideoDialogProvider } from "@/components/ui/VideoDialogContext";
import VideoDialog from "@/components/ui/VideoDialog";
import { Toaster } from "sonner";

import { LazyMotion, domAnimation } from "motion/react";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LazyMotion features={domAnimation}>
        <VideoDialogProvider>
          {children}
          <VideoDialog />
          <Toaster position="bottom-right" />
        </VideoDialogProvider>
      </LazyMotion>
    </ThemeProvider>
  );
}
