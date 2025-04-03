import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const cartRouter = createTRPCRouter({
  getListingsByIds: publicProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (input.ids.length === 0) {
        return []; // Return empty array if no IDs are provided
      }

      const listings = await ctx.db.listing.findMany({
        where: {
          id: {
            in: input.ids,
          },
        },
        select: {
          id: true,
          title: true,
          price: true,
          images: {
            orderBy: {
              order: "asc",
            },
            take: 1, // Only take the first image
            select: {
              url: true,
            },
          },
          // Potentially add stock/quantity check here later if needed
        },
      });
      return listings;
    }),
  getCartShippingData: publicProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
      }),
    )
    .query(async ({ ctx, input }) => {
      const listings = await ctx.db.listing.findMany({
        where: {
          id: {
            in: input.ids,
          },
        },
        select: {
          parts: {
            select: {
              partDetails: {
                select: {
                  length: true,
                  width: true,
                  height: true,
                  weight: true,
                },
              },
            },
          },
        },
      });
      const cartParts = listings.flatMap((listing) =>
        listing.parts.map((part) => part.partDetails),
      );
      const cartWeight = cartParts.reduce((acc, cur) => acc + cur.weight, 0);
      const largestPart = cartParts.reduce(
        (acc, cur) => {
          return acc.length * acc.width * acc.height >
            cur.length * cur.width * cur.height
            ? acc
            : cur;
        },
        {
          length: 0,
          width: 0,
          height: 0,
          weight: 0,
        },
      );
      return {
        largestPart,
        cartWeight,
      };
    }),
});
