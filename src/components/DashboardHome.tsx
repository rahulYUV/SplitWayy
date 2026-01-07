import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, LayoutList, PieChart as PieChartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import CurrencyRupeeIcon from "@/components/ui/icons/currency-rupee-icon";
import { Breadcrumbs } from "./Breadcrumbs";
import { useExpenses } from "@/context/ExpenseContext";
import { cn } from "@/lib/utils";
import { AddExpenseModal } from "@/components/AddExpenseModal";

import { FooterSection } from "./FooterSection";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SettleUpModal } from "@/components/SettleUpModal";

interface DashboardHomeProps {
    userName: string;
}

export function DashboardHome({ userName }: DashboardHomeProps) {
    const [viewMode, setViewMode] = useState<'list' | 'chart'>('list');
    const [isSelectionOpen, setIsSelectionOpen] = useState(false);
    const [settleMember, setSettleMember] = useState<{ name: string, balance: number } | null>(null);
    const { expenses, friends, getFriendBalance } = useExpenses();

    // Calculate dynamic data
    const { owedData, oweData, totalOwed, totalOwe } = useMemo(() => {
        const owed: any[] = [];
        const owe: any[] = [];
        let totalOwedVal = 0;
        let totalOweVal = 0;

        // Colors for the chart
        const OWE_COLORS = ["#ff6d2f", "#ff8552", "#9c3d14"];
        const OWED_COLORS = ["#32dd9e", "#45e6a9", "#5ef9bf"];

        // Get unique names (case-insensitive)
        const namesInExpenses = expenses.flatMap(e => e.participants).map(n => n.trim());
        const friendNames = friends.map(f => f.displayName.trim());

        // Deduplicate by lowercase name
        const uniqueNamesMap = new Map<string, string>();
        [...friendNames, ...namesInExpenses].forEach(name => {
            const lowerName = name.toLowerCase();
            if (!uniqueNamesMap.has(lowerName)) {
                uniqueNamesMap.set(lowerName, name);
            }
        });

        const allUniqueNames = Array.from(uniqueNamesMap.values());

        allUniqueNames.forEach((name) => {
            const balance = getFriendBalance(name);
            if (balance > 0.5) { // Ignore tiny amounts
                owed.push({
                    name: name,
                    amount: balance,
                    color: OWED_COLORS[owed.length % OWED_COLORS.length]
                });
                totalOwedVal += balance;
            } else if (balance < -0.5) {
                owe.push({
                    name: name,
                    amount: Math.abs(balance),
                    color: OWE_COLORS[owe.length % OWE_COLORS.length]
                });
                totalOweVal += Math.abs(balance);
            }
        });

        return {
            owedData: owed,
            oweData: owe,
            totalOwed: totalOwedVal,
            totalOwe: totalOweVal
        };
    }, [expenses, friends, getFriendBalance]);

    const totalBalance = totalOwed - totalOwe;

    const chartData = useMemo(() => [
        ...owedData.map(d => ({ name: d.name, value: d.amount, type: 'receivable', color: d.color })),
        ...oweData.map(d => ({ name: d.name, value: d.amount, type: 'payable', color: d.color }))
    ], [owedData, oweData]);

    return (
        <div className="flex-1 flex flex-col min-h-0 min-w-0 font-sans w-full">
            {/* 1. Dashboard Header - Breadcrumbs */}
            <div className="px-10 py-6 border-b border-white/10 w-full overflow-hidden">
                <Breadcrumbs userName={userName} />
            </div>

            {/* 2. Summary Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 bg-white border-b border-gray-100 w-full shadow-sm">
                <div className="flex flex-col items-center justify-center py-6 border-b md:border-b-0 md:border-r border-gray-100">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 mb-1">total balance</span>
                    <span className={cn(
                        "text-2xl font-black tracking-tight flex items-center gap-1",
                        totalBalance >= 0 ? "text-[#32dd9e]" : "text-red-400"
                    )}>
                        {totalBalance >= 0 ? "+" : "-"} <CurrencyRupeeIcon size={20} color={totalBalance >= 0 ? "#32dd9e" : "#f87171"} className="translate-y-[-1px]" />
                        {Math.abs(totalBalance).toLocaleString()}
                    </span>
                </div>
                <div className="flex flex-col items-center justify-center py-6 border-b md:border-b-0 md:border-r border-gray-100">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 mb-1">you owe</span>
                    <span className="text-2xl font-black text-[#ff6d2f] tracking-tight flex items-center gap-1">
                        <CurrencyRupeeIcon size={20} color="#ff6d2f" className="translate-y-[-1px]" />
                        {totalOwe.toLocaleString()}
                    </span>
                </div>
                <div className="flex flex-col items-center justify-center py-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 mb-1">you are owed</span>
                    <span className="text-2xl font-black text-[#32dd9e] tracking-tight flex items-center gap-1">
                        <CurrencyRupeeIcon size={20} color="#32dd9e" className="translate-y-[-1px]" />
                        {totalOwed.toLocaleString()}
                    </span>
                </div>
            </div>

            {/* 3. PRIMARY ACTION SECTION */}
            <div className="py-8 flex flex-col items-center justify-center gap-8 border-b border-white/5 bg-white/5 w-full">
                <div className="flex flex-wrap items-center justify-center gap-6">
                    <AddExpenseModal userName={userName}>
                        <Button className="bg-[#ff6d2f] hover:bg-[#ff8552] text-white font-black uppercase italic px-8 py-7 rounded-2xl shadow-[0_12px_0_#9c3d14] active:shadow-none active:translate-y-[12px] transition-all border-4 border-white/10 flex items-center gap-4 text-lg group">
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                            Add an expense
                        </Button>
                    </AddExpenseModal>
                    <Button
                        onClick={() => setIsSelectionOpen(true)}
                        className="bg-[#32dd9e] hover:bg-[#45e6a9] text-white font-black uppercase italic px-8 py-7 rounded-2xl shadow-[0_12px_0_#1a8c63] active:shadow-none active:translate-y-[12px] transition-all border-4 border-white/10 flex items-center gap-4 text-lg group">
                        <Check className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Settle up
                    </Button>
                </div>
            </div>

            {/* 4. MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col pt-8 relative w-full">
                {/* Column Headers & Toggle */}
                <div className="flex items-center justify-between px-12 pb-8">
                    <div className="font-black text-black/20 uppercase italic tracking-[0.3em] text-[10px]">YOU OWE</div>

                    <div className="flex items-center bg-gray-100 rounded-xl p-1 border border-gray-200 shadow-inner">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-[10px] font-black uppercase tracking-widest ${viewMode === 'list'
                                ? 'bg-white text-[#ff6d2f] shadow-md ring-2 ring-[#ff6d2f]/10'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <LayoutList className="w-3 h-3" />
                            list
                        </button>
                        <button
                            onClick={() => setViewMode('chart')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-[10px] font-black uppercase tracking-widest ${viewMode === 'chart'
                                ? 'bg-white text-[#32dd9e] shadow-md ring-2 ring-[#32dd9e]/10'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <PieChartIcon className="w-3 h-3" />
                            chart
                        </button>
                    </div>

                    <div className="font-black text-black/20 uppercase italic tracking-[0.3em] text-[10px]">YOU ARE OWED</div>
                </div>

                <AnimatePresence mode="wait">
                    {viewMode === 'list' ? (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            className="grid grid-cols-1 md:grid-cols-2 flex-1 px-4 md:px-8 relative pb-20 overflow-y-auto"
                        >
                            {/* Left: You Owe */}
                            <div className="px-4 flex flex-col items-start justify-start gap-4">
                                {oweData.length === 0 ? (
                                    <div className="text-white/10 font-black italic uppercase text-xs mt-10">You don't owe anything</div>
                                ) : (
                                    oweData.map((person, i) => (
                                        <motion.div
                                            key={i}
                                            className="bg-[#ff6d2f] text-white px-6 py-5 rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.3)] w-full max-w-[260px] flex items-center justify-between border-b-8 border-black/20"
                                        >
                                            <div className="flex flex-col text-left">
                                                <span className="font-black uppercase italic tracking-tighter text-xl">{person.name}</span>
                                                <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest leading-none">you owe</span>
                                            </div>
                                            <span className="text-xl font-black tracking-tighter italic flex items-center gap-0.5"><CurrencyRupeeIcon size={16} color="white" />{person.amount.toLocaleString()}</span>
                                        </motion.div>
                                    ))
                                )}
                            </div>

                            {/* Right: You Are Owed */}
                            <div className="px-4 flex flex-col items-end justify-start gap-4">
                                {owedData.length === 0 ? (
                                    <div className="text-white/10 font-black italic uppercase text-xs mt-10">Nobody owes you</div>
                                ) : (
                                    owedData.map((person, i) => (
                                        <motion.div
                                            key={i}
                                            className="bg-[#32dd9e] text-white px-6 py-4 rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.3)] w-full max-w-[260px] flex items-center justify-between border-b-8 border-black/20 focus-within:scale-[1.02] transition-transform"
                                        >
                                            <div className="flex flex-col text-left min-w-0 pr-2">
                                                <span className="font-black uppercase italic tracking-tighter text-lg leading-tight break-all">{person.name}</span>
                                                <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest">owes you</span>
                                            </div>
                                            <span className="text-xl font-black tracking-tighter italic flex items-center gap-0.5"><CurrencyRupeeIcon size={16} color="white" />{person.amount.toLocaleString()}</span>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="chart"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex-1 flex flex-col items-center justify-center p-8 min-h-[400px] pb-20"
                        >
                            {chartData.length === 0 ? (
                                <div className="text-white/20 font-black italic uppercase">No data to display in chart</div>
                            ) : (
                                <div className="w-full h-full max-w-2xl relative">
                                    <div className="absolute inset-0 bg-white/5 rounded-[2rem] border border-white/10 shadow-inner" />
                                    <div className="relative z-10 w-full h-full p-8 flex flex-col items-center">
                                        <div className="h-[280px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={chartData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={90}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                        stroke="none"
                                                    >
                                                        {chartData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <RechartsTooltip
                                                        contentStyle={{ backgroundColor: 'black', border: 'none', borderRadius: '12px', color: 'white' }}
                                                        itemStyle={{ color: 'white' }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="flex gap-20 mt-8">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[9px] font-black uppercase text-white/30 tracking-widest">Receivable</span>
                                                <span className="text-xl font-black text-[#32dd9e] flex items-center gap-0.5"><CurrencyRupeeIcon size={16} color="#32dd9e" />{totalOwed.toLocaleString()}</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-[9px] font-black uppercase text-white/30 tracking-widest">Payable</span>
                                                <span className="text-xl font-black text-[#ff6d2f] flex items-center gap-0.5"><CurrencyRupeeIcon size={16} color="#ff6d2f" />{totalOwe.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Settle Up Selection Dialog */}
            <Dialog open={isSelectionOpen} onOpenChange={setIsSelectionOpen}>
                <DialogContent className="bg-white rounded-3xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">Who to settle with?</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 mt-4 max-h-[60vh] overflow-y-auto">
                        {/* Combine owe and owed data for selection */}
                        {[...oweData, ...owedData].map((person) => (
                            <div key={person.name} className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <div className="flex flex-col">
                                    <span className="font-bold text-gray-900">{person.name}</span>
                                    <span className={cn("text-[10px] font-black uppercase tracking-widest", person.amount > 0 ? "text-[#32dd9e]" : "text-[#ff6d2f]")}>
                                        {oweData.some(o => o.name === person.name) ? "you owe" : "owes you"} ₹{person.amount.toLocaleString()}
                                    </span>
                                </div>
                                <Button
                                    onClick={() => {
                                        // Determine balance sign: if in oweData, I owe them (negative balance from my perspective). 
                                        // Wait, modal expects: Positive = I am owed. Negative = I owe.
                                        // oweData amounts are absolute. So if in oweData, balance should be -amount.
                                        // owedData amounts are absolute. So if in owedData, balance should be +amount.
                                        const isOwe = oweData.some(o => o.name === person.name);
                                        const realBalance = isOwe ? -person.amount : person.amount;

                                        setSettleMember({ name: person.name, balance: realBalance });
                                        setIsSelectionOpen(false);
                                    }}
                                    size="sm"
                                    className="bg-black text-white rounded-xl font-bold uppercase tracking-wider text-xs"
                                >
                                    Settle
                                </Button>
                            </div>
                        ))}
                        {[...oweData, ...owedData].length === 0 && (
                            <div className="text-center py-10 text-gray-400 font-bold uppercase tracking-widest text-xs">
                                No outstanding balances
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {settleMember && (
                <SettleUpModal
                    isOpen={!!settleMember}
                    onClose={() => setSettleMember(null)}
                    friendName={settleMember.name}
                    balance={settleMember.balance}
                    userName={userName}
                />
            )}

            <div className="flex flex-col items-center justify-center gap-2 opacity-30 hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black">SplitWayy © 2026</span>
                <span className="text-[9px] font-bold text-black/60 italic">Fairness System V2.0</span>
            </div>
        </div>
    );
}
