import React from "react";
import { auth } from "~/server/auth";

export async function AdminMenu() {
  const session = await auth();

  if (!session?.user.isAdmin) return null;
  return <div>AdminMenu</div>;
}

export default AdminMenu;
