import { z } from "zod";
import { type Prisma } from "@prisma/client";
import { adminProcedure, createTRPCRouter } from "../trpc";
import { TRPCError } from "@trpc/server";

// Define inventory input validation schema
const inventorySchema = z.object({
  id: z.string().optional(),
  partDetailsId: z.string().min(1, "Part is required"),
  donorVin: z.string().optional().nullable(),
  inventoryLocationId: z.string().optional().nullable(),
  variant: z.string().optional().nullable(),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});

export const inventoryRouter = createTRPCRouter({
  // Get all inventory items
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
        ...(cursor ? { cursor: { id: cursor } } : {}),
        orderBy: sortBy
          ? sortBy.startsWith("partDetails_")
            ? {
                partDetails: {
                  [sortBy.replace("partDetails_", "")]: sortOrder ?? "asc",
                },
              }
            : sortBy.startsWith("inventoryLocation_")
              ? {
                  inventoryLocation: {
                    [sortBy.replace("inventoryLocation_", "")]:
                      sortOrder ?? "asc",
                  },
                }
              : { [sortBy]: sortOrder ?? "asc" }
          : { id: "desc" },
        where: {
          ...(search
            ? {
                OR: [
                  {
                    partDetails: {
                      OR: [
                        { partNo: { contains: search, mode: "insensitive" } },
                        { name: { contains: search, mode: "insensitive" } },
                        {
                          alternatePartNumbers: {
                            contains: search,
                            mode: "insensitive",
                          },
                        },
                      ],
                    },
                  },
                  { donorVin: { contains: search, mode: "insensitive" } },
                  { variant: { contains: search, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        include: {
          partDetails: {
            select: {
              partNo: true,
              name: true,
              alternatePartNumbers: true,
            },
          },
          donor: {
            select: {
              vin: true,
            },
          },
          inventoryLocation: {
            select: {
              id: true,
              name: true,
            },
          },
          listing: {
            select: {
              id: true,
            },
          },
        },
      } as Prisma.PartFindManyArgs;

      // Execute the query
      const inventory = await ctx.db.part.findMany(query);

      // Check if we have more items
      let nextCursor: typeof cursor | undefined = undefined;
      if (inventory.length > limit) {
        const nextItem = inventory.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items: inventory,
        nextCursor,
      };
    }),

  // Get an inventory item by ID
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const inventory = await ctx.db.part.findUnique({
        where: { id },
        include: {
          partDetails: true,
          donor: true,
          inventoryLocation: true,
          listing: true,
        },
      });

      if (!inventory) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Inventory item not found",
        });
      }

      return inventory;
    }),

  // Create a new inventory item
  create: adminProcedure
    .input(inventorySchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const inventory = await ctx.db.part.create({
          data: {
            partDetailsId: input.partDetailsId,
            donorVin: input.donorVin === "none" ? null : input.donorVin,
            inventoryLocationId:
              input.inventoryLocationId === "none"
                ? null
                : input.inventoryLocationId,
            variant: input.variant || null,
            quantity: input.quantity,
          },
          include: {
            partDetails: true,
            donor: true,
            inventoryLocation: true,
          },
        });

        return inventory;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create inventory item",
          cause: error,
        });
      }
    }),

  // Update an inventory item
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        data: inventorySchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;

      try {
        const updatedInventory = await ctx.db.part.update({
          where: { id },
          data: {
            partDetailsId: data.partDetailsId,
            donorVin: data.donorVin === "none" ? null : data.donorVin,
            inventoryLocationId:
              data.inventoryLocationId === "none"
                ? null
                : data.inventoryLocationId,
            variant: data.variant || null,
            quantity: data.quantity,
          },
          include: {
            partDetails: true,
            donor: true,
            inventoryLocation: true,
          },
        });

        return updatedInventory;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update inventory item",
          cause: error,
        });
      }
    }),

  // Delete an inventory item
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      try {
        await ctx.db.part.delete({
          where: { id },
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete inventory item",
          cause: error,
        });
      }
    }),
});
