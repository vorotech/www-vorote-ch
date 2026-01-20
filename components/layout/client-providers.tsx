'use client';

import { VideoDialogProvider } from "@/components/ui/VideoDialogContext";
import VideoDialog from "@/components/ui/VideoDialog";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <VideoDialogProvider>
      {children}
      <VideoDialog />
    </VideoDialogProvider>
  );
}
