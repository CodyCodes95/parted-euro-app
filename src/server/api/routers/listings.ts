import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { type Prisma } from "@prisma/client";

const prepareSearchTerms = (search: string | undefined): string[] => {
  if (!search) return [];
  return search
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 0);
};

export const listingsRouter = createTRPCRouter({
  getListingMetadata: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const listing = await ctx.db.listing.findUnique({
        where: {
          id: input.id,
        },
        select: {
          title: true,
          description: true,
          images: {
            orderBy: {
              order: "asc",
            },
          },
        },
      });
      return listing;
    }),
  getListing: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const listing = await ctx.db.listing.findUnique({
        where: {
          id: input.id,
        },
        select: {
          id: true,
          title: true,
          description: true,
          condition: true,
          price: true,
          images: {
            orderBy: {
              order: "asc",
            },
          },
          parts: {
            select: {
              donor: {
                select: {
                  vin: true,
                  year: true,
                  car: true,
                  mileage: true,
                },
              },
              partDetails: {
                select: {
                  length: true,
                  name: true,
                  width: true,
                  height: true,
                  weight: true,
                  partNo: true,
                  alternatePartNumbers: true,
                  cars: {
                    select: {
                      id: true,
                      generation: true,
                      series: true,
                      model: true,
                      body: true,
                    },
                  },
                },
              },
              quantity: true,
            },
          },
        },
      });
      return listing;
    }),
  getRelatedListings: publicProcedure
    .input(
      z.object({
        generation: z.string(),
        model: z.string(),
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const listings = await ctx.db.listing.findMany({
        take: 4,
        include: {
          images: {
            orderBy: {
              order: "asc",
            },
          },
        },
        where: {
          id: {
            not: input.id,
          },
          active: true,
          parts: {
            some: {
              partDetails: {
                cars: {
                  some: {
                    generation: input.generation,
                    model: input.model,
                  },
                },
              },
            },
          },
        },
      });
      if (listings.length) return listings;
      // just get 4 random listings

      const randomListings = await ctx.db.listing.findMany({
        take: 4,
        include: {
          images: true,
        },
        where: {
          id: {
            not: input.id,
          },
          active: true,
        },
      });
      return randomListings;
    }),
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
  searchListings: publicProcedure
    .input(
      z.object({
        generation: z.string().optional(),
        model: z.string().optional(),
        series: z.string().optional(),
        make: z.string().optional(),
        search: z.string().optional(),
        category: z.string().optional(),
        subcat: z.string().optional(),
        page: z.number(),
        sortBy: z.string(),
        sortOrder: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const searchTerms = prepareSearchTerms(input.search);
      const searchConditions = searchTerms.map((term) => ({
        OR: [
          {
            title: {
              contains: term,
              mode: "insensitive",
            },
          },
          {
            parts: {
              some: {
                partDetails: {
                  partNo: {
                    contains: term,
                    mode: "insensitive",
                  },
                },
              },
            },
          },
          {
            parts: {
              some: {
                partDetails: {
                  alternatePartNumbers: {
                    contains: term,
                    mode: "insensitive",
                  },
                },
              },
            },
          },
        ],
      }));
      const orderBy: Record<string, "asc" | "desc"> = {};
      orderBy[input.sortBy] = input.sortOrder as "asc" | "desc";
      if (
        !input.generation &&
        !input.model &&
        !input.series &&
        !input.make &&
        !input.category
      ) {
        const queryWhere = {
          active: true,
          AND: searchTerms.length > 0 ? searchConditions : undefined,
        } as Prisma.ListingWhereInput;
        const listingsRequest = ctx.db.listing.findMany({
          take: 20,
          skip: input.page * 20,
          include: {
            images: {
              orderBy: {
                order: "asc",
              },
            },
          },
          where: queryWhere,
          orderBy,
        });
        const countRequest = ctx.db.listing.count({ where: queryWhere });
        const [listings, count] = await Promise.all([
          listingsRequest,
          countRequest,
        ]);
        const hasNextPage = count > input.page * 20 + 20;
        const totalPages = Math.ceil(count / 20);
        return { listings, count, hasNextPage, totalPages };
      } else {
        const queryWhere = {
          active: true,
          AND: [
            ...searchConditions,
            {
              parts: {
                some: {
                  partDetails: {
                    partTypes: {
                      some: {
                        parent: {
                          name: {
                            contains: input.category ?? "",
                          },
                        },
                        name: {
                          contains: input.subcat ?? "",
                        },
                      },
                    },
                    cars: {
                      some: {
                        make: input.make,
                        generation: {
                          contains: input.generation ?? "",
                        },
                        model: input.model,
                        series: input.series,
                      },
                    },
                  },
                },
              },
            },
          ],
        } as Prisma.ListingWhereInput;
        const listingsRequest = ctx.db.listing.findMany({
          take: 20,
          skip: input.page * 20,
          include: {
            images: {
              take: 2,
              orderBy: {
                order: "asc",
              },
            },
          },
          where: queryWhere,
          orderBy,
        });
        const countRequest = ctx.db.listing.count({ where: queryWhere });
        const [listings, count] = await Promise.all([
          listingsRequest,
          countRequest,
        ]);
        const hasNextPage = count > input.page * 20 + 20;
        const totalPages = Math.ceil(count / 20);
        return { listings, count, hasNextPage, totalPages };
      }
    }),
  globalSearch: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const searchTerms = prepareSearchTerms(input.query);

      if (searchTerms.length === 0) {
        return [];
      }

      const searchConditions = searchTerms.map((term) => ({
        OR: [
          { title: { contains: term, mode: "insensitive" as const } },
          { description: { contains: term, mode: "insensitive" as const } },
          {
            parts: {
              some: {
                partDetails: {
                  partNo: { contains: term, mode: "insensitive" as const },
                },
              },
            },
          },
          {
            parts: {
              some: {
                partDetails: {
                  alternatePartNumbers: {
                    contains: term,
                    mode: "insensitive" as const,
                  },
                },
              },
            },
          },
        ],
      }));

      const listings = await ctx.db.listing.findMany({
        where: {
          active: true,
          AND: searchConditions,
        },
        select: {
          id: true,
          title: true,
          price: true,
          description: true,
          images: {
            orderBy: {
              order: "asc",
            },
            take: 1,
            select: {
              url: true,
            },
          },
        },
        take: input.limit,
        orderBy: {
          title: "asc",
        },
      });

      return listings;
    }),
});
