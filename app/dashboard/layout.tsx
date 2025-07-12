"use client";

import useGlobalAuthenticationStore from "@/store/wallet.store";
import { redirect } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { address } = useGlobalAuthenticationStore();

  if (address === "") {
    redirect("/");
  }

  return <div>{children}</div>;
}
