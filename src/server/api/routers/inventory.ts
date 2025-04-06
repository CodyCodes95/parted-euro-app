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
  // Get all inventory items for select dropdown
  getAllForSelect: adminProcedure.query(async ({ ctx }) => {
    const inventory = await ctx.db.part.findMany({
      where: {
        sold: false,
      },
      select: {
        id: true,
        partDetails: {
          select: {
            partNo: true,
            name: true,
          },
        },
        variant: true,
      },
      orderBy: {
        partDetails: {
          name: "asc",
        },
      },
    });

    return inventory.map((item) => ({
      value: item.id,
      label: `${item.partDetails.name} (${item.partDetails.partNo})${
        item.variant ? ` - ${item.variant}` : ""
      }`,
    }));
  }),

  // Get all inventory items
  getAll: adminProcedure.query(async ({ ctx }) => {
    // Execute the query
    const inventory = await ctx.db.part.findMany({
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
    });

    return inventory;
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
            variant: input.variant ?? null,
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
            variant: data.variant ?? null,
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
