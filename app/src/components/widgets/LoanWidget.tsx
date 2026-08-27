import { useState, useRef } from "react";
import { CountUp } from "../CountUp";
import { trackEvent } from "../../api/client";
import type { LoanConfig } from "../../api/types";
import type { UserType, Environment } from "../../api/types";
import { toast } from "sonner";

interface Props {
  style: "card" | "list";
  config: LoanConfig;
  userType: UserType;
  userId: string;
  environment: Environment;
}

const riskColors: Record<string, string> = {
  low: "bg-risk-low/20 text-risk-low",
  medium: "bg-risk-medium/20 text-risk-medium",
  high: "bg-risk-high/20 text-risk-high",
};

export default function LoanWidget({ style, config, userId, userType, environment }: Props) {
  const [applying, setApplying] = useState(false);
  const hasTrackedHover = useRef(false);

  const handleHover = () => {
    if (!hasTrackedHover.current) {
      hasTrackedHover.current = true;
      trackEvent("loan_widget_interacted", userId, userType, environment);
      toast.success("Loan widget interacted — event tracked in Wingify", {
        description: `loan_widget_interacted fired for ${userType} / ${environment}`,
      });
    }
  };

  const handleApply = async () => {
    setApplying(true);
    await trackEvent("loan_application_started", userId, userType, environment);
    setApplying(false);
    toast.success("Application started — event tracked in Wingify", {
      description: `loan_application_started fired for ${userType} / ${environment}`,
    });
  };

  if (style === "list") {
    return (
      <div
        className="widget-enter flex items-center justify-between py-3 px-5"
        onMouseEnter={handleHover}
        onFocus={handleHover}
        tabIndex={0}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-slate-500">Loan Eligibility</p>
            <p className="text-base font-semibold text-slate-900">
              <CountUp end={config.max_loan_amount} />
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {config.rate_label}
          </span>
          <button
            onClick={handleApply}
            disabled={applying}
            className="text-xs px-3 py-1 rounded bg-slate-800 text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            Apply Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="widget-enter glass-panel p-6 space-y-5"
      onMouseEnter={handleHover}
      onFocus={handleHover}
      tabIndex={0}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground tracking-wide uppercase">Loan Eligibility</p>
        <span className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
          {config.algo_variant} algorithm
        </span>
      </div>

      <div className="count-up">
        <p className="text-5xl font-display font-semibold tracking-tight">
          <CountUp end={config.max_loan_amount} duration={1400} />
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${riskColors[config.risk_tier]}`}>
          {config.rate_label}
        </span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
          config.risk_tier === "low" ? "border-risk-low/30 text-risk-low" :
          config.risk_tier === "medium" ? "border-risk-medium/30 text-risk-medium" :
          "border-risk-high/30 text-risk-high"
        }`}>
          {config.risk_tier} risk
        </span>
      </div>

      <button
        onClick={handleApply}
        disabled={applying}
        className="w-full py-3 rounded-lg teal-gradient text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {applying ? "Processing..." : "Apply Now"}
      </button>
    </div>
  );
}
