import { trackEvent } from "../../api/client";
import type { UserType, Environment } from "../../api/types";
import { toast } from "sonner";

interface Props {
  style: "card" | "list";
  promoCopy: string;
  userId: string;
  userType: UserType;
  environment: Environment;
}

export default function PromoWidget({ style, promoCopy, userId, userType, environment }: Props) {
  const handleClick = async () => {
    await trackEvent("promo_clicked", userId, userType, environment);
    toast.success("Promo clicked — event tracked in Wingify", {
      description: `promo_clicked fired for ${userType} / ${environment}`,
    });
  };

  if (style === "list") {
    return (
      <div className="widget-enter flex items-center justify-between py-3 px-5 bg-slate-50">
        <div className="flex items-center gap-2">
          <span className="text-sm">✨</span>
          <p className="text-sm text-slate-700">{promoCopy}</p>
        </div>
        <button
          onClick={handleClick}
          className="text-xs px-3 py-1 rounded bg-slate-800 text-white hover:bg-slate-700 transition-colors"
        >
          Learn More
        </button>
      </div>
    );
  }

  return (
    <div className="widget-enter rounded-xl p-6 teal-gradient teal-glow col-span-full">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs tracking-widest uppercase text-primary-foreground/70">Special Offer</p>
          <p className="text-lg font-display font-semibold text-primary-foreground">{promoCopy}</p>
        </div>
        <button
          onClick={handleClick}
          className="px-5 py-2.5 rounded-lg bg-primary-foreground text-primary font-semibold text-sm hover:bg-primary-foreground/90 transition-colors"
        >
          Learn More
        </button>
      </div>
    </div>
  );
}
