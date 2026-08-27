import Sparkline from "../Sparkline";

interface Props {
  style: "card" | "list";
}

export default function BalanceWidget({ style }: Props) {
  const balance = 24830.5;

  if (style === "list") {
    return (
      <div className="widget-enter flex items-center justify-between py-3 px-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Balance</p>
            <p className="text-base font-semibold text-slate-900">${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        <span className="text-xs text-slate-400 font-mono">•••• 4821</span>
      </div>
    );
  }

  return (
    <div className="widget-enter glass-panel p-6 space-y-4 teal-glow">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground tracking-wide uppercase">Total Balance</p>
        <span className="text-xs text-muted-foreground font-mono">•••• •••• •••• 4821</span>
      </div>
      <p className="text-4xl font-display font-semibold tracking-tight">
        ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </p>
      <Sparkline className="w-full h-10" />
      <div className="flex items-center gap-2 text-xs text-primary">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
        </svg>
        +12.4% this month
      </div>
    </div>
  );
}
