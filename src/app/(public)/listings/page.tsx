"use client";

import { api } from "~/trpc/react";
import { parseAsInteger, useQueryState } from "nuqs";

export default function ListingsPage() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [sortBy, setSortBy] = useQueryState("sortBy", {
    defaultValue: "updatedAt",
  });
  const [sortOrder, setSortOrder] = useQueryState("sortOrder", {
    defaultValue: "desc",
  });
  const [search, setSearch] = useQueryState("search", {
    defaultValue: "",
  });
  const [category, setCategory] = useQueryState("category", {
    defaultValue: "",
  });
  const [subcat, setSubcat] = useQueryState("subcat", {
    defaultValue: "",
  });
  const [generation, setGeneration] = useQueryState("generation", {
    defaultValue: "",
  });
  const [model, setModel] = useQueryState("model", {
    defaultValue: "",
  });
  const [series, setSeries] = useQueryState("series", {
    defaultValue: "",
  });
  const listings = api.listings.searchListings.useQuery({
    page,
    sortBy,
    sortOrder,
    search,
    category,
    subcat,
    generation,
    model,
    series,
  });
  return <div>Listings</div>;
}
