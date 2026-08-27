interface SparklineProps {
  className?: string;
}

export default function Sparkline({ className }: SparklineProps) {
  return (
    <svg viewBox="0 0 120 40" className={className} fill="none">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(163 100% 42%)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="hsl(163 100% 42%)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 32 L10 28 L20 30 L30 22 L40 24 L50 18 L60 20 L70 12 L80 15 L90 8 L100 10 L110 6 L120 4"
        stroke="hsl(163 100% 42%)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M0 32 L10 28 L20 30 L30 22 L40 24 L50 18 L60 20 L70 12 L80 15 L90 8 L100 10 L110 6 L120 4 L120 40 L0 40 Z"
        fill="url(#sparkGrad)"
      />
    </svg>
  );
}
