"use client";

import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

export default function EbaySettingsPage() {
  const router = useRouter();
  const ebayLogin = api.ebay.authenticate.useMutation();

  const authenticateEbay = async () => {
    const url = await ebayLogin.mutateAsync();
    if (url) {
      void router.push(url);
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">Ebay Settings</h1>
      <p className="mb-4 text-muted-foreground">
        Configure your Ebay integration settings here.
      </p>
      <Button onClick={authenticateEbay} disabled={ebayLogin.isPending}>
        {ebayLogin.isPending ? "Redirecting..." : "Refresh Ebay Token"}
      </Button>
    </div>
  );
}
