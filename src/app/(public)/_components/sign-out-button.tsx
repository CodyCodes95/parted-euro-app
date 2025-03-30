"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { DropdownMenuItem } from "~/components/ui/dropdown-menu";
import { api } from "~/trpc/react";

const SignOutButton = () => {
  const router = useRouter();
  const { mutate: signOut } = api.user.signOut.useMutation({
    onSuccess: () => {
      router.push("/");
    },
  });

  return (
    <DropdownMenuItem
      onClick={() => signOut()}
      className="cursor-pointer text-red-600"
    >
      Logout
    </DropdownMenuItem>
  );
};

export default SignOutButton;
