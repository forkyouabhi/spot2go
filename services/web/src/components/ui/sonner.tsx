// services/web/src/components/ui/sonner.tsx
"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light" // Force light mode to match your Cream background
      className="toaster group"
      position="top-center" // Critical for PWA: Ensures toasts aren't hidden by keyboards
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#FFF8DC] group-[.toaster]:text-[#6C0345] group-[.toaster]:border-2 group-[.toaster]:border-[#DC6B19] group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl group-[.toaster]:font-sans",
          description: "group-[.toast]:text-[#DC6B19]",
          actionButton:
            "group-[.toast]:bg-[#DC6B19] group-[.toast]:text-[#FFF8DC] font-bold",
          cancelButton:
            "group-[.toast]:bg-[#F7C566] group-[.toast]:text-[#6C0345]",
          error: "group-[.toaster]:bg-red-50 group-[.toaster]:border-red-200 group-[.toaster]:text-red-800",
          success: "group-[.toaster]:bg-green-50 group-[.toaster]:border-green-200 group-[.toaster]:text-green-800",
          warning: "group-[.toaster]:bg-yellow-50 group-[.toaster]:border-yellow-200 group-[.toaster]:text-yellow-800",
          info: "group-[.toaster]:bg-blue-50 group-[.toaster]:border-blue-200 group-[.toaster]:text-blue-800",
        },
        style: {
          zIndex: 99999, // Ensure it sits on top of everything (modals, headers)
        } as React.CSSProperties,
      }}
      {...props}
    />
  );
};

export { Toaster };