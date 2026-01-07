"use client"

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
// import { Expense } from "@/context/ExpenseContext";
import { format, subMonths, isSameMonth } from "date-fns";

import { motion } from "framer-motion";



export function AnalyticsView({ expenses }: { expenses: any[] }) {
    // 1. Calculate Monthly Spending Trend (Last 6 Months)
    const trendData = useMemo(() => {
        const last6Months = Array.from({ length: 6 }, (_, i) => {
            const d = subMonths(new Date(), 5 - i);
            return {
                date: d,
                name: format(d, 'MMM'),
                amount: 0
            };
        });

        expenses.forEach(e => {
            if (e.category === 'Payment') return; // Exclude settlements

            // Spending Calculation:
            // If splitMethod is 'equally', MyShare = Amount / Participants.length
            // If 'percentage', MyShare = Amount * (Split['You']/100)
            // If 'exact', MyShare = Split['You']

            const expenseDate = new Date(e.date);
            const monthData = last6Months.find(m => isSameMonth(m.date, expenseDate));

            if (monthData) {
                let myShare = 0;

                // Usually participants array excludes 'You' in my implementation, 
                // so total people = participants.length + 1
                const totalPeople = (e.participants?.length || 0) + 1;

                if (e.splitMethod === 'equally') {
                    // Assuming I am always involved if I see it
                    myShare = e.amount / totalPeople;
                } else if (e.splitMethod === 'percentage') {
                    const myPercent = Number(e.splitDetails?.['You'] || 0);
                    myShare = (e.amount * myPercent) / 100;
                } else if (e.splitMethod === 'exact') {
                    myShare = Number(e.splitDetails?.['You'] || 0);
                }

                monthData.amount += myShare;
            }
        });

        return last6Months.map(d => ({ ...d, amount: Math.round(d.amount) }));
    }, [expenses]);

    // 2. Calculate Category Breakdown
    const categoryData = useMemo(() => {
        const categories: Record<string, number> = {};

        expenses.forEach(e => {
            if (e.category === 'Payment') return;

            const cat = e.category || 'Other';

            let myShare = 0;
            const totalPeople = (e.participants?.length || 0) + 1;

            if (e.splitMethod === 'equally') {
                myShare = e.amount / totalPeople;
            } else if (e.splitMethod === 'percentage') {
                const myPercent = Number(e.splitDetails?.['You'] || 0);
                myShare = (e.amount * myPercent) / 100;
            } else if (e.splitMethod === 'exact') {
                myShare = Number(e.splitDetails?.['You'] || 0);
            }

            categories[cat] = (categories[cat] || 0) + myShare;
        });

        const COLORS = ['#32dd9e', '#ff6d2f', '#3395ff', '#ffb02e', '#e645e6', '#9ea7b0'];

        return Object.entries(categories)
            .map(([name, value], index) => ({
                name,
                value: Math.round(value),
                color: COLORS[index % COLORS.length]
            }))
            .filter(i => i.value > 0)
            .sort((a, b) => b.value - a.value);
    }, [expenses]);

    const totalSpending = categoryData.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-start p-6 md:p-8 gap-8 w-full pb-20 overflow-y-auto"
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl">

                {/* 1. Spending Trends Chart */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-[400px]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-[#32dd9e] flex items-center gap-2">
                            Spending Trends <span className="text-[10px] text-gray-300 bg-gray-50 px-2 py-1 rounded-lg">6M</span>
                        </h3>
                    </div>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#32dd9e" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#32dd9e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#aaa', fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#aaa', fontWeight: 600 }}
                                    tickFormatter={(val) => `₹${val}`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'black', borderRadius: '12px', border: 'none', color: 'white' }}
                                    itemStyle={{ color: '#32dd9e', fontWeight: 'bold' }}
                                    formatter={(value: any) => [`₹${value}`, 'Spending']}
                                    cursor={{ stroke: '#32dd9e', strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#32dd9e"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorAmount)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Category Breakdown Pie Chart */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-[400px]">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-black uppercase tracking-widest text-[#ff6d2f] flex items-center gap-2">
                            Spending by Category
                        </h3>
                        <span className="text-xs font-black text-gray-900 bg-gray-50 px-3 py-1 rounded-full">Total: ₹{totalSpending.toLocaleString()}</span>
                    </div>
                    {categoryData.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-gray-300 text-xs font-bold uppercase tracking-widest italic">
                            No spending data yet
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center">
                            <div className="h-[220px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'black', borderRadius: '12px', border: 'none', color: 'white' }}
                                            //@ts-ignore
                                            itemStyle={{ color: 'white' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Legend */}
                            <div className="w-full grid grid-cols-2 gap-3 mt-auto pt-4 overflow-y-auto max-h-[100px] custom-scrollbar">
                                {categoryData.map(cat => (
                                    <div key={cat.name} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">{cat.name}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-gray-900">₹{cat.value.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </motion.div>
    );
}
