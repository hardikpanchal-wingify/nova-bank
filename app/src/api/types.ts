export type UserType = "new" | "standard" | "premium";
export type Environment = string;

export interface DashboardConfig {
  enabled: boolean;
  widget_order: string[];
  widget_style: "card" | "list";
  hero_copy: string;
  show_promo_banner: boolean;
  promo_copy: string;
}

export interface LoanConfig {
  enabled: boolean;
  algo_variant: string;
  max_loan_amount: number;
  rate_label: string;
  risk_tier: "low" | "medium" | "high";
}

export interface FeatureConfig {
  dashboard: DashboardConfig;
  loan: LoanConfig;
}

export interface TrackResponse {
  success: boolean;
  event: string;
}

export interface SimulateResponse {
  success: boolean;
  scenario: string;
  total_users: number;
}
