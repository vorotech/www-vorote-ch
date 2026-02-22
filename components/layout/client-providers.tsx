'use client';

import { ThemeProvider } from "next-themes";
import { VideoDialogProvider } from "@/components/ui/VideoDialogContext";
import VideoDialog from "@/components/ui/VideoDialog";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <VideoDialogProvider>
        {children}
        <VideoDialog />
      </VideoDialogProvider>
    </ThemeProvider>
  );
}
