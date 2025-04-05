import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { startOfDay, endOfDay, format } from "date-fns";

export const analyticsRouter = createTRPCRouter({
  // Record a page visit
  trackPageVisit: publicProcedure
    .input(
      z.object({
        path: z.string(),
        sessionId: z.string(),
        userId: z.string().optional(),
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
        referer: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Create page visit record
      const pageVisit = await ctx.db.pageVisit.create({
        data: {
          path: input.path,
          sessionId: input.sessionId,
          userId: input.userId,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
          referer: input.referer,
        },
      });

      // Update daily summary
      const today = new Date();
      const formattedDate = format(today, "yyyy-MM-dd");

      // Find or create today's summary
      await ctx.db.analyticsSummary.upsert({
        where: {
          date: startOfDay(today),
        },
        create: {
          date: startOfDay(today),
          pageVisitsCount: 1,
          listingViewCount: 0,
        },
        update: {
          pageVisitsCount: {
            increment: 1,
          },
        },
      });

      return pageVisit;
    }),

  // Record a listing view
  trackListingView: publicProcedure
    .input(
      z.object({
        listingId: z.string(),
        sessionId: z.string(),
        userId: z.string().optional(),
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Create listing view record
      const listingView = await ctx.db.listingView.create({
        data: {
          listingId: input.listingId,
          sessionId: input.sessionId,
          userId: input.userId,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
        },
      });

      // Update daily summary
      const today = new Date();

      // Find or create today's summary
      await ctx.db.analyticsSummary.upsert({
        where: {
          date: startOfDay(today),
        },
        create: {
          date: startOfDay(today),
          pageVisitsCount: 0,
          listingViewCount: 1,
        },
        update: {
          listingViewCount: {
            increment: 1,
          },
        },
      });

      return listingView;
    }),

  // Get analytics for today
  getDailyStats: publicProcedure.query(async ({ ctx }) => {
    const today = new Date();

    // Get today's summary
    const summary = await ctx.db.analyticsSummary.findUnique({
      where: {
        date: startOfDay(today),
      },
    });

    if (!summary) {
      return {
        pageVisitsCount: 0,
        listingViewCount: 0,
      };
    }

    return {
      pageVisitsCount: summary.pageVisitsCount,
      listingViewCount: summary.listingViewCount,
    };
  }),

  // Get pending orders count
  getPendingOrdersCount: publicProcedure.query(async ({ ctx }) => {
    const count = await ctx.db.order.count({
      where: {
        status: "Paid",
      },
    });

    return count;
  }),
});
