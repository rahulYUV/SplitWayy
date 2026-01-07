"use client";

import { LabelList, Pie, PieChart } from "recharts";
import {
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { LiquidGlassCard } from "@/components/ui/LiquidGlassCard";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChartDataPoint {
    name: string;
    value: number;
    fill: string;
}

interface GroupStatsChartProps {
    data: ChartDataPoint[];
    totalSpending: number;
    className?: string;
}

export function GroupStatsChart({ data, totalSpending, className }: GroupStatsChartProps) {
    const chartConfig: ChartConfig = {};
    data.forEach((d) => {
        chartConfig[d.name] = {
            label: d.name,
            color: d.fill
        };
    });

    // Calculate top spender percentage
    const topSpender = data[0];
    const percentage = topSpender ? ((topSpender.value / totalSpending) * 100).toFixed(1) : "0";

    return (
        <LiquidGlassCard draggable={false} className={cn("flex flex-col bg-white/90 border-none rounded-3xl shadow-sm", className)}>
            <CardHeader className="items-center pb-0 pt-6 relative z-30">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-gray-700 flex items-center gap-2">
                    Spending Breakdown
                    {topSpender && (
                        <Badge variant="outline" className="text-[#32dd9e] bg-[#32dd9e]/10 border-none ml-2 px-1.5 py-0 rounded-md font-bold">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {percentage}%
                        </Badge>
                    )}
                </CardTitle>
                <CardDescription className="text-xs font-bold text-black mt-1">
                    Top: {topSpender?.name || "None"}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-4 cursor-pointer relative z-30">
                <ChartContainer
                    config={chartConfig}
                    className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[180px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent nameKey="name" hideLabel />}
                        />
                        <Pie
                            data={data}
                            innerRadius={40}
                            dataKey="value"
                            nameKey="name"
                            radius={70}
                            cornerRadius={8}
                            paddingAngle={4}
                            stroke="none"
                        >
                            <LabelList
                                dataKey="value"
                                position="outside"
                                stroke="none"
                                fontSize={10}
                                fontWeight={700}
                                fill="#9ca3af" // gray-400
                                formatter={(value: number) => `₹${value}`}
                                className="hidden" // Hide if cluttering
                            />
                        </Pie>
                        {/* Center Text */}
                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" style={{ pointerEvents: 'none' }}>
                            <tspan x="50%" dy="-0.5em" fontSize="18" fontWeight="900" fill="#000">
                                ₹{totalSpending > 1000 ? (totalSpending / 1000).toFixed(1) + 'k' : totalSpending}
                            </tspan>
                            <tspan x="50%" dy="1.4em" fontSize="8" fill="#9ca3af" fontWeight="700" letterSpacing="0.1em">
                                TOTAL
                            </tspan>
                        </text>
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-3 py-6 pt-2 border-t border-gray-50 mt-4 relative z-30">
                {/* Category Breakdown */}
                <div className="w-full flex flex-col gap-2">
                    {data.map((item) => (
                        <div key={item.name} className="flex items-center justify-between w-full text-xs group">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm" style={{ backgroundColor: item.fill }} />
                                <span className="font-bold text-gray-600 uppercase tracking-wider group-hover:text-black transition-colors">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-black font-black mr-1">
                                    {((item.value / totalSpending) * 100).toFixed(0)}%
                                </span>
                                <span className="font-black text-black italic">₹{item.value.toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>


            </CardFooter>
        </LiquidGlassCard>
    );
}
