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
  images: z
    .array(
      z.object({
        id: z.string(),
        url: z.string(),
        order: z.number(),
      }),
    )
    .optional(),
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
        listing: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        partDetails: {
          name: "asc",
        },
      },
    });

    return inventory.map((item) => ({
      value: item.id,
      label: `${item.partDetails.name} - (${item.partDetails.partNo})${
        item.variant ? ` - ${item.variant}` : ""
      }`,
      isAssigned: !!item.listing.length
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
        images: {
          select: {
            id: true,
            url: true,
            order: true,
          },
          orderBy: {
            order: "asc",
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
          images: {
            select: {
              id: true,
              url: true,
              order: true,
            },
            orderBy: {
              order: "asc",
            },
          },
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
        const { images, ...inventoryData } = input;

        const inventory = await ctx.db.part.create({
          data: {
            partDetailsId: inventoryData.partDetailsId,
            donorVin:
              inventoryData.donorVin === "none" ? null : inventoryData.donorVin,
            inventoryLocationId:
              inventoryData.inventoryLocationId === "none"
                ? null
                : inventoryData.inventoryLocationId,
            variant: inventoryData.variant ?? null,
            quantity: inventoryData.quantity,
            images: images
              ? {
                  createMany: {
                    data: images.map((image) => ({
                      id: image.id,
                      url: image.url,
                      order: image.order,
                    })),
                  },
                }
              : undefined,
          },
          include: {
            partDetails: true,
            donor: true,
            inventoryLocation: true,
            images: true,
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
      const { images, ...updateData } = data;

      try {
        // First, get current images for the part to compare
        const currentImages = await ctx.db.image.findMany({
          where: { partId: id },
          select: { id: true },
        });

        // Transaction to ensure data consistency
        return await ctx.db.$transaction(async (tx) => {
          // If images are provided, handle image updates intelligently
          if (images) {
            const currentImageIds = new Set(currentImages.map((img) => img.id));
            const newImageIds = new Set(images.map((img) => img.id));

            // Find images to remove (in current but not in new)
            const imagesToRemove = [...currentImageIds].filter(
              (imgId) => !newImageIds.has(imgId),
            );

            // Find images to add (in new but not in current)
            const imagesToAdd = [...newImageIds].filter(
              (imgId) => !currentImageIds.has(imgId),
            );

            // Only delete images that are not in the new list
            if (imagesToRemove.length > 0) {
              await tx.image.deleteMany({
                where: {
                  id: { in: imagesToRemove },
                  partId: id,
                },
              });
            }

            // Connect new images that weren't already connected
            if (imagesToAdd.length > 0) {
              await tx.part.update({
                where: { id },
                data: {
                  images: {
                    connect: imagesToAdd.map((imgId) => ({ id: imgId })),
                  },
                },
              });
            }

            // Update the order of all images
            for (const image of images) {
              await tx.image.update({
                where: { id: image.id },
                data: {
                  order: image.order,
                  partId: id, // Ensure it's connected to this part
                },
              });
            }
          }

          // Update the part with other data
          const updatedInventory = await tx.part.update({
            where: { id },
            data: {
              partDetailsId: updateData.partDetailsId,
              donorVin:
                updateData.donorVin === "none" ? null : updateData.donorVin,
              inventoryLocationId:
                updateData.inventoryLocationId === "none"
                  ? null
                  : updateData.inventoryLocationId,
              variant: updateData.variant ?? null,
              quantity: updateData.quantity,
            },
            include: {
              partDetails: true,
              donor: true,
              inventoryLocation: true,
              images: {
                orderBy: {
                  order: "asc",
                },
              },
            },
          });

          return updatedInventory;
        });
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
        // Delete related images first
        await ctx.db.image.deleteMany({
          where: { partId: id },
        });

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
