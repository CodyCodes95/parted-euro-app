import { HomepageCarousel } from "~/app/(public)/_components/homepage-carousel";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { api } from "~/trpc/server";
export default async function Home() {
  const homepageImages = await api.homepageImage.getPublic();
  //   void api.post.getLatest.prefetch();

  return (
    <div className="flex min-h-[90vh] flex-col bg-white">
      <div className="flex h-full w-full items-center justify-center">
        <HomepageCarousel images={homepageImages} />
      </div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
        <div className="flex flex-col items-center justify-center">
          <h1 className="mb-6 text-center text-4xl font-bold md:text-5xl lg:text-6xl">
            Your BMW Spare Parts Specialists
          </h1>
          <Link href="/listings">
            <Button className="bg-white text-black hover:bg-gray-200">
              Shop Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
