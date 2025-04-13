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
import Compressor from "compressorjs";

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
      onBeforeUploadBegin={(files) => {
        // Create a promise for each file to be compressed
        const compressPromises = files.map(
          (file) =>
            new Promise<File>((resolve, reject) => {
              // Skip compression for non-image files
              if (!file.type.startsWith("image/")) {
                resolve(file);
                return;
              }

              new Compressor(file, {
                quality: 0.8, // 80% quality
                maxWidth: 1920,
                maxHeight: 1080,
                convertSize: 1000000, // Convert to JPEG if > 1MB
                success: (compressedFile) => {
                  // Create a new file with the original name but compressed content
                  const newFile = new File([compressedFile], file.name, {
                    type: compressedFile.type,
                  });
                  resolve(newFile);
                },
                error: (err) => {
                  console.error("Compression error:", err);
                  // If compression fails, use the original file
                  resolve(file);
                },
              });
            }),
        );

        // Return a promise that resolves when all files are compressed
        return Promise.all(compressPromises);
      }}
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
