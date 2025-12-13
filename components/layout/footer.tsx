export const Footer = () => {
  return (
    <footer className="wrapper">
      <div className="flex">
        <p className="text-xs">
          {new Date().getFullYear()} -{" "}
          <a
            href="https://tophatcompany.com.br"
            target="_blank"
            rel="noopener noreferrer"
          >
            TopHatCompany
          </a>
        </p>
      </div>
    </footer>
  );
};
