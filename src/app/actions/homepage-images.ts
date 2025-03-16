"use server";

import { db } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";
import { revalidatePath } from "next/cache";

export async function getHomepageImages() {
  return db.homepageImage.findMany({
    orderBy: {
      order: "asc",
    },
  });
}

export async function deleteHomepageImage(id: string) {
  const session = await getServerAuthSession();

  if (!session || !session.user.isAdmin) {
    throw new Error("Unauthorized");
  }

  await db.homepageImage.delete({
    where: { id },
  });

  revalidatePath("/admin/settings/images");
  return { success: true };
}

export async function reorderHomepageImages(orderedIds: string[]) {
  const session = await getServerAuthSession();

  if (!session || !session.user.isAdmin) {
    throw new Error("Unauthorized");
  }

  // Update the order of each image
  await Promise.all(
    orderedIds.map(async (id, index) => {
      await db.homepageImage.update({
        where: { id },
        data: { order: index },
      });
    }),
  );

  revalidatePath("/admin/settings/images");
  return { success: true };
}
