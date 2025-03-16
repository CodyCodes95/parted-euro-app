import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const homepageImageRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.homepageImage.findMany({
      orderBy: {
        order: "asc",
      },
    });
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (!ctx.session.user.isAdmin) {
        throw new Error("Unauthorized");
      }

      await ctx.db.homepageImage.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  reorder: protectedProcedure
    .input(z.object({ orderedIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (!ctx.session.user.isAdmin) {
        throw new Error("Unauthorized");
      }

      // Update the order of each image
      await Promise.all(
        input.orderedIds.map(async (id, index) => {
          await ctx.db.homepageImage.update({
            where: { id },
            data: { order: index },
          });
        }),
      );

      return { success: true };
    }),
});
