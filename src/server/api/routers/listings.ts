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
  searchListings: publicProcedure
    .input(
      z.object({
        generation: z.string().optional(),
        model: z.string().optional(),
        series: z.string().optional(),
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
});
