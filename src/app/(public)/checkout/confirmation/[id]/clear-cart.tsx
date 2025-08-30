"use client";

import { useEffect } from "react";
import { api } from "~/trpc/react";

export function ClearCartOnLoad() {
  const utils = api.useUtils();
  const { mutate: clear } = api.cart.clear.useMutation({
    onSuccess: async () => {
      await utils.cart.getCart.invalidate();
      await utils.cart.getCartSummary.invalidate();
    },
  });
  useEffect(() => {
    clear();
  }, []);

  return null;
}
