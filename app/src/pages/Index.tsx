import { useState, useEffect, useCallback } from "react";
import Dashboard from "../components/Dashboard";
import DemoControls from "../components/DemoControls";
import { fetchFeatures } from "../api/client";
import {
  fetchWingifyProjectConfig,
  pickDefaultEnvironment,
  setWingifyAuth,
  WingifyNotLoggedInError,
  type WingifyEnvironment,
  type WingifyProjectConfig,
} from "../api/wingifyApp";
import type { FeatureConfig, UserType } from "../api/types";

const ACCESS_MESSAGE = "Please access this app from Logged In FE Sample App workspace account.";

function LoadingSkeleton() {
  return (
    <div className="min-h-screen p-6 md:p-10 max-w-5xl mx-auto space-y-6 animate-pulse">
      <div className="space-y-3 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-secondary" />
          <div className="w-20 h-3 rounded bg-secondary" />
        </div>
        <div className="w-72 h-8 rounded bg-secondary" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 rounded-xl bg-secondary/50" />
        ))}
      </div>
    </div>
  );
}

export default function Index() {
  const [userType, setUserType] = useState<UserType>("standard");
  const [project, setProject] = useState<WingifyProjectConfig | null>(null);
  const [environment, setEnvironment] = useState<WingifyEnvironment | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [config, setConfig] = useState<FeatureConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>(`demo_standard_${Date.now()}`);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const nextProject = await fetchWingifyProjectConfig();
        if (cancelled) return;
        const nextEnv = pickDefaultEnvironment(nextProject.environments);
        setProject(nextProject);
        setEnvironment(nextEnv);
        setWingifyAuth({
          accountId: nextProject.accountId,
          environmentId: String(nextEnv.id),
          sdkKey: nextEnv.token,
        });
        setSessionError(null);
      } catch (err) {
        if (cancelled) return;
        setWingifyAuth(null);
        setLoading(false);
        setSessionError(
          err instanceof WingifyNotLoggedInError
            ? err.message
            : err instanceof Error
              ? err.message
              : ACCESS_MESSAGE
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadFeatures = useCallback(async () => {
    if (!environment) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchFeatures(userType, String(environment.id), userId);
      setConfig(data);
    } catch (err) {
      console.error("Failed to fetch features:", err);
    }
    setLoading(false);
  }, [userType, environment, userId]);

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  const handleUserTypeChange = (type: UserType) => {
    setUserId(`demo_${type}_${Date.now()}`);
    setUserType(type);
  };

  const handleReinitialize = () => {
    setUserId(`demo_${userType}_${Date.now()}`);
  };

  const handleEnvironmentChange = (next: WingifyEnvironment) => {
    if (!project) return;
    setEnvironment(next);
    setWingifyAuth({
      accountId: project.accountId,
      environmentId: String(next.id),
      sdkKey: next.token,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {sessionError ? (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="glass-panel-strong max-w-lg p-6 space-y-3 text-center border border-destructive/40">
            <p className="text-sm text-destructive">{ACCESS_MESSAGE}</p>
            <a
              href="https://app.wingify.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex text-xs px-3 py-2 rounded-md bg-primary text-primary-foreground"
            >
              Open app.wingify.com
            </a>
          </div>
        </div>
      ) : loading || !config || !environment ? (
        <LoadingSkeleton />
      ) : (
        <Dashboard config={config} userType={userType} environment={String(environment.id)} userId={userId} />
      )}
      {!sessionError && (
        <DemoControls
          userType={userType}
          environment={environment}
          environments={project?.environments ?? []}
          userId={userId}
          onUserTypeChange={handleUserTypeChange}
          onEnvironmentChange={handleEnvironmentChange}
          onReinitialize={handleReinitialize}
          config={config}
        />
      )}
    </div>
  );
}