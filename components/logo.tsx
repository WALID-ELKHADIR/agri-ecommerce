type LogoProps = {
  variant?: "light" | "dark";
  showTagline?: boolean;
  className?: string;
};

export function Logo({
  variant = "dark",
  showTagline = true,
  className = "",
}: LogoProps) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A2540] to-[#0E7490] shadow-lg shadow-[#0A2540]/25">
        <span className="absolute inset-x-0 top-0 h-px bg-white/25" />
        <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" aria-hidden="true">
          <path
            d="M16 4.5c0 0 8.5 9.4 8.5 14.7a8.5 8.5 0 1 1-17 0C7.5 13.9 16 4.5 16 4.5Z"
            fill="white"
          />
          <path
            d="M10 20.5c1.8-1.6 3.7 1.6 5.5 0s3.7 1.6 5.5 0"
            stroke="#06B6D4"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <circle cx="16" cy="24.2" r="1.3" fill="#06B6D4" />
        </svg>
      </span>

      <span className="flex flex-col leading-none">
        <span
          className={`text-base font-bold tracking-tight ${
            variant === "light" ? "text-white" : "text-[#0A2540]"
          }`}
        >
          Saqia
        </span>
        {showTagline ? (
          <span
            className={`mt-1 text-[9px] font-semibold uppercase tracking-[0.24em] ${
              variant === "light" ? "text-white/50" : "text-slate-500"
            }`}
          >
            Irrigation &amp; pompage
          </span>
        ) : null}
      </span>
    </span>
  );
}
