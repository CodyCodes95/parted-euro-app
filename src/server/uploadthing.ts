import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const uploadRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  homepageImage: f({ image: { maxFileSize: "8MB", maxFileCount: 10 } })
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
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
