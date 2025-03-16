import { z } from "zod";
import { type Prisma } from "@prisma/client";
import { adminProcedure, createTRPCRouter } from "../trpc";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  // Get all users with optional filtering and sorting
  getAll: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).optional().default(100),
        cursor: z.string().optional(),
        search: z.string().optional(),
        sortBy: z.string().optional(),
        isAdmin: z.boolean().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, search, sortBy, sortOrder, isAdmin } = input;

      // Create the base query
      const query = {
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor } } : {}),
        orderBy: sortBy ? { [sortBy]: sortOrder ?? "asc" } : { email: "asc" },
        where: {
          isAdmin: isAdmin ?? undefined,
          ...(search
            ? {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                ],
              }
            : {}),
        },
      } as Prisma.UserFindManyArgs;

      // Execute the query
      const users = await ctx.db.user.findMany(query);

      // Check if we have more items
      let nextCursor: typeof cursor | undefined = undefined;
      if (users.length > limit) {
        const nextItem = users.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items: users,
        nextCursor,
      };
    }),

  // Toggle admin status
  toggleAdmin: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        isAdmin: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, isAdmin } = input;

      // Check if user exists
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Don't allow removing admin rights from yourself
      if (ctx.session.user.id === userId && !isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot remove admin rights from yourself",
        });
      }

      // Update the user's admin status
      const updatedUser = await ctx.db.user.update({
        where: { id: userId },
        data: { isAdmin },
      });

      return updatedUser;
    }),
});
