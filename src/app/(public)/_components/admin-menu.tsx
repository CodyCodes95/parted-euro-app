import React from "react";
import { auth } from "~/server/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { UserIcon } from "lucide-react";
import SignOutButton from "./sign-out-button";

export async function AdminMenu() {
  const session = await auth();

  if (!session?.user.isAdmin) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <UserIcon className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href="/admin" className="w-full cursor-pointer">
            Admin Dashboard
          </Link>
        </DropdownMenuItem>
        <SignOutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default AdminMenu;
