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
      return { url: file.url, id: image.id };
    }),

  // Add part image upload endpoint
  partImage: f({ image: { maxFileCount: 30, maxFileSize: "16MB" } })
    .middleware(async ({ req, files }) => {
      // This code runs on your server before upload
      const session = await auth();

      // If you throw, the user will not be able to upload
      if (!session?.user.isAdmin) {
        throw new Error("Unauthorized");
      }

      // Get partNo from headers
      const partNo = req.headers.get("partNo");

      if (!partNo) {
        throw new Error("Part number is required");
      }

      const fileNames = files.map((file) => file.name).sort();

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: session.user.id, partNo, fileNames };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const { partNo, fileNames } = metadata;
      const { url } = file;

      // Check if there was a recent upload (within the last minute) to this part
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      const recentUpload = await db.image.findFirst({
        where: {
          partNo,
          createdAt: {
            gte: oneMinuteAgo,
          },
        },
      });

      let order: number;

      if (recentUpload) {
        // This is part of a multiple upload - use alphabetical order from sorted filenames
        const fileIndex = fileNames.findIndex((name) => file.name === name);

        // Get the earliest order from recent uploads to maintain consistency
        const earliestRecentImage = await db.image.findFirst({
          where: {
            partNo,
            createdAt: {
              gte: oneMinuteAgo,
            },
          },
          orderBy: {
            order: "asc",
          },
        });

        const baseOrder = earliestRecentImage ? earliestRecentImage.order : 0;
        order = baseOrder + fileIndex;
      } else {
        // Adding to existing part - increment from highest existing order
        const latestImage = await db.image.findFirst({
          where: {
            partNo,
          },
          orderBy: {
            order: "desc",
          },
        });

        const baseOrder = latestImage ? latestImage.order + 1 : 0;
        const fileIndex = fileNames.findIndex((name) => file.name === name);
        order = baseOrder + fileIndex;
      }

      // Store the image with partNo reference in the database
      await db.image.create({
        data: {
          url,
          partNo,
          order,
        },
      });

      return { url, partNo };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
