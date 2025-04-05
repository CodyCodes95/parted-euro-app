import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { startOfDay, endOfDay } from "date-fns";

export const analyticsRouter = createTRPCRouter({
  // Record any type of analytics event
  trackEvent: publicProcedure
    .input(
      z.object({
        eventType: z.string(),
        path: z.string().optional(),
        listingId: z.string().optional(),
        sessionId: z.string(),
        userId: z.string().optional(),
        metadata: z.record(z.any()).optional(),
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session?.user.isAdmin) return;
      const event = await ctx.db.analyticsEvent.create({
        data: {
          eventType: input.eventType,
          path: input.path,
          listingId: input.listingId,
          sessionId: input.sessionId,
          userId: input.userId,
          metadata: input.metadata ?? {},
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
        },
      });

      return event;
    }),

  // Get analytics for today
  getDailyStats: publicProcedure.query(async ({ ctx }) => {
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    // Get unique visitors count (distinct sessionIds)
    const uniqueVisitorsCount = await ctx.db.analyticsEvent.findMany({
      where: {
        eventType: "pageView",
        timestamp: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      distinct: ["sessionId"],
      select: {
        sessionId: true,
      },
    });

    // Get listing views count
    const listingViewCount = await ctx.db.analyticsEvent.count({
      where: {
        eventType: "listingView",
        timestamp: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    // Get pending orders count
    const pendingOrdersCount = await ctx.db.order.count({
      where: {
        status: "Paid",
      },
    });

    return {
      uniqueVisitorsCount: uniqueVisitorsCount.length,
      listingViewCount,
      pendingOrdersCount,
    };
  }),
});
