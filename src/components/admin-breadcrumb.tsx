"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

export function AdminBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Format segment text for display
  const formatSegment = (segment: string) => {
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  // If we're on the admin root, don't show breadcrumbs
  if (segments.length === 1 && segments[0] === "admin") {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Admin Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/admin">Admin</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {segments.slice(1).map((segment, index) => {
          const segmentPath = `/admin/${segments.slice(1, index + 2).join("/")}`;

          // If this is the last segment, render as a page (current)
          if (index === segments.length - 2) {
            return (
              <BreadcrumbItem key={segment}>
                <BreadcrumbSeparator />
                <BreadcrumbPage>{formatSegment(segment)}</BreadcrumbPage>
              </BreadcrumbItem>
            );
          }

          // Otherwise, render as a link
          return (
            <BreadcrumbItem key={segment}>
              <BreadcrumbSeparator />
              <BreadcrumbLink asChild>
                <Link href={segmentPath}>{formatSegment(segment)}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
