import { z } from "zod";
import { PrismaClient, type Prisma } from "@prisma/client";
import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

// Define category input validation schema
const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  parentId: z.string().nullable().optional(),
});

export const categoryRouter = createTRPCRouter({
  getParentCategories: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.partTypes.findMany({
      where: {
        parentId: null,
      },
    });
  }),
  getSubCategories: publicProcedure
    .input(z.object({ parentId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.partTypes.findMany({
        where: { parentId: input.parentId },
      });
    }),
  // Get all categories
  getAll: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).optional().default(100),
        cursor: z.string().optional(),
        search: z.string().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
        parentId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, search, sortBy, sortOrder, parentId } = input;

      // Build the orderBy object based on sortBy
      let orderByConfig: Prisma.PartTypesOrderByWithRelationInput = { name: "asc" }; // Default sorting

      if (sortBy) {
        if (sortBy === "parentName") {
          // Handle sorting by parent name
          orderByConfig = {
            parent: {
              name: sortOrder ?? "asc",
            },
          };
        } else {
          // Handle normal field sorting
          orderByConfig = { [sortBy]: sortOrder ?? "asc" };
        }
      }

      // Create the base query
      const query = {
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor } } : {}),
        orderBy: orderByConfig,
        where: {
          ...(search
            ? {
                name: { contains: search, mode: "insensitive" },
              }
            : {}),
          ...(parentId !== undefined ? { parentId } : {}),
        },
        include: {
          parent: {
            select: {
              name: true,
            },
          },
        },
      } as Prisma.PartTypesFindManyArgs;

      // Execute the query
      const categories = await ctx.db.partTypes.findMany(query);

      // Check if we have more items
      let nextCursor: typeof cursor | undefined = undefined;
      if (categories.length > limit) {
        const nextItem = categories.pop();
        nextCursor = nextItem?.id;
      }

      // Map the results to include the parent name
      const mappedCategories = categories.map((category) => ({
        ...category,
        parentName: category.parent?.name || null,
      }));

      return {
        items: mappedCategories,
        nextCursor,
      };
    }),

  // Get all parent categories (for filter dropdown)
  getAllParents: adminProcedure.query(async ({ ctx }) => {
    // Get all categories that have children
    const parents = await ctx.db.partTypes.findMany({
      where: {
        children: {
          some: {},
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Format the response as an array of options for the filter dropdown
    return parents.map((item) => ({
      label: item.name,
      value: item.id,
    }));
  }),

  // Create a new category
  create: adminProcedure
    .input(categorySchema.omit({ id: true }))
    .mutation(async ({ ctx, input }) => {
      const { name, parentId } = input;

      // Create the category
      const category = await ctx.db.partTypes.create({
        data: {
          name,
          parentId,
        },
      });

      return category;
    }),

  // Update an existing category
  update: adminProcedure
    .input(categorySchema)
    .mutation(async ({ ctx, input }) => {
      const { id, name, parentId } = input;

      if (!id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Category ID is required",
        });
      }

      // Check if setting this would create a circular reference
      if (parentId) {
        const isCircular = await checkCircularReference(ctx.db, id, parentId);
        if (isCircular) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot set parent: would create a circular reference",
          });
        }
      }

      // Update the category
      const category = await ctx.db.partTypes.update({
        where: { id },
        data: {
          name,
          parentId,
        },
      });

      return category;
    }),

  // Delete a category
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      // Check if the category has children
      const childrenCount = await ctx.db.partTypes.count({
        where: { parentId: id },
      });

      if (childrenCount > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete: category has child categories",
        });
      }

      // Check if the category is used by any parts
      const partsCount = await ctx.db.partDetail.count({
        where: {
          partTypes: {
            some: { id },
          },
        },
      });

      if (partsCount > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete: category is used by parts",
        });
      }

      // Delete the category
      await ctx.db.partTypes.delete({
        where: { id },
      });

      return { success: true };
    }),
});

// Helper function to check for circular references
async function checkCircularReference(
  db: PrismaClient,
  categoryId: string,
  newParentId: string,
): Promise<boolean> {
  // If we're trying to set the category as its own parent, that's circular
  if (categoryId === newParentId) {
    return true;
  }

  // Start from the new parent and traverse up
  let currentParentId = newParentId;
  const visitedIds = new Set<string>();

  while (currentParentId) {
    // If we encounter the category ID, it would create a cycle
    if (currentParentId === categoryId) {
      return true;
    }

    // If we've already visited this ID, we're in a cycle
    if (visitedIds.has(currentParentId)) {
      return true;
    }

    visitedIds.add(currentParentId);

    // Get the next parent in the chain
    const parent = await db.partTypes.findUnique({
      where: { id: currentParentId },
      select: { parentId: true },
    });

    if (!parent?.parentId) {
      break;
    }

    currentParentId = parent.parentId;
  }

  return false;
}
