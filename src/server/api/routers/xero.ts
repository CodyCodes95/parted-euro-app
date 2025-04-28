import { z } from "zod";
import { adminProcedure, createTRPCRouter } from "../trpc";
import type { TokenSet } from "xero-node";
import { XeroClient } from "xero-node";
import { db } from "~/server/db";
import { type XeroItem } from "~/server/xero/createInvoice";
import { createXeroInvoice } from "~/server/xero/createInvoice";

export const xero = new XeroClient({
  clientId: process.env.XERO_CLIENT_ID!,
  clientSecret: process.env.XERO_CLIENT_SECRET!,
  redirectUris: [process.env.XERO_REDIRECT_URI!],
  scopes: process.env.XERO_SCOPES?.split(" "),
});

export const initXero = async () => {
  await xero.initialize();
  const xeroCreds = await db.xeroCreds.findFirst();
  if (!xeroCreds) throw new Error("Xero credentials not found");
  xero.setTokenSet(xeroCreds.tokenSet as TokenSet);
  const xeroTokenSet = xero.readTokenSet();

  if (xeroTokenSet.expired()) {
    const validTokenSet = await xero.refreshToken();
    const creds = await db.xeroCreds.findFirst();
    await db.xeroCreds.update({
      where: {
        id: creds?.id,
      },
      data: {
        // @ts-expect-error: bad types
        tokenSet: validTokenSet,
        refreshToken: validTokenSet.refresh_token,
      },
    });
    xero.setTokenSet(validTokenSet);
  }
  await xero.updateTenants();
  return xero;
};

export const xeroRouter = createTRPCRouter({
  // getExpiry: adminProcedure.query(async ({ ctx }) => {
  //   const creds = await ctx.prisma.xeroCreds.findFirst();
  //   const today = new Date();
  //   const tokenDate = new Date(creds?.updatedAt as Date);
  //   const expirationDate = new Date(
  //     tokenDate.getTime() + 59 * 24 * 60 * 60 * 1000,
  //   );
  //   const daysTillExpiry = Math.ceil(
  //     (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  //   );
  //   return {
  //     daysTillExpiry: daysTillExpiry,
  //   };
  // }),
  authenticate: adminProcedure.mutation(async ({ ctx }) => {
    const consentUrl = await xero.buildConsentUrl();
    return consentUrl;
  }),
  updateTokenset: adminProcedure
    .input(
      z.object({
        url: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const tokenSet = await xero.apiCallback(input.url);
        const creds = await ctx.db.xeroCreds.findFirst();
        if (!creds) throw new Error("Xero credentials not found");
        const updatedCreds = await ctx.db.xeroCreds.update({
          where: {
            id: creds.id,
          },
          data: {
            // @ts-expect-error: bad types
            tokenSet: tokenSet,
            refreshToken: tokenSet.refresh_token,
          },
        });
        return {
          updatedCreds,
        };
      } catch (err) {
        if (err instanceof Error) {
          return {
            error: err.message,
          };
        }
        return {
          error: "Unknown error",
        };
      }
    }),
  testXeroConnection: adminProcedure.query(async ({ ctx }) => {
    await initXero();
    // eslint-disable-next-line
    const activeTenantId = xero.tenants[0].tenantId;
    return !!activeTenantId;
  }),
  createCashOrder: adminProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string(),
        phone: z.string(),
        shippingMethod: z.string(),
        postageCost: z.number(),
        countryCode: z.string(),
        items: z.array(
          z.object({
            itemId: z.string(),
            quantity: z.number(),
            price: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        // Calculate subtotal
        const subtotal = input.items.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0,
        );

        // Create order in database
        const order = await db.order.create({
          data: {
            name: input.name,
            email: input.email,
            shipping: input.postageCost,
            subtotal: subtotal,
            status: "PAID",
            shippingMethod: input.shippingMethod,
            orderItems: {
              create: input.items.map((item) => ({
                listingId: item.itemId,
                quantity: item.quantity,
              })),
            },
          },
        });

        // Format items for Xero invoice
        const lineItemsFormatted: XeroItem[] = input.items.map((item) => ({
          description: item.itemId,
          quantity: item.quantity,
          unitAmount: item.price,
          accountCode: "200",
        }));

        // Add shipping as line item if exists
        if (input.postageCost > 0) {
          lineItemsFormatted.push({
            description: "Shipping",
            quantity: 1,
            unitAmount: input.postageCost,
            accountCode: "210",
            lineAmount: input.postageCost,
          });
        }

        // Update inventory quantities for ordered items
        const orderItems = await db.orderItem.findMany({
          where: {
            orderId: order.id,
          },
          include: {
            listing: true,
          },
        });

        for (const item of orderItems) {
          const listing = item.listing.id;
          const listingItems = await db.listing.findUnique({
            where: {
              id: listing,
            },
            include: {
              parts: true,
            },
          });

          for (const part of listingItems!.parts) {
            await db.listing.update({
              where: {
                id: listing,
              },
              data: {
                parts: {
                  update: {
                    where: {
                      id: part.id,
                    },
                    data: {
                      quantity: part.quantity - item.quantity,
                    },
                  },
                },
              },
            });
          }
        }

        // Create Xero invoice
        await createXeroInvoice({
          items: lineItemsFormatted,
          customerPhone: input.phone,
          customerEmail: input.email,
          customerName: input.name,
          orderId: order.id,
          shippingAddress: {
            country: input.countryCode,
          },
          shippingCost: input.postageCost,
          shippingMethod: input.shippingMethod,
        });

        return { success: true, orderId: order.id };
      } catch (error) {
        console.error("Error creating cash order:", error);
        throw new Error("Failed to create cash order");
      }
    }),
});
