import { redirect } from "next/navigation";
import { AppSidebar } from "~/components/app-sidebar";
import { AdminBreadcrumb } from "~/components/admin-breadcrumb";
import { Separator } from "~/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { auth } from "~/server/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user.isAdmin) {
    redirect("/");
  }

  return (
    <SidebarProvider>
      <AppSidebar
        user={{
          name: session.user.name ?? "Admin User",
          email: session.user.email ?? "admin@example.com",
          image: session.user.image ?? undefined,
        }}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <AdminBreadcrumb />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
