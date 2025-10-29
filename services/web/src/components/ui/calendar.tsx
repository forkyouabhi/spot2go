// forkyouabhi/spot2go/spot2go-0f60f523c7927d48a33ea0a73e23a85a8957259e/services/web/src/components/ui/calendar.tsx
"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "./utils"; // Assuming utils.ts is in the same directory
import { buttonVariants } from "./button"; // Assuming button.tsx is in the same directory

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-brand-burgundy",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border-brand-orange text-brand-orange"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-brand-burgundy rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-brand-burgundy hover:bg-brand-yellow rounded-md" // Added rounded-md here for consistency
        ),
        // --- MODIFICATION START ---
        day_selected:
          "bg-brand-orange text-brand-cream hover:bg-brand-orange hover:text-brand-cream focus:bg-brand-orange focus:text-brand-cream rounded-md w-full h-full p-0", // Ensure full width/height, remove padding, ensure rounding
        // --- MODIFICATION END ---
        day_today: "bg-brand-yellow text-brand-burgundy",
        day_outside: "text-brand-burgundy opacity-50",
        day_disabled: "text-brand-burgundy opacity-50 cursor-not-allowed",
        day_range_middle:
          "aria-selected:bg-brand-yellow aria-selected:text-brand-burgundy",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}

export { Calendar };