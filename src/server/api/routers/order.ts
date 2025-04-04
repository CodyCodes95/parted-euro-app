import { z } from "zod";
import { createTRPCRouter } from "../trpc";
import { publicProcedure } from "../trpc";

export const orderRouter = createTRPCRouter({
  getOrderById: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.order.findUnique({
        where: { id: input },
        include: {
          orderItems: true,
        },
      });
      return order;
    }),
});
