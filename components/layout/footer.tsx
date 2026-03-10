export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
          <p>
            Desenvolvido com ♥ para a comunidade da{" "}
            <a
              href="https://lagoinhajundiai.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              Lagoinha Jundiaí
            </a>
          </p>
          <p>&copy; {new Date().getFullYear()} GC Finder</p>
        </div>
      </div>
    </footer>
  );
}
