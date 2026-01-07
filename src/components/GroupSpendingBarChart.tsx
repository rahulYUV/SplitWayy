"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, XAxis } from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";

const chartConfig = {
    amount: {
        label: "Amount",
        color: "#ff6d2f", // Orange
    },
} satisfies ChartConfig;

interface GroupSpendingBarChartProps {
    data: { name: string; value: number }[];
    totalSpending: number;
}

export function GroupSpendingBarChart({ data, totalSpending }: GroupSpendingBarChartProps) {
    // Calculate top spender percentage
    const sortedData = [...data].sort((a, b) => b.value - a.value);
    const topSpender = sortedData[0];
    const percentage = topSpender && totalSpending > 0
        ? ((topSpender.value / totalSpending) * 100).toFixed(1)
        : "0";

    return (
        <Card className="flex flex-col bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <CardHeader className="items-center pb-0 pt-6">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    Spending Breakdown
                    {topSpender && (
                        <Badge variant="outline" className="text-[#ff6d2f] bg-[#ff6d2f]/10 border-none ml-2 px-1.5 py-0 rounded-md font-bold">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {percentage}%
                        </Badge>
                    )}
                </CardTitle>
                <CardDescription className="text-xs font-bold text-black mt-1 uppercase">
                    {topSpender?.name || "No Data"} leads
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-4 pt-4">
                <ChartContainer config={chartConfig} className="max-h-[200px] w-full">
                    <BarChart accessibilityLayer data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        {/* Patterns Defs */}
                        <defs>
                            <pattern
                                id="hatched-bar-pattern-amount" // ID matches color key or hardcoded
                                x="0"
                                y="0"
                                width="8"
                                height="8"
                                patternUnits="userSpaceOnUse"
                                patternTransform="rotate(-45)"
                            >
                                <rect width="10" height="10" opacity={0.3} fill="#ff6d2f"></rect>
                                <rect width="2" height="10" fill="#ff6d2f"></rect>
                            </pattern>
                            <DottedBackgroundPattern />
                        </defs>

                        <rect
                            x="0"
                            y="0"
                            width="100%"
                            height="100%"
                            fill="url(#default-pattern-dots)"
                            opacity={0.5}
                        />

                        <XAxis
                            dataKey="name"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }}
                            tickFormatter={(value) => value.length > 6 ? value.slice(0, 6) + '..' : value}
                        />
                        <ChartTooltip
                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar
                            dataKey="value"
                            fill="#ff6d2f" // Fallback
                            radius={[6, 6, 6, 6]}
                            shape={<CustomHatchedBar />}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

const CustomHatchedBar = (
    props: any
) => {
    const { x, y, width, height } = props;

    // Use the ID defined in <defs>
    return (
        <rect
            rx={6}
            x={x}
            y={y}
            width={width}
            height={height}
            stroke="none"
            fill="url(#hatched-bar-pattern-amount)"
        />
    );
};

const DottedBackgroundPattern = () => {
    return (
        <pattern
            id="default-pattern-dots"
            x="0"
            y="0"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
        >
            <circle
                className="text-gray-200"
                cx="1"
                cy="1"
                r="1"
                fill="currentColor"
            />
        </pattern>
    );
};
