import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { z } from "zod";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const uploadRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  homepageImage: f({ image: { maxFileCount: 30, maxFileSize: "16MB" } })
    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      // This code runs on your server before upload
      const session = await auth();

      // If you throw, the user will not be able to upload
      if (!session?.user.isAdmin) {
        throw new Error("Unauthorized");
      }

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code runs on your server after upload
      const { key, url } = file;

      // Get the latest order number
      const latestImage = await db.homepageImage.findFirst({
        orderBy: {
          order: "desc",
        },
      });

      const order = latestImage ? latestImage.order + 1 : 0;

      // Store the new image in the database
      await db.homepageImage.create({
        data: {
          url,
          order,
        },
      });

      return { url };
    }),

  // Add inventory image upload endpoint
  inventoryImage: f({ image: { maxFileCount: 30, maxFileSize: "16MB" } })
    .middleware(async ({ files }) => {
      // This code runs on your server before upload
      const session = await auth();

      // If you throw, the user will not be able to upload
      if (!session?.user.isAdmin) {
        throw new Error("Unauthorized");
      }

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Create the image in the database with an order of 0 (will be updated when connected to part)
      const image = await db.image.create({
        data: {
          url: file.url,
          order: 0,
        },
      });

      // Return both the URL and the generated ID
      return { url: file.ufsUrl, id: image.id };
    }),
  donorImage: f({ image: { maxFileCount: 30, maxFileSize: "16MB" } })
    .middleware(async ({ files }) => {
      // This code runs on your server before upload
      const session = await auth();

      // If you throw, the user will not be able to upload
      if (!session?.user.isAdmin) {
        throw new Error("Unauthorized");
      }

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Return both the URL and the generated ID
      return { url: file.ufsUrl };
    }),

  // Add part image upload endpoint
  partImage: f({ image: { maxFileCount: 30, maxFileSize: "16MB" } })
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const session = await auth();

      // If you throw, the user will not be able to upload
      if (!session?.user.isAdmin) {
        throw new Error("Unauthorized");
      }

      // Get partNo, fileIndex and variant from headers
      const partNo = req.headers.get("partNo");
      const fileIndexStr = req.headers.get("fileIndex");
      const variantHeader = req.headers.get("variant");

      if (!partNo) {
        throw new Error("Part number is required");
      }

      if (!fileIndexStr) {
        throw new Error("File index is required");
      }

      const fileIndex = parseInt(fileIndexStr, 10);
      if (isNaN(fileIndex)) {
        throw new Error("File index must be a number");
      }

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return {
        userId: session.user.id,
        partNo,
        fileIndex,
        variant: variantHeader ?? null,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const { partNo, fileIndex, variant } = metadata as {
        partNo: string;
        fileIndex: number;
        variant: string | null;
      };
      const { url } = file;

      // Get the highest existing order for this part
      const latestImage = await db.image.findFirst({
        where: {
          partNo,
        },
        orderBy: {
          order: "desc",
        },
      });

      // Calculate the base order (starting point for new uploads)
      const baseOrder = latestImage ? latestImage.order + 1 : 0;

      // The final order is baseOrder + fileIndex (from sorted client array)
      const order = baseOrder + fileIndex;

      // Normalize variant: treat blank as null
      const variantValue = variant && variant.trim() !== "" ? variant : null;

      // Store the image with partNo reference in the database
      await db.image.create({
        data: {
          url,
          partNo,
          order,
          variant: variantValue ?? undefined,
        },
      });

      return { url, partNo, order, variant: variantValue };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
