import { z } from "zod";
import { type Prisma } from "@prisma/client";
import { adminProcedure, createTRPCRouter } from "../trpc";

// Define part input validation schema
const partDetailSchema = z.object({
  partNo: z.string().min(1, "Part number is required"),
  alternatePartNumbers: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  weight: z.number().min(0, "Weight must be a positive number"),
  length: z.number().min(0, "Length must be a positive number"),
  width: z.number().min(0, "Width must be a positive number"),
  height: z.number().min(0, "Height must be a positive number"),
  costPrice: z
    .number()
    .min(0, "Cost price must be a positive number")
    .optional(),
  cars: z.array(z.string()).optional(),
  partTypes: z.array(z.string()).optional(),
});

export const partRouter = createTRPCRouter({
  // Get all parts
  getAll: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).optional().default(100),
        cursor: z.string().optional(),
        search: z.string().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
        partType: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, search, sortBy, sortOrder, partType } = input;

      // Create the base query
      const query = {
        take: limit + 1,
        ...(cursor ? { cursor: { partNo: cursor } } : {}),
        orderBy: sortBy ? { [sortBy]: sortOrder ?? "asc" } : { partNo: "asc" },
        where: {
          ...(search
            ? {
                OR: [
                  { partNo: { contains: search, mode: "insensitive" } },
                  {
                    alternatePartNumbers: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                  { name: { contains: search, mode: "insensitive" } },
                ],
              }
            : {}),
          ...(partType
            ? {
                partTypes: {
                  some: {
                    id: partType,
                  },
                },
              }
            : {}),
        },
        include: {
          cars: {
            select: {
              id: true,
              make: true,
              model: true,
              series: true,
              generation: true,
            },
          },
          partTypes: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      } as Prisma.PartDetailFindManyArgs;

      // Execute the query
      const parts = await ctx.db.partDetail.findMany(query);

      // Check if we have more items
      let nextCursor: typeof cursor | undefined = undefined;
      if (parts.length > limit) {
        const nextItem = parts.pop();
        nextCursor = nextItem?.partNo;
      }

      return {
        items: parts,
        nextCursor,
      };
    }),

  // Get all compatible cars for multiselect
  getAllCars: adminProcedure.query(async ({ ctx }) => {
    const cars = await ctx.db.car.findMany({
      select: {
        id: true,
        make: true,
        model: true,
        series: true,
        generation: true,
      },
      orderBy: [{ make: "asc" }, { model: "asc" }],
    });

    return cars.map((car) => ({
      value: car.id,
      label: `${car.make} ${car.model} (${car.series} ${car.generation})`,
    }));
  }),

  // Get all part types for multiselect
  getAllPartTypes: adminProcedure.query(async ({ ctx }) => {
    const partTypes = await ctx.db.partTypes.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    });

    return partTypes.map((type) => ({
      value: type.id,
      label: type.name,
    }));
  }),

  // Get a part by ID
  getById: adminProcedure
    .input(z.object({ partNo: z.string() }))
    .query(async ({ ctx, input }) => {
      const { partNo } = input;
      const part = await ctx.db.partDetail.findUnique({
        where: { partNo },
        include: {
          cars: true,
          partTypes: true,
        },
      });
      return part;
    }),

  // Create a new part
  create: adminProcedure
    .input(partDetailSchema)
    .mutation(async ({ ctx, input }) => {
      const { cars = [], partTypes = [], ...partData } = input;

      const part = await ctx.db.partDetail.create({
        data: {
          ...partData,
          cars: {
            connect: cars.map((id) => ({ id })),
          },
          partTypes: {
            connect: partTypes.map((id) => ({ id })),
          },
        },
        include: {
          cars: true,
          partTypes: true,
        },
      });
      return part;
    }),

  // Update a part
  update: adminProcedure
    .input(
      z.object({
        partNo: z.string(),
        data: partDetailSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { partNo, data } = input;
      const { cars = [], partTypes = [], ...updateData } = data;

      // First disconnect all existing relationships
      await ctx.db.partDetail.update({
        where: { partNo },
        data: {
          cars: {
            set: [],
          },
          partTypes: {
            set: [],
          },
        },
      });

      // Then update with new connections
      const part = await ctx.db.partDetail.update({
        where: { partNo },
        data: {
          ...updateData,
          cars: {
            connect: cars.map((id) => ({ id })),
          },
          partTypes: {
            connect: partTypes.map((id) => ({ id })),
          },
        },
        include: {
          cars: true,
          partTypes: true,
        },
      });
      return part;
    }),

  // Delete a part
  delete: adminProcedure
    .input(z.object({ partNo: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { partNo } = input;
      await ctx.db.partDetail.delete({
        where: { partNo },
      });
      return { success: true };
    }),
});
