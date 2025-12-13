"use client";

import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const LoginButton = () => {
  const { data: user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <Button asChild className="w-full mb-4" disabled>
        <Link href="/auth/login?returnTo=/dashboard">Login</Link>
      </Button>
    );
  }

  if (user) {
    return null;
  }
  return (
    <Button asChild className="w-full mb-4">
      <Link href="/auth/login?returnTo=/dashboard">Login</Link>
    </Button>
  );
};
