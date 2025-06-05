"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { UploadDropzone } from "~/components/UploadThing";
import {
  Image as ImageIcon,
  Plus,
  Undo2,
  Check,
  AlertCircle,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { AspectRatio } from "~/components/ui/aspect-ratio";
import { Alert, AlertDescription } from "~/components/ui/alert";
import Compressor from "compressorjs";

// Define the form schema
const formSchema = z.object({
  partNo: z.string().min(1, "Part number is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function MobileUploadPage() {
  const [currentPartNo, setCurrentPartNo] = useState<string>("");
  const [uploadedImages, setUploadedImages] = useState<
    { url: string; id: string; order: number }[]
  >([]);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [successCount, setSuccessCount] = useState(0);

  // Fetch existing images for the part number
  const utils = api.useUtils();
  const { data: existingImages, isLoading: loadingExistingImages } =
    api.part.getImagesByPartNo.useQuery(
      { partNo: currentPartNo },
      { enabled: !!currentPartNo },
    );

  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      partNo: "",
    },
  });

  // Reset the form state when starting a new upload session
  const resetForm = () => {
    form.reset({ partNo: "" });
    setCurrentPartNo("");
    setUploadedImages([]);
    setUploadComplete(false);
    setSuccessCount((prev) => prev); // Maintain the success count
  };

  // Handle form submission
  const onSubmit = (values: FormValues) => {
    setCurrentPartNo(values.partNo.trim());
    setUploadedImages([]);
    setUploadComplete(false);
  };

  // Handle image upload completion
  const handleImageUpload = (results: { url: string }[]) => {
    const newImages = results.map((result, index) => ({
      url: result.url,
      id: crypto.randomUUID(),
      order: index,
    }));

    setUploadedImages((prev) => [...prev, ...newImages]);
    setSuccessCount((prev) => prev + results.length);
    setUploadComplete(true);

    // Invalidate the existing images query to refresh the data
    void utils.part.getImagesByPartNo.invalidate({ partNo: currentPartNo });
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold md:text-3xl">Mobile Image Upload</h1>
        <p className="mt-1 text-muted-foreground">
          Upload part images on-the-go to assign to inventory items later
        </p>
      </div>

      <div className="mb-4 rounded-md bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
        <div className="flex items-center">
          <span className="mr-2 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            Tip
          </span>
          <p>
            You&apos;ve successfully uploaded <strong>{successCount}</strong>{" "}
            images in this session.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Enter Part Number</CardTitle>
            <CardDescription>
              Enter the part number to associate with the uploaded images
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="partNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Part Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter part number"
                          {...field}
                          disabled={!!currentPartNo}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!!currentPartNo}
                >
                  {currentPartNo ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Part number set
                    </>
                  ) : (
                    "Continue to upload"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Existing Images Section */}
        {currentPartNo && (
          <Card>
            <CardHeader>
              <CardTitle>Existing Images</CardTitle>
              <CardDescription>
                Currently uploaded images for part number: {currentPartNo}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingExistingImages ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="text-sm text-muted-foreground">
                    Loading existing images...
                  </div>
                </div>
              ) : existingImages && existingImages.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center">
                    <ImageIcon className="mr-2 h-4 w-4" />
                    <span className="text-sm font-medium">
                      {existingImages.length} existing image
                      {existingImages.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {existingImages.map((image) => (
                      <div
                        key={image.id}
                        className="overflow-hidden rounded-md border"
                      >
                        <AspectRatio ratio={1}>
                          <img
                            src={image.url}
                            alt="Existing part image"
                            className="h-full w-full object-cover"
                          />
                        </AspectRatio>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center rounded-md border-2 border-dashed border-muted p-4">
                  <div className="text-center text-muted-foreground">
                    <ImageIcon className="mx-auto h-10 w-10 opacity-50" />
                    <p className="mt-2">No existing images found</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upload Section */}
      {currentPartNo && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Step 2: Upload New Images</CardTitle>
            <CardDescription>
              Upload additional images for part number: {currentPartNo}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <UploadDropzone
                config={{ mode: "auto" }}
                endpoint="partImage"
                headers={{ partNo: currentPartNo }}
                onBeforeUploadBegin={(files) => {
                  // Sort files alphabetically by filename
                  const sortedFiles = [...files].sort((a, b) =>
                    a.name.localeCompare(b.name, undefined, {
                      numeric: true,
                      sensitivity: "base",
                    }),
                  );

                  // Create a promise for each file to be compressed
                  const compressPromises = sortedFiles.map(
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
                            const newFile = new File(
                              [compressedFile],
                              file.name,
                              { type: compressedFile.type },
                            );
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
                onClientUploadComplete={(res) => {
                  if (res) {
                    handleImageUpload(res);
                    toast.success(
                      `${res.length} image${res.length !== 1 ? "s" : ""} uploaded successfully`,
                    );
                  }
                  setUploading(false);
                }}
                onUploadError={(error: Error) => {
                  toast.error(`Error uploading images: ${error.message}`);
                  setUploading(false);
                }}
                className="ut-label:text-lg ut-allowed-content:text-muted-foreground ut-upload-icon:text-muted-foreground rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 transition-all hover:border-muted-foreground/50"
              />

              {uploadedImages.length > 0 && (
                <div className="mt-4">
                  <div className="mb-2 flex items-center">
                    <ImageIcon className="mr-2 h-4 w-4" />
                    <span className="text-sm font-medium">
                      {uploadedImages.length} new image
                      {uploadedImages.length !== 1 ? "s" : ""} uploaded
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {uploadedImages.map((image) => (
                      <div
                        key={image.id}
                        className="overflow-hidden rounded-md border"
                      >
                        <AspectRatio ratio={1}>
                          <img
                            src={image.url}
                            alt="Uploaded part"
                            className="h-full w-full object-cover"
                          />
                        </AspectRatio>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={resetForm}>
              <Undo2 className="mr-2 h-4 w-4" />
              Start new part
            </Button>

            {uploadComplete && (
              <Button onClick={resetForm} className="ml-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add another part
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
