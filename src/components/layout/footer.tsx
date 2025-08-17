export const Footer = () => {
  return (
    <footer className="h-8 flex items-center justify-center bg-card border-t border-border text-xs text-muted-foreground">
      <span>
        Python runs in a web worker via{" "}
        <a
          href="https://pyodide.org"
          className="text-primary hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Pyodide
        </a>
        . &copy; {new Date().getFullYear()}
      </span>
    </footer>
  );
};
