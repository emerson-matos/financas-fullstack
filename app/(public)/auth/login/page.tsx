import { LoginForm } from "@/components/login-form";
import { LoginFormEmail } from "@/components/login/form-email";
import { Suspense } from "react";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const isEmail = (await searchParams)?.["emailLogin"] || false;
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense
          fallback={
            <div className="animate-pulse text-center">Carregando...</div>
          }
        >
          {isEmail ? <LoginFormEmail /> : <LoginForm />}
        </Suspense>
      </div>
    </div>
  );
}
