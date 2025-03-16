"use client";

import { Suspense } from "react";
import { HomepageImageList } from "~/components/HomepageImageList";
import { HomepageImageUploadZone } from "~/components/UploadThing";
import { getHomepageImages } from "~/app/actions/homepage-images";

export async function HomepageImageManager() {
  const images = await getHomepageImages();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Upload Images</h3>
        <p className="text-sm text-muted-foreground">
          Upload new images to the homepage carousel. Images will be displayed
          in the order shown below.
        </p>
        <div className="mt-4">
          <HomepageImageUploadZone />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">Manage Images</h3>
        <p className="text-sm text-muted-foreground">
          Drag to reorder images or delete them. The order shown here will be
          the order displayed on the homepage.
        </p>
        <div className="mt-4">
          <Suspense
            fallback={
              <div className="h-48 animate-pulse rounded-md bg-muted" />
            }
          >
            <HomepageImageList images={images} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
