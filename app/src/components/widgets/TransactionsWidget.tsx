interface Props {
  style: "card" | "list";
}

const transactions = [
  { merchant: "Spotify", amount: -14.99, icon: "🎵", date: "Feb 28" },
  { merchant: "Amazon", amount: -67.50, icon: "📦", date: "Feb 27" },
  { merchant: "Salary Deposit", amount: 4200.00, icon: "💰", date: "Feb 25" },
  { merchant: "Uber Eats", amount: -32.80, icon: "🍔", date: "Feb 24" },
  { merchant: "Apple Store", amount: -199.00, icon: "🍎", date: "Feb 23" },
];

export default function TransactionsWidget({ style }: Props) {
  if (style === "list") {
    return (
      <div className="widget-enter">
        <div className="py-2.5 px-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Recent Transactions</p>
        </div>
        {transactions.map((t, i) => (
          <div key={i} className="flex items-center justify-between py-2 px-5 border-t border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="text-sm">{t.icon}</span>
              <div>
                <p className="text-sm text-slate-700">{t.merchant}</p>
                <p className="text-xs text-slate-400">{t.date}</p>
              </div>
            </div>
            <span className={`text-sm font-mono ${t.amount > 0 ? "text-emerald-600" : "text-slate-700"}`}>
              {t.amount > 0 ? "+" : ""}${Math.abs(t.amount).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="widget-enter glass-panel p-6 space-y-4">
      <p className="text-sm text-muted-foreground tracking-wide uppercase">Recent Transactions</p>
      <div className="grid gap-3">
        {transactions.map((t, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/40 hover:bg-secondary/60 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-background/50 flex items-center justify-center text-base">
                {t.icon}
              </div>
              <div>
                <p className="text-sm font-medium">{t.merchant}</p>
                <p className="text-xs text-muted-foreground">{t.date}</p>
              </div>
            </div>
            <span className={`text-sm font-mono font-medium ${t.amount > 0 ? "text-primary" : ""}`}>
              {t.amount > 0 ? "+" : "−"}${Math.abs(t.amount).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
