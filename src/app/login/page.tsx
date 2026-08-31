import type { Metadata } from "next";
import LoginForm from "./LoginForm";
import { safeRedirectPath } from "@/lib/session";

export const metadata: Metadata = {
  title: "Sign in · Lumora",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <LoginForm next={safeRedirectPath(next)} />;
}
