"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { DataTable } from "~/components/data-table/data-table";
import { getCategoryColumns, type Category } from "./_components/columns";
import { CategoryForm } from "./_components/category-form";
import { DeleteCategoryDialog } from "./_components/delete-category-dialog";
import { keepPreviousData } from "@tanstack/react-query";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { type SortingState } from "@tanstack/react-table";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";

export default function CategoriesAdminPage() {
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [isDeleteCategoryOpen, setIsDeleteCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [parentFilter, setParentFilter] = useState<string | undefined>(
    undefined,
  );
  const [sorting, setSorting] = useState<SortingState>([]);

  // Get the current sort parameters from the sorting state
  const sortConfig =
    sorting.length > 0
      ? {
          sortBy: sorting[0]?.id,
          sortOrder: sorting[0]?.desc ? ("desc" as const) : ("asc" as const),
        }
      : null;

  const { data: parentOptions = [] } = api.category.getAllParents.useQuery();

  const { data: categoriesData, isLoading } = api.category.getAll.useQuery(
    {
      limit: 100,
      search: searchTerm,
      parentId: parentFilter,
      ...(sortConfig ?? {}),
    },
    {
      placeholderData: keepPreviousData,
    },
  );

  const categories = categoriesData?.items ?? [];

  const handleAddCategory = () => {
    setIsAddCategoryOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsEditCategoryOpen(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteCategoryOpen(true);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleParentChange = (value: string) => {
    // If the value is "all", set the filter to undefined to show all categories
    setParentFilter(value === "all" ? undefined : value);
  };

  const columns = getCategoryColumns({
    onEdit: handleEditCategory,
    onDelete: handleDeleteCategory,
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Category Management</h1>
        <Button size="sm" onClick={handleAddCategory}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search categories..."
          className="w-full"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Search by category name
        </p>
      </div>

      {parentOptions.length > 0 && (
        <div className="mb-4">
          <Select
            value={parentFilter ?? "all"}
            onValueChange={handleParentChange}
          >
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Filter by parent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {parentOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {isLoading && (
        <div className="flex h-20 items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      )}

      {!isLoading && (
        <DataTable
          columns={columns}
          data={categories}
          sorting={sorting}
          onSortingChange={setSorting}
        />
      )}

      <CategoryForm
        open={isAddCategoryOpen}
        onOpenChange={setIsAddCategoryOpen}
      />

      {selectedCategory && (
        <>
          <CategoryForm
            open={isEditCategoryOpen}
            onOpenChange={setIsEditCategoryOpen}
            defaultValues={selectedCategory}
            isEditing
          />
          <DeleteCategoryDialog
            open={isDeleteCategoryOpen}
            onOpenChange={setIsDeleteCategoryOpen}
            category={selectedCategory}
          />
        </>
      )}
    </div>
  );
}
