import { z } from "zod";
import { createTRPCRouter, publicProcedure, adminProcedure } from "../trpc";
import { type Prisma } from "@prisma/client";

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
  getAllAdmin: adminProcedure.query(async ({ ctx }) => {
    // Get all orders except PENDING
    const orders = await ctx.db.order.findMany({
      where: {
        status: {
          not: "PENDING",
        },
      },
      orderBy: [{ createdAt: "desc" }],
      include: {
        orderItems: {
          include: {
            listing: {
              include: {
                parts: {
                  select: {
                    partDetails: {
                      select: {
                        partNo: true
                      }
                    }
                  }
                },
                images: {
                  select: {
                    url: true
                  },
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

    return {
      items: orders.map((order) => {
        return {
          ...order,
          subtotal: (order.subtotal ?? 0) / 100,
          shipping: (order.shipping ?? 0) / 100,
        };
      }),
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
