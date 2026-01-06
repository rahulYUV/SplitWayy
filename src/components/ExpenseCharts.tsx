"use client";

import { CartesianGrid, Line, LineChart, XAxis, Area, AreaChart } from "recharts";
import { Pie, PieChart, Cell } from "recharts";
import { TrendingDown, TrendingUp, Users, Wallet, Receipt, ArrowUpRight, ShoppingBag, Coffee, Plane, Home, ArrowDownLeft } from "lucide-react";
import { useRef, useState } from "react";
import { motion, useSpring, useMotionValueEvent } from "framer-motion";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// --- Line Chart: Monthly Spending Trends ---
const lineData = [
    { month: "Jan", group: 1860, personal: 510 },
    { month: "Feb", group: 3050, personal: 930 },
    { month: "Mar", group: 2370, personal: 720 },
    { month: "Apr", group: 1730, personal: 650 },
    { month: "May", group: 2090, personal: 810 },
    { month: "Jun", group: 1140, personal: 740 },
];

const lineConfig = {
    group: { label: "Group Total", color: "#2dd4bf" },
    personal: { label: "My Share", color: "#7c3aed" },
} satisfies ChartConfig;

export function DottedMultiLineChart() {
    return (
        <Card className="bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col h-full">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-2xl font-black text-black flex items-center gap-2">
                            <Receipt className="w-6 h-6 text-teal-500" />
                            Spending Flow
                        </CardTitle>
                        <CardDescription className="text-gray-500 font-medium">Monthly cashflow analysis</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-red-500 bg-red-500/10 border-none px-3 py-1">
                        <TrendingDown className="h-4 w-4 mr-1" />
                        <span>5.2%</span>
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                <ChartContainer config={lineConfig} className="h-[220px] w-full">
                    <LineChart data={lineData} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={12}
                            tick={{ fill: "#9ca3af", fontSize: 12, fontWeight: 600 }}
                        />
                        <ChartTooltip cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }} content={<ChartTooltipContent />} />
                        <Line
                            dataKey="group"
                            type="monotone"
                            stroke="#2dd4bf"
                            strokeWidth={3}
                            dot={false}
                            strokeDasharray="6 6"
                        />
                        <Line
                            dataKey="personal"
                            type="monotone"
                            stroke="#7c3aed"
                            strokeWidth={4}
                            dot={{ r: 6, fill: "#7c3aed", strokeWidth: 0 }}
                            activeDot={{ r: 8, strokeWidth: 0 }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="bg-gray-50/50 border-t border-gray-100 p-6 grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Group</span>
                    <span className="text-lg font-black text-black">$12,240</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Share</span>
                    <span className="text-lg font-black text-purple-600">$4,360</span>
                </div>
            </CardFooter>
        </Card>
    );
}

// --- Pie Chart: Sharing Summary & Balances ---
const pieData = [
    { friend: "Rahul", amount: 450, color: "#7c3aed" },
    { friend: "Ishan", amount: 320, color: "#2dd4bf" },
    { friend: "Amit", amount: 280, color: "#f59e0b" },
    { friend: "Priya", amount: 190, color: "#ef4444" },
    { friend: "John", amount: 120, color: "#3b82f6" },
];

const pieConfig = {
    amount: { label: "Paid" },
    Rahul: { color: "#7c3aed" },
    Ishan: { color: "#2dd4bf" },
    Amit: { color: "#f59e0b" },
    Priya: { color: "#ef4444" },
    John: { color: "#3b82f6" },
} satisfies ChartConfig;

export function RoundedPieChart() {
    return (
        <Card className="flex flex-col bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl rounded-[2.5rem] overflow-hidden h-full">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-2xl font-black text-black flex items-center gap-2">
                            <Users className="w-6 h-6 text-purple-500" />
                            Who Paid?
                        </CardTitle>
                        <CardDescription className="text-gray-500 font-medium">Payment distribution per friend</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-green-500 bg-green-500/10 border-none px-3 py-1">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>12.5%</span>
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-1 pb-2">
                <div className="flex items-center justify-between">
                    <ChartContainer config={pieConfig} className="aspect-square w-[220px]">
                        <PieChart>
                            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                            <Pie
                                data={pieData}
                                innerRadius={60}
                                outerRadius={90}
                                dataKey="amount"
                                nameKey="friend"
                                strokeWidth={4}
                                stroke="#ffffff"
                                cornerRadius={8}
                                paddingAngle={5}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ChartContainer>

                    <div className="flex flex-col gap-3 pr-4">
                        {pieData.slice(0, 3).map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-sm font-bold text-black">{item.friend}</span>
                                <span className="text-xs font-bold text-gray-400">${item.amount}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="bg-purple-600 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                        <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-purple-200 uppercase tracking-widest">Active Balance</p>
                        <p className="text-lg font-black text-white">$1,240.50</p>
                    </div>
                </div>
                <button className="px-4 py-2 bg-white text-purple-600 rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-transform">
                    Settle Up
                </button>
            </CardFooter>
        </Card>
    );
}

// --- New Feature: Interactive Clipped Area Chart & History ---
// Math: Correcting yearly expenses over 12 months with Credit/Debit awareness
const areaData = [
    { month: "Jan", debit: 450, amount: 450 },
    { month: "Feb", debit: 680, amount: 680 },
    { month: "Mar", debit: 520, amount: 520 },
    { month: "Apr", debit: 840, amount: 840 },
    { month: "May", debit: 610, amount: 610 },
    { month: "Jun", debit: 920, amount: 920 },
    { month: "Jul", debit: 740, amount: 740 },
    { month: "Aug", debit: 810, amount: 810 },
    { month: "Sep", debit: 650, amount: 650 },
    { month: "Oct", debit: 890, amount: 890 },
    { month: "Nov", debit: 720, amount: 720 },
    { month: "Dec", debit: 950, amount: 950 },
];

const areaConfig = {
    amount: { label: "Expense", color: "#f97316" },
} satisfies ChartConfig;

export function ClippedAreaChart() {
    const chartRef = useRef<HTMLDivElement>(null);
    const [axis, setAxis] = useState(0);
    const [currentValue, setCurrentValue] = useState(areaData[areaData.length - 1].amount);
    const [currentMonth, setCurrentMonth] = useState(areaData[areaData.length - 1].month);

    const springX = useSpring(0, { damping: 30, stiffness: 100 });
    const springY = useSpring(currentValue, { damping: 30, stiffness: 100 });

    useMotionValueEvent(springX, "change", (latest) => setAxis(latest));
    useMotionValueEvent(springY, "change", (latest) => setCurrentValue(latest));

    // Refined Transaction List with Credits (+) and Debits (-)
    const transactions = [
        { date: "24 Oct", category: "Dining", icon: <Coffee className="w-4 h-4" />, amount: 42.50, type: "debit", color: "bg-orange-100 text-orange-600" },
        { date: "22 Oct", category: "Flights", icon: <Plane className="w-4 h-4" />, amount: 450.00, type: "debit", color: "bg-blue-100 text-blue-600" },
        { date: "20 Oct", category: "Refund", icon: <ArrowDownLeft className="w-4 h-4" />, amount: 120.00, type: "credit", color: "bg-green-100 text-green-600" },
        { date: "15 Oct", category: "Rent", icon: <Home className="w-4 h-4" />, amount: 1200.00, type: "debit", color: "bg-purple-100 text-purple-600" },
        { date: "12 Oct", category: "Return", icon: <ArrowDownLeft className="w-4 h-4" />, amount: 85.50, type: "credit", color: "bg-emerald-100 text-emerald-600" },
        { date: "10 Oct", category: "Shopping", icon: <ShoppingBag className="w-4 h-4" />, amount: 185.20, type: "debit", color: "bg-teal-100 text-teal-600" },
    ];



    return (
        <Card className="bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl rounded-[2.5rem] overflow-hidden lg:col-span-2">
            <div className="grid grid-cols-1 lg:grid-cols-3">
                <div className="lg:col-span-2 p-5 md:p-8 border-b lg:border-b-0 lg:border-r border-gray-100">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <div className="flex items-baseline gap-2">
                                <CardTitle className="text-3xl font-black text-black">
                                    ${currentValue.toFixed(0)}
                                </CardTitle>
                                <span className="text-sm font-black text-orange-500 uppercase tracking-widest">{currentMonth}</span>
                            </div>
                            <CardDescription className="text-gray-500 font-bold">My total expenses</CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <Badge variant="secondary" className="bg-orange-100 text-orange-600 border-none font-bold">
                                <TrendingUp className="h-4 w-4 mr-1" />
                                <span>14.2%</span>
                            </Badge>
                        </div>
                    </div>

                    <ChartContainer ref={chartRef} className="h-64 w-full overflow-visible" config={areaConfig}>
                        <AreaChart
                            data={areaData}
                            onMouseMove={(state) => {
                                const x = state.activeCoordinate?.x;
                                const val = state.activePayload?.[0]?.value as number;
                                const month = state.activePayload?.[0]?.payload?.month;
                                if (x && val !== undefined) {
                                    springX.set(x);
                                    springY.set(val);
                                    if (month) setCurrentMonth(month);
                                }
                            }}
                            onMouseLeave={() => {
                                springX.set(chartRef.current?.getBoundingClientRect().width || 0);
                                springY.set(areaData[areaData.length - 1].amount);
                                setCurrentMonth(areaData[areaData.length - 1].month);
                            }}
                            margin={{ left: 0, right: 0, top: 20, bottom: 20 }}
                        >
                            <defs>
                                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={12}
                                tick={{ fill: "#9ca3af", fontSize: 11, fontWeight: 700 }}
                            />
                            <Area
                                dataKey="amount"
                                type="monotone"
                                stroke="#f97316"
                                strokeWidth={3}
                                fill="url(#areaGradient)"
                                clipPath={`inset(0 ${Number(chartRef.current?.getBoundingClientRect().width || 0) - axis}px 0 0)`}
                            />
                            {/* Ghost line */}
                            <Area dataKey="amount" type="monotone" stroke="#f97316" strokeOpacity={0.1} fill="none" />

                            {/* Cursor */}
                            <line x1={axis} y1={0} x2={axis} y2="100%" stroke="#f97316" strokeDasharray="4 4" strokeOpacity={0.5} />
                            <circle cx={axis} cy={0} r={4} fill="#f97316" />
                        </AreaChart>
                    </ChartContainer>
                </div>

                <div className="p-5 md:p-8 bg-gray-50/50">
                    <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Recent Activities</h4>
                    <div className="space-y-6">
                        {transactions.map((tx, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn("p-2.5 rounded-xl", tx.color)}>
                                        {tx.icon}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-black">{tx.category}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">{tx.date}</p>
                                    </div>
                                </div>
                                <p className={cn("text-sm font-black", tx.type === "credit" ? "text-green-600" : "text-black")}>
                                    {tx.type === "credit" ? "+" : "-"}${tx.amount.toFixed(2)}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
}

// --- Simplified Debts / Settlements ---
export function SettlementDetails() {
    // Current logical group state (Total: $2690, 5 people at $538/each)
    const transactions = [
        { by: "Rahul", item: "Flight Tickets", amount: 1250, color: "text-purple-500" },
        { by: "Ishan", item: "Property Rent", amount: 840, color: "text-teal-500" },
        { by: "John", item: "Group Dinner", amount: 420, color: "text-orange-500" },
        { by: "Amit", item: "Cab Services", amount: 180, color: "text-blue-500" },
    ];

    const settlements = [
        { from: "Priya", to: "Rahul", amount: 538.00, desc: "Full Trip Balance" },
        { from: "Amit", to: "Rahul", amount: 174.00, desc: "Flight Ticket Share" },
        { from: "Amit", to: "Ishan", amount: 184.00, desc: "Rent Adjustment" },
        { from: "John", to: "Ishan", amount: 118.00, desc: "Dinner & Rent Balance" },
    ];

    const balances = [
        { name: "Rahul", paid: 1250, status: "get", amount: 712, color: "bg-purple-500" },
        { name: "Ishan", paid: 840, status: "get", amount: 302, color: "bg-teal-500" },
        { name: "John", paid: 420, status: "pay", amount: 118, color: "bg-orange-500" },
        { name: "Amit", paid: 180, status: "pay", amount: 358, color: "bg-blue-500" },
        { name: "Priya", paid: 0, status: "pay", amount: 538, color: "bg-red-500" },
    ];

    return (
        <Card className="bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl rounded-[2.5rem] overflow-hidden lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-4">
                {/* Total Stats Panel */}
                <div className="p-5 md:p-8 border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/50">
                    <h4 className="text-xs md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Group Trip Expense</h4>
                    <div className="space-y-8">
                        <div>
                            <p className="text-sm font-bold text-gray-500 mb-1">Total Spilled</p>
                            <p className="text-4xl font-black text-black tracking-tight">$2,690.00</p>
                        </div>
                        <div className="pt-4 border-t border-gray-200">
                            <h5 className="text-xs md:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Booking History</h5>
                            <div className="space-y-3">
                                {transactions.map((t, i) => (
                                    <div key={i} className="flex flex-col gap-0.5">
                                        <div className="flex justify-between items-center text-sm md:text-[11px] font-bold">
                                            <span className="text-black">{t.by}</span>
                                            <span className="text-black">${t.amount}</span>
                                        </div>
                                        <span className="text-xs md:text-[9px] font-bold text-gray-400 uppercase tracking-tight">{t.item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Return Summary / Who owes who */}
                <div className="col-span-1 md:col-span-3 p-5 md:p-8">
                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Summary List */}
                        <div className="flex-1">
                            <h4 className="text-xs md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Final Settlements</h4>
                            <div className="space-y-5">
                                {settlements.map((s, i) => (
                                    <div key={i} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-black text-gray-400 text-xs">
                                                    {s.from[0]}
                                                </div>
                                                <div className="absolute -right-1 -bottom-1 w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center">
                                                    <ArrowUpRight className="w-3 h-3 text-teal-500" />
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-black">
                                                    {s.from} <span className="text-gray-400 mx-1 font-bold">pays</span> {s.to}
                                                </p>
                                                <p className="text-xs md:text-[10px] font-bold text-gray-400 uppercase tracking-wider">{s.desc}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-black">${s.amount.toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Give vs Get Balance */}
                        <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-gray-100 pt-8 lg:pt-0 lg:pl-10">
                            <h4 className="text-xs md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Balances</h4>
                            <div className="space-y-6">
                                {balances.map((p, i) => (
                                    <div key={i} className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-xs font-black text-black">{p.name}</p>
                                                <p className="text-xs md:text-[9px] font-bold text-gray-400 uppercase">Paid ${p.paid}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className={cn(
                                                    "text-sm font-black",
                                                    p.status === "get" ? "text-green-600" : "text-red-500"
                                                )}>
                                                    {p.status === "get" ? `+ $${p.amount}` : `- $${p.amount}`}
                                                </p>
                                                <p className="text-[10px] md:text-[8px] font-black uppercase text-gray-300">
                                                    {p.status === "get" ? "to get back" : "to pay total"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${(p.paid / 1500) * 100}%` }}
                                                transition={{ duration: 1, delay: i * 0.1 }}
                                                className={cn("h-full rounded-full", p.color)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
