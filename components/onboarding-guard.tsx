"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";

export const OnboardingGuard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: user, isLoading, isError, refetch } = useUser();
  const router = useRouter();

  // Handle redirect to welcome page if onboarding not completed
  useEffect(() => {
    if (
      user &&
      !user.onboardingCompleted &&
      window.location.pathname !== "/welcome"
    ) {
      router.push("/welcome");
    }

    // If there's no user after loading, redirect to login
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [isLoading, user, router]);
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground text-center">
              Carregando seu perfil...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-8">
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 mb-4">
              <p className="text-destructive text-sm">
                Houve um erro ao carregar seu perfil. Tente novamente.
              </p>
            </div>
            <div className="flex justify-center">
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
