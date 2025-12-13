import Link from "next/link";
import { TopHatLogo } from "@/components/top-hat-logo";
import { LoginButton } from "@/components/login-button";

const Home = () => {
  return (
    <div className="w-full max-w-2xl p-8 rounded flex flex-col items-center">
      <h1 className="mb-8 text-center text-3xl font-semibold tracking-tight sm:text-4xl">
        Finanças App
      </h1>
      <h2 className="text-center text-xl font-semibold tracking-tight sm:text-2xl mb-4">
        Entre ou crie uma conta
      </h2>
      <LoginButton />
      <p className="px-4 text-center text-sm text-muted-foreground sm:px-8 mb-4">
        Ao clicar em continuar, você concorda com nossos{" "}
        <Link href="/terms" className="underline underline-offset-4">
          Termos de Serviço
        </Link>{" "}
        e{" "}
        <Link href="/privacy" className="underline underline-offset-4">
          Política de Privacidade
        </Link>
        .
      </p>
      <div className="mt-3 flex items-center gap-1">
        <div className="flex aspect-square size-6 items-center justify-center rounded-lg">
          <TopHatLogo className="h-6 w-6" />
        </div>
        <p className="text-sm sm:text-base">TopHat Company</p>
      </div>
    </div>
  );
};
export { Home };
