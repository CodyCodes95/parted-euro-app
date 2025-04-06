import { z } from "zod";
import { createTRPCRouter, publicProcedure, adminProcedure } from "../trpc";
import { desc, eq, or, like, sql } from "drizzle-orm";

export const ordersRouter = createTRPCRouter({
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

  getOrderWithItems: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.order.findUnique({
        where: { id: input },
        include: {
          orderItems: {
            include: {
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
          },
        },
      });
      return order;
    }),

  // Admin procedures for the orders management panel
  getAllAdmin: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().nullish(),
        search: z.string().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 10;
      const { search, sortBy, sortOrder } = input;

      // Build the where clause for search
      let whereClause = {};
      if (search) {
        const searchTerm = `%${search}%`;
        whereClause = {
          OR: [
            { id: { contains: searchTerm } },
            { name: { contains: searchTerm } },
            { email: { contains: searchTerm } },
            { status: { contains: searchTerm } },
          ],
        };
      }

      // Build the order by clause
      let orderBy: any = [{ createdAt: "desc" }]; // Default sort
      if (sortBy) {
        orderBy = [{ [sortBy]: sortOrder || "desc" }];
      }

      // Execute the query
      const orders = await ctx.db.order.findMany({
        take: limit + 1, // get an extra item to determine if there are more results
        where: whereClause,
        orderBy: orderBy,
        include: {
          orderItems: {
            include: {
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
          },
        },
      });

      let nextCursor: typeof input.cursor = null;
      if (orders.length > limit) {
        const nextItem = orders.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items: orders,
        nextCursor,
      };
    }),

  updateTracking: adminProcedure
    .input(
      z.object({
        orderId: z.string(),
        trackingNumber: z.string(),
        carrier: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Update the order with tracking information
      const updatedOrder = await ctx.db.order.update({
        where: { id: input.orderId },
        data: {
          trackingNumber: input.trackingNumber,
          carrier: input.carrier,
          // If adding tracking, typically this means it's been shipped
          status: "SHIPPED",
        },
      });

      return updatedOrder;
    }),

  updateStatus: adminProcedure
    .input(
      z.object({
        orderId: z.string(),
        status: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Update the order status
      const updatedOrder = await ctx.db.order.update({
        where: { id: input.orderId },
        data: {
          status: input.status,
        },
      });

      return updatedOrder;
    }),
});
