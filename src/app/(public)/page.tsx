import { HomepageCarousel } from "~/app/(public)/_components/homepage-carousel";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { api } from "~/trpc/server";
export default async function Home() {
  const homepageImages = await api.homepageImage.getPublic();
  //   void api.post.getLatest.prefetch();

  return (
    <div className="flex min-h-[90vh] w-full flex-col overflow-hidden bg-background">
      <div className="grid h-full w-full">
        <div className="col-start-1 col-end-2 row-start-1 row-end-2 h-full w-full">
          <HomepageCarousel images={homepageImages} />
        </div>
        <div className="col-start-1 col-end-2 row-start-1 row-end-2 flex items-center justify-center px-4">
          <div className="z-10 flex flex-col items-center justify-center text-center">
            <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              Your BMW Spare Parts Specialists
            </h1>
            <Link prefetch={true} href="/listings">
              <Button variant="outline">Shop Now</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
