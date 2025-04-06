"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { DataTable } from "~/components/data-table/data-table";
import { getCategoryColumns, type Category } from "./_components/columns";
import { CategoryForm } from "./_components/category-form";
import { DeleteCategoryDialog } from "./_components/delete-category-dialog";
import { keepPreviousData } from "@tanstack/react-query";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";

export default function CategoriesAdminPage() {
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [isDeleteCategoryOpen, setIsDeleteCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  // Fetch all categories
  const { data: categoriesData, isLoading } = api.category.getAll.useQuery(
    undefined,
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

      {isLoading && (
        <div className="flex h-20 items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      )}

      {!isLoading && <DataTable columns={columns} data={categories} />}

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
