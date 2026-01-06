"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-4 bg-white", className)}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                month_caption: "flex justify-center pt-1 relative items-center h-10",
                caption_label: "text-xs font-black uppercase tracking-[0.2em] italic",
                nav: "space-x-1 flex items-center",
                button_previous: cn(
                    buttonVariants({ variant: "outline" }),
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1 z-10 rounded-lg"
                ),
                button_next: cn(
                    buttonVariants({ variant: "outline" }),
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1 z-10 rounded-lg"
                ),
                month_grid: "w-full border-collapse",
                weekdays: "flex justify-between w-full mb-2",
                weekday: "text-black/30 w-9 font-black text-[9px] uppercase text-center",
                week: "flex w-full mt-1 justify-between",
                day: "h-9 w-9 text-center text-sm p-0 relative flex items-center justify-center",
                day_button: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-9 w-9 p-0 font-bold transition-all rounded-xl hover:bg-[#32dd9e] hover:text-white flex items-center justify-center"
                ),
                selected: "bg-black text-white rounded-xl shadow-lg",
                today: "bg-[#32dd9e]/10 text-[#32dd9e] border border-[#32dd9e]/20",
                outside: "text-black/10 opacity-30 pointer-events-none",
                disabled: "text-black/5 opacity-20 pointer-events-none",
                range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                hidden: "invisible",
                ...classNames,
            }}
            components={{
                Chevron: ({ orientation }) => {
                    if (orientation === "left") {
                        return <ChevronLeft className="h-4 w-4" />
                    }
                    return <ChevronRight className="h-4 w-4" />
                },
            }}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
