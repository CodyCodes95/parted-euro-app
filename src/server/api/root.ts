import { carRouter } from "~/server/api/routers/car";
import { postRouter } from "~/server/api/routers/post";
import { categoryRouter } from "~/server/api/routers/category";
import { userRouter } from "~/server/api/routers/user";
import { locationRouter } from "~/server/api/routers/location";
import { homepageImageRouter } from "~/server/api/routers/homepage-images";
import { partRouter } from "~/server/api/routers/part";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  // post: postRouter,
  car: carRouter,
  category: categoryRouter,
  user: userRouter,
  location: locationRouter,
  homepageImage: homepageImageRouter,
  part: partRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const result = await trpc.post.all();
 */
export const createCaller = createCallerFactory(appRouter);
