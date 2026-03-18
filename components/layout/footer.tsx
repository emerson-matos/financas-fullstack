export const Footer = () => {
  return (
    <footer className="wrapper">
      <div className="flex flex-col gap-2 text-xs text-muted-foreground">
        <p>
          {new Date().getFullYear()} -{" "}
          <a
            href="https://tophatcompany.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            TopHatCompany
          </a>
        </p>
        <p className="text-[10px]">
          Utilizamos cookies analytics para melhorar sua experiência.{" "}
          <a href="/privacidade" className="hover:underline">
            Política de Privacidade
          </a>
        </p>
      </div>
    </footer>
  );
};
