import { z } from "zod";
import { type Prisma } from "@prisma/client";
import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";

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
  // car selection search page
  getAllMakes: publicProcedure.query(async ({ ctx }) => {
    const cars = await ctx.db.car.findMany({
      select: {
        make: true,
      },
    });
    const makes = [...new Set(cars.map((car) => car.make))].sort();
    return makes;
  }),
  getMatchingSeries: publicProcedure
    .input(
      z.object({
        make: z.string().default("BMW"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const cars = await ctx.db.car.findMany({
        where: {
          make: input.make,
          NOT: {
            series: "PE000",
          },
          AND: {
            NOT: {
              series: "SS000",
            },
          },
        },
        select: {
          series: true,
        },
      });
      const series = cars.map((car) => car.series).sort();
      const uniqueSeries = [...new Set(series)].sort().map((series) => {
        return {
          label: series,
          value: series,
        };
      });
      return {
        series: uniqueSeries,
      };
    }),
  getMatchingGenerations: publicProcedure
    .input(
      z.object({
        series: z.string().min(2),
        make: z.string().default("BMW"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const cars = await ctx.db.car.findMany({
        where: {
          series: input.series,
          make: input.make,
        },
      });
      const generations = cars.map((car) => car.generation).sort();
      const uniqueGenerations = [...new Set(generations)]
        .sort()
        .map((generation) => {
          return {
            label: generation,
            value: generation,
          };
        });
      return {
        generations: uniqueGenerations,
      };
    }),
  getMatchingModels: publicProcedure
    .input(
      z.object({
        series: z.string().min(2),
        generation: z.string().min(2),
        make: z.string().default("BMW"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const cars = await ctx.db.car.findMany({
        where: {
          series: input.series,
          generation: input.generation,
          make: input.make,
        },
      });
      const models = cars.map((car) => car.model).sort();
      const uniqueModels = [...new Set(models)].sort().map((model) => {
        return {
          label: model,
          value: model,
        };
      });
      return {
        models: uniqueModels,
      };
    }),

  // Get all cars
  getAll: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).optional().default(100),
        cursor: z.string().optional(),
        search: z.string().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
        series: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, search, sortBy, sortOrder, series } = input;

      // Create the base query
      const query = {
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor } } : {}),
        orderBy: sortBy ? { [sortBy]: sortOrder ?? "asc" } : { make: "asc" },
        where: {
          ...(search
            ? {
                OR: [
                  { make: { contains: search, mode: "insensitive" } },
                  { model: { contains: search, mode: "insensitive" } },
                  { series: { contains: search, mode: "insensitive" } },
                  { generation: { contains: search, mode: "insensitive" } },
                  { body: { contains: search, mode: "insensitive" } },
                ],
              }
            : {}),
          ...(series ? { series } : {}),
        },
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

  // Get all unique series
  getAllSeries: adminProcedure.query(async ({ ctx }) => {
    // Use Prisma's distinct query to get all unique series values
    const uniqueSeries = await ctx.db.car.findMany({
      select: {
        series: true,
      },
      distinct: ["series"],
      orderBy: {
        series: "asc",
      },
    });

    // Format the response as an array of options for the filter dropdown
    return uniqueSeries.map((item) => ({
      label: item.series,
      value: item.series,
    }));
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
