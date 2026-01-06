import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Filter, Search, MoreHorizontal } from "lucide-react";
import CurrencyRupeeIcon from "@/components/ui/icons/currency-rupee-icon";
import { Breadcrumbs } from "./Breadcrumbs";
import { useExpenses } from "@/context/ExpenseContext";
import { format } from "date-fns";

export function AllExpenses({ userName }: { userName: string }) {
    const { expenses, groups } = useExpenses();
    const [searchQuery, setSearchQuery] = useState("");

    const filteredExpenses = useMemo(() => {
        return expenses.filter(e =>
            e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.paidBy.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [expenses, searchQuery]);

    const getGroupName = (groupId?: string) => {
        if (!groupId) return "Non-group";
        const group = groups.find(g => g.id === groupId);
        return group ? group.name : "Unknown Group";
    };

    return (
        <div className="flex-1 flex flex-col p-8 w-full overflow-hidden">
            <div className="px-2 py-6 border-b border-gray-100 w-full mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <Breadcrumbs userName={userName} currentPage="ALL EXPENSES" />
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            placeholder="SEARCH EXPENSES..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-gray-100 border border-gray-200 rounded-full pl-10 pr-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-900 focus:bg-white focus:border-gray-300 outline-none w-full transition-all placeholder:text-gray-400"
                        />
                    </div>
                    <button className="bg-gray-100 p-2.5 rounded-xl border border-gray-200 hover:bg-white hover:border-gray-300 transition-all text-gray-400 shrink-0">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar rounded-[2rem] border border-gray-100 bg-white">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-gray-50 z-10 border-b border-gray-100">
                        <tr>
                            <th className="p-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Date</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Description</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Group</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Amount</th>
                            <th className="p-6"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredExpenses.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-20 text-center">
                                    <p className="text-gray-300 font-black uppercase tracking-[0.5em] italic text-xs">No expenses found</p>
                                </td>
                            </tr>
                        ) : (
                            filteredExpenses.map((expense, i) => (
                                <motion.tr
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: Math.min(i * 0.03, 1) }}
                                    key={expense.id}
                                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors group"
                                >
                                    <td className="p-6">
                                        <div className="flex flex-col">
                                            <span className="text-gray-900 font-black italic text-sm">{format(new Date(expense.date), "MMM dd")}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-col">
                                            <span className="text-gray-900 font-black uppercase italic text-sm group-hover:text-[#32dd9e] transition-colors">{expense.description}</span>
                                            <span className="text-gray-400 text-[9px] font-bold uppercase tracking-widest">Paid by {expense.paidBy}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className="bg-gray-100 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-500 border border-gray-200">
                                            {getGroupName(expense.groupId)}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <span className="text-lg font-black italic tracking-tighter text-gray-900 flex items-center gap-0.5">
                                            <CurrencyRupeeIcon size={14} className="text-gray-900" />
                                            {expense.amount.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <button className="text-gray-300 hover:text-gray-600 transition-colors">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
