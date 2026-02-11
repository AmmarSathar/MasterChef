export default function Footer({ className }: { className?: string }) {
  return (
    <footer
      className={`w-full h-10 flex items-center justify-between pointer-events-auto p-2 px-20 mt-4 pl-45 z-100 ${className || ""}`}
    >
      <div className="footer-left flex items-center justify-baseline gap-5">
        <button className="bg-transparent opacity-60 hover:opacity-100 transition-all duration-300 delay-50 border-none p-2 cursor-pointer">
          <a
            href="#"
            className="text-sm text-accent tracking-wide pointer-events-auto cursor-pointer"
          >
            Terms
          </a>
        </button>
        <button className="bg-transparent opacity-60 hover:opacity-100 transition-all duration-300 delay-100 border-none p-2 cursor-pointer">
          <a
            href="#"
            className="text-sm text-accent tracking-wide pointer-events-auto cursor-pointer"
          >
            Privacy
          </a>
        </button>
        <button className="bg-transparent opacity-60 hover:opacity-100 transition-all duration-300 delay-100 border-none p-2 cursor-pointer">
          <a
            href="#"
            className="text-sm text-accent tracking-wide pointer-events-auto cursor-pointer"
          >
            Support
          </a>
        </button>
      </div>
      <div className="footer-right flex items-center justify-end">
        <button className="bg-transparent opacity-60 hover:opacity-100 transition-all duration-300 delay-100 border-none p-2 cursor-pointer">
          <a
            href="#"
            className="text-sm text-accent tracking-wide pointer-events-auto cursor-pointer"
          >
            @ 2026 MasterChef - CookWise
          </a>
        </button>
      </div>
    </footer>
  );
}
