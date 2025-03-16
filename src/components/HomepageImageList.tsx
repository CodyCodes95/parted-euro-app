"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  deleteHomepageImage,
  reorderHomepageImages,
} from "~/app/actions/homepage-images";
import { Loader2, GripVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { HomepageImage } from "@prisma/client";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableImageItemProps {
  image: HomepageImage;
  index: number;
  isDeleting: string | null;
  onDelete: (id: string) => void;
}

function SortableImageItem({
  image,
  index,
  isDeleting,
  onDelete,
}: SortableImageItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-3"
    >
      <div {...attributes} {...listeners} className="cursor-grab">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="relative h-16 w-24 overflow-hidden rounded-md">
        <Image
          src={image.url}
          alt="Homepage image"
          fill
          className="object-cover"
        />
      </div>

      <div className="flex-1">
        <p className="text-sm text-muted-foreground">Position: {index + 1}</p>
        <p className="max-w-[200px] truncate text-xs text-muted-foreground">
          {image.url}
        </p>
      </div>

      <Button
        variant="destructive"
        size="icon"
        onClick={() => onDelete(image.id)}
        disabled={isDeleting === image.id}
      >
        {isDeleting === image.id ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>
    </Card>
  );
}

export function HomepageImageList({ images }: { images: HomepageImage[] }) {
  const [isReordering, setIsReordering] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [items, setItems] = useState(images);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // Find the indices of the active and over items
    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    // Update the items
    const reorderedItems = arrayMove(items, oldIndex, newIndex);
    setItems(reorderedItems);

    try {
      setIsReordering(true);
      await reorderHomepageImages(reorderedItems.map((item) => item.id));
      toast.success("Images reordered successfully");
    } catch (error) {
      toast.error("Failed to reorder images");
      setItems(images); // Revert to original order on error
    } finally {
      setIsReordering(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id);
      await deleteHomepageImage(id);
      setItems(items.filter((item) => item.id !== id));
      toast.success("Image deleted successfully");
    } catch (error) {
      toast.error("Failed to delete image");
    } finally {
      setIsDeleting(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/20 p-8 text-center">
        <p className="text-muted-foreground">
          No homepage images found. Upload some images to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {isReordering && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg font-medium">Updating order...</span>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {items.map((image, index) => (
              <SortableImageItem
                key={image.id}
                image={image}
                index={index}
                isDeleting={isDeleting}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
