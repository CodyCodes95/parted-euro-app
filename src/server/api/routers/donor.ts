import { z } from "zod";
import { type Prisma } from "@prisma/client";
import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";

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

  // Get all donors with cars for inventory form select
  getAllDonorsWithCars: adminProcedure.query(async ({ ctx }) => {
    const donors = await ctx.db.donor.findMany({
      select: {
        vin: true,
        year: true,
        car: {
          select: {
            make: true,
            model: true,
            series: true,
          },
        },
      },
      orderBy: { vin: "asc" },
    });

    return donors.map((donor) => ({
      value: donor.vin,
      label: `${donor.vin} (${donor.year} ${donor.car.make} ${donor.car.model})`,
    }));
  }),

  // Get filter options for the wrecking page
  getFilterOptions: publicProcedure.query(async ({ ctx }) => {
    // Get all donors with their car information
    const donors = await ctx.db.donor.findMany({
      where: {
        hideFromSearch: false,
      },
      select: {
        year: true,
        car: {
          select: {
            make: true,
            series: true,
            model: true,
          },
        },
      },
    });

    // Extract unique values
    const years = [...new Set(donors.map((donor) => donor.year))].sort(
      (a, b) => b - a,
    );
    const makes = [...new Set(donors.map((donor) => donor.car.make))].sort();

    // Group series and models by make
    const seriesByMake: Record<string, string[]> = {};
    const modelsByMake: Record<string, string[]> = {};

    donors.forEach((donor) => {
      const { make, series, model } = donor.car;

      if (!seriesByMake[make]) {
        seriesByMake[make] = [];
      }
      if (!modelsByMake[make]) {
        modelsByMake[make] = [];
      }

      if (series && !seriesByMake[make].includes(series)) {
        seriesByMake[make].push(series);
      }

      if (model && !modelsByMake[make].includes(model)) {
        modelsByMake[make].push(model);
      }
    });

    // Sort series and models
    Object.keys(seriesByMake).forEach((make) => {
      seriesByMake[make]?.sort();
    });
    Object.keys(modelsByMake).forEach((make) => {
      modelsByMake[make]?.sort();
    });

    return {
      years,
      makes,
      seriesByMake,
      modelsByMake,
    };
  }),

  // Public search donors endpoint for the wrecking page
  searchDonors: publicProcedure
    .input(
      z.object({
        page: z.number(),
        sortBy: z.string(),
        sortOrder: z.enum(["asc", "desc"]),
        search: z.string().optional(),
        year: z.number().optional(),
        make: z.string().optional(),
        series: z.string().optional(),
        model: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const pageSize = 20;
      const orderBy: Record<string, "asc" | "desc"> = {};
      orderBy[input.sortBy] = input.sortOrder;

      // Prepare search terms for broader search
      const searchTerms = input.search
        ? input.search
            .toLowerCase()
            .split(/\s+/)
            .filter((term) => term.length > 0)
        : [];

      // Build search conditions
      const searchConditions =
        searchTerms.length > 0
          ? searchTerms.map((term) => ({
              OR: [
                { vin: { contains: term, mode: "insensitive" as const } },
                {
                  car: {
                    make: { contains: term, mode: "insensitive" as const },
                  },
                },
                {
                  car: {
                    model: { contains: term, mode: "insensitive" as const },
                  },
                },
                {
                  car: {
                    series: { contains: term, mode: "insensitive" as const },
                  },
                },
                {
                  car: {
                    generation: {
                      contains: term,
                      mode: "insensitive" as const,
                    },
                  },
                },
              ],
            }))
          : [];

      // Build the base query
      const queryWhere = {
        hideFromSearch: false,
        ...(input.year ? { year: input.year } : {}),
        car: {
          ...(input.make ? { make: input.make } : {}),
          ...(input.series ? { series: input.series } : {}),
          ...(input.model ? { model: input.model } : {}),
        },
        ...(searchTerms.length > 0 ? { AND: searchConditions } : {}),
      } as Prisma.DonorWhereInput;

      // Make parallel requests for donors and count
      const donorsRequest = ctx.db.donor.findMany({
        take: pageSize,
        skip: input.page * pageSize,
        where: queryWhere,
        orderBy,
        include: {
          car: true,
          images: {
            orderBy: {
              order: "asc",
            },
            take: 1,
          },
          parts: {
            select: {
              id: true,
            },
          },
        },
      });

      const countRequest = ctx.db.donor.count({
        where: queryWhere,
      });

      // Execute both requests in parallel
      const [donors, count] = await Promise.all([donorsRequest, countRequest]);

      const totalPages = Math.ceil(count / pageSize);
      const hasNextPage = (input.page + 1) * pageSize < count;

      return {
        donors,
        count,
        hasNextPage,
        totalPages,
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

  // Get a donor by VIN
  getDonorByVin: publicProcedure
    .input(z.object({ vin: z.string() }))
    .query(async ({ ctx, input }) => {
      const donor = await ctx.db.donor.findUnique({
        where: { vin: input.vin },
        include: {
          car: true,
          images: {
            orderBy: {
              order: "asc",
            },
          },
          parts: true,
        },
      });

      return donor;
    }),

  // Get donor parts with listings
  getDonorParts: publicProcedure
    .input(z.object({ vin: z.string() }))
    .query(async ({ ctx, input }) => {
      // Find all parts for the donor that have listings
      const parts = await ctx.db.part.findMany({
        where: {
          donorVin: input.vin,
          listing: {
            some: {
              active: true,
            },
          },
        },
        include: {
          partDetails: {
            include: {
              partTypes: {
                include: {
                  parent: true,
                },
              },
            },
          },
          listing: {
            include: {
              images: {
                orderBy: {
                  order: "asc",
                },
                take: 1,
              },
            },
          },
        },
      });

      // Transform the data to match the expected format
      const listings = parts.flatMap((part) =>
        part.listing.map((listing) => ({
          id: listing.id,
          title: listing.title,
          price: listing.price,
          description: listing.description,
          imageUrl: listing.images[0]?.url ?? null,
          partCategoryId: part.partDetails.partTypes[0]?.id ?? "",
          partSubcategoryId: part.partDetails.partTypes[0]?.parentId ?? "",
          partCategory: {
            name: part.partDetails.partTypes[0]?.name ?? "Uncategorized",
          },
          partSubcategory: {
            name:
              part.partDetails.partTypes[0]?.parent?.name ?? "Uncategorized",
          },
        })),
      );

      return listings;
    }),
});
