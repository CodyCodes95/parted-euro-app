import { Suspense } from "react";
import { Separator } from "~/components/ui/separator";
import { HomepageImageManager } from "./homepage-images";
import { Card } from "~/components/ui/card";

export default function ImagesSettingsPage() {
  return (
    <div className="container py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Image Settings</h1>
      </div>
      <p className="mt-2 text-muted-foreground">
        Manage all the images used throughout your website.
      </p>

      <Separator className="my-6" />

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold">Homepage Carousel</h2>
          <p className="text-sm text-muted-foreground">
            Manage the images that appear in the homepage carousel. Drag to
            reorder.
          </p>

          <Card className="mt-4 p-6">
            <Suspense
              fallback={
                <div className="h-64 w-full animate-pulse rounded-md bg-muted" />
              }
            >
              <HomepageImageManager />
            </Suspense>
          </Card>
        </div>
      </div>
    </div>
  );
}
