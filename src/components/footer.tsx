export const Footer = () => {
  return (
    <footer className="h-8 flex items-center justify-center bg-[#2d2d30] border-t border-[#3c3c3c] text-xs text-[#969696]">
      <span>
        Python runs in a web worker via{" "}
        <a
          href="https://pyodide.org"
          className="text-[#007acc] hover:underline"
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
