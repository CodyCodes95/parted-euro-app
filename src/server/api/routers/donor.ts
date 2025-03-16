import { z } from "zod";
import { type Prisma } from "@prisma/client";
import { adminProcedure, createTRPCRouter } from "../trpc";

// Define donor input validation schema
const donorSchema = z.object({
  vin: z.string().min(1, "VIN is required"),
  cost: z.number().min(0, "Cost must be a positive number"),
  carId: z.string().min(1, "Car is required"),
  year: z.number().int().min(1900, "Year must be after 1900"),
  mileage: z.number().int().min(0, "Mileage must be a positive number"),
  imageUrl: z.string().optional().nullable(),
  hideFromSearch: z.boolean().default(false),
  dateInStock: z.date().optional().nullable(),
});

export const donorRouter = createTRPCRouter({
  // Get all donors
  getAll: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).optional().default(100),
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
        ...(cursor ? { cursor: { vin: cursor } } : {}),
        orderBy: sortBy ? { [sortBy]: sortOrder ?? "asc" } : { vin: "asc" },
        where: {
          ...(search
            ? {
                OR: [{ vin: { contains: search, mode: "insensitive" } }],
              }
            : {}),
        },
        include: {
          car: true,
        },
      } as Prisma.DonorFindManyArgs;

      // Execute the query
      const donors = await ctx.db.donor.findMany(query);

      // Check if we have more items
      let nextCursor: typeof cursor | undefined = undefined;
      if (donors.length > limit) {
        const nextItem = donors.pop();
        nextCursor = nextItem?.vin;
      }

      return {
        items: donors,
        nextCursor,
      };
    }),

  // Get all unique cars for donors
  getAllCars: adminProcedure.query(async ({ ctx }) => {
    // Get all cars
    const cars = await ctx.db.car.findMany({
      orderBy: {
        make: "asc",
      },
    });

    // Format the response as an array of options for the filter dropdown
    return cars.map((car) => ({
      label: `${car.make} ${car.series} ${car.model}`,
      value: car.id,
    }));
  }),

  // Get a donor by VIN
  getByVin: adminProcedure
    .input(z.object({ vin: z.string() }))
    .query(async ({ ctx, input }) => {
      const { vin } = input;
      const donor = await ctx.db.donor.findUnique({
        where: { vin },
        include: {
          car: true,
        },
      });
      return donor;
    }),

  // Create a new donor
  create: adminProcedure.input(donorSchema).mutation(async ({ ctx, input }) => {
    const donor = await ctx.db.donor.create({
      data: {
        vin: input.vin,
        cost: input.cost,
        carId: input.carId,
        year: input.year,
        mileage: input.mileage,
        imageUrl: input.imageUrl,
        hideFromSearch: input.hideFromSearch,
        dateInStock: input.dateInStock,
      },
    });
    return donor;
  }),

  // Update a donor
  update: adminProcedure
    .input(z.object({ vin: z.string(), data: donorSchema }))
    .mutation(async ({ ctx, input }) => {
      const { vin, data } = input;
      const donor = await ctx.db.donor.update({
        where: { vin },
        data: {
          cost: data.cost,
          carId: data.carId,
          year: data.year,
          mileage: data.mileage,
          imageUrl: data.imageUrl,
          hideFromSearch: data.hideFromSearch,
          dateInStock: data.dateInStock,
        },
      });
      return donor;
    }),

  // Delete a donor
  delete: adminProcedure
    .input(z.object({ vin: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { vin } = input;
      await ctx.db.donor.delete({
        where: { vin },
      });
      return { success: true };
    }),
});
