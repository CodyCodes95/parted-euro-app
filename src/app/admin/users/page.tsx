"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { DataTable } from "~/components/data-table/data-table";
import { getUserColumns } from "./_components/columns";
import { keepPreviousData } from "@tanstack/react-query";
import { Input } from "~/components/ui/input";
import { type SortingState } from "@tanstack/react-table";

export default function UsersAdminPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  // Fetch all users
  const { data: usersData, isLoading } = api.user.getAll.useQuery(undefined, {
    placeholderData: keepPreviousData,
  });

  const users = usersData?.items ?? [];

  const columns = getUserColumns();

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users Management</h1>
      </div>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search users by name or email..."
          className="w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Search by name or email
        </p>
      </div>

      {isLoading && (
        <div className="flex h-20 items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      )}

      {!isLoading && (
        <DataTable
          columns={columns}
          data={users}
          sorting={sorting}
          onSortingChange={setSorting}
          searchKey="email"
        />
      )}
    </div>
  );
}
