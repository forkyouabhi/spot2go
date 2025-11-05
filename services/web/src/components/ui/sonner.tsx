// services/web/src/components/ui/sonner.tsx
"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        style: {
          zIndex: 9999, // Keeps it on top of the login page
        } as React.CSSProperties,
      }}
      // --- THIS IS THE FIX ---
      // Wrap the CSS variables in `rgb()` to make them valid colors.
      style={
        {
          "--normal-bg": "rgb(var(--popover))",
          "--normal-text": "rgb(var(--popover-foreground))",
          "--normal-border": "rgb(var(--border))",
        } as React.CSSProperties
      }
      // --- END FIX ---
      {...props}
    />
  );
};

export { Toaster };