import { API_BASE_URL } from "./config";

const ACCESS_ERROR = "Please access this app from Logged In FE Sample App workspace account.";
const SESSION_STORAGE_KEY = "nova-wingify-launch";

export class WingifyNotLoggedInError extends Error {
  loginUrl = "https://app.wingify.com/";

  constructor() {
    super(ACCESS_ERROR);
    this.name = "WingifyNotLoggedInError";
  }
}

export interface WingifyEnvironment {
  id: number | string;
  name: string;
  token: string;
}

export interface WingifyProjectConfig {
  accountId: number;
  projectId: number;
  projectName: string;
  environments: WingifyEnvironment[];
}

export interface WingifyAuth {
  accountId: number;
  environmentId: string;
  sdkKey: string;
}

let currentAuth: WingifyAuth | null = null;

export function setWingifyAuth(auth: WingifyAuth | null) {
  currentAuth = auth;
}

export function getWingifyAuth(): WingifyAuth | null {
  return currentAuth;
}

function queryParams(): URLSearchParams {
  const fromSearch = new URLSearchParams(window.location.search);
  const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
  const hashQuery = hash.includes("?") ? hash.slice(hash.indexOf("?") + 1) : hash.startsWith("/") ? "" : hash;
  const fromHash = new URLSearchParams(hashQuery);
  fromHash.forEach((value, key) => {
    if (!fromSearch.get(key) && value) fromSearch.set(key, value);
  });
  return fromSearch;
}

function readStoredConfig(): WingifyProjectConfig | null {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WingifyProjectConfig) : null;
  } catch {
    return null;
  }
}

function clearLaunchParamsFromUrl() {
  const url = new URL(window.location.href);
  ["p", "payload", "accountId", "account_id", "prod", "production", "staging", "stating", "dev", "development"].forEach(
    (key) => url.searchParams.delete(key)
  );
  url.hash = "";
  window.history.replaceState(null, "", url.pathname + url.search);
}

export async function fetchWingifyProjectConfig(): Promise<WingifyProjectConfig> {
  const params = queryParams();
  const payload = (params.get("p") || params.get("payload") || "").trim();

  if (payload) {
    const res = await fetch(`${API_BASE_URL}/api/launch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload }),
    });
    if (!res.ok) throw new WingifyNotLoggedInError();
    const config = (await res.json()) as WingifyProjectConfig;
    if (!config?.accountId || !config.environments?.length) throw new WingifyNotLoggedInError();
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(config));
    clearLaunchParamsFromUrl();
    return config;
  }

  const stored = readStoredConfig();
  if (stored?.accountId && stored.environments?.length === 3) return stored;

  throw new WingifyNotLoggedInError();
}

export function pickDefaultEnvironment(environments: WingifyEnvironment[]): WingifyEnvironment {
  return (
    environments.find((env) => /staging/i.test(String(env.name) + String(env.id))) ||
    environments.find((env) => /dev/i.test(String(env.name) + String(env.id))) ||
    environments[0]
  );
}
