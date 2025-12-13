"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function BackButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const router = useRouter();
  const handleBack = () => {
    router.back();
  };
  return (
    <Button
      variant="outline"
      onClick={handleBack}
      className={className}
      {...props}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      Voltar
    </Button>
  );
}
