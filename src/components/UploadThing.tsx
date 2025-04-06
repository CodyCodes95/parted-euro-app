"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";
import type { OurFileRouter } from "~/server/uploadthing";
import { cn } from "~/lib/utils";
import { toast } from "sonner";

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

export function HomepageImageUploader() {
  const router = useRouter();

  const onUploadError = useCallback((error: Error) => {
    toast.error(`Error uploading images: ${error.message}`);
  }, []);

  return (
    <UploadButton
      endpoint="homepageImage"
      onClientUploadComplete={() => {
        toast.success("Images uploaded successfully!");
        router.refresh();
      }}
      onUploadError={onUploadError}
      className="ut-button:bg-primary ut-button:text-white ut-button:font-medium ut-button:text-sm ut-button:px-4 ut-button:py-2.5 ut-button:rounded-md ut-button:hover:bg-primary/90"
    />
  );
}

export function HomepageImageUploadZone({
  className,
  onUploadComplete,
}: {
  className?: string;
  onUploadComplete?: () => void;
}) {
  const router = useRouter();

  const onUploadError = useCallback((error: Error) => {
    toast.error(`Error uploading images: ${error.message}`);
  }, []);

  return (
    <UploadDropzone
      config={{
        mode: "auto",
      }}
      endpoint="homepageImage"
      onClientUploadComplete={() => {
        toast.success("Images uploaded successfully!");
        onUploadComplete?.();
      }}
      onUploadError={onUploadError}
      className={cn(
        "ut-label:text-lg ut-allowed-content:text-muted-foreground ut-upload-icon:text-muted-foreground rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 transition-all hover:border-muted-foreground/50",
        className,
      )}
    />
  );
}
