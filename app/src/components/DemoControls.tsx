import { useState } from "react";
import { simulateEvents } from "../api/client";
import type { UserType, FeatureConfig } from "../api/types";
import type { WingifyEnvironment } from "../api/wingifyApp";
import { toast } from "sonner";

interface Props {
  userType: UserType;
  environment: WingifyEnvironment | null;
  environments: WingifyEnvironment[];
  userId: string;
  onUserTypeChange: (t: UserType) => void;
  onEnvironmentChange: (e: WingifyEnvironment) => void;
  onReinitialize: () => void;
  config: FeatureConfig | null;
}

const segments: { label: string; value: UserType }[] = [
  { label: "New User", value: "new" },
  { label: "Standard", value: "standard" },
  { label: "Premium", value: "premium" },
];

export default function DemoControls({
  userType,
  environment,
  environments,
  userId,
  onUserTypeChange,
  onEnvironmentChange,
  onReinitialize,
  config,
}: Props) {
  const [showSimulate, setShowSimulate] = useState(false);
  const [showFlags, setShowFlags] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const handleSimulate = async (scenario: "high_engagement" | "low_engagement") => {
    if (!environment) return;
    setSimulating(true);
    try {
      const result = await simulateEvents(String(environment.id), scenario);
      toast.success(`Simulated ${scenario.replace("_", " ")}`, {
        description: `${result.total_users} users simulated in ${environment.name}`,
      });
    } catch {
      toast.error("Simulation failed");
    }
    setSimulating(false);
    setShowSimulate(false);
  };

  const handleReinitialize = () => {
    onReinitialize();
    toast.success("SDK reinitialized", {
      description: "Fetched flags for a new user",
    });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 w-80">
      <div className="glass-panel-strong p-4 space-y-4 shadow-2xl shadow-black/40">
        <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-semibold">
          Demo Controls
        </p>

        {/* User Id */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="demo-user-id" className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
            User Id
          </label>
          <input
            id="demo-user-id"
            type="text"
            value={userId}
            readOnly
            className="flex-1 min-w-0 text-[10px] font-mono py-1 px-1.5 rounded-md bg-secondary/60 text-muted-foreground cursor-default outline-none"
          />
          <button
            onClick={handleReinitialize}
            className="text-[10px] px-1.5 py-1 rounded-md bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors font-medium shrink-0"
          >
            Re-initialize
          </button>
        </div>

        {/* Segment */}
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Segment</p>
          <div className="flex gap-1">
            {segments.map((s) => (
              <button
                key={s.value}
                onClick={() => onUserTypeChange(s.value)}
                className={`flex-1 text-xs py-1.5 rounded-md transition-all font-medium ${
                  userType === s.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Environment */}
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Environment</p>
          <div className="flex flex-wrap gap-1">
            {environments.map((e) => (
              <button
                key={e.id}
                onClick={() => onEnvironmentChange(e)}
                className={`flex-1 min-w-[4.5rem] text-xs py-1.5 rounded-md transition-all font-medium ${
                  environment?.id === e.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                }`}
              >
                {e.name}
              </button>
            ))}
          </div>
        </div>

        {/* Simulate */}
        <div className="space-y-2">
          <button
            onClick={() => setShowSimulate(!showSimulate)}
            className="w-full text-xs py-2 rounded-md bg-secondary text-foreground hover:bg-secondary/80 transition-colors font-medium"
          >
            Simulate Events
          </button>
          {showSimulate && (
            <div className="space-y-1.5 p-3 rounded-lg bg-background/50">
              <button
                onClick={() => handleSimulate("high_engagement")}
                disabled={simulating}
                className="w-full text-xs py-2 rounded-md bg-primary/20 text-primary hover:bg-primary/30 transition-colors disabled:opacity-50"
              >
                {simulating ? "Simulating..." : "Simulate High Engagement (20 users)"}
              </button>
              <button
                onClick={() => handleSimulate("low_engagement")}
                disabled={simulating}
                className="w-full text-xs py-2 rounded-md bg-secondary/60 text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-50"
              >
                {simulating ? "Simulating..." : "Simulate Low Engagement (20 users)"}
              </button>
            </div>
          )}
        </div>

        {/* Flag Values */}
        <div>
          <button
            onClick={() => setShowFlags(!showFlags)}
            className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className={`w-3 h-3 transition-transform ${showFlags ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            Wingify Flag Values
          </button>
          {showFlags && config && (
            <pre className="mt-2 p-3 rounded-lg bg-background/50 text-[10px] text-muted-foreground overflow-auto max-h-48 font-mono leading-relaxed">
              {JSON.stringify(config, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
