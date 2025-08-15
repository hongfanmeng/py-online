export const Footer = () => {
  return (
    <footer className="h-8 flex items-center justify-center bg-gray-900 border-t border-gray-800 text-xs text-gray-400">
      <span>
        Python runs in a web worker via{" "}
        <a
          href="https://pyodide.org"
          className="text-blue-400 hover:underline"
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
