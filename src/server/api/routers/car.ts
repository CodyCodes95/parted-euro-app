import { z } from "zod";

import { adminProcedure, createTRPCRouter } from "../trpc";
import { type Prisma } from "@prisma/client";

// Define car input validation schema
const carSchema = z.object({
  id: z.string().optional(),
  make: z.string().min(1, "Make is required"),
  series: z.string().min(1, "Series is required"),
  generation: z.string().min(1, "Generation is required"),
  model: z.string().min(1, "Model is required"),
  body: z.string().optional(),
});

export const carRouter = createTRPCRouter({
  // Get all cars
  getAll: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).optional().default(50),
        cursor: z.string().optional(),
        search: z.string().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, search, sortBy, sortOrder } = input;

      // Create the base query
      const query = {
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor } } : {}),
        orderBy: sortBy ? { [sortBy]: sortOrder ?? "asc" } : { make: "asc" },
        where: search
          ? {
              OR: [
                { make: { contains: search, mode: "insensitive" } },
                { model: { contains: search, mode: "insensitive" } },
                { series: { contains: search, mode: "insensitive" } },
                { generation: { contains: search, mode: "insensitive" } },
                { body: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
      } as Prisma.CarFindManyArgs;

      // Execute the query
      const cars = await ctx.db.car.findMany(query);

      // Check if we have more items
      let nextCursor: typeof cursor | undefined = undefined;
      if (cars.length > limit) {
        const nextItem = cars.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items: cars,
        nextCursor,
      };
    }),

  // Get a car by ID
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const car = await ctx.db.car.findUnique({
        where: { id },
      });
      return car;
    }),

  // Create a new car
  create: adminProcedure.input(carSchema).mutation(async ({ ctx, input }) => {
    const car = await ctx.db.car.create({
      data: {
        make: input.make,
        series: input.series,
        generation: input.generation,
        model: input.model,
        body: input.body,
      },
    });
    return car;
  }),

  // Update a car
  update: adminProcedure
    .input(z.object({ id: z.string(), data: carSchema }))
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;
      const car = await ctx.db.car.update({
        where: { id },
        data: {
          make: data.make,
          series: data.series,
          generation: data.generation,
          model: data.model,
          body: data.body,
        },
      });
      return car;
    }),

  // Delete a car
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      await ctx.db.car.delete({
        where: { id },
      });
      return { success: true };
    }),
});
