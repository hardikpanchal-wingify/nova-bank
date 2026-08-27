import { useEffect } from "react";
import type { ComponentProps, CSSProperties } from "react";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  useEffect(() => {
    const dismissOnPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.closest("[data-sonner-toast]")) return;

      event.preventDefault();
      event.stopPropagation();
      toast.dismiss();
    };

    document.addEventListener("pointerdown", dismissOnPointerDown, true);
    return () => document.removeEventListener("pointerdown", dismissOnPointerDown, true);
  }, []);

  return (
    <Sonner
      {...props}
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast cursor-pointer group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          icon: "cursor-pointer pointer-events-auto !text-foreground hover:!text-primary transition-colors",
        },
        style: {
          "--normal-text": "hsl(var(--foreground))",
        } as CSSProperties,
      }}
    />
  );
};

export { Toaster, toast };
