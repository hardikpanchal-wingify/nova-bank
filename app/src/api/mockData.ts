import { FeatureConfig, UserType, Environment } from "./types";

// Consistent loan values per segment
const loanBySegment = {
  new: {
    enabled: true,
    algo_variant: "conservative",
    max_loan_amount: 5000,
    rate_label: "Introductory Rate",
    risk_tier: "low" as const,
  },
  standard: {
    enabled: true,
    algo_variant: "moderate",
    max_loan_amount: 15000,
    rate_label: "Standard Rate",
    risk_tier: "medium" as const,
  },
  premium: {
    enabled: true,
    algo_variant: "aggressive",
    max_loan_amount: 40000,
    rate_label: "Premium Rate",
    risk_tier: "high" as const,
  },
};

type ConfigMap = Record<string, Record<UserType, FeatureConfig>>;

const configs: ConfigMap = {
  development: {
    new: {
      dashboard: {
        enabled: true,
        widget_order: ["balance", "promo", "loans", "transactions"],
        widget_style: "list",
        hero_copy: "Welcome to Nova Bank ✨",
        show_promo_banner: true,
        promo_copy: "Open your first savings account and earn 5% APY",
      },
      loan: loanBySegment.new,
    },
    standard: {
      dashboard: {
        enabled: true,
        widget_order: ["balance", "loans", "promo", "transactions"],
        widget_style: "card",
        hero_copy: "Your financial snapshot",
        show_promo_banner: true,
        promo_copy: "You qualify for our premium loan rate",
      },
      loan: loanBySegment.standard,
    },
    premium: {
      dashboard: {
        enabled: true,
        widget_order: ["balance", "loans", "transactions", "promo"],
        widget_style: "card",
        hero_copy: "Welcome back, valued member",
        show_promo_banner: true,
        promo_copy: "Exclusive: Private lending at 2.9% APR",
      },
      loan: loanBySegment.premium,
    },
  },
  staging: {
    new: {
      dashboard: {
        enabled: true,
        widget_order: ["balance", "transactions", "loans", "promo"],
        widget_style: "list",
        hero_copy: "Start your journey with Nova",
        show_promo_banner: true,
        promo_copy: "New customer bonus: $50 when you deposit $500",
      },
      loan: loanBySegment.new,
    },
    standard: {
      dashboard: {
        enabled: true,
        widget_order: ["balance", "loans", "promo", "transactions"],
        widget_style: "card",
        hero_copy: "Your financial snapshot",
        show_promo_banner: true,
        promo_copy: "You qualify for our premium loan rate",
      },
      loan: loanBySegment.standard,
    },
    premium: {
      dashboard: {
        enabled: true,
        widget_order: ["balance", "loans", "transactions", "promo"],
        widget_style: "card",
        hero_copy: "Welcome back, valued member",
        show_promo_banner: true,
        promo_copy: "Exclusive: Private lending at 2.9% APR",
      },
      loan: loanBySegment.premium,
    },
  },
  production: {
    new: {
      dashboard: {
        enabled: true,
        widget_order: ["balance", "transactions", "loans"],
        widget_style: "list",
        hero_copy: "Welcome back",
        show_promo_banner: false,
        promo_copy: "",
      },
      loan: loanBySegment.new,
    },
    standard: {
      dashboard: {
        enabled: true,
        widget_order: ["balance", "transactions", "loans"],
        widget_style: "list",
        hero_copy: "Welcome back",
        show_promo_banner: false,
        promo_copy: "",
      },
      loan: loanBySegment.standard,
    },
    premium: {
      dashboard: {
        enabled: true,
        widget_order: ["balance", "transactions", "loans"],
        widget_style: "list",
        hero_copy: "Welcome back",
        show_promo_banner: false,
        promo_copy: "",
      },
      loan: loanBySegment.premium,
    },
  },
};

export function getMockFeatures(userType: UserType, environment: Environment): FeatureConfig {
  const envConfig = configs[environment] || configs.staging;
  return envConfig[userType];
}
