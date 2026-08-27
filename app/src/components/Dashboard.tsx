import type { FeatureConfig, UserType, Environment } from "../api/types";
import BalanceWidget from "./widgets/BalanceWidget";
import TransactionsWidget from "./widgets/TransactionsWidget";
import LoanWidget from "./widgets/LoanWidget";
import PromoWidget from "./widgets/PromoWidget";

interface Props {
  config: FeatureConfig;
  userType: UserType;
  environment: Environment;
  userId: string;  // add this
}

const widgetMap: Record<string, string> = {
  balance: "balance",
  transactions: "transactions",
  loans: "loans",
  promo: "promo",
};

export default function Dashboard({ config, userType, environment, userId }: Props) {
  const { dashboard, loan } = config;
  const isCard = dashboard.widget_style === "card";

  const renderWidget = (key: string, index: number) => {
    switch (key) {
      case "balance":
        return <BalanceWidget key={`balance-${index}`} style={dashboard.widget_style} />;
      case "transactions":
        return <TransactionsWidget key={`txn-${index}`} style={dashboard.widget_style} />;
      case "loans":
        return <LoanWidget key={`loan-${index}`} style={dashboard.widget_style} config={loan} userId={userId} userType={userType} environment={environment} />;
      case "promo":
        return dashboard.show_promo_banner ? (
          <PromoWidget key={`promo-${index}`} style={dashboard.widget_style} promoCopy={dashboard.promo_copy} userId={userId} userType={userType} environment={environment} />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen p-6 md:p-10 max-w-5xl mx-auto space-y-6 ${!isCard ? "list-mode" : ""}`}>
      {/* Header */}
      <div className="space-y-1 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCard ? "teal-gradient" : "bg-slate-200"}`}>
            <span className={`font-bold text-sm ${isCard ? "text-primary-foreground" : "text-slate-700"}`}>N</span>
          </div>
          <span className={`text-sm font-semibold tracking-wider uppercase ${isCard ? "text-muted-foreground" : "text-slate-500"}`}>Nova Bank</span>
        </div>
        <h1 className={`font-display font-semibold tracking-tight ${isCard ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl text-slate-900"}`}>
          {dashboard.hero_copy}
        </h1>
      </div>

      {/* Widgets */}
      {isCard ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {dashboard.widget_order.map((key, i) => renderWidget(key, i))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200 overflow-hidden shadow-sm">
          {dashboard.widget_order.map((key, i) => renderWidget(key, i))}
        </div>
      )}
    </div>
  );
}
